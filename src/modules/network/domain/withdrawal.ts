import type { ReviewCase } from "../../cases/domain/case";
import type { Partner } from "./network";
export type WithdrawalChannelState =
  "confirmed" | "pending" | "expired" | "not_distributed";
export function withdrawalChannels(
  record: ReviewCase,
  partners: Partner[],
  now = Date.now(),
) {
  return partners
    .filter(
      (p) =>
        p.city === record.city ||
        p.deliveries.some((d) => d.caseId === record.id),
    )
    .map((partner) => {
      const delivery = partner.deliveries.find((d) => d.caseId === record.id);
      const state: WithdrawalChannelState =
        delivery?.kind === "withdraw" && delivery.revision >= record.revision
          ? "confirmed"
          : !delivery
            ? "not_distributed"
            : delivery.expiresAt <= now
              ? "expired"
              : "pending";
      return {
        partner,
        state,
        revision: delivery?.revision ?? null,
        confirmedAt: state === "confirmed" ? delivery?.deliveredAt : null,
      };
    });
}
export const withdrawalLabels: Record<WithdrawalChannelState, string> = {
  confirmed: "Retirada confirmada",
  pending: "Aguardando retirada",
  expired: "Cópia expirada, sem confirmação",
  not_distributed: "Nenhuma entrega registrada",
};
