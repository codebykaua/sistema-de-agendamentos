import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const senhaInput = document.getElementById("senha");
const mensagemErro = document.getElementById("mensagemErro");
const toggleSenha = document.getElementById("toggleSenha");

// Se o usuário já estiver logado, manda direto para a dashboard
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

// Mostrar ou ocultar senha
toggleSenha.addEventListener("click", () => {
  const senhaEstaOculta = senhaInput.type === "password";

  if (senhaEstaOculta) {
    senhaInput.type = "text";
    toggleSenha.innerHTML = '<i class="fa-regular fa-eye"></i>';
  } else {
    senhaInput.type = "password";
    toggleSenha.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
  }
});

// Login com Firebase
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const senha = senhaInput.value.trim();

  mensagemErro.textContent = "";

  if (!email || !senha) {
    mensagemErro.textContent = "Preencha e-mail e senha para continuar.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, senha);

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Erro ao fazer login:", error);

    if (error.code === "auth/invalid-email") {
      mensagemErro.textContent = "Digite um e-mail válido.";
    } else if (error.code === "auth/user-not-found") {
      mensagemErro.textContent = "Usuário não encontrado.";
    } else if (error.code === "auth/wrong-password") {
      mensagemErro.textContent = "Senha incorreta.";
    } else if (error.code === "auth/invalid-credential") {
      mensagemErro.textContent = "E-mail ou senha inválidos.";
    } else {
      mensagemErro.textContent = "Não foi possível acessar. Tente novamente.";
    }
  }
});