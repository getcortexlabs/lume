<script setup lang="ts">
import { computed } from "vue";
import { evidenceParts } from "../presentation/evidence";
const props = defineProps<{ source: string; quote: string }>();
const parts = computed(() => evidenceParts(props.source, props.quote));
</script>
<template>
  <pre
    tabindex="0"
    aria-label="Registro de origem"
  ><template v-for="(part,index) in parts" :key="index"><mark v-if="part.highlight">{{part.text}}</mark><template v-else>{{part.text}}</template></template></pre>
</template>
<style scoped>
mark {
  background: #d9f99d;
  color: #18261b;
  border-radius: 3px;
  padding: 2px;
}
pre:focus-visible {
  outline: 2px solid #536b3e;
  outline-offset: 4px;
}
</style>
