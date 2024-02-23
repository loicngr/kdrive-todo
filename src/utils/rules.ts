import { t } from 'boot/i18n'
import { DEFAULT_AUTO_SYNC } from 'stores/settings'

export const Rules = {
  required (val: string | undefined) {
    return !!val || t('required')
  },

  validFileNameOrFolder (val: string | undefined) {
    return (typeof val === 'string' && /^\w{1,255}$/.test(val)) || t('notValid')
  },

  validKDriveID (val: string | undefined) {
    return (typeof val === 'string' && /^[0-9]+$/.test(val)) || t('notValidID')
  },

  validAutoSyncDuration (val: number | undefined) {
    return (typeof val === 'number' && val >= DEFAULT_AUTO_SYNC) || t('notValidAutoSyncDuration')
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
