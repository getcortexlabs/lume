<script setup lang="ts">
import { useRequestEvent } from "#app";
import { setResponseStatus } from "h3";
import NotFound from "~/shared/components/NotFound.vue";
definePageMeta({ title: "Página não encontrada" });
const event = useRequestEvent();
if (event) setResponseStatus(event, 404);
</script>
<template>
  <div class="route-surface"><NotFound /></div>
</template>
