// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as fireref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

export default defineNuxtPlugin((nuxtApp) => {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyDtxGYCD4V6PByGaFbsicdzSG4YhSf9jtA",
    authDomain: "hyphip-8ca89.firebaseapp.com",
    projectId: "hyphip-8ca89",
    storageBucket: "hyphip-8ca89.appspot.com",
    messagingSenderId: "13213548874",
    appId: "1:13213548874:web:c0c9be597599e662b901b3",
    measurementId: "G-GF8G8HE79Z",
  };

  const app = initializeApp(firebaseConfig);
  nuxtApp.vueApp.provide("firebaseapp", app);
  nuxtApp.provide("firebaseapp", app);

  const analytics = getAnalytics(app);

  const auth = getAuth(app);
  nuxtApp.vueApp.provide("auth", auth);
  nuxtApp.provide("auth", auth);
  const firestore = getFirestore(app);
  nuxtApp.vueApp.provide("firestore", firestore);
  nuxtApp.provide("firestore", firestore);

  const firestorage = getStorage();
  nuxtApp.vueApp.provide("firestorage", firestorage);
  nuxtApp.provide("firestorage", firestorage);

  nuxtApp.vueApp.provide("fireref", fireref);
  nuxtApp.provide("fireref", fireref);

  nuxtApp.vueApp.provide("uploadBytesResumable", uploadBytesResumable);
  nuxtApp.provide("uploadBytesResumable", uploadBytesResumable);

  nuxtApp.vueApp.provide("getDownloadURL", getDownloadURL);
  nuxtApp.provide("getDownloadURL", getDownloadURL);

  nuxtApp.vueApp.provide("fireDoc", doc);
  nuxtApp.provide("fireDoc", doc);

  nuxtApp.vueApp.provide("fireSetDoc", setDoc);
  nuxtApp.provide("fireSetDoc", setDoc);

  nuxtApp.vueApp.provide("fireGetDoc", getDoc);
  nuxtApp.provide("fireGetDoc", getDoc);

  nuxtApp.vueApp.provide("fireQuery", query);
  nuxtApp.provide("fireQuery", query);

  nuxtApp.vueApp.provide("fireWhere", where);
  nuxtApp.provide("fireWhere", where);

  nuxtApp.vueApp.provide("fireCollection", collection);
  nuxtApp.provide("fireCollection", collection);

  nuxtApp.vueApp.provide("fireGetDocs", getDocs);
  nuxtApp.provide("fireGetDocs", getDocs);

  nuxtApp.vueApp.provide("fireUpdateDoc ", updateDoc);
  nuxtApp.provide("fireUpdateDoc", updateDoc);

  nuxtApp.vueApp.provide("fireDeleteDoc ", deleteDoc);
  nuxtApp.provide("fireDeleteDoc", deleteDoc);

  nuxtApp.vueApp.provide("fireDeleteFile ", deleteObject);
  nuxtApp.provide("fireDeleteFile", deleteObject);
});
