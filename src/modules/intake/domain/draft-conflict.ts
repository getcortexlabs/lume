import type { CaseDraft, DraftInput } from "./draft";
export type DraftField = keyof DraftInput;
export type ConflictChoices = Partial<Record<DraftField, "local" | "remote">>;
export interface DraftConflict {
  base: DraftInput;
  local: DraftInput;
  remote: CaseDraft | null;
}
export const draftFieldLabels: Record<DraftField, string> = {
  name: "Nome",
  age: "Idade",
  city: "Cidade",
  neighborhood: "Região",
  missingSince: "Data do desaparecimento",
  clothing: "Vestuário",
  description: "Informações públicas",
  source: "Origem",
  evidence: "Registro reservado",
  authorized: "Autorização",
};
export function conflictRows(conflict: DraftConflict) {
  if (!conflict.remote) return [];
  const remote = conflict.remote.input;
  return (Object.keys(draftFieldLabels) as DraftField[])
    .filter((key) => conflict.local[key] !== remote[key])
    .map((key) => ({
      key,
      label: draftFieldLabels[key],
      local: conflict.local[key],
      remote: remote[key],
      needsChoice:
        conflict.local[key] !== conflict.base[key] &&
        remote[key] !== conflict.base[key],
    }));
}
export function mergeDraftConflict(
  conflict: DraftConflict,
  choices: ConflictChoices,
): DraftInput {
  if (!conflict.remote)
    throw new Error(
      "Este rascunho foi removido. Salve suas edições em uma cópia.",
    );
  const result = { ...conflict.remote.input };
  for (const row of conflictRows(conflict)) {
    const choice =
      choices[row.key] ??
      (row.needsChoice
        ? undefined
        : row.remote === conflict.base[row.key]
          ? "local"
          : "remote");
    if (!choice)
      throw new Error(`Escolha qual versão manter em: ${row.label}.`);
    Object.assign(result, {
      [row.key]: choice === "local" ? row.local : row.remote,
    });
  }
  return result;
}
