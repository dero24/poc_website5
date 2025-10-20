<!-- anchor: api-design-and-communication -->
### 3.7. API Design & Communication

<!-- anchor: api-style -->
#### 3.7.1. API Style
- **Groq Integration:** RESTful fetch calls to Groq chat completions endpoint with JSON payloads and streaming support for future enhancements.
- **Model Catalog:** RESTful fetch to Groq model discovery endpoint, cached locally with periodic refresh.
- **Local Services:** Intra-app communication via React hooks, Zustand stores, and Context APIs; no external REST APIs beyond Groq.
- **Optional Edge Relay:** REST endpoint on Cloudflare Worker for telemetry batching and rate-limit handling.

<!-- anchor: communication-patterns -->
#### 3.7.2. Communication Patterns
- **Synchronous Requests:** Prompt submission triggers blueprint/delta requests; preview iframe receives sanitized code via `postMessage`.
- **Asynchronous Processing:** Auto-repair pipeline awaits validation results, uses queued retries with exponential backoff.
- **Local Pub/Sub:** Zustand store emits updates consumed by UI components for generation state, analytics, and export status.
- **Telemetry Queue:** Optional batching of anonymized metrics to edge relay with debounce and retry logic.

<!-- anchor: key-interaction-flow -->
#### 3.7.3. Key Interaction Flow (Prompt-to-Preview)
**Description:** Sequence from user prompt entry to rendered preview and persistence.

~~~mermaid
sequenceDiagram
    participant User
    participant UI as Prompt Composer (React)
    participant Orchestrator as Generation Orchestrator
    participant Groq as Groq API
    participant Validator as Auto-Repair & Validation
    participant Preview as Preview Runtime (iFrame)
    participant Storage as Version Manager (IndexedDB)

    User->>UI: Enter idea & click Generate
    UI->>Orchestrator: createGenerationRequest(prompt, model, prefs)
    Orchestrator->>Storage: lookupCachedBlueprint(promptHash)
    Storage-->>Orchestrator: cachedBlueprint?/miss
    alt blueprint miss
        Orchestrator->>Groq: POST /blueprint (lightweight plan)
        Groq-->>Orchestrator: blueprint JSON
        Orchestrator->>Storage: saveBlueprint(blueprint)
    end
    Orchestrator->>Orchestrator: matchTemplate(blueprint)
    Orchestrator->>Validator: runPreValidation(template, blueprint)
    Validator-->>Orchestrator: validationResult
    alt confidence < threshold
        Orchestrator->>Orchestrator: selectSimplerTemplate()
    end
    Orchestrator->>Groq: POST /delta (customized code prompt)
    Groq-->>Orchestrator: deltaCode
    Orchestrator->>Validator: sanitizeAndRepair(deltaCode)
    Validator-->>Orchestrator: sanitizedComponent
    Orchestrator->>Preview: postMessage(loadComponent)
    Preview-->>Orchestrator: renderStatus(success/failed)
    Orchestrator->>Storage: persistGeneratedApp(metadata)
    Orchestrator-->>UI: updateStatus(renderSuccess)
~~~
