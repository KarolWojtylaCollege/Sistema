/* ====== PEGA TUS DATOS ====== */
const SUPABASE_URL = "https://rgtfiwqsmsfqadaroers.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJndGZpd3FzbXNmcWFkYXJvZXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTk0MjQsImV4cCI6MjA4NzE3NTQyNH0.dN3WKHOD6b029JVc58TIq7pRxDiezHrIr5x0oo3S-gQ";
/* ============================ */

const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

function makeSupabaseFallback(reason = "Supabase no disponible") {
  const error = { message: reason };
  const readResult = Promise.resolve({ data: [], error: null });
  const singleResult = Promise.resolve({ data: null, error: null });
  const writeResult = Promise.resolve({ data: null, error });

  const builder = {
    select() { return this; },
    order() { return this; },
    eq() { return this; },
    limit() { return this; },
    maybeSingle() { return singleResult; },
    insert() { return writeResult; },
    upsert() { return writeResult; },
    update() { return { eq: () => writeResult }; },
    delete() { return { eq: () => writeResult }; },
    then(resolve) { return readResult.then(resolve); },
    catch(reject) { return readResult.catch(reject); },
    finally(cb) { return readResult.finally(cb); },
  };

  return { from: () => ({ ...builder }) };
}

let sb = makeSupabaseFallback("Conexión con Supabase pendiente");
let supabaseReady = false;
let supabaseLoadPromise = null;

async function initSupabase() {
  if (supabaseReady) return true;
  if (supabaseLoadPromise) return supabaseLoadPromise;

  supabaseLoadPromise = Promise.race([
    import(SUPABASE_MODULE_URL),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("No se pudo cargar Supabase a tiempo")), 6500)
    ),
  ])
    .then(({ createClient }) => {
      sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      supabaseReady = true;
      return true;
    })
    .catch((err) => {
      console.warn("[KW] Supabase no cargó. Modo local para acceso inicial:", err?.message || err);
      sb = makeSupabaseFallback("Supabase no disponible. Revisa internet o abre el sistema con un servidor local.");
      supabaseReady = false;
      return false;
    });

  return supabaseLoadPromise;
}

/* Acceso inicial de dirección: se exige cambiarlo en el primer ingreso local. */
const ADMIN_EMAIL = "ElizabethRojas@KarolWojtyla.edu.pe";
const ADMIN_PASS = "Admin123";
const DIRECTOR_PROFILE_KEY = "kwc_director_profile_v3";
const LOCAL_TEACHER_CREDENTIALS_KEY = "kwc_teacher_credentials_v2";
const LOCAL_AUDIT_KEY = "kwc_audit_logs_v2";
const LOCAL_TUTOR_FINAL_STATUS_KEY = "kwc_tutor_final_status_v1";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

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

/* Competencias por nivel, tomadas de las libretas oficiales de referencia. */
const COMP_PERSONAL_SOCIAL_INICIAL = [
  "Construye su identidad",
  "Convive y participa democráticamente en la búsqueda del bien común",
  "Construye su identidad, como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas",
];

const COMP_INGLES_INICIAL = [
  "Se comunica oralmente en inglés como lengua extranjera",
  "Lee diversos tipos de textos escritos en inglés como lengua extranjera",
  "Escribe diversos tipos de textos en inglés como lengua extranjera",
];

const COMP_RELIGION = [
  "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente, comprendiendo la doctrina de su propia religión, abierto al diálogo con las que le son cercanas",
  "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa",
];

const COMP_TRANSVERSALES = [
  "Se desenvuelve en entornos virtuales generados por las TIC",
  "Gestiona su aprendizaje de manera autónoma",
];

const COMP_INICIAL_3 = {
  "PERSONAL SOCIAL": COMP_PERSONAL_SOCIAL_INICIAL,
  PSICOMOTRIZ: ["Se desenvuelve de manera autónoma a través de su motricidad"],
  COMUNICACIÓN: [
    "Se comunica oralmente en su lengua materna",
    "Lee diversos tipos de textos escritos en su lengua materna",
    "Crea proyectos desde los lenguajes del arte",
  ],
  MATEMÁTICA: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de forma, movimiento y localización",
  ],
  "CIENCIA Y TECNOLOGÍA": ["Indaga mediante métodos científicos para construir sus conocimientos"],
  INGLÉS: COMP_INGLES_INICIAL,
  ARTE: ["Crea proyectos desde los lenguajes artísticos"],
  COMPUTACIÓN: ["Se desenvuelve en entornos virtuales generados por las TIC"],
};

const COMP_INICIAL_4 = {
  "PERSONAL SOCIAL": COMP_PERSONAL_SOCIAL_INICIAL,
  PSICOMOTRIZ: ["Se desenvuelve de manera autónoma a través de su motricidad"],
  COMUNICACIÓN: [
    "Se comunica oralmente en su lengua materna",
    "Lee diversos tipos de textos escritos en su lengua materna",
    "Crea proyectos desde los lenguajes del arte",
    "Escribe diversos tipos de textos en su lengua materna",
  ],
  MATEMÁTICA: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de forma, movimiento y localización",
  ],
  "CIENCIA Y TECNOLOGÍA": ["Indaga mediante métodos científicos para construir sus conocimientos"],
  INGLÉS: COMP_INGLES_INICIAL,
  ARTE: ["Crea proyectos desde los lenguajes artísticos"],
  COMPUTACIÓN: ["Se desenvuelve en entornos virtuales generados por las TIC"],
};

const COMP_INICIAL_5 = {
  "PERSONAL SOCIAL": COMP_PERSONAL_SOCIAL_INICIAL,
  PSICOMOTRIZ: ["Se desenvuelve de manera autónoma a través de su motricidad"],
  COMUNICACIÓN: [
    "Se comunica oralmente en su lengua materna",
    "Lee diversos tipos de textos escritos en su lengua materna",
    "Crea proyectos desde los lenguajes del arte",
    "Escribe diversos tipos de textos en su lengua materna",
  ],
  MATEMÁTICA: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de forma, movimiento y localización",
  ],
  "CIENCIA Y TECNOLOGÍA": ["Indaga mediante métodos científicos para construir sus conocimientos"],
  INGLÉS: COMP_INGLES_INICIAL,
  ARTE: ["Crea proyectos desde los lenguajes artísticos"],
  "COMPETENCIAS TRANSVERSALES": COMP_TRANSVERSALES,
};

const COMP_PRIMARIA = {
  "PERSONAL SOCIAL": [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
    "Construye interpretaciones históricas",
    "Gestiona responsablemente el espacio y el ambiente",
    "Gestiona responsablemente los recursos económicos",
  ],
  "EDUCACIÓN FÍSICA": [
    "Se desenvuelve de manera autónoma a través de su motricidad",
    "Asume una vida saludable",
    "Interactúa a través de sus habilidades sociomotrices",
  ],
  COMUNICACIÓN: [
    "Se comunica oralmente en su lengua materna",
    "Lee diversos tipos de textos escritos en su lengua materna",
    "Escribe diversos tipos de textos en su lengua materna",
  ],
  "ARTE Y CULTURA": [
    "Aprecia de manera crítica manifestaciones artístico-culturales",
    "Crea proyectos desde los lenguajes artísticos",
  ],
  INGLÉS: COMP_INGLES_INICIAL,
  MATEMÁTICA: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de regularidad, equivalencia y cambio",
    "Resuelve problemas de forma, movimiento y localización",
    "Resuelve problemas de gestión de datos e incertidumbre",
  ],
  "CIENCIA Y TECNOLOGÍA": [
    "Indaga mediante métodos científicos para construir sus conocimientos",
    "Explica el mundo físico basándose en conocimientos sobre los seres vivos; materia y energía; biodiversidad, Tierra y Universo",
    "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
  ],
  "EDUCACIÓN RELIGIOSA": COMP_RELIGION,
  "COMPETENCIAS TRANSVERSALES": COMP_TRANSVERSALES,
};

