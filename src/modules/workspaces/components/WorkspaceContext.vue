<script setup lang="ts">
import { MRow, MText } from "@getcortexlabs/mavis-web";
import { useWorkspace } from "../composables/useWorkspace";
const { state } = useWorkspace();
</script>
<template>
  <MRow gap="md" wrap class="workspace-context"
    ><MText variant="caption"
      >{{ state.organization.name }} · ambiente fictício</MText
    ><RouterLink to="/organization/settings" class="text-link"
      >Trocar organização</RouterLink
    ><RouterLink to="/organization/notifications" class="text-link"
      >Notificações</RouterLink
    ><RouterLink to="/organization/guide" class="text-link"
      >Demonstração guiada</RouterLink
    ><RouterLink to="/organization/displays" class="text-link"
      >Telas e widget</RouterLink
    ></MRow
  >
</template>
<style scoped>
.workspace-context {
  padding-block: 16px;
  border-bottom: 1px solid var(--line);
  font-size: 12px;
}
</style>
