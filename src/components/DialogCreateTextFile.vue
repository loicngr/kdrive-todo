<template>
  <q-dialog
    v-bind="$attrs"
    ref="dialogRef"
    persistent
    @hide="onDialogHide"
  >
    <q-card
      style="min-width: 50vw"
      class="column"
    >
      <q-form
        class="col column no-wrap"
        @submit="onDialogOK({ filename: deburr(filename ?? '') })"
      >
        <q-card-section class="col-auto">
          <div class="text-h6">
            Create a new text file
          </div>
        </q-card-section>

        <q-card-section class="q-col-gutter-sm row items-center justify-between">
          <q-input
            v-model.trim="filename"
            label="Filename *"
            suffix=".txt"
            autofocus
            :rules="[$rules.required, $rules.validFileNameOrFolder]"
            class="col-12"
            type="text"
          />
        </q-card-section>

        <q-card-actions
          align="right"
          class="q-gutter-sm"
          data-cy="lwf-dialog-footer"
        >
          <q-btn
            v-close-popup
            label="Close"
            color="negative"
            data-cy="lwf-dialog-footer-btn-cancel"
            @click="onDialogCancel"
          />

          <q-btn
            type="submit"
            label="Create"
            color="primary"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import deburr from 'lodash/fp/deburr'

defineEmits([
  ...useDialogPluginComponent.emits,
])

const filename = ref(undefined)

const {
  dialogRef,
  onDialogHide,
  onDialogCancel,
  onDialogOK,
} = useDialogPluginComponent()
</script>
