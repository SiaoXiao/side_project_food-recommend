<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { ElMessage } from 'element-plus';

const open = ref(false);
const isMobile = ref(false);
const paypalLink = 'https://www.paypal.com/paypalme/WhyGoGoTW';

const dialogWidth = computed(() => (isMobile.value ? '92vw' : '420px'));
const phoneMediaQuery = window.matchMedia('(max-width: 768px)');
const updateIsMobile = () => {
  isMobile.value = phoneMediaQuery.matches;
};

function goToPayPal() {
  window.open(paypalLink, '_blank', 'noopener');
  ElMessage.success('感謝你的支持！🙏');
  open.value = false;
}

onMounted(() => {
  updateIsMobile();

  if ('addEventListener' in phoneMediaQuery) {
    phoneMediaQuery.addEventListener('change', updateIsMobile);
  } else {
    // Safari < 14 fallback
    // @ts-expect-error: MediaQueryList old API support
    phoneMediaQuery.addListener(updateIsMobile);
  }
});

onBeforeUnmount(() => {
  if ('removeEventListener' in phoneMediaQuery) {
    phoneMediaQuery.removeEventListener('change', updateIsMobile);
  } else {
    // @ts-expect-error: MediaQueryList old API support
    phoneMediaQuery.removeListener(updateIsMobile);
  }
});
</script>

<template>
  <div
    v-show="!open"
    class="fixed z-[60] right-4 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:right-12 md:bottom-[calc(6rem+env(safe-area-inset-bottom))]"
  >
    <button
      class="inline-flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 rounded-full shadow-lg hover:shadow-xl active:scale-95 bg-gradient-to-r from-amber-500 to-orange-600 text-white transition will-change-transform ring-1 ring-white/20"
      @click="open = true"
    >
      <span class="text-lg">☕️</span>
      <span class="hidden md:inline font-semibold">請我喝杯咖啡</span>
    </button>

    <span class="pointer-events-none absolute -top-1 -right-1 h-3 w-3 rounded-full">
      <span class="absolute inset-0 rounded-full bg-rose-400/80 animate-ping"></span>
      <span class="absolute inset-0 rounded-full bg-rose-500"></span>
    </span>
  </div>

  <el-dialog
    v-model="open"
    align-center
    append-to-body
    class="donate-dialog"
    :show-close="true"
    :width="dialogWidth"
  >
    <template #header>
      <h2 class="text-xl md:text-2xl font-bold text-slate-900">支持「餐餐不煩惱」</h2>
    </template>

    <div class="space-y-4">
      <p class="text-slate-600 text-sm">如果你覺得這個工具有幫助，請用 PayPal 請我喝杯咖啡 ☕️</p>
      <a class="donate-link" :href="paypalLink" rel="noopener" target="_blank">💰 PayPal 贊助</a>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <el-button @click="open = false">取消</el-button>
        <el-button type="primary" @click="goToPayPal">前往贊助</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
@reference "tailwindcss";

.donate-link {
  @apply w-full rounded-xl border border-slate-200 bg-white
         px-4 py-3 text-slate-700 hover:bg-slate-50
         shadow-sm hover:shadow-md transition inline-flex items-center justify-center gap-2;
}
</style>
