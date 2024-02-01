<template>
  <q-page class="row items-center justify-evenly bg-amber-1">
    <template v-if="typeof client !== 'undefined'">
      <suspense>
        <list-directory-contents />

        <template #fallback>
          <q-spinner-dots
            size="lg"
            color="primary"
          />
        </template>
      </suspense>
    </template>
    <template v-else>
      <q-spinner-dots
        size="lg"
        color="primary"
      />
    </template>
  </q-page>
</template>

<script lang="ts" setup>
import ListDirectoryContents from 'components/ListDirectoryContents.vue'
import { useMainStore } from 'stores/main'
import { storeToRefs } from 'pinia'

const mainStore = useMainStore()
mainStore.connect()

const {
  client,
} = storeToRefs(mainStore)
</script>
