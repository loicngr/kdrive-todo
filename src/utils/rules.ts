import { t } from 'boot/i18n'

export const Rules = {
  required (val: string | undefined) {
    return typeof (val === 'string' && val.length > 0) || t('required')
  },

  validFileNameOrFolder (val: string | undefined) {
    return (typeof val === 'string' && /^\w{1,255}$/.test(val)) || t('notValid')
  },

  validKDriveID (val: string | undefined) {
    return (typeof val === 'string' && /^[0-9]+$/.test(val)) || t('notValidID')
  },

  validEmail (val: string | undefined) {
    return (
      typeof val === 'string' &&
      /(^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/.test(val)
    ) || t('notValidEmail')
  },

  string (val: string | undefined) {
    return typeof val === 'string' || t('required')
  },

  validNewString (val: string | undefined) {
    return (val?.length ?? 0) >= 1 || t('tooSmall')
  },

  validColor (val: string | undefined) {
    return (val?.length ?? 0) >= 4 || t('notValid')
  },
}
