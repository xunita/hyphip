<script setup lang="ts">
const route = useRoute();
onMounted(() => {
  console.log(route.params);
});
onUnmounted(() => {
  window.onbeforeunload = function () {};
});
</script>
<template>
  <div class="sm:px-16 px-4">
    <h1 class="text-white text-center p-24">
      Here will be previewed the file saved previously
    </h1>
  </div>
</template>
