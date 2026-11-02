<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 72 });
</script>

<template>
  <span
    class="brand-symbol"
    :style="{ '--symbol-size': `${size}px` }"
    aria-hidden="true"
  >
    <img
      src="/brand/lume-480.webp"
      srcset="
        /brand/lume-480.webp       480w,
        /brand/lume-960.webp       960w,
        /brand/lume-original.webp 1536w
      "
      :sizes="`${size * 4.86}px`"
      decoding="async"
      alt=""
      width="1536"
      height="1024"
    />
  </span>
</template>

<style scoped>
.brand-symbol {
  position: relative;
  display: block;
  width: var(--symbol-size);
  height: calc(var(--symbol-size) * 0.92);
  overflow: hidden;
  flex-shrink: 0;
}
.brand-symbol img {
  position: absolute;
  width: calc(var(--symbol-size) * 4.86);
  height: auto;
  max-width: none;
  left: calc(var(--symbol-size) * -0.427);
  top: calc(var(--symbol-size) * -1.161);
}
</style>
