<template>
  <q-list
    ref="listRef"
  >
    <q-item
      v-for="todo in value"
      :key="todo.id"
    >
      <q-item-section
        side
        style="padding: 0 !important; margin: 0 !important;"
      >
        <q-icon
          left
          style="cursor: move"
          class="handle"
          name="fa fa-grip-vertical"
        />
      </q-item-section>

      <q-item-section side>
        <q-checkbox
          v-model="todo.done"
        />
      </q-item-section>

      <q-item-section>
        {{ todo.content }}
      </q-item-section>

      <q-item-section side>
        <q-btn
          fab-mini
          unelevated
          dense
          icon="fa fa-remove"
          @click="$emit('delete', { ...todo })"
        />
      </q-item-section>
    </q-item>

    <q-separator
      spaced
      inset="item"
    />
  </q-list>
</template>

<script setup lang="ts">
import type { Todo } from 'src/interfaces/todo'
import { useSortable } from '@vueuse/integrations/useSortable'
import { ref } from 'vue'
import { QList } from 'quasar'

defineEmits(['delete'])

const listRef = ref<InstanceType<typeof HTMLElement> | null>(null)
const value = defineModel<Todo[]>({
  required: true,
})

useSortable(listRef, value, {
  handle: '.handle',
})
</script>

<style scoped>

</style>
