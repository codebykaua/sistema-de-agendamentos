(function () {
  "use strict";

  const storage = window.ClinAgendaStorage;
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const mensagemErro = document.getElementById("mensagemErro");
  const toggleSenha = document.getElementById("toggleSenha");

  if (!storage || !storage.initialize()) {
    mensagemErro.textContent =
      "O navegador bloqueou o armazenamento local. Libere o localStorage para testar o sistema.";
    loginForm.querySelector("button[type='submit']").disabled = true;
    return;
  }

  if (storage.getSession()) {
    window.location.replace("dashboard.html");
    return;
  }

  toggleSenha.addEventListener("click", () => {
    const hidden = senhaInput.type === "password";
    senhaInput.type = hidden ? "text" : "password";
    toggleSenha.innerHTML = hidden
      ? '<i class="fa-regular fa-eye"></i>'
      : '<i class="fa-regular fa-eye-slash"></i>';
  });

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    mensagemErro.textContent = "";

    if (!email || !senha) {
      mensagemErro.textContent = "Preencha e-mail e senha para continuar.";
      return;
    }

    const session = storage.login(email, senha);

    if (!session) {
      mensagemErro.textContent = "E-mail ou senha inválidos.";
      return;
    }

    window.location.assign("dashboard.html");
  });
})();
