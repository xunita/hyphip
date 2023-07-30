<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";

function resetProgress() {
  progressCurrent.value = 0;
  progressTotal.value = 0;
}

function updateProgress(event) {
  resetProgress();
  if (event.lengthComputable) {
    progressCurrent.value = event.loaded; // Bytes loaded so far
    progressTotal.value = event.total; // Total bytes of the file

    // Calculate the progress percentage
    progressLevel.value = (progressCurrent.value / progressTotal.value) * 100;
  }
}

function readFile(f) {
  const reader = new FileReader();
  try {
    reader.readAsArrayBuffer(f[0]);
    reader.onload = function (event) {
      file_loading_or_saving.value = false;
      setFileToLoad();
      setFileString(f[0].name);
      setFileName();
      unsetSpanDrop();
      unsetLoadButton();
      setSaveButton();
      unsetHasError();
    };
    reader.onprogress = function (event) {
      file_loading_or_saving.value = true;
      updateProgress(event);
    };

    reader.onerror = function (event) {
      setHasError();
      file_loading_or_saving.value = false;
    };
  } catch (error) {
    enable_filedrop_area.value = false;
    setHasError();
    file_loading_or_saving.value = false;
  }
}

function readFileDrop(f) {
  enable_filedrop_area.value = false;
  const reader = new FileReader();
  try {
    reader.readAsArrayBuffer(f[0]);
    reader.onload = function (event) {
      file_loading_or_saving.value = false;
      enable_filedrop_area.value = false;
      setFileToLoad();
      setFileString(f[0].name);
      setFileName();
      unsetSpanDrop();
      unsetLoadButton();
      setSaveButton();
      unsetHasError();
    };
    reader.onprogress = function (event) {
      file_loading_or_saving.value = true;
      updateProgress(event);
    };

    reader.onerror = function (event) {
      enable_filedrop_area.value = false;
      setHasError();
      file_loading_or_saving.value = false;
    };
  } catch (error) {
    enable_filedrop_area.value = false;
    setHasError();
    file_loading_or_saving.value = false;
  }
}

const file = useState("file", () => "");
const oldfile = useState("oldfile", () => "");
// const fileToSave = useState("fileToSave", () => "");
function getFile() {
  const fu = document.getElementById("file-upload");
  if (fu != null) fu.click();
}

function setFileString(name: string) {
  filename.value = name;
}

function reset() {
  setFileString("unknown.unknown");
  unsetFileToLoad();
  unsetFileName();
  setSpanDrop();
  setLoadButton();
  unsetSaveButton();
  unsetHasError();
}

function goUpProgress() {
  if (progressLevel.value == 100) progressLevel.value = 0;
  progressLevel.value++;
}

function setProgressLeveltry() {
  setInterval(goUpProgress, 50);
}

function setProgressLevel(value) {
  progressLevel.value = value;
}

function setHasError() {
  enable_error.value = true;
}
function unsetHasError() {
  enable_error.value = false;
}

function setLoadSave() {
  file_loading_or_saving.value = true;
}
function unsetLoadSave() {
  file_loading_or_saving.value = false;
}

function setFileName() {
  enable_filename.value = true;
}
function unsetFileName() {
  enable_filename.value = false;
}

function setLoadButton() {
  enable_fileupload_button.value = true;
}
function unsetLoadButton() {
  enable_fileupload_button.value = false;
}

function setSaveButton() {
  enable_savebutton.value = true;
}
function unsetSaveButton() {
  enable_savebutton.value = false;
}

function setFileToLoad() {
  file_to_load.value = true;
}
function unsetFileToLoad() {
  file_to_load.value = false;
}

function setSpanDrop() {
  enable_filedrop_span.value = true;
}
function unsetSpanDrop() {
  enable_filedrop_span.value = false;
}

function setDropArea() {
  enable_filedrop_area.value = true;
}
function unsetDropArea() {
  enable_filedrop_area.value = false;
}

function onChange(e) {
  unsetFileToLoad();
  setLoadSave();
  unsetHasError();
  oldfile.value = file.value;
  file.value = "";
  file.value = e.target.files || e.dataTransfer.files;
  if(file.value.length !== 0) readFile(file.value);
  else {
    file.value = oldfile.value;
  }
  unsetLoadSave();
}

function onDrop(e) {
  unsetFileToLoad();
  setLoadSave();
  unsetHasError();
  file.value = "";
  file.value = e.target.files || e.dataTransfer.files;
  readFileDrop(file.value);
  unsetLoadSave();
}
function disableDragDiv() {
  enable_filedrop_area.value = false;
}
function enableDragDiv() {
  if (!enable_filedrop_area.value) {
    if (!enable_filename.value) enable_filedrop_area.value = true;
  }
}

function preventDefaults(e) {
  e.preventDefault();
}

const checkFileIn = useState("checkFileIn", () =>
  file.value != null ? true : false
);

function quitMessage() {
  if (checkFileIn.value)
    return confirm("Are you sure ? Your file will be lost.");
}

const events = ["dragenter", "dragover", "dragleave", "drop", "drag"];

function beforeUnloadListener() {
  const answer = window.confirm(
    "Are you sure you want to leave ? Your file will be lost!"
  );
  // cancel the navigation and stay on the same page
  if (!answer) return false;
}
const file_to_load = useState("file_to_load", () => false);

