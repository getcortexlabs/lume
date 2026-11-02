import type { AppServices, OrganizationServices } from "./services";
import {
  organizations,
  type Organization,
  type WorkspaceController,
} from "../modules/workspaces/domain/workspace";
import type { DraftStore } from "../modules/intake/data/browser-draft-store";
import { RepositoryError } from "../modules/cases/domain/api";
/** Every delegated call captures its organization. Late responses cannot cross a switch/reset. */
export function createWorkspaceServices(
  create: (organization: Organization) => OrganizationServices,
  store: (id: string) => DraftStore | undefined,
): AppServices {
  const graphs = new Map<string, OrganizationServices>();
  let active = organizations[0]!,
    revision = 0;
  const listeners = new Set<() => void>();
  const graph = () => {
    let item = graphs.get(active.id);
    if (!item) {
      item = create(active);
      graphs.set(active.id, item);
    }
    return item;
  };
  const channels = [
    "cases",
    "sources",
    "network",
    "tips",
    "http",
    "notifications",
  ] as const;
  const subscribers = new Map<string, Set<() => void>>(
    channels.map((key) => [key, new Set()]),
  );
  let unbind: Array<() => void> = [];
  function bind() {
    unbind.forEach((fn) => fn());
    unbind = channels.map((key) =>
      graph()[key].subscribe(() => subscribers.get(key)!.forEach((fn) => fn())),
    );
  }
  function changed() {
    revision++;
    bind();
    listeners.forEach((fn) => fn());
    subscribers.forEach((set) => set.forEach((fn) => fn()));
  }
  const workspace: WorkspaceController = {
    list: () => organizations.map((o) => ({ ...o })),
    getState: () => ({ organization: { ...active }, revision }),
    switchTo(id) {
      const next = organizations.find((o) => o.id === id);
      if (!next)
        throw new RepositoryError(
          "not_found",
          "Organização fictícia não encontrada.",
        );
      if (next.id === active.id) return;
      active = next;
      changed();
    },
    reset(clearDrafts = false) {
      if (clearDrafts) store(active.id)?.write([]);
      graphs.set(active.id, create(active));
      changed();
    },
    localDraftCount: () => store(active.id)?.read().length ?? 0,
    clearLocalDrafts() {
      // Clearing saved drafts must not reset publications or the active organization.
      store(active.id)?.write([]);
      subscribers.get("cases")!.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  function facade<K extends keyof OrganizationServices>(
    key: K,
  ): OrganizationServices[K] {
    return new Proxy({} as OrganizationServices[K], {
      get(_target, method) {
        if (method === "subscribe")
          return (listener: () => void) => {
            const set = subscribers.get(key)!;
            set.add(listener);
            return () => set.delete(listener);
          };
        return (...args: unknown[]) => {
          const current = graph()[key],
            epoch = revision;
          const fn = Reflect.get(current, method) as (
            ...values: unknown[]
          ) => unknown;
          const result = fn.apply(current, args);
          if (result instanceof Promise)
            return result.then((value) => {
              if (epoch !== revision)
                throw new RepositoryError(
                  "conflict",
                  "O contexto da organização mudou. Abra a tarefa novamente.",
                );
              return value;
            });
          return result;
        };
      },
    });
  }
  bind();
  const sources = facade("sources");
  return {
    workspace,
    cases: facade("cases"),
    sources,
    operations: sources,
    network: facade("network"),
    tips: facade("tips"),
    simulation: facade("simulation"),
    http: facade("http"),
    notifications: facade("notifications"),
  };
}
