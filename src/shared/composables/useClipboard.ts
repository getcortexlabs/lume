import { useToast } from "@getcortexlabs/mavis-web";
import { ref } from "vue";

/** Browser APIs stay behind user-triggered actions, never module initialization. */
export function useClipboard() {
  const message = ref("");
  const toast = useToast({ scope: "app" });
  async function copy(
    text: string,
    success = "Copiado para a área de transferência.",
  ) {
    try {
      await navigator.clipboard.writeText(text);
      message.value = success;
      toast.show({ message: success, tone: "success" });
    } catch {
      message.value =
        "Não foi possível copiar automaticamente. Selecione o conteúdo e copie manualmente.";
      toast.show({ message: message.value, tone: "warning" });
    }
  }
  return { message, copy };
}
