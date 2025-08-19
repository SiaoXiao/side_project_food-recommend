<script setup lang="ts">
import type { FoodCategory } from '@/types/food';

const model = defineModel<FoodCategory>({ required: true });

type TOptions = { label: string; value: FoodCategory; emoji: string };
const options: TOptions[] = [
  { label: '早餐', value: 'breakfast', emoji: '🥯' },
  { label: '午餐', value: 'lunch', emoji: '🍛' },
  { label: '晚餐', value: 'dinner', emoji: '🍣' },
  { label: '全部', value: 'all', emoji: '🎲' },
];
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="text-sm font-medium text-gray-700">選擇餐別</label>

    <div class="hidden md:block">
      <el-radio-group v-model="model" class="meal-segment md:flex gap-3" size="large">
        <el-radio-button
          v-for="item in options"
          :key="item.value"
          class="!rounded-xl overflow-hidden"
          :label="item.value"
        >
          <span class="flex items-center gap-2 px-3">
            <span aria-hidden="true">{{ item.emoji }}</span>
            <span>{{ item.label }}</span>
          </span>
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="block md:hidden">
      <el-select v-model="model" class="w-full" placeholder="請選擇">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="`${item.emoji} ${item.label}`"
          :value="item.value"
        />
      </el-select>
    </div>
  </div>
</template>

<style scoped>
.meal-segment :deep(.el-radio-button__inner) {
  border-radius: 0.75rem; /* 12px 圓角 */
  padding: 10px 14px;
  border-color: #e5e7eb; /* gray-200 */
  background: #fff;
  color: #374151; /* gray-700 */
  transition: all 0.15s ease;
}
.meal-segment :deep(.el-radio-button:first-child .el-radio-button__inner),
.meal-segment :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0.75rem; /* 讓左右兩端也圓 */
}
.meal-segment :deep(.el-radio-button__original-radio:focus-visible + .el-radio-button__inner) {
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.25); /* sky-500 focus ring */
}
.meal-segment :deep(.el-radio-button:hover .el-radio-button__inner) {
  border-color: #cbd5e1; /* slate-300 */
  background: #f8fafc; /* slate-50 */
}

/* 選中狀態 */
.meal-segment :deep(.el-radio-button.is-active .el-radio-button__inner) {
  color: #fff;
  border-color: transparent;
  background: linear-gradient(90deg, #f97316 0%, #ef4444 100%); /* from-orange-500 to-red-500 */
  box-shadow: 0 6px 14px rgba(239, 68, 68, 0.25); /* 微陰影 */
}

/* 取消左右相鄰按鈕之間的硬邊 */
.meal-segment :deep(.el-radio-button__inner)::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 0.75rem;
}
</style>
