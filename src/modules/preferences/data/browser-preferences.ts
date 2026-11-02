import { computed, readonly, ref, type InjectionKey } from "vue";
import {
  defaultPreferences,
  parsePreferences,
  preferenceKey,
  publicSearchQuery,
  type Preferences,
} from "../domain/preferences";

/** One store per app/request. Browser state is loaded only after hydration. */
export function createPreferencesStore() {
  const state = ref(defaultPreferences());
  const ready = ref(false),
    message = ref(""),
    systemReduced = ref(false);
  let browser: Window | undefined;
  const reduced = computed(
    () => systemReduced.value || state.value.motion === "reduced",
  );
  function read(raw: string | null) {
    try {
      state.value =
        raw === null ? defaultPreferences() : parsePreferences(JSON.parse(raw));
      message.value = "";
    } catch {
      message.value =
        "Não foi possível ler as preferências salvas. Suas escolhas atuais foram mantidas.";
    }
  }
  function connect(target: Window) {
    browser = target;
    try {
      read(target.localStorage.getItem(preferenceKey));
    } catch {
      message.value =
        "O armazenamento está indisponível. Suas escolhas valem apenas nesta sessão.";
    }
    const media = target.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      systemReduced.value = media.matches;
    };
    updateMotion();
    const sync = (event: StorageEvent) => {
      if (event.key !== preferenceKey && event.key !== null) return;
      try {
        if (event.storageArea !== target.localStorage) return;
      } catch {
        return;
      }
      read(event.key === null ? null : event.newValue);
    };
    target.addEventListener("storage", sync);
    media.addEventListener("change", updateMotion);
    ready.value = true;
    return () => {
      target.removeEventListener("storage", sync);
      media.removeEventListener("change", updateMotion);
      browser = undefined;
    };
  }
  function persist(next: Preferences) {
    state.value = parsePreferences(next);
    try {
      if (!browser) throw new Error("Browser storage is not ready");
      browser.localStorage.setItem(preferenceKey, JSON.stringify(state.value));
      message.value = "Salvo neste navegador.";
    } catch {
      message.value =
        "Aplicado nesta sessão. Não foi possível salvar neste navegador.";
    }
  }
  function update(
    changes: Partial<
      Pick<Preferences, "region" | "textSize" | "contrast" | "motion">
    >,
  ) {
    persist({ ...state.value, ...changes });
  }
  function saveSearch(name: string, query: unknown) {
    if (!name.trim()) return "Dê um nome para esta busca.";
    if (state.value.searches.length >= 10)
      return "Você já tem 10 buscas salvas. Remova uma para salvar outra.";
    if (!browser) return "Aguarde o carregamento da página.";
    const normalized = publicSearchQuery(query);
    const signature = (value: Record<string, string>) =>
      JSON.stringify(Object.entries(value).sort());
    if (
      state.value.searches.some(
        (entry) => signature(entry.query) === signature(normalized),
      )
    )
      return "Esta combinação de filtros já está salva.";
    persist({
      ...state.value,
      searches: [
        ...state.value.searches,
        {
          id: crypto.randomUUID(),
          name: name.trim().slice(0, 60),
          query: normalized,
        },
      ],
    });
    return "";
  }
  function removeSearch(id: string) {
    persist({
      ...state.value,
      searches: state.value.searches.filter((entry) => entry.id !== id),
    });
  }
  function resetAppearance() {
    update({ textSize: "standard", contrast: "standard", motion: "system" });
  }
  return {
    state: readonly(state),
    ready: readonly(ready),
    message: readonly(message),
    systemReduced: readonly(systemReduced),
    reduced,
    connect,
    update,
    saveSearch,
    removeSearch,
    resetAppearance,
  };
}
export type PreferencesStore = ReturnType<typeof createPreferencesStore>;
export const preferencesKey: InjectionKey<PreferencesStore> =
  Symbol("lume-preferences");
