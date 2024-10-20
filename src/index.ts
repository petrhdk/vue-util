import { assertInstanceof, isDefined, isNotDefined } from '@petrhdk/util';
import { useEventListener } from '@vueuse/core';
import { type MaybeRefOrGetter, ref, toRef, toValue, watch } from 'vue';

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

export function useElementHover(el: MaybeRefOrGetter<Element | undefined>) {
  const isHovered = ref(false);

  // initial hover state
  watch(toRef(el), (newValue) => {
    isHovered.value = isDefined(newValue) && newValue.matches(':hover');
  });

  // update hover state
  useEventListener(el, ['mouseenter', 'mouseleave'], (event) => {
    isHovered.value = event.type === 'mouseenter';
  });

  return isHovered;
}
