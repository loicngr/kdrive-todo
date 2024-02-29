<template>
  <q-btn
    fab
    icon="fa fa-tag"
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
        label="Ctrl + f"
        color="white"
        text-color="primary"
        class="absolute"
        style="bottom: -5px; left: -2px;"
      />

      <q-btn
        v-if="canClear"
        icon="fa fa-close"
        color="white"
        text-color="primary"
        class="absolute"
        round
        style="top: -20px; left: 30px; font-size: 9px;"
        @click.prevent="onClear"
      />
    </template>
  </q-btn>
</template>

<script setup lang="ts">
defineProps<{
  canClear?: boolean
}>()

const emit = defineEmits(['clear'])

function onClear () {
  emit('clear')
}
</script>

<style scoped>

</style>
