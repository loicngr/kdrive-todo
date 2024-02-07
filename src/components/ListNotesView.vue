<template>
  <div class="q-pa-md col-12 row items-start q-gutter-md">
    <q-card
      v-for="note in notes"
      :key="note.id"
      class="card-note"
      flat
      bordered
    >
      <q-card-section>
        <q-field
          :model-value="note.title"
          class="overflow-hidden"
        >
          <template #control>
            {{ note.title }}
          </template>

          <q-popup-edit
            v-slot="scopePopupEdit"
            v-model="note.title"
            buttons
            label-set="Save"
            label-cancel="Cancel"
            anchor="center middle"
          >
            <q-input
              v-model="scopePopupEdit.value"
              min-height="5rem"
              dense
              autofocus
              stack-label
              maxlength="255"
              label="Title"
              @keyup.enter="scopePopupEdit.set"
            />
          </q-popup-edit>
        </q-field>
      </q-card-section>

      <div>
        <q-card-section
          class="q-pt-none no-pointer-events"
        >
          <item-note
            :model-value="note.content"
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
          >
            <q-card-section
              v-if="note.type === ITEM_TYPE_TODO"
            >
              <q-input
                v-model="scopePopupEdit.value"
                min-height="5rem"
                dense
                autofocus
                stack-label
                maxlength="255"
                label="Content"
                @keyup.enter="scopePopupEdit.set"
              />
            </q-card-section>

            <q-card-section v-else>
              <q-editor
                v-model="scopePopupEdit.value"
                autofocus
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
import ItemNote from 'components/ItemNote.vue'
import { QPopupEdit } from 'quasar'
import { useWindowSize } from '@vueuse/core'

const notes = ref<Item[]>([
  {
    id: '1',
    title: 'todo list 1',
    content: [{
      id: '1',
      content: 'to do 1',
      done: false,
    }],
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
}
</style>
