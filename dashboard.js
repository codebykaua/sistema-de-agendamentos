(function () {
  "use strict";

  const storage = window.ClinAgendaStorage;
  const STATUS_OPTIONS = [
    "Pendente",
    "Confirmado",
    "Em atendimento",
    "Finalizado",
    "Cancelado"
  ];

  if (!storage || !storage.initialize()) {
    alert("O navegador bloqueou o armazenamento local deste projeto.");
    window.location.replace("index.html");
    return;
  }

  const session = storage.getSession();

  if (!session) {
    window.location.replace("index.html");
    return;
  }

  const btnSair = document.getElementById("btnSair");
  const btnRestaurarDemo = document.getElementById("btnRestaurarDemo");
  const btnAbrirModal = document.getElementById("btnAbrirModal");
  const btnFecharModal = document.getElementById("btnFecharModal");
  const btnCancelarModal = document.getElementById("btnCancelarModal");
  const modalAgendamento = document.getElementById("modalAgendamento");
  const totalAgendamentos = document.getElementById("totalAgendamentos");
  const buscarAgendamento = document.getElementById("buscarAgendamento");
  const filtroData = document.getElementById("filtroData");
  const filtroStatus = document.getElementById("filtroStatus");
  const btnLimparFiltros = document.getElementById("btnLimparFiltros");
  const listaAgendamentos = document.getElementById("listaAgendamentos");

  const formAgendamento = document.getElementById("formAgendamento");
  const pacienteInput = document.getElementById("paciente");
  const medicoInput = document.getElementById("medico");
  const servicoInput = document.getElementById("servico");
  const dataInput = document.getElementById("data");
  const horarioInput = document.getElementById("horario");
  const statusInput = document.getElementById("status");
  const observacaoInput = document.getElementById("observacao");
  const mensagemDashboard = document.getElementById("mensagemDashboard");

  let agendamentos = [];

  dataInput.min = obterDataLocal();
  carregarAgendamentos();

  btnSair.addEventListener("click", () => {
    storage.logout();
    window.location.replace("index.html");
  });

  btnRestaurarDemo.addEventListener("click", () => {
    const confirmar = window.confirm(
      "Restaurar os dados iniciais? Os agendamentos cadastrados neste navegador serão substituídos."
    );

    if (!confirmar) {
      return;
    }

    agendamentos = storage.resetDemoData();
    renderizarAgendamentos();
    mostrarMensagem("Dados restaurados com sucesso.", "sucesso");
  });

  btnAbrirModal.addEventListener("click", abrirModal);
  btnFecharModal.addEventListener("click", fecharModal);
  btnCancelarModal.addEventListener("click", fecharModal);

  modalAgendamento.addEventListener("click", (event) => {
    if (event.target === modalAgendamento) {
      fecharModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modalAgendamento.classList.contains("is-open")) {
      fecharModal();
    }
  });

  formAgendamento.addEventListener("submit", (event) => {
    event.preventDefault();

    const novoAgendamento = {
      paciente: pacienteInput.value.trim(),
      medico: medicoInput.value.trim(),
      servico: servicoInput.value.trim(),
      data: dataInput.value,
      horario: horarioInput.value,
      status: statusInput.value,
      observacao: observacaoInput.value.trim()
    };

    if (
      !novoAgendamento.paciente ||
      !novoAgendamento.medico ||
      !novoAgendamento.servico ||
      !novoAgendamento.data ||
      !novoAgendamento.horario ||
      !novoAgendamento.status
    ) {
      mostrarMensagem("Preencha todos os campos obrigatórios.", "erro");
      return;
    }

    const medicoOcupado = agendamentos.some(
      (item) =>
        String(item.medico).toLowerCase() === novoAgendamento.medico.toLowerCase() &&
        item.data === novoAgendamento.data &&
        item.horario === novoAgendamento.horario
    );

    if (medicoOcupado) {
      mostrarMensagem("Esse médico já possui agendamento nesse dia e horário.", "erro");
      return;
    }

    storage.addAppointment(novoAgendamento);
    formAgendamento.reset();
    dataInput.min = obterDataLocal();
    statusInput.value = "Pendente";
    fecharModal();
    carregarAgendamentos();
    mostrarMensagem("Agendamento cadastrado com sucesso.", "sucesso");
  });

  buscarAgendamento.addEventListener("input", renderizarAgendamentos);
  filtroData.addEventListener("change", renderizarAgendamentos);
  filtroStatus.addEventListener("change", renderizarAgendamentos);

  btnLimparFiltros.addEventListener("click", () => {
    buscarAgendamento.value = "";
    filtroData.value = "";
    filtroStatus.value = "";
    renderizarAgendamentos();
  });

  function abrirModal() {
    formAgendamento.reset();
    dataInput.min = obterDataLocal();
    statusInput.value = "Pendente";
    modalAgendamento.classList.add("is-open");
    modalAgendamento.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    pacienteInput.focus();
  }

  function fecharModal() {
    modalAgendamento.classList.remove("is-open");
    modalAgendamento.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function carregarAgendamentos() {
    agendamentos = storage.getAppointments();
    renderizarAgendamentos();
  }

  function renderizarAgendamentos() {
    const termoBusca = buscarAgendamento.value.trim().toLowerCase();
    const dataSelecionada = filtroData.value;
    const statusSelecionado = filtroStatus.value;

    const filtrados = agendamentos.filter((agendamento) => {
      const paciente = String(agendamento.paciente || "").toLowerCase();
      const medico = String(agendamento.medico || "").toLowerCase();
      const servico = String(agendamento.servico || "").toLowerCase();

      const combinaBusca =
        paciente.includes(termoBusca) ||
        medico.includes(termoBusca) ||
        servico.includes(termoBusca);
      const combinaData = !dataSelecionada || agendamento.data === dataSelecionada;
      const combinaStatus = !statusSelecionado || agendamento.status === statusSelecionado;

      return combinaBusca && combinaData && combinaStatus;
    });

    totalAgendamentos.textContent = `${filtrados.length} agendamento${
      filtrados.length !== 1 ? "s" : ""
    }`;

    if (filtrados.length === 0) {
      listaAgendamentos.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-calendar-check"></i>
          <h3>Nenhum agendamento encontrado</h3>
          <p>Clique em “Cadastrar agendamento” ou ajuste os filtros.</p>
        </div>
      `;
      return;
    }

    listaAgendamentos.innerHTML = filtrados.map(criarCard).join("");

    listaAgendamentos.querySelectorAll(".btn-delete").forEach((botao) => {
      botao.addEventListener("click", () => excluirAgendamento(botao.dataset.id));
    });

    listaAgendamentos.querySelectorAll(".status-select-inline").forEach((select) => {
      select.addEventListener("change", () => atualizarStatus(select.dataset.id, select.value));
    });
  }

  function criarCard(agendamento) {
    const paciente = escaparHtml(agendamento.paciente);
    const medico = escaparHtml(agendamento.medico);
    const servico = escaparHtml(agendamento.servico);
    const observacao = escaparHtml(agendamento.observacao);
    const id = escaparHtml(agendamento.id);

    return `
      <article class="appointment-card">
        <div class="appointment-info">
          <h3>${paciente}</h3>
          <p><strong>Médico:</strong> ${medico}</p>
          <p><strong>Serviço:</strong> ${servico}</p>
          <p><strong>Data:</strong> ${formatarData(agendamento.data)} às ${escaparHtml(
            agendamento.horario
          )}</p>
          ${observacao ? `<p><strong>Observação:</strong> ${observacao}</p>` : ""}
        </div>

        <div class="appointment-actions">
          <div class="appointment-status-editor">
            <label for="status-${id}">Status</label>
            <select id="status-${id}" class="status-select-inline ${classeStatus(agendamento.status)}" data-id="${id}">
              ${renderizarOpcoesStatus(agendamento.status)}
            </select>
          </div>

          <div class="card-buttons">
            <button
              type="button"
              class="btn-small btn-delete"
              title="Excluir agendamento"
              aria-label="Excluir agendamento de ${paciente}"
              data-id="${id}"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderizarOpcoesStatus(statusAtual) {
    return STATUS_OPTIONS.map((status) => {
      const selected = status === statusAtual ? "selected" : "";
      return `<option value="${escaparHtml(status)}" ${selected}>${escaparHtml(status)}</option>`;
    }).join("");
  }

  function atualizarStatus(id, status) {
    const atualizado = storage.updateAppointmentStatus(id, status);

    if (!atualizado) {
      mostrarMensagem("Não foi possível atualizar o status.", "erro");
      carregarAgendamentos();
      return;
    }

    carregarAgendamentos();
    mostrarMensagem("Status atualizado com sucesso.", "sucesso");
  }

  function excluirAgendamento(id) {
    const confirmar = window.confirm("Tem certeza que deseja excluir este agendamento?");

    if (!confirmar) {
      return;
    }

    if (!storage.deleteAppointment(id)) {
      mostrarMensagem("Não foi possível localizar o agendamento.", "erro");
      return;
    }

    carregarAgendamentos();
    mostrarMensagem("Agendamento excluído.", "sucesso");
  }

  function mostrarMensagem(texto, tipo) {
    mensagemDashboard.textContent = texto;
    mensagemDashboard.dataset.tipo = tipo;

    window.clearTimeout(mostrarMensagem._timeoutId);
    mostrarMensagem._timeoutId = window.setTimeout(() => {
      mensagemDashboard.textContent = "";
      delete mensagemDashboard.dataset.tipo;
    }, 3500);
  }

  function formatarData(data) {
    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return "Data não informada";
    }

    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function classeStatus(status) {
    const classes = {
      Pendente: "status-pendente",
      Confirmado: "status-confirmado",
      "Em atendimento": "status-em-atendimento",
      Finalizado: "status-finalizado",
      Cancelado: "status-cancelado"
    };

    return classes[status] || "status-pendente";
  }

  function escaparHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function obterDataLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }
})();
