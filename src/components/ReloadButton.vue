<template>
  <q-btn
    fab
    icon="fa fa-refresh"
    color="primary"
    v-bind="$attrs"
    :style="$q.screen.lt.sm ?
      'padding: 0 !important; min-height: 35px !important; min-width: 35px !important;' :
      ''"
  >
    <template #default>
      <slot name="tooltip" />

      <q-badge
        v-if="!$q.screen.lt.sm"
        label="Ctrl + r"
        color="white"
        text-color="primary"
        class="absolute"
        style="bottom: -5px; left: -2px;"
      />

      <q-badge
        v-if="typeof lastReload !== 'undefined'"
        :label="dateTimeShortFormat(lastReload)"
        color="white"
        text-color="primary"
        class="absolute"
        style="top: -20px; left: -15px; font-size: 9px;"
      />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
import { dateTimeShortFormat } from 'src/utils/date'

withDefaults(
  defineProps<{
    lastReload?: string
  }>(),
  {
    lastReload: undefined,
  },
)
</script>

<style scoped>

</style>
