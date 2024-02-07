<template>
  <template v-if="typeof value === 'string'">
    {{ value }}
  </template>
  <template v-else>
    <q-list>
      <q-item
        v-for="todo in value"
        :key="todo.id"
        clickable
      >
        <q-item-section
          side
        >
          <q-checkbox
            :model-value="todo.done"
          />
        </q-item-section>

        <q-item-section
          :style="todo.done
            ? 'text-decoration-line: line-through;'
            : ''"
        >
          {{ todo.content }}
        </q-item-section>
      </q-item>
    </q-list>
  </template>
</template>

<script lang="ts" setup>
import { type Item } from 'src/interfaces/item'

const value = defineModel<Item['content']>({
  required: true,
})
</script>
