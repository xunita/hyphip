<script setup lang="ts">
import { onMounted, onUnmounted, watch } from "vue";
const router = useRouter();
const route = useRoute();
function getStringAfter(str, search) {
  const index = str.indexOf(search);
  if (index === -1) {
    return ""; // Return an empty string if the search string is not found
  }
  const startIndex = index + search.length;
  return str.slice(startIndex);
}
function addMonthsToTimestamp(timestamp, monthsToAdd) {
  // Convert Unix epoch timestamp to milliseconds
  const milliseconds = timestamp * 1000;

  // Create a new Date object using the timestamp
  const date = new Date(milliseconds);

  // Add the specified number of months to the date
  date.setMonth(date.getMonth() + monthsToAdd);

  // Convert the updated date back to a Unix epoch timestamp
  const newTimestamp = Math.floor(date.getTime() / 1000);

  return newTimestamp;
}
function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getDateTimeFromTimestamp(timestamp) {
  // Create a new Date object with the provided timestamp
  const date = new Date(timestamp * 1000);

  // Extract the components of the date
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Adding 1 since months are zero-based (0 - 11)
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Return the date and time in a readable format (e.g., "YYYY-MM-DD HH:MM:SS")
  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function upload_file(file, metadata, link_metadata) {
  try {
    unsetHasError();
    const uniqueFileName = `${Date.now()}_hyphip_${file.name}`;
    const storage = nuxtApp.$firestorage;
    const fileRef = nuxtApp.$fireref(
      storage,
      link_metadata.filetype + uniqueFileName
    );

    // Upload the file and metadata
    const uploadTask = nuxtApp.$uploadBytesResumable(fileRef, file, {
      metadata,
    });

    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        progressLevel.value =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            setLoadSave();
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        unsetLoadSave();
        setHasError();
      },
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        nuxtApp
          .$getDownloadURL(uploadTask.snapshot.ref)
          .then(async (downloadURL) => {
            // console.log(fileRef);
            // await delay(10000);
            // Create our initial doc
            try {
              const db = nuxtApp.$firestore;
              const doc = nuxtApp.$fireDoc;
              const setDoc = nuxtApp.$fireSetDoc;
              const created_at = +Date.now().toString() / 1000;

              setDoc(doc(db, "links", link_metadata.filetoken), {
                uploaded_at: created_at,
                created_at: created_at,
                deadline: addMonthsToTimestamp(+created_at, 3),
                filelocation: downloadURL,
                filetoken: link_metadata.filetoken,
                filetype: link_metadata.filetype,
                fileref: link_metadata.filetype + uniqueFileName,
                f_del_ref: link_metadata.f_del_ref,
                link: link_metadata.link,
                file_metadata: metadata,
              })
                .then(() => {
                  setProgressLevel(100);
                  setTimeout(() => {
                    unsetLoadSave();
                    resetProgress();
                  }, 500);
                  // return navigateTo("/search");
                  // console.log(getStringAfter(link_metadata.f_del_ref, "hyphip_"));
                  unsetFileToLoad();
                  reset();
                  const url =
                    "/" + link_metadata.filetype + link_metadata.filetoken;
                  setTimeout(() => {
                    window.location.assign(url);
                  }, 0);
                })
                .catch((error) => {
                  unsetLoadSave();
                  setHasError();
                });
            } catch (error) {
              unsetLoadSave();
              setHasError();
            }
          })
          .catch((err) => {
            unsetLoadSave();
            setHasError();
          });
      }
    );
  } catch (error) {
    unsetLoadSave();
    setHasError();
  }
}

function generateRandomToken(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }
  return token;
}

function generateFunLinkWithToken(fileName) {
  const adjectives = [
    "happy",
    "playful",
    "awesome",
    "funky",
    "crazy",
    "silly",
    "quirky",
    "fantastic",
    "wonderful",
    "epic",
    "magical",
  ];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];

  // Replace spaces with underscores in the cleaned file name
  const linkName = randomAdjective;

  // Add a random unique token to the link name
  const tokenLength = Math.min(128, fileName.length); // Adjust the length of the token as desired
  const randomToken = generateRandomToken(tokenLength);

  const funLinkWithToken = linkName + "-" + randomToken;

  return funLinkWithToken;
}

function generateUniqueToken() {
  const timestamp = Date.now().toString(36); // Convert the current timestamp to base36
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
  const token = timestamp + "-" + randomString;

  // Generate a hash from the token to make it even more unique
  const hash = btoa(token).replace(/=/g, "").substring(0, 32); // Base64 encoding and trimming

  return hash;
}

function generateRandomLinkName() {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const length = 8; // Length of the random link name
  let randomLinkName = "";

  // Generate random characters for the link name
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomLinkName += characters.charAt(randomIndex);
  }

  // Add the current timestamp to make it more unique
  const timestamp = Date.now().toString(36); // Convert the current timestamp to base36
  randomLinkName += "-" + timestamp;

  return randomLinkName;
}

