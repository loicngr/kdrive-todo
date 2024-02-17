<template>
  <q-dialog
    v-bind="$attrs"
    ref="dialogRef"
    position="standard"
    @hide="onDialogHide"
  >
    <q-card>
      <q-card-section
        class="bg-dark"
        style="margin: 10px; padding: 0;"
      >
        <q-form @submit.prevent="onSubmit">
          <q-color
            v-model.trim="color"
            default-view="palette"
            :rules="[$rules.required, $rules.validColor]"
            style="width: 100%"
            no-footer
            :palette="[
              '#019A9D',
              '#D9B801',
              '#E8045A',
              '#B2028A',
              '#2A0449',
              '#1d8a01',
              '#5e1e05',
              '#937e76',
              '#151515',
            ]"
          />

          <q-btn
            :label="$t('save')"
            class="full-width q-mt-md"
            type="submit"
            color="primary"
          />

          <q-btn
            :label="$t('reset')"
            class="full-width q-mt-sm"
            color="negative"
            @click="onDialogOK(undefined)"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'

defineEmits([
  ...useDialogPluginComponent.emits,
])

const color = ref<string>('')

const {
  dialogRef,
  onDialogHide,
  onDialogOK,
} = useDialogPluginComponent()

function onSubmit () {
  const _color = color.value.trim()

  onDialogOK(_color.length > 0
    ? _color
    : undefined)
}
</script>
