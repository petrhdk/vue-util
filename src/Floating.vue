<script setup lang="ts">
import {
  autoUpdate,
  flip,
  offset,
  type OffsetOptions,
  type Placement,
  shift,
  useFloating,
} from '@floating-ui/vue';
import { assertInstanceof, focusMenuItem, isDefined, isNotDefined } from '@petrhdk/util';
import { useEventListener, useMutationObserver } from '@vueuse/core';
import { computed, onMounted, ref, watch } from 'vue';

/* props */
const props = defineProps<{
  teleportTo: Node,
  relativeTo: 'parentElement' | 'previousElementSibling',
  placements: [Placement, ...Placement[]], // array with at least 1 placement
  offset?: OffsetOptions,
  autoFocus?: boolean,
  keyboardNavigation?: boolean,
}>();

/* emits */
const emit = defineEmits<{
  (eventType: 'lostFocus'): void,
}>();

/* template refs */
const teleport = ref<Comment>(); // rendered as `<!--teleport start--><!--teleport end-->`
const slotContainer = ref<HTMLElement>();

/* reference element */
const referenceEl = computed<HTMLElement | undefined>(() => {
  if (isDefined(teleport.value)) {
    if (props.relativeTo === 'previousElementSibling') {
      return isDefined(teleport.value.previousElementSibling)
        ? assertInstanceof(teleport.value.previousElementSibling, HTMLElement)
        : undefined;
    }
    if (props.relativeTo === 'parentElement') {
      return teleport.value.parentElement ?? undefined;
    }
  }
  return undefined;
});

/* slot element, to be positioned as floating */
const slotEl = ref<HTMLElement>();
function updateSlotEl() {
  slotEl.value =
    isDefined(slotContainer.value?.firstElementChild)
      ? assertInstanceof(slotContainer.value.firstElementChild, HTMLElement)
      : undefined;
  // create warning for inproper usage
  if ((slotContainer.value?.childElementCount ?? 0) > 1)
    throw new Error('More than one element inside of <Floating></Floating>');
}
onMounted(updateSlotEl);
useMutationObserver(slotContainer, updateSlotEl, { childList: true });

/* floating ui */
const { floatingStyles } = useFloating(referenceEl, slotEl, {
  placement: props.placements[0],
  middleware: [
    offset(props.offset ?? 8),
    flip({ fallbackPlacements: props.placements.slice(1) }),
    shift({ padding: 8 }),
  ],
  whileElementsMounted: autoUpdate,
});

/* auto-focus */
if (props.autoFocus) {
  watch(slotEl, () => {
    if (isDefined(slotEl.value)) {
      focusMenuItem(slotEl.value, 'first');
    }
  });
}

/* keyboard navigation */
if (props.keyboardNavigation) {
  useEventListener(slotEl, 'keydown', (event) => {
    if (event.code === 'ArrowUp') {
      focusMenuItem(slotEl.value!, 'previous');
    }

    if (event.code === 'ArrowDown') {
      focusMenuItem(slotEl.value!, 'next');
    }

    if (event.code === 'Escape') {
      // blur the currently focused element
      const documentRoot = assertInstanceof(slotEl.value!.getRootNode(), [Document, ShadowRoot]);
      (assertInstanceof(documentRoot.activeElement, Element) as HTMLElement).blur();
    }
  });
}

/* lostFocus event */
useEventListener(slotEl, 'focusout', (event) => {
  if (
    isNotDefined(event.relatedTarget) ||
    !slotEl.value!.contains(assertInstanceof(event.relatedTarget, Element))
  ) {
    emit('lostFocus');
  }
});
</script>

<template>
  <Teleport
    ref="teleport"
    :to="teleportTo"
  >
    <!-- slot container (for watching slot changes) -->
    <div ref="slotContainer" :style="{ display: 'contents' }">
      <!-- slot content (floating element) -->
      <slot :floating-styles="floatingStyles" />
    </div>
  </Teleport>
</template>
