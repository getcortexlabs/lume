import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useRequestURL } from "#app";
import { useCaseDetail } from "./useCaseDetail";
export function useCasePoster() {
  const route = useRoute(),
    origin = useRequestURL().origin;
  const id = computed(() => String(route.params.id));
  const detail = useCaseDetail(id);
  const printing = ref(false);
  const url = computed(
    () => new URL(`/cases/${encodeURIComponent(id.value)}`, origin).href,
  );
  async function print() {
    printing.value = true;
    try {
      await detail.refresh();
      if (detail.data.value && !detail.error.value) window.print();
    } finally {
      printing.value = false;
    }
  }
  return { ...detail, url, printing, print };
}
