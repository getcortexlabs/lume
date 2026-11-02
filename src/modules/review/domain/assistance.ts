export type ReviewField = "city" | "neighborhood" | "missingSince";
export interface FieldSuggestion {
  id: string;
  field: ReviewField;
  value: string;
  quote: string;
  conflict: boolean;
  resolution?: "accepted" | "corrected";
}
export const fieldLabels: Record<ReviewField, string> = {
  city: "Município",
  neighborhood: "Região",
  missingSince: "Data do desaparecimento",
};
