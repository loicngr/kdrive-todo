<template>
  <q-page class="row items-center justify-evenly">
    <suspense>
      <todo-view />

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
import TodoView from 'components/TodoView.vue'
</script>

<style scoped>

</style>
