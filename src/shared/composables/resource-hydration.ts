import type { InjectionKey } from "vue";
/** Host-owned transfer of explicit public query results; never the service graph. */
export interface ResourceHydration {
  reuse(): boolean;
  has(key: string): boolean;
  read(key: string): unknown;
  write(key: string, data: unknown): void;
}
export const resourceHydrationKey: InjectionKey<ResourceHydration> = Symbol(
  "lume.public-hydration",
);
