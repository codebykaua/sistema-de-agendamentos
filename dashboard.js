import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Elementos principais
const btnSair = document.getElementById("btnSair");
const totalAgendamentos = document.getElementById("totalAgendamentos");
const buscarAgendamento = document.getElementById("buscarAgendamento");
const filtroData = document.getElementById("filtroData");
const filtroStatus = document.getElementById("filtroStatus");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");
const listaAgendamentos = document.getElementById("listaAgendamentos");

// Formulário
const formAgendamento = document.getElementById("formAgendamento");
const pacienteInput = document.getElementById("paciente");
const medicoInput = document.getElementById("medico");
const servicoInput = document.getElementById("servico");
const dataInput = document.getElementById("data");
const horarioInput = document.getElementById("horario");
const statusInput = document.getElementById("status");
const observacaoInput = document.getElementById("observacao");
const mensagemDashboard = document.getElementById("mensagemDashboard");

// Lista local
let agendamentos = [];

// Proteger dashboard
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  carregarAgendamentos();
});

// Logout
btnSair.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro ao sair:", error);
    alert("Não foi possível sair. Tente novamente.");
  }
});

// Cadastrar agendamento
formAgendamento.addEventListener("submit", async (event) => {
  event.preventDefault();

  const paciente = pacienteInput.value.trim();
  const medico = medicoInput.value.trim();
  const servico = servicoInput.value.trim();
  const data = dataInput.value;
  const horario = horarioInput.value;
  const status = statusInput.value;
  const observacao = observacaoInput.value.trim();

  mensagemDashboard.textContent = "";

  if (!paciente || !medico || !servico || !data || !horario || !status) {
    mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
    return;
  }

  const medicoOcupado = agendamentos.some((agendamento) => {
    return (
      agendamento.medico.toLowerCase() === medico.toLowerCase() &&
      agendamento.data === data &&
      agendamento.horario === horario
    );
  });

  if (medicoOcupado) {
    mostrarMensagem("Esse médico já possui agendamento nesse dia e horário.", "erro");
    return;
  }

  try {
    await addDoc(collection(db, "agendamentos"), {
      paciente,
      medico,
      servico,
      data,
      horario,
      status,
      observacao,
      criadoEm: serverTimestamp()
    });

    formAgendamento.reset();
    mostrarMensagem("Agendamento cadastrado com sucesso.", "sucesso");

    await carregarAgendamentos();
  } catch (error) {
    console.error("Erro ao cadastrar agendamento:", error);
    mostrarMensagem("Erro ao cadastrar agendamento. Tente novamente.", "erro");
  }
});

