# Morphic Web Premium UI Specification

## 1. Vision & Mood
- **Keywords:** glassmorphism, aurora glow, neon accents, editorial clarity.
- **Visual Tone:** Futuristic studio with high contrast, layered gradients, and soft blur surfaces.
- **Typography Hierarchy:**
  - Headings: `Plus Jakarta Sans` 36/32/28px with tight letter spacing.
  - Body: `Plus Jakarta Sans` 16px/20px at 80% opacity for rhythm.
  - Badges/Labels: uppercase at `tracking-[0.32em]` for premium feel.
- **Iconography:** Lucide icons with 1.5px stroke, tinted according to panel accent.
- **Motion Principles:**
  - Motion-safe fallback: fade and scale transitions (120ms ease-out).
  - Enhanced motion: Framer Motion for panel entrance and status updates (spring 0.6/24).

## 2. Layout & Grid
- **Overall Shell:** Max width 1440px centered, 40px gutters, 24px vertical rhythm.
- **Panels:** Glass cards (`border-white/10`, `bg-white/5`, `backdrop-blur-xl`) with accent shadows.
- **Preview Section:** 360px height iframe container with status badge overlay.
- **Analytics Column:** Right column on XL (≥1280px); stack vertically on smaller screens.
- **Responsive Breakpoints:**
  - `md (768px)`: stack prompt form and controls vertically.
  - `xl (1280px)`: switch to 2+1 grid for panels.

## 3. Components
### 3.1 Prompt Composer (`PromptComposer`)
- **States:** idle, loading (overlay progress), error (rose banner).
- **Inputs:** textarea (glass style), tone selector (pill buttons).
- **Primary CTA:** `Generate` with aurora glow shadow; disabled when empty.

### 3.2 Preview Panel (`PreviewController`)
- **Iframe Container:** gradient background (`from-violet-500/20 via-transparent to-cyan-400/20`).
- **Status Banner:** bottom center pill showing states: initializing, loading, rendered, error.
- **Export Button:** right-aligned, matches accent color of current state.

### 3.3 Timeline Panel (`TimelinePanel`)
- **Entry Cards:** glass surface with timestamp, phase chip, JSON meta preview.
- **Hover Effect:** subtle lift (`shadow-[0_10px_25px_rgba(15,23,42,0.35)]`).

### 3.4 Export Panel (`ExportPanel` – to build)
- **Sections:** web component instructions, embed code copy, bundle download.
- **Checklist:** badges for Stencil build, react-to-webcomponent fallback, desktop/mobile packaging.

### 3.5 Share Panel (`ShareLinkPanel` – to build)
- **Form:** generate link, copy button, optional expiration toggle.
- **History:** list past share links with restore action.

## 4. Color & Accent Tokens
- `glass-base`: `bg-white/5`.
- `border-soft`: `border-white/10`.
- `accent-cyan`: `shadow-[0_0_35px_rgba(34,211,238,0.25)]`.
- `accent-violet`: `shadow-[0_0_35px_rgba(167,139,250,0.25)]`.
- `accent-rose`: `shadow-[0_0_35px_rgba(251,113,133,0.25)]`.
- `status-initializing`: cyan tone, `text-cyan-100`.
- `status-loading`: violet tone, `text-violet-100`.
- `status-error`: rose tone, `text-rose-100`.

## 5. Interaction Guidelines
- **Generate Flow:** prompt submit → status banner updates → timeline entry written → preview iframe updates.
- **Export Flow:** after preview render, export panel surfaces download + embed options.
- **Share Flow:** share panel creates link, timeline logs new entry, toast confirmation (future enhancement).
- **Keyboard Navigation:** Tab loops across composer, preview, analytics; export/share actions accessible via keyboard.

## 6. Assets & Inspiration
- **Mood Board References:** Saved locally (TBD) or in `docs/design/references/`.
- **Icon Set:** Lucide (via CDN, theme tinted per panel).
- **Motion Examples:** Framer Motion variants defined in future hook (`useAuroraMotion`).

## 7. Implementation Notes
- Reference this spec before coding any Iteration 3 UI task.
- Update `docs/design/ui_spec.md` with revisions and cross-link to ADRs as UI evolves.
- Ensure Tailwind tokens map to `accent-*` classes; add tokens if missing.
