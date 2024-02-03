<template>
  <q-page class="row items-center justify-evenly">
    <suspense>
      <text-view />

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
import TextView from 'components/TextView.vue'
</script>

<style scoped>

</style>
