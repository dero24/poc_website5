import { beforeAll } from 'vitest'
import { ensureMorphicKeyBridge, resetMorphicStorageCache } from './src/utils/keyStorage'

beforeAll(() => {
  ensureMorphicKeyBridge()
  resetMorphicStorageCache()
})
