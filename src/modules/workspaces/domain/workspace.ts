export interface Organization {
  id: string;
  name: string;
  casePrefix: string;
}
export const organizations: readonly Organization[] = [
  { id: "horizonte", name: "Organização Horizonte", casePrefix: "" },
  { id: "aurora", name: "Instituto Aurora", casePrefix: "aurora-" },
];
export interface WorkspaceState {
  organization: Organization;
  revision: number;
}
export interface WorkspaceController {
  list(): Organization[];
  getState(): WorkspaceState;
  switchTo(id: string): void;
  reset(clearDrafts?: boolean): void;
  subscribe(listener: () => void): () => void;
}
