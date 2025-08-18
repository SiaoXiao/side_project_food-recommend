// eslint.config.js
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier/flat'; // ⬅️ 關鍵：關閉與 Prettier 衝突的規則

export default [
  // 忽略
  {
    ignores: ['dist', 'node_modules', 'coverage', '*.min.*'],
  },

  // JS 建議
  js.configs.recommended,

  // TS 建議
  ...tseslint.configs.recommended,

  // Vue 推薦（flat）
  ...vue.configs['flat/recommended'],

  // 讓 .vue 用 vue-parser，且 <script lang="ts"> 用 TS 解析
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser, // 瀏覽器全域（localStorage、setTimeout 等）
      },
    },
    rules: {
      // 依你專案習慣微調
      'vue/multi-word-component-names': 'off',
    },
  },

  // 純 TS 檔
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // Node 腳本 / 設定檔
  {
    files: [
      '**/*.config.*',
      '**/*.cjs',
      '**/scripts/**',
      'vite.config.*',
      'eslint.config.js',
      'prettier.config.*',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // 常用：忽略底線開頭未用到的參數/變數
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },

  // （可選）放寬部分 Vue 排版規則，交給 Prettier 主導
  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': [
        'warn',
        { singleline: 3, multiline: { max: 1, allowFirstLine: true } },
      ],
      'vue/html-indent': 'off', // 交給 Prettier
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attributes-order': ['warn', { alphabetical: true }],
      'vue/require-default-prop': 'off', // 如需強制 default，可改回 'warn' 並在元件用 withDefaults
    },
  },

  // ⬇️ 一定要放在最後：關閉所有與 Prettier 衝突的規則
  eslintConfigPrettier,
];
