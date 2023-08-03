<script setup lang="ts">
const route = useRoute();
onMounted(() => {});
onUnmounted(() => {
  window.onbeforeunload = function () {};
});
useHead({
  title: "File preview - Hyphip",
  meta: [{ name: "description", content: "Preview a file" }],
});
</script>
<template>
  <div class="sm:px-16 px-4">
    <h1 class="text-white text-center p-24">
      Here will be previewed the file saved previously
    </h1>
  </div>
</template>
