import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { PreviewPayload } from '../../stores/generationStore'

export interface ExportOptions {
  fileName?: string
  includeManifest?: boolean
  includeEmbedSnippet?: boolean
}

export interface MorphicManifest {
  componentCode: string
  templateId?: string
  blueprintId?: string
  metadata?: Record<string, unknown>
  exportedAt: number
}

export function buildManifest(payload: PreviewPayload): MorphicManifest {
  return {
    componentCode: payload.code,
    templateId: payload.templateId,
    blueprintId: payload.blueprintId,
    metadata: payload.metadata,
    exportedAt: Date.now(),
  }
}

export function generateEmbedHTML(payload: PreviewPayload, manifest: MorphicManifest): string {
  const componentId = manifest.templateId ?? 'morphic-widget'
  return `<!-- Morphic Web Embed -->
<script type="module">
  const mount = document.getElementById('${componentId}')
  if (!mount) {
    throw new Error('Mount element not found')
  }
  ${payload.code}
  const App = exports.default
  const root = window.ReactDOM.createRoot(mount)
  root.render(window.React.createElement(App))
</script>
<div id="${componentId}"></div>
`
}

export async function createExportBundle(
  payload: PreviewPayload,
  options: ExportOptions = {},
): Promise<JSZip> {
  const zip = new JSZip()
  zip.file('component.js', payload.code)
  if (options.includeManifest !== false) {
    const manifest = buildManifest(payload)
    zip.file('manifest.json', JSON.stringify(manifest, null, 2))
    if (options.includeEmbedSnippet !== false) {
      zip.file('embed.html', generateEmbedHTML(payload, manifest))
    }
  }
  return zip
}

export class ExportManager {
  async exportPreview(payload: PreviewPayload | null, options: ExportOptions = {}): Promise<void> {
    if (!payload) {
      throw new Error('No preview payload available to export')
    }
    const fileName = options.fileName ?? `morphic-export-${payload.createdAt}`
    const zip = await createExportBundle(payload, options)
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${fileName}.zip`)
  }
}

export const exportManager = new ExportManager()
