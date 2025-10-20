export type GenerationPhase =
  | 'idle'
  | 'blueprint'
  | 'template-matching'
  | 'validation'
  | 'delta'
  | 'auto-repair'
  | 'preview'
  | 'completed'
  | 'failed'

export interface GenerationRequest {
  idea: string
  modelId: string
  tone?: string
  blueprintContext?: string
}

export interface BlueprintPlan {
  id: string
  promptHash: string
  summary: string
  components: string[]
  dataFlows: string[]
  risks: string[]
  complexityScore: number
  aiFeatures: string[]
  createdAt: number
}

export interface TemplateSelection {
  templateId: string
  confidence: number
  rationale: string
}

export interface DeltaGenerationResult {
  code: string
  tokenUsage: number
  autoRepairAttempts: number
}

export interface GenerationResult {
  blueprint: BlueprintPlan
  template: TemplateSelection
  delta: DeltaGenerationResult
  durationMs: number
  cached: boolean
}

export interface ValidationResult {
  success: boolean
  confidence: number
  issues: string[]
}

export interface GroqChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqChatRequest {
  model: string
  messages: GroqChatMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
}

export interface GroqChatResponseChoice {
  message: {
    role: 'assistant'
    content: string
  }
}

export interface GroqChatResponse {
  choices: GroqChatResponseChoice[]
  usage?: {
    total_tokens?: number
  }
}

export interface TemplateMatcherInput {
  plan: BlueprintPlan
  tone?: string
}

export interface TemplateMatcherOutput {
  template: TemplateSelection
}
