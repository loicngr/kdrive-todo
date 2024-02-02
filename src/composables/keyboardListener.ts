import { HandleKeyboardListener } from 'src/utils'
import {
  onBeforeUnmount,
  onMounted
} from 'vue'

export function useKeyboardListener(context: {
  [key: string]: {
    callback: (e: KeyboardEvent) => void
  }
}) {
  const listenerKeyboard = new HandleKeyboardListener(context)

  onMounted(() => {
    listenerKeyboard.createListenerKeyDown()
  })

  onBeforeUnmount(() => {
    listenerKeyboard.removeListenerKeyDown()
  })

  return {
    listenerKeyboard,
  }
}
