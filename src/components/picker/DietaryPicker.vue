<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { DietaryPrefs } from '@/types/prefs';

const model = defineModel<DietaryPrefs>({
  default: { noBeef: false, noPork: false, vegetarian: false },
});

const form = reactive<DietaryPrefs>({
  noBeef: !!model.value?.noBeef,
  noPork: !!model.value?.noPork,
  vegetarian: !!model.value?.vegetarian,
});

watch(
  model,
  (val) => {
    form.noBeef = !!val?.noBeef;
    form.noPork = !!val?.noPork;
    form.vegetarian = !!val?.vegetarian;
  },
  { immediate: true, deep: true },
);

watch(
  form,
  (val) => {
    const next = { ...val };
    if (next.vegetarian) {
      next.noBeef = false;
      next.noPork = false;
    }
    model.value = next;
  },
  { deep: true },
);

function toggle(key: keyof DietaryPrefs) {
  if (key === 'vegetarian') {
    form.vegetarian = !form.vegetarian;
  } else if (!form.vegetarian) {
    form[key] = !form[key];
  }
}
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-gray-700">飲食偏好</label>

    <div class="flex flex-wrap gap-3">
      <button
        :aria-pressed="form.noBeef"
        class="chip"
        :class="[{ active: form.noBeef, disabled: form.vegetarian }]"
        :disabled="form.vegetarian"
        type="button"
        @click="toggle('noBeef')"
      >
        <span aria-hidden="true" class="emoji">🐮</span>
        <span>不吃牛</span>
      </button>

      <button
        :aria-pressed="form.noPork"
        class="chip"
        :class="[{ active: form.noPork, disabled: form.vegetarian }]"
        :disabled="form.vegetarian"
        type="button"
        @click="toggle('noPork')"
      >
        <span aria-hidden="true" class="emoji">🐷</span>
        <span>不吃豬</span>
      </button>

      <button
        :aria-pressed="form.vegetarian"
        class="chip"
        :class="[{ active: form.vegetarian, vegetarian: form.vegetarian }]"
        type="button"
        @click="toggle('vegetarian')"
      >
        <span aria-hidden="true" class="emoji">🥬</span>
        <span>素食</span>
      </button>
    </div>

    <p v-if="form.vegetarian" class="text-xs text-gray-400">
      已啟用素食，系統會自動忽略含牛與含豬的餐點。
    </p>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.chip {
  @apply inline-flex items-center gap-2 px-3 py-2 rounded-full border border-gray-200
         bg-white text-gray-700 shadow-sm transition
         hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2
         focus:ring-sky-300 relative overflow-hidden;
}

/* 預設 active（不吃牛 / 不吃豬 用這個橘紅色） */
.chip.active {
  @apply text-white border-transparent;
  background: linear-gradient(90deg, #f97316 0%, #ef4444 100%); /* from-orange-500 to-red-500 */
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.25);
}

/* 素食專屬 active（綠色漸層） */
.chip.active.vegetarian {
  background: linear-gradient(90deg, #22c55e 0%, #16a34a 100%); /* from-green-500 to-green-600 */
  box-shadow: 0 6px 14px rgba(22, 163, 74, 0.25);
}

/* 禁用狀態（灰掉＋斜線封印） */
.chip.disabled {
  @apply bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed opacity-90;
}
.chip.disabled::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.5) 0,
    rgba(255, 255, 255, 0.5) 2px,
    transparent 2px,
    transparent 6px
  );
  border-radius: inherit;
  pointer-events: none;
}

.emoji {
  line-height: 1;
}
</style>
