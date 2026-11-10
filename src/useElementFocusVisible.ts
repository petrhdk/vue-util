import type { MaybeRefOrGetter } from 'vue';
import { computed, onScopeDispose, ref } from 'vue';
import { useElementFocus } from './index.ts';

const focusVisibilityHeuristic = ref<boolean>(false);
function handleKeydown() {
  focusVisibilityHeuristic.value = true;
}
function handlePointerdown() {
  focusVisibilityHeuristic.value = false;
}

let composableUseCount = 0;

export function useElementFocusVisible(element: MaybeRefOrGetter<Element | undefined>) {
  // track raw focus
  const isFocused = useElementFocus(element);

  // start event listeners
  composableUseCount++;
  window.addEventListener('keydown', handleKeydown, { capture: true });
  window.addEventListener('pointerdown', handlePointerdown, { capture: true });

  // remove event listeners
  onScopeDispose(() => {
    composableUseCount--;
    if (composableUseCount === 0) {
      window.removeEventListener('keydown', handleKeydown, { capture: true });
      window.removeEventListener('pointerdown', handlePointerdown, { capture: true });
    }
  });

  // compute visible focus
  return computed(() => isFocused.value && focusVisibilityHeuristic.value);
}
