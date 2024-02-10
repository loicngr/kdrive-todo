<template>
  <q-layout
    view="lHh Lpr lFf"
    class="bg-dark-page"
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
          color="primary"
          :style="$q.screen.lt.sm ?
            'padding: 0 !important; min-height: 35px !important; min-width: 35px !important;' :
            ''"
          @click="goTo()"
        >
          <q-tooltip
            self="bottom right"
            anchor="top right"
          >
            {{ t('gotToPage', { name: goToPageName }) }}
          </q-tooltip>
        </q-btn>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  useRoute,
  useRouter,
} from 'vue-router'
import {
  ROUTER_INDEX_NAME,
  ROUTER_SETTINGS_NAME,
} from 'src/constants'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const {
  t,
} = useI18n()

const canShow = computed(() => {
  return route.name === ROUTER_SETTINGS_NAME || route.name === ROUTER_INDEX_NAME
})

const goToPageName = computed(() => {
  const i18nKey = route.name !== ROUTER_INDEX_NAME
    ? ROUTER_INDEX_NAME
    : ROUTER_SETTINGS_NAME

  return t(i18nKey)
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

  void router.replace({
    name: ROUTER_SETTINGS_NAME,
  })
}

function goToHome () {
  if (route.name === ROUTER_INDEX_NAME) {
    return
  }

  void router.replace({
    name: ROUTER_INDEX_NAME,
  })
}

function goTo () {
  route.name !== ROUTER_INDEX_NAME
    ? goToHome()
    : goToSettings()
}
</script>
