import { useEffect, useState } from 'react'
import { PromptComposer } from './components/prompts/PromptComposer'
import { PreviewController } from './components/preview/PreviewController'
import { TimelinePanel } from './components/analytics/TimelinePanel'
import { ExportPanel } from './components/export/ExportPanel'
import { AppShell, GlassPanel, SectionBadge } from './components/layout/AppShell'
import { ApiKeyModal } from './components/prompts/ApiKeyModal'
import {
  ensureMorphicKeyBridge,
  readMorphicGroqKey,
  saveMorphicGroqKey,
  type MorphicStorageScope,
} from './utils/keyStorage'
import { useGenerationStore } from './stores/generationStore'

function App() {
  const [apiKeySnapshot, setApiKeySnapshot] = useState(() => {
    ensureMorphicKeyBridge()
    return readMorphicGroqKey()
  })
  const [modalOpen, setModalOpen] = useState(apiKeySnapshot.scope === 'none')
  const { previewStatus } = useGenerationStore((state) => ({
    previewStatus: state.previewStatus,
  }))

  useEffect(() => {
    ensureMorphicKeyBridge()
  }, [])

  const handleSaveKey = (value: string, scope: MorphicStorageScope) => {
    const savedScope = saveMorphicGroqKey(value, scope)
    const snapshot = readMorphicGroqKey()
    setApiKeySnapshot(snapshot)
    setModalOpen(snapshot.scope === 'none')
    return savedScope
  }

  return (
    <AppShell>
      <ApiKeyModal
        open={modalOpen}
        snapshot={apiKeySnapshot}
        onSubmit={(value, scope) => handleSaveKey(value, scope)}
        onClose={() => setModalOpen(false)}
      />
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-semibold tracking-tight text-white shadow-aurora">
              MW
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-slate-300/80">
                Morphic Web
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-white md:text-4xl">
                Idea-to-app studio for magical builders
              </h1>
            </div>
          </div>
          <p className="max-w-3xl text-sm text-slate-200/80 md:text-base">
            Describe the experience you want. Morphic weaves a blueprint, matches proven templates, and deploys Groq-powered
            deltas that render instantly in the preview—no installs, no friction.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-5 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_25px_rgba(14,165,233,0.35)] transition hover:bg-cyan-500/30">
            Launch preview runtime
          </button>
          <button className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10">
            Need a spark?
          </button>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassPanel
          title="Prompt blueprint composer"
          description="Assemble the core intention, guardrails, and success metrics that the multi-phase pipeline will honor."
          accent="cyan"
          className="xl:col-span-2"
        >
          <SectionBadge>Prompt Lab</SectionBadge>
          <div className="mt-6">
            <PromptComposer />
          </div>
        </GlassPanel>

        <GlassPanel
          title="Real-time preview & repair"
          description="The sandboxed iframe compiles JSX via Babel Standalone, auto-injects CDN globals, and resolves issues before users notice."
          accent="violet"
        >
          <SectionBadge>Preview Sphere</SectionBadge>
          <div className="mt-6 flex h-[360px] flex-col gap-4 rounded-3xl border border-violet-200/20 bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-400/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <PreviewController />
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-200/80">
              <span>{previewStatus.message ?? 'Awaiting preview render'}</span>
              <span className="text-slate-300/70">State · {previewStatus.state}</span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="Timeline intelligence"
          description="Token spend, retries, and validation checkpoints tracked for every generation to prove reliability."
          accent="rose"
        >
          <SectionBadge>Latency Pulse</SectionBadge>
          <div className="mt-6">
            <TimelinePanel />
          </div>
        </GlassPanel>
      </div>

      <GlassPanel
        title="Export, embed & showcase"
        description="Turn your Morphic experience into a premium bundle ready for web embeds, desktop shells, or mobile wrappers."
        accent="cyan"
        className="mt-6"
      >
        <SectionBadge>Export Studio</SectionBadge>
        <ExportPanel className="mt-6" />
      </GlassPanel>
    </AppShell>
  )
}

export default App
