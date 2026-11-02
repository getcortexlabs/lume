import { computed, ref, onMounted, onScopeDispose } from "vue";
import { useServices } from "../../../app/services";
import { useAsyncResource } from "../../../shared/composables/useAsyncResource";
import type { Tip, TipStatus } from "../domain/tip";
import type { PublicCase } from "../../cases/domain/case";
export function useTips() {
  const { tips, cases } = useServices();
  const resource = useAsyncResource(
    async () => {
      const [items, records] = await Promise.all([
        tips.listTips(),
        cases.listPublic(),
      ]);
      return { items, records };
    },
    { items: [] as Tip[], records: [] as PublicCase[] },
  );
  const selected = ref("tip-demo-1"),
    filter = ref(""),
    caseId = ref("ana-lucia"),
    busy = ref(false),
    actionError = ref(""),
    message = ref("");
  const visible = computed(() =>
    resource.data.value.items.filter(
      (t) => !filter.value || t.status === filter.value,
    ),
  );
  const current = computed(
    () =>
      visible.value.find((t) => t.id === selected.value) ?? visible.value[0],
  );
  onMounted(resource.refresh);
  onScopeDispose(tips.subscribe(resource.refresh));
  async function receive() {
    if (busy.value) return;
    busy.value = true;
    actionError.value = "";
    try {
      const tip = await tips.receiveExample(caseId.value, {
        idempotencyKey: `receive:${crypto.randomUUID()}`,
      });
      selected.value = tip.id;
      filter.value = "";
      await resource.refresh();
      message.value =
        "Exemplo recebido somente nesta sessão. Nenhum canal externo foi acionado.";
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Não foi possível receber o exemplo.";
    } finally {
      busy.value = false;
    }
  }
  async function advance(
    status: Exclude<TipStatus, "received">,
    note: string,
    recipient: string | null,
  ) {
    const tip = current.value;
    if (!tip || busy.value) return;
    busy.value = true;
    actionError.value = "";
    message.value = "";
    try {
      await tips.advance(tip.id, status, note, recipient, tip.revision, {
        idempotencyKey: `tip:${tip.id}:${tip.revision}:${status}`,
      });
      await resource.refresh();
      message.value = "Etapa registrada na demonstração.";
    } catch (e) {
      actionError.value =
        e instanceof Error ? e.message : "Não foi possível avançar.";
    } finally {
      busy.value = false;
    }
  }
  return {
    ...resource,
    selected,
    filter,
    caseId,
    busy,
    actionError,
    message,
    visible,
    current,
    receive,
    advance,
  };
}
