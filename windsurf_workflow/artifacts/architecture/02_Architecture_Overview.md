<!-- anchor: architecture-overview -->
## 3. Proposed Architecture

<!-- anchor: architectural-style -->
### 3.1. Architectural Style
A client-heavy, modular SPA with layered domain boundaries, leveraging micro-frontend-like separation within the React app for generation pipeline, preview runtime, persistence services, and export tooling. The architecture favors service modules and hooks over monolithic state containers, enabling independent iteration on generation, preview, analytics, and export subsystems.

<!-- anchor: technology-stack-summary -->
### 3.2. Technology Stack Summary
| Domain | Technology | Rationale |
| --- | --- | --- |
| Frontend | React 18 + Vite + TypeScript | Modern hook-based SPA with fast builds, Suspense-ready async flows, and strong typing. |
| Styling | Tailwind CSS v4 (oxide engine), CSS variables | Premium glassmorphism design, theming tokens, motion-safe variants, and responsive utilities. |
| State & Data | Zustand, React Query, IndexedDB (Dexie), LocalStorage fallback | Local-first persistence, multi-store caching, resilient offline support. |
| AI Integration | Groq Chat Completions via Fetch | High-performance, low-latency generation using `getMorphicGroqKey()` helper. |
| Preview Runtime | Babel Standalone, DOMPurify, dynamic CDN loaders | In-browser transpilation, sanitization, and dependency injection for generated code. |
| Export | Stencil (primary), react-to-webcomponent (fallback), jszip | Web component packaging and portable bundle creation. |
| Analytics & Telemetry | Local timeline tracker, optional edge relay (Cloudflare Workers) | Client-side analytics with optional aggregated relays respecting user privacy. |
| Tooling | ESLint, Prettier, Vitest, Playwright | Code quality, unit/integration tests, and e2e validation. |
