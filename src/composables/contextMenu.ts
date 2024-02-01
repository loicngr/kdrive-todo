import {
  computed,
  nextTick,
  ref
} from 'vue'
import cloneDeep from 'lodash/fp/cloneDeep'
import { ContextMenuOption } from 'src/interfaces/contextMenu'
import { CustomFileStat } from 'src/interfaces/file'

export function useContextMenu(baseContextMenuOptions: ContextMenuOption[]) {
  const contextMenuShow = ref(false)
  const contextMenuItem = ref<CustomFileStat | undefined>(undefined)

  const contextMenuOptions = computed((): ContextMenuOption[] => {
    return baseContextMenuOptions.filter((o) => typeof o.if === 'function'
      ? o.if(contextMenuItem.value)
      : o.if
    )
  })

  function closeMenu() {
    contextMenuItem.value = undefined

    void nextTick(() => {
      contextMenuShow.value = false
    })
  }

  function onActionClick (contextMenuOption: ContextMenuOption) {
    const targetAction = contextMenuOption.value
    const targetIdentifier = cloneDeep(contextMenuItem.value)

    console.log(targetIdentifier, targetAction)

    closeMenu()
  }

  return {
    closeMenu,
    contextMenuShow,
    contextMenuItem,
    contextMenuOptions
  }
}