// Carregar agendamentos do Firestore
async function carregarAgendamentos() {
  try {
    const q = query(
      collection(db, "agendamentos"),
      orderBy("data", "asc"),
      orderBy("horario", "asc")
    );

    const resultado = await getDocs(q);

    agendamentos = [];

    resultado.forEach((documento) => {
      agendamentos.push({
        id: documento.id,
        ...documento.data()
      });
    });

    renderizarAgendamentos();
  } catch (error) {
    console.error("Erro ao carregar agendamentos:", error);

    listaAgendamentos.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h3>Erro ao carregar agendamentos</h3>
        <p>Verifique sua conexão com o Firebase.</p>
      </div>
    `;
  }
}

// Renderizar agendamentos na tela
function renderizarAgendamentos() {
  const termoBusca = buscarAgendamento.value.trim().toLowerCase();
  const dataSelecionada = filtroData.value;
  const statusSelecionado = filtroStatus.value;

  let agendamentosFiltrados = agendamentos.filter((agendamento) => {
    const paciente = agendamento.paciente?.toLowerCase() || "";
    const medico = agendamento.medico?.toLowerCase() || "";
    const servico = agendamento.servico?.toLowerCase() || "";

    const combinaBusca =
      paciente.includes(termoBusca) ||
      medico.includes(termoBusca) ||
      servico.includes(termoBusca);

    const combinaData =
      !dataSelecionada || agendamento.data === dataSelecionada;

    const combinaStatus =
      !statusSelecionado || agendamento.status === statusSelecionado;

    return combinaBusca && combinaData && combinaStatus;
  });

  totalAgendamentos.textContent = `${agendamentosFiltrados.length} agendamento${
    agendamentosFiltrados.length !== 1 ? "s" : ""
  }`;

  if (agendamentosFiltrados.length === 0) {
    listaAgendamentos.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-calendar-check"></i>
        <h3>Nenhum agendamento encontrado</h3>
        <p>Cadastre um novo agendamento ou ajuste os filtros.</p>
      </div>
    `;
    return;
  }

  listaAgendamentos.innerHTML = "";

  agendamentosFiltrados.forEach((agendamento) => {
    const card = document.createElement("div");
    card.className = "appointment-card";

    card.innerHTML = `
      <div class="appointment-info">
        <h3>${agendamento.paciente}</h3>

        <p>
          <strong>Médico:</strong> ${agendamento.medico}
        </p>

        <p>
          <strong>Serviço:</strong> ${agendamento.servico}
        </p>

        <p>
          <strong>Data:</strong> ${formatarData(agendamento.data)}
          às ${agendamento.horario}
        </p>

        ${
          agendamento.observacao
            ? `<p><strong>Observação:</strong> ${agendamento.observacao}</p>`
            : ""
        }
      </div>

      <div class="appointment-actions">
        <span class="status-badge ${classeStatus(agendamento.status)}">
          ${agendamento.status}
        </span>

        <div class="card-buttons">
          <button
            type="button"
            class="btn-small btn-delete"
            title="Excluir agendamento"
            data-id="${agendamento.id}"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    listaAgendamentos.appendChild(card);
  });

  ativarBotoesExcluir();
}

// Excluir agendamento
function ativarBotoesExcluir() {
  const botoesExcluir = document.querySelectorAll(".btn-delete");

  botoesExcluir.forEach((botao) => {
    botao.addEventListener("click", async () => {
      const id = botao.getAttribute("data-id");

      const confirmar = confirm("Tem certeza que deseja excluir este agendamento?");

      if (!confirmar) {
        return;
      }

      try {
        await deleteDoc(doc(db, "agendamentos", id));
        await carregarAgendamentos();
      } catch (error) {
        console.error("Erro ao excluir agendamento:", error);
        alert("Não foi possível excluir o agendamento.");
      }
    });
  });
}

// Filtros
buscarAgendamento.addEventListener("input", renderizarAgendamentos);
filtroData.addEventListener("change", renderizarAgendamentos);
filtroStatus.addEventListener("change", renderizarAgendamentos);

btnLimparFiltros.addEventListener("click", () => {
  buscarAgendamento.value = "";
  filtroData.value = "";
  filtroStatus.value = "";
  renderizarAgendamentos();
});

// Mensagem do formulário
function mostrarMensagem(texto, tipo) {
  mensagemDashboard.textContent = texto;

  if (tipo === "erro") {
    mensagemDashboard.style.color = "#dc2626";
  } else {
    mensagemDashboard.style.color = "#1f9d63";
  }

  setTimeout(() => {
    mensagemDashboard.textContent = "";
  }, 3500);
}

// Formatar data
function formatarData(data) {
  if (!data) {
    return "";
  }

  const partes = data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Classe do status
function classeStatus(status) {
  if (status === "Pendente") {
    return "status-pendente";
  }

  if (status === "Confirmado") {
    return "status-confirmado";
  }

  if (status === "Em atendimento") {
    return "status-em-atendimento";
  }

  if (status === "Finalizado") {
    return "status-finalizado";
  }

  if (status === "Cancelado") {
    return "status-cancelado";
  }

  return "status-pendente";
}