import { Dialog } from 'quasar'
import {
  shallowRef,
  triggerRef,
} from 'vue'
import { t } from 'boot/i18n'

export function downloadBlob (blob: Blob, name: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  link.click()
}

export async function dialogConfirm (message: string, opt = {}) {
  return await new Promise((resolve, reject) => {
    Dialog.create({
      title: t('confirm'),
      message,
      cancel: true,
      persistent: true,
      ...opt,
    })
      .onOk(resolve)
      .onCancel(reject)
  })
}

export class HandleKeyboardListener {
  private readonly handledFunction: (e: KeyboardEvent) => void

  constructor (
    public context?: Record<string, {
      callback: (e: KeyboardEvent) => void
    }>,
  ) {
    this.handledFunction = this.handleListenerKeyDown.bind({
      context,
    })
  }

  private handleListenerKeyDown (event: KeyboardEvent) {
    const ctx = this.context

    if (typeof ctx === 'undefined') {
      return
    }

    const isControl = event.ctrlKey
    const key = event.key
    let ctxForKeys = ctx[key]

    if (isControl) {
      ctxForKeys = ctx[`Control-${key}`]
    }

    if (typeof ctxForKeys === 'undefined') {
      return
    }

    ctxForKeys.callback(event)
  }

  createListenerKeyDown (
    ref = window,
  ) {
    ref.addEventListener('keydown', this.handledFunction, true)
  }

  removeListenerKeyDown (
    ref = window,
  ) {
    ref.removeEventListener('keydown', this.handledFunction, true)
  }
}

export function randomTimeId (length = 10) {
  return Math.floor(Math.random() * Date.now()).toString(length)
}

export function createSignal <V = unknown> (
  value: V,
  options?: { equals: boolean },
) {
  const r = shallowRef(value)

  const get = (): V => r.value

  const set = (v: V) => {
    r.value = typeof v === 'function'
      ? v(r.value)
      : v

    if (options?.equals === false) triggerRef(r)
  }

  return [get, set]
}
