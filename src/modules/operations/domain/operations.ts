import type { ReviewCase } from "../../cases/domain/case";
import type { Partner } from "../../network/domain/network";
export interface SourceHealth {
  id: string;
  enabled?: boolean;
  owner?: string;
  name: string;
  checkedAt: string;
  updatedAt: string;
  state: "available" | "unavailable";
}
export interface OperationsRepository {
  listSources(): Promise<SourceHealth[]>;
  simulateSourceUpdate(id: string): Promise<void>;
}
export interface FollowUpTask {
  id: string;
  kind: "review" | "source" | "delivery";
  title: string;
  detail: string;
  owner: string;
  href?: string;
  sourceId?: string;
}
export function buildFollowUpTasks(
  records: ReviewCase[],
  partners: Partner[],
  sources: SourceHealth[],
  now: number,
): FollowUpTask[] {
  const day = 86400000;
  return [
    ...records
      .filter(
        (c) =>
          c.status === "in_review" ||
          (c.status === "published" && now - Date.parse(c.reviewedAt) >= day),
      )
      .map((c) => ({
        id: `review:${c.id}`,
        kind: "review" as const,
        title: c.name,
        detail:
          c.status === "in_review"
            ? "Aguardando revisão dos campos e da origem."
            : "Revisão há mais de 24 horas. Confira se a divulgação continua válida.",
        owner: "Revisor Lume",
        href: `/organization?case=${encodeURIComponent(c.id)}`,
      })),
    ...sources
      .filter(
        (s) =>
          s.enabled !== false &&
          (s.state === "unavailable" ||
            !s.updatedAt ||
            now - Date.parse(s.updatedAt) >= 3 * day),
      )
      .map((s) => ({
        id: `source:${s.id}`,
        kind: "source" as const,
        title: s.name,
        detail:
          s.state === "unavailable"
            ? "Última consulta falhou. A situação dos avisos permanece independente."
            : "Sem atualização informada há mais de 72 horas. Consultar não equivale a atualizar.",
        owner: s.owner ?? "Equipe de fontes",
        sourceId: s.id,
      })),
    ...partners
      .filter(
        (p) =>
          p.connection !== "connected" ||
          p.pending > 0 ||
          p.deliveries.some((d) => d.kind === "publish" && d.expiresAt <= now),
      )
      .map((p) => ({
        id: `delivery:${p.id}`,
        kind: "delivery" as const,
        title: p.name,
        detail: `${p.connection === "connected" ? "Revalidar cópias vencidas ou entregas pendentes" : p.connection === "offline" ? "Canal sem conexão" : "Falha de distribuição"} · ${p.pending} entrega(s) pendente(s).`,
        owner: "Equipe de divulgação",
        href: `/organization/network?partner=${encodeURIComponent(p.id)}`,
      })),
  ];
}
