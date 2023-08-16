<script setup lang="ts">
const previewed = useState("previewed", () => false);
const renaming = useState("renaming", () => false);
const deleting = useState("deleting", () => false);
const newname = useState("newname", () => "");
function getFileNameWithoutExtension(fullFileName) {
  const fileNameWithExtension = fullFileName.split("\\").pop().split("/").pop(); // Get the file name from the full path
  const fileNameWithoutExtension = fileNameWithExtension
    .split(".")
    .slice(0, -1)
    .join("."); // Remove extension
  return fileNameWithoutExtension;
}
function getFileExtension(fileName) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return ""; // File name has no extension
  }
  return "." + fileName.slice(lastDotIndex + 1).toLowerCase();
}
function action(action) {
  more.value = false;
  moreContextmenu.value = false;
  morePetit.value = false;

  if (action === "preview") tryPreview();
  else if (action === "download") tryDownload();
  else if (action === "rename") tryRename();
  else tryDelete();
}
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
function tryPreview() {
  previewed.value = !previewed.value;
}

function downloadFileUsingLink(fileUrl, fileName) {
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function tryDownload() {
  try {
    downloadFileUsingLink(
      file.value.filelocation,
      file.value.file_metadata.name
    );
  } catch (error) {
    // console.log(error);
    showError({
      statusCode: 500,
      statusMessage: "Failed to download file",
    });
  }
}
function tryRename() {
  try {
    renaming.value = true;
    newname.value = getFileNameWithoutExtension(file.value.file_metadata.name);
    toggleOverflow();
  } catch (error) {
    renaming.value = false;
  }
}

async function updateName(name) {
  if (
    name + getFileExtension(file.value.file_metadata.name) !==
    file.value.file_metadata.name
  ) {
    try {
      const db = nuxtApp.$firestore;
      const nametochange =
        name + getFileExtension(file.value.file_metadata.name);
      const linkRef = nuxtApp.$fireDoc(db, "links", file.value.filetoken);
      await nuxtApp.$fireUpdateDoc(linkRef, {
        file_metadata: {
          lastmodified: file.value.file_metadata.lastmodified,
          name: nametochange,
          size: file.value.file_metadata.size,
          type: file.value.file_metadata.type,
        },
      });
      file.value.file_metadata.name = nametochange;
      notify("Name updated successfully. New name: " + nametochange);
      untoggleOverflow();
      renaming.value = false;
    } catch (error) {
      notify("Oops, something wrong happened, try again or reload the page");
      renaming.value = false;
    }
  } else {
    notify("File name has not changed");
    renaming.value = false;
  }
}

function tryDelete() {
  try {
  } catch (error) {
    notify("Oops, something wrong happened, try again or reload the page");
    showError({
      statusCode: 500,
      statusMessage: "Failed to delete the file",
    });
  }
}

const route = useRoute();
const nuxtApp = useNuxtApp();

const type = useState("type", () => "hyphip");

const copiedP = useState("copiedP", () => false);
const copiedT = useState("copiedT", () => false);
const copiedL = useState("copiedL", () => false);

const more = useState("more", () => false);
const hovered = useState("hovered", () => false);

const moreContextmenu = useState("moreContextmenu", () => false);
const morePetit = useState("morePetit", () => false);
const wantFile = useState("wantFile", () => false);

const divLeft = useState("divLeft", () => 0);
const divTop = useState("divTop", () => 0);

const touchTimeout = useState("touchTimeout", () => 0);

async function copyToClipboard(message, tOrL) {
  try {
    await navigator.clipboard.writeText(message);
    if (tOrL === "T") copiedT.value = true;
    else if (tOrL === "L") copiedL.value = true;
    else copiedP.value = true;
    console.log("Text copied to clipboard:", message);
  } catch (error) {
    if (tOrL === "T") copiedT.value = false;
    else if (tOrL === "L") copiedL.value = false;
    else copiedP.value = false;
    showError({
      statusCode: 500,
      statusMessage: "Failed to copy text to clipboard",
    });
  }
}

function handleTouchStart(event) {
  touchTimeout.value = setTimeout(() => {
    handleLongPress(event);
  }, 300);
}
function handleTouchEnd() {
  clearTimeout(touchTimeout.value);
}
function handleTouchCancel() {
  clearTimeout(touchTimeout.value);
}

function getlinkOr() {
  return window.location.origin + "/";
}

function getlinkMid() {
  return file.value.filetype;
}

function getlink() {
  return file.value.link;
}

function getlinkPr() {
  return file.value.filetoken;
}
function handleLongPress(event) {
  event.preventDefault();
  moreContextmenu.value = false;
  morePetit.value = true;
}

function handleClick(event) {
  moreContextmenu.value = false;
  more.value = !more.value;
  morePetit.value = !morePetit.value;
}

function handleClickContextmenu(event) {
  more.value = false;
  event.preventDefault();
  divTop.value = event.clientY;
  divLeft.value = event.clientX;
  if (moreContextmenu.value) {
    moreContextmenu.value = false;
    setTimeout(() => {
      moreContextmenu.value = true;
    }, 50);
  } else {
    moreContextmenu.value = true;
  }
}

function nofiling() {
  wantFile.value = false;
}

function filing() {
  window.location.assign("/");
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const timeoutId = useState("timeoutId ", () => 0);

const setNotif = useState("setNotif", () => false);
const notifMessage = useState("notifMessage", () => "Hyphip");

const notifications = useState("notifications", () => []);

// watch(notifications, async (newCheck, oldCheck) => {});

const file = useState("file", () => null);
const isToken = useState("isToken", () => false);
const isLink = useState("isLink", () => false);
const hasFile = useState("hasFile", () => false);
const deadlineDate = useState("deadlineDate", () => 0);
function stringDateToTimestamp(dateString) {
  const timestamp = Date.parse(dateString);
  return timestamp / 1000;
}

function setUpDate(timestamp) {
  const datePicker = document.getElementById("datePicker");
  const datePickerPetit = document.getElementById("datePickerPetit");

  // Set the minimum and maximum date
  const today = new Date();
  const maxDate = new Date(timestamp * 1000); // Date that can be max out
  maxDate.setMonth(maxDate.getMonth() + 6); // Set maximum date to 6 months from maxDate

  datePicker.min = today.toISOString().split("T")[0];
  datePickerPetit.min = today.toISOString().split("T")[0];

  datePicker.max = maxDate.toISOString().split("T")[0];
  datePickerPetit.max = maxDate.toISOString().split("T")[0];
}
function openDatePetit() {
  const datePicker = document.getElementById("datePickerPetit");
  datePicker.showPicker();
  datePicker.focus();
}

function openDate() {
  const datePicker = document.getElementById("datePicker");
  datePicker.showPicker();
  datePicker.focus();
}

async function notify(message) {
  if (setNotif.value) {
    clearTimeout(timeoutId.value);
    setNotif.value = false;
    await delay(30);
  }
  setNotif.value = true;
  notifMessage.value = message;
  timeoutId.value = setTimeout(() => {
    setNotif.value = false;
  }, 3000);
}

async function updateDeadline(timestamp) {
  try {
    const db = nuxtApp.$firestore;
    const linkRef = nuxtApp.$fireDoc(db, "links", file.value.filetoken);
    await nuxtApp.$fireUpdateDoc(linkRef, {
      deadline: timestamp,
    });
    file.value.deadline = timestamp;
    notify("Deadline updated successfully");
  } catch (error) {
    notify("Oops, something wrong happened, try again");
  }
}

function selectDate() {
  const datePicker = document.getElementById("datePicker");
  deadlineDate.value = stringDateToTimestamp(datePicker.value);
  updateDeadline(deadlineDate.value);

  // updateDeadlineDate(deadlineDate.value);
}

function selectDatePetit() {
  const datePicker = document.getElementById("datePickerPetit");
  deadlineDate.value = stringDateToTimestamp(datePicker.value);
  updateDeadline(deadlineDate.value);

  // updateDeadlineDate(deadlineDate.value);
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + units[i];
}
function getStringAfter(str, search) {
  const index = str.indexOf(search);
  if (index === -1) {
    return ""; // Return an empty string if the search string is not found
  }
  const startIndex = index + search.length;
  return str.slice(startIndex);
}
function getHumanReadableDateTimeFromTimestamp(timestamp) {
  // Define arrays for month and day names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Create a new Date object with the provided timestamp
  const date = new Date(timestamp * 1000);

  // Extract the components of the date
  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const dayOfWeek = days[date.getDay()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Return the date and time in a readable format
  return `${month} ${day}, ${year}`;
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

function setHasFile() {
  hasFile.value = true;
}
function unsetHasFile() {
  hasFile.value = false;
}

function setIsToken() {
  isToken.value = true;
}
function unsetIsToken() {
  isToken.value = false;
}

function setIsLink() {
  isLink.value = true;
}
function unsetIsLink() {
  isLink.value = false;
}

async function getFile() {
  try {
    const db = nuxtApp.$firestore;
    const docRef = nuxtApp.$fireDoc(db, "links", route.params.tokenfile);
    const docSnap = await nuxtApp.$fireGetDoc(docRef);

    if (docSnap.exists()) {
      file.value = docSnap.data();
      if (file.value !== null) {
        if (file.value.filetype !== route.params.filetype + "/") {
          showError({ statusCode: 404, statusMessage: "File Not Found" });
        } else {
          type.value = "token";
          setHasFile();
          setIsToken();
        }
      } else showError({ statusCode: 404, statusMessage: "File Not Found" });
    } else {
      // docSnap.data() will be undefined in this case
      // showError({ statusCode: 404, statusMessage: "File Not Found" });
      const q = nuxtApp.$fireQuery(
        nuxtApp.$fireCollection(db, "links"),
        nuxtApp.$fireWhere("link", "==", route.params.tokenfile),
        nuxtApp.$fireWhere("filetype", "==", route.params.filetype + "/")
      );
      const querySnapshot = await nuxtApp.$fireGetDocs(q);
      await querySnapshot.forEach((doc) => {
        file.value = doc.data();
      });
      if (file.value !== null) {
        type.value = "link";
        setHasFile();
        setIsLink();
      } else {
        showError({ statusCode: 404, statusMessage: "File Not Found" });
      }
    }
  } catch (error) {
    showError({ statusCode: 404, statusMessage: "Something bad happened" });
  }
}
onMounted(async () => {
  // document.addEventListener("click", handleClicked);
  await getFile();
  setUpDate(file.value.uploaded_at);

  const parent = document.getElementById("parent");
  const parentPetit = document.getElementById("parentPetit");
  const contextmenu = document.getElementById("contextmenu");
  document.addEventListener("click", (event) => {
    if (event.target !== parent && !parent.contains(event.target)) {
      more.value = false;
    }
    if (event.target !== parentPetit && !parentPetit.contains(event.target)) {
      morePetit.value = false;
    }

    if (event.target !== contextmenu && !contextmenu.contains(event.target)) {
      moreContextmenu.value = false;
    }
  });
});
</script>
<template>
  <div>
    <div
      v-show="renaming"
      class="fixed z-20 text-white w-full h-full top-0 left-0 bg-black bg-black/75 cursor-default"
    >
      <div class="mx-auto lg:w-2/6 md:w-2/3 min-h-screen px-6 relative top-80">
        <div>
          <div
            class="border border-gray-500 px-8 pt-8 pb-4 bg-main rounded-lg flex flex-col space-y-5"
          >
            <input
              id="myInput"
              @keydown.enter="updateName(newname)"
              autofocus
              type="text"
              v-model="newname"
              class="bg-gray-900 px-4 py-2 rounded-lg border border-gray-600"
            />
            <div class="flex items-center space-x-5 justify-end">
              <button
                @click="
                  renaming = false;
                  untoggleOverflow();
                "
                class="b-file-cancel-button text-white flex space-x-2 items-center hover:bg-gray-900 rounded px-6 py-1.5"
              >
                <span
                  class="inline sm:text-sm text-xs font-semibold break-words"
                  >Cancel</span
                >
              </button>
              <button
                @click="updateName(newname)"
                class="b-file-delete-button text-white flex space-x-2 items-center bg-blue-500 hover:bg-blue-600 rounded px-6 py-1.5"
              >
                <span
                  class="inline sm:text-sm text-xs font-semibold break-words"
                  >Rename</span
                >
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <PartsPreview v-if="previewed" />
    <!-- <div
      v-show="wantFile"
      class="fixed top-0 left-0 bg-black/90 z-10 w-full h-full"
    >
      <div @click.prevent="nofiling" class="absolute w-full h-full"></div>
      <div>
        <button
          @click.prevent="nofiling"
          class="b-file-back-button text-white flex space-x-2 w-fit items-center border border-gray-500 rounded-lg px-4 py-2 relative left-6 top-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="w-5 h-5"
          >
            <path
              fill-rule="evenodd"
              d="M9.53 2.47a.75.75 0 010 1.06L4.81 8.25H15a6.75 6.75 0 010 13.5h-3a.75.75 0 010-1.5h3a5.25 5.25 0 100-10.5H4.81l4.72 4.72a.75.75 0 11-1.06 1.06l-6-6a.75.75 0 010-1.06l6-6a.75.75 0 011.06 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="inline text-xs font-semibold break-words">Get Back</span>
        </button>
        <PartsLoadFile class="flex justify-center items-center min-h-screen" />
      </div>
    </div> -->
    <PartsNotification v-show="setNotif" :message="notifMessage" />
    <div
      v-show="!hasFile"
      role="status"
      class="text-center flex justify-center items-center min-h-screen"
    >
      <svg
        aria-hidden="true"
        class="w-14 h-14 text-gray-200 animate-spin dark:text-gray-600 fill-blue-100"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="hasFile" class="flex flex-col space-y-20">
      <div class="flex flex-col space-y-5">
        <div class="flex items-end justify-between border-gray-800">
          <button
            @click="filing"
            class="b-file-newfile-button text-white flex space-x-2 w-fit items-center hover:bg-gray-800 border border-gray-800 rounded-full px-4 py-2"
          >
            <svg
              class="h-5 w-5"
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
            <span class="inline text-xs font-semibold break-words"
              >New file</span
            >
          </button>

          <!-- <div
            class="flex flex-col items-center sm:space-x-3 space-y-2 text-white sm:hidden"
          >
            <span class="text-xs">ordered by:</span>
            <button
              class="b-file-order-button text-white flex space-x-2 w-fit items-center hover:bg-gray-800 rounded-full px-5 py-2"
            >
              <span class="inline text-xs font-semibold break-words"
                >Name (asc)
              </span>
            </button>
          </div> -->
        </div>
        <div class="sm:flex block sm:flex-col sm:space-y-3">
          <div class="sm:flex hidden text-gray-400 items-center text-xs">
            <div class="cursor-default py-0.5 flex-none w-1/4 px-3">
              <span>Name</span>
            </div>
            <div
              class="cursor-default py-0.5 w-1/3 border-l border-gray-800 px-3"
            >
              <span>Updated at</span>
            </div>
            <div
              class="cursor-default py-0.5 w-1/3 border-l border-gray-800 px-3"
            >
              <span>Type</span>
            </div>
            <div
              class="cursor-default py-0.5 w-1/3 border-l border-gray-800 px-3"
            >
              <span>Size</span>
            </div>
            <div
              class="cursor-default py-0.5 w-1/3 border-l border-gray-800 px-3"
            >
              <span>Expired at</span>
            </div>
          </div>
          <!-- -sm -->
          <PartsFileDropDown
            id="contextmenu"
            @action="action"
            v-show="moreContextmenu"
            :file="file"
            :type="type"
            :style="{ top: divTop + 'px', left: divLeft + 'px' }"
            class="absolute transition duration-150 ease-in-out bg-main target-element"
          />
          <div
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
            @touchcancel="handleTouchCancel"
            :class="{ 'hover:bg-gray-800': morePetit }"
            class="border-t border-gray-800 text-white sm:hidden flex flex-col space-y-1 text-xs hover:cursor-pointer py-2.5 pl-4 pr-3"
          >
            <div class="flex items-center justify-between">
              <div :title="file?.file_metadata.name" class="w-5/6">
                <div class="flex items-center space-x-2">
                  <div v-if="file?.filetype == 'pdfs/'">
                    <svg
                      class="w-4 h-4 text-red-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M4.5 11H4v1h.5a.5.5 0 0 0 0-1ZM7 5V.13a2.96 2.96 0 0 0-1.293.749L2.879 3.707A2.96 2.96 0 0 0 2.13 5H7Zm3.375 6H10v3h.375a.624.624 0 0 0 .625-.625v-1.75a.624.624 0 0 0-.625-.625Z"
                      />
                      <path
                        d="M19 7h-1V2a1.97 1.97 0 0 0-1.933-2H9v5a2 2 0 0 1-2 2H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1a1.969 1.969 0 0 0 1.933 2h12.134c1.1 0 1.7-1.236 1.856-1.614a.988.988 0 0 0 .07-.386H19a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM4.5 14H4v1a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1h1.5a2.5 2.5 0 1 1 0 5Zm8.5-.625A2.63 2.63 0 0 1 10.375 16H9a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1.375A2.63 2.63 0 0 1 13 11.625v1.75ZM17 12a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-1v1h1Z"
                      />
                    </svg>
                  </div>
                  <div v-if="file?.filetype == 'images/'">
                    <svg
                      class="w-4 h-4 text-blue-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 20 18"
                    >
                      <path
                        d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"
                      />
                    </svg>
                  </div>
                  <div v-if="file?.filetype == 'videos/'">
                    <svg
                      class="w-4 h-4 text-blue-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 16 20"
                    >
                      <path
                        d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"
                      />
                      <path
                        d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM9 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2Zm4 .382a1 1 0 0 1-1.447.894L10 13v-2l1.553-1.276a1 1 0 0 1 1.447.894v2.764Z"
                      />
                    </svg>
                  </div>
                  <div
                    class="whitespace-nowrap text-ellipsis overflow-hidden font-semibold"
                  >
                    <span>{{ file?.file_metadata.name }}</span>
                  </div>
                </div>
              </div>
              <div id="parentPetit" class="relative">
                <button
                  @click="handleClick"
                  class="rounded-full hover:bg-gray-700 p-1"
                >
                  <svg
                    class="text-white h-5 w-5 font-semibold"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                </button>
                <PartsFileDropDown
                  @action="action"
                  v-show="morePetit"
                  :file="file"
                  :type="type"
                  class="absolute transition duration-150 ease-in-out right-0 bg-main target-element"
                />
              </div>
            </div>
            <div class="flex items-center justify-between text-gray-400">
              <div
                :title="getHumanReadableDateTimeFromTimestamp(file?.created_at)"
                class="whitespace-nowrap text-ellipsis overflow-hidden text-xs"
              >
                <span>{{
                  getHumanReadableDateTimeFromTimestamp(file?.created_at)
                }}</span>
              </div>
              <div
                :title="formatFileSize(file?.file_metadata.size)"
                class="whitespace-nowrap text-ellipsis overflow-hidden"
              >
                <span>{{ formatFileSize(file?.file_metadata.size) }}</span>
              </div>
            </div>
            <div
              :title="getHumanReadableDateTimeFromTimestamp(file?.deadline)"
              class="flex items-center space-x-1 whitespace-nowrap text-ellipsis overflow-hidden text-gray-400"
            >
              <div class="whitespace-nowrap text-ellipsis overflow-hidden">
                <span
                  >Expire at
                  {{
                    getHumanReadableDateTimeFromTimestamp(file?.deadline)
                  }}</span
                >
              </div>
              <div v-show="isToken">
                <button
                  id="date-button-petit"
                  @click="openDatePetit"
                  class="rounded-full hover:bg-gray-700 p-1"
                >
                  <svg
                    class="text-white h-4 w-4"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    ></path>
                  </svg>
                </button>
                <input
                  @change="selectDatePetit"
                  type="date"
                  id="datePickerPetit"
                  class="rounded w-0 h-0 focus:outline-none bg-transparent border-transparent"
                />
              </div>
            </div>
          </div>
          <!-- +sm -->
          <div
            @contextmenu="handleClickContextmenu"
            @mouseover="hovered = true"
            @mouseleave="hovered = false"
            :class="{ 'bg-gray-800': more || moreContextmenu }"
            class="border-t border-gray-800 text-white sm:flex hidden relative text-xs font-semibold hover:bg-gray-800 hover:cursor-pointer py-2.5 items-center"
          >
            <div v-show="hovered || more" id="parent" class="absolute right-2">
              <button
                @click="handleClick"
                class="rounded-full hover:bg-gray-700 p-1 hover:bg-gray-700/75 target-element"
              >
                <svg
                  class="text-white h-5 w-5 font-bold"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </button>
              <PartsFileDropDown
                @action="action"
                v-show="more"
                :file="file"
                :type="type"
                class="absolute transition duration-150 ease-in-out right-0 bg-main target-element"
              />
            </div>
            <div :title="file?.file_metadata.name" class="flex-none w-1/4 px-1">
              <div class="flex items-center space-x-2">
                <div v-show="file?.filetype == 'pdfs/'">
                  <svg
                    class="w-4 h-4 text-red-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M4.5 11H4v1h.5a.5.5 0 0 0 0-1ZM7 5V.13a2.96 2.96 0 0 0-1.293.749L2.879 3.707A2.96 2.96 0 0 0 2.13 5H7Zm3.375 6H10v3h.375a.624.624 0 0 0 .625-.625v-1.75a.624.624 0 0 0-.625-.625Z"
                    />
                    <path
                      d="M19 7h-1V2a1.97 1.97 0 0 0-1.933-2H9v5a2 2 0 0 1-2 2H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1a1.969 1.969 0 0 0 1.933 2h12.134c1.1 0 1.7-1.236 1.856-1.614a.988.988 0 0 0 .07-.386H19a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM4.5 14H4v1a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1h1.5a2.5 2.5 0 1 1 0 5Zm8.5-.625A2.63 2.63 0 0 1 10.375 16H9a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h1.375A2.63 2.63 0 0 1 13 11.625v1.75ZM17 12a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-1v1h1Z"
                    />
                  </svg>
                </div>
                <div v-show="file?.filetype == 'images/'">
                  <svg
                    class="w-4 h-4 text-blue-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path
                      d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"
                    />
                  </svg>
                </div>
                <div v-show="file?.filetype == 'videos/'">
                  <svg
                    class="w-4 h-4 text-blue-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 16 20"
                  >
                    <path
                      d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.98 2.98 0 0 0 .13 5H5Z"
                    />
                    <path
                      d="M14.066 0H7v5a2 2 0 0 1-2 2H0v11a1.97 1.97 0 0 0 1.934 2h12.132A1.97 1.97 0 0 0 16 18V2a1.97 1.97 0 0 0-1.934-2ZM9 13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2Zm4 .382a1 1 0 0 1-1.447.894L10 13v-2l1.553-1.276a1 1 0 0 1 1.447.894v2.764Z"
                    />
                  </svg>
                </div>
                <div class="whitespace-nowrap text-ellipsis overflow-hidden">
                  <span>{{ file?.file_metadata.name }}</span>
                </div>
              </div>
            </div>
            <div
              :title="getHumanReadableDateTimeFromTimestamp(file?.created_at)"
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{
                getHumanReadableDateTimeFromTimestamp(file?.created_at)
              }}</span>
            </div>
            <div
              :title="
                getStringAfter(file?.file_metadata.type, '/').toUpperCase()
              "
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{
                getStringAfter(file?.file_metadata.type, "/").toUpperCase()
              }}</span>
            </div>
            <div
              :title="formatFileSize(file?.file_metadata.size)"
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{ formatFileSize(file?.file_metadata.size) }}</span>
            </div>
            <div
              :title="getHumanReadableDateTimeFromTimestamp(file?.deadline)"
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <div
                class="w-3/4 whitespace-nowrap text-ellipsis overflow-hidden"
              >
                <div class="flex items-center space-x-2">
                  <div class="whitespace-nowrap text-ellipsis overflow-hidden">
                    <span>{{
                      getHumanReadableDateTimeFromTimestamp(file?.deadline)
                    }}</span>
                  </div>
                  <div v-show="isToken">
                    <button
                      id="date-button"
                      @click="openDate"
                      class="rounded-full hover:text-white hover:bg-gray-700 p-1"
                    >
                      <svg
                        class="text-white h-4 w-4"
                        aria-hidden="true"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                    </button>

                    <input
                      @change="selectDate"
                      type="date"
                      id="datePicker"
                      class="rounded w-0 h-0 focus:outline-none bg-transparent border-none border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="lg:w-2/4 md:5/6 w-full mx-auto">
        <div class="text-white flex flex-col space-y-10">
          <div class="flex flex-col space-y-3">
            <span class="font-semibold text-xs text-gray-400 text-center"
              >This is a link to the file, dont forget to save it, share it or
              embed it in a html tag.</span
            >
            <div class="relative">
              <div
                class="border relative border-gray-800 rounded-lg p-5 overflow-x-scroll text-sm whitespace-nowrap"
              >
                <span class="text-gray-300">{{ file.filelocation }}</span>
              </div>
              <button
                @focusout="copiedP = false"
                @click="copyToClipboard(file.filelocation, 'P')"
                class="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-gray-900 focus:bg-gray-900 focus:ring"
              >
                <svg
                  v-show="copiedP"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
                  />
                </svg>

                <svg
                  v-show="!copiedP"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div v-show="isToken" class="flex flex-col space-y-3">
            <span class="font-semibold text-xs text-gray-400 text-center"
              >Here is your PRIVATE link to edit the expiration date. Be
              careful, whoever got this link can edit the expiration date and
              delete the file.</span
            >
            <div class="relative">
              <div
                class="border relative border-gray-800 rounded-lg p-5 overflow-x-scroll whitespace-nowrap text-sm"
              >
                <span class="text-gray-300">{{
                  getlinkOr() + getlinkMid() + getlinkPr()
                }}</span>
              </div>
              <button
                @focusout="copiedT = false"
                @click="
                  copyToClipboard(getlinkOr() + getlinkMid() + getlinkPr(), 'T')
                "
                class="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-gray-900 focus:bg-gray-900 focus:ring"
              >
                <svg
                  v-show="copiedT"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
                  />
                </svg>

                <svg
                  v-show="!copiedT"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div v-show="isToken" class="flex flex-col space-y-3">
            <span class="font-semibold text-xs text-gray-400 text-center"
              >Here is another public link to the file. Whoever got this link
              can download the file.</span
            >
            <div class="relative">
              <div
                class="border relative border-gray-800 rounded-lg p-5 overflow-x-scroll text-sm whitespace-nowrap"
              >
                <span class="text-gray-300">{{
                  getlinkOr() + getlinkMid() + getlink()
                }}</span>
              </div>
              <button
                @focusout="copiedL = false"
                @click="
                  copyToClipboard(getlinkOr() + getlinkMid() + getlink(), 'L')
                "
                class="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-gray-900 focus:bg-gray-900 focus:ring"
              >
                <svg
                  v-show="copiedL"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
                  />
                </svg>

                <svg
                  v-show="!copiedL"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
