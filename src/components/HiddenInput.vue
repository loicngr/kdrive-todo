<template>
  <q-input
    v-model.trim="value"
    v-bind="mergedAttrs"
    :type="hide
      ? 'password'
      : defaultType"
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
  useAttrs,
  useSlots,
} from 'vue'

defineOptions({
  inheritAttrs: false,
})

withDefaults(
  defineProps<{
    defaultType?: string
  }>(),
  {
    defaultType: 'text',
  },
)

const value = defineModel<string | undefined>({
  required: true,
})

const hide = defineModel<boolean>('hide', {
  required: false,
  default: true,
})

const slots = useSlots()
const attrs = useAttrs()

const mergedAttrs = computed(() => ({
  ...attrs,
}))

const inputIcon = computed(() => {
  return `fa fa-${hide.value
  ? 'eye-slash'
  : 'eye'}`
})

function toggleHide () {
  hide.value = !hide.value
}
</script>

<style scoped>

</style>
