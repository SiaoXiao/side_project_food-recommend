import type { RecommendInput, RecommendResult } from '@/types/prefs';
import type { FoodItem, BaseMeal } from '@/types/food';
import { weightedPick } from '@/utils/random';

function getCandidates(ctx: RecommendInput): string[] {
  const ids: string[] =
    ctx.meal === 'all'
      ? (Object.keys(ctx.dataset.categories) as BaseMeal[]).flatMap(
          (k) => ctx.dataset.categories[k] ?? [],
        )
      : (ctx.dataset.categories[ctx.meal as BaseMeal] ?? []);

  const diet = ctx.prefs.dietary ?? {};

  return ids.filter((id: string) => {
    const item = ctx.dataset.items[id];
    if (!item) return false;

    // 飲食過濾
    if (diet.vegetarian && !item.diet?.vegetarian) return false; // 勾素食 -> 只留素
    if (diet.noBeef && item.diet?.beef) return false; // 不吃牛 -> 排含牛
    if (diet.noPork && item.diet?.pork) return false; // 不吃豬 -> 排含豬

    return true;
  });
}

function scoreOf(_item: FoodItem, _ctx: RecommendInput): number {
  // 單純隨機（必要時可再加權）
  return 1;
}

export function recommendOne(ctx: RecommendInput): RecommendResult | null {
  const candidateIds = getCandidates(ctx);
  if (candidateIds.length === 0) return null;
  const weights = candidateIds.map((id) => scoreOf(ctx.dataset.items[id], ctx));
  const chosen = weightedPick(candidateIds, weights);
  return { id: chosen, candidatePool: candidateIds };
}
