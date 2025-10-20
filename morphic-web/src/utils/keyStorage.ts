export type MorphicStorageScope = 'local' | 'session'

const STORAGE_KEYS: Record<MorphicStorageScope, string> = {
  local: 'morphic-web:groq-key',
  session: 'morphic-web:groq-key:session',
}

const availabilityCache: Partial<Record<MorphicStorageScope, boolean>> = {}

export interface MorphicKeySnapshot {
  key: string
  scope: MorphicStorageScope | 'none'
  availableScopes: MorphicStorageScope[]
}

export interface MorphicStorageCapabilities {
  local: boolean
  session: boolean
}

function hasWindow(): boolean {
  return typeof window !== 'undefined'
}

function storageFor(scope: MorphicStorageScope): Storage | null {
  if (!hasWindow()) {
    availabilityCache[scope] = false
    return null
  }
  const storage = scope === 'local' ? window.localStorage : window.sessionStorage
  const available = storageAvailable(storage)
  availabilityCache[scope] = available
  return available && storage ? storage : null
}

function storageAvailable(storage: Storage | undefined): boolean {
  if (!storage) {
    return false
  }
  try {
    const testKey = '__morphic-test__'
    storage.setItem(testKey, '1')
    storage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

export function saveMorphicGroqKey(value: string, preferredScope: MorphicStorageScope = 'local'): MorphicStorageScope {
  const sanitized = value.trim()
  if (!sanitized) {
    clearMorphicGroqKey()
    return 'local'
  }
  const target = storageFor(preferredScope) ?? storageFor(preferredScope === 'local' ? 'session' : 'local')
  if (!target) {
    return 'local'
  }
  target.setItem(STORAGE_KEYS[target === storageFor('local') ? 'local' : 'session'], sanitized)
  if (target === storageFor('local')) {
    storageFor('session')?.removeItem(STORAGE_KEYS.session)
    return 'local'
  }
  storageFor('local')?.removeItem(STORAGE_KEYS.local)
  return 'session'
}

export function readMorphicGroqKey(): MorphicKeySnapshot {
  const localStorage = storageFor('local')
  const sessionStorage = storageFor('session')
  const localValue = localStorage?.getItem(STORAGE_KEYS.local) ?? ''
  if (localValue) {
    return {
      key: localValue,
      scope: 'local',
      availableScopes: collectAvailableScopes(localStorage, sessionStorage),
    }
  }
  const sessionValue = sessionStorage?.getItem(STORAGE_KEYS.session) ?? ''
  if (sessionValue) {
    return {
      key: sessionValue,
      scope: 'session',
      availableScopes: collectAvailableScopes(localStorage, sessionStorage),
    }
  }
  return {
    key: '',
    scope: 'none',
    availableScopes: collectAvailableScopes(localStorage, sessionStorage),
  }
}

function collectAvailableScopes(localStorage: Storage | null, sessionStorage: Storage | null): MorphicStorageScope[] {
  const scopes: MorphicStorageScope[] = []
  if (localStorage) {
    scopes.push('local')
  }
  if (sessionStorage) {
    scopes.push('session')
  }
  return scopes
}

export function clearMorphicGroqKey(): void {
  storageFor('local')?.removeItem(STORAGE_KEYS.local)
  storageFor('session')?.removeItem(STORAGE_KEYS.session)
}

export function getMorphicStorageCapabilities(): MorphicStorageCapabilities {
  return {
    local: Boolean(storageFor('local')),
    session: Boolean(storageFor('session')),
  }
}

export function resetMorphicStorageCache(): void {
  delete availabilityCache.local
  delete availabilityCache.session
}

export function ensureMorphicKeyBridge(): void {
  if (!hasWindow()) {
    return
  }
  if (!window.setMorphicGroqKey) {
    window.setMorphicGroqKey = (value: string, scope: MorphicStorageScope = 'local') => {
      return saveMorphicGroqKey(value, scope)
    }
  }
  if (!window.getMorphicGroqKey) {
    window.getMorphicGroqKey = () => readMorphicGroqKey().key
  }
  if (!window.clearMorphicGroqKey) {
    window.clearMorphicGroqKey = () => clearMorphicGroqKey()
  }
}

declare global {
  interface Window {
    setMorphicGroqKey?: (value: string, scope?: MorphicStorageScope) => MorphicStorageScope
    getMorphicGroqKey?: () => string
    clearMorphicGroqKey?: () => void
  }
}