// onBeforeRouteLeave(() => {
//   beforeUnloadListener();
// });

onMounted(() => {
  // setProgressLeveltry();
  watch(
    file_to_load,
    async (newCheck, oldCheck) => {
      if (newCheck) {
        window.onbeforeunload = function () {
          if (newCheck == true) return "handle your events or msgs here";
        };
      } else {
        window.onbeforeunload = function () {};
      }
    },
    { immediate: true }
  );
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

// onBeforeRouteLeave((to, from) => {
//   console.log("on leave");
//   const answer = window.confirm(
//     "Are you sure you want to leave ? Your file will be lost!"
//   );
//   // cancel the navigation and stay on the same page
//   if (!answer) return false;
// });

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});
const filename = useState("filename", () => "unknown.unknown");

const progressCurrent = useState("progressCurrent", () => 0);
const progressTotal = useState("progressTotal", () => 0);
const progressLevel = useState("progressLevel", () => 0);

const enable_filename = useState("enable_filename", () => false);
const enable_error = useState("enable_error", () => false);
const enable_extension_error = useState("enable_extension_error", () => false);
const enable_savebutton = useState("enable_savebutton", () => false);

const enable_fileupload_button = useState(
  "enable_fileupload_button",
  () => true
);
const enable_filedrop_span = useState("enable_filedrop_span", () => true);
const enable_filedrop_area = useState("enable_filedrop_area", () => false);

// const file_droping = useState("file_droping", () => false);
const file_loading_or_saving = useState("file_loading_or_saving", () => false);
</script>
<template>
  <div
    class="relative my-32 lg:mx-64 md:mx-24 mx-8 flex flex-col space-y-16 items-center"
  >
    <div class="relative text-white">
      <div
        @drop.prevent="onDrop"
        @dragleave.prevent="disableDragDiv"
        @dragenter.prevent="enableDragDiv"
        @dragover.prevent="enableDragDiv"
        v-show="enable_filedrop_area"
        class="absolute flex flex-col justify-center rounded-lg w-full h-full absolute bg-slate-700"
      >
        <span class="text-2xl text-center font-semibold">Drop your file</span>
      </div>

      <div v-show="file_loading_or_saving">
        <div
          class="absolute opacity-50 rounded-lg lg:px-20 md:px-16 px-8 -py-6 w-full h-full absolute bg-slate-700"
        ></div>
        <div
          class="absolute w-full bg-gray-200 rounded-t-full h-1 mb-4 dark:bg-gray-700"
        >
          <div
            :class="{
              'rounded-tl-lg': progressLevel < 100,
              'rounded-t-lg': progressLevel == 100,
            }"
            class="progress-bar-color h-1 dark:bg-blue-500 smooth-width-increase"
            :style="{ width: `${progressLevel}%` }"
          ></div>
        </div>
      </div>

      <div
        @dragenter.prevent="enableDragDiv"
        @dragover.prevent="enableDragDiv"
        class="load-file-div border border-gray-800 rounded-lg lg:px-20 md:px-16 px-8 py-6 flex flex-col justify-items-center items-center space-y-3.5"
      >
        <h1 class="font-bold text-2xl">Link your file</h1>
        <span class="inline text-center break-words text-sm"
          >Manage your files by linking them. HYPHIP help you save, edit,
          preview your files. It's then easy for you to access your files
          anytime and anywhere you want.
        </span>

        <span
          v-show="enable_filename"
          class="inline text-center break-words text-md font-bold text-ellipsis"
        >
          {{ filename }}
        </span>

        <div v-show="enable_fileupload_button" class="file-load-button">
          <button
            @click="getFile"
            class="b-file-load-button text-white flex space-x-2 items-center hover:bg-gray-800 rounded-full px-4 py-1.5"
          >
            <svg
              class="h-8 w-8"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <span class="inline sm:text-sm text-xs font-semibold break-words"
              >Upload your file</span
            >
            <input @change="onChange" id="file-upload" type="file" />
          </button>
        </div>

        <div v-show="enable_savebutton" class="file-save-button">
          <button
            class="b-file-save-button text-white flex space-x-2 items-center hover:bg-gray-800 rounded-full px-4 py-1.5"
          >
            <svg
              class="h-8 w-8"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </svg>
            <span class="inline sm:text-sm text-xs font-semibold break-words"
              >Save your file</span
            >
          </button>
        </div>
        <div v-show="enable_savebutton" class="file-reset-button">
          <button
            @click="reset"
            class="b-file-reset-button text-white flex space-x-2 items-center hover:bg-gray-800 rounded-full px-6 py-1.5"
          >
            <span class="inline sm:text-sm text-xs font-semibold break-words"
              >Reset</span
            >
          </button>
        </div>
        <span
          v-show="enable_filedrop_span"
          class="inline text-center break-words text-xs"
          >You can also drop your file here
        </span>
        <span
          v-show="enable_error"
          class="inline text-center break-words text-xs text-red-400"
          >Oops, something went wrong, try again
        </span>
        <span
          v-show="enable_extension_error"
          class="inline text-center break-words text-xs text-red-400"
        >
          Sorry, this extension is not allowed
        </span>
      </div>
    </div>

    <PartsLogInMessage />
    <div class="h-128"></div>
  </div>
</template>
