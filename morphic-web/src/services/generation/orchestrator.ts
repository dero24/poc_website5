import { hashString } from '../../utils/hash'
import { AutoRepairPipeline } from './autoRepair'
import { BlueprintAgent } from './blueprintAgent'
import { DeltaGenerator } from './deltaGenerator'
import { matchTemplate } from './templateMatcher'
import type { BlueprintPlan, DeltaGenerationResult, GenerationRequest, GenerationResult, GenerationPhase } from './types'
import { useGenerationStore } from '../../stores/generationStore'
import { readBlueprintPlan, readDeltaResult, saveBlueprintPlan, saveDeltaResult } from '../persistence/repository'

export interface GenerationOrchestratorOptions {
  autoRepair?: AutoRepairPipeline
  blueprintAgent?: BlueprintAgent
  deltaGenerator?: DeltaGenerator
  onPreviewReady?: (result: GenerationResult) => Promise<void> | void
}

export class GenerationOrchestrator {
  private autoRepair: AutoRepairPipeline
  private blueprintAgent: BlueprintAgent
  private deltaGenerator: DeltaGenerator
  private onPreviewReady?: (result: GenerationResult) => Promise<void> | void

  constructor({ autoRepair, blueprintAgent, deltaGenerator, onPreviewReady }: GenerationOrchestratorOptions = {}) {
    this.autoRepair = autoRepair ?? new AutoRepairPipeline()
    this.blueprintAgent = blueprintAgent ?? new BlueprintAgent({
      readBlueprint: readBlueprintPlan,
      writeBlueprint: saveBlueprintPlan,
    })
    this.deltaGenerator = deltaGenerator ?? new DeltaGenerator({})
    this.onPreviewReady = onPreviewReady
  }

  async generate(request: GenerationRequest): Promise<GenerationResult | null> {
    const store = useGenerationStore.getState()
    store.begin(request)
    try {
      const promptHash = hashString(request.idea + request.modelId + (request.tone ?? ''))
      const blueprint = await this.obtainBlueprint(request)
      store.setBlueprint(blueprint, blueprint.promptHash === promptHash && blueprint.createdAt < Date.now() + 1000)

      const template = matchTemplate({ plan: blueprint, tone: request.tone })
      store.setTemplate(template.template)

      await this.runValidationPhase('validation', 'Validating plan and template...')

      const cachedDelta = await readDeltaResult(promptHash)
      let delta: DeltaGenerationResult
      if (cachedDelta) {
        delta = cachedDelta
        store.setDelta(delta)
      } else {
        store.setPhase('delta', 'Requesting Groq delta code...')
        const generated = await this.deltaGenerator.run(request, blueprint, template.template)
        const repaired = await this.autoRepair.run(generated)
        delta = {
          code: repaired.code,
          tokenUsage: generated.tokenUsage,
          autoRepairAttempts: repaired.attempts,
        }
        store.setDelta(delta)
        await saveDeltaResult(promptHash, delta)
      }

      const result: GenerationResult = {
        blueprint,
        template: template.template,
        delta,
        durationMs: Date.now() - (store.startedAt ?? Date.now()),
        cached: Boolean(cachedDelta),
      }
      store.complete(result)
      await this.onPreviewReady?.(result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      useGenerationStore.getState().fail(message)
      return null
    }
  }

  private async obtainBlueprint(request: GenerationRequest): Promise<BlueprintPlan> {
    const promptHash = hashString(request.idea + request.modelId + (request.tone ?? ''))
    const cached = await readBlueprintPlan(promptHash)
    if (cached) {
      return cached
    }
    useGenerationStore.getState().setPhase('blueprint', 'Drafting lightweight blueprint...')
    const plan = await this.blueprintAgent.run(request)
    return plan
  }

  private async runValidationPhase(phase: GenerationPhase, message: string): Promise<void> {
    useGenerationStore.getState().setPhase(phase, message)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

export function ensureMorphicGroqKey(): string {
  const key = typeof window !== 'undefined' && typeof window.getMorphicGroqKey === 'function' ? window.getMorphicGroqKey() : ''
  if (!key) {
    throw new Error('Missing Groq API key')
  }
  return key
}
