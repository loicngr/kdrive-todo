<template>
  <div class="full-width row wrap justify-center items-center content-center">
    <q-card
      v-for="item in vDirectoryContents"
      :key="item.etag"
      class="col-3 q-ma-md q-pa-none bg-purple-6 column cursor-pointer"
      style="overflow: auto; min-height: 200px; max-height: 200px; min-width: 200px; max-width: 200px;"
      @mouseenter="onMouseEnter($event, item)"
      @mouseleave="onMouseLeave($event)"
    >
      <q-card-section class="col row items-center justify-center">
        {{ item.vName }}
      </q-card-section>

      <q-card-section class="absolute-bottom">
        <q-chip
          :label="item.vType"
          size="sm"
        />
        <q-chip
          :label="dateTimeFormat(item.lastmod)"
          size="sm"
        />
      </q-card-section>
    </q-card>
  </div>

  <q-menu
    v-model="contextMenuShow"
    context-menu
    touch-position
    dense
    @before-hide="closeMenu"
  >
    <q-list
      style="min-width: 100px;"
      dense
    >

      <template v-if="contextMenuOptions.length === 0">
        <q-item
          dense
        >
          <q-item-section>No option</q-item-section>
        </q-item>
      </template>

      <template v-else>
        <q-item
          v-for="contextMenuOption in contextMenuOptions"
          :key="contextMenuOption.value"
          clickable
          dense
        >
          <q-item-section
            @click.stop.prevent="contextMenuOption.callback(contextMenuItem)"
          >
            {{ contextMenuOption.label }}
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-menu>

  <q-page-sticky
    position="bottom-right"
    :offset="[18, 18]"
  >
    <add-button
      class="q-mr-md"
      @click="newFileDialog()"
    >
      <template #tooltip>
        <q-tooltip self="top left" anchor="top left">Create a new file</q-tooltip>
      </template>
    </add-button>

    <reload-button
      @click="refreshDirectoryContents()"
    >
      <template #tooltip>
        <q-tooltip self="top left" anchor="top left">Reload directory</q-tooltip>
      </template>
    </reload-button>
  </q-page-sticky>
</template>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  ref,
} from 'vue'
import {
  Loading,
  QMenu,
  useQuasar
} from 'quasar'
import { dateTimeFormat } from 'src/utils/date'
import { CustomFileStat } from 'src/interfaces/file'
import { useContextMenu } from 'src/composables/contextMenu'
import {
  dialogConfirm,
  directoryContentItemIsTodo,
  downloadBlob,
  getDirectoryContentItemName
} from 'src/utils'
import { ContextMenuOption } from 'src/interfaces/contextMenu'
import isArrayBuffer from 'lodash/isArrayBuffer'
import { useMainStore } from 'stores/main'
import { useRouter } from 'vue-router'
import {
  DEFAULT_TODO,
  ROUTER_TEXT_NAME,
  ROUTER_TODO_NAME
} from 'src/constants'
import ReloadButton from 'components/ReloadButton.vue'
import { useKeyboardListener } from 'src/composables/keyboardListener'
import AddButton from 'components/AddButton.vue'
import DialogCreateTodoFile from 'components/DialogCreateTodoFile.vue'
import DialogCreateTextFile from 'components/DialogCreateTextFile.vue'

const mainStore = useMainStore()
const $q = useQuasar()
const router = useRouter()

useKeyboardListener({
  'Control-r': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void refreshDirectoryContents()
    }
  },
  'Control-a': {
    callback: (e: KeyboardEvent) => {
      e.preventDefault()
      void newFileDialog()
    }
  }
})

const API = mainStore.apiOrThrow
const directoryContents = ref<CustomFileStat[]>(await API.getDirectoryContents())

const vDirectoryContents = computed(() => {
  return directoryContents.value.map((directoryContentsItem) => {
    const v = {
      ...directoryContentsItem,
      isFile: directoryContentsItem.type === 'file',
      vType: directoryContentsItem.type as string,
    }

    Object.assign(v, {
      vName: getDirectoryContentItemName(v),
      isTodo: directoryContentItemIsTodo(v),
    })

    if (v.isTodo) {
      v.vType = 'todo'
    }

    return v
  })
})

