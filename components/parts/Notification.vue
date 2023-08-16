<script setup lang="ts">
defineProps({
  message: String,
});
</script>
<template>
  <div
    class="fixed bottom-6 z-10 sm:left-16 left-6 border border-gray-500 bg-zinc-800 p-4 rounded-lg text-center text-white text-xs cursor-default"
  >
    <span> {{ message }}</span>
  </div>
</template>
