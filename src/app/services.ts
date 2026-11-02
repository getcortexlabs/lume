import type { NotificationsRepository } from "../modules/notifications/domain/notification";
import type { WorkspaceController } from "../modules/workspaces/domain/workspace";
import type { HttpDiagnostics } from "../shared/http/client";
import type { TipsRepository } from "../modules/tips/domain/tip";
import type { SourcesRepository } from "../modules/sources/domain/source";
import type { OperationsRepository } from "../modules/operations/domain/operations";
import type { SimulationControls } from "../modules/simulation/domain/simulation";
import type { NetworkRepository } from "../modules/network/domain/network";
import { inject, type InjectionKey } from "vue";
import type { CaseRepository } from "../modules/cases/domain/case";
export interface OrganizationServices {
  notifications: NotificationsRepository;
  http: HttpDiagnostics;
  sources: SourcesRepository;
  operations: OperationsRepository;
  tips: TipsRepository;
  cases: CaseRepository;
  network: NetworkRepository;
  simulation: SimulationControls;
}
export interface AppServices extends OrganizationServices {
  workspace: WorkspaceController;
}
export const servicesKey: InjectionKey<AppServices> = Symbol("lume.services");
export function useServices(): AppServices {
  const services = inject(servicesKey);
  if (!services)
    throw new Error(
      "Lume services must be provided at the application boundary.",
    );
  return services;
}
