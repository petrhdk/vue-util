import { assertInstanceof, findCommonParent, focusMenuItem, getFocusedElement, isNotDefined } from '@petrhdk/util';
import { useEventListener } from '@vueuse/core';
import { computed, type MaybeRefOrGetter, onMounted, toValue } from 'vue';

export { default as Floating } from './Floating.vue';

/**
 * automatic focus management for a given list of item elements in a menu
 */
export function useKeyboardNavigation(menuItems: MaybeRefOrGetter<Element[]>) {
  /* auto focus */
  onMounted(() => {
    focusMenuItem(toValue(menuItems), 'first');
  });

  /* keyboard navigation */
  const containerEl = computed(() => {
    if (toValue(menuItems).length) {
      return findCommonParent(toValue(menuItems));
    }
  });
  useEventListener(containerEl, 'keydown', (event: KeyboardEvent) => {
    const focusedEl = getFocusedElement(containerEl.value!);

    if (event.code === 'ArrowUp') {
      focusMenuItem(toValue(menuItems), 'previous');
    }

    if (event.code === 'ArrowDown') {
      focusMenuItem(toValue(menuItems), 'next');
    }

    if (event.code === 'Escape') {
      if (toValue(menuItems).includes(focusedEl!)) {
        (focusedEl as HTMLElement).blur();
      }
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      if (toValue(menuItems).includes(focusedEl!)) {
        (focusedEl as HTMLElement).click();
      }
    }
  });
}

/**
 * listen to when focus moves to somewhere outside the given element
 */
export function useFocusLeaveListener(el: MaybeRefOrGetter<Element | undefined>, handler: () => void) {
  useEventListener(el, 'focusout', (event: FocusEvent) => {
    if (
      isNotDefined(event.relatedTarget) ||
      !toValue(el)!.contains(assertInstanceof(event.relatedTarget, Element))
    ) {
      handler();
    }
  });
}
