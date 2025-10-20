import DOMPurify from 'dompurify'

export interface PreviewRuntimeConfig {
  iframe: HTMLIFrameElement
  onStatus?: (status: PreviewStatus) => void
  cdnDependencies?: string[]
}

export interface PreviewStatus {
  state: 'initializing' | 'loading' | 'rendered' | 'error'
  message?: string
  errors?: string[]
}

const DEFAULT_DEPENDENCIES = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
]

export class PreviewRuntimeManager {
  private iframe: HTMLIFrameElement
  private onStatus?: (status: PreviewStatus) => void
  private dependencies: string[]

  constructor({ iframe, onStatus, cdnDependencies }: PreviewRuntimeConfig) {
    this.iframe = iframe
    this.onStatus = onStatus
    this.dependencies = [...DEFAULT_DEPENDENCIES, ...(cdnDependencies ?? [])]
  }

  updateDependencies(deps: string[]): void {
    this.dependencies = [...DEFAULT_DEPENDENCIES, ...deps]
  }

  async render(componentCode: string): Promise<void> {
    this.report({ state: 'initializing', message: 'Preparing preview environment...' })
    const sanitized = this.sanitize(componentCode)
    const doc = this.iframe.contentDocument
    if (!doc) {
      throw new Error('Preview iframe missing document context')
    }

    doc.open()
    doc.write(this.buildHtmlShell())
    doc.close()

    await this.injectDependencies(doc)
    this.report({ state: 'loading', message: 'Injecting component...' })

    const script = doc.createElement('script')
    script.type = 'text/babel'
    script.innerHTML = this.composeRuntimeScript(sanitized)
    doc.body?.appendChild(script)

    this.report({ state: 'rendered', message: 'Preview ready.' })
  }

  private sanitize(code: string): string {
    return DOMPurify.sanitize(code, { SAFE_FOR_TEMPLATES: true })
  }

  private async injectDependencies(doc: Document): Promise<void> {
    for (const url of this.dependencies) {
      await new Promise<void>((resolve, reject) => {
        const script = doc.createElement('script')
        script.src = url
        script.async = false
        script.onload = () => resolve()
        script.onerror = () => reject(new Error(`Failed to load dependency: ${url}`))
        doc.head?.appendChild(script)
      })
    }
  }

  private composeRuntimeScript(componentCode: string): string {
    return `
      const rootEl = document.getElementById('morphic-root');
      if (!rootEl) {
        throw new Error('Missing preview root element');
      }
      const exports = {};
      try {
        ${componentCode}
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        window.parent.postMessage({ source: 'morphic-preview', type: 'error', message }, '*');
        throw error;
      }
      const Component = exports.default;
      if (!Component) {
        throw new Error('No default export found in generated code');
      }
      const root = ReactDOM.createRoot(rootEl);
      root.render(React.createElement(Component));
      window.parent.postMessage({ source: 'morphic-preview', type: 'rendered' }, '*');
    `
  }

  private buildHtmlShell(): string {
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>body { margin: 0; background: transparent; }</style>
        </head>
        <body>
          <div id="morphic-root"></div>
        </body>
      </html>`
  }

  private report(status: PreviewStatus): void {
    this.onStatus?.(status)
  }
}
