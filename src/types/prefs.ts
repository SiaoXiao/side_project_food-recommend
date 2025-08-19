import type { FoodCategory, FoodDataset } from '@/types/food';

export interface DietaryPrefs {
  noBeef?: boolean;
  noPork?: boolean;
  vegetarian?: boolean;
}

export interface UserPrefs {
  dietary?: DietaryPrefs;
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
