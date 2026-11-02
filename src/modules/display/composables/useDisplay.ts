import {
  computed,
  onMounted,
  onScopeDispose,
  ref,
  shallowRef,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { useServices } from "../../../app/services";
import type { PublicCase } from "../../cases/domain/case";
import { displaySettings, DISPLAY_TTL_MS, leaseValid } from "../domain/display";
export function useDisplay() {
  const { cases, workspace } = useServices(),
    route = useRoute();
  const settings = computed(() => displaySettings(route.query));
  const records = shallowRef<PublicCase[]>([]),
    index = ref(0),
    paused = ref(true),
    offline = ref(false),
    error = ref(""),
    expiresAt = ref(0),
    now = ref(0),
    loading = ref(false),
    testing = ref(false);
  let generation = 0,
    timer: ReturnType<typeof setInterval> | undefined,
    lastAdvance = 0,
    lastRefresh = 0,
    alive = false,
    unsubscribe = () => {};
  const valid = computed(() => leaseValid(expiresAt.value, now.value));
  const current = computed(() =>
    valid.value
      ? records.value[index.value % Math.max(1, records.value.length)]
      : undefined,
  );
  const seconds = computed(() =>
    Math.max(0, Math.ceil((expiresAt.value - now.value) / 1000)),
  );
  function expire() {
    generation++;
    loading.value = false;
    records.value = [];
    expiresAt.value = 0;
    index.value = 0;
    error.value =
      "A validade terminou. Os avisos ficam ocultos até uma nova consulta.";
  }
  async function refresh() {
    if (!alive || offline.value) return;
    const request = ++generation;
    loading.value = true;
    lastRefresh = Date.now();
    try {
      const data = await cases.listPublic({ city: settings.value.city });
      if (request !== generation || !alive) return;
      now.value = Date.now();
      const visibleId = current.value?.id;
      const retainedIndex = data.findIndex((record) => record.id === visibleId);
      records.value = data;
      index.value = Math.max(0, retainedIndex);
      expiresAt.value = now.value + DISPLAY_TTL_MS;
      error.value = "";
      if (retainedIndex < 0) lastAdvance = now.value;
    } catch (e) {
      if (request === generation)
        error.value =
          e instanceof Error ? e.message : "Não foi possível atualizar.";
    } finally {
      if (request === generation) loading.value = false;
    }
  }
  function next() {
    if (records.value.length) {
      index.value = (index.value + 1) % records.value.length;
      lastAdvance = Date.now();
    }
  }
  function togglePause() {
    paused.value = !paused.value;
    lastAdvance = Date.now();
  }
  function setOffline(value: boolean) {
    offline.value = value;
    if (value) {
      generation++;
      loading.value = false;
    } else void refresh();
  }
  function tick() {
    now.value = Date.now();
    if (expiresAt.value && !valid.value) expire();
    if (document.hidden) return;
    if (!offline.value && !loading.value && now.value - lastRefresh >= 20_000)
      void refresh();
    if (
      !paused.value &&
      now.value - lastAdvance >= settings.value.interval * 1000
    )
      next();
  }
  const online = () => setOffline(false),
    disconnected = () => setOffline(true);
  function applySettings() {
    generation++;
    records.value = [];
    expiresAt.value = 0;
    workspace.switchTo(settings.value.organization);
    void refresh();
  }
  watch(settings, () => {
    if (alive) applySettings();
  });
  onMounted(() => {
    alive = true;
    now.value = Date.now();
    offline.value = !navigator.onLine;
    paused.value = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    applySettings();
    unsubscribe = cases.subscribe(() => {
      if (!offline.value) void refresh();
    });
    timer = setInterval(tick, 1000);
    window.addEventListener("online", online);
    window.addEventListener("offline", disconnected);
    document.addEventListener("visibilitychange", tick);
  });
  onScopeDispose(() => {
    alive = false;
    generation++;
    unsubscribe();
    if (timer) clearInterval(timer);
    if (typeof window !== "undefined") {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", disconnected);
      document.removeEventListener("visibilitychange", tick);
    }
  });
  return {
    settings,
    current,
    records,
    index,
    paused,
    offline,
    error,
    seconds,
    loading,
    testing,
    refresh,
    next,
    togglePause,
    setOffline,
    expire,
  };
}
