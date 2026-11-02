import { ref } from "vue";
import { useServices } from "../../../app/services";
export function useSimulation() {
  const { simulation } = useServices();
  const state = ref(simulation.getState()),
    latency = ref(String(state.value.latencyMs)),
    message = ref("");
  function apply(reset = false) {
    if (reset) {
      state.value = {
        latencyMs: 0,
        unavailable: false,
        role: "reviewer",
        conflictNextWrite: false,
      };
      latency.value = "0";
    }
    simulation.configure({ ...state.value, latencyMs: Number(latency.value) });
    state.value = simulation.getState();
    message.value =
      "Cenário aplicado nesta sessão. Abra uma jornada para experimentar.";
  }
  return { state, latency, message, apply };
}
