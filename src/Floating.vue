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
import { assertInstanceof, isDefined } from '@petrhdk/util';
import { useMutationObserver } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

/* props */
const props = withDefaults(defineProps<{
  teleportTo: Node,
  relativeTo: 'parentElement' | 'previousElementSibling',
  placements?: [Placement, ...Placement[]], // array with at least 1 placement
  offset?: OffsetOptions,
  viewportPadding?: number,
}>(), {
  placements: () => ['bottom', 'bottom-start', 'bottom-end', 'right-start', 'right', 'right-end', 'left-start', 'left', 'left-end', 'top', 'top-start', 'top-end'],
  offset: 8,
  viewportPadding: 8,
});

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
    offset(props.offset),
    flip({
      fallbackPlacements: props.placements.slice(1),
    }),
    shift({
      mainAxis: true,
      crossAxis: true,
      padding: props.viewportPadding,
    }),
  ],
  whileElementsMounted: autoUpdate,
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
