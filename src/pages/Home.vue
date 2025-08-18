<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import dataset from '@/data/foods.json';
import type { FoodDataset, FoodCategory, BaseMeal } from '@/types/food';
import { usePrefs } from '@/modules/prefs/usePrefs';
import { recommendOne } from '@/modules/recommend/service';
import DietaryPicker from '@/components/picker/DietaryPicker.vue';
import MealPicker from '@/components/picker/MealPicker.vue';
import ResultCard from '@/components/result/ResultCard.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';

// ✅ 餐別：從 localStorage 還原，沒有就預設 'all'
const MEAL_KEY = 'meal:selected';
const initialMeal = (localStorage.getItem(MEAL_KEY) as FoodCategory) || 'all';
const meal = ref<FoodCategory>(initialMeal);
watch(meal, (v) => localStorage.setItem(MEAL_KEY, v));

const { prefs } = usePrefs();

const ds = dataset as unknown as FoodDataset;
const resultId = ref<string | null>(null);
const resultItem = computed(() => (resultId.value ? ds.items[resultId.value] : null));

// 🎲 抽獎動畫 + 嚴格防抖（動畫期間與冷卻期間都不可再觸發）
const rolling = ref(false); // 轉動動畫中
const cooling = ref(false); // 額外冷卻中

async function doRecommend() {
  if (rolling.value || cooling.value) return;

  rolling.value = true;

  const r = recommendOne({ meal: meal.value, dataset: ds, prefs: prefs.value });
  resultId.value = r?.id ?? null;

  // 旋轉動畫結束
  await new Promise((res) => setTimeout(res, 550));
  rolling.value = false;

  // 冷卻期（防止連點）
  cooling.value = true;
  await new Promise((res) => setTimeout(res, 1000));
  cooling.value = false;
}

/** 若變更條件使當前結果不再合法 → 清空（不自動重抽） */
function isCurrentResultValid(): boolean {
  if (!resultId.value) return true;
  const item = ds.items[resultId.value];
  if (!item) return false;

  if (meal.value !== 'all') {
    const ids = ds.categories[meal.value as BaseMeal] ?? [];
    if (!ids.includes(resultId.value)) return false;
  }
  const diet = prefs.value.dietary ?? {};
  if (diet.vegetarian && !item.diet?.vegetarian) return false;
  if (diet.noBeef && item.diet?.beef) return false;
  if (diet.noPork && item.diet?.pork) return false;
  return true;
}
watch(
  [meal, () => prefs.value.dietary],
  () => {
    if (!isCurrentResultValid()) resultId.value = null;
  },
  { deep: true },
);

const headerGradient = computed(() => {
  switch (meal.value) {
    case 'breakfast':
      return 'fresh';
    case 'lunch':
      return 'fun';
    case 'dinner':
      return 'warm';
    case 'all':
    default:
      return 'warm';
  }
});
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <AppHeader
      emoji="🍱"
      :gradient="headerGradient"
      subtitle="不知道吃什麼？按一下交給我。"
      title="餐餐不煩惱"
    />

    <div class="rounded-2xl bg-white shadow p-4 mb-4 flex flex-col gap-4">
      <MealPicker v-model="meal" />
      <DietaryPicker v-model="prefs.dietary" />

      <!-- 🎲 漸層抽獎按鈕（禁用＋動畫＋防抖） -->
      <button
        :aria-busy="rolling || cooling ? 'true' : 'false'"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-500"
        :disabled="rolling || cooling"
        type="button"
        @click="doRecommend"
      >
        <span
          aria-hidden="true"
          class="text-lg"
          :class="rolling ? 'animate-[spin_0.6s_linear_infinite]' : ''"
        >
          🎲
        </span>
        <span>{{ rolling || cooling ? '抽籤中…' : '隨機推薦' }}</span>
      </button>
    </div>

    <Transition mode="out-in" name="pop">
      <ResultCard v-if="resultItem" :key="resultItem.id" :item="resultItem" />
      <el-empty
        v-else
        class="bg-white rounded-2xl shadow"
        :description="rolling || cooling ? '抽籤中…' : '條件變更後，請重新抽選'"
      />
    </Transition>

    <AppFooter />
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* ResultCard 彈出動畫（scale + fade） */
.pop-enter-active,
.pop-leave-active {
  @apply transition duration-200 ease-out;
}
.pop-enter-from {
  opacity: 0;
  transform: scale(0.98);
}
.pop-enter-to {
  opacity: 1;
  transform: scale(1);
}
.pop-leave-from {
  opacity: 1;
  transform: scale(1);
}
.pop-leave-to {
  opacity: 0;
  transform: scale(0.98);
}
</style>
