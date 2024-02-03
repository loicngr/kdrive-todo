<template>
  <q-input
    v-model.trim="model"
    v-bind="mergedAttrs"
    :type="hide ? 'password' : 'text'"
  >
    <template #append>
      <slot name="append-before" />

      <slot name="append">
        <q-icon
          :name="inputIcon"
          color="white"
          :class="{
            'q-ml-sm': typeof slots['append-before'] !== 'undefined',
            'q-mr-sm': typeof slots['append-after'] !== 'undefined'
          }"
          class="cursor-pointer"
          @click="toggleHide()"
        />
      </slot>

      <slot name="append-after" />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  useAttrs,
  useSlots
} from 'vue'

defineOptions({
  inheritAttrs: false,
})

const hide = ref(true)
const model = defineModel<string | undefined>({
  required: true
})

const slots = useSlots()
const attrs = useAttrs()

const mergedAttrs = computed(() => ({
  ...attrs,
}))

const inputIcon = computed(() => {
  return `fa fa-${hide.value ? 'eye-slash' : 'eye'}`
})

function toggleHide () {
  hide.value = !hide.value
}
</script>

<style scoped>

</style>
