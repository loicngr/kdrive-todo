<template>
  <q-page class="row items-center justify-evenly">
    <suspense>
      <settings-view />

      <template #fallback>
        <q-spinner-dots
          size="lg"
          color="purple-6"
        />
      </template>
    </suspense>
  </q-page>
</template>

<script setup lang="ts">
import SettingsView from 'components/SettingsView.vue'
</script>

<style scoped>

</style>
