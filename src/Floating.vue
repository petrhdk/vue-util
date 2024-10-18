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
import { useEventListener, useMutationObserver } from '@vueuse/core';
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
  toggleOnHover?: boolean,
}>(), {
  fallbackPlacements: ({ placement }) => {
    if (placement === 'top') {
      return ['bottom', 'right', 'left'];
    }
    if (placement === 'bottom') {
      return ['top', 'right', 'left'];
    }
    if (placement === 'left') {
      return ['right', 'bottom', 'top'];
    }
    if (placement === 'right') {
      return ['left', 'bottom', 'top'];
    }

    const [side, alignment] = placement.split('-') as ['top' | 'bottom' | 'left' | 'right', 'start' | 'end'];

    function opposite(sideOrAlignment: 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end') {
      switch (sideOrAlignment) {
        case 'top': return 'bottom';
        case 'bottom': return 'top';
        case 'left': return 'right';
        case 'right': return 'left';
        case 'start': return 'end';
        case 'end': return 'start';
      }
    }

    function diagonal(side: 'top' | 'bottom' | 'left' | 'right') {
      switch (side) {
        case 'right': return 'bottom';
        case 'bottom': return 'right';
        case 'left': return 'top';
        case 'top': return 'left';
      }
    }

    return [
    // `${side}-${alignment}`,
      `${side}-${opposite(alignment)}`,
      `${opposite(side)}-${alignment}`,
      `${opposite(side)}-${opposite(alignment)}`,
      `${diagonal(side)}-${alignment}`,
      `${diagonal(side)}-${opposite(alignment)}`,
      `${opposite(diagonal(side))}-${alignment}`,
      `${opposite(diagonal(side))}-${opposite(alignment)}`,
      side,
      opposite(side),
      diagonal(side),
      opposite(diagonal(side)),
    ] as Placement[];
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

/* reference element hover state */
const referenceElementIsHovered = ref(false);
// initial hover state
watchEffect(() => {
  if (isDefined(referenceEl.value)) {
    referenceElementIsHovered.value = referenceEl.value.matches(':hover');
  }
});
// update hover state
useEventListener(referenceEl, ['mouseenter', 'mouseleave'], (event) => {
  referenceElementIsHovered.value = event.type === 'mouseenter';
});

/* collect slot content */
const slotElement = ref<HTMLElement>();
function updateSlotElement() {
  // update slot element
  slotElement.value = slotContainer.value!.firstElementChild as HTMLElement | null | undefined ?? undefined;
  // warning for inproper usage
  if ((slotContainer.value!.childElementCount) > 1) console.error('More than one element inside of <Floating>!');
}
onMounted(updateSlotElement);
useMutationObserver(slotContainer, updateSlotElement, { childList: true });

/* floating element */
const floatingEl = computed(() => {
  if (props.toggleOnHover && !referenceElementIsHovered.value)
    return undefined;
  return slotElement.value;
});

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
  if (isDefined(floatingEl.value)) {
    Object.assign(floatingEl.value.style, {
      ...floatingStyles.value, // 'absolute', 'top', 'left', 'transform'
      maxWidth: maxWidth.value,
      maxHeight: maxHeight.value,
      minWidth: minWidth.value,
      zIndex: props.zIndex,
    });
  }
});
</script>

<template>
  <Teleport
    ref="teleport"
    :to="teleportTo"
  >
    <!-- slot container (for watching slot changes) -->
    <div
      ref="slotContainer"
      :style="{ display: isDefined(floatingEl) ? 'contents' : 'none' }"
    >
      <!-- slot content (the floating element) -->
      <slot />
    </div>
  </Teleport>
</template>
