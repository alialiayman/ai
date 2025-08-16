// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1dztnPM0Iyh6ex9s48XmuXKFwrYAfk6U",
  authDomain: "gpt-at-work.firebaseapp.com",
  projectId: "gpt-at-work",
  storageBucket: "gpt-at-work.firebasestorage.app",
  messagingSenderId: "998836669018",
  appId: "1:998836669018:web:9834ee94a1d9a484f72663",
  measurementId: "G-V98DMR52J4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);