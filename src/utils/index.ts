import { CustomFileStat } from 'src/interfaces/file'
import { dateTimeFormat } from 'src/utils/date'
import deburr from 'lodash/fp/deburr'
import { Dialog } from 'quasar'
import type { FileStat } from 'webdav'

export function generateIdFromFile(item: CustomFileStat): string {
  const date = dateTimeFormat(item.lastmod).replaceAll('/', '_')
  const filename = item.basename
  const content = deburr(filename.concat(date)).replaceAll(' ', '_')

  return btoa(content)
}

export function downloadBlob(blob: Blob, name: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  link.click()
}

export function dialogConfirm (message: string) {
  return new Promise((resolve, reject) => {
    Dialog.create({
      title: 'Confirm',
      message,
      cancel: true,
      persistent: true
    })
      .onOk(resolve)
      .onCancel(reject)
  })
}

export function extractFilename (filename: string) {
  const lastIndexOfPoint = filename.lastIndexOf('.')

  return lastIndexOfPoint === -1
    ? filename
    : filename.slice(0, lastIndexOfPoint)
}

export function directoryContentItemIsTodo (item: FileStat) {
  return item.type === 'file' && item.basename.endsWith('.json')
}

export function getDirectoryContentItemName (item: CustomFileStat) {
  return item.isFile
    ? extractFilename(item.basename)
    : item.basename
}

export class HandleKeyboardListener {
  private readonly handledFunction: (e: KeyboardEvent) => void

  constructor(
    public context?: {
      [key: string]: {
        callback: (e: KeyboardEvent) => void
      }
    },
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
