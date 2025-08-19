export type BaseMeal = 'breakfast' | 'lunch' | 'dinner';
export type FoodCategory = BaseMeal | 'all';

export interface FoodItem {
  id: string;
  name: string;
  note?: string;
  diet?: {
    beef?: boolean;
    pork?: boolean;
    vegetarian?: boolean;
  };
}

export interface FoodDataset {
  categories: Record<BaseMeal, string[]>;
  items: Record<string, FoodItem>;
}
