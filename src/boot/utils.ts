import { boot } from 'quasar/wrappers'
import { Rules } from 'src/utils/rules'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $rules: typeof Rules
  }
}

export default boot(({
 app
}) => {
  app.config.globalProperties.$rules = Rules
})
