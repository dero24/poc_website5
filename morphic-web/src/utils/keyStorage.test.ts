import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearMorphicGroqKey, ensureMorphicKeyBridge, getMorphicStorageCapabilities, readMorphicGroqKey, saveMorphicGroqKey } from './keyStorage'

declare global {
  interface Window {
    localStorage: Storage
    sessionStorage: Storage
  }
}

describe('keyStorage', () => {
  beforeEach(() => {
    const storageMock = () => {
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

    Object.defineProperty(window, 'localStorage', {
      value: storageMock(),
      writable: true,
    })
    Object.defineProperty(window, 'sessionStorage', {
      value: storageMock(),
      writable: true,
    })
  })

  afterEach(() => {
    clearMorphicGroqKey()
    vi.restoreAllMocks()
  })

  it('saves and reads key with preferred scope', () => {
    const scope = saveMorphicGroqKey('abc123', 'local')
    expect(scope).toBe('local')
    const snapshot = readMorphicGroqKey()
    expect(snapshot.key).toBe('abc123')
    expect(snapshot.scope).toBe('local')
  })

  it('falls back to alternate storage when preferred unavailable', () => {
    Object.defineProperty(window, 'localStorage', {
      value: undefined,
    })
    const scope = saveMorphicGroqKey('def456', 'local')
    expect(scope).toBe('session')
    const snapshot = readMorphicGroqKey()
    expect(snapshot.key).toBe('def456')
    expect(snapshot.scope).toBe('session')
  })

  it('clears keys across both scopes', () => {
    saveMorphicGroqKey('ghi789', 'local')
    saveMorphicGroqKey('session-key', 'session')
    clearMorphicGroqKey()
    const snapshot = readMorphicGroqKey()
    expect(snapshot.key).toBe('')
    expect(snapshot.scope).toBe('none')
  })

  it('exposes window helpers via ensureMorphicKeyBridge', () => {
    ensureMorphicKeyBridge()
    const newScope = window.setMorphicGroqKey?.('bridged')
    expect(newScope).toBe('local')
    expect(window.getMorphicGroqKey?.()).toBe('bridged')
    window.clearMorphicGroqKey?.()
    expect(window.getMorphicGroqKey?.()).toBe('')
  })

  it('reports available capabilities', () => {
    const caps = getMorphicStorageCapabilities()
    expect(caps.local).toBe(true)
    expect(caps.session).toBe(true)
  })
})
