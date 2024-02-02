<template>
  <q-page class="row items-center justify-evenly">
    <template v-if="ready">
      <suspense>
        <list-directory-contents />

        <template #fallback>
          <q-spinner-dots
            size="lg"
            color="purple-6"
          />
        </template>
      </suspense>
    </template>
    <template v-else>
      <q-spinner-dots
        size="lg"
        color="purple-6"
      />

      <q-page-sticky
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="fa fa-refresh"
          color="purple-6"
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

const mainStore = useMainStore()
mainStore.connect()

const {
  ready,
  workingDir,
} = storeToRefs(mainStore)

function reload () {
  mainStore.api.isPathExist(workingDir.value)
    .then((e) => {
      ready.value = e
    })
    .finally(() => {
      if (!ready.value) {
        Notify.create({
          message: 'Default folder not found',
          caption: `Please, create folder with name "${process.env.VUE_KDRIVE_WORKING_DIR}" in your kDrive.`,
          color: 'purple-7',
          textColor: 'white',
          timeout: 7000
        })
      }
    })
}

reload()
</script>
