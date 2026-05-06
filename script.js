import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* ====== PEGA TUS DATOS ====== */
const SUPABASE_URL = "https://rgtfiwqsmsfqadaroers.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndGZpd3FzbXNmcWFkYXJvZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTk0MjQsImV4cCI6MjA4NzE3NTQyNH0.dN3WKHOD6b029JVc58TIq7pRxDiezHrIr5x0oo3S-gQ";
/* ============================ */

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Admin demo */
const ADMIN_EMAIL = "ElizabethRojas@KarolWojtyla.edu.pe";
const ADMIN_PASS = "Admin123";

/* Año escolar para Tutoría/Asignación */
const SCHOOL_YEAR = 2026;

/* Grados */
const GRADOS = [
  "3 Años - Inicial",
  "4 Años - Inicial",
  "5 Años - Inicial",
  "1ro Primaria",
  "2do Primaria",
  "3ro Primaria",
  "4to Primaria",
  "5to Primaria",
  "6to Primaria",
  "1ro Secundaria",
  "2do Secundaria",
  "3ro Secundaria",
  "4to Secundaria",
  "5to Secundaria",
];

/* Niveles */
const NIVELES = ["", "AD", "A", "B", "C"];

/* Competencias por curso */
const COMP = {
  "COMPETENCIAS TRANSVERSALES": [
    "Se desenvuelve en entornos virtuales generados por las TIC",
    "Gestiona su aprendizaje de manera autónoma",
  ],
  "PERSONAL SOCIAL": [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
    "Construye su identidad, como persona humana, amada por Dios...",
  ],
  PSICOMOTRIZ: ["Se desenvuelve de manera autónoma a través de su motricidad"],
  COMUNICACIÓN: [
    "Se comunica oralmente en su lengua materna",
    "Lee diversos tipos de textos escritos en su lengua materna",
    "Escribe diversos tipos de textos en su lengua materna",
  ],
  "ARTE Y CULTURA": [
    "Aprecia de manera crítica manifestaciones artístico-culturales",
    "Crea proyectos desde los lenguajes artísticos",
  ],
  INGLÉS: [
    "Se comunica oralmente en inglés como lengua extranjera",
    "Lee diversos tipos de textos escritos en inglés como lengua extranjera",
    "Escribe diversos tipos de textos en inglés como lengua extranjera",
  ],
  MATEMÁTICA: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de regularidad, equivalencia y cambio",
    "Resuelve problemas de forma, movimiento y localización",
    "Resuelve problemas de gestión de datos e incertidumbre",
  ],
  "CIENCIA Y TECNOLOGÍA": [
    "Indaga mediante métodos científicos para construir sus conocimientos",
    "Explica el mundo físico basándose en conocimientos...",
    "Diseña y construye soluciones tecnológicas...",
  ],
  "EDUCACIÓN RELIGIOSA": [
    "Construye su identidad como persona humana, amada por Dios...",
    "Asume la experiencia del encuentro personal y comunitario con Dios...",
  ],
  "EDUCACIÓN FÍSICA": [
    "Se desenvuelve de manera autónoma a través de su motricidad",
    "Asume una vida saludable",
    "Interactúa a través de sus habilidades sociomotrices",
  ],
  "CIENCIAS SOCIALES": [
    "Construye interpretaciones históricas",
    "Gestiona responsablemente el espacio y el ambiente",
    "Gestiona responsablemente los recursos económicos",
  ],
  DPCC: [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
  ],
  EPT: ["Gestiona proyectos de emprendimiento económico o social"],
};

/* Cursos por nivel */
function cursosPorGrado(grado) {
  if ((grado || "").includes("Inicial")) {
    return [
      "PERSONAL SOCIAL",
      "PSICOMOTRIZ",
      "COMUNICACIÓN",
      "MATEMÁTICA",
      "CIENCIA Y TECNOLOGÍA",
      "EDUCACIÓN RELIGIOSA",
      "COMPETENCIAS TRANSVERSALES",
    ];
  }
  if ((grado || "").includes("Primaria")) {
    return [
      "COMUNICACIÓN",
      "MATEMÁTICA",
      "CIENCIA Y TECNOLOGÍA",
      "CIENCIAS SOCIALES",
      "ARTE Y CULTURA",
      "INGLÉS",
      "EDUCACIÓN FÍSICA",
      "EDUCACIÓN RELIGIOSA",
      "COMPETENCIAS TRANSVERSALES",
    ];
  }
  return [
    "COMUNICACIÓN",
    "MATEMÁTICA",
    "CIENCIA Y TECNOLOGÍA",
    "CIENCIAS SOCIALES",
    "DPCC",
    "EPT",
    "ARTE Y CULTURA",
    "INGLÉS",
    "EDUCACIÓN FÍSICA",
    "EDUCACIÓN RELIGIOSA",
    "COMPETENCIAS TRANSVERSALES",
  ];
}

function normalizeCourse(c) {
  const u = (c || "").toUpperCase();
  if (u.includes("TRANSVERS")) return "COMPETENCIAS TRANSVERSALES";
  if (u.includes("MATEM")) return "MATEMÁTICA";
  if (u.includes("CIENCIA")) return "CIENCIA Y TECNOLOGÍA";
  if (u.includes("COMUNIC")) return "COMUNICACIÓN";
  if (u.includes("ARTE")) return "ARTE Y CULTURA";
  if (u.includes("INGL")) return "INGLÉS";
  if (u.includes("RELIG")) return "EDUCACIÓN RELIGIOSA";
  if (u.includes("FÍSICA") || u.includes("FISICA")) return "EDUCACIÓN FÍSICA";
  if (u.includes("SOCIALES")) return "CIENCIAS SOCIALES";
  if (u.includes("DPCC")) return "DPCC";
  if (u.includes("EPT") || u.includes("TRABAJO")) return "EPT";
  return c;
}

/* Estado */
let sessionUser = null;
let lastLoadAt = 0;
let loadPromise = null;
const LOAD_CACHE_MS = 30000;

let state = {
  students: [],
  teachers: [],
  marks: [],
  compDesc: [],

  config: { locked: false, bimestre: "I BIMESTRE" },
  grade: "3 Años - Inicial",
  tab: "dashboard",
  teacherCourse: null,

  /* Tutoría + Asistencia */
  homeroomTutors: [],
  tutorReports: [],
  attendance: [],
};

/* Clock */
let clockTimer = null;
function startClock() {
  stopClock();
  const set = () => {
    const d = new Date();
    const dateText = d.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
    const timeText = d.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const elD = document.getElementById("clock-date");
    const elT = document.getElementById("clock-time");
    if (elD) elD.textContent = dateText;
    if (elT) elT.textContent = timeText;
  };
  set();
  clockTimer = setInterval(set, 1000);
}
function stopClock() {
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = null;
}

/* DOM helpers */
const $ = (id) => document.getElementById(id);
const show = (id) => $(id)?.classList.remove("hidden");
const hide = (id) => $(id)?.classList.add("hidden");

function toast(msg, type = "ok") {
  const t = $("toast");
  const box = $("toastBox");
  if (!t || !box) return;

  box.className =
    "px-5 py-3 rounded-2xl shadow-2xl font-black tracking-widest uppercase text-xs " +
    (type === "err" ? "bg-rose-600 text-white" : "bg-slate-900 text-white");
  box.textContent = msg;

  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 2600);
}

