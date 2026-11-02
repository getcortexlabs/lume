export interface DraftInput {
  name: string;
  age: string;
  city: string;
  neighborhood: string;
  missingSince: string;
  clothing: string;
  description: string;
  source: string;
  evidence: string;
  authorized: boolean;
}
export interface CaseDraft {
  id: string;
  revision: number;
  updatedAt: string;
  input: DraftInput;
}
export const emptyDraft = (): DraftInput => ({
  name: "",
  age: "",
  city: "",
  neighborhood: "",
  missingSince: "",
  clothing: "",
  description: "",
  source: "",
  evidence: "",
  authorized: false,
});
export function validateDraft(input: DraftInput, step?: number): string[] {
  const issues: string[] = [];
  if (step === undefined || step === 0) {
    if (!input.name.trim()) issues.push("Informe o nome fictício.");
    if (
      !/^\d+$/.test(input.age) ||
      Number(input.age) < 18 ||
      Number(input.age) > 120
    )
      issues.push(
        "Informe uma idade entre 18 e 120 anos. Este piloto atende adultos.",
      );
    if (!["São Paulo", "Suzano", "Guarulhos"].includes(input.city))
      issues.push("Selecione uma cidade do piloto.");
    if (!input.neighborhood.trim())
      issues.push("Informe a região autorizada para divulgação.");
  }
  if (step === undefined || step === 1) {
    const date = input.missingSince;
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(date).toISOString().slice(0, 10) !== date ||
      date > new Date().toISOString().slice(0, 10)
    )
      issues.push("Informe uma data válida, até hoje.");
    if (!input.description.trim())
      issues.push("Descreva as informações autorizadas para o aviso.");
    if (!input.clothing.trim())
      issues.push("Informe o vestuário ou indique que não foi informado.");
  }
  if (step === undefined || step === 2) {
    if (!input.source.trim())
      issues.push("Identifique a origem da informação.");
    if (!input.evidence.trim())
      issues.push("Inclua o registro fictício para revisão reservada.");
    if (!input.authorized)
      issues.push("Confirme a autorização simulada dos campos públicos.");
  }
  return issues;
}
