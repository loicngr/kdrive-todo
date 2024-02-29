<template>
  <q-card
    class="col-12 no-padding q-my-none q-mx-sm"
    style="background: rgba(255, 255, 255, 0.07)"
    flat
  >
    <q-toolbar>
      <span class="text-h5">
        {{ $t('tags') }}

        <q-icon
          name="fa fa-circle-info"
          color="white"
          size="xs"
        >
          <q-tooltip>
            {{ $t('tagsTooltip') }}
          </q-tooltip>
        </q-icon>
      </span>

      <q-space />

      <q-btn
        v-if="!error"
        fab-mini
        icon="fa fa-add"
        color="primary"
        @click="onTagAdd"
      />
    </q-toolbar>

    <q-card-section>
      <q-scroll-area
        v-if="!error"
        :style="(tags?.length ?? 0) > 0
          ? 'height: 150px'
          : 'height: 50px'"
      >
        <q-list
          ref="tagsListRef"
          separator
          class="q-pa-none q-ma-none"
        >
          <q-item
            v-for="(tag, i) in tags"
            :key="tag.id"
            class="col-12 row justify-between"
          >
            <q-item-section class="col-10">
              <div class="row">
                <q-input
                  v-model.trim="tag.name"
                  :label="$t('name')"
                  type="text"
                  class="col-6"
                />

                <q-input
                  v-model.trim="tag.color"
                  :label="$t('color')"
                  type="text"
                  class="col-5 offset-1"
                >
                  <template #append>
                    <q-icon
                      name="fa fa-eye-dropper"
                      class="cursor-pointer"
                      :style="'color:'.concat(typeof tag.color === 'string'
                        ? tag.color
                        : 'white')"
                    >
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-color
                          v-model.trim="tag.color"
                          default-view="palette"
                          no-footer
                          :palette="[
                            '#0da1a4',
                            '#cbaf13',
                            '#cc0b54',
                            '#ad1189',
                            '#350d56',
                            '#25790f',
                            '#542513',
                            '#81736e',
                            '#000000',
                          ]"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </q-item-section>

            <q-item-section
              side
              class="col-auto"
            >
              <div>
                <q-btn
                  icon="fa fa-trash"
                  color="negative"
                  round
                  flat
                  size="sm"
                  @click="onTagDelete(i)"
                />

                <q-icon
                  name="fa fa-grip-vertical"
                  size="sm"
                  class="handle"
                  style="cursor: grab"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <span ref="qListBottomRef" />
      </q-scroll-area>

      <div v-else>
        {{ $t('tagsNotConnected') }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import {
  onBeforeMount,
  ref,
  watchEffect,
} from 'vue'
import { useSortable } from '@vueuse/integrations/useSortable'
import { Tag } from 'src/interfaces/tag'
import {
  dialogConfirm,
  randomTimeId,
} from 'src/utils'
import { DEFAULT_TAG } from 'src/constants'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from 'stores/settings'
import {
  useMainStore, WEBDAV_SETTINGS_PATH,
} from 'stores/main'
import { storeToRefs } from 'pinia'
import cloneDeep from 'lodash/fp/cloneDeep'

const tagsListRef = ref<HTMLDivElement | null>(null)
const qListBottomRef = ref<HTMLSpanElement | null>(null)
const tags = defineModel<Tag[]>()

const mainStore = useMainStore()
const settingsStore = useSettingsStore()
const error = ref(true)

const {
  api,
} = storeToRefs(mainStore)

const {
  t,
} = useI18n()

watchEffect(() => {
  const _tags = tags.value

  if (typeof _tags !== 'undefined') {
    useSortable(
      tagsListRef,
      _tags,
      {
        handle: '.handle',
      },
    )
  }
})

function onTagDelete (index: number) {
  dialogConfirm(t('areYouSureToDelete'))
    .then(() => {
      tags.value?.splice(index, 1)
    })
}

function onTagAdd () {
  const listBottom = qListBottomRef.value

  if (listBottom === null) {
    return
  }

  tags.value ??= []
  tags.value.push({
    ...DEFAULT_TAG,
    id: randomTimeId(),
  })

  listBottom.scrollIntoView({
    behavior: 'smooth',
  })
}

async function init () {
  error.value = true
  mainStore.filePath = cloneDeep(WEBDAV_SETTINGS_PATH)
  await mainStore.connect()

  if (typeof api?.value !== 'undefined') {
    error.value = false
    tags.value = await settingsStore.getTags()
  }
}

onBeforeMount(async () => {
  await init()
})

defineExpose({
  init,
})
</script>
