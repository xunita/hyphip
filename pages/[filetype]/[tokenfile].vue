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
    <PartsFileLink class="py-8 min-h-screen" />
  </div>
</template>
