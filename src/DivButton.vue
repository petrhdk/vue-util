<script setup lang="ts">
import { isDefined } from '@petrhdk/util';
import { useEventListener } from '@vueuse/core';
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  innerHtml?: string,
  clickOnEnter?: boolean,
  clickOnSpace?: boolean,
  blurOnEscape?: boolean,
}>(), {
  clickOnEnter: true,
  clickOnSpace: true,
  blurOnEscape: true,
});

/* template ref */
const el = ref<HTMLElement>();

/* focus logic */
useEventListener(el, 'keydown', (event) => {
  if (event.code === 'Enter' && props.clickOnEnter) {
    el.value!.click();
  }
  if (event.code === 'Space' && props.clickOnSpace) {
    el.value!.click();
  }
  if (event.code === 'Escape' && props.blurOnEscape) {
    el.value!.blur();
  }
});

/* expose element reference to the component instance object */
defineExpose({ el });
</script>

<template>
  <div
    v-if="isDefined(innerHtml)"

    ref="el"
    role="button"
    tabindex="0"

    v-html="innerHtml"
  />

  <div
    v-else

    ref="el"
    role="button"
    tabindex="0"
  >
    <slot />
  </div>
</template>
