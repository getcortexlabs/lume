import type { ChoiceOption } from "@getcortexlabs/mavis-web";

export const cityOptions: readonly ChoiceOption[] = [
  { value: "", label: "Todas as cidades" },
  ...["São Paulo", "Suzano", "Guarulhos"].map((value) => ({
    value,
    label: value,
  })),
];
export const ageOptions: readonly ChoiceOption[] = [
  { value: "", label: "Todas as idades" },
  { value: "18-59", label: "18 a 59 anos" },
  { value: "60+", label: "60 anos ou mais" },
];
export const publicationOptions: readonly ChoiceOption[] = [
  { value: "", label: "Todos os registros" },
  { value: "in_review", label: "Em revisão" },
  { value: "published", label: "Publicados" },
  { value: "withdrawn", label: "Retirados" },
];