/* Vistas */
function setView(name) {
  const vLogin = $("view-login");
  const vApp = $("view-app");

  if (name === "login") {
    vLogin?.classList.add("active");
    vLogin?.classList.remove("hidden");
    vApp?.classList.remove("active");
    vApp?.classList.add("hidden");
  } else {
    vApp?.classList.add("active");
    vApp?.classList.remove("hidden");
    vLogin?.classList.remove("active");
    vLogin?.classList.add("hidden");
  }
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeMarkId(studentId, grade, course, bimestre, compIdx) {
  return `${studentId}__${grade}__${course}__${bimestre}__C${compIdx}`;
}

/* ===== Tutor helpers ===== */
function getTutorRow(grade) {
  return (state.homeroomTutors || []).find(
    (t) => (t.grade || "") === grade && Number(t.year) === Number(SCHOOL_YEAR)
  );
}
function getTutorNameForGrade(grade) {
  const row = getTutorRow(grade);
  if (!row) return "—";

  if (row.teacher_email) {
    const u = (state.teachers || []).find(
      (x) =>
        (x.email || "").toLowerCase() ===
        (row.teacher_email || "").toLowerCase()
    );
    return u?.name || row.teacher_email;
  }
  if (row.teacher_id) {
    const u = (state.teachers || []).find(
      (x) => String(x.id) === String(row.teacher_id)
    );
    return u?.name || "—";
  }
  return "—";
}
function isTutorOfGrade(userEmail, grade) {
  const row = getTutorRow(grade);
  if (!row) return false;

  if (row.teacher_email) {
    return (row.teacher_email || "").toLowerCase() ===
      (userEmail || "").toLowerCase();
  }
  const u = (state.teachers || []).find(
    (x) => (x.email || "").toLowerCase() === (userEmail || "").toLowerCase()
  );
  if (u && row.teacher_id) return String(u.id) === String(row.teacher_id);
  return false;
}

function getTutorReport(studentId, grade, bimestre) {
  return (
    (state.tutorReports || []).find(
      (r) =>
        String(r.student_id) === String(studentId) &&
        (r.grade || "") === grade &&
        Number(r.year) === Number(SCHOOL_YEAR) &&
        (r.bimestre || "") === bimestre
    ) || null
  );
}

function getTutorField(studentId, grade, bimestre, field, defVal = "") {
  const r = getTutorReport(studentId, grade, bimestre);
  const v = r ? r[field] : null;
  return v === null || v === undefined ? defVal : v;
}

/* ===== Asistencia ===== */
function getAttendanceStatus(dateISO, grade, course, studentId) {
  const row = (state.attendance || []).find(
    (a) =>
      String(a.date) === String(dateISO) &&
      (a.grade || "") === grade &&
      normalizeCourse(a.course || "") === normalizeCourse(course || "") &&
      String(a.student_id) === String(studentId)
  );
  return row?.status || "P";
}

/* ===== Competency Desc helpers ===== */
function findCompDesc(studentId, grade, course, bimestre, compIndex) {
  const c1 = (course || "").trim();
  const c2 = normalizeCourse(c1);

  const row = (state.compDesc || []).find((d) => {
    const dc = (d.course || "").trim();
    return (
      String(d.student_id) === String(studentId) &&
      (d.grade || "") === grade &&
      (d.bimestre || "") === bimestre &&
      Number(d.comp_index) === Number(compIndex) &&
      (dc === c1 || normalizeCourse(dc) === c2)
    );
  });

  return row?.desc || "";
}

/* Cargar todo
   Mejora clave: antes el sistema podía quedarse eternamente en "Cargando sistema…"
   si Supabase no respondía, una tabla no existía o la red estaba lenta.
   Ahora cada consulta tiene timeout, fallback seguro y el login siempre se muestra. */
function withTimeout(promise, label, ms = 9000) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      console.warn(`[KW] Timeout cargando ${label}. Se continuará sin bloquear la app.`);
      resolve({ data: null, error: { message: `Timeout cargando ${label}` } });
    }, ms);
  });

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function safeQuery(label, query, fallback = []) {
  try {
    const res = await withTimeout(query, label);
    if (res?.error) {
      console.warn(`[KW] ${label}:`, res.error.message || res.error);
      return { data: fallback, error: res.error };
    }
    return { data: res?.data ?? fallback, error: null };
  } catch (err) {
    console.warn(`[KW] Error cargando ${label}:`, err?.message || err);
    return { data: fallback, error: err };
  }
}

async function loadAll(force = false) {
  const now = Date.now();
  if (!force && lastLoadAt && now - lastLoadAt < LOAD_CACHE_MS) return;
  if (!force && loadPromise) return loadPromise;

  loadPromise = (async () => {
  const [
    students,
    users,
    marks,
    settings,
    tutors,
    tutorReports,
    attendance,
    compd,
  ] = await Promise.all([
    safeQuery("students", sb.from("students").select("*").order("nombre", { ascending: true })),
    safeQuery("users", sb.from("users").select("*").order("name", { ascending: true })),
    safeQuery("marks", sb.from("marks").select("*")),
    safeQuery("settings", sb.from("settings").select("*").eq("key", "global").maybeSingle(), null),
    safeQuery("homeroom_tutors", sb.from("homeroom_tutors").select("*")),
    safeQuery("tutor_reports", sb.from("tutor_reports").select("*")),
    safeQuery("attendance", sb.from("attendance").select("*")),
    safeQuery("competency_desc", sb.from("competency_desc").select("*")),
  ]);

  state.students = students.data || [];
  state.teachers = users.data || [];
  state.marks = marks.data || [];

  if (settings.data) {
    state.config = { ...state.config, ...settings.data };
  } else {
    state.config = { ...state.config, locked: false, bimestre: state.config.bimestre || "I BIMESTRE" };
  }

  state.homeroomTutors = tutors.data || [];
  state.tutorReports = tutorReports.data || [];
  state.attendance = attendance.data || [];
  state.compDesc = compd.data || [];
  lastLoadAt = Date.now();
  })();

  try { await loadPromise; }
  finally { loadPromise = null; }
}

/* INIT */
function attachGlobalHandlersOnce() {
  if (window.__KW_HANDLERS_ATTACHED__) return;
  window.__KW_HANDLERS_ATTACHED__ = true;

  $("login-form")?.addEventListener("submit", handleLogin);
  $("logout-btn")?.addEventListener("click", () => {
    sessionUser = null;
    state.tab = "dashboard";
    state.teacherCourse = null;
    stopClock();
    toast("Sesión cerrada");
    setView("login");
  });
}

window.addEventListener("load", async () => {
  const loader = $("app-loader");
  clearTimeout(window.__KW_LOADER_FALLBACK__);

  // Mostramos el login primero para que Supabase lento/pausado no deje el sistema congelado.
  attachGlobalHandlersOnce();
  setView("login");
  loader?.classList.add("hidden");

  try {
    await loadAll(true);
  } catch (err) {
    console.warn("[KW] Modo seguro:", err?.message || err);
    toast("Sistema iniciado. Si faltan datos, revisa Supabase.", "err");
  }
});

/* LOGIN */
async function handleLogin(e) {
  e.preventDefault();
  hide("login-error");

  await loadAll(false);

  const email = ($("email-input")?.value || "").trim().toLowerCase();
  const pass = ($("pass-input")?.value || "").trim();

  if (!email || !pass) {
    $("login-error").textContent = "Completa correo y contraseña.";
    show("login-error");
    return;
  }

  if (email === ADMIN_EMAIL.toLowerCase()) {
    if (pass !== ADMIN_PASS) {
      $("login-error").textContent = "Contraseña administrativa incorrecta.";
      show("login-error");
      return;
    }
    sessionUser = { role: "director", name: "Elizabeth Rojas", email };
    enterApp();
    return;
  }

  const t = state.teachers.find((x) => (x.email || "").toLowerCase() === email);
  if (!t) {
    $("login-error").textContent = "Este correo no está habilitado como docente.";
    show("login-error");
    return;
  }
  if (pass !== "1234") {
    $("login-error").textContent = "Contraseña demo incorrecta (use 1234).";
    show("login-error");
    return;
  }

  sessionUser = {
    role: "teacher",
    name: t.name,
    email: t.email,
    assignments: Array.isArray(t.assignments) ? t.assignments : [],
  };

  enterApp();
}

function enterApp() {
  $("user-name").textContent = sessionUser.name;
  $("user-role").textContent =
    sessionUser.role === "director" ? "DIRECTOR" : "PROFESOR";
  setView("app");
  startClock();
  toast("Acceso correcto");
  render();
}

/* ===== Actividad Reciente ===== */
function parseAt(x) {
  const v = x?.at || x?.updated_at || x?.created_at || x?.timestamp;
  const d = v ? new Date(v) : null;
  return d && !isNaN(d.getTime()) ? d : null;
}

