import type { FoodCategory, FoodDataset } from '@/types/food';

export interface DietaryPrefs {
  noBeef?: boolean;
  noPork?: boolean;
  vegetarian?: boolean; // 勾選後只顯示素食
}

export interface UserPrefs {
  dietary?: DietaryPrefs;
  // 不再保存 favoritesIds / blacklistIds / history
}

export interface RecommendInput {
  meal: FoodCategory;
  dataset: FoodDataset;
  prefs: UserPrefs;
}

export interface RecommendResult {
  id: string;
  candidatePool: string[];
}
