import { useMemo } from 'react'
import { useGenerationStore } from '../../stores/generationStore'

export function TimelinePanel() {
  const { timeline } = useGenerationStore((state) => ({ timeline: state.timeline }))
  const items = useMemo(() => timeline.slice(-10).reverse(), [timeline])

  if (!timeline.length) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
        Timeline will appear once generation starts.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200/80">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300/80">Pipeline Timeline</h3>
      <ul className="mt-4 space-y-3">
        {items.map((event) => (
          <li key={event.id} className="rounded-2xl border border-white/10 bg-white/3 px-4 py-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-slate-300/70">
              <span>{event.phase}</span>
              <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="mt-1 text-sm text-slate-100">{event.message}</p>
            {event.meta ? (
              <pre className="mt-2 overflow-x-auto rounded-xl bg-black/40 p-2 text-[10px] text-slate-300/80">
                {JSON.stringify(event.meta, null, 2)}
              </pre>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
