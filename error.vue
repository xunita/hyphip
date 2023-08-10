<script setup lang="ts">
useHead({
  title: "Error, oops something bad happens - Hyphip",
  meta: [{ name: "description", content: "Any error leads to this page" }],
});
const props = defineProps({
  error: Object,
});

onMounted(() => {
  console.clear();
});
const handleError = () => {
  window.location.assign("/");
};
</script>
<template>
  <ClientOnly>
    <div class="w-full h-full">
      <HeadfooterAppHeader />
      <div class="sm:px-16 px-4 flex justify-center items-center min-h-screen">
        <div
          class="text-white flex flex-col space-y-5 items-center justify-items-center"
        >
          <span class="text-9xl font-semibold"> {{ error.statusCode }}</span>
          <div>
            <span class="font-semibold text-2xl">{{
              error.statusMessage
            }}</span>
            <!-- <span class="font-semibold text-2xl">{{ error.url }}</span> -->
          </div>
          <button
            @click="handleError"
            class="b-file-save-button text-white flex space-x-2 items-center border border-gray-600 hover:border-gray-300 rounded px-4 pt-2 pb-3"
          >
            <span class="inline text-l font-semibold break-words"
              >Go to Home page</span
            >
          </button>
        </div>
      </div>
      <HeadfooterAppFooter />
    </div>
  </ClientOnly>
</template>
