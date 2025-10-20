import type { DeltaGenerationResult } from './types'

export interface AutoRepairResult {
  code: string
  attempts: number
  errors: string[]
}

interface AutoRepairOptions {
  maxAttempts?: number
  validators?: Array<(code: string) => Promise<void>>
  fixers?: Array<(code: string, error: string) => Promise<string>>
}

const DEFAULT_MAX_ATTEMPTS = 2

export class AutoRepairPipeline {
  private maxAttempts: number
  private validators: Array<(code: string) => Promise<void>>
  private fixers: Array<(code: string, error: string) => Promise<string>>

  constructor({ maxAttempts = DEFAULT_MAX_ATTEMPTS, validators = [], fixers = [] }: AutoRepairOptions = {}) {
    this.maxAttempts = maxAttempts
    this.validators = validators
    this.fixers = fixers
  }

  async run(result: DeltaGenerationResult): Promise<AutoRepairResult> {
    let currentCode = result.code
    const errors: string[] = []
    for (let attempt = 0; attempt <= this.maxAttempts; attempt += 1) {
      try {
        await this.validate(currentCode)
        return { code: currentCode, attempts: attempt, errors }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(message)
        if (attempt === this.maxAttempts) {
          break
        }
        currentCode = await this.applyFixers(currentCode, message)
      }
    }
    return { code: currentCode, attempts: this.maxAttempts, errors }
  }

  private async validate(code: string): Promise<void> {
    for (const validator of this.validators) {
      await validator(code)
    }
  }

  private async applyFixers(code: string, error: string): Promise<string> {
    let current = code
    for (const fixer of this.fixers) {
      current = await fixer(current, error)
    }
    return current
  }
}
