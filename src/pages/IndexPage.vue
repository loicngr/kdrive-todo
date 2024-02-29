<template>
  <q-page
    class="row"
    :class="{
      'items-center justify-evenly': !localReady,
    }"
  >
    <template v-if="localReady">
      <suspense>
        <list-notes-view />

        <template #fallback>
          <q-spinner-dots
            size="lg"
            color="primary"
          />
        </template>
      </suspense>
    </template>
    <template v-else>
      <q-spinner-dots
        size="lg"
        color="primary"
      />

      <q-page-sticky
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="fa fa-refresh"
          color="primary"
          @click="reload()"
        >
          <q-tooltip>Reload app</q-tooltip>
        </q-btn>
      </q-page-sticky>
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import {
  useMainStore, WEBDAV_NOTES_PATH,
} from 'stores/main'
import { storeToRefs } from 'pinia'
import {
  Loading,
  Notify,
} from 'quasar'
import { useRouter } from 'vue-router'
import { ROUTER_SETTINGS_NAME } from 'src/constants'
import ListNotesView from 'components/ListNotesView.vue'
import { useSettingsStore } from 'stores/settings'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import cloneDeep from 'lodash/fp/cloneDeep'

const router = useRouter()
const mainStore = useMainStore()
const settingsStore = useSettingsStore()
const {
  t,
} = useI18n()

const localReady = ref(false)

const {
  ready,
  filePath,
  firstLaunch,
  api,
} = storeToRefs(mainStore)

const {
  webdav,
} = storeToRefs(settingsStore)

async function dialogRedirectError () {
  const status = await api?.value?.createNotesFile(
    t('dialogRedirectError'),
    reload,
  ) ?? false

  if (!status) {
    void router.push({
      name: ROUTER_SETTINGS_NAME,
    })
  }
}

async function dialogRedirectErrorFolder () {
  let status = (await api?.value?.createNotesFolder(
    t('dialogRedirectErrorFolder', {
      dir: webdav.value.dir,
    }),
  )) ?? false

  if (!status) {
    void router.push({
      name: ROUTER_SETTINGS_NAME,
    })

    return
  }

  status = (await api?.value?._createNotesFile()) ?? false

  if (status) {
    void reload()
  }
}

async function dialogRedirectErrorSettings () {
  if (!firstLaunch.value) {
    Notify.create({
      message: t('dialogRedirectErrorSettings'),
      type: 'negative',
      timeout: 7000,
    })
  } else {
    Notify.create({
      message: t('dialogRedirectErrorSettingsFirstTime'),
      timeout: 6000,
    })
  }

  firstLaunch.value = false
  void router.push({
    name: ROUTER_SETTINGS_NAME,
  })
}

async function reload () {
  Loading.show()
  mainStore.filePath = cloneDeep(WEBDAV_NOTES_PATH)
  await mainStore.connect()
  Loading.hide()

  if (typeof api?.value?.client === 'undefined') {
    void dialogRedirectErrorSettings()
    return
  }

  if (!ready.value) {
    void dialogRedirectErrorFolder()
    return
  }

  void api?.value?.isPathExist(filePath.value)
    .then((e) => {
      localReady.value = e
    })
    .finally(() => {
      if (!localReady.value) {
        void dialogRedirectError()
      }
    })
}

void reload()
</script>
