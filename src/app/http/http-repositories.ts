import type {
  CaseRepository,
  CaseFilters,
  PublicCase,
  PublicCaseDetail,
} from "../../modules/cases/domain/case";
import type { NetworkRepository } from "../../modules/network/domain/network";
import type { SourcesRepository } from "../../modules/sources/domain/source";
import type { TipsRepository } from "../../modules/tips/domain/tip";
import type { Page, PublicCaseQuery } from "../../modules/cases/domain/api";
import type { HttpClient } from "../../shared/http/client";
const segment = encodeURIComponent;
export function createHttpRepositories(
  client: HttpClient,
  events: {
    cases: CaseRepository["subscribe"];
    network: NetworkRepository["subscribe"];
    sources: SourcesRepository["subscribe"];
    tips: TipsRepository["subscribe"];
  },
) {
  const request = client.request;
  const queryString = (input: object) => {
    const q = new URLSearchParams();
    Object.entries(input).forEach(([k, v]) => {
      if (v !== undefined && v !== "")
        q.set(k === "query" ? "search" : k, String(v));
    });
    return q.toString();
  };
  async function searchPublic(query: PublicCaseQuery) {
    return request<Page<PublicCase>>(`/v1/public/cases?${queryString(query)}`);
  }
  const cases: CaseRepository = {
    searchPublic,
    async listPublic(filters: CaseFilters = {}) {
      const result = await searchPublic({ ...filters, pageSize: 48 });
      const items = [...result.items];
      for (let page = 2; page <= Math.ceil(result.total / 48); page++)
        items.push(
          ...(await searchPublic({ ...filters, page, pageSize: 48 })).items,
        );
      return items;
    },
    async getPublicDetail(id): Promise<PublicCaseDetail> {
      const res = await client.response(`/v1/public/cases/${segment(id)}`);
      if (res.status === 404 || res.status === 410)
        return {
          state: res.status === 410 ? "withdrawn" : "unavailable",
          record: null,
        };
      return {
        state: "published",
        record: await client.decode<PublicCase>(res),
      };
    },
    async getPublic(id) {
      return (await cases.getPublicDetail(id)).record;
    },
    listReview: () => request("/v1/review/cases"),
    listDrafts: () => request("/v1/review/drafts"),
    async getDraft(id) {
      const res = await client.response(`/v1/review/drafts/${segment(id)}`);
      return res.status === 404 ? null : client.decode(res);
    },
    saveDraft: (id, input, expectedRevision, context) =>
      request(
        `/v1/review/drafts${id ? `/${segment(id)}` : ""}`,
        id ? "PUT" : "POST",
        id ? { input, expectedRevision } : input,
        context,
      ),
    deleteDraft: (id, expectedRevision, context) =>
      request(
        `/v1/review/drafts/${segment(id)}`,
        "DELETE",
        { expectedRevision },
        context,
      ),
    duplicateDraft: (id, expectedRevision, context) =>
      request(
        `/v1/review/drafts/${segment(id)}/duplication`,
        "POST",
        { expectedRevision },
        context,
      ),
    async submitDraft(id, expectedRevision, context) {
      const data = await request<{ caseId: string }>(
        `/v1/review/drafts/${segment(id)}/submission`,
        "POST",
        { expectedRevision },
        context,
      );
      return data.caseId;
    },
    decide: (id, status, reason, expectedRevision, context) =>
      request(
        `/v1/review/cases/${segment(id)}/decisions`,
        "POST",
        { status, reason, expectedRevision },
        context,
      ),
    resolveSuggestion: (
      id,
      suggestionId,
      value,
      quote,
      reason,
      expectedRevision,
      context,
    ) =>
      request(
        `/v1/review/cases/${segment(id)}/suggestions/${segment(suggestionId)}/resolution`,
        "POST",
        { value, quote, reason, expectedRevision },
        context,
      ),
    subscribe: events.cases,
  };
  const network: NetworkRepository = {
    listPartners: () => request("/v1/review/partners"),
    setConnection: (id, state) =>
      request(`/v1/review/partners/${segment(id)}/connection`, "POST", {
        state,
      }),
    retry: (id) =>
      request(`/v1/review/partners/${segment(id)}/revalidation`, "POST", {}),
    expire: (id) =>
      request(`/v1/review/partners/${segment(id)}/expiration`, "POST", {}),
    subscribe: events.network,
  };
  const sources: SourcesRepository = {
    listSources: () => request("/v1/review/sources"),
    saveSource: (id, input, expectedRevision) =>
      request(
        `/v1/review/sources${id ? `/${segment(id)}` : ""}`,
        id ? "PUT" : "POST",
        { input, expectedRevision },
      ),
    checkSource: (id) =>
      request(`/v1/review/sources/${segment(id)}/check`, "POST", {}),
    simulateSourceUpdate: (id) =>
      request(`/v1/review/sources/${segment(id)}/recovery`, "POST", {}),
    subscribe: events.sources,
  };
  const tips: TipsRepository = {
    listTips: () => request("/v1/review/tips"),
    receiveExample: (caseId, context) =>
      request("/v1/review/tips", "POST", { caseId }, context),
    advance: (id, status, note, recipient, expectedRevision, context) =>
      request(
        `/v1/review/tips/${segment(id)}/transitions`,
        "POST",
        { status, note, recipient, expectedRevision },
        context,
      ),
    subscribe: events.tips,
  };
  return { cases, network, sources, tips };
}
