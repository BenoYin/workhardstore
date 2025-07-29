import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAE6M1B9s2e-CqQQUc4x2nqxW5rYnBFTE4",
  authDomain: "zhixiang-site.firebaseapp.com",
  projectId: "zhixiang-site",
  storageBucket: "zhixiang-site.firebasestorage.app",
  messagingSenderId: "704113981755",
  appId: "1:704113981755:web:74ab8efdc7d0c158325f1e",
  measurementId: "G-VEJ4LSYDWV"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);