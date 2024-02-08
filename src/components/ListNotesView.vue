<template>
  <div
    class="q-pa-md col-12 q-gutter-md"
    :class="{
      'row items-start': !$q.screen.lt.sm,
    }"
  >
    <q-card
      v-for="(note, loopIndex) in notes"
      :key="note.id"
      class="card-note col-auto row"
      flat
      bordered
    >
      <div class="col-12 hover-lighten">
        <q-card-section>
          {{ note.title }}
        </q-card-section>

        <q-separator
          inset
        />

        <q-popup-edit
          v-slot="scopePopupEdit"
          v-model="note.title"
          buttons
          label-set="Save"
          label-cancel="Cancel"
          anchor="center middle"
          :validate="noteTitleValidation"
          @hide="onNoteTitleHide(note.title, loopIndex)"
        >
          <q-input
            v-model.trim="scopePopupEdit.value"
            type="text"
            hint="Title"
            dense
            autofocus
            :error="errorNoteTitle.status"
            :error-message="errorNoteTitle.message"
            maxlength="255"
            @keyup.enter="scopePopupEdit.set"
          />
        </q-popup-edit>
      </div>

      <div class="col-12 hover-lighten card-note-content">
        <q-card-section>
          <item-note-preview-content
            :model-value="note.content"
            class="no-pointer-events"
          />
        </q-card-section>

        <q-popup-edit
          v-slot="scopePopupEdit"
          v-model="note.content"
          buttons
          label-set="Ok"
          label-cancel="Cancel"
          class="full-popup"
          :style="popupEditStyle"
          self="center middle"
          anchor="center middle"
          color="white"
          @show="computePopupEditStyle"
        >
          <q-card
            flat
            class="row justify-center"
          >
            <q-card-section
              v-if="note.type === ITEM_TYPE_TODO"
              class="col-6"
            >
              <item-note-todo
                v-model="scopePopupEdit.value"
              />
            </q-card-section>

            <q-card-section
              v-else
              class="col-12"
            >
              <q-editor
                :model-value="scopePopupEdit.value"
                autofocus
                placeholder="Content"
                height="80vh"
                max-height="1200px"
                :toolbar="editor.toolbar"
                content-class=""
                @keyup.enter.stop
              />
            </q-card-section>
          </q-card>
        </q-popup-edit>
      </div>

      <q-card-section
        class="col-12 row justify-end card-note-buttons"
        horizontal
      >
        <q-btn
          unelevated
          size="sm"
          icon="fa fa-close"
          @click="onDeleteNote(note)"
        />
        <q-btn
          unelevated
          size="sm"
          icon="fa fa-info"
        >
          <q-tooltip>
            Created at: {{ dateTimeFormat(note.createdAt) }} <br>
            Update at: {{ dateTimeFormat(note.createdAt) === dateTimeFormat(note.createdAt)
              ? 'never'
              : dateTimeFormat(note.updatedAt) }}
          </q-tooltip>
        </q-btn>
        <!--        <q-btn-->
        <!--          unelevated-->
        <!--          size="sm"-->
        <!--          icon="fa fa-ellipsis-vertical"-->
        <!--          @click="showNoteMenu(note)"-->
        <!--        />-->
      </q-card-section>
    </q-card>
  </div>

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
      @click="newNoteDialog()"
    >
      <template #tooltip>
        <q-tooltip
          self="top left"
          anchor="top left"
        >
          Create a new file
        </q-tooltip>
      </template>
    </add-button>

    <reload-button
      @click="getFileContent()"
    >
      <template #tooltip>
        <q-tooltip
          self="top left"
          anchor="top left"
        >
          Reload notes
        </q-tooltip>
      </template>
    </reload-button>
  </q-page-sticky>
</template>

<script setup lang="ts">
import {
  computed,
  reactive,
  ref,
  watch,
} from 'vue'
import { type Item } from 'src/interfaces/item'
import {
  DEFAULT_NOTE,
  ITEM_TYPE_TODO,
} from 'src/constants'
import {
  Loading,
  Notify,
  QPopupEdit,
  useQuasar,
} from 'quasar'
import { useWindowSize } from '@vueuse/core'
import ItemNotePreviewContent from 'components/ItemNotePreviewContent.vue'
import ItemNoteTodo from 'components/ItemNoteTodo.vue'
import { useMainStore } from 'stores/main'
import AddButton from 'components/AddButton.vue'
import ReloadButton from 'components/ReloadButton.vue'
import cloneDeep from 'lodash/fp/cloneDeep'
import {
  dialogConfirm,
  randomTimeId,
} from 'src/utils'
import { useKeyboardListener } from 'src/composables/keyboardListener'
import SaveButton from 'components/SaveButton.vue'
import isEqual from 'lodash/fp/isEqual'
import { dateTimeFormat } from 'src/utils/date'

const mainStore = useMainStore()
const $q = useQuasar()

