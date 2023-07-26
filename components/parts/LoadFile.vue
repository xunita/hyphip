<template>
  <div
    class="my-32 lg:mx-64 md:mx-24 mx-8 flex flex-col space-y-16 items-center"
  >
    <div
      class="text-white border border-gray-900 rounded-lg lg:px-20 md:px-16 px-8 py-6 flex flex-col justify-items-center items-center space-y-3.5"
    >
      <h1 class="font-bold text-2xl">Link your file</h1>
      <span class="inline text-center break-words text-sm"
        >Manage your files by linking them. HYPHIP help you save, edit, preview
        your files. It's then easy for you to access your files anytime and
        anywhere you want.
      </span>

      <div class="file-load-button">
        <button
          class="b-file-load-button text-white flex space-x-2 items-center hover:bg-gray-900 rounded-full px-4 py-1.5"
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
        </button>
      </div>
      <span class="inline text-center break-words text-xs"
        >You can also drop your file here
      </span>
      <span class="inline text-center break-words text-xs text-red-500">Error area </span>
    </div>
    <div
      class="flex md:flex-row flex-col justify-center md:items-start items-center md:space-x-6 md:space-y-0 space-y-4"
    >
      <NuxtLink to="/#" class="color-login text-3xl font-bold"
        >Sign In</NuxtLink
      >
      <span class="text-white lg:w-3/7 md:w-3/5 w-3/4 text-center"
        >to manage your files by linking them. HYPHIP help you save, edit,
        preview your files. It's then easy for you to access your files anytime
        and anywhere you want.
      </span>
    </div>
    <div class="h-128"></div>
  </div>
</template>
