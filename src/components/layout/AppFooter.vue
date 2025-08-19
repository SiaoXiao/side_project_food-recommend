<script setup lang="ts">
import { ref } from 'vue';
import SupportMeButton from '@/components/support/SupportMeButton.vue'

const year = new Date().getFullYear();
const text = ref(`© ${year} SiaoXiao. All rights reserved.`);
</script>

<template>
  <footer class="w-full bg-gray-800 text-gray-300 fixed bottom-0 left-0 right-0">
    <div class="h-12 flex items-center justify-center">
      <p class="font-sans text-sm">
        {{ text }}
      </p>
    </div>
    <SupportMeButton />
  </footer>
</template>
