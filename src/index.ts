import { assertInstanceof, isNotDefined } from '@petrhdk/util';
import { useEventListener } from '@vueuse/core';
import { type MaybeRefOrGetter, toValue } from 'vue';

export { default as DivButton } from './DivButton.vue';
export { default as Floating } from './Floating.vue';

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
