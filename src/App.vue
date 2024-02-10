<template>
  <router-view />
</template>

<script setup lang="ts">
import { useSettingsStore } from 'stores/settings'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { watchEffect } from 'vue'

const settingsStore = useSettingsStore()
const {
  locale,
} = useI18n({
  useScope: 'global',
})

const {
  language,
} = storeToRefs(settingsStore)

watchEffect(() => {
  locale.value = language.value
})
</script>
