<template>
  <div
    ref="listRef"
    class="fit row wrap justify-start items-start col-12"
    :class="{
      'justify-center': $q.screen.lt.sm,
    }"
  >
    <q-card
      v-for="(note, loopIndex) in notes"
      :key="note.id"
      class="col-11 col-md-3 col-sm-4 self-start q-my-sm"
      :class="{
        'q-mx-sm': $q.screen.gt.xs,
      }"
      :style="typeof note.color !== 'undefined'
        ? 'background:'.concat(note.color)
        : ''"
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
          :label-set="$t('save')"
          :label-cancel="$t('cancel')"
          anchor="center middle"
          :validate="noteTitleValidation"
          @hide="onNoteTitleHide(note.title, loopIndex)"
        >
          <q-input
            v-model.trim="scopePopupEdit.value"
            type="text"
            :hint="$t('title')"
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
          :label-set="$t('ok')"
          :label-cancel="$t('cancel')"
          class="full-popup"
          :style="popupEditStyle"
          self="center middle"
          anchor="center middle"
          color="white"
          persistent
          @show="onPopupShow"
          @hide="onPopupHide"
        >
          <q-card
            flat
            class="row justify-center"
          >
            <q-card-section
              v-if="note.type === ITEM_TYPE_TODO"
              class="col-12 col-md-6"
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
                v-model="scopePopupEdit.value"
                autofocus
                :placeholder="$t('content')"
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
        class="q-py-none q-px-xs q-pb-xs"
      >
        <q-chip
          label="Tag"
          clickable
          size="sm"
          color="secondary"
          text-color="primary"
        />
      </q-card-section>

      <q-card-section
        class="col-12 row justify-end"
        horizontal
        :class="{
          'card-note-buttons': $q.screen.gt.sm
        }"
      >
        <q-btn
          unelevated
          size="sm"
          icon="fa fa-grip-vertical"
          class="handle"
          style="cursor: grab"
        />

        <q-space />

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
            {{ $t('createdAt') }}: {{ dateTimeFormat(note.createdAt) }} <br>
            {{ $t('updatedAt') }}: {{ dateTimeFormat(note.createdAt) === dateTimeFormat(note.updatedAt)
              ? $t('never')
              : dateTimeFormat(note.updatedAt) }}
          </q-tooltip>
        </q-btn>
        <q-btn
          unelevated
          size="sm"
          icon="fa fa-palette"
          @click="openColorDialog(note)"
        />
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
          {{ $t('createNewFile') }}
        </q-tooltip>
      </template>
    </add-button>

    <reload-button
      :last-reload="lastReload"
      @click="getFileContent()"
    >
      <template #tooltip>
        <q-tooltip
          self="top left"
          anchor="top left"
        >
          {{ $t('reload') }}
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
import { useI18n } from 'vue-i18n'
import { keyBy } from 'lodash'
import DialogColorPicker from 'components/DialogColorPicker.vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { useSettingsStore } from 'stores/settings'
import { storeToRefs } from 'pinia'
import { useIntervalFn } from '@vueuse/core'
import { Tag } from 'src/interfaces/tag'

const mainStore = useMainStore()
const settingsStore = useSettingsStore()
const $q = useQuasar()
const {
  t,
} = useI18n()

useKeyboardListener({
  'Control-r': {
    callback: (e: KeyboardEvent) => {
      if (popup.value) {
        return
      }

      e.preventDefault()
      void getFileContent()
    },
  },
  'Control-a': {
    callback: (e: KeyboardEvent) => {
      if (popup.value) {
        return
      }

      e.preventDefault()
      newNoteDialog()
    },
  },
  'Control-s': {
    callback: (e: KeyboardEvent) => {
      if (popup.value) {
        return
      }

      e.preventDefault()
      onSave()
    },
  },
})

const API = mainStore.apiOrThrow

const editor = reactive({
  toolbar: [
    ['left', 'center', 'right', 'justify'],
    ['bold', 'italic', 'underline', 'strike'],
    ['undo', 'redo'],
  ],
})

