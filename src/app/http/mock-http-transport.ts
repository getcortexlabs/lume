import { object, draftInput, sourceInput } from "./request-validation";
import type { CaseRepository } from "../../modules/cases/domain/case";
import {
  RepositoryError,
  type PublicCaseQuery,
} from "../../modules/cases/domain/api";
import type { NetworkRepository } from "../../modules/network/domain/network";
import type { SourcesRepository } from "../../modules/sources/domain/source";
import type { TipsRepository } from "../../modules/tips/domain/tip";
import type { SimulationControls } from "../../modules/simulation/domain/simulation";
import type {
  HttpTransport,
  HttpDiagnostics,
  HttpTrace,
} from "../../shared/http/client";
interface Backends {
  cases: CaseRepository;
  network: NetworkRepository;
  sources: SourcesRepository;
  tips: TipsRepository;
  simulation: SimulationControls;
}
const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const empty = () =>
  new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
function revision(value: unknown) {
  if (!Number.isInteger(value) || Number(value) < 1)
    throw new RepositoryError("validation", "Informe uma revisão válida.");
  return Number(value);
}
function text(value: unknown) {
  if (typeof value !== "string")
    throw new RepositoryError("validation", "Campo de texto inválido.");
  return value;
}
function oneOf<const T extends string>(
  value: unknown,
  choices: readonly T[],
): T {
  if (!choices.includes(value as T))
    throw new RepositoryError("validation", "Opção inválida.");
  return value as T;
}
/** Fetch-compatible in-process boundary. No network requests, server endpoints, or credentials. */
export function createMockHttpTransport(backends: Backends): {
  transport: HttpTransport;
  diagnostics: HttpDiagnostics;
} {
  const { cases, network, sources, tips, simulation } = backends;
  const traces: HttpTrace[] = [],
    listeners = new Set<() => void>();
  const receipts = new Map<
    string,
    { fingerprint: string; result: Promise<Response> }
  >();
  async function route(
    request: Request,
    url: URL,
    body: Record<string, unknown>,
  ): Promise<Response> {
    const method = request.method,
      path = url.pathname,
      context = { idempotencyKey: request.headers.get("Idempotency-Key")! };
    const match = (pattern: RegExp) =>
      path.match(pattern)?.slice(1).map(decodeURIComponent);
    let parts: string[] | undefined;
    if (method === "GET" && path === "/v1/public/cases") {
      const q = url.searchParams;
      const query: PublicCaseQuery = {
        query: q.get("search") ?? undefined,
        city: q.get("city") ?? undefined,
        age: q.has("age") ? oneOf(q.get("age"), ["18-59", "60+"]) : undefined,
        dateField: q.has("dateField")
          ? oneOf(q.get("dateField"), ["missing", "reviewed"])
          : undefined,
        from: q.get("from") ?? undefined,
        to: q.get("to") ?? undefined,
        sort: q.has("sort")
          ? oneOf(q.get("sort"), ["name", "missing", "reviewed"])
          : undefined,
        page: q.has("page") ? revision(Number(q.get("page"))) : 1,
        pageSize: q.has("pageSize") ? revision(Number(q.get("pageSize"))) : 12,
      };
      if (query.pageSize! > 48)
        throw new RepositoryError(
          "validation",
          "Use até 48 registros por página.",
        );
      for (const date of [query.from, query.to])
        if (
          date &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
            !Number.isFinite(Date.parse(date)) ||
            new Date(date).toISOString().slice(0, 10) !== date)
        )
          throw new RepositoryError("validation", "Período inválido.");
      return json(await cases.searchPublic(query));
    }
    if (method === "GET" && (parts = match(/^\/v1\/public\/cases\/([^/]+)$/))) {
      const detail = await cases.getPublicDetail(parts[0]!);
      return detail.state === "published"
        ? json(detail.record)
        : json(
            { state: detail.state },
            detail.state === "withdrawn" ? 410 : 404,
          );
    }
    if (method === "GET" && path === "/v1/review/cases")
      return json(await cases.listReview());
    if (path === "/v1/review/drafts") {
      if (method === "GET") return json(await cases.listDrafts());
      if (method === "POST")
        return json(
          await cases.saveDraft(null, draftInput(body), undefined, context),
        );
    }
    if ((parts = match(/^\/v1\/review\/drafts\/([^/]+)$/))) {
      const id = parts[0]!;
      if (method === "GET") {
        const draft = await cases.getDraft(id);
        if (!draft)
          throw new RepositoryError("not_found", "Rascunho não encontrado.");
        return json(draft);
      }
      if (method === "PUT")
        return json(
          await cases.saveDraft(
            id,
            draftInput(body.input),
            revision(body.expectedRevision),
            context,
          ),
        );
      if (method === "DELETE") {
        await cases.deleteDraft(id, revision(body.expectedRevision), context);
        return empty();
      }
    }
    if (
      method === "POST" &&
      (parts = match(
        /^\/v1\/review\/drafts\/([^/]+)\/(submission|duplication)$/,
      ))
    ) {
      return parts[1] === "submission"
        ? json({
            caseId: await cases.submitDraft(
              parts[0]!,
              revision(body.expectedRevision),
              context,
            ),
          })
        : json(
            await cases.duplicateDraft(
              parts[0]!,
              revision(body.expectedRevision),
              context,
            ),
            201,
          );
    }
    if (
      method === "POST" &&
      (parts = match(/^\/v1\/review\/cases\/([^/]+)\/decisions$/))
    ) {
      await cases.decide(
        parts[0]!,
        oneOf(body.status, ["published", "withdrawn"]),
        text(body.reason),
        revision(body.expectedRevision),
        context,
      );
      return empty();
    }
    if (
      method === "POST" &&
      (parts = match(
        /^\/v1\/review\/cases\/([^/]+)\/suggestions\/([^/]+)\/resolution$/,
      ))
    ) {
      await cases.resolveSuggestion(
        parts[0]!,
        parts[1]!,
        text(body.value),
        text(body.quote),
        text(body.reason),
        revision(body.expectedRevision),
        context,
      );
      return empty();
    }
    if (method === "GET" && path === "/v1/review/partners")
      return json(await network.listPartners());
    if (
      method === "POST" &&
      (parts = match(
        /^\/v1\/review\/partners\/([^/]+)\/(revalidation|connection|expiration)$/,
      ))
    ) {
      if (parts[1] === "connection")
        await network.setConnection(
          parts[0]!,
          oneOf(body.state, ["connected", "offline", "error"]),
        );
      else if (parts[1] === "expiration") await network.expire(parts[0]!);
      else await network.retry(parts[0]!);
      return empty();
    }
    if (path === "/v1/review/sources") {
      if (method === "GET") return json(await sources.listSources());
      if (method === "POST")
        return json(
          await sources.saveSource(null, sourceInput(body.input)),
          201,
        );
    }
    if (method === "PUT" && (parts = match(/^\/v1\/review\/sources\/([^/]+)$/)))
      return json(
        await sources.saveSource(
          parts[0]!,
          sourceInput(body.input),
          revision(body.expectedRevision),
        ),
      );
    if (
      method === "POST" &&
      (parts = match(/^\/v1\/review\/sources\/([^/]+)\/(check|recovery)$/))
    ) {
      if (parts[1] === "check") await sources.checkSource(parts[0]!);
      else await sources.simulateSourceUpdate(parts[0]!);
      return empty();
    }
    if (path === "/v1/review/tips") {
      if (method === "GET") return json(await tips.listTips());
      if (method === "POST")
        return json(await tips.receiveExample(text(body.caseId), context), 201);
    }
    if (
      method === "POST" &&
      (parts = match(/^\/v1\/review\/tips\/([^/]+)\/transitions$/))
    ) {
      await tips.advance(
        parts[0]!,
        oneOf(body.status, ["reviewed", "forwarded", "confirmed"]),
        text(body.note),
        body.recipient === null ? null : text(body.recipient),
        revision(body.expectedRevision),
        context,
      );
      return empty();
    }
    throw new RepositoryError("not_found", "Rota simulada não encontrada.");
  }
  function failure(error: unknown) {
    const e =
      error instanceof RepositoryError
        ? error
        : new RepositoryError(
            "unavailable",
            error instanceof Error
              ? error.message
              : "Falha no serviço simulado.",
          );
    return json(
      { code: e.code, message: e.message },
      {
        forbidden: 403,
        not_found: 404,
        conflict: 409,
        validation: 422,
        unavailable: 503,
      }[e.code],
    );
  }
  const transport: HttpTransport = async (request) => {
    const started = Date.now(),
      url = new URL(request.url);
    let result: Response;
    try {
      if (url.origin !== "https://lume.invalid")
        throw new RepositoryError(
          "validation",
          "Destino fora do transporte simulado.",
        );
      const config = simulation.getState();
      if (config.latencyMs)
        await new Promise((resolve) => setTimeout(resolve, config.latencyMs));
      if (config.unavailable)
        throw new RepositoryError(
          "unavailable",
          "Serviço indisponível na simulação. Desative a falha e tente novamente.",
        );
      if (url.pathname.startsWith("/v1/review/") && config.role !== "reviewer")
        throw new RepositoryError(
          "forbidden",
          "Este perfil de demonstração só pode consultar avisos públicos.",
        );
      const write = request.method !== "GET";
      if (write && simulation.getState().conflictNextWrite) {
        simulation.configure({ conflictNextWrite: false });
        throw new RepositoryError(
          "conflict",
          "Este registro mudou. Atualize os dados antes de tentar novamente.",
        );
      }
      let body: Record<string, unknown> = {};
      if (write) {
        try {
          body = object(await request.json());
        } catch {
          throw new RepositoryError("validation", "Corpo JSON inválido.");
        }
      }
      const key = write ? request.headers.get("Idempotency-Key") : null;
      if (write && !key)
        throw new RepositoryError(
          "validation",
          "Informe a chave de idempotência.",
        );
      const fingerprint = JSON.stringify([request.method, url.pathname, body]),
        receipt = key ? receipts.get(key) : undefined;
      if (receipt) {
        if (receipt.fingerprint !== fingerprint)
          throw new RepositoryError(
            "conflict",
            "Esta chave já foi usada para outra alteração.",
          );
        result = (await receipt.result).clone();
      } else {
        const pending = route(request, url, body).catch(failure);
        if (key) receipts.set(key, { fingerprint, result: pending });
        result = await pending;
        if (key && !result.ok) receipts.delete(key);
        result = result.clone();
      }
    } catch (error) {
      result = failure(error);
    }
    // No payloads or query values in this developer-only trace.
    traces.unshift({
      method: request.method,
      path: url.pathname.replace(
        /\/(draft-[^/]+|case-draft-[^/]+|source-[^/]+|tip-[^/]+)(?=\/|$)/g,
        "/:id",
      ),
      status: result.status,
      durationMs: Date.now() - started,
    });
    traces.splice(20);
    listeners.forEach((l) => l());
    return result;
  };
  return {
    transport,
    diagnostics: {
      list: () => structuredClone(traces),
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    },
  };
}
