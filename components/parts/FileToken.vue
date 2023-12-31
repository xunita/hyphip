<script setup lang="ts">
const route = useRoute();
const nuxtApp = useNuxtApp();
const file = useState("file", () => null);
const isToken = useState("isToken", () => false);
const isLink = useState("isLink", () => false);
const hasFile = useState("hasFile", () => false);
function getFileLink(fileType) {
  let link;

  switch (fileType) {
    case "pdfs/":
      link = "/assets/svg/pdf icon.svg";
      break;
    case "images/":
      link = "/assets/svg/image svg.svg";
      break;
    case "videos/":
      link = "/assets/svg/video svg.svg";
      break;
    default:
      link = "";
      break;
  }

  return link;
}
function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + units[i];
}
function getStringAfter(str, search) {
  const index = str.indexOf(search);
  if (index === -1) {
    return ""; // Return an empty string if the search string is not found
  }
  const startIndex = index + search.length;
  return str.slice(startIndex);
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
  await getFile();
});
</script>
<template>
  <div>
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
    <div v-if="hasFile">
      <div class="flex flex-col space-y-5">
        <div class="flex items-end justify-between border-gray-800">
          <button
            class="b-file-newfile-button text-white flex space-x-2 w-fit items-center hover:bg-gray-800 rounded-full px-4 py-1.5"
          >
            <svg
              class="h-7 w-7"
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
            <span class="inline text-sm font-semibold break-words"
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
        <div class="flex flex-col space-y-3">
          <div class="text-gray-400 flex items-center text-xs">
            <div class="cursor-default py-0.5 flex-none w-1/5 px-3">
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
          <div
            class="border-t border-gray-800 text-white flex text-xs font-semibold hover:bg-gray-800 hover:cursor-pointer py-2.5 items-center"
          >
            <div :title="file.file_metadata.name" class="flex-none w-1/5 px-1">
              <div class="flex items-center space-x-2">
                <div v-show="file.filetype == 'pdfs/'">
                  <svg
                    class="w-5 h-5 text-red-500"
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
                <div v-show="file.filetype == 'images/'">
                  <svg
                    class="w-5 h-5 text-blue-500"
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
                <div v-show="file.filetype == 'videos/'">
                  <svg
                    class="w-5 h-5 text-blue-500"
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
                  <span>{{ file.file_metadata.name }}</span>
                </div>
              </div>
            </div>
            <div
              :title="getDateTimeFromTimestamp(file.created_at)"
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{ getDateTimeFromTimestamp(file.created_at) }}</span>
            </div>
            <div
              :title="
                getStringAfter(file.file_metadata.type, '/').toUpperCase()
              "
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{
                getStringAfter(file.file_metadata.type, "/").toUpperCase()
              }}</span>
            </div>
            <div
              :title="formatFileSize(file.file_metadata.size)"
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{ formatFileSize(file.file_metadata.size) }}</span>
            </div>
            <div
              :title="getDateTimeFromTimestamp(file.deadline)"
              class="w-1/3 px-3 whitespace-nowrap text-ellipsis overflow-hidden"
            >
              <span>{{ getDateTimeFromTimestamp(file.deadline) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
