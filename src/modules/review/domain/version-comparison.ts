import type { CaseVersion, PublicCase } from "../../cases/domain/case";
export const versionFields = {
  name: "Nome",
  age: "Idade",
  city: "Município",
  neighborhood: "Região",
  missingSince: "Desaparecimento informado",
  description: "Informações do aviso",
  clothing: "Vestuário",
  source: "Origem",
  reviewedAt: "Revisão da divulgação",
} satisfies Partial<Record<keyof PublicCase, string>>;
export const publicationLabels = {
  in_review: "Em revisão",
  published: "Publicado",
  withdrawn: "Retirado",
};
export function compareVersions(before: CaseVersion, after: CaseVersion) {
  return [
    {
      label: "Situação da publicação",
      before: publicationLabels[before.status],
      after: publicationLabels[after.status],
    },
    ...Object.entries(versionFields).map(([key, label]) => ({
      label,
      before: String(before.fields[key as keyof typeof versionFields]),
      after: String(after.fields[key as keyof typeof versionFields]),
    })),
  ].map((row) => ({ ...row, changed: row.before !== row.after }));
}
