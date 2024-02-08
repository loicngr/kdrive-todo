<template>
  <div class="q-pa-md col-12 row items-start q-gutter-md">
    <q-card
      v-for="(note, loopIndex) in notes"
      :key="note.id"
      class="card-note row"
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

      <div
        class="col-12 hover-lighten"
      >
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
          label-set="Save"
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
                @update:model-value="note.tmpContent = $event"
              />
            </q-card-section>
          </q-card>
        </q-popup-edit>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import {
  reactive,
  ref,
} from 'vue'
import { type Item } from 'src/interfaces/item'
import {
  ITEM_TYPE_NOTE,
  ITEM_TYPE_TODO,
} from 'src/constants'
import { QPopupEdit } from 'quasar'
import { useWindowSize } from '@vueuse/core'
import ItemNotePreviewContent from 'components/ItemNotePreviewContent.vue'
import ItemNoteTodo from 'components/ItemNoteTodo.vue'

const notes = ref<Item[]>([
  {
    id: '1',
    title: 'todo list 1',
    content: [
      {
        id: '1',
        content: 'to do 1',
        done: true,
      },
      {
        id: '2',
        content: 'to do 2',
        done: false,
      },
      {
        id: '3',
        content: 'to do 3',
        done: false,
      },
      {
        id: '4',
        content: 'to do 4',
        done: false,
      },
      {
        id: '5',
        content: 'to do 5',
        done: false,
      },
      {
        id: '6',
        content: 'to do 6',
        done: false,
      },
      {
        id: '7',
        content: 'to do 7',
        done: false,
      },
    ],
    createdAt: '',
    updatedAt: '',
    status: 100,
    type: ITEM_TYPE_TODO,
  },
  {
    id: '2',
    title: 'note',
    content: 'note content',
    createdAt: '',
    updatedAt: '',
    status: 100,
    type: ITEM_TYPE_NOTE,
  },
])

const editor = reactive({
  toolbar: [
    ['left', 'center', 'right', 'justify'],
    ['bold', 'italic', 'underline', 'strike'],
    ['undo', 'redo'],
  ],
})

const {
  height: windowHeight,
  width: windowWidth,
} = useWindowSize()

const popupEditStyle = ref({})
const errorNoteTitle = ref({
  status: false,
  message: '',
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

function main () {
  computePopupEditStyle()
}

main()
</script>

<style scoped>
.card-note {
  width: 100%;
  max-width: 300px;
  min-height: 50px;
  max-height: 300px;

  overflow: hidden;
}
</style>
