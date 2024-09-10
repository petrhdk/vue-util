/* type shim for importing asset files like .svg files (https://vitejs.dev/guide/features#client-types) */
/// <reference types="vite/client" />

/* type shim for importing .vue files */
declare module '*.vue' {
  import type { ComponentOptions } from 'vue';

  const component: ComponentOptions;
  export default component;
}
