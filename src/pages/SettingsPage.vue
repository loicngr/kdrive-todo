<template>
  <q-page class="row items-center justify-evenly">
    <suspense>
      <settings-view />

      <template #fallback>
        <q-spinner-dots
          size="lg"
          color="primary"
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