function timeAgo(date) {
  if (!date) return "";
  const ms = Date.now() - date.getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d === 1 ? "" : "s"}`;
}

function buildActivityFeed(limit = 10) {
  const items = [];

  for (const st of state.students || []) {
    const dt = parseAt(st);
    items.push({
      at: dt,
      kind: "student",
      title: `Alumno registrado`,
      detail: `${st.nombre || "—"} — ${st.grado || ""}`,
    });
  }

  for (const u of state.teachers || []) {
    const dt = parseAt(u);
    items.push({
      at: dt,
      kind: "teacher",
      title: `Docente habilitado`,
      detail: `${u.name || "—"} — ${u.email || ""}`,
    });
  }

  for (const mk of state.marks || []) {
    const dt = parseAt(mk);
    items.push({
      at: dt,
      kind: "marks",
      title: `Notas actualizadas`,
      detail: `${normalizeCourse(mk.course || "")} — ${mk.grade || ""} — ${
        mk.bimestre || ""
      }`,
    });
  }

  for (const cd of state.compDesc || []) {
    const dt = parseAt(cd);
    items.push({
      at: dt,
      kind: "compdesc",
      title: `Conclusión por competencia`,
      detail: `${normalizeCourse(cd.course || "")} — ${cd.grade || ""} — ${
        cd.bimestre || ""
      } — C${Number(cd.comp_index) + 1}`,
    });
  }

  if (state.config) {
    const dt = parseAt(state.config);
    items.push({
      at: dt,
      kind: "config",
      title: `Configuración actualizada`,
      detail: `Bimestre: ${state.config.bimestre || "—"} • Bloqueo: ${
        state.config.locked ? "SÍ" : "NO"
      }`,
    });
  }

  return items
    .filter((x) => x.at)
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}

function activityIcon(kind) {
  if (kind === "student") return "👩‍🎓";
  if (kind === "teacher") return "👨‍🏫";
  if (kind === "marks") return "📝";
  if (kind === "compdesc") return "✍️";
  if (kind === "config") return "⚙️";
  return "•";
}

/* RENDER */
function tabBtn(key, label) {
  const active =
    state.tab === key
      ? "bg-slate-900 text-white"
      : "bg-white text-slate-900 border border-slate-200";
  return `<button class="no-print px-5 py-3 rounded-2xl font-black tracking-widest uppercase text-xs shadow-sm ${active}" data-tab="${key}">${label}</button>`;
}

function render() {
  const root = $("app-root");
  if (!root) return;

  const grade = state.grade;

  const topControls = `
    <div class="bg-white border border-slate-100 shadow-xl rounded-[2.5rem] p-5 lg:p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-black text-xs tracking-widest uppercase">
          Bimestre: ${escapeHtml(state.config.bimestre || "I BIMESTRE")}
        </span>
        <span class="px-4 py-2 rounded-full ${
          state.config.locked
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700"
        } font-black text-xs tracking-widest uppercase">
          Bloqueo: ${state.config.locked ? "ACTIVO" : "NO"}
        </span>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-slate-500 font-black text-xs tracking-widest uppercase">Grado</span>
        <select id="gradeSel" class="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
          ${GRADOS.map(
            (g) =>
              `<option ${
                g === grade ? "selected" : ""
              }>${escapeHtml(g)}</option>`
          ).join("")}
        </select>
      </div>
    </div>
  `;

  const teacherIsTutor =
    sessionUser.role === "teacher" &&
    isTutorOfGrade(sessionUser.email, state.grade);

  const tabs =
    sessionUser.role === "director"
      ? `
    <div class="flex flex-wrap gap-4 mb-2">
      ${tabBtn("dashboard", "Dashboard")}
      ${tabBtn("matricula", "Matrícula")}
      ${tabBtn("docentes", "Docentes")}
      ${tabBtn("libreta", "Libreta / PDF")}
      ${tabBtn("config", "Config")}
    </div>
  `
      : `
    <div class="flex flex-wrap gap-4 mb-2">
      ${tabBtn("dashboard", "Mis cursos")}
      ${tabBtn("notas", "Notas")}
      ${tabBtn("asistencia", "Asistencia")}
      ${teacherIsTutor ? tabBtn("tutoria", "Tutoría") : ""}
    </div>
  `;

  root.innerHTML = `
    ${tabs}
    ${topControls}
    <div class="mt-6">
      ${state.tab === "dashboard" ? renderDashboard() : ""}
      ${state.tab === "matricula" ? renderMatricula() : ""}
      ${state.tab === "docentes" ? renderDocentes() : ""}
      ${state.tab === "notas" ? renderNotas() : ""}
      ${state.tab === "asistencia" ? renderAsistencia() : ""}
      ${state.tab === "tutoria" ? renderTutoria() : ""}
      ${state.tab === "libreta" ? renderLibreta() : ""}
      ${state.tab === "config" ? renderConfig() : ""}
    </div>
  `;

  $("gradeSel")?.addEventListener("change", (ev) => {
    state.grade = ev.target.value;
    if (sessionUser.role !== "director") state.teacherCourse = null;
    render();
  });

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.getAttribute("data-tab");
      render();
    });
  });

  if (sessionUser?.role === "director" && state.tab === "libreta") {
    renderReport();
  }

  if (sessionUser?.role === "teacher" && state.tab === "asistencia") {
    setTimeout(() => {
      const dateISO = $("attDate")?.value;
      if (!dateISO || !state.teacherCourse) return;
      const alumnos = state.students.filter((s) => (s.grado || "") === state.grade);
      alumnos.forEach((st) => {
        const v = getAttendanceStatus(dateISO, state.grade, state.teacherCourse, st.id);
        const sel = $(`att_${st.id}`);
        if (sel) sel.value = v;
      });
    }, 0);
  }

  if (sessionUser?.role === "teacher" && state.tab === "tutoria") {
    setTimeout(() => {
      const sel = $("tutStudentSel");
      if (!sel) return;
      sel.dispatchEvent(new Event("change"));
    }, 0);
  }
}

/* DASHBOARD */
function renderDashboard() {
  const grade = state.grade;

  const alumnosGrado = state.students.filter((s) => (s.grado || "") === grade);
  const docentes = state.teachers.length;
  const cursos = cursosPorGrado(grade).length;

  const b = state.config.bimestre || "I BIMESTRE";
  const marksB = state.marks.filter(
    (m) => (m.grade || "") === grade && (m.bimestre || "") === b
  );
  const totalMarks = marksB.length;

  const feed = buildActivityFeed(10);

  if (sessionUser.role === "director") {
    return `
      <div class="space-y-6">
        <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p class="text-slate-500 font-black tracking-[0.35em] uppercase text-xs">Panel Directora</p>
              <h2 class="text-2xl font-black mt-2">Control y reportes</h2>
              <p class="text-slate-600 font-bold mt-2">
                Matrícula, docentes, libreta por alumno y exportación a PDF.
              </p>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${kpiCard("👩‍🎓","Alumnos (grado)", alumnosGrado.length, `Grado: ${escapeHtml(grade)}`)}
            ${kpiCard("👨‍🏫","Docentes", docentes, `Habilitados`)}
            ${kpiCard("📚","Cursos", cursos, `Según grado`)}
            ${kpiCard("📝","Registros de notas", totalMarks, `${escapeHtml(b)}`)}
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-slate-500 font-black tracking-[0.35em] uppercase text-xs">Sistema</p>
                <h3 class="text-xl font-black mt-2">Actividad reciente</h3>
              </div>
              <span class="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-black text-xs tracking-widest uppercase">
                Últimos 10
              </span>
            </div>

            <div class="mt-5 space-y-3">
              ${
                feed.length
                  ? feed
                      .map(
                        (x) => `
                    <div class="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <div class="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black">
                        ${activityIcon(x.kind)}
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center justify-between gap-3">
                          <p class="font-black">${escapeHtml(x.title)}</p>
                          <p class="text-slate-500 font-black text-xs tracking-widest uppercase">${escapeHtml(timeAgo(x.at))}</p>
                        </div>
                        <p class="text-slate-600 font-bold text-sm mt-1">${escapeHtml(x.detail)}</p>
                      </div>
                    </div>
                  `
                      )
                      .join("")
                  : `<p class="text-slate-500 font-bold">Aún no hay actividad registrada con fecha.</p>`
              }
            </div>
          </div>

          <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
            <p class="text-slate-500 font-black tracking-[0.35em] uppercase text-xs">Estado</p>
            <h3 class="text-xl font-black mt-2">Resumen rápido</h3>

            <div class="mt-5 space-y-3">
              ${statusPill(state.config.locked ? "🔒 Bloqueo ACTIVO" : "✅ Sistema ABIERTO", state.config.locked ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}
              ${statusPill(`📌 Bimestre: ${escapeHtml(b)}`, "bg-slate-100 text-slate-700")}
              ${statusPill(`🎓 Grado: ${escapeHtml(grade)}`, "bg-slate-100 text-slate-700")}
              ${statusPill(`🧾 Libretas listas para exportar`, "bg-slate-100 text-slate-700")}
            </div>

            <div class="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p class="text-slate-500 font-black text-xs tracking-widest uppercase">Tip</p>
              <p class="text-slate-700 font-bold text-sm mt-2">
                Usa “Actividad reciente” para verificar quién actualizó notas y cuándo.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const assigns = Array.isArray(sessionUser.assignments)
    ? sessionUser.assignments
    : [];
  const myMarks = (state.marks || [])
    .filter(
      (m) =>
        (m.updatedBy || "").toLowerCase() ===
        (sessionUser.email || "").toLowerCase()
    )
    .map((m) => ({
      at: parseAt(m),
      kind: "marks",
      title: "Notas actualizadas",
      detail: `${normalizeCourse(m.course || "")} — ${m.grade || ""} — ${m.bimestre || ""}`,
    }))
    .filter((x) => x.at)
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6);

  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <p class="text-slate-500 font-black tracking-[0.35em] uppercase text-xs">Mis cursos</p>
        <h2 class="text-2xl font-black mt-2">Selecciona un curso</h2>

        <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          ${
            assigns.length
              ? assigns
                  .map(
                    (a) => `
                <button class="no-print text-left rounded-2xl bg-slate-50 border border-slate-200 p-5 hover:bg-white hover:shadow-md transition"
                  data-pick-course="${escapeHtml(a.course)}" data-pick-grade="${escapeHtml(a.grade)}">
                  <div class="font-black text-lg">${escapeHtml(a.course)}</div>
                  <div class="text-slate-500 font-bold text-sm">${escapeHtml(a.grade || "")}</div>
                </button>
              `
                  )
                  .join("")
              : `<p class="text-slate-500 font-bold">No tienes cursos asignados todavía. Pide a la directora que te asigne (Docentes).</p>`
          }
        </div>
      </div>

      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <p class="text-slate-500 font-black tracking-[0.35em] uppercase text-xs">Mi actividad</p>
        <h3 class="text-xl font-black mt-2">Reciente</h3>

        <div class="mt-5 space-y-3">
          ${
            myMarks.length
              ? myMarks
                  .map(
                    (x) => `
                <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div class="flex items-center justify-between gap-3">
                    <p class="font-black">📝 ${escapeHtml(x.title)}</p>
                    <p class="text-slate-500 font-black text-xs tracking-widest uppercase">${escapeHtml(timeAgo(x.at))}</p>
                  </div>
                  <p class="text-slate-600 font-bold text-sm mt-1">${escapeHtml(x.detail)}</p>
                </div>
              `
                  )
                  .join("")
              : `<p class="text-slate-500 font-bold">Aún no tienes actividad registrada.</p>`
          }
        </div>
      </div>
    </div>
  `;
}

/* UI helpers */
function kpiCard(icon, label, value, sub) {
  return `
    <div class="rounded-2xl bg-slate-50 border border-slate-200 p-5">
      <div class="flex items-start justify-between">
        <div>
          <div class="text-slate-500 font-black text-xs tracking-widest uppercase">${escapeHtml(
            label
          )}</div>
          <div class="text-3xl font-black mt-2">${escapeHtml(value)}</div>
          <div class="text-slate-500 font-bold text-sm mt-1">${escapeHtml(
            sub
          )}</div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-xl font-black">
          ${icon}
        </div>
      </div>
    </div>
  `;
}
function statusPill(text, cls) {
  return `<div class="px-4 py-3 rounded-2xl ${cls} font-black text-xs tracking-widest uppercase">${text}</div>`;
}

/* MATRÍCULA */
function renderMatricula() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const list = state.students.filter((s) => (s.grado || "") === state.grade);
  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <h3 class="text-lg font-black">Registrar alumno</h3>
        <form id="addStudentForm" class="mt-4 space-y-3">
          <input id="stName" class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="Nombre completo" required />
          <button class="no-print w-full py-4 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">Registrar</button>
        </form>
      </div>

      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <h3 class="text-lg font-black">Lista de alumnos (${escapeHtml(state.grade)})</h3>
        <div class="mt-4 space-y-2">
          ${
            list.length
              ? list
                  .map(
                    (s) => `
                <div class="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <div><div class="font-black">${escapeHtml(s.nombre)}</div></div>
                  <button class="no-print px-4 py-2 rounded-xl bg-rose-600 text-white font-black text-xs tracking-widest uppercase"
                    data-del-st="${s.id}">Eliminar</button>
                </div>
              `
                  )
                  .join("")
              : `<p class="text-slate-500 font-bold">No hay alumnos en este grado.</p>`
          }
        </div>
      </div>
    </div>
  `;
}

