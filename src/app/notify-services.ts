import { RepositoryError } from "../modules/cases/domain/api";
import type { OrganizationServices } from "./services";
/** Decorates successful application commands, never replaying notifications for idempotent retries. */
export function notifyServices(
  services: Omit<OrganizationServices, "notifications">,
  publish: (title: string, detail: string, href: string) => void,
) {
  const notified = new Set<string>();
  const maps: Record<string, Record<string, [string, string]>> = {
    cases: {
      submitDraft: ["Cadastro aguardando revisão", "/organization"],
      decide: ["Decisão de divulgação registrada", "/organization"],
      resolveSuggestion: ["Conferência registrada", "/organization"],
    },
    sources: {
      checkSource: ["Consulta da fonte concluída", "/organization/sources"],
      simulateSourceUpdate: [
        "Fonte recuperada na simulação",
        "/organization/sources",
      ],
    },
    tips: {
      receiveExample: ["Relato fictício recebido", "/organization/tips"],
      advance: ["Etapa do relato atualizada", "/organization/tips"],
    },
    network: {
      retry: ["Canal revalidado", "/organization/withdrawals"],
      setConnection: ["Conexão do canal atualizada", "/organization/network"],
    },
  };
  function decorate<T extends object>(service: T, name: string): T {
    return new Proxy(service, {
      get(target, key, receiver) {
        const fn = Reflect.get(target, key, receiver);
        if (typeof fn !== "function" || key === "subscribe")
          return typeof fn === "function" ? fn.bind(target) : fn;
        return async (...args: unknown[]) => {
          try {
            const result = await fn.apply(target, args);
            const config = maps[name]?.[String(key)];
            const context = args.at(-1),
              token =
                context &&
                typeof context === "object" &&
                "idempotencyKey" in context
                  ? String(context.idempotencyKey)
                  : null;
            if (config && (!token || !notified.has(token))) {
              let [title, href] = config;
              if (name === "cases") {
                href = `/organization?case=${encodeURIComponent(key === "submitDraft" ? String(result) : String(args[0]))}`;
                if (key === "decide")
                  title =
                    args[1] === "withdrawn"
                      ? "Retirada solicitada aos canais"
                      : "Divulgação revisada";
              }
              if (name === "tips" && key === "advance")
                title =
                  args[1] === "confirmed"
                    ? "Destinatário confirmou recebimento"
                    : args[1] === "forwarded"
                      ? "Relato encaminhado na simulação"
                      : "Triagem concluída";
              publish(
                title,
                "Evento desta organização, somente na demonstração.",
                href,
              );
              if (token) notified.add(token);
            }
            return result;
          } catch (e) {
            if (e instanceof RepositoryError && e.code === "conflict")
              publish(
                "Conflito de versão encontrado",
                "Confira as versões antes de repetir a alteração.",
                name === "cases" && String(key).includes("Draft")
                  ? "/organization/drafts"
                  : "/organization",
              );
            throw e;
          }
        };
      },
    });
  }
  return {
    ...services,
    cases: decorate(services.cases, "cases"),
    sources: decorate(services.sources, "sources"),
    tips: decorate(services.tips, "tips"),
    network: decorate(services.network, "network"),
  };
}
