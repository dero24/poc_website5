import type { BlueprintPlan, DeltaGenerationResult } from '../generation/types'
import { db } from './database'

const BLUEPRINT_STORAGE_PREFIX = 'morphic-web:blueprint:'
const DELTA_STORAGE_PREFIX = 'morphic-web:delta:'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    window.localStorage.setItem('__morphic-test__', '1')
    window.localStorage.removeItem('__morphic-test__')
    return window.localStorage
  } catch {
    return null
  }
}

export async function saveBlueprintPlan(plan: BlueprintPlan): Promise<void> {
  try {
    await db.blueprintPlans.put(plan)
  } catch (error) {
    console.warn('Dexie blueprint save failed, falling back to LocalStorage', error)
    storeBlueprintFallback(plan)
    return
  }
  storeBlueprintFallback(plan)
}

export async function readBlueprintPlan(promptHash: string): Promise<BlueprintPlan | undefined> {
  try {
    const results = await db.blueprintPlans.where('promptHash').equals(promptHash).toArray()
    if (results.length) {
      return results.reduce((latest, current) => (current.createdAt > latest.createdAt ? current : latest))
    }
  } catch (error) {
    console.warn('Dexie blueprint read failed, using LocalStorage fallback', error)
  }
  return readBlueprintFallback(promptHash)
}

export async function saveDeltaResult(promptHash: string, delta: DeltaGenerationResult): Promise<void> {
  try {
    await db.deltaCache.put({
      promptHash,
      code: delta.code,
      tokenUsage: delta.tokenUsage,
      autoRepairAttempts: delta.autoRepairAttempts,
      createdAt: Date.now(),
    })
  } catch (error) {
    console.warn('Dexie delta save failed, falling back to LocalStorage', error)
    storeDeltaFallback(promptHash, delta)
    return
  }
  storeDeltaFallback(promptHash, delta)
}

export async function readDeltaResult(promptHash: string): Promise<DeltaGenerationResult | undefined> {
  try {
    const record = await db.deltaCache.get(promptHash)
    if (record) {
      return {
        code: record.code,
        tokenUsage: record.tokenUsage,
        autoRepairAttempts: record.autoRepairAttempts,
      }
    }
  } catch (error) {
    console.warn('Dexie delta read failed, using LocalStorage fallback', error)
  }
  return readDeltaFallback(promptHash)
}

function storeBlueprintFallback(plan: BlueprintPlan) {
  const storage = getStorage()
  if (!storage) {
    return
  }
  storage.setItem(`${BLUEPRINT_STORAGE_PREFIX}${plan.promptHash}`, JSON.stringify(plan))
}

function readBlueprintFallback(promptHash: string): BlueprintPlan | undefined {
  const storage = getStorage()
  if (!storage) {
    return undefined
  }
  const raw = storage.getItem(`${BLUEPRINT_STORAGE_PREFIX}${promptHash}`)
  if (!raw) {
    return undefined
  }
  try {
    const parsed = JSON.parse(raw) as BlueprintPlan
    return parsed
  } catch {
    storage.removeItem(`${BLUEPRINT_STORAGE_PREFIX}${promptHash}`)
    return undefined
  }
}

function storeDeltaFallback(promptHash: string, delta: DeltaGenerationResult) {
  const storage = getStorage()
  if (!storage) {
    return
  }
  storage.setItem(
    `${DELTA_STORAGE_PREFIX}${promptHash}`,
    JSON.stringify({
      code: delta.code,
      tokenUsage: delta.tokenUsage,
      autoRepairAttempts: delta.autoRepairAttempts,
      createdAt: Date.now(),
    }),
  )
}

function readDeltaFallback(promptHash: string): DeltaGenerationResult | undefined {
  const storage = getStorage()
  if (!storage) {
    return undefined
  }
  const raw = storage.getItem(`${DELTA_STORAGE_PREFIX}${promptHash}`)
  if (!raw) {
    return undefined
  }
  try {
    const parsed = JSON.parse(raw) as DeltaGenerationResult
    return parsed
  } catch {
    storage.removeItem(`${DELTA_STORAGE_PREFIX}${promptHash}`)
    return undefined
  }
}
