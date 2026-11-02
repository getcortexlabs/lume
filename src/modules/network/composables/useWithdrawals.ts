import { computed, ref, onMounted, onScopeDispose } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import { withdrawalChannels } from "../domain/withdrawal";
import type { ReviewCase } from "../../cases/domain/case";
import type { Partner } from "../domain/network";
export function useWithdrawals() {
  const { cases, network } = useServices();
  const resource = useAsyncResource(
    async () => {
      const [records, partners] = await Promise.all([
        cases.listReview(),
        network.listPartners(),
      ]);
      return {
        records: records.filter((c) => c.status === "withdrawn"),
        partners,
        now: Date.now(),
      };
    },
    { records: [] as ReviewCase[], partners: [] as Partner[], now: 0 },
  );
  const reports = computed(() =>
    resource.data.value.records.map((record) => ({
      record,
      channels: withdrawalChannels(
        record,
        resource.data.value.partners,
        resource.data.value.now,
      ),
    })),
  );
  const busy = ref(false),
    actionError = ref(""),
    message = ref("");
  let timer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    resource.refresh();
    timer = setInterval(resource.refresh, 5000);
  });
  onScopeDispose(() => clearInterval(timer));
  onScopeDispose(cases.subscribe(resource.refresh));
  onScopeDispose(network.subscribe(resource.refresh));
  async function retry(id: string) {
    if (busy.value) return;
    busy.value = true;
    actionError.value = "";
    message.value = "";
    try {
      await network.retry(id);
      await resource.refresh();
      message.value = "Canal revalidado contra as versões atuais.";
    } catch (e) {
      actionError.value =
        e instanceof Error
          ? e.message
          : "Não foi possível confirmar a retirada.";
      await resource.refresh();
    } finally {
      busy.value = false;
    }
  }
  return { ...resource, reports, busy, actionError, message, retry };
}
