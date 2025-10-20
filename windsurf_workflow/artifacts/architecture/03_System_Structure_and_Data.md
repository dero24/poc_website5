<!-- anchor: system-context-diagram -->
### 3.3. System Context Diagram (C4 Level 1)
**Description:** Illustrates users interacting with Morphic Web, localized storage, and external Groq services.

~~~mermaid
C4Context
    Person(user, "Creator", "Describes app ideas and iterates on generated experiences")
    Person(iterator, "Iterator", "Refines prior versions and exports widgets")
    System_Boundary(morphic, "Morphic Web") {
        System(spa, "Morphic Web SPA", "React 18 + Vite client")
        SystemDb(local_store, "Local Persistence", "IndexedDB / LocalStorage caches")
    }
    System_Ext(groq_api, "Groq API", "Chat Completions & Model Catalog")
    System_Ext(hosting, "GitHub Pages", "Static hosting & SPA routing")

    Rel(user, spa, "Prompt, preview, export", "HTTPS")
    Rel(iterator, spa, "Load history, regenerate", "HTTPS")
    Rel(spa, local_store, "Persist versions, manifests, preferences", "IndexedDB API")
    Rel(spa, groq_api, "Fetch completions & model list", "HTTPS (fetch with Groq key)")
    Rel(spa, hosting, "Static asset delivery", "HTTPS")
~~~

<!-- anchor: container-diagram -->
### 3.4. Container Diagram (C4 Level 2)
**Description:** Shows primary client-side containers and optional edge relay participating in Morphic Web.

~~~mermaid
C4Container
    Person(user, "Creator/Iterator")
    System_Boundary(morphic, "Morphic Web") {
        Container(spa, "React SPA", "React 18, Vite, TypeScript", "Main UI & orchestration")
        Container(preview_runtime, "Preview Runtime", "Babel Standalone, DOMPurify", "Transpile & render AI code in iframe")
        Container(cache_layer, "Local Persistence", "IndexedDB (Dexie), LocalStorage", "Store prompts, versions, analytics")
        Container(export_pipeline, "Export Modules", "Stencil, react-to-webcomponent, jszip", "Package web components & bundles")
        Container(ai_agent, "Generation Orchestrator", "Hooks, Groq API", "Blueprint, template matching, delta prompts")
    }
    Container_Ext(groq_api, "Groq API", "Groq Chat Completions")
    Container_Ext(cdn, "CDN Providers", "unpkg/jsdelivr" )
    Container_Ext(edge, "Optional Edge Relay", "Cloudflare Worker")

    Rel(user, spa, "Interact via UI", "HTTPS")
    Rel(spa, preview_runtime, "Inject code for preview", "PostMessage/iFrame")
    Rel(spa, cache_layer, "Read/Write versions", "IndexedDB APIs")
    Rel(ai_agent, groq_api, "Blueprint & delta completions", "HTTPS with Groq key")
    Rel(preview_runtime, cdn, "Load libraries", "HTTPS")
    Rel(export_pipeline, cdn, "Bundle CDN dependencies", "HTTPS")
    Rel(spa, edge, "Send anonymized telemetry", "HTTPS (optional)")
~~~

<!-- anchor: component-diagram -->
### 3.5. Component Diagram (C4 Level 3)
**Description:** Details key modules within the `React SPA` container.

~~~mermaid
C4Component
    Container(spa, "React SPA", "React 18 + Vite")
    Component(ui_shell, "UI Shell", "React Layout Components", "Split-screen workspace, navigation")
    Component(prompt_composer, "Prompt Composer", "React + Zustand", "Collect prompts, model selection, caching")
    Component(generation_engine, "Generation Engine", "Hooks + Groq integration", "Blueprint, template matching, delta prompts")
    Component(auto_repair, "Auto-Repair Pipeline", "Validation utilities", "Syntax checks, sanitization, retries")
    Component(preview_iframe, "Preview Controller", "Iframe manager", "Posts code to runtime, tracks status")
    Component(version_manager, "Version Manager", "Dexie storage layer", "Persist manifests, history, analytics")
    Component(export_manager, "Export Manager", "Stencil/react-to-webcomponent orchestrator", "Web component & bundle export")
    Component(analytics_module, "Timeline Analytics", "Local telemetry", "Track generation metrics, surface insights")
    Component(collaboration_api, "Collaboration Hooks", "Local data services", "Future co-editing sync points")

    Rel(ui_shell, prompt_composer, "Renders & binds")
    Rel(prompt_composer, generation_engine, "Triggers generation")
    Rel(generation_engine, auto_repair, "Validates & repairs output")
    Rel(generation_engine, preview_iframe, "Send sanitized code")
    Rel(version_manager, analytics_module, "Provide history metrics")
    Rel(export_manager, version_manager, "Read stored bundles")
    Rel(collaboration_api, version_manager, "Share state")
~~~

<!-- anchor: data-model-overview -->
### 3.6. Data Model Overview & ERD
**Description:** Core entities stored in IndexedDB with LocalStorage backups.

- **UserPreferences:** Groq model choices, theme, motion settings, onboarding status.
- **PromptBlueprints:** Cached blueprint outputs keyed by prompt hash and timestamp.
- **GeneratedApps:** Final code bundles, metadata, export assets, share tokens.
- **AnalyticsEvents:** Timeline entries capturing generation duration, token savings, retries.
- **CollaborationDrafts:** Placeholder for future shared edits and annotations.

~~~mermaid
erDiagram
    USERPREFERENCES ||--o{ PROMPTBLUEPRINTS : "references default model"
    PROMPTBLUEPRINTS ||--o{ GENERATEDAPPS : "feeds generation"
    GENERATEDAPPS ||--o{ ANALYTICSEVENTS : "produces metrics"
    GENERATEDAPPS ||--o{ EXPORTARTIFACTS : "contains bundles"
    GENERATEDAPPS ||--o{ COLLABORATIONDRAFTS : "future edits"

    USERPREFERENCES {
        string id PK
        string defaultModel
        boolean motionSafe
        string themePreset
        datetime updatedAt
    }
    PROMPTBLUEPRINTS {
        string id PK
        string promptHash
        json blueprint
        float confidenceScore
        datetime createdAt
    }
    GENERATEDAPPS {
        string id PK
        string blueprintId FK
        json deltaPrompt
        json sanitizedCode
        json runtimeManifest
        datetime createdAt
    }
    ANALYTICSEVENTS {
        string id PK
        string appId FK
        float generationMs
        float tokenSavingsPercent
        boolean autoRepairInvoked
        datetime recordedAt
    }
    EXPORTARTIFACTS {
        string id PK
        string appId FK
        binary zipBlob
        string exportType
        datetime exportedAt
    }
    COLLABORATIONDRAFTS {
        string id PK
        string appId FK
        json sharedState
        datetime updatedAt
    }
~~~
