import type { PublicCase } from "../../cases/domain/case";
export type ConnectionState = "connected" | "offline" | "error";
export interface Delivery {
  caseId: string;
  revision: number;
  kind: "publish" | "withdraw";
  snapshot: PublicCase | null;
  expiresAt: number;
  deliveredAt?: string;
}
export interface Partner {
  id: string;
  name: string;
  city: string;
  format: "widget" | "screen";
  connection: ConnectionState;
  deliveries: Delivery[];
  pending: number;
  lastAttemptAt?: string;
  retrySuggestedAt?: string | null;
  history: { at: string; message: string }[];
}
export interface NetworkRepository {
  listPartners(): Promise<Partner[]>;
  setConnection(id: string, state: ConnectionState): Promise<void>;
  retry(id: string): Promise<void>;
  expire(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}
// Revision remains after withdrawal/expiration; stale events can never resurrect a copy.
export function applyDelivery(deliveries: Delivery[], incoming: Delivery) {
  const index = deliveries.findIndex((d) => d.caseId === incoming.caseId);
  if (index >= 0 && deliveries[index]!.revision >= incoming.revision)
    return false;
  const event = structuredClone(incoming);
  if (event.kind === "withdraw") event.snapshot = null;
  if (index < 0) deliveries.push(event);
  else deliveries[index] = event;
  return true;
}
