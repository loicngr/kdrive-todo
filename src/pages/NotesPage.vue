<template>
  <q-page class="row">
    <suspense>
      <list-notes-view />

      <template #fallback>
        <q-spinner-dots
          size="lg"
          color="primary"
        />
      </template>
    </suspense>
  </q-page>
</template>

<script lang="ts" setup>
import ListNotesView from 'components/ListNotesView.vue'
</script>
