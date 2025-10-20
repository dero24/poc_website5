import { GenerationOrchestrator } from './orchestrator'

let orchestrator: GenerationOrchestrator | null = null

export function getGenerationOrchestrator(): GenerationOrchestrator {
  if (!orchestrator) {
    orchestrator = new GenerationOrchestrator()
  }
  return orchestrator
}
