(function () {
  "use strict";

  const KEYS = Object.freeze({
    users: "clinagenda_demo_users_v1",
    session: "clinagenda_demo_session_v1",
    appointments: "clinagenda_demo_appointments_v1"
  });

  const DEMO_USER = Object.freeze({
    id: "user-demo-admin",
    name: "Administrador",
    clinic: "Clínica Vida+",
    role: "Administrador",
    email: "admin@clinagenda.com.br",
    password: "ClinAgenda@2026"
  });

  function storageAvailable() {
    try {
      const testKey = "__clinagenda_storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  function read(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.error(`Falha ao ler ${key} do localStorage:`, error);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Falha ao salvar ${key} no localStorage:`, error);
      return false;
    }
  }

  function localDate(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function seedAppointments() {
    return [
      {
        id: "appointment-demo-1",
        paciente: "Mariana Alves",
        medico: "Dra. Helena Costa",
        servico: "Consulta de rotina",
        data: localDate(1),
        horario: "09:00",
        status: "Confirmado",
        observacao: "Levar exames anteriores.",
        criadoEm: new Date().toISOString()
      },
      {
        id: "appointment-demo-2",
        paciente: "João Henrique",
        medico: "Dr. Rafael Lima",
        servico: "Avaliação cardiológica",
        data: localDate(1),
        horario: "14:30",
        status: "Pendente",
        observacao: "Primeira consulta.",
        criadoEm: new Date().toISOString()
      },
      {
        id: "appointment-demo-3",
        paciente: "Carla Santos",
        medico: "Dra. Helena Costa",
        servico: "Retorno clínico",
        data: localDate(2),
        horario: "10:15",
        status: "Em atendimento",
        observacao: "",
        criadoEm: new Date().toISOString()
      },
      {
        id: "appointment-demo-4",
        paciente: "Pedro Oliveira",
        medico: "Dr. Rafael Lima",
        servico: "Consulta de acompanhamento",
        data: localDate(3),
        horario: "16:00",
        status: "Finalizado",
        observacao: "Atendimento agendado.",
        criadoEm: new Date().toISOString()
      }
    ];
  }

  function initialize() {
    if (!storageAvailable()) {
      return false;
    }

    if (!window.localStorage.getItem(KEYS.users)) {
      write(KEYS.users, [DEMO_USER]);
    }

    if (!window.localStorage.getItem(KEYS.appointments)) {
      write(KEYS.appointments, seedAppointments());
    }

    return true;
  }

  function login(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedPassword = String(password || "");
    const users = read(KEYS.users, []);

    const user = users.find(
      (item) =>
        String(item.email || "").toLowerCase() === normalizedEmail &&
        item.password === normalizedPassword
    );

    if (!user) {
      return null;
    }

    const session = {
      token: createId("session"),
      userId: user.id,
      name: user.name,
      clinic: user.clinic,
      role: user.role,
      email: user.email,
      loggedAt: new Date().toISOString()
    };

    write(KEYS.session, session);
    return session;
  }

  function getSession() {
    const session = read(KEYS.session, null);
    if (!session || !session.userId || !session.token) {
      return null;
    }

    return session;
  }

  function logout() {
    window.localStorage.removeItem(KEYS.session);
  }

  function getAppointments() {
    const appointments = read(KEYS.appointments, []);

    return [...appointments].sort((a, b) => {
      const dateA = `${a.data || ""} ${a.horario || ""}`;
      const dateB = `${b.data || ""} ${b.horario || ""}`;
      return dateA.localeCompare(dateB);
    });
  }

  function addAppointment(data) {
    const appointments = read(KEYS.appointments, []);
    const appointment = {
      id: createId("appointment"),
      paciente: String(data.paciente || "").trim(),
      medico: String(data.medico || "").trim(),
      servico: String(data.servico || "").trim(),
      data: String(data.data || ""),
      horario: String(data.horario || ""),
      status: String(data.status || "Pendente"),
      observacao: String(data.observacao || "").trim(),
      criadoEm: new Date().toISOString()
    };

    appointments.push(appointment);
    write(KEYS.appointments, appointments);
    return appointment;
  }

  function updateAppointment(id, updates) {
    const appointments = read(KEYS.appointments, []);
    const index = appointments.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    appointments[index] = {
      ...appointments[index],
      ...updates,
      atualizadoEm: new Date().toISOString()
    };

    write(KEYS.appointments, appointments);
    return appointments[index];
  }

  function updateAppointmentStatus(id, status) {
    return updateAppointment(id, { status: String(status || "Pendente") });
  }

  function deleteAppointment(id) {
    const appointments = read(KEYS.appointments, []);
    const updated = appointments.filter((item) => item.id !== id);
    write(KEYS.appointments, updated);
    return updated.length !== appointments.length;
  }

  function resetDemoData() {
    write(KEYS.appointments, seedAppointments());
    return getAppointments();
  }

  window.ClinAgendaStorage = Object.freeze({
    initialize,
    storageAvailable,
    login,
    getSession,
    logout,
    getAppointments,
    addAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    resetDemoData,
    demoCredentials: Object.freeze({
      email: DEMO_USER.email,
      password: DEMO_USER.password
    })
  });
})();
