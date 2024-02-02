<template>
  <q-btn
    fab
    icon="fa fa-save"
    color="purple-6"
    v-bind="$attrs"
  >
    <template #default>
      <slot name="tooltip" />

      <q-badge
        v-if="!$q.platform.is.nativeMobile"
        label="Ctrl + s"
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
