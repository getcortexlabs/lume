import type { CaseRepository } from "../../cases/domain/case";
import { RepositoryError } from "../../cases/domain/api";
import type { SimulationControls, SimulationState } from "../domain/simulation";
export function withSimulation(repository: CaseRepository): {
  cases: CaseRepository;
  simulation: SimulationControls;
} {
  let state: SimulationState = {
    latencyMs: 0,
    unavailable: false,
    role: "reviewer",
    conflictNextWrite: false,
  };
  const writes = new Set([
    "saveDraft",
    "deleteDraft",
    "duplicateDraft",
    "submitDraft",
    "resolveSuggestion",
    "decide",
  ]);
  const publicReads = new Set([
    "listPublic",
    "searchPublic",
    "getPublic",
    "getPublicDetail",
  ]);
  const cases = new Proxy(repository, {
    get(target, key: keyof CaseRepository) {
      if (key === "subscribe") return target.subscribe.bind(target);
      const operation = target[key];
      return async (...args: unknown[]) => {
        const config = { ...state };
        if (config.latencyMs)
          await new Promise((resolve) => setTimeout(resolve, config.latencyMs));
        if (config.unavailable)
          throw new RepositoryError(
            "unavailable",
            "Serviço indisponível na simulação. Desative a falha e tente novamente.",
          );
        if (config.role === "viewer" && !publicReads.has(key))
          throw new RepositoryError(
            "forbidden",
            "Este perfil de demonstração só pode consultar avisos públicos.",
          );
        if (writes.has(key) && state.conflictNextWrite) {
          state.conflictNextWrite = false;
          throw new RepositoryError(
            "conflict",
            "Este registro mudou. Atualize os dados antes de tentar novamente.",
          );
        }
        return (operation as (...args: unknown[]) => unknown).apply(
          target,
          args,
        );
      };
    },
  });
  return {
    cases,
    simulation: {
      getState: () => ({ ...state }),
      configure(patch) {
        state = {
          ...state,
          ...patch,
          latencyMs: Math.min(
            5000,
            Math.max(0, patch.latencyMs ?? state.latencyMs),
          ),
        };
      },
    },
  };
}
