<template>
  <q-btn
    fab
    icon="fa fa-refresh"
    color="primary"
    v-bind="$attrs"
  >
    <template #default>
      <slot name="tooltip" />

      <q-badge
        v-if="!$q.platform.is.nativeMobile"
        label="Ctrl + r"
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
