import { date } from 'quasar'

const {
  formatDate,
} = date

export function dateFormat (d: string) {
  return formatDate(d, 'YYYY/MM/DD')
}

export function dateTimeFormat (d: string) {
  return formatDate(d, 'YYYY/MM/DD HH:mm:ss')
}
