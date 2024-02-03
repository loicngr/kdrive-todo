<template>
  <q-layout
    view="lHh Lpr lFf"
    class="bg-grey-10 text-white"
  >
    <q-page-container>
      <router-view />

      <q-page-sticky
        v-if="canShow"
        position="bottom-left"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          :icon="goToPageIcon"
          color="purple-6"
          @click="goTo()"
        >
          <q-tooltip self="bottom right" anchor="top right">
            Go to {{ goToPageName }} page
          </q-tooltip>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  useRoute,
  useRouter
} from 'vue-router'
import {
  ROUTER_INDEX_NAME,
  ROUTER_SETTINGS_NAME,
  ROUTER_TEXT_NAME,
  ROUTER_TODO_NAME
} from 'src/constants'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const canShow = computed(() => {
  return route.name === ROUTER_SETTINGS_NAME || route.name === ROUTER_INDEX_NAME || route.name === ROUTER_TODO_NAME || route.name === ROUTER_TEXT_NAME
})

const goToPageName = computed(() => {
  return route.name !== ROUTER_INDEX_NAME
    ? ROUTER_INDEX_NAME
    : ROUTER_SETTINGS_NAME
})

const goToPageIcon = computed(() => {
  return route.name !== ROUTER_INDEX_NAME
    ? 'fa fa-home'
    : 'fa fa-gear'
})

function goToSettings () {
  if (route.name === ROUTER_SETTINGS_NAME) {
    return
  }

  router.replace({
    name: ROUTER_SETTINGS_NAME,
  })
}

function goToHome () {
  if (route.name === ROUTER_INDEX_NAME) {
    return
  }

  router.replace({
    name: ROUTER_INDEX_NAME,
  })
}

function goTo () {
  return route.name !== ROUTER_INDEX_NAME
    ? goToHome()
    : goToSettings()
}
</script>
