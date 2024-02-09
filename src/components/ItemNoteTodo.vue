<template>
  <q-list>
    <q-item>
      <q-form
        class="col-12 row"
        @submit.prevent="onAdd()"
      >
        <q-item-section>
          <q-input
            ref="newTaskRef"
            v-model.trim="newValue.content"
            type="text"
            label="New task"
            maxlength="255"
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            fab-mini
            unelevated
            dense
            type="submit"
            icon="fa fa-add"
          />
        </q-item-section>
      </q-form>
    </q-item>

    <div
      ref="listRef"
      style="overflow: auto; max-height: 70vh"
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
          <q-input
            v-model.trim="todo.content"
            type="text"
            maxlength="255"
            dense
            hide-bottom-space
            hide-hint
            borderless
          />
        </q-item-section>

        <q-item-section side>
          <q-btn
            fab-mini
            unelevated
            dense
            icon="fa fa-remove"
            @click="deleteTodo(todo)"
          />
        </q-item-section>
      </q-item>
    </div>
  </q-list>
</template>

<script setup lang="ts">
import type { Todo } from 'src/interfaces/todo'
import { useSortable } from '@vueuse/integrations/useSortable'
import { ref } from 'vue'
import {
  QInput,
  QItem,
  QList,
} from 'quasar'
import { DEFAULT_TODO } from 'src/constants'
import cloneDeep from 'lodash/fp/cloneDeep'

defineEmits(['delete'])

const listRef = ref<InstanceType<typeof HTMLElement> | null>(null)
const value = defineModel<Todo[]>({
  required: true,
})

useSortable(listRef, value, {
  handle: '.handle',
})

const newTaskRef = ref<InstanceType<typeof QInput> | null>(null)
const newValue = ref<Todo>(cloneDeep(DEFAULT_TODO))

function deleteTodo (todo: Todo) {
  value.value = value.value.filter((t) => t !== todo)
}

async function onAdd () {
  value.value.push(cloneDeep(newValue.value))
  newValue.value = cloneDeep(DEFAULT_TODO)

  newTaskRef.value?.focus()
}
</script>

<style scoped>

</style>
