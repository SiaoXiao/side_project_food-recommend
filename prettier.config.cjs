// prettier.config.cjs
/** @type {import('prettier').Config} */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  // Vue & HTML
  htmlWhitespaceSensitivity: 'ignore',
  vueIndentScriptAndStyle: false,
  // 可加上忽略檔
  // plugins: [], // 一般不用加外掛
};
