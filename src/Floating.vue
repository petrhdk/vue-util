<script setup lang="ts">
import {
  autoUpdate,
  flip,
  offset,
  type OffsetOptions,
  type Placement,
  shift,
  size,
  useFloating,
} from '@floating-ui/vue';
import { assertInstanceof, isDefined, isNotDefined } from '@petrhdk/util';
import { useMutationObserver } from '@vueuse/core';
import { computed, onMounted, ref, watchEffect } from 'vue';

/* props */
const props = withDefaults(defineProps<{
  relativeTo: 'parentElement' | 'previousElementSibling',
  placements?: [Placement, ...Placement[]], // array with at least 1 placement
  offset?: OffsetOptions,
  viewportPadding?: number,
  teleportTo?: Node,
  zIndex?: string,
}>(), {
  placements: () => ['bottom', 'bottom-start', 'bottom-end', 'right-start', 'right', 'right-end', 'left-start', 'left', 'left-end', 'top', 'top-start', 'top-end'],
  offset: 8,
  viewportPadding: 8,
  teleportTo: () => document.body,
  zIndex: '100',
});

/* template refs */
const teleport = ref<Comment>(); // rendered as `<!--teleport start--><!--teleport end-->`
const slotContainer = ref<HTMLElement>();

/* reference element */
const referenceEl = computed<HTMLElement | undefined>(() => {
  if (isNotDefined(teleport.value)) return undefined;

  if (props.relativeTo === 'previousElementSibling') {
    if (isDefined(teleport.value.previousElementSibling)) {
      return teleport.value.previousElementSibling as HTMLElement;
    }
  }

  if (props.relativeTo === 'parentElement') {
    if (isDefined(teleport.value.parentElement)) {
      return teleport.value.parentElement;
    }
    if (teleport.value.getRootNode() instanceof ShadowRoot) {
      return (teleport.value.getRootNode() as ShadowRoot).host as HTMLElement;
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
const maxWidth = ref<string>();
const maxHeight = ref<string>();
const { floatingStyles } = useFloating(referenceEl, slotEl, {
  placement: props.placements[0],
  middleware: [
    offset(props.offset),
    flip({
      fallbackPlacements: props.placements.slice(1),
      padding: props.viewportPadding,
    }),
    shift({
      mainAxis: true,
      crossAxis: true,
      padding: props.viewportPadding,
    }),
    size({
      apply({ availableWidth, availableHeight }) {
        maxWidth.value = `${availableWidth - 2 * props.viewportPadding}px`;
        maxHeight.value = `${availableHeight - 2 * props.viewportPadding}px`;
      },
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
      <slot
        :floating-styles="{
          ...floatingStyles, // 'absolute', 'top', 'left', 'transform'
          zIndex, // 'z-index'
          maxWidth, // max-width
          maxHeight, // max-height
        }"
      />
    </div>
  </Teleport>
</template>
