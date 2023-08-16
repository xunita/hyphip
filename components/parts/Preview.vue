<script setup lang="ts">
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function waitForVariable() {
  while (props.file === null) {
    await delay(100); // Wait 100 milliseconds
  }
  fileOk.value = true;
}
const fileOk = useState("fileOk", () => false);
const props = defineProps({
  file: {
    type: Object,
    default: null,
  },
});
function toggleOverflow() {
  const body = document.querySelector("body");
  if (body) {
    body.style.overflowY = "hidden";
  }
}

function untoggleOverflow() {
  const body = document.querySelector("body");
  if (body) {
    body.style.overflowY = "auto";
  }
}
onMounted(() => {
  waitForVariable();
  toggleOverflow();
});

onUnmounted(() => {
  untoggleOverflow();
});
</script>
<template>
  <div
    class="fixed z-20 text-white w-full h-full top-0 left-0 bg-black bg-black/75 cursor-default"
  >
    <span> file preview</span>
  </div>
</template>
