import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
}

interface GlassPanelProps {
  title: string
  description?: string
  accent?: 'cyan' | 'violet' | 'rose'
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

const accentRing: Record<NonNullable<GlassPanelProps['accent']>, string> = {
  cyan: 'ring-cyan-400/60 shadow-[0_0_35px_rgba(34,211,238,0.25)]',
  violet: 'ring-violet-400/60 shadow-[0_0_35px_rgba(167,139,250,0.25)]',
  rose: 'ring-rose-400/60 shadow-[0_0_35px_rgba(251,113,133,0.25)]',
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 top-0 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.28),transparent_70%)] blur-3xl" />
        <div className="absolute -right-24 top-24 h-[540px] w-[540px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.25),transparent_75%)] blur-3xl" />
        <div className="absolute left-1/2 top-2/3 h-[520px] w-[820px] -translate-x-1/2 rounded-[999px] bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(192,132,252,0.16),rgba(248,113,113,0.16))] opacity-60 blur-2xl" />
      </div>
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-10 px-6 py-10 lg:px-10">
        {children}
      </div>
    </div>
  )
}

export function GlassPanel({
  title,
  description,
  accent = 'cyan',
  actions,
  children,
  className = '',
}: GlassPanelProps) {
  return (
    <section
      className={`group relative flex h-full flex-col gap-6 rounded-3xl border border-white/8 bg-white/5 p-6 backdrop-blur-xl transition duration-300 ease-out ${accentRing[accent]} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-300/70">{accentLabel(accent)}</p>
          <h2 className="mt-2 text-xl font-semibold text-white md:text-2xl">{title}</h2>
          {description ? <p className="mt-2 text-sm text-slate-300/90">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <div className="flex-1 text-sm text-slate-200/80">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-white/5 opacity-0 blur-lg transition group-hover:opacity-20" />
    </section>
  )
}

function accentLabel(accent: NonNullable<GlassPanelProps['accent']>) {
  switch (accent) {
    case 'cyan':
      return 'Blueprint Hub'
    case 'violet':
      return 'Live Preview'
    case 'rose':
      return 'Timeline Intelligence'
    default:
      return 'Workspace'
  }
}

export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-slate-200/80">
      {children}
    </span>
  )
}
