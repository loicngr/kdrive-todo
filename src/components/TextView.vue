<template>
  <q-card
    ref="cardRef"
    class="col-md-6 col-12"
    flat
    style="max-width: 1200px; min-height: 70vh"
  >
    <q-card-section>
      <q-editor
        v-model="workingFileContent"
        :height="editorHeight"
        dark
        min-height="5rem"
      />
    </q-card-section>
  </q-card>

  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
  >
    <save-button
      v-if="hasDiff"
      class="q-mr-md"
      @click="onSave()"
    />

    <reload-button
      @click="refresh()"
    >
      <template #tooltip>
        <q-tooltip
          self="top left"
          anchor="top left"
        >
          Reload file
        </q-tooltip>
      </template>
    </reload-button>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { useMainStore } from 'stores/main'
import {
  computed,
  onBeforeUnmount,
  ref,
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { ROUTER_INDEX_NAME } from 'src/constants'
import {
  Loading,
  Notify, QCard,
} from 'quasar'
import { dialogConfirm } from 'src/utils'
import cloneDeep from 'lodash/fp/cloneDeep'
import isEqual from 'lodash/fp/isEqual'
import { useKeyboardListener } from 'src/composables/keyboardListener'
import SaveButton from 'components/SaveButton.vue'
import ReloadButton from 'components/ReloadButton.vue'

const mainStore = useMainStore()
const router = useRouter()
useKeyboardListener({
  'Control-s': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      onSave()
    },
  },
  'Control-r': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void refresh()
    },
  },
})

const {
  workingFile,
  workingFileContent,
} = storeToRefs(mainStore)

const cardRef = ref<InstanceType<typeof QCard> | null>(null)
const API = mainStore.apiOrThrow
const file = ref<string>('')
const baseWorkingFileContent = ref<string>('')
let promiseWait: CallableFunction | undefined

const hasDiff = computed(() => {
  return !isEqual(workingFileContent.value, baseWorkingFileContent.value)
})

const editorHeight = computed(() => {
  return ((cardRef.value?.$el as HTMLElement)?.clientHeight ?? '70vh').toString()
})

async function refresh () {
  if (hasDiff.value) {
    try {
      await dialogConfirm('Cancel modifications ?')
    } catch (e) {
      return
    }
  }

  Loading.show()
  await getFileContents()
  Loading.hide()
}

async function getFileContents () {
  const fileContent = (await API.getFileContents(file.value, 'text') as string | undefined) ?? ''

  if (typeof promiseWait === 'function') {
    promiseWait()
  }

  workingFileContent.value = fileContent
  baseWorkingFileContent.value = cloneDeep(fileContent)
}

function goToHome () {
  void router.replace({
    name: ROUTER_INDEX_NAME,
  })
}

function onSave () {
  if (!hasDiff.value) {
    Notify.create({
      message: 'Nothing to save',
      color: 'primary',
      textColor: 'white',
      timeout: 2000,
    })
    return
  }

  void dialogConfirm('Do you want save')
    .then(async () => {
      Loading.show()

      const status = await API.writeInFile(file.value, cloneDeep(workingFileContent.value))

      if (status) {
        await getFileContents()
      }

      Loading.hide()
    })
}

await new Promise((resolve) => {
  promiseWait = resolve

  const _workingFile = workingFile?.value
  if (typeof _workingFile === 'undefined') {
    goToHome()
    return
  }

  file.value = _workingFile
  void getFileContents()
})

onBeforeUnmount(() => {
  mainStore.closeFile()
})
</script>

<style lang="scss">
.todoDone {
  text-decoration-line: line-through;
}

.todoDoing {
}

.todoDoing,
.todoDone {
  .q-field__control {
    height: 25px !important;
  }
}

</style>
