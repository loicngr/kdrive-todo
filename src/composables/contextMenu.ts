import {
  computed,
  nextTick,
  ref,
} from 'vue'
import { type ContextMenuOption } from 'src/interfaces/contextMenu'
import { type CustomFileStat } from 'src/interfaces/file'

export function useContextMenu (baseContextMenuOptions: ContextMenuOption[]) {
  const contextMenuShow = ref(false)
  const contextMenuItem = ref<CustomFileStat | undefined>(undefined)

  const contextMenuOptions = computed((): ContextMenuOption[] => {
    return baseContextMenuOptions.filter((o) => typeof o.if === 'function'
      ? o.if(contextMenuItem.value)
      : o.if,
    )
  })

  function closeMenu () {
    contextMenuItem.value = undefined

    void nextTick(() => {
      contextMenuShow.value = false
    })
  }

  return {
    closeMenu,
    contextMenuShow,
    contextMenuItem,
    contextMenuOptions,
  }
}
