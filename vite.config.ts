import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwind from '@tailwindcss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    tailwind(),
    AutoImport({
      // 自動匯入 Vue / VueUse 等 API；要用再加
      imports: ['vue'],
      dts: 'auto-imports.d.ts',
      eslintrc: { enabled: false },
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: 'components.d.ts',
      resolvers: [
        ElementPlusResolver({
          // 自動載入樣式（建議用 sass，需安裝 sass）
          importStyle: 'sass',
        }),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
