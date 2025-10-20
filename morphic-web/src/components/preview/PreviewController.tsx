import { useEffect, useRef } from 'react'
import { PreviewRuntimeManager } from '../../services/preview/runtimeManager'
import { detectDependencies } from '../../services/preview/dependencyDetector'
import { useGenerationStore, type StorePreviewStatus } from '../../stores/generationStore'

interface PreviewControllerProps {
  cdnDependencies?: string[]
}

export function PreviewController({ cdnDependencies }: PreviewControllerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const runtimeRef = useRef<PreviewRuntimeManager | null>(null)
  const { previewPayload, previewStatus, setPreviewStatus } = useGenerationStore((state) => ({
    previewPayload: state.previewPayload,
    previewStatus: state.previewStatus,
    setPreviewStatus: state.setPreviewStatus,
  }))

  useEffect(() => {
    if (!iframeRef.current) {
      return
    }
    runtimeRef.current = new PreviewRuntimeManager({
      iframe: iframeRef.current,
      cdnDependencies,
      onStatus: (status) => setPreviewStatus(status),
    })
    return () => {
      runtimeRef.current = null
    }
  }, [cdnDependencies, setPreviewStatus])

  useEffect(() => {
    if (runtimeRef.current) {
      const detected = previewPayload ? detectDependencies(previewPayload.code) : []
      const merged = Array.from(new Set([...(cdnDependencies ?? []), ...detected]))
      runtimeRef.current.updateDependencies(merged)
    }
  }, [cdnDependencies, previewPayload])

  useEffect(() => {
    if (!runtimeRef.current || !previewPayload) {
      return
    }
    runtimeRef.current
      .render(previewPayload.code)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error)
        setPreviewStatus({ state: 'error', message, errors: [message] })
      })
  }, [previewPayload, setPreviewStatus])

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.data === null) {
        return
      }
      if (event.data.source !== 'morphic-preview') {
        return
      }
      if (event.data.type === 'rendered') {
        setPreviewStatus({ state: 'rendered', message: 'Preview rendered successfully.' })
      }
      if (event.data.type === 'error') {
        const message = typeof event.data.message === 'string' ? event.data.message : 'Preview error'
        setPreviewStatus({ state: 'error', message, errors: [message] })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [setPreviewStatus])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_25px_rgba(59,130,246,0.2)]">
      <iframe
        ref={iframeRef}
        title="Morphic Preview"
        className="h-full w-full"
        sandbox="allow-scripts allow-same-origin"
        aria-live="polite"
      />
      <PreviewStatusBanner status={previewStatus} />
    </div>
  )
}

interface PreviewStatusBannerProps {
  status: StorePreviewStatus
}

function PreviewStatusBanner({ status }: PreviewStatusBannerProps) {
  const { state, message } = status
  if (state === 'rendered') {
    return null
  }

  const colors: Record<string, string> = {
    initializing: 'bg-cyan-500/20 border-cyan-300/40 text-cyan-100',
    loading: 'bg-violet-500/20 border-violet-300/40 text-violet-100',
    error: 'bg-rose-500/20 border-rose-300/50 text-rose-100',
    idle: 'bg-white/5 border-white/15 text-slate-200/80',
  }

  return (
    <div
      className={`pointer-events-none absolute bottom-4 left-1/2 w-[360px] max-w-[90%] -translate-x-1/2 rounded-2xl border px-4 py-2 text-center text-xs font-medium uppercase tracking-[0.28em] ${colors[state] ?? colors.idle}`}
    >
      {message ?? 'Preparing preview...'}
    </div>
  )
}
