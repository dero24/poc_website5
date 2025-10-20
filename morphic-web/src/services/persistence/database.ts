import Dexie, { type Table } from 'dexie'
import type { BlueprintPlan } from '../generation/types'

export interface StoredGeneratedApp {
  id: string
  blueprintId: string
  deltaPrompt: string
  sanitizedCode: string
  runtimeManifest: string
  createdAt: number
}

export interface StoredDeltaCache {
  promptHash: string
  code: string
  tokenUsage: number
  autoRepairAttempts: number
  createdAt: number
}

export interface StoredAnalyticsEvent {
  id: string
  appId: string
  generationMs: number
  tokenSavingsPercent: number
  autoRepairInvoked: boolean
  recordedAt: number
}

export interface StoredExportArtifact {
  id: string
  appId: string
  exportType: string
  zipBlob: ArrayBuffer
  exportedAt: number
}

export interface StoredShareLinkManifest {
  id: string
  appId: string
  shareCode: string
  createdAt: number
  payload: string
}

export interface StoredCollaborationDraft {
  id: string
  appId: string
  sharedState: string
  updatedAt: number
}

export class MorphicDatabase extends Dexie {
  blueprintPlans!: Table<BlueprintPlan>
  generatedApps!: Table<StoredGeneratedApp>
  deltaCache!: Table<StoredDeltaCache>
  analyticsEvents!: Table<StoredAnalyticsEvent>
  exportArtifacts!: Table<StoredExportArtifact>
  shareLinkManifests!: Table<StoredShareLinkManifest>
  collaborationDrafts!: Table<StoredCollaborationDraft>

  constructor() {
    super('MorphicWebDB')
    this.version(1).stores({
      blueprintPlans: 'id, promptHash, createdAt',
      generatedApps: 'id, blueprintId, createdAt',
      deltaCache: 'promptHash, createdAt',
      analyticsEvents: 'id, appId, recordedAt',
      exportArtifacts: 'id, appId, exportedAt',
      shareLinkManifests: 'id, appId, shareCode',
      collaborationDrafts: 'id, appId, updatedAt',
    })
  }
}

export const db = new MorphicDatabase()
