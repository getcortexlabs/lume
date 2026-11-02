export interface SimulationState {
  latencyMs: number;
  unavailable: boolean;
  role: "reviewer" | "viewer";
  conflictNextWrite: boolean;
}
export interface SimulationControls {
  getState(): SimulationState;
  configure(patch: Partial<SimulationState>): void;
}
