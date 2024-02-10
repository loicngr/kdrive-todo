import { boot } from 'quasar/wrappers'
import {
  type Composer,
  createI18n,
  type I18n,
} from 'vue-i18n'

import messages from 'src/i18n'

export type MessageLanguages = keyof typeof messages
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages['en-US']

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

let i: I18n
let t: Composer['t']

export default boot(({
  app,
}) => {
  i = createI18n({
    locale: 'en-US',
    legacy: false,
    messages,
  })

  t = i.global.t

  app.use(i)
})

export {
  t,
}