const listRef = ref<InstanceType<typeof HTMLElement> | null>(null)
const popup = ref<boolean>(false)
const notes = ref<Item[]>([])
const lastReload = ref<string | undefined>(undefined)
const baseNotes = ref<Item[]>([])
const tags = ref<Tag[]>([])
const file = ref<{ items: Item[] }>({
  items: [],
})

const {
  autoSyncInterval,
} = storeToRefs(settingsStore)

const {
  resume,
} = useIntervalFn(
  () => {
    void getFileContent()
    void getTags()
  },
  autoSyncInterval.value,
  {
    immediate: false,
  },
)

const popupEditStyle = ref({
  height: '80vh',
  minHeight: '1200px',
})
const errorNoteTitle = ref({
  status: false,
  message: '',
})

useSortable(listRef, notes, {
  handle: '.handle',
})

const hasDiff = computed(() => {
  return !isEqual(notes.value, baseNotes.value)
})

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
    title: t('options'),
    message: t('selectNewFileType'),
    color: 'primary',
    options: {
      type: 'radio',
      model: 'todo',
      items: [
        {
          label: t('text'),
          value: 'text',
        },
        {
          label: t('todo'),
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

function hasConflict (_newNotes: Item[]) {
  const newNotes = cloneDeep(_newNotes)
  const currentNotes = cloneDeep(baseNotes.value)

  if (currentNotes.length === 0) {
    return false
  }

  return !isEqual(newNotes, currentNotes)
}

async function getTags () {
  tags.value = (await settingsStore.getTags()) ?? []
}

async function getFileContent (checkConflict = true) {
  Loading.show()

  try {
    let textFileContent = await API.getFileContent() as string
    textFileContent = textFileContent.trim()

    if (textFileContent.length === 0 || textFileContent.charAt(0) !== '{') {
      Notify.create({
        message: t('fileEmptyOrInvalid'),
        type: 'negative',
      })

      Loading.hide()
      void API?.createNotesFile()
      return
    }

    if (checkConflict && hasConflict(JSON.parse(textFileContent).items ?? [])) {
      // TODO (https://github.com/loicngr/kdrive-notes/issues/30)

      Notify.create({
        message: t('conflictDetected'),
        type: 'negative',
      })

      Loading.hide()
      return
    }

    file.value = JSON.parse(textFileContent)
    baseNotes.value = cloneDeep(file.value.items ?? [])
    lastReload.value = (new Date()).toString()
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

function onPopupShow () {
  popup.value = true
}

function onPopupHide () {
  popup.value = false
}

function onSave () {
  if (!hasDiff.value) {
    Notify.create({
      message: t('notingToSave'),
      color: 'primary',
      textColor: 'white',
      timeout: 2000,
    })
    return
  }

  void dialogConfirm(t('confirmSave'))
    .then(async () => {
      Loading.show()

      const actual = cloneDeep(notes.value)
      const base = keyBy(cloneDeep(baseNotes.value), 'id')
      const dateNow = new Date()

      let serverFileContent = await API.getFileContent() as string
      serverFileContent = serverFileContent.trim()

      if (hasConflict(JSON.parse(serverFileContent).items ?? [])) {
        Notify.create({
          message: t('conflictDetected'),
          type: 'warning',
        })

        Loading.hide()
        await dialogConfirm(t('confirmConflictServer'))
          .catch(() => {
            throw new Error('Skip save')
          })

        Loading.show()
      }

      actual.forEach((i) => {
        if (
          typeof base[i.id] !== 'undefined' &&
          !isEqual(i, base[i.id])
        ) {
          i.updatedAt = dateNow.toString()
        }
      })

      const status = await API.writeInFile(JSON.stringify({
        items: actual,
      }))

      if (status) {
        await getFileContent(false)
      }

      Loading.hide()
    })
}

function openColorDialog (item: Item) {
  $q.dialog({
    component: DialogColorPicker,
  }).onOk((color: Item['color']) => {
    item.color = color
  })
}

async function main () {
  await getFileContent()
  await getTags()

  resume()
}

await main()
</script>

<style scoped lang="scss">
.card-note-content {
  min-height: 50px;
  max-height: 250px;

  overflow: hidden;
}

.card-note-buttons {
  transition: ease-in-out .3s;
  opacity: 0.3;

  &:hover {
    opacity: 1;
  }
}
</style>
