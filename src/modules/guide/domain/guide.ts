import type { ReviewCase } from "../../cases/domain/case";
import type { Tip } from "../../tips/domain/tip";
export function guideProgress(record: ReviewCase | undefined, tips: Tip[]) {
  return [
    {
      title: "Conhecer a importação",
      detail:
        "O conector fictício já deixou este registro na fila. Confira a origem e os campos.",
      done: !!record,
    },
    {
      title: "Conferir a evidência",
      detail:
        "Na revisão, destaque o trecho na fonte e registre a conferência da sugestão.",
      done:
        !!record?.suggestions?.length &&
        record.suggestions.every((s) => !!s.resolution),
    },
    {
      title: "Publicar com responsabilidade",
      detail:
        "Confira a prévia, registre a justificativa e aprove a divulgação.",
      done: !!record?.versions?.some((v) => v.status === "published"),
    },
    {
      title: "Receber uma contribuição",
      detail:
        "Gere um relato fictício e acompanhe seu encaminhamento na área reservada.",
      done: tips.some((t) => t.caseId === record?.id),
    },
    {
      title: "Encerrar a divulgação",
      detail:
        "Retire o aviso na revisão e confira o estado dos canais de divulgação.",
      done: record?.status === "withdrawn",
    },
  ];
}
