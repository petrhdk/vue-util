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
import { assertInstanceof, delegateFocus, isDefined } from '@petrhdk/util';
import { useEventListener, useMutationObserver } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

/* props */
const props = defineProps<{
  teleportTo: Node,
  relativeTo: 'parentElement' | 'previousElementSibling',
  placements: [Placement, ...Placement[]], // array with at least 1 placement
  offset?: OffsetOptions,
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

/* auto focus - try to focus slotEl or any of its children */
onMounted(() => {
  delegateFocus(slotEl.value);
});

/* keyboard navigation */
useEventListener(slotEl, 'keydown', (event) => {
  const rootNode = assertInstanceof(slotEl.value!.getRootNode(), [Document, ShadowRoot]);
  const activeElement = rootNode.activeElement ?? undefined;

  if (event.code === 'ArrowUp') {
    delegateFocus(slotEl.value, { upFrom: activeElement });
  }

  if (event.code === 'ArrowDown') {
    delegateFocus(slotEl.value, { downFrom: activeElement });
  }

  if (event.code === 'Escape') {
    (activeElement as HTMLElement)?.blur?.();
  }
});

/* lost-focus event */
useEventListener(slotEl, 'focusout', (event) => {
  if (!slotEl.value!.contains(event.relatedTarget as HTMLElement)) {
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
