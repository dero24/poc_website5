# Prompt Template Catalog

## 1. System Context Envelope
- **Key:** `system-context-v1`
- **Description:** Loaded once per session to bootstrap Groq requests with guardrails.
- **Content Outline:**
  - Mission statement (Morphic Web magical UX)
  - CDN import rules (React, Tailwind, Framer Motion, Lucide, Recharts, Axios, Marked)
  - Accessibility and security constraints (single default export, use `window.getMorphicGroqKey()`)
  - Auto-repair expectations and preview sandbox behavior.
- **Usage:** Injected as the first system message for all blueprint/delta calls and cached for 24 hours.

## 2. Blueprint Prompt (`blueprint-lite-v2`)
- **Token Target:** 150–220 tokens
- **Purpose:** Produce lightweight architecture plan before expensive generation.
- **Structure:**
  ```json
  {
    "summary": "High-level concept",
    "components": ["key component"],
    "dataFlows": ["source -> destination"],
    "aiFeatures": ["feature"],
    "risks": ["edge case"],
    "complexityScore": 0.0-1.0
  }
  ```
- **Included Context:**
  - Normalized user idea
  - User tone/style preferences
  - Cached template catalogue synopsis (top 5 matches)
  - Recent analytics signals (token savings, retry rate)
- **Guardrails:**
  - Fail fast if idea violates policy
  - Keep arrays under 8 entries each
  - Provide minimum 1 risk regardless of simplicity

## 3. Template Match Hint (`template-bridge-v1`)
- **Token Target:** 40–60 tokens
- **Purpose:** Provide delta agent with rationale for chosen template.
- **Content:**
  - Template ID and description
  - Confidence score and top matching blueprint features
  - Layout emphasis (e.g., chart-first, AI workflow, data grid)
  - Accessibility cues (keyboard nav, motion-safe requirement)
- **Delivery:** Added as assistant summary between blueprint and delta request.

## 4. Delta Prompt (`delta-react-v4`)
- **Token Target:** 400–600 tokens
- **Purpose:** Generate sanitized React component code tailored to blueprint/template.
- **Structure:**
  - Restate idea, tone, blueprint summary
  - List required UI regions (sections, components, dynamic content)
  - Data bindings and mocked datasets (if applicable)
  - API integration rules (calling Groq with stored key, handling empty responses)
  - Export expectations (single default export, no imports)
- **Guardrails:**
  - Must include loading and error surfaces
  - Prefers Tailwind utility classes using defined tokens (`glass panels`, `aurora glows`)
  - Encourage Framer Motion usage only when motion-safe flag allows
  - Enforce `window.getMorphicGroqKey()` before any network call; fallback to deterministic UI when absent

## 5. Micro-Repair Prompt (`delta-fix-v1`)
- **Token Target:** 50–80 tokens
- **Trigger:** Auto-repair pipeline detects syntax/API errors.
- **Content:**
  - Provide failing snippet and error message
  - Request minimal patch (no full regeneration)
  - Reiterate single component/export rule
- **Budget:** Maximum 2 retries before surfacing error to user.

## 6. Inspiration Prompt (`spark-ideas-v1`)
- **Token Target:** 120–180 tokens
- **Purpose:** Generate “Need a spark?” carousel ideas.
- **Structure:**
  ```json
  {
    "ideas": [
      {
        "title": "catchy name",
        "description": "one sentence",
        "angle": "analytics/education/retail"
      }
    ]
  }
  ```
- **Constraints:**
  - Avoid duplicates within last 10 suggestions
  - Tailor tone to user preference (playful/professional)
  - Output 3 ideas per request

## 7. Validation Summary (`validation-echo-v1`)
- **Token Target:** 40 tokens
- **Purpose:** Optional follow-up summarizing blueprint/template compatibility for analytics logs.
- **Content:**
  - Confidence score (0–1)
  - Key risk mitigation step
  - Confirmation of API key usage guardrail

## 8. Caching Policy
- Blueprint outputs cached for 60 minutes keyed by `promptHash + modelId`
- Delta results cached for 10 minutes with fuzzy matching tolerance (0.85 cosine similarity)
- System context refreshed every 24 hours or when version hash changes (`system-context-v1`)
- Micro-repair prompts never cached to avoid stale fixes.
