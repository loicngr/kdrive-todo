<template>
  <template v-if="typeof vValue === 'string'">
    <div v-bind="$attrs">
      {{ vValue }}
    </div>
  </template>
  <template v-else>
    <q-list
      v-bind="$attrs"
    >
      <q-item
        v-for="todo in vValue"
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
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const value = defineModel<Item['content']>({
  required: true,
})

const vValue = computed(() => {
  if (typeof value.value === 'string') {
    return value.value
  }

  return value.value.slice(0, 5)
})
</script>
