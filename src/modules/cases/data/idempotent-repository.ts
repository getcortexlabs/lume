import type { CaseRepository } from "../domain/case";
import { RepositoryError } from "../domain/api";
// App-scoped command receipts; the HTTP adapter will delegate this guarantee to the server.
export function withIdempotency(repository: CaseRepository): CaseRepository {
  const receipts = new Map<
    string,
    { fingerprint: string; result: Promise<unknown> }
  >();
  const mutations = new Set([
    "saveDraft",
    "deleteDraft",
    "duplicateDraft",
    "submitDraft",
    "resolveSuggestion",
    "decide",
  ]);
  return new Proxy(repository, {
    get(target, key: keyof CaseRepository) {
      const method = target[key];
      if (!mutations.has(key)) return method.bind(target);
      return (...args: unknown[]) => {
        const last = args.at(-1);
        const token =
          last && typeof last === "object" && "idempotencyKey" in last
            ? String(last.idempotencyKey)
            : "";
        if (!token)
          return (method as (...args: unknown[]) => unknown).apply(
            target,
            args,
          );
        const fingerprint = JSON.stringify([key, ...args.slice(0, -1)]);
        const receipt = receipts.get(token);
        if (receipt) {
          if (receipt.fingerprint !== fingerprint)
            return Promise.reject(
              new RepositoryError(
                "conflict",
                "Esta chave já foi usada para outra alteração.",
              ),
            );
          return receipt.result.then((result) => structuredClone(result));
        }
        const result = Promise.resolve()
          .then(() =>
            (method as (...args: unknown[]) => unknown).apply(target, args),
          )
          .catch((error) => {
            receipts.delete(token);
            throw error;
          });
        receipts.set(token, { fingerprint, result });
        return result.then((value) => structuredClone(value));
      };
    },
  });
}
