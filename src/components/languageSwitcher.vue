<template>
  <q-select
    v-model="value"
    :options="localeOptions"
    :label="t('language')"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="min-width: 150px"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const {
  t,
} = useI18n({
  useScope: 'global',
})

const value = defineModel<string>({
  required: true,
})

const localeOptions = computed(() => {
  return [
    {
      value: 'en-US',
      label: t('english'),
    },
    {
      value: 'fr-FR',
      label: t('french'),
    },
  ]
})
</script>

<style scoped>

</style>
