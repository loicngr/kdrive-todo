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
import { useMainStore } from 'stores/main'
import { storeToRefs } from 'pinia'
import { Loading } from 'quasar'
import { useRouter } from 'vue-router'
import { ROUTER_SETTINGS_NAME } from 'src/constants'
import ListNotesView from 'components/ListNotesView.vue'
import { useSettingsStore } from 'stores/settings'
import { ref } from 'vue'

const router = useRouter()
const mainStore = useMainStore()
const settingsStore = useSettingsStore()

const localReady = ref(false)

const {
  ready,
  filePath,
  api,
} = storeToRefs(mainStore)

const {
  webdav,
} = storeToRefs(settingsStore)

async function dialogRedirectError () {
  const status = await api?.value?.createNotesFile(
    `
    The file "notes.json" doesn't exist in your kDrive.<br>
    All your notes will be saved in this file.<br>
    Would you like to create it?
    `,
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
    `
    The folder "${webdav.value.dir}" doesn't exist in your kDrive.<br>
    All your notes will be saved in this folder.<br>
    Would you like to create it?
    `,
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

async function reload () {
  Loading.show()
  await mainStore.connect()
  Loading.hide()

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
