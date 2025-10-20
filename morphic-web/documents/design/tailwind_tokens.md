# Tailwind Design Token Specification

## 1. Palette Overview
- **Primary Nightfall (`nightfall`)**: `#020617` / Tailwind `bg-slate-950`. Core shell background.
- **Aurora Cyan (`aurora-cyan`)**: `rgba(34, 211, 238, 0.65)` → `text-cyan-100`, `border-cyan-400/40`. Hero CTAs, focus rings.
- **Violet Nebula (`aurora-violet`)**: `rgba(124, 58, 237, 0.65)` for preview gradients and loading states.
- **Rose Pulse (`aurora-rose`)**: `rgba(251, 113, 133, 0.65)` for analytics accents, warnings.
- **Glacial White (`glass-white`)**: `rgba(255, 255, 255, 0.08)` base glass overlay.
- **Deep Space (`deep-space`)**: `rgba(15, 23, 42, 0.55)` used for inner shadows / overlays.
- **Gold Spark (`gold-spark`)**: `rgba(253, 224, 71, 0.6)` highlight metrics or share buttons.

> **Token usage:** map these to CSS variables in `src/styles/tokens.css` (to add) and reference via Tailwind `bg-[--token-name]` where needed.

## 2. Typography
- **Sans Family:** `"Plus Jakarta Sans", ui-sans-serif, system-ui`
- **Mono Family:** `"JetBrains Mono", ui-monospace`
- **Scale:**
  - Display (hero): `text-4xl md:text-5xl leading-tight`
  - Panel Title: `text-xl md:text-2xl font-semibold`
  - Body: `text-sm md:text-base text-slate-200/85`
- **Letter Tracking Tokens:**
  - `tracking-[0.42em]` (badge ultra)
  - `tracking-[0.32em]` (section labels)
  - `tracking-[0.18em]` (secondary chips)
- **Underline Accent:** `decoration-[0.35em] decoration-aurora-cyan/50` for key metrics.

## 3. Layered Backgrounds & Effects
- **Glass Gradient**: `bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)]`
- **Aurora Glows**: radial circles using `bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.28),transparent_70%)]` and violet variants.
- **Panel Shadow Tokens**: `shadow-[0_0_35px_rgba(34,211,238,0.25)]`, `shadow-[0_0_35px_rgba(167,139,250,0.25)]`, `shadow-[0_0_35px_rgba(251,113,133,0.25)]` scoped to accent rings.
- **Neon Shadow**: `shadow-[0_0_45px_rgba(236,72,153,0.25)]` for CTA emphasis.
- **Aurora Horizon:** `bg-[linear-gradient(120deg,rgba(34,211,238,0.25),rgba(124,58,237,0.25),rgba(251,113,133,0.2))]`
- **Inner Glass Shadow:** `shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]`
- **Backdrop Blur Token:** `backdrop-blur-[22px]` for deep glass surfaces.

## 4. Surface Primitives
- **Glass Panel**: `border-white/8 bg-white/5 backdrop-blur-xl rounded-3xl`
- **Hover Veil**: `group-hover:opacity-20` using overlay div with `bg-white/5 blur-lg`
- **Gradient Cards**: `bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-400/20`
- **Metric Chip:** `border-white/15 bg-white/8 rounded-full px-3 py-1 text-xs uppercase tracking-[0.32em]`
- **Timeline Card:** `border-white/10 bg-slate-900/40 rounded-2xl shadow-[0_20px_45px_rgba(2,6,23,0.55)]`
- **CTA Primary:** `rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.35),transparent_70%)] border border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.45)]`

## 5. Motion & Accessibility
- **Motion-Safe Gradient Animations**: wrap transitions in `@media (prefers-reduced-motion: no-preference)` when introduced.
- **Focus States**: `focus:ring-2 focus:ring-cyan-400/40` or `focus:ring-violet-400/40`; avoid relying solely on color by combining with border changes.
- **Reduced Motion Toggle**: future token `motion-safe:animate-[...]` to respect user settings.
- **Surface Lift:** `transition-transform duration-200 ease-out hover:-translate-y-1` (paired with shadow token).
- **Timeline Reveal Animation:** `animate-[timeline-pop_0.35s_cubic-bezier(0.16,1,0.3,1)]` (define keyframes in `src/styles/animations.css`).
- **Accessibility Contrast:** minimum 4.5:1 contrast for text; use `text-white/90` on glass surfaces.

## 6. Usage Guidelines
- **Accent Selection**: `cyan` for blueprint/prompt sections, `violet` for preview/runtime, `rose` for analytics/timeline.
- **Depth Hierarchy**: pair `border-white/10` with corresponding glow shadows to maintain contrast on dark backgrounds.
- **Typography Pairing**: uppercase badges use tracking tokens with `text-slate-300/70`; body copy stays within `text-slate-200/80` for readability.
- **Gradient Discipline:** limit each panel to one gradient layer + one glow token to avoid clutter.
- **Icon Tinting:** use `text-cyan-200`, `text-violet-200`, `text-rose-200` depending on panel accent.
- **Glass Layer Stack:** `<div class="relative"> + overlay + content` to keep blur/performance optimized.
- **Export/Share Buttons:** always use aurora cyan base with gold spark hover to reinforce “premium” action.
