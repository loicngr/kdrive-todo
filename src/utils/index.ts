import { CustomFileStat } from 'src/interfaces/file'
import { dateTimeFormat } from 'src/utils/date'
import deburr from 'lodash/fp/deburr'
import { Dialog } from 'quasar'

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
