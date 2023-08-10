<script setup lang="ts">
useHead({
  title: "Home - Hyphip",
  meta: [{ name: "description", content: "Hyphip" }],
});
const componentKey = useState("componentKey", () => 0);

const forceRender = () => {
  componentKey.value += 1;
};
</script>
<template>
  <div class="sm:px-16 px-6">
    <PartsLoadFile
      :key="componentKey"
      class="flex justify-center items-center min-h-screen"
    />
  </div>
</template>
