# Tailwind Design Token Specification

## 1. Palette Overview
- **Primary Nightfall (`bg-slate-950`)**: `#020617`
- **Aurora Cyan (`cyan-400/500`)**: `rgba(34, 211, 238, 0.6+)` highlights interactive states and focus rings.
- **Violet Nebula (`violet-400/500`)**: `rgba(124, 58, 237, 0.6+)` accents preview modules and loading states.
- **Rose Pulse (`rose-400/500`)**: `rgba(251, 113, 133, 0.6+)` emphasizes analytics and timeline alerts.
- **Frosted White (`white/5–20`)**: semi-transparent overlays for glassmorphism panels.

## 2. Typography
- **Sans Family**: `"Plus Jakarta Sans", ui-sans-serif, system-ui`
- **Mono Family**: `"JetBrains Mono", ui-monospace`
- **Letter Tracking Tokens**: `tracking-[0.28em]`, `tracking-[0.32em]`, `tracking-[0.38em]` for uppercase badges and labels.

## 3. Layered Backgrounds & Effects
- **Glass Gradient**: `bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_100%)]`
- **Aurora Glows**: radial circles using `bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.28),transparent_70%)]` and violet variants.
- **Panel Shadow Tokens**: `shadow-[0_0_35px_rgba(34,211,238,0.25)]`, `shadow-[0_0_35px_rgba(167,139,250,0.25)]`, `shadow-[0_0_35px_rgba(251,113,133,0.25)]` scoped to accent rings.
- **Neon Shadow**: `shadow-[0_0_45px_rgba(236,72,153,0.25)]` for CTA emphasis.

## 4. Surface Primitives
- **Glass Panel**: `border-white/8 bg-white/5 backdrop-blur-xl rounded-3xl`
- **Hover Veil**: `group-hover:opacity-20` using overlay div with `bg-white/5 blur-lg`
- **Gradient Cards**: `bg-gradient-to-br from-violet-500/20 via-transparent to-cyan-400/20`

## 5. Motion & Accessibility
- **Motion-Safe Gradient Animations**: wrap transitions in `@media (prefers-reduced-motion: no-preference)` when introduced.
- **Focus States**: `focus:ring-2 focus:ring-cyan-400/40` or `focus:ring-violet-400/40`; avoid relying solely on color by combining with border changes.
- **Reduced Motion Toggle**: future token `motion-safe:animate-[...]` to respect user settings.

## 6. Usage Guidelines
- **Accent Selection**: `cyan` for blueprint/prompt sections, `violet` for preview/runtime, `rose` for analytics/timeline.
- **Depth Hierarchy**: pair `border-white/10` with corresponding glow shadows to maintain contrast on dark backgrounds.
- **Typography Pairing**: uppercase badges use tracking tokens with `text-slate-300/70`; body copy stays within `text-slate-200/80` for readability.
