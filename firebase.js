// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyB6llxiR7Yq0W0Hpv8CiaKeANiMoYnD3AY",
  authDomain: "sistema-de-agendamento-baa9f.firebaseapp.com",
  projectId: "sistema-de-agendamento-baa9f",
  storageBucket: "sistema-de-agendamento-baa9f.firebasestorage.app",
  messagingSenderId: "409478777110",
  appId: "1:409478777110:web:4eb841cfeffdc06e526837",
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const db = getFirestore(app);


export { auth, db };