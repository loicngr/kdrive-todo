<template>
  <div class="col column">
    <div class="row justify-center">
      <q-card
        class="bg-card col-md-6 col-12"
        style="max-width: 900px"
        flat
      >
        <q-card-section class="row justify-between">
          <div class="text-h4">
            {{ $t('settings').slice(0, -1) }}<span @click="testGooglePlayConsole">s</span>
          </div>

          <div>
            <language-switcher
              v-model="language"
            />
          </div>
        </q-card-section>

        <q-separator
          spaced
        />

        <q-card-section>
          <q-form
            ref="formRef"
            class="row q-col-gutter-sm"
            @submit="onSubmit"
          >
            <hidden-input
              v-model="webDAV.id"
              :label="`kDrive ${$t('id')} *`"
              :rules="[$rules.required, $rules.validKDriveID]"
              lazy-rules
              class="col-12 col-md-6 error-white"
              input-class="text-white"
              filled
              maxlength="10"
              label-color="white"
              color="white"
              type="text"
            />

            <q-input
              v-model.trim="webDAV.dir"
              :label="`kDrive ${$t('folder').toLowerCase()} *`"
              :rules="[$rules.required, $rules.string, $rules.validFileNameOrFolder]"
              lazy-rules
              class="col-12 col-md-6 error-white"
              input-class="text-white"
              filled
              maxlength="30"
              label-color="white"
              color="white"
              type="text"
            >
              <template #append>
                <q-icon
                  name="fa fa-circle-info"
                  color="white"
                >
                  <q-tooltip>
                    For security reasons, you need to create a folder at the root of your kDrive, <br> which the application will point to in order to manage your files.
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <hidden-input
              v-model.trim="webDAV.username"
              :label="`kDrive ${$t('email').toLowerCase()} *`"
              :rules="[
                $rules.required,
                $rules.string
              ]"
              lazy-rules
              class="col-12 col-md-6 error-white"
              input-class="text-white"
              filled
              :hide="false"
              default-type="text"
              maxlength="255"
              label-color="white"
              color="white"
              type="text"
            />

            <hidden-input
              v-model.trim="webDAV.password"
              :label="`kDrive ${$t('password').toLowerCase()} *`"
              :rules="[$rules.required, $rules.string]"
              lazy-rules
              class="col-12 col-md-6 error-white"
              input-class="text-white"
              filled
              maxlength="255"
              label-color="white"
              color="white"
              type="password"
            >
              <template #append-after>
                <q-icon
                  name="fa fa-circle-info"
                  color="white"
                >
                  <q-tooltip>
                    If two-step validation is not enabled, use the password for your Infomaniak account. <br>
                    If two-step validation is enabled, generate an application password here: https://manager.infomaniak.com/v3/profile/application-password.
                  </q-tooltip>
                </q-icon>
              </template>
            </hidden-input>

            <q-input
              v-model.number="autoSync"
              type="number"
              :label="`${$t('autoSyncInterval')} *`"
              :rules="[$rules.required, $rules.validAutoSyncDuration]"
              lazy-rules
              class="col-12 col-md-6 error-white"
              input-class="text-white"
              filled
              label-color="white"
              color="white"
              step="1"
              :suffix="$t('minutes').toLowerCase()"
            >
              <template #append>
                <q-icon
                  name="fa fa-circle-info"
                  color="white"
                >
                  <q-tooltip>
                    {{ $t('autoSyncIntervalInfo') }}
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </q-form>
        </q-card-section>
      </q-card>
    </div>

    <div
      class="row justify-center items-center"
      :class="{
        'q-mt-md': $q.screen.lt.md
      }"
    >
      <q-card
        class="bg-card col-md-6 col-12"
        flat
        style="max-width: 900px"
      >
        <q-card-section
          class="row justify-around"
        >
          <q-btn
            icon="fa fa-info"
            dense
            size="sm"
            flat
            class="col-auto"
            :label="$t('infomaniakConnectViaWebDAV')"
            @click="openURL('https://www.infomaniak.com/en/support/faq/2409/connect-to-kdrive-via-webdav')"
          />

          <q-btn
            icon="fa fa-question"
            dense
            size="sm"
            flat
            class="col-auto"
            :label="$t('needSupport')"
            @click="openURL('https://www.github.com/loicngr/kdrive-notes')"
          />

          <q-btn
            icon="fa-brands fa-twitter"
            dense
            size="sm"
            flat
            class="col-auto"
            label="X / Twitter"
            @click="openURL('https://x.com/Zaekof')"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>

  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
  >
    <save-button
      @click="onSubmit()"
    />
  </q-page-sticky>
</template>

<script setup lang="ts">
import {
  DEFAULT_AUTO_SYNC,
  type DEFAULT_WEBDAV_STATE,
  useSettingsStore,
} from 'stores/settings'
import {
  nextTick,
  onBeforeMount,
  ref,
} from 'vue'
import {
  Notify,
  openURL,
  QForm,
  useQuasar,
} from 'quasar'
import { storeToRefs } from 'pinia'
import cloneDeep from 'lodash/fp/cloneDeep'
import { useKeyboardListener } from 'src/composables/keyboardListener'
import SaveButton from 'components/SaveButton.vue'
import HiddenInput from 'components/HiddenInput.vue'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from 'components/languageSwitcher.vue'

const settingsStore = useSettingsStore()
const $q = useQuasar()
const {
  t,
} = useI18n()

const {
  webdav,
  language: storeLanguage,
  autoSync: storeAutoSync,
} = storeToRefs(settingsStore)

const webDAV = ref<typeof DEFAULT_WEBDAV_STATE>(cloneDeep(webdav.value))
const language = ref<string>(cloneDeep(storeLanguage.value))
const autoSync = ref<number>(cloneDeep(storeAutoSync.value))

const formRef = ref<InstanceType<typeof QForm> | null>(null)

useKeyboardListener({
  'Control-s': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void onSubmit()
    },
  },
})

async function onSubmit () {
  const isValid = (await formRef.value?.validate()) ?? true

  if (!isValid) {
    Notify.create({
      message: t('settingsNotSave'),
      caption: t('settingsNotSaveCaption'),
      color: 'primary',
      textColor: 'white',
      timeout: 2000,
    })

    return
  }

  webdav.value = cloneDeep(webDAV.value)
  storeLanguage.value = cloneDeep(language.value)

  if (autoSync.value < DEFAULT_AUTO_SYNC) {
    autoSync.value = cloneDeep(DEFAULT_AUTO_SYNC)
  }

  storeAutoSync.value = cloneDeep(autoSync.value)

  void nextTick(() => {
    Notify.create({
      message: t('settingsSave'),
      color: 'primary',
      textColor: 'white',
      timeout: 2000,
    })
  })
}

function testGooglePlayConsole () {
  $q.dialog({
    title: `WebDAV server`,
    message: `Custom WebDAV server for google test`,
    prompt: {
      model: cloneDeep(webDAV.value.customServer ?? ''),
      type: 'text',
      required: true,
    },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    const v: string = (data ?? '').trim()

    if (v.startsWith('https://')) {
      webDAV.value.customServer = v
    } else {
      webDAV.value.customServer = undefined
    }
  })
}

onBeforeMount(async () => {
  webDAV.value = cloneDeep(webdav.value)
  language.value = cloneDeep(storeLanguage.value)
  autoSync.value = cloneDeep(storeAutoSync.value)
})
</script>

<style scoped>

</style>
