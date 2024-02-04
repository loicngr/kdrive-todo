<template>
  <q-page class="row items-center justify-evenly">
    <template v-if="ready">
      <suspense>
        <list-directory-contents />

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
import ListDirectoryContents from 'components/ListDirectoryContents.vue'
import { useMainStore } from 'stores/main'
import { storeToRefs } from 'pinia'
import { Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { ROUTER_SETTINGS_NAME } from 'src/constants'

const router = useRouter()
const mainStore = useMainStore()

const {
  ready,
  workingDir,
  api
} = storeToRefs(mainStore)

function dialogRedirectError () {
  Notify.create({
    message: 'Oops',
    caption: 'Your settings is wrong, or your folder doesn\'t not exist in your kDrive.',
    color: 'primary',
    textColor: 'white',
    timeout: 7000
  })

  router.push({
    name: ROUTER_SETTINGS_NAME,
  })
}

function reload () {
  mainStore.connect()

  if (typeof api?.value === 'undefined') {
    dialogRedirectError()
    return
  }

  api?.value?.isPathExist(workingDir.value)
    .then((e) => {
      ready.value = e
    })
    .finally(() => {
      if (!ready.value) {
        dialogRedirectError()
      }
    })
}

reload()
</script>