const COMP_SECUNDARIA = {
  "DESARROLLO PERSONAL, CIUDADANÍA Y CÍVICA": [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
  ],
  "CIENCIAS SOCIALES": [
    "Construye interpretaciones históricas",
    "Gestiona responsablemente el espacio y el ambiente",
    "Gestiona responsablemente los recursos económicos",
  ],
  "EDUCACIÓN PARA EL TRABAJO": ["Gestiona proyectos de emprendimiento económico o social"],
  "EDUCACIÓN FÍSICA": [
    "Se desenvuelve de manera autónoma a través de su motricidad",
    "Asume una vida saludable",
    "Interactúa a través de sus habilidades sociomotrices",
  ],
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
    "Se comunica oralmente",
    "Lee diversos tipos de textos escritos",
    "Escribe diversos tipos de textos",
  ],
  MATEMÁTICA: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de regularidad, equivalencia y cambio",
    "Resuelve problemas de forma, movimiento y localización",
    "Resuelve problemas de gestión de datos e incertidumbre",
  ],
  "CIENCIA Y TECNOLOGÍA": [
    "Indaga mediante métodos científicos para construir sus conocimientos",
    "Explica el mundo físico basándose en conocimientos sobre los seres vivos; materia y energía; biodiversidad, Tierra y Universo",
    "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
  ],
  "EDUCACIÓN RELIGIOSA": COMP_RELIGION,
  "COMPETENCIAS TRANSVERSALES": COMP_TRANSVERSALES,
};

const COMP = COMP_SECUNDARIA;

const CURSOS_INICIAL_3 = [
  "PERSONAL SOCIAL",
  "PSICOMOTRIZ",
  "COMUNICACIÓN",
  "MATEMÁTICA",
  "CIENCIA Y TECNOLOGÍA",
  "INGLÉS",
  "ARTE",
  "COMPUTACIÓN",
];

const CURSOS_INICIAL_4 = [...CURSOS_INICIAL_3];

const CURSOS_INICIAL_5 = [
  "PERSONAL SOCIAL",
  "PSICOMOTRIZ",
  "COMUNICACIÓN",
  "MATEMÁTICA",
  "CIENCIA Y TECNOLOGÍA",
  "INGLÉS",
  "ARTE",
  "COMPETENCIAS TRANSVERSALES",
];

const CURSOS_PRIMARIA = [
  "PERSONAL SOCIAL",
  "EDUCACIÓN FÍSICA",
  "COMUNICACIÓN",
  "ARTE Y CULTURA",
  "INGLÉS",
  "MATEMÁTICA",
  "CIENCIA Y TECNOLOGÍA",
  "EDUCACIÓN RELIGIOSA",
  "COMPETENCIAS TRANSVERSALES",
];

const CURSOS_SECUNDARIA = [
  "DESARROLLO PERSONAL, CIUDADANÍA Y CÍVICA",
  "CIENCIAS SOCIALES",
  "EDUCACIÓN PARA EL TRABAJO",
  "EDUCACIÓN FÍSICA",
  "COMUNICACIÓN",
  "ARTE Y CULTURA",
  "INGLÉS",
  "MATEMÁTICA",
  "CIENCIA Y TECNOLOGÍA",
  "EDUCACIÓN RELIGIOSA",
  "COMPETENCIAS TRANSVERSALES",
];

/* Cursos por nivel */
function cursosPorGrado(grado) {
  if ((grado || "").includes("Inicial")) {
    if ((grado || "").includes("3 Años")) return [...CURSOS_INICIAL_3];
    if ((grado || "").includes("4 Años")) return [...CURSOS_INICIAL_4];
    return [...CURSOS_INICIAL_5];
  }
  if ((grado || "").includes("Primaria")) return [...CURSOS_PRIMARIA];
  return [...CURSOS_SECUNDARIA];
}

function normalizeCourse(c) {
  const u = (c || "").toUpperCase();
  if (u.includes("TRANSVERS")) return "COMPETENCIAS TRANSVERSALES";
  if (u.includes("COMPUT")) return "COMPUTACIÓN";
  if (u.includes("MATEM")) return "MATEMÁTICA";
  if (u.includes("SOCIALES")) return "CIENCIAS SOCIALES";
  if (u.includes("CIENCIA")) return "CIENCIA Y TECNOLOGÍA";
  if (u.includes("COMUNIC")) return "COMUNICACIÓN";
  if (u === "ARTE" || (u.includes("ARTE") && !u.includes("CULTURA"))) return "ARTE";
  if (u.includes("ARTE")) return "ARTE Y CULTURA";
  if (u.includes("INGL")) return "INGLÉS";
  if (u.includes("RELIG")) return "EDUCACIÓN RELIGIOSA";
  if (u.includes("FÍSICA") || u.includes("FISICA")) return "EDUCACIÓN FÍSICA";
  if (u.includes("PERSONAL SOCIAL")) return "PERSONAL SOCIAL";
  if (u.includes("DESARROLLO PERSONAL") || u.includes("CIUDADAN") || u.includes("CÍVICA") || u.includes("CIVICA") || u.includes("DPCC")) {
    return "DESARROLLO PERSONAL, CIUDADANÍA Y CÍVICA";
  }
  if (u.includes("EPT") || u.includes("TRABAJO")) return "EDUCACIÓN PARA EL TRABAJO";
  if (u.includes("PSICOMOTR")) return "PSICOMOTRIZ";
  return c;
}

function competenciasKeyPorGrado(grado) {
  const g = grado || "";
  if (g.includes("3 Años")) return "inicial3";
  if (g.includes("4 Años")) return "inicial4";
  if (g.includes("5 Años")) return "inicial5";
  if (g.includes("Primaria")) return "primaria";
  return "secundaria";
}

function competenciasPorCurso(course, grado) {
  const key = competenciasKeyPorGrado(grado);
  const maps = {
    inicial3: COMP_INICIAL_3,
    inicial4: COMP_INICIAL_4,
    inicial5: COMP_INICIAL_5,
    primaria: COMP_PRIMARIA,
    secundaria: COMP_SECUNDARIA,
  };
  const selected = maps[key] || COMP_SECUNDARIA;
  const normalized = normalizeCourse(course);
  return selected[normalized] || selected[course] || COMP[normalized] || COMP[course] || [];
}

