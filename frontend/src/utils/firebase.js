import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyBczo_vFanCiWRSFe6mhfv3upPPfarxQuc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN || "notesprint-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID || "notesprint-132f9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGEBUCKET || "notesprint-132f9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID || "1057795456435",
  appId: import.meta.env.VITE_FIREBASE_APPID || "1:1057795456435:web:7be78a14081c91e5521fc6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: "select_account",
});

export { auth, provider };