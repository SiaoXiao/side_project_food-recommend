<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
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

/* ---------------------------
   單一卡片模式
---------------------------- */
const resultId = ref<string | null>(null);
const resultItem = computed(() => (resultId.value ? ds.items[resultId.value] : null));

const rolling = ref(false); // 單抽：動畫中
const cooling = ref(false); // 單抽：冷卻中

// 左鍵文案：隨餐別動態變化
const mealText = computed(() => {
  switch (meal.value) {
    case 'breakfast':
      return '早餐';
    case 'lunch':
      return '午餐';
    case 'dinner':
      return '晚餐';
    default:
      return '單一';
  }
});
const singleButtonLabel = computed(() => `隨機推薦（${mealText.value}）`);

async function doRecommend() {
  if (rolling.value || cooling.value || rollingPlan.value || coolingPlan.value) return;

  // 切回單一模式
  resultPlan.value = null;

  rolling.value = true;

  const r = recommendOne({ meal: meal.value, dataset: ds, prefs: prefs.value });
  resultId.value = r?.id ?? null;

  // 動畫
  await new Promise((res) => setTimeout(res, 550));
  rolling.value = false;

  // 冷卻（防連點）
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
    // 設定變更時，同步清掉「計畫模式」結果
    resultPlan.value = null;
  },
  { deep: true },
);

// Header 漸層
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

/* ---------------------------
   計畫模式（固定推薦三餐，合併成一張卡）
---------------------------- */
type Item = NonNullable<typeof resultItem.value>;
type Plan = Partial<Record<'breakfast' | 'lunch' | 'dinner', Item>>;
const resultPlan = ref<Plan | null>(null);
const rollingPlan = ref(false); // 三餐：動畫中
const coolingPlan = ref(false); // 三餐：冷卻中

// 給 ResultCard 的資料：保留餐別標籤
type PlanPair = { meal: BaseMeal; item: Item };
const planPairs = computed<PlanPair[]>(() => {
  const p = resultPlan.value;
  if (!p) return [];
  const order: BaseMeal[] = ['breakfast', 'lunch', 'dinner'];
  return order.flatMap((k) => (p[k] ? [{ meal: k, item: p[k] as Item }] : []));
});

// 依餐別抽一筆（若無符合，回傳 null）
function recommendFor(mealKey: BaseMeal) {
  const r = recommendOne({ meal: mealKey, dataset: ds, prefs: prefs.value });
  return r ? ds.items[r.id] : null;
}

// 右鍵：固定推薦三餐（無視上方餐別），合併呈現在一張卡片
async function doRecommendPlan() {
  if (rolling.value || cooling.value || rollingPlan.value || coolingPlan.value) return;

  rollingPlan.value = true;
  resultId.value = null; // 清掉單一模式結果

  const plan: Plan = {};
  (['breakfast', 'lunch', 'dinner'] as BaseMeal[]).forEach((m) => {
    const picked = recommendFor(m) as Item | null;
    if (picked) plan[m] = picked; // 只有有值才賦
  });
  resultPlan.value = plan;

  // 進場動畫時間（與單抽一致的體感）
  await new Promise((res) => setTimeout(res, 550));
  rollingPlan.value = false;

  // 立即捲到底（保險）
  await nextTick();
  requestAnimationFrame(() => handleAfterEnter());

  // 冷卻（防連點）
  coolingPlan.value = true;
  await new Promise((res) => setTimeout(res, 1000));
  coolingPlan.value = false;
}

// 重抽整組三餐
function retryPlan() {
  doRecommendPlan();
}

/* ---------------------------
   進場動畫結束後自動捲到底
---------------------------- */
const bottomSentinel = ref<HTMLElement | null>(null);
/** 卡片進場動畫完成後：捲到底（更自然） */
function handleAfterEnter() {
  nextTick(() => {
    if (bottomSentinel.value?.scrollIntoView) {
      bottomSentinel.value.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      const doc = document.scrollingElement || document.documentElement;
      window.scrollTo({ top: doc.scrollHeight, behavior: 'smooth' });
    }
  });
}
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

      <!-- 🎛️ 按鈕群：手機直向；md 以上橫向，固定最小寬避免跳動 -->
      <div class="flex flex-col md:flex-row md:flex-wrap gap-3">
        <!-- 左鍵：單一抽（文案跟著餐別變動） -->
        <button
          :aria-busy="rolling || cooling ? 'true' : 'false'"
          class="w-full md:w-auto min-w-[200px] whitespace-nowrap inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-white font-semibold shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-500"
          :disabled="rolling || cooling || rollingPlan || coolingPlan"
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
          <span>{{ rolling || cooling ? '抽籤中…' : singleButtonLabel }}</span>
        </button>

        <!-- 右鍵：固定推薦三餐（合併一張卡） -->
        <button
          :aria-busy="rollingPlan ? 'true' : 'false'"
          class="w-full md:w-auto min-w-[200px] whitespace-nowrap inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold border border-slate-300 text-slate-700 bg-white shadow-sm hover:bg-slate-50 active:scale-95 transition disabled:opacity-70 disabled:cursor-not-allowed"
          :disabled="rolling || cooling || rollingPlan || coolingPlan"
          type="button"
          @click="doRecommendPlan"
        >
          <span aria-hidden="true" class="text-lg">🍽️</span>
          <span>{{ rollingPlan || coolingPlan ? '產出中…' : '推薦三餐' }}</span>
        </button>
      </div>
    </div>

    <!-- 單一結果模式 -->
    <Transition v-if="!resultPlan" mode="out-in" name="pop" @after-enter="handleAfterEnter">
      <ResultCard
        v-if="resultItem"
        :key="resultItem.id"
        :copy-context="mealText"
        :item="resultItem"
        mode="single"
        @retry="doRecommend"
      />
      <el-empty
        v-else
        class="bg-white rounded-2xl shadow mb-14"
        :description="rolling || cooling ? '抽籤中…' : '條件變更後，請重新抽選'"
      />
    </Transition>

    <!-- 計畫模式：三餐合併成一張卡（但卡內顯示早餐/午餐/晚餐標籤） -->
    <Transition v-else mode="out-in" name="pop" @after-enter="handleAfterEnter">
      <ResultCard
        v-if="planPairs.length"
        key="plan-card"
        mode="plan"
        :plan="planPairs"
        @retry-plan="retryPlan"
      />
      <el-empty
        v-else
        class="bg-white rounded-2xl shadow mb-14"
        description="找不到符合條件的餐點 😢"
      />
    </Transition>

    <!-- after-enter 的捲動錨點 -->
    <div ref="bottomSentinel" />

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
