import { RepositoryError } from "../../cases/domain/api";
import type { CaseRepository, PublicCase } from "../../cases/domain/case";
import {
  applyDelivery,
  type Partner,
  type NetworkRepository,
} from "../domain/network";
export function createMockNetworkRepository(
  cases: CaseRepository,
  authorize: () => void = () => {},
): NetworkRepository {
  const partners: Partner[] = [
    {
      id: "library",
      name: "Biblioteca Aurora",
      city: "São Paulo",
      format: "widget",
      connection: "connected",
      deliveries: [],
      pending: 0,
      history: [],
    },
    {
      id: "market",
      name: "Mercado Horizonte",
      city: "Suzano",
      format: "screen",
      connection: "error",
      deliveries: [],
      pending: 0,
      history: [],
    },
    {
      id: "station",
      name: "Espaço Encontro",
      city: "Guarulhos",
      format: "screen",
      connection: "offline",
      deliveries: [],
      pending: 0,
      history: [],
    },
  ];
  const listeners = new Set<() => void>();
  let generation = 0;
  const log = (p: Partner, message: string) => {
    p.history.unshift({ at: new Date().toISOString(), message });
    p.history = p.history.slice(0, 20);
  };
  const find = (id: string) => {
    const p = partners.find((p) => p.id === id);
    if (!p) throw new Error("Parceiro não encontrado.");
    return p;
  };
  async function sync() {
    const current = ++generation;
    const reviews = await cases.listReview();
    const publicCases = await cases.listPublic();
    if (current !== generation) return;
    const snapshots = new Map<string, PublicCase>(
      publicCases.map((c) => [c.id, c]),
    );
    for (const partner of partners) {
      partner.pending = 0;
      partner.lastAttemptAt = new Date().toISOString();
      for (const record of reviews) {
        const existing = partner.deliveries.find((d) => d.caseId === record.id);
        if (
          record.status === "in_review" ||
          (record.city !== partner.city && !existing)
        )
          continue;
        const snapshot =
          record.city === partner.city
            ? (snapshots.get(record.id) ?? null)
            : null;
        const needsDelivery = !existing || existing.revision < record.revision;
        if (partner.connection !== "connected") {
          if (needsDelivery) partner.pending++;
          continue;
        }
        if (
          applyDelivery(partner.deliveries, {
            caseId: record.id,
            revision: record.revision,
            kind: snapshot ? "publish" : "withdraw",
            snapshot,
            expiresAt: Date.now() + 300000,
            deliveredAt: new Date().toISOString(),
          })
        ) {
          log(
            partner,
            `${snapshot ? "Publicação atualizada" : "Divulgação retirada"} · ${record.id} · versão ${record.revision}`,
          );
        } else if (
          existing &&
          existing.revision === record.revision &&
          snapshot
        ) {
          existing.snapshot = structuredClone(snapshot);
          existing.expiresAt = Date.now() + 300000;
        }
      }
      partner.retrySuggestedAt = partner.pending
        ? new Date(Date.now() + 60000).toISOString()
        : null;
    }
    listeners.forEach((l) => l());
  }
  // Lazy reconciliation stays inside the service: no global timers or browser lifecycle.
  let dirty = true;
  cases.subscribe(() => {
    dirty = true;
    listeners.forEach((l) => l());
  });
  return {
    async listPartners() {
      authorize();
      if (dirty) {
        dirty = false;
        try {
          await sync();
        } catch (e) {
          dirty = true;
          throw e;
        }
      }
      return structuredClone(partners).map((p) => ({
        ...p,
        deliveries: p.deliveries.map((d) => ({
          ...d,
          snapshot: d.expiresAt > Date.now() ? d.snapshot : null,
        })),
      }));
    },
    async setConnection(id, state) {
      authorize();
      const p = find(id);
      p.connection = state;
      log(p, `Conexão simulada: ${state}`);
      dirty = true;
      await sync();
      dirty = false;
    },
    async retry(id) {
      authorize();
      const p = find(id);
      if (p.connection !== "connected") {
        p.lastAttemptAt = new Date().toISOString();
        p.retrySuggestedAt = new Date(Date.now() + 60000).toISOString();
        log(p, "Tentativa sem confirmação. Reconexão necessária.");
        listeners.forEach((l) => l());
        throw new RepositoryError(
          "unavailable",
          "Reconecte o canal antes de tentar novamente.",
        );
      }
      await sync();
      dirty = false;
    },
    async expire(id) {
      authorize();
      const p = find(id);
      p.deliveries.forEach((d) => {
        d.expiresAt = 0;
        d.snapshot = null;
      });
      log(
        p,
        "Validade expirada na simulação; dados pessoais removidos da cópia.",
      );
      listeners.forEach((l) => l());
    },
    subscribe(l) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
