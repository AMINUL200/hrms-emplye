// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-nWAqKSHw5YqQ8006pKLbAQqD4rQupII",
  authDomain: "hrms-employee-77d02.firebaseapp.com",
  projectId: "hrms-employee-77d02",
  storageBucket: "hrms-employee-77d02.firebasestorage.app",
  messagingSenderId: "710768709387",
  appId: "1:710768709387:web:fc22aea836456750cc5c0e",
  measurementId: "G-QK0DXTFTWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);