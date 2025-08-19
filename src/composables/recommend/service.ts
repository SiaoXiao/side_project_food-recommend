import type { RecommendInput, RecommendResult, DietaryPrefs } from '@/types/prefs';
import type { FoodItem, BaseMeal } from '@/types/food';
import { randomPick } from '@/utils/random';

/** 餐點是否符合使用者飲食偏好 */
function matchesDiet(item: FoodItem, diet: DietaryPrefs): boolean {
  if (diet.vegetarian && !item.diet?.vegetarian) return false; // 勾素食 -> 只留素
  if (diet.noBeef && item.diet?.beef) return false;            // 不吃牛 -> 排含牛
  if (diet.noPork && item.diet?.pork) return false;            // 不吃豬 -> 排含豬
  return true;
}

/** 取得指定餐別的候選 id；meal=all 時依固定順序合併且去重 */
function mealCandidateIds(
  allByMeal: Record<BaseMeal, string[]>,
  meal: RecommendInput['meal'],
): string[] {
  if (meal !== 'all') return [...(allByMeal[meal as BaseMeal] ?? [])];

  const order: BaseMeal[] = ['breakfast', 'lunch', 'dinner'];
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const m of order) {
    for (const id of allByMeal[m] ?? []) {
      if (!seen.has(id)) {
        seen.add(id);
        merged.push(id);
      }
    }
  }
  return merged;
}

/* ---------------------------
   主流程
---------------------------- */

/** 依條件取得候選池（已過濾飲食偏好） */
function getCandidates(ctx: RecommendInput): string[] {
  const { dataset, meal, prefs } = ctx;
  const { categories, items } = dataset;
  const diet: DietaryPrefs = prefs.dietary ?? {};

  const ids = mealCandidateIds(categories as Record<BaseMeal, string[]>, meal);
  return ids.filter((id) => {
    const item = items[id];
    return !!item && matchesDiet(item, diet);
  });
}

/** 對外：等機率隨機抽一個 */
export function recommendOne(ctx: RecommendInput): RecommendResult | null {
  const candidateIds = getCandidates(ctx);
  if (candidateIds.length === 0) return null;

  const chosen = randomPick(candidateIds);
  if (!chosen) return null;

  return { id: chosen, candidatePool: candidateIds };
}
