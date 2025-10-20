import type { BlueprintPlan, DeltaGenerationResult, GenerationRequest, GroqChatRequest, GroqChatResponse, TemplateSelection } from './types'

const DELTA_SYSTEM_PROMPT = `You are Morphic Web's code delta agent. Output ONLY valid React component code that:
- Uses React 18 functional components and hooks.
- Assumes CDN globals for React, Tailwind, Framer Motion, Lucide, Recharts, Axios, Marked.
- Calls window.getMorphicGroqKey() before AI-dependent operations.
- Avoids import/export statements and emits a single default export.
- Includes accessibility best practices and balanced JSX.`

export interface DeltaGeneratorOptions {
  fetcher?: typeof fetch
}

export class DeltaGenerator {
  private fetcher: typeof fetch

  constructor({ fetcher = fetch }: DeltaGeneratorOptions = {}) {
    this.fetcher = fetcher
  }

  async run(request: GenerationRequest, plan: BlueprintPlan, template: TemplateSelection): Promise<DeltaGenerationResult> {
    const payload: GroqChatRequest = {
      model: request.modelId,
      max_tokens: 1200,
      temperature: 0.2,
      messages: [
        { role: 'system', content: DELTA_SYSTEM_PROMPT },
        {
          role: 'user',
          content: this.composeUserPrompt(request, plan, template),
        },
      ],
    }

    const response = await this.invokeGroq(payload)
    const choice = response.choices.at(0)
    if (!choice) {
      throw new Error('Delta generation failed: empty response')
    }
    return {
      code: choice.message.content.trim(),
      tokenUsage: response.usage?.total_tokens ?? 0,
      autoRepairAttempts: 0,
    }
  }

  private composeUserPrompt(request: GenerationRequest, plan: BlueprintPlan, template: TemplateSelection): string {
    return [
      `Idea: ${request.idea}`,
      `Tone: ${request.tone ?? 'balanced'}`,
      `Blueprint Summary: ${plan.summary}`,
      `Components: ${plan.components.join(', ')}`,
      `Data Flows: ${plan.dataFlows.join(' → ')}`,
      `AI Features: ${plan.aiFeatures.join(', ')}`,
      `Template: ${template.templateId} (${template.rationale})`,
      'Guardrails: 1) use window.getMorphicGroqKey; 2) avoid direct DOM mutations; 3) include loading/error states; 4) keep bundle under 120 KB.',
    ].join('\n')
  }

  private async invokeGroq(payload: GroqChatRequest): Promise<GroqChatResponse> {
    const groqKey = typeof window !== 'undefined' && typeof window.getMorphicGroqKey === 'function' ? window.getMorphicGroqKey() : ''
    if (!groqKey) {
      throw new Error('Missing Groq API key for delta generation')
    }
    const response = await this.fetcher('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error(`Groq delta fetch failed: ${response.status}`)
    }
    return (await response.json()) as GroqChatResponse
  }
}
