import type { Ref } from 'vue';

export function useDebounceWatcher<T>(ref: Ref<T>, cb: () => void, delay: number): void {
  let timeout: ReturnType<typeof setTimeout>;
  watch(
    ref,
    () => {
      clearTimeout(timeout);
      timeout = setTimeout(cb, delay);
    },
    { deep: true }
  );
}
