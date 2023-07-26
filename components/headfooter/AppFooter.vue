<script setup lang="ts">
const year = useState("year", () => new Date().getFullYear().toString());
</script>
<template>
  <div
    class="border-t border-gray-900 py-4 sm:px-16 px-4 flex justify-center relative bottom-0"
  >
    <div
      class="footer-div flex items-centers space-x-4 text-white font-semibold text-xs"
    >
      <span>
        <NuxtLink
          to="https://github.com/xunita"
          alt="Sopegue github"
          class="hover:underline"
          target="_blank"
        >
          Sopegue
        </NuxtLink>
        © {{ year }}
      </span>
      <NuxtLink to="/terms" class="hover:underline"> Terms of use </NuxtLink>
    </div>
  </div>
</template>
