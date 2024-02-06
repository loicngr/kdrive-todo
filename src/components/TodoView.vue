<template>
  <template v-if="workingTodoFileContent.length > 0">
    <q-card
      class="bg-card col-md-6 col-12"
      flat
      style="max-width: 900px"
    >
      <q-card-section>
        <q-list
          bordered
          padding
        >
          <q-item-label
            header
            class="text-h4"
          >
            {{ extractFilename(file) }}
          </q-item-label>

          <q-separator
            spaced
          />

          <div
            ref="listRef"
          >
            <q-item
              v-for="todo in workingTodoFileContent"
              :key="todo.id"
              clickable
            >
              <q-item-section
                side
                style="padding: 0 !important; margin: 0 !important;"
              >
                <q-icon
                  left
                  class="handle"
                  name="fa fa-grip-vertical"
                />
              </q-item-section>

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
                  />
                </q-item-label>
                <q-item-label
                  style="margin: 0 !important;"
                  class="overflow-hidden"
                >
                  <q-input
                    v-model.trim="todo.content"
                    type="text"
                    dense
                    hide-bottom-space
                    hide-hint
                    borderless
                    autogrow
                    rows="2"
                    maxlength="500"
                    input-class="text-caption"
                  />
                </q-item-label>
              </q-item-section>

              <q-item-section
                side
                style="padding: 0 !important;"
              >
                <q-toggle
                  class="col-6"
                  :model-value="todo.status === FILE_DATA_STATUS_DONE"
                  @click="todo.status === FILE_DATA_STATUS_DONE ? todo.status = FILE_DATA_STATUS_TODO : todo.status = FILE_DATA_STATUS_DONE"
                />
              </q-item-section>

              <q-item-section
                side
                style="padding: 0 !important;"
                class="column"
              >
                <q-icon
                  name="fa fa-info"
                  class="full-width"
                >
                  <q-tooltip>
                    Created at: {{ dateTimeFormat(todo.createdAt) }} <br>
                    Update at: {{ todo.updatedAt === null ? 'never' : dateTimeFormat(todo.updatedAt) }}
                  </q-tooltip>
                </q-icon>

                <q-btn
                  fab-mini
                  unelevated
                  dense
                  icon="fa fa-remove"
                  @click="onDeleteTodo(todo)"
                />
              </q-item-section>
            </q-item>
          </div>
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
    <save-button
      v-if="hasDiff"
      class="q-mr-md"
      @click="onSave()"
    />

    <add-button
      class="q-mr-md"
      @click="addTodo()"
    >
      <template #tooltip>
        <q-tooltip self="top left" anchor="top left">Add todo</q-tooltip>
      </template>
    </add-button>

    <reload-button
      @click="refresh()"
    >
      <template #tooltip>
        <q-tooltip self="top left" anchor="top left">Reload file</q-tooltip>
      </template>
    </reload-button>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { useSortable } from '@vueuse/integrations/useSortable'
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
  DEFAULT_TODOS,
  FILE_DATA_STATUS_DONE,
  FILE_DATA_STATUS_TODO,
  ROUTER_INDEX_NAME
} from 'src/constants'
import { FileData } from 'src/interfaces/file'
import {
  Loading,
  Notify, QList
} from 'quasar'
import {
  dialogConfirm,
  extractFilename,
  randomTimeId
} from 'src/utils'
import cloneDeep from 'lodash/fp/cloneDeep'
import isEqual from 'lodash/fp/isEqual'
import keyBy from 'lodash/keyBy'
import { dateTimeFormat } from '../utils/date'
import { useKeyboardListener } from 'src/composables/keyboardListener'
import SaveButton from 'components/SaveButton.vue'
import ReloadButton from 'components/ReloadButton.vue'
import AddButton from 'components/AddButton.vue'

const mainStore = useMainStore()
const router = useRouter()
useKeyboardListener({
  'Control-s': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      onSave()
    }
  },
  'Control-r': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void refresh()
    }
  },
  'Control-a': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void addTodo()
    }
  }
})

const {
  workingFile,
  workingTodoFileContent
} = storeToRefs(mainStore)

const API = mainStore.apiOrThrow
const file = ref<string>('')
const listRef = ref<InstanceType<typeof HTMLElement> | null>(null)
const baseWorkingFileContent = ref<FileData[]>([])

let promiseWait: CallableFunction | undefined
let attemptFileGetContents = 0

const {
 option
} = useSortable(listRef, workingTodoFileContent, {
  handle: '.handle',
})

option('animation', 200)

const hasDiff = computed(() => {
  return !isEqual(workingTodoFileContent.value, baseWorkingFileContent.value)
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
      const defaultTemplate = JSON.stringify(DEFAULT_TODOS)
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

  workingTodoFileContent.value = parsedJson
  baseWorkingFileContent.value = cloneDeep(parsedJson)
  attemptFileGetContents = 0
}

function onDeleteTodo(todo: FileData) {
  dialogConfirm('Delete this element ?')
    .then(() => {
      const elementIndex = workingTodoFileContent.value.findIndex((c) => c.id === todo.id)

      if (elementIndex !== -1) {
        workingTodoFileContent.value.splice(elementIndex, 1)
      }
    })
}

function addTodo() {
  workingTodoFileContent.value.push({
    ...DEFAULT_TODO,
    id: randomTimeId(),
    title: 'new todo',
    createdAt: new Date().toString(),
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
      color: 'primary',
      textColor: 'white',
      timeout: 2000
    })
    return
  }

  dialogConfirm('Do you want save')
    .then(async () => {
      const actual = cloneDeep(workingTodoFileContent.value)
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
