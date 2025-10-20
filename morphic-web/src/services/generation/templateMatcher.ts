import type { BlueprintPlan, TemplateMatcherInput, TemplateMatcherOutput, TemplateSelection } from './types'

interface TemplateDefinition {
  id: string
  tags: string[]
  description: string
}

const templates: TemplateDefinition[] = [
  { id: 'dashboard-aurora', tags: ['dashboard', 'analytics', 'cards'], description: 'Multi-panel analytics dashboard' },
  { id: 'ai-workflow', tags: ['assistant', 'workflow', 'chat'], description: 'Guided AI workflow with chat elements' },
  { id: 'data-table-insight', tags: ['table', 'filters', 'search'], description: 'Data table with filters and insights banner' },
  { id: 'creative-gallery', tags: ['gallery', 'cards', 'media'], description: 'Media-forward creative gallery' },
]

const keywordMap: Record<string, string[]> = {
  analytics: ['dashboard', 'charts', 'metrics', 'kpi'],
  sustainability: ['carbon', 'climate', 'energy'],
  assistant: ['agent', 'assistant', 'workflow'],
  table: ['table', 'rows', 'dataset'],
  gallery: ['gallery', 'media', 'creative'],
}

export function matchTemplate({ plan, tone }: TemplateMatcherInput): TemplateMatcherOutput {
  const tokens = [...plan.components, ...plan.dataFlows, ...plan.aiFeatures, plan.summary].join(' ').toLowerCase()
  const scores = templates.map((template) => ({ template, score: scoreTemplate(template, tokens) }))
  scores.sort((a, b) => b.score - a.score)
  const best = scores[0]
  const selection: TemplateSelection = {
    templateId: best?.template.id ?? 'dashboard-aurora',
    confidence: Math.min(0.99, best?.score ?? 0.35),
    rationale: buildRationale(best?.template, plan, tone),
  }
  return { template: selection }
}

function scoreTemplate(template: TemplateDefinition, tokens: string): number {
  let score = 0.1
  for (const tag of template.tags) {
    if (tokens.includes(tag)) {
      score += 0.2
    }
  }
  for (const [keyword, synonyms] of Object.entries(keywordMap)) {
    if (synonyms.some((syn) => tokens.includes(syn))) {
      if (template.tags.includes(keyword) || template.tags.includes(keywordMapping(keyword))) {
        score += 0.25
      }
    }
  }
  return score
}

function keywordMapping(keyword: string): string {
  switch (keyword) {
    case 'analytics':
      return 'dashboard'
    case 'assistant':
      return 'workflow'
    case 'table':
      return 'table'
    case 'gallery':
      return 'gallery'
    default:
      return keyword
  }
}

function buildRationale(template: TemplateDefinition | undefined, plan: BlueprintPlan, tone?: string): string {
  const base = template ? `${template.id} selected for ${template.description}` : 'Default template selected.'
  const toneCue = tone ? ` Tone preference: ${tone}.` : ''
  const keyComponent = plan.components.at(0) ?? 'core experience'
  return `${base} Anchored around ${keyComponent}.` + toneCue
}
