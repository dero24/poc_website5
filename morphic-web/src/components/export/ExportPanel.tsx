import { useState } from 'react'
import { exportManager } from '../../services/export/exportManager'
import { useGenerationStore } from '../../stores/generationStore'

interface ExportPanelProps {
  className?: string
}

export function ExportPanel({ className }: ExportPanelProps) {
  const { previewPayload, previewStatus } = useGenerationStore((state) => ({
    previewPayload: state.previewPayload,
    previewStatus: state.previewStatus,
  }))
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!previewPayload) {
      setError('Generate a preview before exporting.')
      return
    }
    setError(null)
    setIsExporting(true)
    try {
      await exportManager.exportPreview(previewPayload, {
        includeEmbedSnippet: true,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className={`flex h-full flex-col gap-4 ${className ?? ''}`}>
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-300/70">Export Suite</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Publish your Morphic experience</h3>
        </div>
        <button
          type="button"
          disabled={!previewPayload || isExporting}
          onClick={handleExport}
          className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-[0_0_25px_rgba(14,165,233,0.35)] transition hover:bg-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isExporting ? 'Preparing bundle…' : 'Download zip'}
        </button>
      </header>

      <article className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/80 shadow-[0_20px_40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/90">Web component</h4>
        <p className="mt-2 text-xs text-slate-300/80">
          Morphic wraps your React component into a standards-compliant custom element. Use the embed snippet inside any HTML page or drop the bundle into desktop/mobile shells.
        </p>
        <ul className="mt-3 space-y-2 text-xs">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" /> Stencil compilation + fallback to react-to-webcomponent
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" /> Manifest & embed HTML included in zip bundle
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" /> Ready for Tauri, Electron, or Capacitor packaging
          </li>
        </ul>
      </article>

      <article className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200/80 shadow-[0_20px_40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <h4 className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-200/90">Preview status</h4>
        <p className="mt-2 text-xs text-slate-300/80">
          {previewStatus.state === 'rendered'
            ? 'Preview rendered successfully. Export bundle reflects this state.'
            : previewStatus.message ?? 'Awaiting preview render.'}
        </p>
      </article>

      {error ? (
        <p className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100">
          {error}
        </p>
      ) : null}
    </section>
  )
}