useKeyboardListener({
  'Control-r': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void getFileContent()
    },
  },
  'Control-a': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      newNoteDialog()
    },
  },
  'Control-s': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      onSave()
    },
  },
})

const {
  height: windowHeight,
  width: windowWidth,
} = useWindowSize()

const API = mainStore.apiOrThrow

const editor = reactive({
  toolbar: [
    ['left', 'center', 'right', 'justify'],
    ['bold', 'italic', 'underline', 'strike'],
    ['undo', 'redo'],
  ],
})

const notes = ref<Item[]>([])
const baseNotes = ref<Item[]>([])
const file = ref<{ items: Item[] }>({
  items: [],
})
const popupEditStyle = ref({})
const errorNoteTitle = ref({
  status: false,
  message: '',
})

const hasDiff = computed(() => {
  return !isEqual(notes.value, baseNotes.value)
})

function computePopupEditStyle () {
  popupEditStyle.value = {
    top: 0,
    left: 0,
    width: windowWidth.value.toString().concat('px'),
    maxWidth: windowWidth.value.toString().concat('px !important'),
    height: windowHeight.value.toString().concat('px'),
    maxHeight: windowHeight.value.toString().concat('px !important'),
  }
}

function noteTitleValidation (val: string | undefined) {
  if (typeof val !== 'string' || val.length === 0) {
    errorNoteTitle.value.status = true
    errorNoteTitle.value.message = 'Not valid'
    return false
  }

  errorNoteTitle.value.status = false
  errorNoteTitle.value.message = ''
  return true
}

function onNoteTitleHide (
  val: string | undefined,
  loopIndex: number,
) {
  if (!noteTitleValidation(val)) {
    notes.value[loopIndex].title = 'Note title'
  }
}

// function showNoteMenu (note: Item) {
//   console.log('TODO', note)
// }

function onDeleteNote (note: Item) {
  void dialogConfirm('Delete this note ?')
    .then(() => {
      notes.value = notes.value.filter((n) => n !== note)
    })
}

function newNoteDialog () {
  $q.dialog({
    title: 'Options',
    message: 'Select new file type:',
    color: 'primary',
    options: {
      type: 'radio',
      model: 'todo',
      items: [
        {
          label: 'Text',
          value: 'text',
        },
        {
          label: 'Todo',
          value: 'todo',
        },
      ],
    },
    cancel: true,
    persistent: true,
  }).onOk((data) => {
    if (data === 'todo') {
      createNewTodo()
      return
    }

    createNewText()
  })
}

function createNewTodo () {
  const currentNotes = cloneDeep(notes.value)

  currentNotes.push({
    ...DEFAULT_NOTE,
    id: randomTimeId(),
    content: [],
    type: ITEM_TYPE_TODO,
    updatedAt: new Date().toString(),
    createdAt: new Date().toString(),
  })

  try {
    void API.writeInFile(JSON.stringify({
      items: currentNotes,
    }))
      .then(() => {
        void getFileContent()
      })
      .finally(() => {
        Loading.hide()
      })
  } catch (e) {
    console.error(e)
    Loading.hide()
  }
}

function createNewText () {
  const currentNotes = cloneDeep(notes.value)

  currentNotes.push({
    ...DEFAULT_NOTE,
    id: randomTimeId(),
    updatedAt: new Date().toString(),
    createdAt: new Date().toString(),
  })

  try {
    void API.writeInFile(JSON.stringify({
      items: currentNotes,
    }))
      .then(() => {
        void getFileContent()
      })
      .finally(() => {
        Loading.hide()
      })
  } catch (e) {
    console.error(e)
    Loading.hide()
  }
}

async function getFileContent () {
  Loading.show()

  try {
    let textFileContent = await API.getFileContent() as string
    textFileContent = textFileContent.trim()

    if (textFileContent.length === 0 || textFileContent.charAt(0) !== '{') {
      Notify.create({
        message: 'File is empty, or format is invalid.',
        type: 'negative',
      })

      Loading.hide()
      void API?.createNotesFile()
      return
    }

    file.value = JSON.parse(textFileContent)
    baseNotes.value = cloneDeep(file.value.items ?? [])
  } catch (e) {
    console.error(e)
  }

  Loading.hide()
}

watch(
  file,
  (v) => {
    notes.value = v.items ?? []
  },
  {
    deep: true,
  },
)

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

      const status = await API.writeInFile(JSON.stringify({
        items: notes.value,
      }))

      if (status) {
        await getFileContent()
      }

      Loading.hide()
    })
}

async function main () {
  computePopupEditStyle()
  await getFileContent()
}

await main()
</script>

<style scoped lang="scss">
.card-note {
  width: 100%;
  max-width: 300px;
}

.card-note-content {
  min-height: 50px;
  max-height: 250px;

  overflow: hidden;
}

.card-note-buttons {
  transition: ease-in-out .3s;
  opacity: 0.2;

  &:hover {
    opacity: 1;
  }
}
</style>