function generateFunLinkName(fileName) {
  const adjectives = [
    "happy",
    "playful",
    "awesome",
    "funky",
    "crazy",
    "silly",
    "quirky",
    "fantastic",
    "wonderful",
    "epic",
    "magical",
  ];
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];

  // Remove spaces and special characters from the file name and convert to lowercase
  const cleanedFileName = fileName.replace(/[^\w\s]/gi, "").toLowerCase();

  // Combine the adjective and cleaned file name
  const funLinkName = randomAdjective + "-" + cleanedFileName;

  return funLinkName;
}

const nuxtApp = useNuxtApp();

function getFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return ""; // File name has no extension
  }
  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

function savefile() {
  unsetHasError();
  unsetExtensionHasError();
  try {
    if (file_to_load.value) {
      if (file.value.length !== 0) {
        if (isExtensionAllowed(file.value[0])) {
          const to_upload = file.value[0];
          const filename = to_upload.name;
          const filesize = to_upload.size.toString();
          const filetoken = generateUniqueToken();
          const filetype = getFileType(to_upload.name);
          const link = generateFunLinkWithToken(to_upload.name);

          const metadata = {
            type: to_upload.type,
            size: filesize,
            name: filename,
            lastmodified: to_upload.lastModified / 1000,
          };

          const link_metadata = {
            filetoken: filetoken,
            filetype: filetype,
            link: link,
            f_del_ref: `${Date.now()}_hyphip_${to_upload.name}`,
          };

          // prepare to save
          upload_file(to_upload, metadata, link_metadata);
        } else {
          reset();
          setTimeout(() => {
            setExtensionHasError();
          }, 50);
        }
      } else {
        reset();
        setTimeout(() => {
          setHasError();
        }, 50);
      }
    } else {
      reset();
      setTimeout(() => {
        setHasError();
      }, 50);
    }
  } catch (error) {
    setHasError();
  }
}

function getFileType(fileName) {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg"];
  const videoExtensions = ["mp4", "avi", "wmv", "mov"];
  const pdfExtension = "pdf";
  const subtitleExtension = "srt";

  const fileExtension = fileName.split(".").pop().toLowerCase();

  if (imageExtensions.includes(fileExtension)) {
    return "images/";
  } else if (videoExtensions.includes(fileExtension)) {
    return "videos/";
  } else if (fileExtension === pdfExtension) {
    return "pdfs/";
  } else if(fileExtension === subtitleExtension) {
    return "srts/";
  }
}

function isExtensionAllowed(theFile) {
  const allowedExtensions =
    /\.(jpg|jpeg|png|gif|bmp|svg|mp4|avi|wmv|mov|pdf|srt)$/i;
  return allowedExtensions.test(theFile.name);
}

function resetProgress() {
  progressCurrent.value = 0;
  progressTotal.value = 0;
}

function setProgress100() {
  progressLevel.value = 100;
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
  unsetDropArea();
  const reader = new FileReader();
  try {
    reader.readAsArrayBuffer(f[0]);
    reader.onload = function (event) {
      setProgress100();

      setTimeout(() => {
        unsetLoadSave();
        setFileToLoad();
        setFileString(f[0].name);
        setFileName();
        unsetSpanDrop();
        unsetLoadButton();
        setSaveButton();
        unsetHasError();
        resetProgress();
      }, 250);
      // console.log(file.value[0]);
      // console.log(getFileType(file.value[0].name));
      // console.log(generateFunLinkWithToken(file.value[0].name));
    };
    reader.onprogress = function (event) {
      setLoadSave();
      updateProgress(event);
    };

    reader.onerror = function (event) {
      resetProgress();
      setHasError();
      unsetLoadSave();
    };
  } catch (error) {
    unsetDropArea();
    setHasError();
    unsetLoadSave();
    resetProgress();
  }
}

