<!-- anchor: cross-cutting-concerns -->
### 3.8. Cross-Cutting Concerns

<!-- anchor: authentication-authorization -->
#### 3.8.1. Authentication & Authorization
- Local onboarding modal captures Groq API key and stores it via `window.setMorphicGroqKey()` using LocalStorage (with optional SessionStorage).
- Runtime helper `window.getMorphicGroqKey()` exposes key to generated apps; absence triggers graceful fallback states.
- Optional edge relay authenticates via signed tokens generated client-side per session for telemetry uploads.

<!-- anchor: logging-monitoring -->
#### 3.8.2. Logging & Monitoring
- Client-side structured logging routed to console during development and stored in IndexedDB for timeline analytics.
- Anonymized metrics (generation duration, token savings) optionally batched to edge relay for aggregated dashboards.
- Error boundaries capture preview runtime faults and surface actionable toasts while preserving logs for export.

<!-- anchor: security-considerations -->
#### 3.8.3. Security Considerations
- Sandbox iframe with restrictive permissions (`sandbox="allow-scripts"`) for all generated previews.
- DOMPurify sanitation of AI-generated HTML snippets; Babel transforms strip imports/exports.
- CSP headers enforced via meta tags; CDN dependencies pinned to exact versions.
- LocalStorage encryption wrapper (Web Crypto) optional for securing API keys at rest.

<!-- anchor: scalability-performance -->
#### 3.8.4. Scalability & Performance
- Heavy computation (generation, validation) remains client-side; Groq handles inference scalability.
- Caching layers (system prompt, templates, blueprints, code) drastically reduce repeated API calls.
- Vite code-splitting, lazy component loading, and Suspense transitions ensure responsive UI.
- Preview runtime streams code compilation to maintain sub-second refresh.

<!-- anchor: reliability-availability -->
#### 3.8.5. Reliability & Availability
- Offline-ready caches allow rehydration of prior apps without network.
- Auto-repair pipeline attempts local fixes before reissuing lightweight delta prompts.
- Edge relay (if enabled) queues telemetry for later send when offline.
- Error boundaries and fallback templates maintain functional previews even on partial failures.

<!-- anchor: deployment-view -->
### 3.9. Deployment View

<!-- anchor: target-environment -->
#### 3.9.1. Target Environment
- GitHub Pages (or similar static host) serving Vite SPA build.
- Optional Cloudflare Worker or Vercel Edge Function for telemetry relay and rate-limited Groq proxy (if needed).
- CDN-hosted assets (unpkg/jsdelivr) for runtime dependencies.

<!-- anchor: deployment-strategy -->
#### 3.9.2. Deployment Strategy
- CI pipeline: lint → unit tests → build → deploy to `gh-pages` branch via GitHub Actions.
- Cache busting through hashed asset filenames and service worker precache manifest.
- Optional deployment diagram:

~~~mermaid
C4Deployment
    Deployment_Node(github_pages, "GitHub Pages", "Static Hosting") {
        Container(spa, "Morphic Web SPA", "React/Vite bundle")
    }
    Deployment_Node(user_browser, "User Browser", "Chrome/Edge/Firefox") {
        Container(client_runtime, "Client Runtime", "React app, IndexedDB, preview iframe")
    }
    Deployment_Node(cloudflare, "Cloudflare Worker", "Edge Relay") {
        Container(relay, "Telemetry Proxy", "Optional rate limiting")
    }
    Deployment_Node(groq_cloud, "Groq Cloud", "Managed API") {
        Container(groq_api, "Groq Completions", "LLM inference")
    }

    Rel(spa, client_runtime, "Served via HTTPS")
    Rel(client_runtime, groq_api, "Fetch completions", "HTTPS with API key")
    Rel(client_runtime, relay, "Telemetry batches", "HTTPS")
~~~
