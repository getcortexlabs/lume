import {
  RepositoryError,
  type ErrorCode,
  type MutationContext,
} from "../../modules/cases/domain/api";
export type HttpTransport = (request: Request) => Promise<Response>;
export interface HttpTrace {
  method: string;
  path: string;
  status: number;
  durationMs: number;
}
export interface HttpDiagnostics {
  list(): HttpTrace[];
  subscribe(listener: () => void): () => void;
}
export function createHttpClient(transport: HttpTransport) {
  async function response(
    path: string,
    method = "GET",
    body?: unknown,
    context?: MutationContext,
  ) {
    const headers = new Headers({ Accept: "application/json" });
    if (method !== "GET") {
      headers.set("Content-Type", "application/json");
      headers.set(
        "Idempotency-Key",
        context?.idempotencyKey ?? crypto.randomUUID(),
      );
    }
    try {
      return await transport(
        new Request(new URL(path, "https://lume.invalid"), {
          method,
          headers,
          body: body === undefined ? undefined : JSON.stringify(body),
        }),
      );
    } catch {
      throw new RepositoryError(
        "unavailable",
        "Não foi possível alcançar o serviço simulado. Tente novamente.",
      );
    }
  }
  async function decode<T>(res: Response): Promise<T> {
    if (res.status === 204) return undefined as T;
    let payload: unknown;
    try {
      payload = await res.json();
    } catch {
      throw new RepositoryError(
        "unavailable",
        "O serviço retornou uma resposta inválida.",
      );
    }
    if (!res.ok) {
      const error = payload as { code?: ErrorCode; message?: string };
      const codes: Record<number, ErrorCode> = {
        403: "forbidden",
        404: "not_found",
        409: "conflict",
        422: "validation",
        503: "unavailable",
      };
      throw new RepositoryError(
        codes[res.status] ?? "unavailable",
        typeof error.message === "string"
          ? error.message
          : "Não foi possível concluir a solicitação.",
      );
    }
    return payload as T;
  }
  return {
    response,
    decode,
    request: async <T>(
      path: string,
      method = "GET",
      body?: unknown,
      context?: MutationContext,
    ) => decode<T>(await response(path, method, body, context)),
  };
}
export type HttpClient = ReturnType<typeof createHttpClient>;
