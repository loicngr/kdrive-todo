import { date } from 'quasar'
import isNaN from 'lodash/fp/isNaN'

const {
  formatDate,
} = date

export function parseIso (d: string) {
  const [
    year = 0,
    month = 0,
    date = 0,
    hours = 0,
    minutes = 0,
    seconds = 0,
    ms = 0,
  ] = d.split(/[^0-9]/).map((i) => isNaN(i)
    ? 0
    : parseInt(i))

  const newDate = new Date(year, month - 1, date, hours, minutes, seconds, ms)
  return newDate.toString() !== 'Invalid Date'
    ? newDate
    : d
}

export function dateFormat (d: string) {
  return formatDate(parseIso(d), 'YYYY/MM/DD')
}

export function dateTimeFormat (d: string) {
  return formatDate(parseIso(d), 'YYYY/MM/DD HH:mm:ss')
}

export function dateTimeShortFormat (d: string) {
  return formatDate(parseIso(d), 'YYYY/MM/DD HH:mm')
}
