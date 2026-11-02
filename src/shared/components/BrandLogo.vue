<template>
  <RouterLink to="/" class="brand" aria-label="Lume, início"
    ><span class="brand-image"
      ><img
        src="/brand/lume-original.png"
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