const baseContextMenuOptions: ContextMenuOption[] = [
  {
    value: 'create',
    label: 'Create file',
    if: (ctx) => typeof ctx === 'undefined',
    callback: () => {
      closeMenu()
      newFileDialog()
    }
  },
  {
    value: 'open_todo_list',
    label: 'Open todo list',
    if: (ctx) => (ctx?.isFile ?? false) && (ctx?.isTodo ?? false),
    callback: (ctx) => {
      closeMenu()

      mainStore.setWorkingFile(ctx?.basename)
      router.push({
        name: ROUTER_TODO_NAME
      })
    }
  },
  {
    value: 'open_text',
    label: 'Open text file',
    if: (ctx) => (ctx?.isFile ?? false) && !(ctx?.isTodo ?? false),
    callback: (ctx) => {
      closeMenu()

      mainStore.setWorkingFile(ctx?.basename)
      router.push({
        name: ROUTER_TEXT_NAME
      })
    }
  },
  {
    value: 'download',
    label: 'Download',
    if: (ctx) => ctx?.isFile ?? false,
    callback: (ctx) => {
      closeMenu()

      if (typeof ctx === 'undefined') {
        return
      }

      Loading.show()
      API.getFileContents(ctx.basename, 'binary')
        .then((data) => {
          if (isArrayBuffer(data)) {
            const blob = new Blob([data], {
              type: ctx.mime
            })

            Loading.hide()
            downloadBlob(blob, ctx.basename)
          }
        })
    }
  },
  {
    value: 'delete',
    label: 'Delete',
    if: (ctx) => ctx?.isFile ?? false,
    callback: (ctx) => {
      closeMenu()

      if (typeof ctx === 'undefined') {
        return
      }

      dialogConfirm('Delete this file ?')
        .then(() => {
          Loading.show()

          API.deleteFile(ctx.basename)
            .finally(() => {
              Loading.hide()

              void refreshDirectoryContents()
            })
        })
    }
  }
]

const {
  closeMenu,
  contextMenuItem,
  contextMenuShow,
  contextMenuOptions
} = useContextMenu(baseContextMenuOptions)

async function refreshDirectoryContents(dir?: string) {
  Loading.show()

  directoryContents.value = await API.getDirectoryContents(dir)

  Loading.hide()
}

function newFileDialog () {
  $q.dialog({
    title: 'Options',
    message: 'Select new file type:',
    options: {
      type: 'radio',
      model: 'todo',
      items: [
        {
          label: 'Text',
          value: 'text'
        },
        {
          label: 'Todo',
          value: 'todo'
        },
      ]
    },
    cancel: true,
    persistent: true
  }).onOk((data) => {
    if (data === 'todo') {
      void createNewTodoFile()
      return
    }

    void createNewTextFile()
  })
}

function createNewTodoFile() {
  $q.dialog({
    component: DialogCreateTodoFile,
  }).onOk((data: { filename: string }) => {
    const {
      filename
    } = data

    if (filename.trim().length === 0) {
      return
    }

    Loading.show()
    API.writeInFile(filename.concat('.json'), JSON.stringify(DEFAULT_TODO))
      .then(() => {
        refreshDirectoryContents()
      })
      .finally(() => {
        Loading.hide()
      })
  })
}

function createNewTextFile() {
  $q.dialog({
    component: DialogCreateTextFile,
  }).onOk((data: { filename: string }) => {
    const {
      filename
    } = data

    if (filename.trim().length === 0) {
      return
    }

    Loading.show()
    API.writeInFile(filename.concat('.txt'), '')
      .then(() => {
        refreshDirectoryContents()
      })
      .finally(() => {
        Loading.hide()
      })
  })
}

function onMouseEnter(e: MouseEvent, item: CustomFileStat) {
  const target = e.target as HTMLElement
  target.classList.replace('bg-purple-6', 'bg-purple-5')

  if (typeof contextMenuItem.value !== 'undefined' && contextMenuShow.value) {
    closeMenu()
  }

  nextTick(() => {
    contextMenuItem.value = item
  })
}

function onMouseLeave(e: MouseEvent) {
  const target = e.target as HTMLElement
  target.classList.replace('bg-purple-5', 'bg-purple-6')

  nextTick(() => {
    if (!contextMenuShow.value) {
      contextMenuItem.value = undefined
    }
  })
}
</script>
