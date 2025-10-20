import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getGenerationOrchestrator } from '../../src/services/generation/orchestratorInstance'
import { ensureMorphicKeyBridge, resetMorphicStorageCache } from '../../src/utils/keyStorage'
import { useGenerationStore } from '../../src/stores/generationStore'
import { db } from '../../src/services/persistence/database'
import { readBlueprintPlan } from '../../src/services/persistence/repository'

declare global {
  interface Window {
    localStorage: Storage
    sessionStorage: Storage
  }
}

const blueprintResponse = {
  choices: [
    {
      message: {
        role: 'assistant',
        content: JSON.stringify({
          summary: 'Dashboard app',
          components: ['header', 'chart'],
          dataFlows: ['user -> dashboard'],
          aiFeatures: ['recommendations'],
          risks: ['latency'],
          complexityScore: 0.4,
        }),
      },
    },
  ],
}

const deltaResponse = {
  choices: [
    {
      message: {
        role: 'assistant',
        content: `exports.default = function Generated(){
  const key = typeof window.getMorphicGroqKey === 'function' ? window.getMorphicGroqKey() : '';
  return React.createElement('div', null, key ? 'Preview ready' : 'Missing key');
};`,
      },
    },
  ],
  usage: {
    total_tokens: 512,
  },
}

const createStorageMock = () => {
  const store = new Map<string, string>()
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => store.clear()),
    key: vi.fn(() => null),
    length: 0,
  } as unknown as Storage
}

beforeEach(async () => {
  Object.defineProperty(window, 'localStorage', {
    value: createStorageMock(),
    configurable: true,
  })
  Object.defineProperty(window, 'sessionStorage', {
    value: createStorageMock(),
    configurable: true,
  })
  ensureMorphicKeyBridge()
  resetMorphicStorageCache()
  useGenerationStore.getState().reset()
  vi.restoreAllMocks()
  await db.delete()
  await db.open()
})

describe('GenerationOrchestrator integration', () => {
  it('generates blueprint and delta, populating preview payload and timeline', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => blueprintResponse } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => deltaResponse } as Response)

    window.setMorphicGroqKey?.('test-key')

    const orchestrator = getGenerationOrchestrator()
    const result = await orchestrator.generate({
      idea: 'Retail analytics assistant',
      modelId: 'llama-3.1-70b-versatile',
      tone: 'balanced',
    })

    expect(result).not.toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(2)

    const state = useGenerationStore.getState()
    expect(state.phase).toBe('completed')
    expect(state.previewPayload?.code).toContain('Preview ready')
    expect(state.timeline.length).toBeGreaterThanOrEqual(4)

    const cachedPlan = await readBlueprintPlan(result!.blueprint.promptHash)
    expect(cachedPlan?.summary).toBe('Dashboard app')
  })
})
