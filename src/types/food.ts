export type BaseMeal = 'breakfast' | 'lunch' | 'dinner';
export type FoodCategory = BaseMeal | 'all';

export interface FoodItem {
  id: string;
  name: string;
  note?: string;
  /** 飲食屬性，用於過濾 */
  diet?: {
    /** 此餐點是否含牛肉（含牛製品） */
    beef?: boolean;
    /** 此餐點是否含豬肉（含豬製品） */
    pork?: boolean;
    /** 是否為素食可食（蛋奶可、或你之後要再細分再加） */
    vegetarian?: boolean;
  };
}

export interface FoodDataset {
  categories: Record<BaseMeal, string[]>;
  items: Record<string, FoodItem>;
}
