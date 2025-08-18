<script setup lang="ts">
import type { FoodItem } from '@/types/food';

const props = defineProps<{
  item: FoodItem;
}>();
</script>

<template>
  <div class="rounded-2xl bg-white shadow p-4">
    <div class="text-sm text-gray-500 mb-1">推薦結果</div>
    <div class="flex items-start justify-between">
      <div>
        <div class="text-xl font-semibold">
          {{ props.item.name }}
        </div>
        <div v-if="props.item.note" class="text-gray-600 text-sm">
          {{ props.item.note }}
        </div>
      </div>
    </div>
  </div>
</template>
