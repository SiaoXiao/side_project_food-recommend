<script setup lang="ts">
/**
 * AppHeader
 *
 * @prop {string} title - 主標題（必填）
 * @prop {string} [subtitle] - 副標題（選填）
 * @prop {string} [emoji] - 左側 emoji（例如：🍱）
 * @prop {'warm'|'fresh'|'fun'|'mono'} [gradient='warm'] - 漸層主題
 * @prop {boolean} [showEmoji=true] - 是否顯示 emoji
 */
interface Props {
  title: string;
  subtitle?: string;
  emoji?: string;
  gradient?: 'warm' | 'fresh' | 'fun' | 'mono';
  showEmoji?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  gradient: 'warm',
  showEmoji: true,
});

const gradientClass =
  {
    // 橘紅
    warm: 'bg-gradient-to-r from-orange-500 to-red-500',
    // 綠
    fresh: 'bg-gradient-to-r from-emerald-400 to-lime-600',
    // 粉紫
    fun: 'bg-gradient-to-r from-pink-500 to-purple-500',
    // 單色（無漸層，取決於文字色）
    mono: '',
  }[props.gradient] || 'bg-gradient-to-r from-orange-500 to-red-500';
</script>

<template>
  <header class="mb-6">
    <div class="flex items-start gap-3">
      <span
        v-if="showEmoji && emoji"
        aria-hidden="true"
        class="text-3xl md:text-4xl leading-none select-none"
      >
        {{ emoji }}
      </span>

      <div class="min-w-0">
        <h1
          :aria-label="title"
          class="text-2xl md:text-3xl font-bold leading-tight tracking-tight bg-clip-text text-transparent"
          :class="gradientClass || 'text-gray-900 dark:text-gray-100'"
        >
          {{ title }}
        </h1>

        <p v-if="subtitle" class="text-sm md:text-base text-gray-500 mt-1 truncate">
          {{ subtitle }}
        </p>
      </div>

      <div class="ml-auto">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>
