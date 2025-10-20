import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import type { MorphicKeySnapshot, MorphicStorageScope } from '../../utils/keyStorage'
import { getMorphicStorageCapabilities } from '../../utils/keyStorage'

interface ApiKeyModalProps {
  open: boolean
  snapshot: MorphicKeySnapshot
  onSubmit: (value: string, scope: MorphicStorageScope) => void
  onClose: () => void
}

const scopeLabels: Record<MorphicStorageScope, string> = {
  local: 'Remember on this device',
  session: 'Session only (clear on close)',
}

export function ApiKeyModal({ open, snapshot, onSubmit, onClose }: ApiKeyModalProps) {
  const [value, setValue] = useState(snapshot.key)
  const [scope, setScope] = useState<MorphicStorageScope>(snapshot.scope === 'session' ? 'session' : 'local')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const capabilities = getMorphicStorageCapabilities()

  useEffect(() => {
    setValue(snapshot.key)
    if (snapshot.scope === 'session' || snapshot.scope === 'local') {
      setScope(snapshot.scope)
    }
  }, [snapshot])

  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => {
        textareaRef.current?.focus()
      }, 30)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [open])

  const availableScopes: MorphicStorageScope[] = snapshot.availableScopes.length
    ? snapshot.availableScopes
    : (Object.entries(capabilities)
        .filter(([, supported]) => supported)
        .map(([key]) => key as MorphicStorageScope) as MorphicStorageScope[])

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-10">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-3"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-[0_0_40px_rgba(76,29,149,0.45)] backdrop-blur">
                <div className="flex flex-col gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.38em] text-slate-300/80">Welcome to Morphic</p>
                    <Dialog.Title className="mt-2 text-[1.85rem] font-semibold text-white">
                      Add your Groq API key to unlock generation
                    </Dialog.Title>
                    <p className="mt-3 text-sm text-slate-300/85">
                      Keys never leave your browser. Choose how long Morphic should remember it, and you can clear or replace it at any time.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-medium uppercase tracking-[0.32em] text-slate-300/70">Groq key</label>
                    <textarea
                      ref={textareaRef}
                      value={value}
                      onChange={(event) => setValue(event.target.value)}
                      className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-100 shadow-inner shadow-black/25 backdrop-blur focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                      placeholder="gsk_..."
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-medium uppercase tracking-[0.32em] text-slate-300/70">Remember my key</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(['local', 'session'] as MorphicStorageScope[]).map((option) => {
                        const disabled = !availableScopes.includes(option)
                        const active = scope === option
                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={disabled}
                            onClick={() => setScope(option)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-300/70 ${
                              active
                                ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100 shadow-[0_0_28px_rgba(14,165,233,0.35)]'
                                : 'border-white/10 bg-white/3 text-slate-200/80 hover:border-cyan-400/30 hover:bg-cyan-500/10'
                            } ${disabled ? 'cursor-not-allowed opacity-50 hover:border-white/10 hover:bg-white/3' : ''}`}
                          >
                            <p className="text-sm font-semibold">{scopeLabels[option]}</p>
                            <p className="mt-1 text-xs text-slate-300/80">
                              {option === 'local' ? 'Best for primary devices' : 'Use on shared computers'}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
                    >
                      Maybe later
                    </button>
                    <button
                      type="button"
                      onClick={() => onSubmit(value, scope)}
                      className="rounded-full border border-cyan-400/40 bg-cyan-500/20 px-6 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_32px_rgba(14,165,233,0.38)] transition hover:bg-cyan-500/30 disabled:opacity-40"
                      disabled={!value.trim()}
                    >
                      Save key & continue
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
