<template>
  <q-btn
    fab
    icon="fa fa-add"
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
        label="Ctrl + a"
        color="white"
        text-color="primary"
        class="absolute"
        style="bottom: -5px; left: -2px;"
      />
    </template>
  </q-btn>
</template>

<script setup lang="ts">

</script>

<style scoped>

</style>
