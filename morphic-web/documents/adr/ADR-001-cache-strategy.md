# ADR-001: Morphic Web Caching Strategy

## Status
Accepted

## Context
The Morphic Web generation pipeline must deliver sub-2.5s prompt-to-preview cycles while capping Groq token usage to <800 tokens per generation. The specification mandates a four-layer caching approach covering system prompts, component templates, blueprint plans, and generated code. The application runs entirely in the browser, using IndexedDB with LocalStorage fallback, and relies on CDN-hosted assets for preview/runtime parity.

## Decision
Implement a multi-tier caching system in the client application:

- **Layer 1 – System Context Cache:** Store guardrails, CDN import rules, and static prompt scaffolding in LocalStorage keyed by version hash. Refresh every 24 hours or when the runtime manifest changes.
- **Layer 2 – Template Library Cache:** Persist vetted component templates and snippet manifests in IndexedDB (`ComponentTemplates` table). Version with semantic tags and invalidate when template checksum changes.
- **Layer 3 – Blueprint Cache:** Cache recent blueprint responses (150–300 tokens) keyed by prompt hash + normalized intent within IndexedDB. Retain for one hour to accelerate iterations.
- **Layer 4 – Generated Code Cache:** Store sanitized component code, runtime manifests, and export-ready bundles for 10 minutes. Support fuzzy prompt matching using cosine similarity on intent embeddings to detect near-duplicates.

Each layer records token savings and hit/miss metrics into `AnalyticsEvents` to surface effectiveness in the Timeline dashboard. Auto-repair routines consult Layer 4 before reissuing delta prompts, enabling fast retries without rebuilding from scratch.

## Consequences
- **Pros:** Dramatically reduces Groq usage, accelerates repeat generations, and enables offline rehydration of prior apps. Aligns with magic UX requirement by avoiding redundant API calls.
- **Cons:** Requires cache versioning and migration logic. IndexedDB quotas may be reached on low-storage devices; fallback policies must purge least-recently-used entries.

## Related Artifacts
- Component Diagram: `docs/diagrams/spa_components.mmd`
- Data Model ERD: `docs/diagrams/data_model.mmd`
- Prompt-to-Preview Flow: `docs/diagrams/prompt_to_preview.mmd`
