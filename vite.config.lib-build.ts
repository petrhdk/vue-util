import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

export default defineConfig({
  plugins: [
    vue(), // support for .vue files
    externalizeDeps(), // automatically add all dependencies to `build.rollupOptions.external` so they are not bundled into the library
    dts(), // automatically generate typescript declaration files (.d.ts)
  ],
  build: {
    lib: {
      entry: { index: 'src/index.ts' },
      formats: ['es', 'cjs'],
    },
    outDir: 'dist/lib/',
  },
});
