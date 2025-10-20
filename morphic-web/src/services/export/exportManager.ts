import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { PreviewPayload } from '../../stores/generationStore'

export interface ExportOptions {
  fileName?: string
  includeManifest?: boolean
}

export interface MorphicManifest {
  componentCode: string
  templateId?: string
  blueprintId?: string
  metadata?: Record<string, unknown>
  exportedAt: number
}

export class ExportManager {
  async exportPreview(payload: PreviewPayload | null, options: ExportOptions = {}): Promise<void> {
    if (!payload) {
      throw new Error('No preview payload available to export')
    }
    const fileName = options.fileName ?? `morphic-export-${payload.createdAt}`
    const zip = new JSZip()
    zip.file('component.js', payload.code)
    if (options.includeManifest !== false) {
      const manifest: MorphicManifest = {
        componentCode: payload.code,
        templateId: payload.templateId,
        blueprintId: payload.blueprintId,
        metadata: payload.metadata,
        exportedAt: Date.now(),
      }
      zip.file('manifest.json', JSON.stringify(manifest, null, 2))
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    saveAs(blob, `${fileName}.zip`)
  }
}

export const exportManager = new ExportManager()
