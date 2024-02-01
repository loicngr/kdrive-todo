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
        {{ item.basename }}
      </q-card-section>

      <q-card-section class="absolute-bottom">
        <q-chip
          :label="item.type"
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
    <q-btn
      fab
      icon="fa fa-refresh"
      color="purple-6"
      @click="refreshDirectoryContents()"
    />
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
  downloadBlob,
  generateIdFromFile
} from 'src/utils'
import { ContextMenuOption } from 'src/interfaces/contextMenu'
import isArrayBuffer from 'lodash/isArrayBuffer'
import DialogCreateFile from 'components/DialogCreateFile.vue'
import { useMainStore } from 'stores/main'
import { useRouter } from 'vue-router'
import { ROUTER_TODO_NAME } from 'src/constants'

const mainStore = useMainStore()
const API = mainStore.api

const $q = useQuasar()
const router = useRouter()
const directoryContents = ref<CustomFileStat[]>(await API.getDirectoryContents())

const vDirectoryContents = computed(() => {
  return directoryContents.value.map((directoryContentsItem) => ({
    ...directoryContentsItem,
    isFile: directoryContentsItem.type === 'file',
    _id: generateIdFromFile(directoryContentsItem)
  }))
})

const baseContextMenuOptions: ContextMenuOption[] = [
  {
    value: 'create',
    label: 'Create file',
    if: (ctx) => typeof ctx === 'undefined',
    callback: () => {
      closeMenu()
      $q.dialog({
        component: DialogCreateFile,
      }).onOk((data: { filename: string }) => {
        const {
          filename
        } = data

        if (filename.trim().length === 0) {
          return
        }

        API.writeInFile(filename.concat('.json'), '')
          .then(() => {
            refreshDirectoryContents()
          })
      })
    }
  },
  {
    value: 'open',
    label: 'Open',
    if: (ctx) => ctx?.isFile ?? false,
    callback: (ctx) => {
      closeMenu()

      mainStore.setWorkingFile(ctx?.basename)
      router.push({
        name: ROUTER_TODO_NAME
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
      API.getFileContents(ctx.filename, 'binary')
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
