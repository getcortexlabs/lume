<template>
  <RouterLink to="/" class="brand" aria-label="Lume, início"
    ><span class="brand-image"
      ><img
        src="/brand/lume-480.webp"
        srcset="
          /brand/lume-480.webp       480w,
          /brand/lume-960.webp       960w,
          /brand/lume-original.webp 1536w
        "
        sizes="150px"
        decoding="async"
        alt="Lume"
        width="1536"
        height="1024" /></span
  ></RouterLink>
</template>
<style scoped>
.brand {
  display: inline-flex;
  width: 123px;
  height: 40px;
  flex-shrink: 0;
}
.brand-image {
  position: relative;
  display: block;
  width: 123px;
  height: 40px;
  overflow: hidden;
}
.brand-image img {
  position: absolute;
  max-width: none;
  width: 150px;
  height: 100px;
  left: -13px;
  top: -33px;
}
</style>
