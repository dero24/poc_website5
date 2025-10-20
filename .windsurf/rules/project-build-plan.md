---
trigger: always_on
description: When having to reference the overal gameplan, and can also use the full guide at .codemachineartifactsplan.md
---

# Project Plan: Morphic Web

**Version:** 1.0 | **Date:** October 19, 2025

## 1. Project Overview

**Goal:** Browser-only React studio transforming natural-language prompts into production-ready SPAs with instant previews, Groq intelligence, and universal export.

**Key Requirements:**
- Natural-language composer with dynamic Groq model catalog
- Multi-phase generation: blueprinting → template matching → delta prompts → validation → auto-repair
- Browser preview via Babel Standalone, CDN loading, iframe sandboxing
- IndexedDB persistence (LocalStorage fallback) for versions, manifests, analytics
- Export: web components (Stencil), desktop/mobile packaging, shareable links
- Tailwind v4 glassmorphism, neon accents, motion-safe variants, WCAG AA compliance
- Timeline analytics, inspiration feed, collaboration scaffolding

**Assumptions:**
- Users provide Groq API keys (stored locally via helpers)
- Modern browsers with IndexedDB, Service Workers, Shadow DOM
- GitHub Pages static hosting with HTTPS
- CDN dependencies (React 18, Tailwind v4, Framer Motion, etc.) version-pinned
- Desktop/mobile wrappers (Tauri/Capacitor) embed web components

## 2. Core Architecture

**Stack:**
- Frontend: React 18 (TypeScript), Vite, Tailwind v4, Framer Motion, Lucide, Recharts, Babel Standalone
- Database: IndexedDB (Dexie), LocalStorage fallback
- Deployment: GitHub Pages
- Export: Stencil, react-to-webcomponent, jszip, Tauri, Capacitor
- Tools: Zustand, React Query, ESLint, Prettier, Vitest, Playwright

**Key Components:**
- Prompt Composer (model selector, inspiration feed)
- Generation Orchestrator (blueprint → template → delta → repair)
- Preview Runtime Manager (iframe, Babel, CDN injection, sanitization)
- Persistence Layer (IndexedDB repos, caching)
- Export Pipeline (Stencil compilation, zip bundler, desktop/mobile shells)
- Analytics Tracker (metrics, token savings)
- Collaboration Scaffolding (drafts, sync hooks)

**Data Model:** UserPreferences, PromptBlueprints, GeneratedApps, AnalyticsEvents, ExportArtifacts, CollaborationDrafts, InspirationFeed

**API Calls Per Generation:**
- Typical: 2 calls (~600 tokens, $0.001) - blueprint + delta generation
- Worst case: 3 calls (~950 tokens, $0.002) - includes micro-repair or smart retry

## 3. Directory Structure

```
morphic-web/
├── src/
│   ├── components/  (layout, prompts, preview, analytics, export)
│   ├── hooks/
│   ├── stores/
│   ├── services/  (generation, persistence, preview, export)
│   ├── utils/
│   ├── styles/
│   └── App.tsx
├── public/
├── docs/  (diagrams, design, guides, adr)
├── api/  (OpenAPI specs)
├── scripts/
├── tests/  (unit, integration, e2e)
├── workflows/ci/
├── package.json
└── vite.config.ts
```

## 4. Iteration Plan (4 Iterations)

### Iteration 1: Foundation
**Goal:** Scaffolding, architecture artifacts, data models, UI shell

**Tasks:**
- I1.T1: Vite React setup with Tailwind v4, ESLint, directory structure
- I1.T2: API key onboarding modal, helper functions, LocalStorage
- I1.T3: Mermaid Component Diagram (SPA modules)
- I1.T4: ERD (IndexedDB entities)
- I1.T5: Sequence Diagram (prompt-to-preview flow)
- I1.T6: ADR (cache strategy)

### Iteration 2: Generation Pipeline
**Goal:** Orchestration, templates, styling, validation, preview

**Tasks:**
- I2.T1: Tailwind design tokens documentation
- I2.T2: Generation orchestrator (blueprint, template match, delta prompts, state machine)
- I2.T3: Prompt templates catalog
- I2.T4: Preview runtime manager (iframe, Babel, sanitization)
- I2.T5: State machine diagram
- I2.T6: IndexedDB persistence (Dexie, LocalStorage fallback)

### Iteration 3: Export & Analytics
**Goal:** Export pipeline, analytics dashboards, telemetry

**Tasks:**
- I3.T1: Export manager (Stencil, jszip, embed instructions)
- I3.T2: ADR (export architecture)
- I3.T3: Export pipeline diagram
- I3.T4: Analytics dashboard (timeline, token savings, telemetry)
- I3.T5: Shareable preview links

### Iteration 4: Polish & Packaging
**Goal:** Inspiration, collaboration, QA, CI/CD, release scripts

**Tasks:**
- I4.T1: Inspiration feed (AI ideas, carousel UI)
- I4.T2: Collaboration drafts (local storage, sync stubs)
- I4.T3: Accessibility (keyboard nav, screen readers, Playwright e2e)
- I4.T4: CI/CD workflow (lint, test, deploy, artifact validation)
- I4.T5: Release packaging scripts

## 5. Verification Strategy

**Testing:**
- Unit: Orchestrator, persistence, preview, export (≥80% coverage)
- Integration: Composer → orchestrator → preview pipeline
- E2E: Playwright (generation, export, share flows)

**CI/CD:** GitHub Actions - lint, test, Mermaid/OpenAPI validation, build, deploy

**Quality Gates:** ESLint/Prettier enforced, Vitest coverage, Playwright success

## 6. Glossary

- **Blueprint Prompt:** Lightweight structural plan (150-300 tokens)
- **Delta Prompt:** Targeted customization (200-400 tokens)
- **Auto-Repair:** Local validation/correction (0-50 tokens if needed)
- **Stencil:** Web component compiler with Shadow DOM
- **Dexie:** IndexedDB wrapper
- **ADR:** Architectural Decision Record