import { RepositoryError, type MutationContext } from "../../cases/domain/api";
import type { CaseRepository } from "../../cases/domain/case";
import {
  tipRecipients,
  type TipsRepository,
  type Tip,
  type TipStatus,
} from "../domain/tip";
export function createMockTipsRepository(
  cases: CaseRepository,
  authorize: () => void,
  casePrefix = "",
): TipsRepository {
  const tips: Tip[] = [
    {
      id: "tip-demo-1",
      caseId: casePrefix + "ana-lucia",
      revision: 1,
      status: "received",
      original:
        "Acho que vi alguém parecido perto de um terminal fictício ontem, por volta das 18h. Não tenho certeza e não conversei com a pessoa.",
      observedAt: "Ontem, por volta das 18h · horário aproximado",
      location: "Terminal fictício · localização reservada de demonstração",
      contact: "testemunha@example.com · contato fictício",
      recipient: null,
      history: [
        {
          status: "received",
          at: new Date().toISOString(),
          actor: "Canal de demonstração",
          note: "Exemplo fictício recebido. Nenhuma informação real foi enviada.",
        },
      ],
    },
  ];
  const listeners = new Set<() => void>(),
    receipts = new Map<
      string,
      { fingerprint: string; result: Promise<unknown> }
    >();
  const emit = () => listeners.forEach((l) => l());
  async function once<T>(
    context: MutationContext | undefined,
    payload: unknown,
    action: () => Promise<T>,
  ): Promise<T> {
    authorize();
    const key = context?.idempotencyKey;
    if (!key) return action();
    const fingerprint = JSON.stringify(payload),
      previous = receipts.get(key);
    if (previous) {
      if (previous.fingerprint !== fingerprint)
        throw new RepositoryError(
          "conflict",
          "Esta chave já foi usada para outra alteração.",
        );
      return structuredClone(await previous.result) as T;
    }
    const result = Promise.resolve()
      .then(action)
      .catch((e) => {
        receipts.delete(key);
        throw e;
      });
    receipts.set(key, { fingerprint, result });
    return structuredClone(await result);
  }
  return {
    async listTips() {
      authorize();
      return structuredClone(tips);
    },
    receiveExample(caseId, context) {
      return once(context, ["receive", caseId], async () => {
        if (!(await cases.getPublic(caseId)))
          throw new RepositoryError(
            "validation",
            "Escolha um aviso público fictício disponível.",
          );
        const tip: Tip = {
          ...structuredClone(tips[0]!),
          id: `tip-${crypto.randomUUID()}`,
          caseId,
          revision: 1,
          status: "received",
          recipient: null,
          history: [
            {
              status: "received",
              at: new Date().toISOString(),
              actor: "Canal de demonstração",
              note: "Novo exemplo fictício recebido. Nenhum relato real foi enviado.",
            },
          ],
        };
        tips.unshift(tip);
        emit();
        return structuredClone(tip);
      });
    },
    advance(id, status, note, recipient, expectedRevision, context) {
      return once(
        context,
        ["advance", id, status, note, recipient, expectedRevision],
        async () => {
          const tip = tips.find((t) => t.id === id);
          if (!tip)
            throw new RepositoryError("not_found", "Relato não encontrado.");
          if (tip.revision !== expectedRevision)
            throw new RepositoryError(
              "conflict",
              "Este relato mudou. Atualize a caixa antes de decidir.",
            );
          const next: Partial<Record<TipStatus, TipStatus>> = {
            received: "reviewed",
            reviewed: "forwarded",
            forwarded: "confirmed",
          };
          if (next[tip.status] !== status)
            throw new RepositoryError(
              "validation",
              "Conclua a etapa anterior antes de avançar.",
            );
          if (!note.trim())
            throw new RepositoryError(
              "validation",
              "Registre a justificativa desta etapa.",
            );
          if (
            status === "forwarded" &&
            !tipRecipients.some((r) => r.value === recipient)
          )
            throw new RepositoryError(
              "validation",
              "Escolha um destinatário de demonstração.",
            );
          if (status === "forwarded") tip.recipient = recipient;
          tip.status = status;
          tip.revision++;
          tip.history.push({
            status,
            at: new Date().toISOString(),
            actor:
              status === "confirmed"
                ? "Destinatário fictício"
                : "Revisor Lume · demonstração",
            note: note.trim(),
          });
          emit();
        },
      );
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
