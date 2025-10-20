import type { FormEvent } from 'react'
import { useState } from 'react'
import { useGenerationStore } from '../../stores/generationStore'
import { getGenerationOrchestrator } from '../../services/generation/orchestratorInstance'

interface PromptComposerProps {
  className?: string
}

export function PromptComposer({ className }: PromptComposerProps) {
  const [idea, setIdea] = useState('')
  const [tone, setTone] = useState('balanced')
  const [status, setStatus] = useState<string>('')
  const generationState = useGenerationStore((state) => ({
    phase: state.phase,
    statusMessage: state.statusMessage,
    error: state.error,
  }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!idea.trim()) {
      setStatus('Please describe an idea to generate.')
      return
    }
    setStatus('Launching generation...')
    try {
      const orchestrator = getGenerationOrchestrator()
      await orchestrator.generate({
        idea,
        modelId: 'llama-3.1-70b-versatile',
        tone,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      setStatus(message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-4 ${className ?? ''}`}>
      <textarea
        value={idea}
        onChange={(event) => setIdea(event.target.value)}
        className="h-36 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 shadow-inner shadow-black/20 backdrop-blur focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        placeholder="Describe the experience you want Morphic to build..."
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select
          value={tone}
          onChange={(event) => setTone(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-400/40 md:w-auto"
        >
          <option value="balanced">Balanced tone</option>
          <option value="playful">Playful</option>
          <option value="professional">Professional</option>
        </select>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/20 px-6 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_25px_rgba(14,165,233,0.35)] transition hover:bg-cyan-500/30"
        >
          Generate
        </button>
      </div>
      <p className="text-xs uppercase tracking-[0.28em] text-slate-300/70">{status || generationState.statusMessage}</p>
      {generationState.error ? (
        <p className="text-xs font-semibold text-rose-200/80">{generationState.error}</p>
      ) : null}
    </form>
  )
}
