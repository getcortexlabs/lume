import type { CaseDraft } from "../modules/intake/domain/draft";
import { type Organization } from "../modules/workspaces/domain/workspace";
import { organizationFixtures } from "../modules/workspaces/data/organization-fixtures";
import { createNotifications } from "../modules/notifications/data/mock-notifications";
import { notifyServices } from "./notify-services";
import { createWorkspaceServices } from "./workspace-services";
import { createMockSourcesRepository } from "../modules/sources/data/mock-sources-repository";
import { createMockTipsRepository } from "../modules/tips/data/mock-tips-repository";
import type { DraftStore } from "../modules/intake/data/browser-draft-store";
import { RepositoryError } from "../modules/cases/domain/api";
import { withSimulation } from "../modules/simulation/data/simulated-case-repository";
import { createMockNetworkRepository } from "../modules/network/data/mock-network-repository";
import { createMockCaseRepository } from "../modules/cases/data/mock-case-repository";
import { createHttpClient } from "../shared/http/client";
import { createMockHttpTransport } from "./http/mock-http-transport";
import { createHttpRepositories } from "./http/http-repositories";
import type { AppServices, OrganizationServices } from "./services";
/** One service graph per app/request. Transport is injected; no external fetch occurs. */
function createOrganizationServices(
  draftStore: DraftStore | undefined,
  organization: Organization,
): OrganizationServices {
  const cases = createMockCaseRepository(
    draftStore,
    organizationFixtures(organization),
  );
  const { simulation } = withSimulation(cases);
  const authorize = () => {
    if (simulation.getState().role !== "reviewer")
      throw new RepositoryError(
        "forbidden",
        "Este perfil não pode consultar a operação.",
      );
  };
  const sources = createMockSourcesRepository(
      authorize,
      Date.now(),
      organization.casePrefix,
    ),
    tips = createMockTipsRepository(cases, authorize, organization.casePrefix),
    network = createMockNetworkRepository(cases, authorize);
  const { transport, diagnostics } = createMockHttpTransport({
    cases,
    network,
    sources,
    tips,
    simulation,
  });
  const repositories = createHttpRepositories(createHttpClient(transport), {
    cases: cases.subscribe,
    network: network.subscribe,
    sources: sources.subscribe,
    tips: tips.subscribe,
  });
  const notifications = createNotifications(authorize, organization.casePrefix);
  const decorated = notifyServices(
    {
      ...repositories,
      operations: repositories.sources,
      simulation,
      http: diagnostics,
    },
    notifications.publish,
  );
  return {
    ...decorated,
    operations: decorated.sources,
    notifications: notifications.repository,
  };
}

export function createDemoServices(
  draftStore?: DraftStore,
  storeForOrganization?: (id: string) => DraftStore | undefined,
): AppServices {
  const stores = new Map<string, DraftStore>();
  function store(id: string): DraftStore {
    let value = stores.get(id);
    if (value) return value;
    value = id === "horizonte" ? draftStore : storeForOrganization?.(id);
    if (!value) {
      let drafts: CaseDraft[] = [];
      value = {
        createId: () => `draft-${crypto.randomUUID()}`,
        read: () => structuredClone(drafts),
        write: (next) => {
          drafts = structuredClone(next);
        },
      };
    }
    stores.set(id, value);
    return value;
  }
  const epochs = new Map<string, number>();
  return createWorkspaceServices((organization) => {
    const epoch = (epochs.get(organization.id) ?? 0) + 1;
    epochs.set(organization.id, epoch);
    const backing = store(organization.id);
    const guard = () => {
      if (epochs.get(organization.id) !== epoch)
        throw new RepositoryError(
          "conflict",
          "A demonstração foi reiniciada. Reabra o cadastro.",
        );
    };
    const scoped: DraftStore = {
      createId: () => {
        guard();
        return backing.createId();
      },
      read: () => {
        guard();
        return backing.read();
      },
      write: (items) => {
        guard();
        backing.write(items);
      },
    };
    return createOrganizationServices(scoped, organization);
  }, store);
}
