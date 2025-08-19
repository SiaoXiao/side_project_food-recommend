import { ref, watch } from 'vue';
import type { UserPrefs } from '@/types/prefs';
import { readPrefs, writePrefs } from '@/composables/storage/local';

const defaultPrefs: UserPrefs = {
  dietary: { noBeef: false, noPork: false, vegetarian: false },
};

const prefsRef = ref<UserPrefs>(readPrefs<UserPrefs>() ?? structuredClone(defaultPrefs));

export function usePrefs() {
  const prefs = prefsRef;

  function save() {
    writePrefs<UserPrefs>(prefs.value);
  }

  function reset() {
    prefs.value = structuredClone(defaultPrefs);
    save();
  }

  // 自動持久化：只要使用者在 UI 勾選/取消，就會寫入 local
  watch(prefs, save, { deep: true });

  return { prefs, save, reset };
}
