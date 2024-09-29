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
import { isDefined, isNotDefined } from '@petrhdk/util';
import { useMutationObserver } from '@vueuse/core';
import { computed, onMounted, ref, watchEffect } from 'vue';

/* props */
const props = withDefaults(defineProps<{
  relativeTo: 'parentElement' | 'previousElementSibling',
  placement: Placement,
  fallbackPlacements?: Placement[],
  offset?: OffsetOptions,
  baseWidth?: number,
  viewportPadding?: number,
  teleportTo?: Node,
  zIndex?: string,
}>(), {
  fallbackPlacements: ({ placement }) => {
    const side = placement.split('-')[0];
    return [`${side}-start`, `${side}-end`, side, 'right-start', 'right-end', 'right', 'left-start', 'left-end', 'left', 'bottom-start', 'bottom-end', 'bottom', 'top-start', 'top-end', 'top'] as Placement[];
  },
  offset: 8,
  viewportPadding: 8,
  teleportTo: () => document.body,
  zIndex: '100',
});

/* template refs */
const teleport = ref<Comment>(); // rendered as `<!--teleport start--><!--teleport end-->`
const slotContainer = ref<HTMLElement>();

/* reference element */
const referenceEl = computed<Element | undefined>(() => {
  if (isNotDefined(teleport.value))
    return undefined;

  if (props.relativeTo === 'parentElement') {
    if (isDefined(teleport.value.parentElement)) {
      return teleport.value.parentElement;
    }
    if (teleport.value.getRootNode() instanceof ShadowRoot) {
      return (teleport.value.getRootNode() as ShadowRoot).host as HTMLElement;
    }
  }

  if (props.relativeTo === 'previousElementSibling') {
    if (isDefined(teleport.value.previousElementSibling)) {
      return teleport.value.previousElementSibling as HTMLElement;
    }
  }

  return undefined;
});

/* floating element, retrieved from slot */
const floatingEl = ref<HTMLElement>();
function updateFloatingEl() {
  floatingEl.value = slotContainer.value?.firstElementChild as HTMLElement | null | undefined ?? undefined;
  // create warning for inproper usage
  if ((slotContainer.value?.childElementCount ?? 0) > 1)
    throw new Error('More than one element inside of <Floating></Floating>');
}
onMounted(updateFloatingEl);
useMutationObserver(slotContainer, updateFloatingEl, { childList: true });

/* dynamic positioning */
const maxWidth = ref<string>();
const maxHeight = ref<string>();
const minWidth = ref<string>();
const { floatingStyles } = useFloating(referenceEl, floatingEl, {
  placement: props.placement,
  middleware: [
    offset(props.offset),
    flip({
      fallbackPlacements: props.fallbackPlacements,
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
        minWidth.value =
          isDefined(props.baseWidth)
            ? `${Math.min(
              props.baseWidth,
              availableWidth - 2 * props.viewportPadding,
            )}px`
            : undefined;
      },
    }),
  ],
  whileElementsMounted: autoUpdate,
});
watchEffect(() => {
  if (isNotDefined(floatingEl.value))
    return;
  Object.assign(floatingEl.value.style, {
    ...floatingStyles.value, // 'absolute', 'top', 'left', 'transform'
    maxWidth: maxWidth.value,
    maxHeight: maxHeight.value,
    minWidth: minWidth.value,
    zIndex: props.zIndex,
  });
});
</script>

<template>
  <Teleport
    ref="teleport"
    :to="teleportTo"
  >
    <!-- slot container (for watching slot changes) -->
    <div ref="slotContainer" :style="{ display: 'contents' }">
      <!-- slot content (the floating element) -->
      <slot />
    </div>
  </Teleport>
</template>
