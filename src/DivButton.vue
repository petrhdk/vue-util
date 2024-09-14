<script setup lang="ts">
import { isDefined } from '@petrhdk/util';
import { useEventListener } from '@vueuse/core';
import { ref } from 'vue';

defineProps<{
  innerHtml?: string,
}>();

/* template ref */
const el = ref<HTMLElement>();

/* focus logic */
useEventListener(el, 'keydown', (event) => {
  if (event.code === 'Enter' || event.code === 'Space') {
    el.value!.click();
  }
  if (event.code === 'Escape') {
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
