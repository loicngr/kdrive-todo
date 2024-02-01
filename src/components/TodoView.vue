<template>
  <template v-if="workingFileContent.length > 0">
    {{ workingFileContent[0].title }}
  </template>
  <template v-else>
    No data
  </template>

  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
  >
    <q-fab
      icon="fa fa-bars"
      direction="up"
      color="accent"
    >
      <q-fab-action
        color="purple-6"
        icon="fa fa-home"
        @click="goToHome"
      />
      <q-fab-action
        color="purple-6"
        icon="fa fa-add"
        @click="addTodo"
      />
    </q-fab>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { useMainStore } from 'stores/main'
import {
  ref,
  watch
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
 DEFAULT_TODO,
  ROUTER_INDEX_NAME
} from 'src/constants'
import { FileData } from 'src/interfaces/file'
import { Loading } from 'quasar'
import { dialogConfirm } from 'src/utils'

const mainStore = useMainStore()
const router = useRouter()

const {
  workingFile,
  workingFileContent
} = storeToRefs(mainStore)

const API = mainStore.api
const file = ref<string>('')

let promiseWait: CallableFunction | undefined
let attemptFileGetContents = 0

async function getFileContents () {
  if (attemptFileGetContents > 1) {
    console.error("Can't create default template in file.")
    goToHome()
    return
  }

  const fileContent = await API.getFileContents(file.value, 'text') as string | undefined

  if (typeof promiseWait === 'function') {
    promiseWait()
  }

  const parsedJson = (JSON.parse((fileContent ?? '') || '{}') as { todos?: FileData[] })?.todos

  if (typeof parsedJson === 'undefined') {
    try {
      const defaultTemplate = JSON.stringify(DEFAULT_TODO)
      console.log('default template is:', defaultTemplate)
      await dialogConfirm('Your file is empty, clear file content and add default template ?')

      Loading.show()
      await API.writeInFile(file.value, defaultTemplate)
      Loading.hide()
    } catch (e) {}

    attemptFileGetContents++
    void getFileContents()
    return
  }

  workingFileContent.value = parsedJson
  attemptFileGetContents = 0
}

function addTodo() {
  // TODO
}

function ensureFileExist() {
  if (typeof workingFile?.value === 'undefined') {
    goToHome()
    return
  }
}

function goToHome () {
  router.replace({
    name: ROUTER_INDEX_NAME,
  }).finally(() => {
    mainStore.closeFile()
  })
}

watch(
  () => workingFile?.value,
  async () => {
    ensureFileExist()
    file.value = workingFile.value as string
    await getFileContents()
  }
)

await new Promise((resolve) => {
  promiseWait = resolve

  ensureFileExist()
  file.value = workingFile.value as string
  void getFileContents()
})
</script>
