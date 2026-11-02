import { onMounted, ref } from "vue";
/** JS-only actions become available after their event handlers are mounted. */
export function useClientReady() {
  const ready = ref(false);
  onMounted(() => {
    ready.value = true;
  });
  return ready;
}