/* DOCENTES */
function renderDocentes() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const gradeOptions = GRADOS.map(
    (g) => `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`
  ).join("");

  const teacherCards = (state.teachers.length ? state.teachers : [])
    .map((tch) => {
      const assigns = Array.isArray(tch.assignments) ? tch.assignments : [];

      return `
      <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-black">${escapeHtml(tch.name)}</div>
            <div class="text-slate-500 font-bold text-sm">${escapeHtml(tch.email)}</div>
          </div>

          <div class="flex gap-2">
            <button class="no-print px-3 py-2 rounded-xl bg-rose-600 text-white font-black text-xs tracking-widest uppercase"
              data-del-teacher="${tch.id}">Eliminar</button>
          </div>
        </div>

        <div class="mt-3">
          <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Asignaciones</div>

          <div class="mt-2 space-y-2">
            ${
              assigns.length
                ? assigns
                    .map(
                      (a, idx) => `
                <div class="flex items-center justify-between gap-2 rounded-xl bg-white border border-slate-200 p-3">
                  <div class="font-bold text-sm">
                    <span class="font-black">${escapeHtml(a.course || "")}</span>
                    <span class="text-slate-500">—</span>
                    <span>${escapeHtml(a.grade || "")}</span>
                  </div>
                  <button class="no-print px-3 py-2 rounded-xl bg-rose-600 text-white font-black text-xs tracking-widest uppercase"
                    data-del-assign="${tch.id}" data-assign-idx="${idx}">Quitar</button>
                </div>
              `
                    )
                    .join("")
                : `<p class="text-slate-500 font-bold text-sm">Sin asignaciones.</p>`
            }
          </div>

          <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <select class="w-full px-3 py-3 rounded-2xl bg-white border border-slate-200 font-black"
              id="asg_course_${tch.id}">
              ${cursosPorGrado(state.grade)
                .map(
                  (c) =>
                    `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
                )
                .join("")}
            </select>

            <select class="w-full px-3 py-3 rounded-2xl bg-white border border-slate-200 font-black"
              id="asg_grade_${tch.id}">
              ${gradeOptions}
            </select>

            <button class="no-print w-full px-4 py-3 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-lg"
              data-add-assign="${tch.id}">
              Agregar
            </button>
          </div>

          <p class="text-slate-500 font-bold text-xs italic mt-2">
            Tip: evita duplicados (mismo curso + mismo grado).
          </p>
        </div>
      </div>
    `;
    })
    .join("");

  const tutorNow = getTutorNameForGrade(state.grade);

  return `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">

        <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
          <h3 class="text-lg font-black">Tutor del aula</h3>
          <p class="text-slate-500 font-bold text-sm mt-1">
            Año: <b>${SCHOOL_YEAR}</b> — Grado: <b>${escapeHtml(state.grade)}</b>
          </p>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Tutor asignado</div>
              <div class="text-xl font-black mt-2">${escapeHtml(tutorNow)}</div>
            </div>

            <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Asignar / cambiar</div>

              <select id="tutorTeacherSel" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                <option value="">— Selecciona docente —</option>
                ${(state.teachers || [])
                  .map(
                    (tt) =>
                      `<option value="${tt.id}">${escapeHtml(tt.name)} (${escapeHtml(tt.email)})</option>`
                  )
                  .join("")}
              </select>

              <button id="saveTutorBtn" class="no-print mt-3 w-full px-4 py-3 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-lg">
                Guardar tutor
              </button>
            </div>
          </div>
        </div>

        <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
          <h3 class="text-lg font-black">Habilitar docente</h3>
          <form id="addTeacherForm" class="mt-4 space-y-3">
            <input id="tName" class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="Nombre completo" required />
            <input id="tEmail" type="email" class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="correo@wojtyla.edu.pe" required />
            <button class="no-print w-full py-4 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">Crear acceso</button>
            <p class="text-slate-500 font-bold text-xs italic text-center">Contraseña demo por defecto: <b>1234</b></p>
          </form>
        </div>
      </div>

      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <h3 class="text-lg font-black">Docentes</h3>
        <div class="mt-4 max-h-[450px] overflow-y-auto pr-2 space-y-2 border border-slate-200 rounded-2xl p-3">
          ${teacherCards || `<p class="text-slate-500 font-bold">Sin docentes.</p>`}
        </div>
      </div>
    </div>
  `;
}

/* NOTAS (conclusión por competencia) */
function renderNotas() {
  if (sessionUser.role === "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo docentes registran notas.</div>`;
  }

  if (!state.teacherCourse) {
    const assigns = Array.isArray(sessionUser.assignments)
      ? sessionUser.assignments
      : [];
    return `
      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <h3 class="text-lg font-black">Elige un curso</h3>
        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          ${assigns
            .map(
              (a) => `
            <button class="no-print text-left rounded-2xl bg-slate-50 border border-slate-200 p-5 hover:bg-white hover:shadow-md transition"
              data-pick-course="${escapeHtml(a.course)}" data-pick-grade="${escapeHtml(a.grade)}">
              <div class="font-black text-lg">${escapeHtml(a.course)}</div>
              <div class="text-slate-500 font-bold text-sm">${escapeHtml(a.grade || "")}</div>
            </button>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  const course = state.teacherCourse;
  const comps = COMP[course] || COMP[normalizeCourse(course)] || [];
  const alumnos = state.students.filter((s) => (s.grado || "") === state.grade);
  const bim = state.config.bimestre || "I BIMESTRE";

  return `
    <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-xl font-black">Notas - ${escapeHtml(course)}</h3>
          <p class="text-slate-500 font-bold text-sm">Grado: ${escapeHtml(state.grade)} | ${escapeHtml(bim)}</p>
          <p class="text-slate-500 font-bold text-xs mt-1">
            Ahora la <b>conclusión descriptiva</b> se guarda <b>por competencia</b> (se verá en la libreta).
          </p>
        </div>
        <button class="no-print px-5 py-3 rounded-2xl bg-slate-900 text-white font-black tracking-widest uppercase text-xs"
          id="backCourses">Cambiar curso</button>
      </div>

      <div class="mt-6 overflow-auto">
        <table class="w-full min-w-[1100px] border border-slate-200 rounded-2xl overflow-hidden">
          <thead class="bg-slate-50">
            <tr>
              <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Alumno</th>
              ${comps
                .map(
                  (_, i) =>
                    `<th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">C${i + 1}</th>`
                )
                .join("")}
              <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Guardar</th>
            </tr>
          </thead>
          <tbody>
            ${alumnos
              .map((st) => {
                return `
                <tr class="border-b border-slate-100 align-top">
                  <td class="p-3 font-black">${escapeHtml(st.nombre)}</td>

                  ${comps
                    .map((c, idx) => {
                      const id = makeMarkId(
                        st.id,
                        state.grade,
                        course,
                        bim,
                        idx
                      );
                      const saved = state.marks.find((m) => m.id === id);
                      const val = saved?.nl || "";

                      const dsc = findCompDesc(st.id, state.grade, course, bim, idx);

                      return `
                      <td class="p-2 min-w-[220px]">
                        <div class="space-y-2">
                          <select class="w-full p-2 rounded-xl bg-white border border-slate-200 font-black" id="mk_${id}">
                            ${NIVELES.map(
                              (n) =>
                                `<option value="${n}" ${n === val ? "selected" : ""}>${n}</option>`
                            ).join("")}
                          </select>

                          <textarea
                            class="comp-desc-input w-full p-2 rounded-xl bg-white border border-slate-200 font-bold"
                            id="cd_${st.id}_${idx}"
                            placeholder="Conclusión descriptiva (competencia ${idx + 1})...">${escapeHtml(dsc)}</textarea>
                        </div>
                      </td>
                    `;
                    })
                    .join("")}

                  <td class="p-2">
                    <button class="no-print px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-xs tracking-widest uppercase"
                      data-save-st="${st.id}">Guardar</button>
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>

      ${
        state.config.locked
          ? `<p class="mt-4 text-rose-600 font-black italic">Bloqueo activo: no se puede editar.</p>`
          : ``
      }
    </div>
  `;
}

/* Asistencia */
function renderAsistencia() {
  if (sessionUser.role !== "teacher") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo docentes.</div>`;
  }

  if (!state.teacherCourse) {
    return `
      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <h3 class="text-lg font-black">Asistencia</h3>
        <p class="text-slate-500 font-bold mt-2">Primero selecciona un curso desde <b>Mis cursos</b>.</p>
      </div>
    `;
  }

  const course = state.teacherCourse;
  const alumnos = state.students.filter((s) => (s.grado || "") === state.grade);

  const today = new Date();
  const iso = today.toISOString().slice(0, 10);

  return `
    <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-xl font-black">Asistencia - ${escapeHtml(course)}</h3>
          <p class="text-slate-500 font-bold text-sm">Grado: ${escapeHtml(state.grade)}</p>
        </div>

        <div class="flex items-center gap-3">
          <input id="attDate" type="date" class="no-print px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black" value="${iso}">
          <button id="saveAttendanceBtn" class="no-print px-6 py-4 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">
            Guardar asistencia
          </button>
        </div>
      </div>

      <div class="mt-5 overflow-auto">
        <table class="w-full min-w-[900px] border border-slate-200 rounded-2xl overflow-hidden">
          <thead class="bg-slate-50">
            <tr>
              <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Alumno</th>
              <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Estado</th>
              <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Leyenda</th>
            </tr>
          </thead>
          <tbody>
            ${alumnos
              .map((st) => {
                const stId = st.id;
                return `
                <tr class="border-b border-slate-100">
                  <td class="p-3 font-black">${escapeHtml(st.nombre)}</td>
                  <td class="p-2">
                    <select class="w-full p-2 rounded-xl bg-white border border-slate-200 font-black" id="att_${stId}">
                      <option value="P">P</option>
                      <option value="FJ">FJ</option>
                      <option value="FI">FI</option>
                      <option value="T">T</option>
                    </select>
                  </td>
                  <td class="p-3 text-slate-500 font-bold text-sm">
                    P=Presente · FJ=Falta Just. · FI=Falta Injust. · T=Tardanza
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/* Tutoría */
function renderTutoria() {
  if (sessionUser.role !== "teacher") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo docentes.</div>`;
  }

  if (!isTutorOfGrade(sessionUser.email, state.grade)) {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">
      No estás asignado como <b>tutor</b> de este grado (${escapeHtml(state.grade)}).
    </div>`;
  }

  const alumnos = state.students.filter((s) => (s.grado || "") === state.grade);
  if (!alumnos.length) {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">No hay alumnos.</div>`;
  }

  const b = state.config.bimestre || "I BIMESTRE";

  return `
    <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-xl font-black">Tutoría - ${escapeHtml(state.grade)}</h3>
          <p class="text-slate-500 font-bold text-sm">Año: ${SCHOOL_YEAR} | Bimestre: ${escapeHtml(b)}</p>
        </div>
      </div>

      <div class="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="rounded-2xl bg-slate-50 border border-slate-200 p-5">
          <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Alumno</div>
          <select id="tutStudentSel" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
            ${alumnos
              .map((a) => `<option value="${a.id}">${escapeHtml(a.nombre)}</option>`)
              .join("")}
          </select>

          <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Convivencia - Valores</div>
              <select id="tr_valores" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                ${["", "AD", "A", "B", "C"]
                  .map((x) => `<option value="${x}">${x}</option>`)
                  .join("")}
              </select>
            </div>

            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Convivencia - Normas</div>
              <select id="tr_normas" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                ${["", "AD", "A", "B", "C"]
                  .map((x) => `<option value="${x}">${x}</option>`)
                  .join("")}
              </select>
            </div>

            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Apoyo padres - Escuela</div>
              <select id="tr_padres_escuela" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                ${["", "AD", "A", "B", "C"]
                  .map((x) => `<option value="${x}">${x}</option>`)
                  .join("")}
              </select>
            </div>

            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Apoyo padres - Reuniones</div>
              <select id="tr_padres_reuniones" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                ${["", "AD", "A", "B", "C"]
                  .map((x) => `<option value="${x}">${x}</option>`)
                  .join("")}
              </select>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Inasist. Just.</div>
              <input id="tr_ij" type="number" min="0" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black" value="0">
            </div>
            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Inasist. Injust.</div>
              <input id="tr_ii" type="number" min="0" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black" value="0">
            </div>
            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Tard. Just.</div>
              <input id="tr_tj" type="number" min="0" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black" value="0">
            </div>
            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Tard. Injust.</div>
              <input id="tr_ti" type="number" min="0" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black" value="0">
            </div>
          </div>

          <div class="mt-4">
            <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Comentario del tutor</div>
            <textarea id="tr_comment" class="mt-2 w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold min-h-[110px]" placeholder="Escribe el comentario..."></textarea>
          </div>

          <button id="saveTutorReportBtn" class="no-print mt-4 w-full px-6 py-4 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">
            Guardar tutoría
          </button>
        </div>

        <div class="rounded-2xl bg-white border border-slate-200 p-5">
          <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Vista rápida</div>
          <p class="mt-2 text-slate-700 font-bold text-sm">
            Lo que guardes aquí se verá en la <b>libreta</b> en la parte inferior.
          </p>
          <div class="mt-4 text-slate-500 font-bold text-sm">
            Consejo: llena por bimestre (según Config).
          </div>
        </div>
      </div>
    </div>
  `;
}

/* Libreta */
function renderLibreta() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const alumnos = state.students.filter((s) => (s.grado || "") === state.grade);
  if (!alumnos.length) {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">No hay alumnos en este grado.</div>`;
  }

  return `
    <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h3 class="text-xl font-black">Libreta por alumno</h3>
          <p class="text-slate-500 font-bold text-sm">Exportar a PDF: botón → luego “Guardar como PDF”.</p>
        </div>
        <div class="flex gap-2 items-center">
          <select id="repStudent" class="no-print px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
            ${alumnos
              .map((a) => `<option value="${a.id}">${escapeHtml(a.nombre)}</option>`)
              .join("")}
          </select>
          <button id="btnPrint" class="no-print px-5 py-3 rounded-2xl bg-slate-900 text-white font-black tracking-widest uppercase text-xs shadow-lg">
            Exportar PDF
          </button>
        </div>
      </div>

      <div id="reportBox" class="mt-6"></div>
    </div>
  `;
}

/* Config */
function renderConfig() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const b = state.config.bimestre || "I BIMESTRE";
  const locked = !!state.config.locked;

  return `
    <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
      <h3 class="text-xl font-black">Configuración</h3>

      <div class="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p class="text-slate-500 font-black text-xs tracking-widest uppercase">Bimestre</p>
          <select id="cfgBim" class="mt-2 w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
            ${["I BIMESTRE","II BIMESTRE","III BIMESTRE","IV BIMESTRE"]
              .map((x) => `<option ${x === b ? "selected" : ""}>${x}</option>`)
              .join("")}
          </select>
        </div>

        <div>
          <p class="text-slate-500 font-black text-xs tracking-widest uppercase">Bloqueo</p>
          <select id="cfgLock" class="mt-2 w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
            <option value="false" ${!locked ? "selected" : ""}>NO</option>
            <option value="true" ${locked ? "selected" : ""}>SÍ</option>
          </select>
        </div>
      </div>

      <button id="saveCfg" class="no-print mt-5 px-6 py-4 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">
        Guardar
      </button>
    </div>
  `;
}

/* ====== REPORTE ====== */

function renderOfficialBottomBox(st, grade) {
  const bims = ["I BIMESTRE", "II BIMESTRE", "III BIMESTRE", "IV BIMESTRE"];
  const labels = ["I", "II", "III", "IV"];
  const row = (title, field) => `
    <tr>
      <td class="official-bottom-label">${escapeHtml(title)}</td>
      ${bims.map((b) => `<td class="official-bottom-score">${escapeHtml(getTutorField(st.id, grade, b, field, ""))}</td>`).join("")}
    </tr>
  `;
  const rowNum = (title, field) => `
    <tr>
      <td class="official-bottom-label">${escapeHtml(title)}</td>
      ${bims.map((b) => `<td class="official-bottom-score">${escapeHtml(getTutorField(st.id, grade, b, field, 0))}</td>`).join("")}
    </tr>
  `;

  return `
    <div class="official-bottom-box">
      <div class="official-bottom-title">INFORMACIÓN COMPLEMENTARIA DEL ESTUDIANTE</div>
      <div class="official-bottom-grid">
        <table class="official-bottom-table">
          <thead>
            <tr>
              <th>ASISTENCIA Y PUNTUALIDAD</th>
              ${labels.map((x) => `<th>${x}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rowNum("Inasistencias justificadas", "inasist_just")}
            ${rowNum("Inasistencias injustificadas", "inasist_injust")}
            ${rowNum("Tardanzas justificadas", "tard_just")}
            ${rowNum("Tardanzas injustificadas", "tard_injust")}
          </tbody>
        </table>

        <table class="official-bottom-table">
          <thead>
            <tr>
              <th>CONVIVENCIA Y APOYO FAMILIAR</th>
              ${labels.map((x) => `<th>${x}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${row("Practica valores y buena convivencia", "convivencia_valores")}
            ${row("Respeta normas de convivencia", "convivencia_normas")}
            ${row("Apoyo de padres en la escuela", "padres_escuela")}
            ${row("Participación en reuniones", "padres_reuniones")}
          </tbody>
        </table>
      </div>

      <div class="official-scale-row">
        <div><b>Escala:</b> AD = Logro destacado · A = Logro esperado · B = En proceso · C = En inicio</div>
        <div><b>NLA(*):</b> Nivel de logro alcanzado</div>
      </div>

      <table class="official-sign-table">
        <tr>
          <td><div class="official-sign-line"></div><b>Docente Tutor(a)</b></td>
          <td><div class="official-sign-line"></div><b>Dirección</b></td>
          <td><div class="official-sign-line"></div><b>Padre/Madre o Apoderado</b></td>
        </tr>
      </table>
    </div>
  `;
}

function renderReport() {
  const box = $("reportBox");
  if (!box) return;

  const studentId = $("repStudent")?.value;
  const st = state.students.find((s) => String(s.id) === String(studentId));
  if (!st) {
    box.innerHTML = "";
    return;
  }

  const grade = state.grade;
  const cursos = cursosPorGrado(grade);
  const fecha = new Date().toLocaleDateString("es-PE");

  const getMark = (course, compIndex, bim) => {
    const row = state.marks.find(
      (m) =>
        String(m.studentId) === String(st.id) &&
        (m.grade || "") === grade &&
        normalizeCourse(m.course || "") === normalizeCourse(course || "") &&
        (m.bimestre || "") === bim &&
        Number(m.compIndex) === Number(compIndex)
    );
    return row?.nl || "";
  };

  const computeNLA = (course, compIndex) => {
    const order = ["IV BIMESTRE", "III BIMESTRE", "II BIMESTRE", "I BIMESTRE"];
    for (const bb of order) {
      const v = getMark(course, compIndex, bb);
      if (v) return v;
    }
    return "";
  };

  const nivel = grade.includes("Secundaria")
    ? "SECUNDARIA"
    : grade.includes("Primaria")
    ? "PRIMARIA"
    : "INICIAL";

  const mainRows = cursos
    .map((course) => {
      const comps = COMP[course] || COMP[normalizeCourse(course)] || [];
      if (!comps.length) return "";

      return comps
        .map((compText, idx) => {
          const I = getMark(course, idx, "I BIMESTRE");
          const II = getMark(course, idx, "II BIMESTRE");
          const III = getMark(course, idx, "III BIMESTRE");
          const IV = getMark(course, idx, "IV BIMESTRE");

          const nla = computeNLA(course, idx);

          const areaCell =
            idx === 0
              ? `<td class="report-area" rowspan="${comps.length}">${escapeHtml(
                  course
                )}</td>`
              : "";

          // ✅ Conclusión descriptiva por competencia (según BIMESTRE de la fila)
          // En la libreta se imprime por fila, y corresponde al BIMESTRE actual mostrado en columnas.
          // Aquí lo más coherente es imprimir la conclusión del BIMESTRE CONFIGURADO?
          // Pero el formato tiene 4 bimestres y 1 sola columna de conclusiones.
          // Decisión: mostrar la conclusión del BIMESTRE ACTUAL CONFIGURADO (state.config.bimestre).
          const descBim = state.config.bimestre || "I BIMESTRE";
          const desc = findCompDesc(st.id, grade, course, descBim, idx) || "";

          return `
            <tr>
              ${areaCell}
              <td class="report-comp">${escapeHtml(compText)}</td>
              <td class="report-bim">${escapeHtml(I)}</td>
              <td class="report-bim">${escapeHtml(II)}</td>
              <td class="report-bim">${escapeHtml(III)}</td>
              <td class="report-bim">${escapeHtml(IV)}</td>
              <td class="report-desc">${escapeHtml(desc)}</td>
              <td class="report-nla">${escapeHtml(nla)}</td>
            </tr>
          `;
        })
        .join("");
    })
    .join("");

  const headerLogo = document.querySelector("#view-app .kw-logo-img");
  const logoSrc = headerLogo?.getAttribute("src") || "logo.png";

  const tutorName = getTutorNameForGrade(grade);

  box.innerHTML = `
    <div class="report-sheet">
      <div class="report-brand">
        <div class="report-logo">
          <img src="${escapeHtml(logoSrc)}" alt="Logo" onerror="this.style.display='none'">
          <div class="report-logo-fallback">KW</div>
        </div>
      </div>

      <div class="report-topline">"Año de la recuperación y consolidación de la economía peruana"</div>
      <div class="report-title">INFORME DE PROGRESO ACADÉMICO - ${SCHOOL_YEAR}</div>

      <table class="report-head">
        <tr>
          <td style="width:160px;">
            <div class="label">Nivel</div>
            <div class="value">${escapeHtml(nivel)}</div>
          </td>
          <td>
            <div class="label">Apellidos y Nombres</div>
            <div class="value">${escapeHtml(st.nombre)}</div>
          </td>
          <td style="width:160px;">
            <div class="label">Año</div>
            <div class="value">${escapeHtml(grade)}</div>
          </td>
          <td style="width:200px;">
            <div class="label">Tutor(a)</div>
            <div class="value">${escapeHtml(tutorName)}</div>
          </td>
          <td style="width:120px;">
            <div class="label">Fecha</div>
            <div class="value">${escapeHtml(fecha)}</div>
          </td>
        </tr>
      </table>

      <table class="report-main">
        <colgroup>
          <col class="cg-area">
          <col class="cg-comp">
          <col class="cg-bim">
          <col class="cg-bim">
          <col class="cg-bim">
          <col class="cg-bim">
          <col class="cg-desc">
          <col class="cg-nla">
        </colgroup>
        <thead>
          <tr>
            <th style="width:140px;">ÁREAS</th>
            <th class="report-comp">COMPETENCIAS</th>
            <th colspan="4">BIMESTRES</th>
            <th class="report-desc">CONCLUSIONES DESCRIPTIVAS</th>
            <th class="report-nla">NLA(*)</th>
          </tr>
          <tr>
            <th></th><th></th>
            <th class="report-bim">I</th>
            <th class="report-bim">II</th>
            <th class="report-bim">III</th>
            <th class="report-bim">IV</th>
            <th></th><th></th>
          </tr>
        </thead>
        <tbody>
          ${mainRows || `<tr><td colspan="8" style="text-align:center; padding:14px;">Sin datos todavía.</td></tr>`}
        </tbody>
      </table>

      <div style="margin-top:10px;">
        <table class="report-main report-comment-table">
          <thead>
            <tr><th colspan="2">COMENTARIO DEL TUTOR(A)</th></tr>
          </thead>
          <tbody>
            ${["I BIMESTRE","II BIMESTRE","III BIMESTRE","IV BIMESTRE"].map((bim,idx)=>{
              const label = ["I","II","III","IV"][idx];
              const comment = getTutorField(st.id, grade, bim, "comment", "");
              return `
                <tr>
                  <td style="width:30px;text-align:center;font-weight:800;">${label}</td>
                  <td style="white-space:pre-wrap;">${escapeHtml(comment)}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>


      ${renderOfficialBottomBox(st, grade)}

      <div class="report-note">
        <b>Nota:</b> La conclusión descriptiva mostrada corresponde al bimestre configurado actualmente:
        <b>${escapeHtml(state.config.bimestre || "I BIMESTRE")}</b>.
      </div>
    </div>
  `;
}


function printCurrentReport() {
  const sheet = document.querySelector("#reportBox .report-sheet");
  if (!sheet) return toast("Primero selecciona una libreta.", "err");

  const cloned = sheet.cloneNode(true);
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) {
    toast("Permite ventanas emergentes para imprimir.", "err");
    return;
  }

  w.document.open();
  w.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Libreta - ${escapeHtml(document.querySelector("#repStudent option:checked")?.textContent || "Alumno")}</title>
<style>
  @page{ size:A4 portrait; margin:6mm; }
  *{ box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  html,body{ margin:0; padding:0; background:#fff; color:#000; font-family:Arial, Helvetica, sans-serif; }
  .report-sheet{ width:198mm; margin:0 auto; padding:0; background:#fff; color:#000; font-family:Arial, Helvetica, sans-serif; }
  .report-brand{ display:flex; justify-content:center; align-items:center; margin:0 0 1mm; }
  .report-logo{ width:18mm; height:18mm; display:flex; align-items:center; justify-content:center; border:0; box-shadow:none; background:transparent; }
  .report-logo img{ width:100%; height:100%; object-fit:contain; display:block; }
  .report-logo-fallback{ display:none; }
  .report-topline{ text-align:center; font-size:8.5px; margin:0 0 1.5mm; }
  .report-title{ text-align:center; font-weight:900; font-size:12px; margin:0 0 2mm; letter-spacing:.2px; }
  table{ border-collapse:collapse; table-layout:fixed; width:100%; }
  .report-head{ font-size:8.2px; margin-bottom:2mm; }
  .report-head td{ border:1px solid #000; padding:2.4px 3px; vertical-align:top; }
  .report-head .label{ font-weight:900; font-size:7.3px; display:block; }
  .report-head .value{ font-weight:800; display:block; word-break:break-word; }
  .report-main{ font-size:7.35px; line-height:1.03; }
  .report-main col.col-area{ width:20mm; }
  .report-main col.col-comp{ width:42mm; }
  .report-main col.col-bim{ width:6.5mm; }
  .report-main col.col-desc{ width:95mm; }
  .report-main col.col-nla{ width:8mm; }
  .report-main th,.report-main td{ border:1px solid #000; padding:1.8px 2.4px; vertical-align:top; }
  .report-main thead th{ background:#e5e7eb; text-align:center; font-weight:900; line-height:1.04; white-space:normal; }
  .report-area{ width:20mm !important; font-weight:900; text-transform:uppercase; text-align:center; vertical-align:middle !important; font-size:6.7px; }
  .report-comp{ width:42mm !important; word-break:break-word; overflow-wrap:anywhere; }
  .report-bim{ width:6.5mm !important; min-width:6.5mm !important; max-width:6.5mm !important; text-align:center; font-weight:900; vertical-align:middle !important; padding:.6px !important; }
  .report-desc{ width:95mm !important; white-space:pre-wrap; word-break:break-word; overflow-wrap:anywhere; }
  .report-nla{ width:8mm !important; min-width:8mm !important; max-width:8mm !important; text-align:center; font-weight:900; vertical-align:middle !important; padding:.6px !important; }
  .report-comment-table{ margin-top:1.5mm; font-size:7.2px !important; }
  .report-comment-table th,.report-comment-table td{ padding:1.5px 2px !important; }
  .official-bottom-box{ margin-top:1.6mm; border:1px solid #000; break-inside:avoid; page-break-inside:avoid; }
  .official-bottom-title{ background:#e5e7eb; border-bottom:1px solid #000; text-align:center; font-weight:900; font-size:7.2px; padding:1.5px 3px; }
  .official-bottom-grid{ display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .official-bottom-table{ font-size:6.65px; }
  .official-bottom-table:first-child{ border-right:1px solid #000; }
  .official-bottom-table th,.official-bottom-table td{ border:1px solid #000; padding:1.3px 1.8px; vertical-align:middle; }
  .official-bottom-table th{ background:#f1f5f9; text-align:center; font-weight:900; }
  .official-bottom-table th:first-child{ text-align:left; }
  .official-bottom-score{ width:6mm; text-align:center; font-weight:900; }
  .official-scale-row{ display:flex; justify-content:space-between; gap:8px; border-top:1px solid #000; padding:1.4px 3px; font-size:6.4px; line-height:1.1; }
  .official-sign-table{ font-size:6.6px; border-top:1px solid #000; }
  .official-sign-table td{ text-align:center; padding:8px 4px 2.5px; border-right:1px solid #000; }
  .official-sign-table td:last-child{ border-right:0; }
  .official-sign-line{ border-top:1px solid #000; width:74%; margin:0 auto 3px; }
  .report-note{ display:none; }
  tr{ break-inside:avoid; page-break-inside:avoid; }
  @media screen{ body{ padding:12px; background:#e5e7eb; } .report-sheet{ background:#fff; padding:0; box-shadow:0 8px 40px rgba(0,0,0,.18); } }
</style>
</head>
<body></body>
</html>`);
  w.document.body.appendChild(cloned);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 350);
}

/* ====== EVENTOS ====== */
document.addEventListener("change", (ev) => {
  if (ev.target?.id === "repStudent") {
    renderReport();
  }

  if (ev.target?.id === "tutStudentSel") {
    const studentId = ev.target.value;
    const grade = state.grade;
    const b = state.config.bimestre || "I BIMESTRE";

    const r = getTutorReport(studentId, grade, b);

    if ($("tr_valores")) $("tr_valores").value = r?.convivencia_valores || "";
    if ($("tr_normas")) $("tr_normas").value = r?.convivencia_normas || "";
    if ($("tr_padres_escuela"))
      $("tr_padres_escuela").value = r?.padres_escuela || "";
    if ($("tr_padres_reuniones"))
      $("tr_padres_reuniones").value = r?.padres_reuniones || "";

    if ($("tr_ij")) $("tr_ij").value = r?.inasist_just ?? 0;
    if ($("tr_ii")) $("tr_ii").value = r?.inasist_injust ?? 0;
    if ($("tr_tj")) $("tr_tj").value = r?.tard_just ?? 0;
    if ($("tr_ti")) $("tr_ti").value = r?.tard_injust ?? 0;

    if ($("tr_comment")) $("tr_comment").value = r?.comment || "";
  }

  if (ev.target?.id === "attDate") {
    const dateISO = ev.target.value;
    const grade = state.grade;
    const course = state.teacherCourse;
    if (!course) return;

    const alumnos = state.students.filter((s) => (s.grado || "") === grade);
    alumnos.forEach((st) => {
      const v = getAttendanceStatus(dateISO, grade, course, st.id);
      const sel = $(`att_${st.id}`);
      if (sel) sel.value = v;
    });
  }
});

document.addEventListener("click", async (ev) => {
  const t = ev.target;

  if (t?.id === "btnPrint") {
    printCurrentReport();
    return;
  }

  /* Config */
  if (t?.id === "saveCfg") {
    const b = $("cfgBim").value;
    const locked = $("cfgLock").value === "true";
    const res = await sb.from("settings").upsert(
      [{ key: "global", bimestre: b, locked, at: new Date().toISOString() }],
      { onConflict: "key" }
    );
    if (res.error) return toast(res.error.message, "err");
    await loadAll(true);
    toast("Config guardada");
    render();
    return;
  }

  /* Guardar tutoría (Tutor) */
  if (t?.id === "saveTutorReportBtn") {
    const studentId = $("tutStudentSel")?.value;
    if (!studentId) return toast("Selecciona alumno.", "err");

    const grade = state.grade;
    const bimestre = state.config.bimestre || "I BIMESTRE";

    const payload = {
      student_id: String(studentId),
      grade,
      year: SCHOOL_YEAR,
      bimestre,

      convivencia_valores: $("tr_valores")?.value || "",
      convivencia_normas: $("tr_normas")?.value || "",
      padres_escuela: $("tr_padres_escuela")?.value || "",
      padres_reuniones: $("tr_padres_reuniones")?.value || "",

      inasist_just: Number($("tr_ij")?.value || 0),
      inasist_injust: Number($("tr_ii")?.value || 0),
      tard_just: Number($("tr_tj")?.value || 0),
      tard_injust: Number($("tr_ti")?.value || 0),

      comment: $("tr_comment")?.value || "",

      updated_by: sessionUser.email,
      at: new Date().toISOString(),
    };

    const up = await sb.from("tutor_reports").upsert([payload], {
      onConflict: "student_id,grade,year,bimestre",
    });
    if (up.error) return toast(up.error.message, "err");

    await loadAll(true);
    toast("Tutoría guardada");
    render();
    return;
  }

  /* Guardar asistencia */
  if (t?.id === "saveAttendanceBtn") {
    if (!state.teacherCourse) return toast("Selecciona un curso.", "err");

    const dateISO = $("attDate")?.value;
    if (!dateISO) return toast("Selecciona fecha.", "err");

    const course = normalizeCourse(state.teacherCourse);
    const grade = state.grade;
    const alumnos = state.students.filter((s) => (s.grado || "") === grade);

    const rows = alumnos.map((st) => ({
      date: dateISO,
      grade,
      course,
      student_id: String(st.id),
      status: $(`att_${st.id}`)?.value || "P",
      teacher_email: sessionUser.email,
      at: new Date().toISOString(),
    }));

    const up = await sb.from("attendance").upsert(rows, {
      onConflict: "date,grade,course,student_id",
    });
    if (up.error) return toast(up.error.message, "err");

    await loadAll(true);
    toast("Asistencia guardada");
    render();
    return;
  }

  /* Seleccionar curso (docente) */
  const pickBtn = t?.closest?.("[data-pick-course]");
  if (pickBtn) {
    state.teacherCourse = pickBtn.dataset.pickCourse;
    state.grade = pickBtn.dataset.pickGrade || state.grade;
    state.tab = "notas";
    render();
    return;
  }

  if (t?.id === "backCourses") {
    state.teacherCourse = null;
    state.tab = "dashboard";
    render();
    return;
  }

  /* Registrar alumno */
  if (t?.closest("#addStudentForm") && t.tagName === "BUTTON") {
    ev.preventDefault();
    const nombre = ($("stName")?.value || "").trim();
    if (!nombre) return;

    const res = await sb.from("students").insert([
      { nombre, grado: state.grade, at: new Date().toISOString() },
    ]);
    if (res.error) return toast(res.error.message, "err");

    $("stName").value = "";
    await loadAll(true);
    toast("Alumno registrado");
    render();
    return;
  }

  /* Eliminar alumno */
  if (t?.dataset?.delSt) {
    const id = t.dataset.delSt;
    const res = await sb.from("students").delete().eq("id", id);
    if (res.error) return toast(res.error.message, "err");
    await loadAll(true);
    toast("Alumno eliminado");
    render();
    return;
  }

  /* Crear docente */
  if (t?.closest("#addTeacherForm") && t.tagName === "BUTTON") {
    ev.preventDefault();
    const name = ($("tName")?.value || "").trim();
    const email = ($("tEmail")?.value || "").trim().toLowerCase();
    if (!name || !email) return;

    const exists = state.teachers.some(
      (u) => (u.email || "").toLowerCase() === email
    );
    if (exists) return toast("Ya existe un docente con ese correo.", "err");

    const res = await sb.from("users").insert([
      { name, email, role: "teacher", assignments: [], at: new Date().toISOString() },
    ]);
    if (res.error) return toast(res.error.message, "err");

    $("tName").value = "";
    $("tEmail").value = "";
    toast("Docente creado");

    await loadAll(true);
    render();
    return;
  }

  /* Eliminar docente */
  if (t?.dataset?.delTeacher) {
    const id = t.dataset.delTeacher;
    const res = await sb.from("users").delete().eq("id", id);
    if (res.error) return toast(res.error.message, "err");
    await loadAll(true);
    toast("Docente eliminado");
    render();
    return;
  }

  /* Agregar asignación */
  if (t?.dataset?.addAssign) {
    const teacherId = t.dataset.addAssign;
    const teacher = state.teachers.find((x) => String(x.id) === String(teacherId));
    if (!teacher) return toast("Docente no encontrado", "err");

    const c = $(`asg_course_${teacherId}`)?.value;
    const g = $(`asg_grade_${teacherId}`)?.value;
    if (!c || !g) return toast("Selecciona curso y grado", "err");

    const assigns = Array.isArray(teacher.assignments) ? [...teacher.assignments] : [];
    const dup = assigns.some(
      (a) => (a.grade || "") === g && normalizeCourse(a.course || "") === normalizeCourse(c)
    );
    if (dup) return toast("Asignación duplicada", "err");

    assigns.push({ grade: g, course: c });

    const up = await sb
      .from("users")
      .update({ assignments: assigns, at: new Date().toISOString() })
      .eq("id", teacherId);
    if (up.error) return toast(up.error.message, "err");

    await loadAll(true);
    toast("Asignación agregada");
    render();
    return;
  }

  /* Quitar asignación */
  if (t?.dataset?.delAssign && t?.dataset?.assignIdx != null) {
    const teacherId = t.dataset.delAssign;
    const idx = Number(t.dataset.assignIdx);

    const teacher = state.teachers.find((x) => String(x.id) === String(teacherId));
    if (!teacher) return toast("Docente no encontrado", "err");

    const assigns = Array.isArray(teacher.assignments) ? [...teacher.assignments] : [];
    assigns.splice(idx, 1);

    const up = await sb
      .from("users")
      .update({ assignments: assigns, at: new Date().toISOString() })
      .eq("id", teacherId);
    if (up.error) return toast(up.error.message, "err");

    await loadAll(true);
    toast("Asignación quitada");
    render();
    return;
  }

  /* Guardar notas + conclusiones por competencia (docente) */
  if (t?.dataset?.saveSt) {
    if (state.config.locked) return toast("Bloqueo activo.", "err");
    if (sessionUser.role !== "teacher") return toast("Solo docentes.", "err");
    if (!state.teacherCourse) return toast("Selecciona un curso.", "err");

    const studentId = t.dataset.saveSt;
    const grade = state.grade;
    const course = normalizeCourse(state.teacherCourse);
    const bimestre = state.config.bimestre || "I BIMESTRE";
    const comps = COMP[course] || COMP[normalizeCourse(course)] || [];

    // 1) MARKS
    const markRows = comps.map((_, idx) => {
      const id = makeMarkId(studentId, grade, course, bimestre, idx);
      const nl = $(`mk_${id}`)?.value ?? "";
      return {
        id,
        studentId: String(studentId),
        grade,
        course,
        bimestre,
        compIndex: Number(idx),
        nl,
        updatedBy: sessionUser.email,
        at: new Date().toISOString(),
      };
    });

    const upMarks = await sb.from("marks").upsert(markRows, { onConflict: "id" });
    if (upMarks.error) return toast(upMarks.error.message, "err");

    // 2) COMPETENCY DESC
    const descRows = comps.map((_, idx) => {
      const desc = $(`cd_${studentId}_${idx}`)?.value ?? "";
      return {
        student_id: String(studentId),
        grade,
        course,
        bimestre,
        comp_index: Number(idx),
        desc,
        updated_by: sessionUser.email,
        at: new Date().toISOString(),
      };
    });

    const upDesc = await sb
      .from("competency_desc")
      .upsert(descRows, { onConflict: "student_id,grade,course,bimestre,comp_index" });
    if (upDesc.error) return toast(upDesc.error.message, "err");

    await loadAll(true);
    toast("Notas + conclusiones guardadas");
    render();
    return;
  }

  /* Guardar tutor (Directora) */
  if (t?.id === "saveTutorBtn") {
    if (sessionUser.role !== "director") return toast("Solo directora.", "err");

    const teacherId = $("tutorTeacherSel")?.value;
    if (!teacherId) return toast("Selecciona un docente.", "err");

    const teacher = state.teachers.find((x) => String(x.id) === String(teacherId));
    if (!teacher) return toast("Docente no encontrado.", "err");

    const payload = {
      grade: state.grade,
      year: SCHOOL_YEAR,
      teacher_id: String(teacher.id),
      teacher_email: teacher.email,
      at: new Date().toISOString(),
    };

    const up = await sb
      .from("homeroom_tutors")
      .upsert([payload], { onConflict: "grade,year" });

    if (up.error) return toast(up.error.message, "err");

    await loadAll(true);
    toast("Tutor asignado");
    render();
    return;
  }
});