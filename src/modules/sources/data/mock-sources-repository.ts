import { RepositoryError } from "../../cases/domain/api";
import {
  validateSource,
  type ManagedSource,
  type SourcesRepository,
} from "../domain/source";
export function createMockSourcesRepository(
  authorize: () => void,
  now = Date.now(),
  casePrefix = "",
): SourcesRepository {
  const hour = 3600000,
    at = (offset: number) => new Date(now - offset * hour).toISOString();
  const sources: ManagedSource[] = [
    {
      id: "regional",
      name: "Boletim regional · fonte fictícia",
      url: "https://example.com/regional",
      owner: "Equipe de fontes",
      frequencyHours: 24,
      enabled: true,
      revision: 1,
      checkedAt: at(1),
      updatedAt: at(96),
      state: "available",
      lastSuccessAt: at(1),
      lastError: null,
      imports: [
        {
          externalId: "DEMO-001",
          caseId: "ana-lucia",
          receivedAt: at(96),
          result: "imported",
          summary: "Registro já revisado na demonstração.",
        },
        {
          externalId: "DEMO-002",
          caseId: "beatriz-santos",
          receivedAt: at(96),
          result: "imported",
          summary: "Campos e autorização aguardam revisão.",
        },
        {
          externalId: "DEMO-001-copy",
          caseId: "ana-lucia",
          receivedAt: at(1),
          result: "duplicate",
          summary:
            "Mesmo identificador reconhecido. Nenhum novo aviso foi criado.",
        },
      ],
    },
    {
      id: "partner",
      name: "Arquivo do parceiro · fonte fictícia",
      url: "https://example.com/partner",
      owner: "Equipe do parceiro",
      frequencyHours: 12,
      enabled: true,
      revision: 1,
      checkedAt: at(2),
      updatedAt: at(48),
      state: "unavailable",
      lastSuccessAt: at(48),
      lastError: "Tempo limite excedido na consulta simulada.",
      imports: [
        {
          externalId: "DEMO-003",
          caseId: "antonio-lima",
          receivedAt: at(48),
          result: "conflict",
          summary:
            "Municípios diferentes em dois registros. Revisão necessária.",
        },
      ],
    },
  ];
  sources.forEach((source) =>
    source.imports.forEach((record) => {
      record.caseId = casePrefix + record.caseId;
    }),
  );
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  const find = (id: string) => {
    const source = sources.find((s) => s.id === id);
    if (!source)
      throw new RepositoryError("not_found", "Fonte não encontrada.");
    return source;
  };
  return {
    async listSources() {
      authorize();
      return structuredClone(sources);
    },
    async saveSource(id, input, expectedRevision) {
      authorize();
      const issues = validateSource(input);
      if (issues.length)
        throw new RepositoryError("validation", issues.join(" "));
      const current = id ? find(id) : null;
      if (current && current.revision !== expectedRevision)
        throw new RepositoryError(
          "conflict",
          "Esta fonte mudou. Atualize a lista antes de salvar.",
        );
      const normalized = {
        name: input.name.trim(),
        url: input.url.trim(),
        owner: input.owner.trim(),
        frequencyHours: input.frequencyHours,
        enabled: input.enabled,
      };
      if (current) {
        Object.assign(current, normalized);
        current.revision++;
        emit();
        return structuredClone(current);
      }
      const created: ManagedSource = {
        ...normalized,
        id: `source-${crypto.randomUUID()}`,
        revision: 1,
        checkedAt: "",
        updatedAt: "",
        lastSuccessAt: null,
        lastError: null,
        state: "available",
        imports: [],
      };
      sources.push(created);
      emit();
      return structuredClone(created);
    },
    async checkSource(id) {
      authorize();
      const source = find(id);
      if (!source.enabled)
        throw new RepositoryError(
          "validation",
          "Ative a fonte antes de simular a consulta.",
        );
      source.checkedAt = new Date().toISOString();
      source.revision++;
      if (source.state === "available") {
        source.lastSuccessAt = source.checkedAt;
        source.lastError = null;
      } else source.lastError = "Tempo limite excedido na consulta simulada.";
      emit();
      if (source.state === "unavailable")
        throw new RepositoryError("unavailable", source.lastError!);
    },
    async simulateSourceUpdate(id) {
      authorize();
      const source = find(id);
      if (!source.enabled)
        throw new RepositoryError(
          "validation",
          "Ative a fonte antes de simular uma atualização.",
        );
      source.checkedAt =
        source.updatedAt =
        source.lastSuccessAt =
          new Date().toISOString();
      source.state = "available";
      source.lastError = null;
      source.revision++;
      emit();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
