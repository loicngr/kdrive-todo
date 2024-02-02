<template>
  <template v-if="workingFileContent.length > 0">
    <q-card
      class="bg-purple-7 col-md-6 col-12"
    >
      <q-card-section>
        <q-list
          bordered
          padding
        >
          <q-item-label
            header
            class="text-white text-h4"
          >
            {{ file }}
          </q-item-label>

          <q-separator
            spaced
          />

          <q-item
            v-for="(todo, index) in workingFileContent"
            :key="index"
          >
            <q-item-section
              :class="{
                'todoDone': todo.status === FILE_DATA_STATUS_DONE,
                'todoDoing': todo.status !== FILE_DATA_STATUS_DONE
              }"
            >
              <q-item-label
                style="margin: 0 !important;"
              >
                <q-input
                  v-model.trim="todo.title"
                  type="text"
                  dense
                  hide-bottom-space
                  hide-hint
                  borderless
                  maxlength="255"
                  input-class="text-white"
                />
              </q-item-label>
              <q-item-label
                style="margin: 0 !important;"
              >
                <q-input
                  v-model.trim="todo.content"
                  type="text"
                  dense
                  hide-bottom-space
                  hide-hint
                  borderless
                  maxlength="500"
                  input-class="text-white text-caption"
                />
              </q-item-label>
            </q-item-section>

            <q-item-section
              side
              class="text-white"
              style="font-size: 0.7em !important;"
            >
              <q-item-label>
                Created at: {{ dateTimeFormat(todo.createdAt) }}
              </q-item-label>
              <q-item-label>
                Update at: {{ todo.updatedAt === null ? 'never' : dateTimeFormat(todo.updatedAt) }}
              </q-item-label>
            </q-item-section>

            <q-item-section
              side
              style="padding: 0 !important;"
            >
              <q-toggle
                class="col-6"
                :model-value="todo.status === FILE_DATA_STATUS_DONE"
                color="white"
                @click="todo.status === FILE_DATA_STATUS_DONE ? todo.status = FILE_DATA_STATUS_TODO : todo.status = FILE_DATA_STATUS_DONE"
              />
            </q-item-section>

            <q-item-section
              side
              style="padding: 0 !important;"
            >
              <q-btn
                dense
                unelevated
                fab-mini
                icon="fa fa-remove"
                text-color="white"
                @click="onDeleteTodo(todo)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </template>
  <template v-else>
    No data
  </template>

  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
  >
    <q-btn
      v-if="hasDiff"
      fab
      icon="fa fa-save"
      color="purple-6"
      class="q-mr-sm relative-position"
      @click="onSave()"
    >
      <template #default>
        <q-badge
          label="Ctrl + s"
          color="white"
          text-color="purple-7"
          class="absolute"
          style="bottom: -5px; left: -2px;"
        />
      </template>
    </q-btn>

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
  computed,
  onBeforeUnmount,
  ref
} from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  DEFAULT_TODO,
  FILE_DATA_STATUS_DONE,
  FILE_DATA_STATUS_TODO,
  ROUTER_INDEX_NAME
} from 'src/constants'
import { FileData } from 'src/interfaces/file'
import {
  Loading,
  Notify
} from 'quasar'
import {
 dialogConfirm, randomTimeId
} from 'src/utils'
import cloneDeep from 'lodash/fp/cloneDeep'
import isEqual from 'lodash/fp/isEqual'
import keyBy from 'lodash/keyBy'
import { dateTimeFormat } from '../utils/date'
import { useKeyboardListener } from 'src/composables/keyboardListener'

const mainStore = useMainStore()
const router = useRouter()
useKeyboardListener({
  'Control-s': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      onSave()
    }
  }
})

const {
  workingFile,
  workingFileContent
} = storeToRefs(mainStore)

const API = mainStore.api
const file = ref<string>('')
const baseWorkingFileContent = ref<FileData[]>([])

let promiseWait: CallableFunction | undefined
let attemptFileGetContents = 0

const hasDiff = computed(() => {
  return !isEqual(workingFileContent.value, baseWorkingFileContent.value)
})

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
  baseWorkingFileContent.value = cloneDeep(parsedJson)
  attemptFileGetContents = 0
}

function onDeleteTodo(todo: FileData) {
  dialogConfirm('Delete this element ?')
    .then(() => {
      const elementIndex = workingFileContent.value.findIndex((c) => c.id === todo.id)

      if (elementIndex !== -1) {
        workingFileContent.value.splice(elementIndex, 1)
      }
    })
}

function addTodo() {
  workingFileContent.value.unshift({
    id: randomTimeId(),
    title: 'new todo',
    content: '',
    status: FILE_DATA_STATUS_TODO,
    createdAt: new Date().toString(),
    updatedAt: null,
  })
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
  })
}

function onSave () {
  if (!hasDiff.value) {
    Notify.create({
      message: 'Nothing to save',
      color: 'purple-7',
      textColor: 'white',
      timeout: 2000
    })
    return
  }

  dialogConfirm('Do you want save')
    .then(async () => {
      const actual = cloneDeep(workingFileContent.value)
      const base = keyBy(cloneDeep(baseWorkingFileContent.value), 'id')
      const dateNow = new Date()

      Loading.show()

      actual.forEach((todo) => {
        if (
          typeof base[todo.id] !== 'undefined'
          && !isEqual(todo, base[todo.id])
        ) {
          todo.updatedAt = dateNow.toString()
        }
      })

      const status = await API.writeInFile(file.value, JSON.stringify({
        todos: actual
      }))

      if (status) {
        await getFileContents()
      }

      Loading.hide()
    })
}

await new Promise((resolve) => {
  promiseWait = resolve

  ensureFileExist()
  file.value = workingFile.value as string
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
