import { hashString } from '../../utils/hash'
import type { BlueprintPlan, GenerationRequest, GroqChatRequest, GroqChatResponse } from './types'
import { readBlueprintPlan, saveBlueprintPlan } from '../persistence/repository'

const BLUEPRINT_SYSTEM_PROMPT = `You are the Morphic Web blueprint agent. Produce a concise JSON plan with keys: summary, components (array), dataFlows (array), risks (array), aiFeatures (array), complexityScore (0-1 float). Keep output under 220 tokens.`

export interface BlueprintAgentOptions {
  readBlueprint?: typeof readBlueprintPlan
  writeBlueprint?: typeof saveBlueprintPlan
  fetcher?: typeof fetch
}

export class BlueprintAgent {
  private readBlueprint: typeof readBlueprintPlan
  private writeBlueprint: typeof saveBlueprintPlan
  private fetcher: typeof fetch

  constructor({ readBlueprint = readBlueprintPlan, writeBlueprint = saveBlueprintPlan, fetcher = fetch }: BlueprintAgentOptions = {}) {
    this.readBlueprint = readBlueprint
    this.writeBlueprint = writeBlueprint
    this.fetcher = fetcher
  }

  async run(request: GenerationRequest): Promise<BlueprintPlan> {
    const promptHash = hashString(request.idea + request.modelId + (request.tone ?? ''))
    const cached = await this.readBlueprint(promptHash)
    if (cached) {
      return cached
    }

    const groqRequest: GroqChatRequest = {
      model: request.modelId,
      max_tokens: 300,
      messages: [
        { role: 'system', content: BLUEPRINT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Idea:${request.idea}\nTone:${request.tone ?? 'balanced'}\nContext:${request.blueprintContext ?? 'standard app studio'}`,
        },
      ],
    }
    const response = await this.invokeGroq(groqRequest)
    const plan = this.parseBlueprint(response, promptHash)
    await this.writeBlueprint(plan)
    return plan
  }

  private async invokeGroq(payload: GroqChatRequest): Promise<GroqChatResponse> {
    const groqKey = typeof window !== 'undefined' && typeof window.getMorphicGroqKey === 'function' ? window.getMorphicGroqKey() : ''
    if (!groqKey) {
      throw new Error('Missing Groq API key')
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
      throw new Error(`Groq blueprint fetch failed: ${response.status}`)
    }
    return (await response.json()) as GroqChatResponse
  }

  private parseBlueprint(response: GroqChatResponse, promptHash: string): BlueprintPlan {
    const first = response.choices.at(0)
    if (!first) {
      throw new Error('Groq blueprint response missing choices')
    }
    try {
      const parsed = JSON.parse(first.message.content)
      return {
        id: crypto.randomUUID(),
        promptHash,
        summary: parsed.summary ?? 'Generated blueprint',
        components: parsed.components ?? [],
        dataFlows: parsed.dataFlows ?? [],
        risks: parsed.risks ?? [],
        aiFeatures: parsed.aiFeatures ?? [],
        complexityScore: Number(parsed.complexityScore ?? 0.5),
        createdAt: Date.now(),
      }
    } catch (error) {
      console.error('Failed to parse blueprint JSON', error)
      throw new Error('Blueprint parse error')
    }
  }
}
