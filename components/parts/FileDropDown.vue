<script setup lang="ts">
const emit = defineEmits(["action"]);
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
  type: String,
});
onMounted(() => {
  waitForVariable();
});
function action(action) {
  emit("action", action);
}
</script>
<template>
  <div class="z-20 rounded-lg">
    <div
      v-show="fileOk"
      class="border text-white border-gray-800 rounded-lg z-10 drop-shadow-lg"
    >
      <div class="flex flex-col">
        <button
          @click="action('download')"
          class="px-3 py-2 border-trasparent hover:border-gray-900 hover:bg-gray-900 flex items-center rounded-t-lg space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              fill-rule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="font-semibold text-xs">Download</span>
        </button>
        <button
          v-show="type === 'token'"
          @click="action('rename')"
          class="px-3 py-2 border-trasparent hover:border-gray-900 hover:bg-gray-900 flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z"
            />
          </svg>

          <span class="font-semibold text-xs">Rename</span>
        </button>
        <button
          v-show="props.type === 'token'"
          @click="action('delete')"
          class="px-3 py-2 border-trasparent hover:border-gray-900 hover:bg-gray-900 rounded-b-lg flex items-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              fill-rule="evenodd"
              d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
              clip-rule="evenodd"
            />
          </svg>

          <span class="font-semibold text-xs">Delete</span>
        </button>
      </div>
    </div>
  </div>
</template>
