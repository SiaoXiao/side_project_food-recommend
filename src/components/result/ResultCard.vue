<template>
  <section
    aria-labelledby="result-title"
    class="bg-white rounded-2xl shadow border border-slate-100 p-5 mb-14"
    role="region"
  >
    <!-- Header pill -->
    <div class="mb-3">
      <span
        class="inline-block text-xs px-3 py-1 rounded-full text-white bg-gradient-to-r from-orange-500 to-rose-500 tracking-wide"
      >
        今日推薦
      </span>
    </div>

    <!-- SINGLE MODE -->
    <template v-if="mode === 'single' && item">
      <h3 id="result-title" class="text-xl font-bold text-slate-900">{{ item.name }}</h3>

      <div class="mt-1">
        <span
          v-if="item.diet?.vegetarian"
          class="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          素食可
        </span>
      </div>

      <ul v-if="item.tags?.length" aria-label="分類標籤" class="flex flex-wrap gap-2 mt-3">
        <li
          v-for="(t, i) in item.tags"
          :key="i"
          class="px-3 py-1 text-sm rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
        >
          {{ t }}
        </li>
      </ul>
    </template>

    <!-- PLAN MODE (三餐合併，三欄小卡) -->
    <template v-else-if="mode === 'plan' && plan?.length">
      <div class="grid gap-4 md:grid-cols-3">
        <div
          v-for="p in plan"
          :key="p.item.id"
          class="group rounded-xl border bg-slate-50/60 hover:bg-white border-slate-200 shadow-sm hover:shadow-md transition p-4"
        >
          <span
            class="inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border"
            :class="mealPillClass[p.meal]"
          >
            {{ mealMap[p.meal] }}
          </span>

          <h3 class="mt-2 text-[18px] leading-tight font-bold text-slate-900">
            {{ p.item.name }}
          </h3>

          <div class="mt-1">
            <span
              v-if="p.item.diet?.vegetarian"
              class="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              素食可
            </span>
          </div>

          <ul v-if="p.item.tags?.length" aria-label="分類標籤" class="mt-3 flex flex-wrap gap-2">
            <li
              v-for="(t, i) in p.item.tags"
              :key="i"
              class="px-2.5 py-1 text-[13px] rounded-full bg-white border border-slate-200 text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] group-hover:bg-slate-50 transition"
            >
              {{ t }}
            </li>
          </ul>
        </div>
      </div>
    </template>

    <div class="h-px bg-slate-100 my-5"></div>

    <!-- Footer -->
    <footer class="flex items-center justify-between flex-col md:flex-row gap-2 flex-wrap">
      <p class="m-0 text-[15px] text-slate-600">👉 看起來不錯？那就去吃吧！</p>

      <div class="flex items-center gap-3 mt-4 md:mt-0">
        <button
          class="inline-flex items-center justify-center px-4 py-2 rounded-full font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 active:scale-95 transition"
          type="button"
          @click="copyResult"
        >
          複製結果
        </button>

        <button
          v-if="mode === 'single'"
          class="inline-flex items-center justify-center px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-rose-500 shadow-md active:scale-95 transition"
          type="button"
          @click="$emit('retry')"
        >
          再抽一次
        </button>

        <button
          v-else-if="mode === 'plan'"
          class="inline-flex items-center justify-center px-4 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-orange-500 to-rose-500 shadow-md active:scale-95 transition"
          type="button"
          @click="$emit('retry-plan')"
        >
          再抽一輪
        </button>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';

type Item = {
  id: string;
  name: string;
  tags?: string[];
  diet?: { vegetarian?: boolean; beef?: boolean; pork?: boolean };
};

type PlanPair = { meal: 'breakfast' | 'lunch' | 'dinner'; item: Item };

const props = defineProps<{
  mode: 'single' | 'plan';
  item?: Item;
  plan?: PlanPair[];
  /** 只有單一模式會傳：例如 '早餐' | '午餐' | '晚餐' | '單一' */
  copyContext?: string;
}>();

defineEmits<{ (e: 'retry'): void; (e: 'retry-plan'): void }>();

const mealMap: Record<'breakfast' | 'lunch' | 'dinner', string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

const mealPillClass: Record<'breakfast' | 'lunch' | 'dinner', string> = {
  breakfast: 'bg-amber-50 text-amber-700 border-amber-200',
  lunch: 'bg-sky-50 text-sky-700 border-sky-200',
  dinner: 'bg-rose-50 text-rose-700 border-rose-200',
};

/** 複製：single 加上品牌、餐別文案；plan 逐行列出三餐 */
async function copyResult() {
  let text = '';

  if (props.mode === 'single') {
    const ctx =
      props.copyContext && props.copyContext !== '單一'
        ? `今天的${props.copyContext}推薦：`
        : '今天推薦：';

    // ✅ 只有素食需要補充
    const extra = props.item?.diet?.vegetarian ? '（素食可）' : '';

    text = `【餐餐不煩惱】${ctx}${props.item?.name ?? ''}${extra}`;
  } else {
    // 以固定順序輸出三餐；若缺項用「—」
    const map = new Map(
      props.plan?.map((p) => [p.meal, p.item.name]) as [PlanPair['meal'], string][],
    );

    text = `【餐餐不煩惱】今日三餐推薦：
早餐：${map.get('breakfast') ?? '—'}
午餐：${map.get('lunch') ?? '—'}
晚餐：${map.get('dinner') ?? '—'}`;
  }

  // ✅ 原本的複製流程保持不變
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      ElMessage.success({ message: '已複製到剪貼簿', showClose: true, duration: 2000 });
      return;
    }
  } catch {
    /* fallback */
  }

  // 後備法
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', 'true');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);

    if (ok) {
      ElMessage.success({ message: '已複製到剪貼簿', showClose: true, duration: 2000 });
    } else {
      throw new Error('execCommand failed');
    }
  } catch (e) {
    console.error(e);
    ElMessage.error({ message: '複製失敗，請手動複製', showClose: true });
  }
}
</script>
