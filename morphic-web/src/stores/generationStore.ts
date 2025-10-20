import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BlueprintPlan, DeltaGenerationResult, GenerationPhase, GenerationRequest, GenerationResult, TemplateSelection } from '../services/generation/types'
import type { PreviewStatus } from '../services/preview/runtimeManager'

export type StorePreviewStatus = PreviewStatus | { state: 'idle'; message: string }

export interface GenerationState {
  phase: GenerationPhase
  request: GenerationRequest | null
  blueprint: BlueprintPlan | null
  template: TemplateSelection | null
  delta: DeltaGenerationResult | null
  statusMessage: string
  cached: boolean
  error?: string
  startedAt?: number
  completedAt?: number
  timeline: GenerationEvent[]
  previewPayload: PreviewPayload | null
  previewStatus: StorePreviewStatus
  setPhase(phase: GenerationPhase, statusMessage?: string): void
  begin(request: GenerationRequest): void
  setBlueprint(plan: BlueprintPlan, cached: boolean): void
  setTemplate(selection: TemplateSelection): void
  setDelta(result: DeltaGenerationResult): void
  fail(error: string): void
  complete(result: GenerationResult): void
  reset(): void
  setPreviewPayload(payload: PreviewPayload | null): void
  setPreviewStatus(status: StorePreviewStatus): void
}

export interface GenerationEvent {
  id: string
  phase: GenerationPhase | 'status'
  message: string
  timestamp: number
  meta?: Record<string, unknown>
}

export interface PreviewPayload {
  code: string
  createdAt: number
  templateId?: string
  blueprintId?: string
  metadata?: Record<string, unknown>
}

function appendEvent(events: GenerationEvent[], event: GenerationEvent): GenerationEvent[] {
  return [...events, event]
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      phase: 'idle',
      request: null,
      blueprint: null,
      template: null,
      delta: null,
      cached: false,
      statusMessage: 'Describe an experience to begin.',
      timeline: [],
      previewPayload: null,
      previewStatus: { state: 'idle', message: 'Awaiting preview render' },
      setPhase: (phase, statusMessage) =>
        set((state) => {
          const message = statusMessage ?? state.statusMessage
          const event: GenerationEvent = {
            id: crypto.randomUUID(),
            phase,
            message,
            timestamp: Date.now(),
          }
          return {
            phase,
            statusMessage: message,
            timeline: appendEvent(state.timeline, event),
          }
        }),
      begin: (request) =>
        set({
          phase: 'blueprint',
          request,
          blueprint: null,
          template: null,
          delta: null,
          error: undefined,
          cached: false,
          statusMessage: 'Crafting blueprint plan...',
          startedAt: Date.now(),
          completedAt: undefined,
          timeline: [
            {
              id: crypto.randomUUID(),
              phase: 'blueprint',
              message: 'Crafting blueprint plan...',
              timestamp: Date.now(),
              meta: { modelId: request.modelId },
            },
            {
              id: crypto.randomUUID(),
              phase: 'status',
              message: 'Preparing preview runtime...',
              timestamp: Date.now(),
              meta: { state: 'initializing' },
            },
          ],
          previewPayload: null,
          previewStatus: { state: 'initializing', message: 'Preparing preview runtime...' },
        }),
      setBlueprint: (plan, cached) =>
        set((state) => {
          const message = cached ? 'Reusing cached blueprint.' : 'Blueprint ready. Matching templates...'
          const event: GenerationEvent = {
            id: crypto.randomUUID(),
            phase: 'template-matching',
            message,
            timestamp: Date.now(),
            meta: { cached },
          }
          return {
            blueprint: plan,
            cached,
            phase: 'template-matching',
            statusMessage: message,
            timeline: appendEvent(state.timeline, event),
          }
        }),
      setTemplate: (selection) =>
        set((state) => {
          const message = 'Validating plan and template compatibility...'
          const event: GenerationEvent = {
            id: crypto.randomUUID(),
            phase: 'validation',
            message,
            timestamp: Date.now(),
            meta: { templateId: selection.templateId },
          }
          return {
            template: selection,
            phase: 'validation',
            statusMessage: message,
            timeline: appendEvent(state.timeline, event),
          }
        }),
      setDelta: (delta) =>
        set((state) => {
          const message = 'Ensuring generated code is production-ready...'
          const event: GenerationEvent = {
            id: crypto.randomUUID(),
            phase: 'auto-repair',
            message,
            timestamp: Date.now(),
            meta: { tokenUsage: delta.tokenUsage },
          }
          return {
            delta,
            phase: 'auto-repair',
            statusMessage: message,
            timeline: appendEvent(state.timeline, event),
            previewPayload: {
              code: delta.code,
              createdAt: Date.now(),
              templateId: state.template?.templateId,
              blueprintId: state.blueprint?.id,
              metadata: { tokenUsage: delta.tokenUsage },
            },
          }
        }),
      fail: (error: string) =>
        set((state) => {
          const message = 'Generation failed. Adjust prompt or retry.'
          const event: GenerationEvent = {
            id: crypto.randomUUID(),
            phase: 'failed',
            message: error,
            timestamp: Date.now(),
          }
          return {
            phase: 'failed',
            error,
            statusMessage: message,
            completedAt: Date.now(),
            timeline: appendEvent(state.timeline, event),
            previewStatus: { state: 'error', message: error, errors: [error] },
          }
        }),
      complete: (result) =>
        set((state) => {
          const event: GenerationEvent = {
            id: crypto.randomUUID(),
            phase: 'completed',
            message: result.cached ? 'Preview ready from cache.' : 'Preview ready with fresh generation.',
            timestamp: Date.now(),
            meta: { durationMs: result.durationMs, cached: result.cached },
          }
          return {
            blueprint: result.blueprint,
            template: result.template,
            delta: result.delta,
            phase: 'completed',
            cached: result.cached,
            statusMessage: 'Preview ready!',
            completedAt: Date.now(),
            timeline: appendEvent(state.timeline, event),
            previewPayload: state.previewPayload,
            previewStatus: { state: 'loading', message: 'Streaming preview to runtime...' },
          }
        }),
      reset: () =>
        set({
          phase: 'idle',
          request: null,
          blueprint: null,
          template: null,
          delta: null,
          statusMessage: 'Describe an experience to begin.',
          cached: false,
          error: undefined,
          startedAt: undefined,
          completedAt: undefined,
          timeline: [],
          previewPayload: null,
          previewStatus: { state: 'idle', message: 'Awaiting preview render' },
        }),
      setPreviewPayload: (payload) =>
        set({
          previewPayload: payload,
        }),
      setPreviewStatus: (status) =>
        set((state) => ({
          previewStatus: status,
          timeline: appendEvent(state.timeline, {
            id: crypto.randomUUID(),
            phase: 'status',
            message: status.message ?? '',
            timestamp: Date.now(),
            meta: { state: status.state, errors: 'errors' in status ? status.errors : undefined },
          }),
        })),
    }),
    {
      name: 'morphic-web:generation-state',
      partialize: (state) => ({
        request: state.request,
        blueprint: state.blueprint,
        template: state.template,
        delta: state.delta,
      }),
    },
  ),
)