function talleresPorGrado(grado) {
  const g = grado || "";
  if (!g.includes("Inicial")) return [];
  if (g.includes("5 Años")) return ["INGLÉS", "ARTE", "COMPETENCIAS TRANSVERSALES"];
  return ["INGLÉS", "ARTE", "COMPUTACIÓN"];
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
  studentQuery: "",
  teacherQuery: "",

  /* Tutoría + Asistencia */
  homeroomTutors: [],
  tutorReports: [],
  attendance: [],
  auditLogs: [],
  generatedCredential: null,
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

function readLocalJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isSchemaColumnError(error) {
  const msg = String(error?.message || error || "").toLowerCase();
  return (
    msg.includes("column") ||
    msg.includes("schema cache") ||
    msg.includes("could not find") ||
    msg.includes("does not exist")
  );
}

function randomToken(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  if (crypto?.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

async function sha256Hex(text) {
  if (!crypto?.subtle) {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < text.length; i += 1) {
      const ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return `${(h2 >>> 0).toString(16).padStart(8, "0")}${(h1 >>> 0).toString(16).padStart(8, "0")}`;
  }
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function newSalt() {
  return randomToken(18);
}

async function hashPassword(password, salt) {
  return sha256Hex(`${salt}:${password}:kwc-academico-v2`);
}

async function makePasswordPayload(password, mustChange = true) {
  const salt = newSalt();
  return {
    password_hash: await hashPassword(password, salt),
    password_salt: salt,
    must_change_password: mustChange,
    password_updated_at: new Date().toISOString(),
    failed_attempts: 0,
    locked_until: null,
    status: "active",
  };
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "La contraseña debe combinar letras y números.";
  }
  return "";
}

function validatePersonName(name, label = "El nombre") {
  const clean = (name || "").trim().replace(/\s+/g, " ");
  if (clean.length < 5) return `${label} debe tener al menos 5 caracteres.`;
  if (!/[a-záéíóúñü]/i.test(clean)) return `${label} debe incluir letras.`;
  return "";
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function teacherEmailKey(email) {
  return String(email || "").trim().toLowerCase();
}

function getLocalTeacherCredentials() {
  return readLocalJson(LOCAL_TEACHER_CREDENTIALS_KEY, {});
}

function saveLocalTeacherCredential(email, payload) {
  const key = teacherEmailKey(email);
  if (!key) return;
  const all = getLocalTeacherCredentials();
  all[key] = {
    ...(all[key] || {}),
    ...payload,
    email: key,
    updated_at: new Date().toISOString(),
  };
  writeLocalJson(LOCAL_TEACHER_CREDENTIALS_KEY, all);
}

function mergeTeacherSecurity(teacher) {
  const local = getLocalTeacherCredentials()[teacherEmailKey(teacher?.email)] || {};
  return { ...teacher, ...local, assignments: teacher?.assignments || [] };
}

function isTeacherBlocked(teacher) {
  return String(teacher?.status || "active").toLowerCase() === "blocked";
}

function getActiveLock(teacher) {
  const lockedUntil = teacher?.locked_until ? new Date(teacher.locked_until) : null;
  return lockedUntil && !isNaN(lockedUntil.getTime()) && lockedUntil > new Date()
    ? lockedUntil
    : null;
}

async function verifyStoredPassword(password, profile) {
  if (!profile?.password_hash || !profile?.password_salt) return false;
  const hash = await hashPassword(password, profile.password_salt);
  return hash === profile.password_hash;
}

async function persistTeacherSecurity(teacher, updates) {
  const email = teacherEmailKey(teacher?.email);
  const payload = { ...updates, at: new Date().toISOString() };

  if (teacher?.id) {
    const up = await sb.from("users").update(payload).eq("id", teacher.id);
    if (!up.error) return { mode: "supabase" };
    if (!isSchemaColumnError(up.error)) return { error: up.error };
  }

  saveLocalTeacherCredential(email, payload);
  return { mode: "local" };
}

function localAuditRows() {
  return readLocalJson(LOCAL_AUDIT_KEY, []);
}

function pushLocalAudit(row) {
  const rows = [row, ...localAuditRows()].slice(0, 250);
  writeLocalJson(LOCAL_AUDIT_KEY, rows);
}

function getCombinedAuditRows() {
  const byKey = new Map();
  const add = (row) => {
    if (!row) return;
    const key = `${row.at || row.created_at || ""}-${row.action || ""}-${row.actor_email || ""}-${JSON.stringify(row.detail || {})}`;
    if (!byKey.has(key)) byKey.set(key, row);
  };
  (state.auditLogs || []).forEach(add);
  localAuditRows().forEach(add);
  return Array.from(byKey.values())
    .sort((a, b) => new Date(b.at || b.created_at || 0) - new Date(a.at || a.created_at || 0))
    .slice(0, 120);
}

async function recordAudit(action, detail = {}, actor = sessionUser) {
  const row = {
    action,
    actor_email: actor?.email || "sistema",
    actor_role: actor?.role || "system",
    detail,
    at: new Date().toISOString(),
  };

  pushLocalAudit(row);

  try {
    const res = await withTimeout(sb.from("audit_logs").insert([row]), "audit_logs", 3500);
    if (res?.error) console.warn("[KW] auditoría local:", res.error.message || res.error);
  } catch (err) {
    console.warn("[KW] auditoría local:", err?.message || err);
  }
}

async function getDirectorProfile() {
  const current = readLocalJson(DIRECTOR_PROFILE_KEY, null);
  if (current?.password_hash && current?.password_salt) return current;

  const salt = newSalt();
  const profile = {
    email: ADMIN_EMAIL.toLowerCase(),
    name: "Elizabeth Rojas",
    password_hash: await hashPassword(ADMIN_PASS, salt),
    password_salt: salt,
    must_change_password: true,
    created_at: new Date().toISOString(),
  };
  writeLocalJson(DIRECTOR_PROFILE_KEY, profile);
  return profile;
}

async function saveDirectorPassword(password) {
  const salt = newSalt();
  const current = await getDirectorProfile();
  const next = {
    ...current,
    password_hash: await hashPassword(password, salt),
    password_salt: salt,
    must_change_password: false,
    password_updated_at: new Date().toISOString(),
  };
  writeLocalJson(DIRECTOR_PROFILE_KEY, next);
  return next;
}

function auditDetailText(detail) {
  if (!detail) return "";
  if (typeof detail === "string") return detail;
  try {
    return Object.entries(detail)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
  } catch {
    return "";
  }
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

function tutorFinalStatusKey(studentId, grade, bimestre) {
  return [SCHOOL_YEAR, grade, studentId, bimestre].map((x) => String(x || "")).join("|");
}

function getLocalTutorFinalStatus(studentId, grade, bimestre) {
  const all = readLocalJson(LOCAL_TUTOR_FINAL_STATUS_KEY, {});
  return all[tutorFinalStatusKey(studentId, grade, bimestre)] || "";
}

function saveLocalTutorFinalStatus(studentId, grade, bimestre, value) {
  const all = readLocalJson(LOCAL_TUTOR_FINAL_STATUS_KEY, {});
  const key = tutorFinalStatusKey(studentId, grade, bimestre);
  if (value) {
    all[key] = value;
  } else {
    delete all[key];
  }
  writeLocalJson(LOCAL_TUTOR_FINAL_STATUS_KEY, all);
}

function getTutorFinalStatus(studentId, grade) {
  const order = ["IV BIMESTRE", "III BIMESTRE", "II BIMESTRE", "I BIMESTRE"];
  for (const bim of order) {
    const fromDb = getTutorField(studentId, grade, bim, "final_status", "");
    if (fromDb) return fromDb;
    const fromLocal = getLocalTutorFinalStatus(studentId, grade, bim);
    if (fromLocal) return fromLocal;
  }
  return "";
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
  await initSupabase();

  const [
    students,
    users,
    marks,
    settings,
    tutors,
    tutorReports,
    attendance,
    compd,
    auditLogs,
  ] = await Promise.all([
    safeQuery("students", sb.from("students").select("*").order("nombre", { ascending: true })),
    safeQuery("users", sb.from("users").select("*").order("name", { ascending: true })),
    safeQuery("marks", sb.from("marks").select("*")),
    safeQuery("settings", sb.from("settings").select("*").eq("key", "global").maybeSingle(), null),
    safeQuery("homeroom_tutors", sb.from("homeroom_tutors").select("*")),
    safeQuery("tutor_reports", sb.from("tutor_reports").select("*")),
    safeQuery("attendance", sb.from("attendance").select("*")),
    safeQuery("competency_desc", sb.from("competency_desc").select("*")),
    safeQuery("audit_logs", sb.from("audit_logs").select("*").order("at", { ascending: false }).limit(120)),
  ]);

  state.students = students.data || [];
  state.teachers = (users.data || []).map(mergeTeacherSecurity);
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
  state.auditLogs = auditLogs.data || [];
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
  $("logout-btn")?.addEventListener("click", async () => {
    await recordAudit("logout", { result: "ok" }, sessionUser);
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
    const profile = await getDirectorProfile();
    const ok = await verifyStoredPassword(pass, profile);

    if (!ok) {
      await recordAudit("login_failed", { email, role: "director", reason: "password" }, { email, role: "director" });
      $("login-error").textContent = "Contraseña administrativa incorrecta.";
      show("login-error");
      return;
    }

    sessionUser = {
      role: "director",
      name: profile.name || "Elizabeth Rojas",
      email,
      must_change_password: !!profile.must_change_password,
    };
    await recordAudit("login_ok", { email, role: "director" }, sessionUser);
    enterApp();
    return;
  }

  const teacherRaw = state.teachers.find((x) => (x.email || "").toLowerCase() === email);
  if (!teacherRaw) {
    await recordAudit("login_failed", { email, role: "teacher", reason: "not_enabled" }, { email, role: "teacher" });
    $("login-error").textContent = "Este correo no está habilitado como docente.";
    show("login-error");
    return;
  }

  const t = mergeTeacherSecurity(teacherRaw);
  if (isTeacherBlocked(t)) {
    await recordAudit("login_failed", { email, role: "teacher", reason: "blocked" }, { email, role: "teacher" });
    $("login-error").textContent = "Cuenta bloqueada por dirección. Comunícate con la directora.";
    show("login-error");
    return;
  }

  const activeLock = getActiveLock(t);
  if (activeLock) {
    await recordAudit("login_failed", { email, role: "teacher", reason: "temporary_lock" }, { email, role: "teacher" });
    $("login-error").textContent = `Cuenta bloqueada temporalmente hasta ${activeLock.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}.`;
    show("login-error");
    return;
  }

  if (!t.password_hash || !t.password_salt) {
    await recordAudit("login_failed", { email, role: "teacher", reason: "missing_password" }, { email, role: "teacher" });
    $("login-error").textContent = "Tu cuenta aún no tiene contraseña segura. Pide a la directora generar una clave nueva.";
    show("login-error");
    return;
  }

  const ok = await verifyStoredPassword(pass, t);
  if (!ok) {
    const failed = Number(t.failed_attempts || 0) + 1;
    const updates = { failed_attempts: failed };
    if (failed >= MAX_FAILED_ATTEMPTS) {
      updates.locked_until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
    }
    await persistTeacherSecurity(t, updates);
    await recordAudit("login_failed", {
      email,
      role: "teacher",
      reason: "password",
      failed_attempts: failed,
    }, { email, role: "teacher" });
    $("login-error").textContent =
      failed >= MAX_FAILED_ATTEMPTS
        ? `Demasiados intentos. Cuenta bloqueada por ${LOCK_MINUTES} minutos.`
        : `Contraseña incorrecta. Intento ${failed} de ${MAX_FAILED_ATTEMPTS}.`;
    show("login-error");
    await loadAll(true);
    return;
  }

  await persistTeacherSecurity(t, {
    failed_attempts: 0,
    locked_until: null,
    last_login_at: new Date().toISOString(),
  });

  sessionUser = {
    role: "teacher",
    name: t.name,
    email: t.email,
    assignments: Array.isArray(t.assignments) ? t.assignments : [],
    must_change_password: !!t.must_change_password,
  };

  await recordAudit("login_ok", { email, role: "teacher" }, sessionUser);
  enterApp();
}

function enterApp() {
  $("user-name").textContent = sessionUser.name;
  $("user-role").textContent =
    sessionUser.role === "director" ? "DIRECTOR" : "PROFESOR";
  if (sessionUser.must_change_password) state.tab = "cuenta";
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

  if (sessionUser?.must_change_password) state.tab = "cuenta";

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
      ${tabBtn("dashboard", "Panel")}
      ${tabBtn("matricula", "Matrícula")}
      ${tabBtn("docentes", "Docentes")}
      ${tabBtn("libreta", "Libreta / PDF")}
      ${tabBtn("config", "Configuración")}
      ${tabBtn("auditoria", "Auditoría")}
      ${tabBtn("cuenta", "Cuenta")}
    </div>
  `
      : `
    <div class="flex flex-wrap gap-4 mb-2">
      ${tabBtn("dashboard", "Mis cursos")}
      ${tabBtn("notas", "Notas")}
      ${tabBtn("asistencia", "Asistencia")}
      ${teacherIsTutor ? tabBtn("tutoria", "Tutoría") : ""}
      ${tabBtn("cuenta", "Cuenta")}
    </div>
  `;

  root.innerHTML = `
    ${tabs}
    ${
      sessionUser.must_change_password
        ? `<div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900 font-bold">
            Por seguridad, cambia tu contraseña temporal para continuar usando el sistema.
          </div>`
        : ``
    }
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
      ${state.tab === "auditoria" ? renderAuditoria() : ""}
      ${state.tab === "cuenta" ? renderCuenta() : ""}
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
    <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4">
      <div class="flex items-center justify-between gap-3">
        <div>
          <div class="text-slate-500 font-black text-xs tracking-widest uppercase">${escapeHtml(
            label
          )}</div>
          <div class="text-2xl font-black mt-1">${escapeHtml(value)}</div>
          <div class="text-slate-500 font-bold text-sm mt-1">${escapeHtml(
            sub
          )}</div>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-base font-black">
          ${icon}
        </div>
      </div>
    </div>
  `;
}
function statusPill(text, cls) {
  return `<div class="px-3 py-2 rounded-2xl ${cls} font-black text-xs tracking-widest uppercase">${text}</div>`;
}

/* MATRÍCULA */
function renderMatricula() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const q = (state.studentQuery || "").trim().toLowerCase();
  const list = state.students.filter((s) => (s.grado || "") === state.grade);
  const totalGrade = list.length;
  return `
    <div class="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-5">
      <div class="section-card bg-white p-5 lg:p-6">
        <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">Matrícula</p>
        <h3 class="text-lg font-black mt-1">Registrar alumno</h3>
        <form id="addStudentForm" class="mt-4 space-y-3">
          <input id="stName" class="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="Apellidos y nombres" required />
          <button class="no-print w-full py-3 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">Registrar</button>
        </form>
        <p class="text-slate-500 font-bold text-xs mt-3">Se registra en el grado seleccionado: <b>${escapeHtml(state.grade)}</b>.</p>
      </div>

      <div class="section-card bg-white p-5 lg:p-6">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">Alumnos</p>
            <h3 class="text-lg font-black mt-1">${escapeHtml(state.grade)}</h3>
            <p class="text-slate-500 font-bold text-sm">${totalGrade} alumno${totalGrade === 1 ? "" : "s"} registrado${totalGrade === 1 ? "" : "s"}.</p>
          </div>
          <input id="studentSearch" class="filter-input w-full md:w-72 px-4 py-3 bg-slate-50 border border-slate-200 font-bold"
            placeholder="Buscar alumno..." value="${escapeHtml(state.studentQuery || "")}" />
        </div>
        <div id="studentList" class="mt-4 space-y-2">
          ${
            list.length
              ? list
                  .map(
                    (s, idx) => {
                      const searchText = (s.nombre || "").toLowerCase();
                      return `
                <div class="compact-row student-row" data-student-search="${escapeHtml(searchText)}" ${q && !searchText.includes(q) ? `style="display:none"` : ``}>
                  <div class="flex min-w-0 items-center gap-3">
                    <span class="row-index">${idx + 1}</span>
                    <div class="min-w-0">
                      <div class="font-black truncate">${escapeHtml(s.nombre)}</div>
                      <div class="text-slate-500 font-bold text-xs">Matrícula activa</div>
                    </div>
                  </div>
                  <button class="no-print mini-btn bg-rose-600 text-white font-black tracking-widest uppercase"
                    data-del-st="${s.id}">Eliminar</button>
                </div>
              `;
                    }
                  )
                  .join("")
              : `<div class="empty-state">No se encontraron alumnos en este grado.</div>`
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

  const teacherQuery = (state.teacherQuery || "").trim().toLowerCase();
  const filteredTeachers = (state.teachers.length ? state.teachers : []).filter((tch) => {
    const haystack = [
      tch.name || "",
      tch.email || "",
      ...(Array.isArray(tch.assignments)
        ? tch.assignments.map((a) => `${a.course || ""} ${a.grade || ""}`)
        : []),
    ]
      .join(" ")
      .toLowerCase();
    return !teacherQuery || haystack.includes(teacherQuery);
  });

  const teacherCards = (state.teachers.length ? state.teachers : [])
    .map((tch) => {
      const assigns = Array.isArray(tch.assignments) ? tch.assignments : [];
      const secured = mergeTeacherSecurity(tch);
      const hasPassword = !!(secured.password_hash && secured.password_salt);
      const lockedUntil = getActiveLock(secured);
      const blocked = isTeacherBlocked(secured);
      const statusText = blocked
        ? "Bloqueado"
        : lockedUntil
        ? "Bloqueo temporal"
        : hasPassword
        ? "Activo"
        : "Requiere clave";
      const statusCls = blocked || lockedUntil
        ? "bg-rose-100 text-rose-700"
        : hasPassword
        ? "bg-emerald-100 text-emerald-700"
        : "bg-amber-100 text-amber-700";
      const searchValue = [
        tch.name || "",
        tch.email || "",
        ...assigns.map((a) => `${a.course || ""} ${a.grade || ""}`),
      ].join(" ").toLowerCase();
      const initials = (tch.name || "?")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join("")
        .toUpperCase();

      return `
      <div class="teacher-row" data-teacher-search="${escapeHtml(searchValue)}" ${teacherQuery && !searchValue.includes(teacherQuery) ? `style="display:none"` : ``}>
        <div class="teacher-main">
          <div class="flex min-w-0 gap-3">
            <span class="row-index">${escapeHtml(initials)}</span>
            <div class="min-w-0">
              <div class="teacher-name">${escapeHtml(tch.name)}</div>
              <div class="teacher-email">${escapeHtml(tch.email)}</div>
              <div class="mt-2 flex flex-wrap gap-2">
              <span class="px-3 py-1 rounded-full ${statusCls} font-black text-[11px] tracking-widest uppercase">${statusText}</span>
              ${
                secured.must_change_password
                  ? `<span class="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-black text-[11px] tracking-widest uppercase">Cambio pendiente</span>`
                  : ``
              }
              <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-black text-[11px] tracking-widest uppercase">${assigns.length} asignación${assigns.length === 1 ? "" : "es"}</span>
              </div>
            </div>
          </div>

          <div class="teacher-actions">
            <button class="no-print mini-btn bg-slate-900 text-white font-black uppercase"
              data-reset-password="${tch.id}">Clave temporal</button>
            <button class="no-print mini-btn ${blocked ? "bg-emerald-600" : "bg-amber-600"} text-white font-black uppercase"
              data-toggle-teacher="${tch.id}">${blocked ? "Activar" : "Bloquear"}</button>
            <button class="no-print mini-btn bg-rose-600 text-white font-black uppercase"
              data-del-teacher="${tch.id}">Eliminar</button>
          </div>
        </div>

        ${
          assigns.length
            ? `<div class="chip-list mt-3">
                ${assigns
                  .slice(0, 4)
                  .map((a) => `<span class="chip">${escapeHtml(a.course || "")} · ${escapeHtml(a.grade || "")}</span>`)
                  .join("")}
                ${assigns.length > 4 ? `<span class="chip">+${assigns.length - 4} más</span>` : ``}
              </div>`
            : `<div class="mt-3 text-slate-500 font-bold text-sm">Sin cursos asignados.</div>`
        }

        <details class="teacher-details">
          <summary>Gestionar asignaciones</summary>

          <div class="mt-2">
            ${
              assigns.length
                ? assigns
                    .map(
                      (a, idx) => `
                <div class="assignment-row">
                  <div class="font-bold text-sm min-w-0">
                    <span class="font-black">${escapeHtml(a.course || "")}</span>
                    <span class="text-slate-400"> · </span>
                    <span>${escapeHtml(a.grade || "")}</span>
                  </div>
                  <button class="no-print mini-btn bg-rose-600 text-white font-black uppercase"
                    data-del-assign="${tch.id}" data-assign-idx="${idx}">Quitar</button>
                </div>
              `
                    )
                    .join("")
                : `<p class="text-slate-500 font-bold text-sm py-2">Aún no tiene asignaciones.</p>`
            }
          </div>

          <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
            <select class="w-full px-3 py-2 rounded-2xl bg-white border border-slate-200 font-black"
              id="asg_course_${tch.id}">
              ${cursosPorGrado(state.grade)
                .map(
                  (c) =>
                    `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`
                )
                .join("")}
            </select>

            <select class="w-full px-3 py-2 rounded-2xl bg-white border border-slate-200 font-black"
              id="asg_grade_${tch.id}">
              ${gradeOptions}
            </select>

            <button class="no-print w-full mini-btn bg-blue-600 text-white font-black uppercase"
              data-add-assign="${tch.id}">
              Agregar
            </button>
          </div>

          <p class="text-slate-500 font-bold text-xs mt-2">
            Evita duplicar el mismo curso en el mismo grado.
          </p>
        </details>
      </div>
    `;
    })
    .join("");

  const tutorNow = getTutorNameForGrade(state.grade);

  return `
    <div class="grid grid-cols-1 xl:grid-cols-[410px_minmax(0,1fr)] gap-5">
      <div class="space-y-5">

        <div class="section-card bg-white p-5 lg:p-6">
          <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">Tutoría</p>
          <h3 class="text-lg font-black mt-1">Tutor del aula</h3>
          <p class="text-slate-500 font-bold text-sm mt-1">
            Año: <b>${SCHOOL_YEAR}</b> — Grado: <b>${escapeHtml(state.grade)}</b>
          </p>

          <div class="mt-4 grid grid-cols-1 gap-3">
            <div class="compact-card">
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Tutor asignado</div>
              <div class="text-base font-black mt-1">${escapeHtml(tutorNow)}</div>
            </div>

            <div class="compact-card">
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Asignar / cambiar</div>

              <select id="tutorTeacherSel" class="mt-2 w-full px-3 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                <option value="">Selecciona un docente</option>
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

        <div class="section-card bg-white p-5 lg:p-6">
          <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">Accesos</p>
          <h3 class="text-lg font-black mt-1">Nueva cuenta docente</h3>
          ${
            state.generatedCredential
              ? `<div class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                  <p class="font-black text-sm">Clave temporal generada</p>
                  <p class="mt-1 font-bold text-sm">${escapeHtml(state.generatedCredential.email)}</p>
                  <div class="mt-2 rounded-xl bg-white border border-emerald-200 px-4 py-3 font-black tracking-widest">${escapeHtml(state.generatedCredential.password)}</div>
                  <p class="mt-2 text-xs font-bold">Entrégala directamente al docente. El sistema pedirá cambiarla al iniciar sesión.</p>
                </div>`
              : ``
          }
          <form id="addTeacherForm" class="mt-4 space-y-3">
            <input id="tName" class="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="Nombre completo" required />
            <input id="tEmail" type="email" class="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="correo@wojtyla.edu.pe" required />
            <input id="tPass" type="text" autocomplete="off" class="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 font-bold" placeholder="Contraseña temporal (opcional)" />
            <button class="no-print w-full py-3 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">Crear acceso</button>
            <p class="text-slate-500 font-bold text-xs text-center">Si dejas la clave vacía, se genera una automática y se exige cambio al primer ingreso.</p>
          </form>
        </div>
      </div>

      <div class="section-card bg-white p-5 lg:p-6">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">Docentes</p>
            <h3 class="text-lg font-black mt-1">Cuentas y asignaciones</h3>
            <p class="text-slate-500 font-bold text-sm">${filteredTeachers.length} de ${state.teachers.length} docente${state.teachers.length === 1 ? "" : "s"}.</p>
          </div>
          <input id="teacherSearch" class="filter-input w-full md:w-80 px-4 py-3 bg-slate-50 border border-slate-200 font-bold"
            placeholder="Buscar por nombre, correo o curso..." value="${escapeHtml(state.teacherQuery || "")}" />
        </div>
        <div id="teacherList" class="mt-4 max-h-[620px] overflow-y-auto pr-1 space-y-2">
          ${teacherCards || `<div class="empty-state">No se encontraron docentes.</div>`}
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
  const comps = competenciasPorCurso(course, state.grade);
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

          <div class="mt-4 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3 items-end">
            <div>
              <div class="text-slate-500 font-black text-xs tracking-widest uppercase">Situación final</div>
              <select id="tr_final_status" class="mt-2 w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 font-black">
                ${["", "PRO", "RR", "PER"].map((x) => `<option value="${x}">${x || "Sin definir"}</option>`).join("")}
              </select>
            </div>
            <p class="text-slate-500 font-bold text-xs leading-relaxed">
              PRO: promovido de grado. RR: requiere recuperación. PER: permanencia en el grado.
            </p>
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

function renderCuenta() {
  const forced = !!sessionUser.must_change_password;
  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <p class="text-slate-500 font-black tracking-[0.25em] uppercase text-xs">Seguridad</p>
        <h3 class="text-xl font-black mt-2">Cambiar contraseña</h3>
        <p class="text-slate-500 font-bold text-sm mt-2">
          ${forced ? "Tu contraseña actual es temporal. Crea una nueva para continuar." : "Actualiza tu contraseña cuando lo necesites."}
        </p>

        <form id="changePasswordForm" class="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input id="currentPass" type="password" autocomplete="current-password"
            class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"
            placeholder="Contraseña actual" required />
          <input id="newPass" type="password" autocomplete="new-password"
            class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"
            placeholder="Nueva contraseña" required />
          <input id="newPass2" type="password" autocomplete="new-password"
            class="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold"
            placeholder="Confirmar contraseña" required />
          <button class="no-print md:col-span-3 w-full py-4 rounded-2xl bg-blue-600 text-white font-black tracking-widest uppercase text-xs shadow-xl">
            Guardar contraseña
          </button>
        </form>
      </div>

      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <p class="text-slate-500 font-black tracking-[0.25em] uppercase text-xs">Reglas</p>
        <h3 class="text-lg font-black mt-2">Buenas prácticas</h3>
        <ul class="elegant-list">
          <li>Usa mínimo 8 caracteres.</li>
          <li>Combina letras y números.</li>
          <li>No compartas claves temporales por chats abiertos.</li>
          <li>Cambia las claves temporales en el primer ingreso.</li>
        </ul>
      </div>
    </div>
  `;
}

function renderAuditoria() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const logs = getCombinedAuditRows();
  const failed = logs.filter((x) => x.action === "login_failed").length;
  const ok = logs.filter((x) => x.action === "login_ok").length;
  const security = logs.filter((x) =>
    ["teacher_password_reset", "password_changed", "teacher_status_changed"].includes(x.action)
  ).length;

  return `
    <div class="space-y-6">
      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <p class="text-slate-500 font-black tracking-[0.25em] uppercase text-xs">Auditoría</p>
        <h3 class="text-xl font-black mt-2">Bitácora del sistema</h3>
        <p class="text-slate-500 font-bold text-sm mt-2">
          Registra accesos, intentos fallidos, cambios de claves, matrícula, notas y configuración.
        </p>

        <div class="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          ${kpiCard("✓", "Ingresos correctos", ok, "Sesiones validadas")}
          ${kpiCard("!", "Intentos fallidos", failed, "Revisar si sube")}
          ${kpiCard("↻", "Seguridad", security, "Claves y estados")}
        </div>
      </div>

      <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
        <div class="overflow-auto">
          <table class="w-full min-w-[900px] border border-slate-200 rounded-2xl overflow-hidden">
            <thead class="bg-slate-50">
              <tr>
                <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Fecha</th>
                <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Acción</th>
                <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Usuario</th>
                <th class="p-3 text-left font-black text-xs tracking-widest uppercase border-b border-slate-200">Detalle</th>
              </tr>
            </thead>
            <tbody>
              ${
                logs.length
                  ? logs
                      .map((row) => {
                        const d = new Date(row.at || row.created_at || Date.now());
                        return `
                          <tr class="border-b border-slate-100">
                            <td class="p-3 font-bold">${escapeHtml(d.toLocaleString("es-PE"))}</td>
                            <td class="p-3 font-black">${escapeHtml(row.action || "")}</td>
                            <td class="p-3 text-slate-600 font-bold">${escapeHtml(row.actor_email || "")}</td>
                            <td class="p-3 text-slate-600 font-bold text-sm">${escapeHtml(auditDetailText(row.detail))}</td>
                          </tr>
                        `;
                      })
                      .join("")
                  : `<tr><td colspan="4" class="p-6 text-center text-slate-500 font-bold">Aún no hay registros de auditoría.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/* ====== REPORTE ====== */

function renderOfficialBottomBox(st, grade) {
  const bims = ["I BIMESTRE", "II BIMESTRE", "III BIMESTRE", "IV BIMESTRE"];
  const labels = ["I", "II", "III", "IV"];
  const finalStatus = getTutorFinalStatus(st.id, grade);
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
          <colgroup>
            <col>
            ${labels.map(() => `<col class="official-score-col">`).join("")}
          </colgroup>
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
          <colgroup>
            <col>
            ${labels.map(() => `<col class="official-score-col">`).join("")}
          </colgroup>
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

      <table class="official-scale-table">
        <colgroup>
          <col class="official-scale-code-col">
          <col class="official-scale-label-col">
          <col>
        </colgroup>
        <thead>
          <tr>
            <th colspan="2">ESCALA DE CALIFICACIÓN</th>
            <th>DESCRIPCIÓN</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="official-scale-code">AD</td>
            <td class="official-scale-label">Logro Destacado</td>
            <td class="official-scale-desc">Cuando el estudiante evidencia un nivel superior a lo esperado respecto de la competencia. Esto quiere decir que demuestra aprendizajes que van más allá del nivel esperado</td>
          </tr>
          <tr>
            <td class="official-scale-code">A</td>
            <td class="official-scale-label">Logro Esperado</td>
            <td class="official-scale-desc">Cuando el estudiante evidencia el nivel esperado respecto a la competencia, demostrando manejo satisfactorio en todas las tareas propuestas y en el tiempo programado</td>
          </tr>
          <tr>
            <td class="official-scale-code">B</td>
            <td class="official-scale-label">En Proceso</td>
            <td class="official-scale-desc">Cuando el estudiante está próximo o cerca al nivel esperado respecto a la competencia para lo cual requiere acompañamiento durante un tiempo razonable para lograrlo</td>
          </tr>
          <tr>
            <td class="official-scale-code">C</td>
            <td class="official-scale-label">En Inicio</td>
            <td class="official-scale-desc">Cuando el estudiante muestra un progreso mínimo en una competencia de acuerdo al nivel esperado. Evidencia con frecuencia dificultades en el desarrollo de las tareas por lo que necesita mayor tiempo de acompañamiento e intervención del docente</td>
          </tr>
        </tbody>
      </table>

      <div class="official-legal-note">
        (*) El presente informe de progreso o libreta de notas, no muestra las calificaciones que el estudiante obtuviera después del periodo de recuperación, siendo el periodo de recuperación posterior al término del año lectivo. (**) En los cursos talleres, el calificativo que figurará en el certificado oficial de estudio, lo determina el Sistema del Ministerio de Educación (SIAGIE).
      </div>

      <table class="official-final-status-table">
        <tr>
          <td class="official-final-title">Situación al finalizar el periodo lectivo</td>
          <td class="official-final-value">${escapeHtml(finalStatus)}</td>
          <td class="official-final-blank"></td>
        </tr>
      </table>
      <div class="official-final-legend">
        PRO (para promovido de grado), RR (para requiere recuperación), PER (para permanencia en el grado)
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

  const talleres = talleresPorGrado(grade);
  const cursosPrincipales = talleres.length
    ? cursos.filter((course) => !talleres.includes(normalizeCourse(course)))
    : cursos;

  const renderCourseRows = (courseList) =>
    courseList
      .map((course) => {
      const comps = competenciasPorCurso(course, grade);
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

  const mainRows = renderCourseRows(cursosPrincipales);
  const workshopRows = talleres.length ? renderCourseRows(talleres) : "";
  const workshopHeader = workshopRows
    ? `
      <tr class="report-section-header">
        <th>TALLERES</th>
        <th></th>
        <th class="report-bim">I</th>
        <th class="report-bim">II</th>
        <th class="report-bim">III</th>
        <th class="report-bim">IV</th>
        <th>CONCLUSIONES DESCRIPTIVAS</th>
        <th>NLA(*)</th>
      </tr>
    `
    : "";
  const reportRows = [mainRows, workshopHeader, workshopRows].filter(Boolean).join("");

  const insigniaSrc = "insignia-emblema.png";

  const tutorName = getTutorNameForGrade(grade);

  box.innerHTML = `
    <div class="report-sheet">
      <div class="report-header">
        <div class="report-insignia">
          <img src="${escapeHtml(insigniaSrc)}" alt="Insignia Karol Wojtyla College" onerror="this.style.display='none'">
        </div>
        <div class="report-heading">
          <div class="report-topline">"Año de la recuperación y consolidación de la economía peruana"</div>
          <div class="report-title">INFORME DE PROGRESO ACADÉMICO - ${SCHOOL_YEAR}</div>
        </div>
        <div class="report-header-spacer"></div>
      </div>

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
          <col class="col-area">
          <col class="col-comp">
          <col class="col-bim">
          <col class="col-bim">
          <col class="col-bim">
          <col class="col-bim">
          <col class="col-desc">
          <col class="col-nla">
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
          ${reportRows || `<tr><td colspan="8" style="text-align:center; padding:14px;">Sin datos todavía.</td></tr>`}
        </tbody>
      </table>

      <div style="margin-top:10px;">
        <table class="report-main report-comment-table">
          <colgroup>
            <col class="report-comment-col">
            <col>
          </colgroup>
          <thead>
            <tr><th colspan="2">COMENTARIO DEL TUTOR(A)</th></tr>
          </thead>
          <tbody>
            ${["I BIMESTRE","II BIMESTRE","III BIMESTRE","IV BIMESTRE"].map((bim,idx)=>{
              const label = ["I","II","III","IV"][idx];
              const comment = getTutorField(st.id, grade, bim, "comment", "");
              return `
                <tr>
                  <td class="report-comment-label">${label}</td>
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
  .report-header{ display:grid; grid-template-columns:14mm 1fr 14mm; align-items:center; gap:2mm; margin-bottom:2mm; }
  .report-insignia{ width:13mm; height:13mm; display:flex; align-items:center; justify-content:center; justify-self:start; }
  .report-insignia img{ width:100%; height:100%; object-fit:contain; display:block; }
  .report-heading{ min-width:0; text-align:center; }
  .report-header-spacer{ width:13mm; height:1px; justify-self:end; }
  .report-topline{ text-align:center; font-size:8.5px; margin:0 0 1mm; }
  .report-title{ text-align:center; font-weight:900; font-size:12px; margin:0; letter-spacing:.2px; }
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
  .report-section-header th{ background:#e5e7eb; text-align:center; font-weight:900; line-height:1.04; white-space:normal; vertical-align:middle; }
  .report-area{ width:20mm !important; font-weight:900; text-transform:uppercase; text-align:center; vertical-align:middle !important; font-size:6.7px; }
  .report-comp{ width:42mm !important; word-break:break-word; overflow-wrap:anywhere; }
  .report-bim{ width:6.5mm !important; min-width:6.5mm !important; max-width:6.5mm !important; text-align:center; font-weight:900; vertical-align:middle !important; padding:.6px !important; }
  .report-desc{ width:95mm !important; white-space:pre-wrap; word-break:break-word; overflow-wrap:anywhere; }
  .report-nla{ width:8mm !important; min-width:8mm !important; max-width:8mm !important; text-align:center; font-weight:900; vertical-align:middle !important; padding:.6px !important; }
  .report-comment-table{ margin-top:1.5mm; font-size:7.2px !important; }
  .report-comment-table col.report-comment-col{ width:10mm !important; }
  .report-comment-table th,.report-comment-table td{ padding:1.5px 2px !important; }
  .report-comment-label{ width:10mm !important; min-width:10mm !important; text-align:center; font-weight:900; white-space:nowrap; }
  .official-bottom-box{ margin-top:1.6mm; border:1px solid #000; break-inside:avoid; page-break-inside:avoid; }
  .official-bottom-title{ background:#e5e7eb; border-bottom:1px solid #000; text-align:center; font-weight:900; font-size:7.2px; padding:1.5px 3px; }
  .official-bottom-grid{ display:grid; grid-template-columns:1fr 1fr; gap:0; }
  .official-bottom-table{ font-size:6.65px; }
  .official-bottom-table col.official-score-col{ width:8mm; }
  .official-bottom-table:first-child{ border-right:1px solid #000; }
  .official-bottom-table th,.official-bottom-table td{ border:1px solid #000; padding:1.3px 1.8px; vertical-align:middle; }
  .official-bottom-table th{ background:#f1f5f9; text-align:center; font-weight:900; }
  .official-bottom-table th:first-child{ text-align:left; }
  .official-bottom-score{ width:8mm; min-width:8mm; text-align:center; font-weight:900; }
  .official-scale-table{ width:100%; border-collapse:collapse; table-layout:fixed; border-top:1px solid #000; font-size:5.7px; line-height:1.02; }
  .official-scale-table col.official-scale-code-col{ width:6.5mm; }
  .official-scale-table col.official-scale-label-col{ width:30mm; }
  .official-scale-table th,.official-scale-table td{ border:1px solid #000; padding:1px 1.6px; vertical-align:middle; }
  .official-scale-table th{ background:#cfcfcf; text-align:center; font-weight:900; font-size:6.4px; }
  .official-scale-code{ text-align:center; font-weight:700; }
  .official-scale-label{ font-size:7.1px; font-weight:400; }
  .official-scale-desc{ font-size:5.45px; line-height:1.05; }
  .official-legal-note{ border-top:1px solid #000; padding:1.6px 2.5px; font-size:5.9px; line-height:1.05; }
  .official-final-status-table{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:7px; }
  .official-final-status-table td{ border:1px solid #000; padding:3px 4px; vertical-align:middle; }
  .official-final-title{ width:42%; text-align:center; font-weight:900; font-size:9.5px; }
  .official-final-value{ width:9%; text-align:center; font-weight:900; font-size:9.5px; }
  .official-final-blank{ width:49%; }
  .official-final-legend{ font-size:5.9px; line-height:1.05; padding:1.4px 2.5px 2px; }
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
    if ($("tr_final_status")) {
      $("tr_final_status").value = r?.final_status || getLocalTutorFinalStatus(studentId, grade, b) || "";
    }
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

document.addEventListener("submit", (ev) => {
  if (
    ["addStudentForm", "addTeacherForm", "changePasswordForm"].includes(
      ev.target?.id || ""
    )
  ) {
    ev.preventDefault();
  }
});

document.addEventListener("input", (ev) => {
  if (ev.target?.id === "studentSearch") {
    const q = (ev.target.value || "").trim().toLowerCase();
    state.studentQuery = ev.target.value || "";
    document.querySelectorAll(".student-row").forEach((row) => {
      const text = row.getAttribute("data-student-search") || "";
      row.style.display = !q || text.includes(q) ? "" : "none";
    });
  }

  if (ev.target?.id === "teacherSearch") {
    const q = (ev.target.value || "").trim().toLowerCase();
    state.teacherQuery = ev.target.value || "";
    document.querySelectorAll(".teacher-row").forEach((row) => {
      const text = row.getAttribute("data-teacher-search") || "";
      row.style.display = !q || text.includes(q) ? "" : "none";
    });
  }
});

document.addEventListener("click", async (ev) => {
  const t = ev.target;

  if (t?.id === "btnPrint") {
    printCurrentReport();
    return;
  }

  if (t?.closest("#changePasswordForm") && t.tagName === "BUTTON") {
    ev.preventDefault();
    const currentPass = ($("currentPass")?.value || "").trim();
    const newPass = ($("newPass")?.value || "").trim();
    const newPass2 = ($("newPass2")?.value || "").trim();

    if (!currentPass || !newPass || !newPass2) return toast("Completa las tres contraseñas.", "err");
    if (newPass !== newPass2) return toast("La nueva contraseña no coincide.", "err");
    if (currentPass === newPass) return toast("La nueva contraseña debe ser diferente a la actual.", "err");
    const passError = validatePassword(newPass);
    if (passError) return toast(passError, "err");

    if (sessionUser.role === "director") {
      const profile = await getDirectorProfile();
      const ok = await verifyStoredPassword(currentPass, profile);
      if (!ok) {
        await recordAudit("password_change_failed", { role: "director", reason: "current_password" });
        return toast("Contraseña actual incorrecta.", "err");
      }
      await saveDirectorPassword(newPass);
      sessionUser.must_change_password = false;
      await recordAudit("password_changed", { role: "director" });
      toast("Contraseña actualizada");
      render();
      return;
    }

    const teacher = state.teachers.find(
      (x) => (x.email || "").toLowerCase() === (sessionUser.email || "").toLowerCase()
    );
    if (!teacher) return toast("No se encontró tu cuenta.", "err");

    const secured = mergeTeacherSecurity(teacher);
    const ok = await verifyStoredPassword(currentPass, secured);
    if (!ok) {
      await recordAudit("password_change_failed", { role: "teacher", email: sessionUser.email, reason: "current_password" });
      return toast("Contraseña actual incorrecta.", "err");
    }

    const payload = await makePasswordPayload(newPass, false);
    const result = await persistTeacherSecurity(secured, payload);
    if (result.error) return toast(result.error.message || "No se pudo guardar.", "err");

    sessionUser.must_change_password = false;
    await recordAudit("password_changed", {
      role: "teacher",
      email: sessionUser.email,
      credential_mode: result.mode || "supabase",
    });
    await loadAll(true);
    toast("Contraseña actualizada");
    render();
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
    await recordAudit("settings_updated", { bimestre: b, locked });
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
    const finalStatus = $("tr_final_status")?.value || "";

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
      final_status: finalStatus,

      updated_by: sessionUser.email,
      at: new Date().toISOString(),
    };

    saveLocalTutorFinalStatus(studentId, grade, bimestre, finalStatus);

    let up = await sb.from("tutor_reports").upsert([payload], {
      onConflict: "student_id,grade,year,bimestre",
    });
    if (up.error && isSchemaColumnError(up.error)) {
      const { final_status, ...compatiblePayload } = payload;
      up = await sb.from("tutor_reports").upsert([compatiblePayload], {
        onConflict: "student_id,grade,year,bimestre",
      });
    }
    if (up.error) return toast(up.error.message, "err");

    await recordAudit("tutor_report_saved", { student_id: studentId, grade, bimestre });
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

    await recordAudit("attendance_saved", { date: dateISO, grade, course, students: rows.length });
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
    const nombre = ($("stName")?.value || "").trim().replace(/\s+/g, " ");
    if (!nombre) return;
    const nameError = validatePersonName(nombre, "El nombre del alumno");
    if (nameError) return toast(nameError, "err");
    const duplicate = state.students.some(
      (s) =>
        (s.grado || "") === state.grade &&
        (s.nombre || "").trim().toLowerCase() === nombre.toLowerCase()
    );
    if (duplicate) return toast("Este alumno ya está registrado en el grado seleccionado.", "err");

    const res = await sb.from("students").insert([
      { nombre, grado: state.grade, at: new Date().toISOString() },
    ]);
    if (res.error) return toast(res.error.message, "err");

    $("stName").value = "";
    await recordAudit("student_created", { nombre, grade: state.grade });
    await loadAll(true);
    toast("Alumno registrado");
    render();
    return;
  }

  /* Eliminar alumno */
  if (t?.dataset?.delSt) {
    const id = t.dataset.delSt;
    const student = state.students.find((x) => String(x.id) === String(id));
    const res = await sb.from("students").delete().eq("id", id);
    if (res.error) return toast(res.error.message, "err");
    await recordAudit("student_deleted", { student_id: id, nombre: student?.nombre || "" });
    await loadAll(true);
    toast("Alumno eliminado");
    render();
    return;
  }

  /* Crear docente */
  if (t?.closest("#addTeacherForm") && t.tagName === "BUTTON") {
    ev.preventDefault();
    const name = ($("tName")?.value || "").trim().replace(/\s+/g, " ");
    const email = ($("tEmail")?.value || "").trim().toLowerCase();
    const manualPass = ($("tPass")?.value || "").trim();
    if (!name || !email) return;
    const nameError = validatePersonName(name, "El nombre del docente");
    if (nameError) return toast(nameError, "err");
    if (!isValidEmail(email)) return toast("Ingresa un correo válido para el docente.", "err");

    const exists = state.teachers.some(
      (u) => (u.email || "").toLowerCase() === email
    );
    if (exists) return toast("Ya existe un docente con ese correo.", "err");

    const tempPassword = manualPass || randomToken(12);
    const passError = validatePassword(tempPassword);
    if (passError) return toast(passError, "err");

    const security = await makePasswordPayload(tempPassword, true);
    let res = await sb.from("users").insert([
      {
        name,
        email,
        role: "teacher",
        assignments: [],
        ...security,
        at: new Date().toISOString(),
      },
    ]);

    let mode = "supabase";
    if (res.error && isSchemaColumnError(res.error)) {
      res = await sb.from("users").insert([
        { name, email, role: "teacher", assignments: [], at: new Date().toISOString() },
      ]);
      if (!res.error) {
        saveLocalTeacherCredential(email, security);
        mode = "local";
      }
    }

    if (res.error) return toast(res.error.message, "err");

    $("tName").value = "";
    $("tEmail").value = "";
    if ($("tPass")) $("tPass").value = "";
    state.generatedCredential = { email, password: tempPassword, mode };
    await recordAudit("teacher_created", { email, name, credential_mode: mode });
    toast("Docente creado");

    await loadAll(true);
    render();
    return;
  }

  /* Eliminar docente */
  if (t?.dataset?.delTeacher) {
    const id = t.dataset.delTeacher;
    const teacher = state.teachers.find((x) => String(x.id) === String(id));
    const res = await sb.from("users").delete().eq("id", id);
    if (res.error) return toast(res.error.message, "err");
    await recordAudit("teacher_deleted", { email: teacher?.email || id });
    await loadAll(true);
    toast("Docente eliminado");
    render();
    return;
  }

  if (t?.dataset?.resetPassword) {
    const id = t.dataset.resetPassword;
    const teacher = state.teachers.find((x) => String(x.id) === String(id));
    if (!teacher) return toast("Docente no encontrado.", "err");

    const tempPassword = randomToken(12);
    const security = await makePasswordPayload(tempPassword, true);
    const result = await persistTeacherSecurity(teacher, security);
    if (result.error) return toast(result.error.message || "No se pudo resetear.", "err");

    state.generatedCredential = {
      email: teacher.email,
      password: tempPassword,
      mode: result.mode || "supabase",
    };
    await recordAudit("teacher_password_reset", {
      email: teacher.email,
      credential_mode: result.mode || "supabase",
    });
    await loadAll(true);
    toast("Clave temporal generada");
    render();
    return;
  }

  if (t?.dataset?.toggleTeacher) {
    const id = t.dataset.toggleTeacher;
    const teacher = state.teachers.find((x) => String(x.id) === String(id));
    if (!teacher) return toast("Docente no encontrado.", "err");

    const nextStatus = isTeacherBlocked(teacher) ? "active" : "blocked";
    const result = await persistTeacherSecurity(teacher, {
      status: nextStatus,
      failed_attempts: 0,
      locked_until: null,
    });
    if (result.error) return toast(result.error.message || "No se pudo actualizar.", "err");

    await recordAudit("teacher_status_changed", {
      email: teacher.email,
      status: nextStatus,
      credential_mode: result.mode || "supabase",
    });
    await loadAll(true);
    toast(nextStatus === "active" ? "Docente activado" : "Docente bloqueado");
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

    await recordAudit("teacher_assignment_added", { email: teacher.email, grade: g, course: c });
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
    const removed = assigns[idx] || null;
    assigns.splice(idx, 1);

    const up = await sb
      .from("users")
      .update({ assignments: assigns, at: new Date().toISOString() })
      .eq("id", teacherId);
    if (up.error) return toast(up.error.message, "err");

    await recordAudit("teacher_assignment_removed", { email: teacher.email, grade: removed?.grade || "", course: removed?.course || "" });
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
    const comps = competenciasPorCurso(course, grade);

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

    await recordAudit("marks_saved", { student_id: studentId, grade, course, bimestre, competencies: comps.length });
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

    await recordAudit("homeroom_tutor_saved", { grade: state.grade, teacher_email: teacher.email });
    await loadAll(true);
    toast("Tutor asignado");
    render();
    return;
  }
});