function readFileDrop(f) {
  unsetDropArea();
  const reader = new FileReader();
  try {
    reader.readAsArrayBuffer(f[0]);
    reader.onload = function (event) {
      setProgress100();
      setTimeout(() => {
        unsetLoadSave();
        unsetDropArea();
        setFileToLoad();
        setFileString(f[0].name);
        setFileName();
        unsetSpanDrop();
        unsetLoadButton();
        setSaveButton();
        unsetHasError();
        resetProgress();
      }, 250);
    };
    reader.onprogress = function (event) {
      setLoadSave();
      updateProgress(event);
    };

    reader.onerror = function (event) {
      resetProgress();
      unsetDropArea();
      setHasError();
      unsetLoadSave();
    };
  } catch (error) {
    resetProgress();
    unsetDropArea();
    setHasError();
    unsetLoadSave();
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
  file.value = "";
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

function setExtensionHasError() {
  enable_extension_error.value = true;
}
function unsetExtensionHasError() {
  enable_extension_error.value = false;
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
  unsetExtensionHasError();
  oldfile.value = file.value;
  file.value = "";
  file.value = e.target.files || e.dataTransfer.files;
  if (file.value.length !== 0) {
    if (isExtensionAllowed(file.value[0])) {
      readFile(file.value);
    } else {
      unsetDropArea();
      setExtensionHasError();
    }
  } else {
    file.value = oldfile.value;
  }
  unsetLoadSave();
}

function onDrop(e) {
  unsetFileToLoad();
  setLoadSave();
  unsetHasError();
  unsetExtensionHasError();
  file.value = "";
  file.value = e.target.files || e.dataTransfer.files;
  if (isExtensionAllowed(file.value[0])) {
    readFileDrop(file.value);
  } else {
    unsetDropArea();
    setExtensionHasError();
  }
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

const events = [
  "dragenter",
  "onbeforeunload",
  "dragover",
  "dragleave",
  "drop",
  "drag",
];

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
  reset();
  watch(file_to_load, async (newCheck, oldCheck) => {
    if (newCheck) {
      window.onbeforeunload = function () {
        if (newCheck == true) return "handle your events or msgs here";
        else {
          window.onbeforeunload = function () { };
        }
      };
    } else {
      window.onbeforeunload = function () { };
    }
  });
  watch(file_loading_or_saving, async (newCheck, oldCheck) => {
    if (newCheck) {
      window.onbeforeunload = function () {
        if (newCheck == true) return "handle your events or msgs here";
      };
    }
  });
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
  reset();
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
  <div>
    <div>
      <div class="relative text-white z-10">
        <div @drop.prevent="onDrop" @dragleave.prevent="disableDragDiv" @dragenter.prevent="enableDragDiv"
          @dragover.prevent="enableDragDiv" v-show="enable_filedrop_area"
          class="absolute flex flex-col justify-center rounded w-full h-full absolute bg-slate-700 z-40">

        </div>
        <div @drop.prevent="onDrop" @dragleave.prevent="disableDragDiv" @dragenter.prevent="enableDragDiv"
          @dragover.prevent="enableDragDiv" v-show="enable_filedrop_area"
          class="absolute w-full h-full flex items-center justify-center text-2xl text-center font-semibold z-40 text-white">
          Drop
          your
          file</div>
        <div class="absolute w-full h-full" v-show="file_loading_or_saving">
          <div class="opacity-50 rounded absolute w-full h-full absolute bg-slate-700"></div>
          <div :class="{
            'rounded-tl': progressLevel < 100,
            'rounded-t': progressLevel == 100,
          }" class="absolute w-full bg-gray-200 h-1 progress-bar-color smooth-width-increase"
            :style="{ width: `${progressLevel}%` }"></div>
        </div>

        <div @dragenter.prevent="enableDragDiv" @dragover.prevent="enableDragDiv" class="relative z-0">
          <div
            class="load-file-div border border-gray-800 rounded lg:px-20 md:px-16 px-8 py-6 flex flex-col justify-items-center items-center space-y-3.5">
            <h1 class="font-bold text-2xl">Link your file</h1>
            <span class="inline text-center break-words text-sm">Manage your files by linking them. HYPHIP help you save,
              edit,
              preview your files. It's then easy for you to access your files
              anytime and anywhere you want.
            </span>

            <span v-show="enable_filename" class="inline text-center break-words text-md font-bold text-ellipsis">
              {{ filename }}
            </span>

            <div v-show="enable_fileupload_button" class="file-load-button">
              <button @click="getFile"
                class="b-file-load-button text-white flex space-x-2 items-center hover:bg-gray-800 border border-gray-800 rounded-full px-4 py-2">
                <svg class="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
                  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <span class="inline text-xs font-semibold break-words">Upload your file</span>
                <input @change="onChange" id="file-upload" type="file" />
              </button>
            </div>

            <div v-show="enable_savebutton" class="file-save-button">
              <button @click="savefile"
                class="b-file-save-button text-white flex space-x-2 items-center border border-gray-800 hover:bg-gray-800 rounded-full px-4 py-2">
                <svg class="h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"
                  viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                    stroke-linecap="round" stroke-linejoin="round"></path>
                </svg>
                <span class="inline text-xs font-semibold break-words">Save your file</span>
              </button>
            </div>
            <div v-show="enable_savebutton" class="file-reset-button">
              <button @click="reset"
                class="b-file-reset-button text-white flex space-x-2 items-center hover:bg-gray-800 rounded-full px-6 py-1.5">
                <span class="inline sm:text-sm text-xs font-semibold break-words">Reset</span>
              </button>
            </div>
            <span v-show="enable_filedrop_span" class="inline text-center break-words text-xs">You can also drop your file
              here
            </span>
            <span v-show="enable_error" class="inline text-center break-words text-xs text-red-400">Oops, something went
              wrong, try again
            </span>
            <span v-show="enable_extension_error" class="inline text-center break-words text-xs text-red-400">
              Sorry, this extension is not allowed
            </span>
          </div>
        </div>
      </div>

      <!-- <PartsLogInMessage /> -->
    </div>
  </div>
</template>
