import type { MutationContext } from "../../cases/domain/api";
export type TipStatus = "received" | "reviewed" | "forwarded" | "confirmed";
export interface TipEvent {
  status: TipStatus;
  at: string;
  actor: string;
  note: string;
}
export interface Tip {
  id: string;
  caseId: string;
  revision: number;
  status: TipStatus;
  original: string;
  observedAt: string;
  location: string;
  contact: string | null;
  recipient: string | null;
  history: TipEvent[];
}
export interface TipsRepository {
  listTips(): Promise<Tip[]>;
  receiveExample(caseId: string, context?: MutationContext): Promise<Tip>;
  advance(
    id: string,
    status: Exclude<TipStatus, "received">,
    note: string,
    recipient: string | null,
    expectedRevision: number,
    context?: MutationContext,
  ): Promise<void>;
  subscribe(listener: () => void): () => void;
}
export const tipLabels: Record<TipStatus, string> = {
  received: "Recebido",
  reviewed: "Revisado",
  forwarded: "Encaminhado",
  confirmed: "Recebimento confirmado",
};
export const tipRecipients = [
  { value: "search-team", label: "Equipe de buscas fictícia" },
  { value: "demo-authority", label: "Autoridade de demonstração" },
];
