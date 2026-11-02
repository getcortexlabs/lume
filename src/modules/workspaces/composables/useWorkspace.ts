import { ref, onScopeDispose } from "vue";
import { useServices } from "../../../app/services";
export function useWorkspace() {
  const { workspace } = useServices();
  const state = ref(workspace.getState());
  onScopeDispose(
    workspace.subscribe(() => {
      state.value = workspace.getState();
    }),
  );
  return { state, organizations: workspace.list(), workspace };
}
