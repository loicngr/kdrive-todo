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
      <q-card-section class="col-auto">
        <div class="text-h6">
          {{ $t('selectTag') }}
        </div>
      </q-card-section>

      <q-card-section class="col-auto">
        <q-list
          separator
        >
          <q-item
            v-for="tag in tags"
            :key="tag.id"
          >
            <q-item-section
              side
            >
              <q-checkbox
                :model-value="value === tag"
                @update:model-value="value = tag"
              />
            </q-item-section>

            <q-item-section>
              {{ tag.name }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions
        align="right"
        class="q-gutter-sm"
        data-cy="lwf-dialog-footer"
      >
        <q-btn
          v-close-popup
          :label="$t('close')"
          color="negative"
          data-cy="lwf-dialog-footer-btn-cancel"
          @click="onDialogCancel"
        />

        <q-btn
          :label="$t('ok')"
          color="primary"
          @click="onDialogOK(value)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar'
import { ref } from 'vue'
import { Tag } from 'src/interfaces/tag'

defineEmits([
  ...useDialogPluginComponent.emits,
])

defineProps<{
  tags: Tag[]
}>()

const value = ref<Tag | undefined>(undefined)

const {
  dialogRef,
  onDialogHide,
  onDialogCancel,
  onDialogOK,
} = useDialogPluginComponent()
</script>
