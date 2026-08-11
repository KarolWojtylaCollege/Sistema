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

/* Seguridad: no se deja ninguna clave administrativa fija en el código. */
const DIRECTOR_PROFILE_KEY = "kwc_director_profile_v3";
const LOCAL_TEACHER_CREDENTIALS_KEY = "kwc_teacher_credentials_v2";
const LOCAL_AUDIT_KEY = "kwc_audit_logs_v2";
const LOCAL_TUTOR_FINAL_STATUS_KEY = "kwc_tutor_final_status_v1";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const OFFICIAL_YEAR_PHRASE = "Año de la esperanza y fortalecimiento de la democracia";
const DIRECTOR_DISPLAY_NAME = "Maria E. Rojas Castañeda";
const MAX_COMMENT_CHARS = 350;
const MAX_TUTOR_COMMENT_CHARS = MAX_COMMENT_CHARS;
const BIMESTRES = ["I BIMESTRE", "II BIMESTRE", "III BIMESTRE", "IV BIMESTRE"];

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
const LEVEL_POINTS = { C: 1, B: 2, A: 3, AD: 4 };
const LEVEL_LABELS = {
  AD: "Logro destacado",
  A: "Logro esperado",
  B: "En proceso",
  C: "En inicio",
};

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
  reportBimestre: "",
  reportCourse: "",
  editorStudentId: "",
  editorCourse: "",
  editorBimestre: "",
  reportCardStudentId: "",
  reportCardBimestre: "",
  studentReportStudentId: "",
  studentReportBimestre: "",

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

const AUTOCORRECT_WORDS = {
  academico: "académico",
  academica: "académica",
  actividades: "actividades",
  ademas: "además",
  analisis: "análisis",
  acompanamiento: "acompañamiento",
  acompanado: "acompañado",
  acompanada: "acompañada",
  area: "área",
  areas: "áreas",
  atencion: "atención",
  autonomia: "autonomía",
  automia: "autonomía",
  basico: "básico",
  basica: "básica",
  bimestre: "bimestre",
  calificacion: "calificación",
  calificaciones: "calificaciones",
  caracteristicas: "características",
  cientifico: "científico",
  cientificos: "científicos",
  comprension: "comprensión",
  comunicacion: "comunicación",
  coordinacion: "coordinación",
  creatividad: "creatividad",
  critico: "crítico",
  critica: "crítica",
  desempeno: "desempeño",
  desempenarse: "desempeñarse",
  desempena: "desempeña",
  demas: "demás",
  demostro: "demostró",
  demostracion: "demostración",
  desmostrando: "demostrando",
  dialogo: "diálogo",
  dificiles: "difíciles",
  dificultad: "dificultad",
  dificultades: "dificultades",
  educacion: "educación",
  emocion: "emoción",
  emocional: "emocional",
  empeno: "empeño",
  expreso: "expresó",
  expresion: "expresión",
  estan: "están",
  evaluacion: "evaluación",
  evidencio: "evidenció",
  habito: "hábito",
  habitos: "hábitos",
  identifico: "identificó",
  interes: "interés",
  ingles: "inglés",
  intervencion: "intervención",
  logro: "logro",
  logroesperado: "logro esperado",
  logrodestacado: "logro destacado",
  matematicas: "matemáticas",
  matematica: "matemática",
  mas: "más",
  metodos: "métodos",
  minimo: "mínimo",
  motricidad: "motricidad",
  nino: "niño",
  nina: "niña",
  observacion: "observación",
  participacion: "participación",
  pedagogico: "pedagógico",
  pedagogica: "pedagógica",
  periodo: "período",
  practica: "práctica",
  practicas: "prácticas",
  produccion: "producción",
  proposito: "propósito",
  proximo: "próximo",
  proxima: "próxima",
  recuperacion: "recuperación",
  reforzamiento: "reforzamiento",
  relacion: "relación",
  resolucion: "resolución",
  responsabilidad: "responsabilidad",
  segun: "según",
  simbolos: "símbolos",
  tambien: "también",
  tecnologia: "tecnología",
  teorico: "teórico",
  teorica: "teórica",
};

function keepReplacementCase(source, replacement) {
  return /^[A-ZÁÉÍÓÚÑ]/.test(source)
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

function autocorrectDescriptionText(text) {
  let clean = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([,.;:!?])(?=\S)/g, "$1 ")
    .replace(/([.!?]){2,}/g, "$1")
    .trim();

  Object.entries(AUTOCORRECT_WORDS).forEach(([bad, good]) => {
    const re = new RegExp(`\\b${bad}\\b`, "gi");
    clean = clean.replace(re, (match) => keepReplacementCase(match, good));
  });

  clean = clean
    .replace(/\besta\s+(en|muy|más|mas|logrando|desarrollando)\b/gi, (match) =>
      keepReplacementCase(match, match.replace(/^esta/i, "está"))
    )
    .replace(/\besta\s+(próximo|próxima|cerca|pendiente|mejorando)\b/gi, (match) =>
      keepReplacementCase(match, match.replace(/^esta/i, "está"))
    )
    .replace(/\bcontinua\s+(mejorando|desarrollando|fortaleciendo|avanzando|participando)\b/gi, (match) =>
      keepReplacementCase(match, match.replace(/^continua/i, "continúa"))
    )
    .replace(/\bel\s+[áa]rea\b/gi, (match) => keepReplacementCase(match, "el área"))
    .replace(/\bla\s+[áa]rea\b/gi, (match) => keepReplacementCase(match, "el área"))
    .replace(/\blos\s+actividad(es)?\b/gi, (match) => keepReplacementCase(match, "las actividades"))
    .replace(/\bla\s+problema\b/gi, (match) => keepReplacementCase(match, "el problema"))
    .replace(/\bel\s+dificultad\b/gi, (match) => keepReplacementCase(match, "la dificultad"))
    .replace(/\bdebe\s+mejorar\s+en\s+su\s+responsabilidad\b/gi, (match) =>
      keepReplacementCase(match, "Debe fortalecer su responsabilidad")
    )
    .replace(/\bnecesita\s+mas\b/gi, (match) => keepReplacementCase(match, "necesita más"))
    .replace(/\bpoco\s+a\s+poco\b/gi, (match) => keepReplacementCase(match, "progresivamente"))
    .replace(/\bcon\s+apoyo\s+del\s+docente\b/gi, (match) => keepReplacementCase(match, "con acompañamiento del docente"))
    .replace(/\bse\s+recomienda\s+que\s+practique\b/gi, (match) => keepReplacementCase(match, "Se recomienda que practique"))
    .replace(/\bmatemática\s+y\s+comunicación\b/gi, (match) => keepReplacementCase(match, "Matemática y Comunicación"))
    .replace(/\bpor\s+si\s+mism([oa]s?)\b/gi, (match) => keepReplacementCase(match, match.replace(/\bsi\b/i, "sí")))
    .replace(/\ben\s+si\b/gi, (match) => keepReplacementCase(match, "en sí"));

  clean = clean.replace(/(^|[.!?]\s+)([a-záéíóúñ])/g, (_, start, letter) => {
    return `${start}${letter.toUpperCase()}`;
  });

  if (clean && !/[.!?]$/.test(clean)) clean += ".";

  return clean;
}

function limitCommentText(text) {
  return autocorrectDescriptionText(text).slice(0, MAX_COMMENT_CHARS);
}

function limitTutorComment(text) {
  return limitCommentText(text);
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

function accountRole(user) {
  return String(user?.role || "teacher").trim().toLowerCase();
}

function isDirectorAccount(user) {
  return accountRole(user) === "director";
}

function isTeacherAccount(user) {
  return !isDirectorAccount(user);
}

function activeTeacherUsers() {
  return (state.teachers || []).filter(isTeacherAccount);
}

function isTeacherBlocked(account) {
  return String(account?.status || "active").toLowerCase() === "blocked";
}

function getActiveLock(account) {
  const lockedUntil = account?.locked_until ? new Date(account.locked_until) : null;
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

function getLocalDirectorProfile() {
  const current = readLocalJson(DIRECTOR_PROFILE_KEY, null);
  if (!current?.email || !current?.password_hash || !current?.password_salt) return null;
  if (current.must_change_password && !current.password_updated_at) return null;
  return {
    ...current,
    email: teacherEmailKey(current.email),
    role: "director",
    assignments: [],
  };
}

function saveLocalDirectorProfile(profile) {
  if (!profile?.email) return;
  writeLocalJson(DIRECTOR_PROFILE_KEY, {
    ...profile,
    email: teacherEmailKey(profile.email),
    role: "director",
    assignments: [],
    updated_at: new Date().toISOString(),
  });
}

function getDirectorAccount(email = "") {
  const key = teacherEmailKey(email);
  const local = getLocalDirectorProfile();
  const fromDb = (state.teachers || []).find(
    (x) => isDirectorAccount(x) && (!key || teacherEmailKey(x.email) === key)
  );
  if (fromDb) {
    const sameLocal =
      local && teacherEmailKey(local.email) === teacherEmailKey(fromDb.email);
    return {
      ...(sameLocal ? local : {}),
      ...fromDb,
      ...(sameLocal && !fromDb.password_hash ? { password_hash: local.password_hash } : {}),
      ...(sameLocal && !fromDb.password_salt ? { password_salt: local.password_salt } : {}),
      ...(sameLocal && fromDb.must_change_password == null ? { must_change_password: local.must_change_password } : {}),
      role: "director",
      assignments: [],
    };
  }

  if (local && (!key || teacherEmailKey(local.email) === key)) return local;
  return null;
}

function hasDirectorAccount() {
  const account = getDirectorAccount();
  return !!(account?.password_hash && account?.password_salt);
}

async function persistDirectorSecurity(account, updates) {
  const email = teacherEmailKey(account?.email);
  const payload = { ...updates, at: new Date().toISOString() };

  if (account?.id) {
    const up = await sb.from("users").update(payload).eq("id", account.id);
    if (!up.error) return { mode: "supabase" };
    if (!isSchemaColumnError(up.error)) return { error: up.error };
  }

  saveLocalDirectorProfile({
    ...(getLocalDirectorProfile() || {}),
    ...account,
    ...payload,
    email,
    name: account?.name || "Dirección",
  });
  return { mode: "local" };
}

async function saveDirectorPassword(password) {
  const account = getDirectorAccount(sessionUser?.email);
  if (!account) return { error: { message: "No se encontró la cuenta de dirección." } };
  const payload = await makePasswordPayload(password, false);
  return persistDirectorSecurity(account, payload);
}

async function createDirectorAccount({ name, email, password }) {
  const security = await makePasswordPayload(password, false);
  const profile = {
    name,
    email: teacherEmailKey(email),
    role: "director",
    assignments: [],
    ...security,
    at: new Date().toISOString(),
  };

  const existing = getDirectorAccount(profile.email);
  if (existing) {
    const result = await persistDirectorSecurity(
      { ...existing, name: existing.name || name },
      { ...security, name, email: profile.email, role: "director", assignments: [] }
    );
    if (!result.error) return result;
    saveLocalDirectorProfile(profile);
    return { mode: "local", warning: result.error.message };
  }

  let res = await sb.from("users").insert([profile]);
  if (!res.error) return { mode: "supabase" };

  if (isSchemaColumnError(res.error)) {
    const compatible = {
      name: profile.name,
      email: profile.email,
      role: "director",
      assignments: [],
      at: profile.at,
    };
    res = await sb.from("users").insert([compatible]);
    saveLocalDirectorProfile(profile);
    if (!res.error) return { mode: "local", warning: "La seguridad se guardó localmente porque faltan columnas en Supabase." };
  }

  saveLocalDirectorProfile(profile);
  return { mode: "local", warning: res.error?.message || "Supabase no disponible." };
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

function finalStatusMeaning(code) {
  return {
    PRO: "Promovido de grado",
    RR: "Requiere recuperación",
    PER: "Permanencia en el grado",
  }[String(code || "").trim().toUpperCase()] || "";
}

function teacherVisibleGrades(user = sessionUser) {
  if (!user || user.role !== "teacher") return [];
  const grades = new Set();
  (Array.isArray(user.assignments) ? user.assignments : []).forEach((a) => {
    if (a?.grade) grades.add(a.grade);
  });
  (state.homeroomTutors || []).forEach((row) => {
    const sameEmail =
      row.teacher_email &&
      (row.teacher_email || "").toLowerCase() === (user.email || "").toLowerCase();
    const sameId =
      row.teacher_id &&
      activeTeacherUsers().some(
        (t) =>
          String(t.id) === String(row.teacher_id) &&
          (t.email || "").toLowerCase() === (user.email || "").toLowerCase()
      );
    if ((sameEmail || sameId) && row.grade) grades.add(row.grade);
  });
  return Array.from(grades);
}

function visibleStudentsForRole(grade = state.grade) {
  if (sessionUser?.role === "director") {
    return (state.students || []).filter((s) => !grade || (s.grado || "") === grade);
  }
  const allowed = teacherVisibleGrades();
  return (state.students || []).filter(
    (s) =>
      allowed.includes(s.grado || "") &&
      (!grade || (s.grado || "") === grade)
  );
}

function ensureVisibleGradeForTeacher() {
  if (sessionUser?.role !== "teacher") return true;
  const allowed = teacherVisibleGrades();
  if (!allowed.length) return false;
  if (!allowed.includes(state.grade)) state.grade = allowed[0];
  return true;
}

function bimestreOptions(selected) {
  return BIMESTRES.map(
    (x) => `<option value="${x}" ${x === selected ? "selected" : ""}>${x}</option>`
  ).join("");
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
  $("director-setup-btn")?.addEventListener("click", handleDirectorSetup);
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
    refreshDirectorSetupPanel();
  } catch (err) {
    console.warn("[KW] Modo seguro:", err?.message || err);
    toast("Sistema iniciado. Si faltan datos, revisa Supabase.", "err");
    refreshDirectorSetupPanel();
  }
});

/* LOGIN */
function setDirectorSetupMessage(message, type = "ok") {
  const el = $("director-setup-msg");
  if (!el) return;
  el.textContent = message || "";
  el.className =
    "text-xs font-black text-center " +
    (type === "err" ? "text-rose-600" : "text-blue-700");
  if (message) el.classList.remove("hidden");
  else el.classList.add("hidden");
}

function refreshDirectorSetupPanel() {
  const panel = $("director-setup-panel");
  if (!panel) return;
  panel.classList.toggle("hidden", hasDirectorAccount());
}

async function handleDirectorSetup() {
  hide("login-error");
  setDirectorSetupMessage("");
  await loadAll(false);

  if (hasDirectorAccount()) {
    refreshDirectorSetupPanel();
    return toast("La cuenta de Dirección ya está configurada.");
  }

  const name = ($("director-name")?.value || "").trim().replace(/\s+/g, " ");
  const email = ($("director-email")?.value || "").trim().toLowerCase();
  const pass = ($("director-pass")?.value || "").trim();
  const pass2 = ($("director-pass2")?.value || "").trim();

  const nameError = validatePersonName(name, "El nombre de Dirección");
  if (nameError) return setDirectorSetupMessage(nameError, "err");
  if (!isValidEmail(email)) return setDirectorSetupMessage("Ingresa un correo válido.", "err");
  if (activeTeacherUsers().some((u) => teacherEmailKey(u.email) === email)) {
    return setDirectorSetupMessage("Ese correo ya está registrado como docente.", "err");
  }
  if (pass !== pass2) return setDirectorSetupMessage("Las contraseñas no coinciden.", "err");
  const passError = validatePassword(pass);
  if (passError) return setDirectorSetupMessage(passError, "err");

  const result = await createDirectorAccount({ name, email, password: pass });
  await recordAudit("director_created", {
    email,
    credential_mode: result.mode,
    warning: result.warning || "",
  }, { email, role: "director" });

  await loadAll(true);
  refreshDirectorSetupPanel();
  setDirectorSetupMessage(
    result.warning
      ? "Cuenta creada. Revisa Supabase para activar columnas de seguridad."
      : "Cuenta de Dirección creada. Ya puedes iniciar sesión."
  );
  toast("Acceso de Dirección creado");
}

async function handleLogin(e) {
  e.preventDefault();
  hide("login-error");

  await loadAll(false);
  refreshDirectorSetupPanel();

  const email = ($("email-input")?.value || "").trim().toLowerCase();
  const pass = ($("pass-input")?.value || "").trim();

  if (!email || !pass) {
    $("login-error").textContent = "Completa correo y contraseña.";
    show("login-error");
    return;
  }

  const directorRaw = getDirectorAccount(email);
  if (directorRaw) {
    const profile = { ...directorRaw, role: "director" };

    if (isTeacherBlocked(profile)) {
      await recordAudit("login_failed", { email, role: "director", reason: "blocked" }, { email, role: "director" });
      $("login-error").textContent = "Cuenta de Dirección bloqueada.";
      show("login-error");
      return;
    }

    const activeLock = getActiveLock(profile);
    if (activeLock) {
      await recordAudit("login_failed", { email, role: "director", reason: "temporary_lock" }, { email, role: "director" });
      $("login-error").textContent = `Cuenta bloqueada temporalmente hasta ${activeLock.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}.`;
      show("login-error");
      return;
    }

    if (!profile.password_hash || !profile.password_salt) {
      await recordAudit("login_failed", { email, role: "director", reason: "missing_password" }, { email, role: "director" });
      $("login-error").textContent = "La cuenta de Dirección no tiene contraseña segura configurada.";
      show("login-error");
      return;
    }

    const ok = await verifyStoredPassword(pass, profile);

    if (!ok) {
      const failed = Number(profile.failed_attempts || 0) + 1;
      const updates = { failed_attempts: failed };
      if (failed >= MAX_FAILED_ATTEMPTS) {
        updates.locked_until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000).toISOString();
      }
      await persistDirectorSecurity(profile, updates);
      await recordAudit("login_failed", { email, role: "director", reason: "password" }, { email, role: "director" });
      $("login-error").textContent =
        failed >= MAX_FAILED_ATTEMPTS
          ? `Demasiados intentos. Cuenta bloqueada por ${LOCK_MINUTES} minutos.`
          : `Contraseña incorrecta. Intento ${failed} de ${MAX_FAILED_ATTEMPTS}.`;
      show("login-error");
      await loadAll(true);
      refreshDirectorSetupPanel();
      return;
    }

    await persistDirectorSecurity(profile, {
      failed_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    });

    sessionUser = {
      role: "director",
      name: profile.name || "Dirección",
      email: profile.email || email,
      id: profile.id || null,
      must_change_password: !!profile.must_change_password,
    };
    await recordAudit("login_ok", { email, role: "director" }, sessionUser);
    enterApp();
    return;
  }

  const teacherRaw = activeTeacherUsers().find((x) => (x.email || "").toLowerCase() === email);
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

  for (const u of activeTeacherUsers()) {
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
  if (sessionUser?.role === "teacher" && ["libreta", "alumno"].includes(state.tab)) {
    ensureVisibleGradeForTeacher();
  }

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
      ${tabBtn("reportes", "Reportes")}
      ${tabBtn("alumno", "Alumno")}
      ${tabBtn("editar", "Editar libreta")}
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
      ${tabBtn("reportes", "Reportes")}
      ${tabBtn("alumno", "Alumno")}
      ${tabBtn("libreta", "Libretas")}
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
      ${state.tab === "reportes" ? renderReportes() : ""}
      ${state.tab === "alumno" ? renderAlumnoDashboard() : ""}
      ${state.tab === "editar" ? renderDirectorEditor() : ""}
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
    state.reportCourse = "";
    state.editorStudentId = "";
    state.editorCourse = "";
    state.reportCardStudentId = "";
    state.studentReportStudentId = "";
    render();
  });

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.tab = btn.getAttribute("data-tab");
      render();
    });
  });

  if (state.tab === "libreta") {
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
  const docentes = activeTeacherUsers().length;
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

/* REPORTES */
function markStudentId(mark) {
  return mark?.studentId ?? mark?.student_id ?? "";
}

function markCompIndex(mark) {
  return mark?.compIndex ?? mark?.comp_index ?? 0;
}

function markLevel(mark) {
  return String(mark?.nl || mark?.level || "").trim().toUpperCase();
}

function getMarkValue(studentId, grade, course, bimestre, compIndex) {
  const normalized = normalizeCourse(course);
  const row = (state.marks || []).find(
    (m) =>
      String(markStudentId(m)) === String(studentId) &&
      (m.grade || "") === grade &&
      normalizeCourse(m.course || "") === normalized &&
      (m.bimestre || "") === bimestre &&
      Number(markCompIndex(m)) === Number(compIndex)
  );
  return markLevel(row);
}

function levelFromAverage(avg) {
  if (!Number.isFinite(avg)) return "";
  if (avg >= 3.5) return "AD";
  if (avg >= 2.5) return "A";
  if (avg >= 1.5) return "B";
  return "C";
}

function uniqueReportTargets(assignments) {
  const map = new Map();
  (assignments || []).forEach((a) => {
    if (!a?.grade || !a?.course) return;
    const key = `${a.grade}|${normalizeCourse(a.course)}`;
    if (!map.has(key)) map.set(key, { grade: a.grade, course: normalizeCourse(a.course) });
  });
  return Array.from(map.values());
}

function buildCourseReport(grade, course, bimestre) {
  const comps = competenciasPorCurso(course, grade);
  const students = (state.students || []).filter((s) => (s.grado || "") === grade);
  const studentCounts = { AD: 0, A: 0, B: 0, C: 0 };
  const markCounts = { AD: 0, A: 0, B: 0, C: 0 };
  const studentRows = [];
  let averageSum = 0;
  let evaluatedStudents = 0;
  let missingStudents = 0;

  students.forEach((st) => {
    const values = comps
      .map((_, idx) => getMarkValue(st.id, grade, course, bimestre, idx))
      .filter((v) => LEVEL_POINTS[v]);

    values.forEach((v) => {
      markCounts[v] += 1;
    });

    if (!values.length) {
      missingStudents += 1;
      studentRows.push({ name: st.nombre, avg: null, level: "", filled: 0, total: comps.length });
      return;
    }

    const avg = values.reduce((sum, v) => sum + LEVEL_POINTS[v], 0) / values.length;
    const level = levelFromAverage(avg);
    studentCounts[level] += 1;
    averageSum += avg;
    evaluatedStudents += 1;
    studentRows.push({ name: st.nombre, avg, level, filled: values.length, total: comps.length });
  });

  const courseAverage = evaluatedStudents ? averageSum / evaluatedStudents : null;
  return {
    grade,
    course: normalizeCourse(course),
    bimestre,
    competencies: comps.length,
    totalStudents: students.length,
    evaluatedStudents,
    missingStudents,
    courseAverage,
    courseLevel: levelFromAverage(courseAverage),
    studentCounts,
    markCounts,
    studentRows: studentRows.sort((a, b) => (a.avg ?? -1) - (b.avg ?? -1)),
  };
}

function renderLevelBars(counts, total) {
  return ["AD", "A", "B", "C"]
    .map((level) => {
      const value = Number(counts[level] || 0);
      const pct = total ? Math.round((value / total) * 100) : 0;
      return `
        <div class="level-row">
          <div class="level-tag level-${level.toLowerCase()}">${level}</div>
          <div class="level-meter"><span style="width:${pct}%"></span></div>
          <div class="level-value">${value}</div>
          <div class="level-label">${escapeHtml(LEVEL_LABELS[level])}</div>
        </div>
      `;
    })
    .join("");
}

function levelColor(level) {
  return {
    AD: "#2563eb",
    A: "#059669",
    B: "#d97706",
    C: "#dc2626",
  }[level] || "#cbd5e1";
}

function reportDonutGradient(counts, total) {
  if (!total) return "#e2e8f0";
  let cursor = 0;
  const parts = ["AD", "A", "B", "C"].map((level) => {
    const value = Number(counts[level] || 0);
    const start = cursor;
    const end = cursor + (value / total) * 100;
    cursor = end;
    return `${levelColor(level)} ${start}% ${end}%`;
  });
  return `conic-gradient(${parts.join(", ")})`;
}

function dominantLevel(counts) {
  return ["AD", "A", "B", "C"].reduce((best, level) => {
    return Number(counts[level] || 0) > Number(counts[best] || 0) ? level : best;
  }, "AD");
}

function renderReportDonut(counts, total, centerText = "") {
  const top = total ? dominantLevel(counts) : "";
  const center = centerText || top || "-";
  return `
    <div class="report-donut-wrap">
      <div class="report-donut" style="background:${reportDonutGradient(counts, total)}">
        <div>
          <strong>${escapeHtml(center)}</strong>
          <span>${total ? `${total} registros` : "Sin datos"}</span>
        </div>
      </div>
    </div>
  `;
}

function buildReportsOverview(reports) {
  const counts = { AD: 0, A: 0, B: 0, C: 0 };
  let evaluated = 0;
  let missing = 0;
  let totalStudents = 0;
  let weightedAverage = 0;
  let markedCompetencies = 0;

  reports.forEach((report) => {
    ["AD", "A", "B", "C"].forEach((level) => {
      counts[level] += Number(report.studentCounts[level] || 0);
    });
    evaluated += Number(report.evaluatedStudents || 0);
    missing += Number(report.missingStudents || 0);
    totalStudents += Number(report.totalStudents || 0);
    markedCompetencies += Object.values(report.markCounts || {}).reduce((a, b) => a + Number(b || 0), 0);
    if (report.courseAverage != null && report.evaluatedStudents) {
      weightedAverage += report.courseAverage * report.evaluatedStudents;
    }
  });

  const average = evaluated ? weightedAverage / evaluated : null;
  return {
    counts,
    evaluated,
    missing,
    totalStudents,
    markedCompetencies,
    average,
    level: levelFromAverage(average),
    courses: reports.length,
  };
}

function renderReportMetric(label, value, sub = "") {
  return `
    <div class="report-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${sub ? `<small>${escapeHtml(sub)}</small>` : ""}
    </div>
  `;
}

function renderCourseReportCard(report) {
  const avgText = report.courseAverage == null ? "Sin datos" : `${report.courseAverage.toFixed(2)} / 4`;
  const levelText = report.courseLevel ? `${report.courseLevel} · ${LEVEL_LABELS[report.courseLevel]}` : "Pendiente";
  const rows = report.studentRows.slice(0, 8);
  const completedPct = report.totalStudents
    ? Math.round((report.evaluatedStudents / report.totalStudents) * 100)
    : 0;

  return `
    <article class="course-report-card">
      <div class="course-report-head">
        <div>
          <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">${escapeHtml(report.grade)}</p>
          <h3>${escapeHtml(report.course)}</h3>
          <p class="text-slate-500 font-bold text-sm mt-1">${escapeHtml(report.bimestre)} · ${report.competencies} competencia${report.competencies === 1 ? "" : "s"}</p>
        </div>
        <div class="report-average-pill">
          <span>${escapeHtml(avgText)}</span>
          <small>${escapeHtml(levelText)}</small>
        </div>
      </div>

      <div class="course-report-grid">
        <div class="course-report-chart">
          ${renderReportDonut(report.studentCounts, report.evaluatedStudents, report.courseLevel || "-")}
        </div>
        <div class="course-report-bars">
          <p class="report-eyebrow">Alumnos por nivel</p>
          ${renderLevelBars(report.studentCounts, report.evaluatedStudents)}
        </div>
        <div class="course-report-stats">
          ${renderReportMetric("Evaluados", report.evaluatedStudents, `${report.totalStudents} alumnos`)}
          ${renderReportMetric("Pendientes", report.missingStudents, "sin calificación")}
          ${renderReportMetric("Avance", `${completedPct}%`, "del curso")}
          ${renderReportMetric("Registros", Object.values(report.markCounts).reduce((a, b) => a + b, 0), "competencias")}
        </div>
      </div>

      <details class="report-details">
        <summary>Detalle de alumnos con menor avance</summary>
        <div class="mt-3 overflow-auto">
          <table class="w-full min-w-[560px] border border-slate-200">
            <thead>
              <tr>
                <th class="p-3 text-left">Alumno</th>
                <th class="p-3 text-center">Promedio</th>
                <th class="p-3 text-center">Nivel</th>
                <th class="p-3 text-center">Avance</th>
              </tr>
            </thead>
            <tbody>
              ${
                rows.length
                  ? rows
                      .map(
                        (r) => `
                          <tr>
                            <td class="p-3 font-bold">${escapeHtml(r.name)}</td>
                            <td class="p-3 text-center font-black">${r.avg == null ? "-" : r.avg.toFixed(2)}</td>
                            <td class="p-3 text-center font-black">${escapeHtml(r.level || "-")}</td>
                            <td class="p-3 text-center font-bold">${r.filled}/${r.total}</td>
                          </tr>
                        `
                      )
                      .join("")
                  : `<tr><td colspan="4" class="p-4 text-center text-slate-500 font-bold">Sin alumnos.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </details>
    </article>
  `;
}

function renderReportes() {
  const bim = state.reportBimestre || state.config.bimestre || "I BIMESTRE";
  const bimestreOptions = ["I BIMESTRE", "II BIMESTRE", "III BIMESTRE", "IV BIMESTRE"]
    .map((x) => `<option value="${x}" ${x === bim ? "selected" : ""}>${x}</option>`)
    .join("");

  let targets = [];
  let headerExtra = "";

  if (sessionUser.role === "director") {
    const courses = cursosPorGrado(state.grade).map(normalizeCourse);
    const selectedCourse = state.reportCourse || "";
    targets = courses
      .filter((course) => !selectedCourse || normalizeCourse(course) === normalizeCourse(selectedCourse))
      .map((course) => ({ grade: state.grade, course }));
    headerExtra = `
      <select id="reportCourseSel" class="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
        <option value="">Todos los cursos</option>
        ${courses.map((c) => `<option value="${escapeHtml(c)}" ${normalizeCourse(c) === normalizeCourse(selectedCourse) ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
      </select>
    `;
  } else {
    targets = uniqueReportTargets(sessionUser.assignments || []);
  }

  const reports = targets.map((t) => buildCourseReport(t.grade, t.course, bim));
  const overview = buildReportsOverview(reports);
  const overviewLevelText = overview.level ? `${overview.level} · ${LEVEL_LABELS[overview.level]}` : "Sin promedio";
  const riskTotal = Number(overview.counts.B || 0) + Number(overview.counts.C || 0);
  const riskPct = overview.evaluated ? Math.round((riskTotal / overview.evaluated) * 100) : 0;

  return `
    <div class="report-page">
      <section class="report-hero">
        <div class="report-hero-main">
          <div>
            <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">Reportes académicos</p>
            <h2 class="text-xl font-black mt-1">${sessionUser.role === "director" ? "Resumen por aula y curso" : "Mis cursos asignados"}</h2>
            <p class="text-slate-500 font-bold text-sm mt-1">
              Promedio por curso y distribución de estudiantes en AD, A, B y C.
            </p>
          </div>
          <div class="report-controlbar">
            <select id="reportBimSel" class="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
              ${bimestreOptions}
            </select>
            ${headerExtra}
          </div>
        </div>
      </section>

      <section class="report-section">
        <div class="report-section-title">
          <div>
            <p class="report-eyebrow">Panorama general</p>
            <h3>${escapeHtml(bim)}</h3>
          </div>
          <span>${overview.courses} curso${overview.courses === 1 ? "" : "s"} analizado${overview.courses === 1 ? "" : "s"}</span>
        </div>

        <div class="report-overview">
          <div class="report-overview-chart">
            ${renderReportDonut(overview.counts, overview.evaluated, overview.level || "-")}
            <div>
              <p class="report-eyebrow">Nivel predominante</p>
              <h4>${escapeHtml(overviewLevelText)}</h4>
              <p>${overview.average == null ? "Aún no hay suficientes calificaciones." : `Promedio global ${overview.average.toFixed(2)} de 4.`}</p>
            </div>
          </div>

          <div class="report-overview-metrics">
            ${renderReportMetric("Evaluaciones registradas", overview.markedCompetencies, "competencias calificadas")}
            ${renderReportMetric("Alumnos evaluados", overview.evaluated, "conteo por curso")}
            ${renderReportMetric("Pendientes", overview.missing, "alumnos sin datos")}
            ${renderReportMetric("B/C", `${riskPct}%`, "requiere seguimiento")}
          </div>
        </div>
      </section>

      <section class="report-section">
        <div class="report-section-title">
          <div>
            <p class="report-eyebrow">Detalle por curso</p>
            <h3>Distribución y avance</h3>
          </div>
        </div>

        <div class="course-report-list">
        ${
          reports.length
            ? reports.map(renderCourseReportCard).join("")
            : `<div class="empty-state">No hay cursos asignados para mostrar reportes.</div>`
        }
        </div>
      </section>
    </div>
  `;
}

function buildStudentCoursePerformance(student, bimestre) {
  const grade = student?.grado || state.grade;
  return cursosPorGrado(grade).map((course) => {
    const normalized = normalizeCourse(course);
    const comps = competenciasPorCurso(normalized, grade);
    const byBim = BIMESTRES.map((bim) => {
      const values = comps
        .map((_, idx) => getMarkValue(student.id, grade, normalized, bim, idx))
        .filter((v) => LEVEL_POINTS[v]);
      const avg = values.length
        ? values.reduce((sum, v) => sum + LEVEL_POINTS[v], 0) / values.length
        : null;
      return {
        bimestre: bim,
        avg,
        level: levelFromAverage(avg),
        filled: values.length,
        total: comps.length,
      };
    });
    const selected = byBim.find((x) => x.bimestre === bimestre) || byBim[0];
    return {
      course: normalized,
      competencies: comps.length,
      selected,
      byBim,
    };
  });
}

function buildStudentSummary(student, bimestre) {
  const courses = buildStudentCoursePerformance(student, bimestre);
  const counts = { AD: 0, A: 0, B: 0, C: 0 };
  let points = 0;
  let evaluatedCompetencies = 0;
  let expectedCompetencies = 0;

  courses.forEach((course) => {
    expectedCompetencies += Number(course.selected?.total || 0);
    BIMESTRES.filter((b) => b === bimestre).forEach(() => {
      const comps = competenciasPorCurso(course.course, student.grado || state.grade);
      comps.forEach((_, idx) => {
        const level = getMarkValue(student.id, student.grado || state.grade, course.course, bimestre, idx);
        if (!LEVEL_POINTS[level]) return;
        counts[level] += 1;
        points += LEVEL_POINTS[level];
        evaluatedCompetencies += 1;
      });
    });
  });

  const average = evaluatedCompetencies ? points / evaluatedCompetencies : null;
  const supportCourses = courses.filter((course) => ["B", "C"].includes(course.selected?.level || ""));
  return {
    courses,
    counts,
    average,
    level: levelFromAverage(average),
    evaluatedCompetencies,
    expectedCompetencies,
    missingCompetencies: Math.max(expectedCompetencies - evaluatedCompetencies, 0),
    supportCourses,
  };
}

function buildStudentAttendanceSummary(student, bimestre) {
  const grade = student?.grado || state.grade;
  const bims = BIMESTRES;
  const tutorSelected = getTutorReport(student.id, grade, bimestre);
  const tutorTotals = {
    inasist_just: bims.reduce((sum, bim) => sum + Number(getTutorField(student.id, grade, bim, "inasist_just", 0) || 0), 0),
    inasist_injust: bims.reduce((sum, bim) => sum + Number(getTutorField(student.id, grade, bim, "inasist_injust", 0) || 0), 0),
    tard_just: bims.reduce((sum, bim) => sum + Number(getTutorField(student.id, grade, bim, "tard_just", 0) || 0), 0),
    tard_injust: bims.reduce((sum, bim) => sum + Number(getTutorField(student.id, grade, bim, "tard_injust", 0) || 0), 0),
  };
  const classRows = (state.attendance || []).filter(
    (a) =>
      String(a.student_id) === String(student.id) &&
      (a.grade || "") === grade
  );
  const classCounts = classRows.reduce(
    (acc, row) => {
      const status = String(row.status || "P").toUpperCase();
      acc[status] = Number(acc[status] || 0) + 1;
      return acc;
    },
    { P: 0, FJ: 0, FI: 0, T: 0 }
  );

  return { tutorSelected, tutorTotals, classCounts, classRows };
}

function renderCourseBimPills(course) {
  return course.byBim
    .map((bim) => {
      const short = bim.bimestre.split(" ")[0];
      const level = bim.level || "-";
      return `<span class="student-bim-pill ${bim.level ? `level-soft-${bim.level.toLowerCase()}` : ""}">${escapeHtml(short)}: ${escapeHtml(level)}</span>`;
    })
    .join("");
}

function renderAlumnoDashboard() {
  if (sessionUser.role === "teacher" && !ensureVisibleGradeForTeacher()) {
    return `<div class="empty-state">No tienes alumnos asignados para consultar reportes.</div>`;
  }

  const students = visibleStudentsForRole(state.grade);
  if (!students.length) {
    return `<div class="empty-state">No hay alumnos disponibles para el grado seleccionado.</div>`;
  }

  if (!students.some((s) => String(s.id) === String(state.studentReportStudentId))) {
    state.studentReportStudentId = String(students[0].id);
  }
  if (!state.studentReportBimestre) state.studentReportBimestre = state.config.bimestre || "I BIMESTRE";

  const student = students.find((s) => String(s.id) === String(state.studentReportStudentId)) || students[0];
  const bimestre = state.studentReportBimestre;
  const summary = buildStudentSummary(student, bimestre);
  const attendanceSummary = buildStudentAttendanceSummary(student, bimestre);
  const averageText = summary.average == null ? "Sin datos" : `${summary.average.toFixed(2)} / 4`;
  const levelText = summary.level ? `${summary.level} · ${LEVEL_LABELS[summary.level]}` : "Pendiente";
  const completionPct = summary.expectedCompetencies
    ? Math.round((summary.evaluatedCompetencies / summary.expectedCompetencies) * 100)
    : 0;
  const selectedTutor = attendanceSummary.tutorSelected || {};

  return `
    <div class="student-dashboard-page">
      <section class="student-dashboard-hero">
        <div>
          <p class="report-eyebrow">Reporte por alumno</p>
          <h2>${escapeHtml(student.nombre || "")}</h2>
          <p>${escapeHtml(student.grado || state.grade)} · ${escapeHtml(bimestre)}</p>
        </div>
        <div class="student-dashboard-controls">
          <select id="studentReportBimSel">${bimestreOptions(bimestre)}</select>
          <select id="studentReportSel">
            ${students.map((s) => `<option value="${s.id}" ${String(s.id) === String(student.id) ? "selected" : ""}>${escapeHtml(s.nombre)}</option>`).join("")}
          </select>
        </div>
      </section>

      <section class="student-dashboard-grid">
        <div class="student-panel student-main-panel">
          <div class="student-main-chart">
            ${renderReportDonut(summary.counts, summary.evaluatedCompetencies, summary.level || "-")}
            <div>
              <p class="report-eyebrow">Rendimiento académico</p>
              <h3>${escapeHtml(averageText)}</h3>
              <p>${escapeHtml(levelText)}</p>
            </div>
          </div>
          <div class="student-metric-grid">
            ${renderReportMetric("Competencias calificadas", summary.evaluatedCompetencies, `${summary.expectedCompetencies} esperadas`)}
            ${renderReportMetric("Avance", `${completionPct}%`, "del bimestre")}
            ${renderReportMetric("Pendientes", summary.missingCompetencies, "competencias sin nota")}
            ${renderReportMetric("Cursos en B/C", summary.supportCourses.length, "requieren seguimiento")}
          </div>
        </div>

        <div class="student-panel">
          <p class="report-eyebrow">Asistencia y tardanzas</p>
          <div class="student-attendance-list">
            ${renderReportMetric("Faltas justificadas", attendanceSummary.tutorTotals.inasist_just, "acumulado tutoría")}
            ${renderReportMetric("Faltas injustificadas", attendanceSummary.tutorTotals.inasist_injust, "acumulado tutoría")}
            ${renderReportMetric("Tardanzas justificadas", attendanceSummary.tutorTotals.tard_just, "acumulado tutoría")}
            ${renderReportMetric("Tardanzas injustificadas", attendanceSummary.tutorTotals.tard_injust, "acumulado tutoría")}
          </div>
          <div class="student-class-attendance">
            <span>P: ${attendanceSummary.classCounts.P || 0}</span>
            <span>FJ: ${attendanceSummary.classCounts.FJ || 0}</span>
            <span>FI: ${attendanceSummary.classCounts.FI || 0}</span>
            <span>T: ${attendanceSummary.classCounts.T || 0}</span>
          </div>
        </div>
      </section>

      <section class="student-panel">
        <div class="report-section-title">
          <div>
            <p class="report-eyebrow">Notas por curso</p>
            <h3>Rendimiento en cada bimestre</h3>
          </div>
        </div>
        <div class="student-course-list">
          ${summary.courses.map((course) => `
            <div class="student-course-row">
              <div>
                <h4>${escapeHtml(course.course)}</h4>
                <p>${course.competencies} competencia${course.competencies === 1 ? "" : "s"}</p>
              </div>
              <div class="student-course-bims">
                ${renderCourseBimPills(course)}
              </div>
              <div class="student-course-result">
                <strong>${escapeHtml(course.selected?.level || "-")}</strong>
                <span>${course.selected?.avg == null ? "Sin promedio" : course.selected.avg.toFixed(2)}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="student-dashboard-grid">
        <div class="student-panel">
          <p class="report-eyebrow">Convivencia y apoyo</p>
          <div class="student-tutor-grid">
            ${renderReportMetric("Valores institucionales", selectedTutor.convivencia_valores || "-", "convivencia")}
            ${renderReportMetric("Normas de convivencia", selectedTutor.convivencia_normas || "-", "convivencia")}
            ${renderReportMetric("Escuela para padres", selectedTutor.padres_escuela || "-", "apoyo")}
            ${renderReportMetric("Reuniones", selectedTutor.padres_reuniones || "-", "apoyo")}
          </div>
        </div>

        <div class="student-panel">
          <p class="report-eyebrow">Comentario del tutor</p>
          <div class="student-comment-box">
            ${escapeHtml(limitCommentText(selectedTutor.comment || "Sin comentario registrado para este bimestre."))}
          </div>
        </div>
      </section>
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

  const teacherUsers = activeTeacherUsers();
  const teacherQuery = (state.teacherQuery || "").trim().toLowerCase();
  const filteredTeachers = teacherUsers.filter((tch) => {
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

  const teacherCards = teacherUsers
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
                ${teacherUsers
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
            <p class="text-slate-500 font-bold text-sm">${filteredTeachers.length} de ${teacherUsers.length} docente${teacherUsers.length === 1 ? "" : "s"}.</p>
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

                      const dsc = limitCommentText(findCompDesc(st.id, state.grade, course, bim, idx));

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
                            class="comp-desc-input auto-correct-text w-full p-2 rounded-xl bg-white border border-slate-200 font-bold"
                            id="cd_${st.id}_${idx}"
                            maxlength="${MAX_COMMENT_CHARS}"
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

/* Edición directa de libreta (Dirección) */
function renderDirectorEditor() {
  if (sessionUser.role !== "director") {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">Solo directora.</div>`;
  }

  const alumnos = state.students.filter((s) => (s.grado || "") === state.grade);
  const courses = cursosPorGrado(state.grade).map(normalizeCourse);
  if (!alumnos.length || !courses.length) {
    return `<div class="empty-state">No hay alumnos o cursos disponibles para este grado.</div>`;
  }

  if (!alumnos.some((a) => String(a.id) === String(state.editorStudentId))) {
    state.editorStudentId = String(alumnos[0].id);
  }
  if (!courses.some((c) => normalizeCourse(c) === normalizeCourse(state.editorCourse))) {
    state.editorCourse = courses[0];
  }
  if (!state.editorBimestre) state.editorBimestre = state.config.bimestre || "I BIMESTRE";

  const studentId = state.editorStudentId;
  const course = normalizeCourse(state.editorCourse);
  const bimestre = state.editorBimestre;
  const comps = competenciasPorCurso(course, state.grade);
  const selectedStudent = alumnos.find((a) => String(a.id) === String(studentId));

  return `
    <div class="libreta-editor-page">
      <section class="libreta-editor-toolbar">
        <div>
          <p class="report-eyebrow">Edición directa</p>
          <h2>Corregir libreta</h2>
          <p>Selecciona alumno, curso y bimestre. Los cambios se guardan en notas y conclusiones descriptivas.</p>
        </div>
        <div class="libreta-editor-controls">
          <label>
            <span>Alumno</span>
            <select id="dirEditStudent">
              ${alumnos.map((a) => `<option value="${a.id}" ${String(a.id) === String(studentId) ? "selected" : ""}>${escapeHtml(a.nombre)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Curso</span>
            <select id="dirEditCourse">
              ${courses.map((c) => `<option value="${escapeHtml(c)}" ${normalizeCourse(c) === course ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span>Bimestre</span>
            <select id="dirEditBim">
              ${["I BIMESTRE", "II BIMESTRE", "III BIMESTRE", "IV BIMESTRE"].map((x) => `<option value="${x}" ${x === bimestre ? "selected" : ""}>${x}</option>`).join("")}
            </select>
          </label>
        </div>
      </section>

      <div class="libreta-editor-layout">
        <section class="libreta-edit-paper">
          <div class="libreta-edit-header">
            <img src="insignia-emblema.png" alt="Insignia" onerror="this.style.display='none'">
            <div>
              <p>"${escapeHtml(OFFICIAL_YEAR_PHRASE)}"</p>
              <h3>INFORME DE PROGRESO ACADÉMICO - ${SCHOOL_YEAR}</h3>
            </div>
          </div>

          <div class="libreta-edit-meta">
            <div><span>Alumno</span><strong>${escapeHtml(selectedStudent?.nombre || "")}</strong></div>
            <div><span>Grado</span><strong>${escapeHtml(state.grade)}</strong></div>
            <div><span>Curso</span><strong>${escapeHtml(course)}</strong></div>
            <div><span>Bimestre</span><strong>${escapeHtml(bimestre)}</strong></div>
          </div>

          <div class="editable-libreta-head">
            <span>Competencias</span>
            <span>Nivel</span>
            <span>Conclusión descriptiva</span>
          </div>

          <div class="editable-libreta-body">
            ${
              comps.length
                ? comps
                    .map((comp, idx) => {
                      const level = getMarkValue(studentId, state.grade, course, bimestre, idx);
                      const desc = limitCommentText(findCompDesc(studentId, state.grade, course, bimestre, idx));
                      return `
                        <div class="editable-competency-row">
                          <div class="editable-competency-title">
                            <span>C${idx + 1}</span>
                            <p>${escapeHtml(comp)}</p>
                          </div>
                          <div class="editable-competency-level">
                            <select id="dir_mk_${idx}">
                              ${NIVELES.map((n) => `<option value="${n}" ${n === level ? "selected" : ""}>${n || "—"}</option>`).join("")}
                            </select>
                          </div>
                          <div class="editable-competency-desc">
                            <textarea id="dir_cd_${idx}" maxlength="${MAX_COMMENT_CHARS}" class="director-desc-input auto-correct-text" placeholder="Conclusión descriptiva de la competencia...">${escapeHtml(desc)}</textarea>
                          </div>
                        </div>
                      `;
                    })
                    .join("")
                : `<div class="empty-state">Este curso no tiene competencias configuradas.</div>`
            }
          </div>
        </section>

        <aside class="libreta-editor-aside">
          <div>
            <p class="report-eyebrow">Escala</p>
            ${["AD", "A", "B", "C"].map((level) => `
              <div class="scale-hint">
                <span class="level-tag level-${level.toLowerCase()}">${level}</span>
                <div>
                  <strong>${escapeHtml(LEVEL_LABELS[level])}</strong>
                  <small>${level === "AD" ? "Superior a lo esperado" : level === "A" ? "Nivel esperado" : level === "B" ? "Próximo al nivel esperado" : "Requiere mayor acompañamiento"}</small>
                </div>
              </div>
            `).join("")}
          </div>

          <div class="editor-save-panel">
            <p>La autocorrección se aplica al salir del texto y también al guardar.</p>
            <button id="saveDirectorLibreta" class="no-print">
              Guardar cambios
            </button>
          </div>
        </aside>
      </div>
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
            <textarea id="tr_comment" maxlength="${MAX_COMMENT_CHARS}" class="auto-correct-text mt-2 w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold min-h-[110px]" placeholder="Escribe el comentario..."></textarea>
            <p class="mt-1 text-slate-400 font-bold text-xs">Máximo ${MAX_COMMENT_CHARS} caracteres.</p>
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
  if (sessionUser.role === "teacher" && !ensureVisibleGradeForTeacher()) {
    return `<div class="empty-state">No tienes grados asignados para observar libretas.</div>`;
  }

  const alumnos = visibleStudentsForRole(state.grade);
  if (!alumnos.length) {
    return `<div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6">No hay alumnos disponibles en este grado.</div>`;
  }

  if (!alumnos.some((a) => String(a.id) === String(state.reportCardStudentId))) {
    state.reportCardStudentId = String(alumnos[0].id);
  }
  if (!state.reportCardBimestre) state.reportCardBimestre = state.config.bimestre || "I BIMESTRE";

  const canPrint = sessionUser.role === "director";

  return `
    <div class="bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-6 lg:p-8">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <p class="text-slate-500 font-black tracking-[0.18em] uppercase text-xs">${canPrint ? "Exportación" : "Solo lectura"}</p>
          <h3 class="text-xl font-black mt-1">Libreta por alumno</h3>
          <p class="text-slate-500 font-bold text-sm">
            ${canPrint ? "Exportar a PDF: botón → luego “Guardar como PDF”." : "Puedes observar la libreta por bimestre, sin modificar notas ni comentarios."}
          </p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <select id="repBim" class="no-print px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
            ${bimestreOptions(state.reportCardBimestre)}
          </select>
          <select id="repStudent" class="no-print px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black">
            ${alumnos
              .map((a) => `<option value="${a.id}" ${String(a.id) === String(state.reportCardStudentId) ? "selected" : ""}>${escapeHtml(a.nombre)}</option>`)
              .join("")}
          </select>
          ${
            canPrint
              ? `<button id="btnPrint" class="no-print px-5 py-3 rounded-2xl bg-slate-900 text-white font-black tracking-widest uppercase text-xs shadow-lg">
                  Exportar PDF
                </button>`
              : `<span class="no-print px-4 py-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 font-black text-xs uppercase">Observación</span>`
          }
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
  const finalStatus = String(getTutorFinalStatus(st.id, grade) || "").trim().toUpperCase();
  const finalStatusText = finalStatusMeaning(finalStatus);
  const tutorName = getTutorNameForGrade(grade);
  const directorName = DIRECTOR_DISPLAY_NAME;
  const field = (bim, key, defVal = "") => escapeHtml(getTutorField(st.id, grade, bim, key, defVal));
  const total = (key) =>
    bims.reduce((sum, bim) => sum + Number(getTutorField(st.id, grade, bim, key, 0) || 0), 0);
  const evaluationRow = (title, key) => `
    <tr>
      <td class="official-eval-label">${escapeHtml(title)}</td>
      ${bims.map((b) => `<td class="official-small-cell">${field(b, key)}</td>`).join("")}
      <td class="official-small-cell"></td>
    </tr>
  `;
  const attendanceRow = (label, bim) => `
    <tr>
      <th>${escapeHtml(label)}</th>
      <td>${field(bim, "inasist_just", "")}</td>
      <td>${field(bim, "inasist_injust", "")}</td>
      <td>${field(bim, "tard_just", "")}</td>
      <td>${field(bim, "tard_injust", "")}</td>
    </tr>
  `;
  const commentRows = bims
    .map((bim, idx) => `
      <tr>
        <th>${labels[idx]}</th>
        <td>${escapeHtml(limitTutorComment(getTutorField(st.id, grade, bim, "comment", "")))}</td>
      </tr>
    `)
    .join("");

  return `
    <div class="official-bottom-box">
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

      <div class="official-footer-grid">
        <table class="official-eval-table">
          <colgroup>
            <col>
            ${labels.map(() => `<col class="official-mini-col">`).join("")}
            <col class="official-mini-col">
          </colgroup>
          <thead>
            <tr>
              <th>EVALUACIÓN</th>
              <th colspan="4">BIMESTRES</th>
              <th rowspan="2">PF</th>
            </tr>
            <tr>
              <th>DE LA CONVIVENCIA</th>
              ${labels.map((x) => `<th>${x}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${evaluationRow("Valores institucionales", "convivencia_valores")}
            ${evaluationRow("Respeto a las normas de convivencia", "convivencia_normas")}
            <tr class="official-subtitle-row">
              <th>DE APOYO DE LOS PADRES</th>
              ${labels.map((x) => `<th>${x}</th>`).join("")}
              <th>PF</th>
            </tr>
            ${evaluationRow("Asiste a la escuela para padres", "padres_escuela")}
            ${evaluationRow("Asiste a reuniones programadas por el tutor o la institución.", "padres_reuniones")}
          </tbody>
        </table>

        <table class="official-attendance-table">
          <thead>
            <tr>
              <th rowspan="2">BIMESTRES</th>
              <th colspan="2">Inasistencias</th>
              <th colspan="2">Tardanzas (Al Colegio)</th>
            </tr>
            <tr>
              <th>Justificadas</th>
              <th>Injustificadas</th>
              <th>Justificadas</th>
              <th>Injustificadas</th>
            </tr>
          </thead>
          <tbody>
            ${bims.map((bim, idx) => attendanceRow(labels[idx], bim)).join("")}
            <tr>
              <th>TOTAL</th>
              <td>${escapeHtml(total("inasist_just"))}</td>
              <td>${escapeHtml(total("inasist_injust"))}</td>
              <td>${escapeHtml(total("tard_just"))}</td>
              <td>${escapeHtml(total("tard_injust"))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <table class="official-comment-table">
        <colgroup>
          <col class="official-comment-bim-col">
          <col>
        </colgroup>
        <thead>
          <tr><th colspan="2">COMENTARIO DEL TUTOR(A)</th></tr>
        </thead>
        <tbody>
          ${commentRows}
        </tbody>
      </table>

      <div class="official-legal-note">
        (*) El presente informe de progreso o libreta de notas, no muestra las calificaciones que el estudiante obtuviera después del periodo de recuperación, siendo el periodo de recuperación posterior al término del año lectivo. (**) En los cursos talleres, el calificativo que figurará en el certificado oficial de estudio, lo determina el Sistema del Ministerio de Educación (SIAGIE).
      </div>

      <table class="official-final-status-table">
        <tr>
          <td class="official-final-title">Situación al finalizar el periodo lectivo</td>
          <td class="official-final-value">${escapeHtml(finalStatus)}</td>
          <td class="official-final-blank">${escapeHtml(finalStatusText)}</td>
        </tr>
      </table>
      <div class="official-final-legend">
        PRO (para promovido de grado), RR (para requiere recuperación), PER (para permanencia en el grado)
      </div>

      <table class="official-sign-table">
        <tr>
          <td>
            <div class="official-sign-space"></div>
            <div class="official-sign-line"></div>
            <div class="official-sign-name">${escapeHtml(tutorName)}</div>
            <b>TUTOR (A)</b>
          </td>
          <td>
            <div class="official-sign-space"></div>
            <div class="official-sign-line"></div>
            <div class="official-sign-name">${escapeHtml(directorName)}</div>
            <b>DIRECTORA</b>
          </td>
        </tr>
      </table>
      <div class="official-motto">“Wojtylianos, un camino a seguir con fe, entusiasmo y responsabilidad”</div>
    </div>
  `;
}

function renderReport() {
  const box = $("reportBox");
  if (!box) return;

  const studentId = $("repStudent")?.value || state.reportCardStudentId;
  const st = state.students.find((s) => String(s.id) === String(studentId));
  if (!st) {
    box.innerHTML = "";
    return;
  }

  const grade = state.grade;
  if (sessionUser?.role === "teacher" && !visibleStudentsForRole(grade).some((s) => String(s.id) === String(st.id))) {
    box.innerHTML = `<div class="empty-state">No tienes permiso para observar esta libreta.</div>`;
    return;
  }
  const selectedBim = state.reportCardBimestre || state.config.bimestre || "I BIMESTRE";
  const cursos = cursosPorGrado(grade);
  const fecha = new Date().toLocaleDateString("es-PE");

  const getMark = (course, compIndex, bim) => {
    const row = state.marks.find(
      (m) =>
        String(markStudentId(m)) === String(st.id) &&
        (m.grade || "") === grade &&
        normalizeCourse(m.course || "") === normalizeCourse(course || "") &&
        (m.bimestre || "") === bim &&
        Number(markCompIndex(m)) === Number(compIndex)
    );
    return markLevel(row);
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
          const descBim = selectedBim;
          const desc = limitCommentText(findCompDesc(st.id, grade, course, descBim, idx) || "");

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
          <div class="report-topline">"${escapeHtml(OFFICIAL_YEAR_PHRASE)}"</div>
          <div class="report-title">INFORME DE PROGRESO ACADÉMICO - ${SCHOOL_YEAR}</div>
          <div class="report-view-bim">Conclusiones descriptivas: ${escapeHtml(selectedBim)}</div>
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

      ${renderOfficialBottomBox(st, grade)}
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
  .report-view-bim{ text-align:center; font-size:7px; margin-top:.4mm; font-weight:700; }
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
  .official-bottom-box{ margin-top:1.6mm; border:0; break-inside:avoid; page-break-inside:avoid; }
  .official-scale-table{ width:100%; border-collapse:collapse; table-layout:fixed; border:1px solid #000; font-size:5.7px; line-height:1.02; }
  .official-scale-table col.official-scale-code-col{ width:6.5mm; }
  .official-scale-table col.official-scale-label-col{ width:30mm; }
  .official-scale-table th,.official-scale-table td{ border:1px solid #000; padding:1px 1.6px; vertical-align:middle; }
  .official-scale-table th{ background:#cfcfcf; text-align:center; font-weight:900; font-size:6.4px; }
  .official-scale-code{ text-align:center; font-weight:700; }
  .official-scale-label{ font-size:7.1px; font-weight:400; }
  .official-scale-desc{ font-size:5.45px; line-height:1.05; }
  .official-footer-grid{ display:grid; grid-template-columns:.45fr .55fr; gap:3mm; margin-top:3mm; }
  .official-eval-table,.official-attendance-table,.official-comment-table{ width:100%; border-collapse:collapse; table-layout:fixed; }
  .official-eval-table,.official-attendance-table{ font-size:6.2px; line-height:1.02; }
  .official-eval-table th,.official-eval-table td,.official-attendance-table th,.official-attendance-table td{ border:1px solid #000; padding:1.2px 1.5px; vertical-align:middle; }
  .official-eval-table th,.official-attendance-table th,.official-comment-table th,.official-subtitle-row th{ background:#cfcfcf; text-align:center; font-weight:900; }
  .official-eval-label{ text-align:left; font-weight:400; }
  .official-mini-col{ width:5.4mm; }
  .official-small-cell{ width:5.4mm; text-align:center; font-weight:800; }
  .official-attendance-table td{ text-align:center; }
  .official-comment-table{ margin-top:3mm; font-size:7.7px; }
  .official-comment-table th,.official-comment-table td{ border:1px solid #000; padding:1.8px 2px; vertical-align:middle; }
  .official-comment-table col.official-comment-bim-col{ width:8mm; }
  .official-comment-table tbody th{ width:8mm; background:#cfcfcf; font-size:7px; }
  .official-comment-table tbody td{ height:10mm; white-space:pre-wrap; font-size:7.5px; line-height:1.12; }
  .official-legal-note{ padding:1.6px 2.5px; font-size:5.9px; line-height:1.05; }
  .official-final-status-table{ width:100%; border-collapse:collapse; table-layout:fixed; font-size:7px; }
  .official-final-status-table td{ border:1px solid #000; padding:3px 4px; vertical-align:middle; }
  .official-final-title{ width:42%; text-align:center; font-weight:900; font-size:9.5px; }
  .official-final-value{ width:9%; text-align:center; font-weight:900; font-size:9.5px; }
  .official-final-blank{ width:49%; text-align:left; font-weight:800; font-size:7px; }
  .official-final-legend{ font-size:5.9px; line-height:1.05; padding:1.4px 2.5px 2px; }
  .official-sign-table{ width:82%; margin:5mm auto 0; border-collapse:collapse; table-layout:fixed; font-size:7px; }
  .official-sign-table td{ text-align:center; padding:4px 5mm 1px; border:0; }
  .official-sign-space{ height:10mm; }
  .official-sign-line{ border-top:1px solid #000; width:82%; margin:0 auto 2px; }
  .official-sign-name{ font-size:7px; line-height:1.1; min-height:12px; }
  .official-sign-table b{ display:block; margin-top:2px; font-size:7.2px; }
  .official-motto{ margin-top:3mm; text-align:center; font-size:6.7px; font-style:italic; font-weight:700; letter-spacing:.02em; }
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
document.addEventListener("focusout", (ev) => {
  const el = ev.target;
  if (!el?.matches?.(".auto-correct-text, .comp-desc-input, .director-desc-input, #tr_comment")) return;
  const corrected = limitCommentText(el.value || "");
  if (corrected !== el.value) el.value = corrected;
});

document.addEventListener("change", (ev) => {
  if (ev.target?.id === "repStudent") {
    state.reportCardStudentId = ev.target.value;
    renderReport();
  }

  if (ev.target?.id === "repBim") {
    state.reportCardBimestre = ev.target.value;
    renderReport();
  }

  if (ev.target?.id === "reportBimSel") {
    state.reportBimestre = ev.target.value;
    render();
  }

  if (ev.target?.id === "reportCourseSel") {
    state.reportCourse = ev.target.value;
    render();
  }

  if (ev.target?.id === "studentReportSel") {
    state.studentReportStudentId = ev.target.value;
    render();
  }

  if (ev.target?.id === "studentReportBimSel") {
    state.studentReportBimestre = ev.target.value;
    render();
  }

  if (ev.target?.id === "dirEditStudent") {
    state.editorStudentId = ev.target.value;
    render();
  }

  if (ev.target?.id === "dirEditCourse") {
    state.editorCourse = ev.target.value;
    render();
  }

  if (ev.target?.id === "dirEditBim") {
    state.editorBimestre = ev.target.value;
    render();
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

    if ($("tr_comment")) $("tr_comment").value = limitTutorComment(r?.comment || "");
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
      const profile = getDirectorAccount(sessionUser.email);
      if (!profile) return toast("No se encontró tu cuenta de Dirección.", "err");
      const ok = await verifyStoredPassword(currentPass, profile);
      if (!ok) {
        await recordAudit("password_change_failed", { role: "director", reason: "current_password" });
        return toast("Contraseña actual incorrecta.", "err");
      }
      const result = await saveDirectorPassword(newPass);
      if (result.error) return toast(result.error.message || "No se pudo guardar.", "err");
      sessionUser.must_change_password = false;
      await recordAudit("password_changed", { role: "director", credential_mode: result.mode || "supabase" });
      await loadAll(true);
      toast("Contraseña actualizada");
      render();
      return;
    }

    const teacher = activeTeacherUsers().find(
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

    const tutorComment = limitTutorComment($("tr_comment")?.value || "");
    if ($("tr_comment")) $("tr_comment").value = tutorComment;

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

      comment: tutorComment,
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
    const teacher = activeTeacherUsers().find((x) => String(x.id) === String(id));
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
    const teacher = activeTeacherUsers().find((x) => String(x.id) === String(id));
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
    const teacher = activeTeacherUsers().find((x) => String(x.id) === String(id));
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
    const teacher = activeTeacherUsers().find((x) => String(x.id) === String(teacherId));
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

    const teacher = activeTeacherUsers().find((x) => String(x.id) === String(teacherId));
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
      const descEl = $(`cd_${studentId}_${idx}`);
      const desc = limitCommentText(descEl?.value ?? "");
      if (descEl) descEl.value = desc;
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

  /* Guardar libreta editada (Directora) */
  if (t?.id === "saveDirectorLibreta") {
    if (sessionUser.role !== "director") return toast("Solo directora.", "err");

    const studentId = String(state.editorStudentId || $("dirEditStudent")?.value || "");
    const grade = state.grade;
    const course = normalizeCourse(state.editorCourse || $("dirEditCourse")?.value || "");
    const bimestre = state.editorBimestre || $("dirEditBim")?.value || state.config.bimestre || "I BIMESTRE";
    if (!studentId || !course) return toast("Selecciona alumno y curso.", "err");

    const comps = competenciasPorCurso(course, grade);
    if (!comps.length) return toast("Este curso no tiene competencias configuradas.", "err");

    const markRows = comps.map((_, idx) => {
      const id = makeMarkId(studentId, grade, course, bimestre, idx);
      return {
        id,
        studentId,
        grade,
        course,
        bimestre,
        compIndex: Number(idx),
        nl: $(`dir_mk_${idx}`)?.value ?? "",
        updatedBy: sessionUser.email,
        at: new Date().toISOString(),
      };
    });

    const upMarks = await sb.from("marks").upsert(markRows, { onConflict: "id" });
    if (upMarks.error) return toast(upMarks.error.message, "err");

    const descRows = comps.map((_, idx) => {
      const descEl = $(`dir_cd_${idx}`);
      const desc = limitCommentText(descEl?.value ?? "");
      if (descEl) descEl.value = desc;
      return {
        student_id: studentId,
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

    await recordAudit("director_report_card_edited", {
      student_id: studentId,
      grade,
      course,
      bimestre,
      competencies: comps.length,
    });
    await loadAll(true);
    toast("Libreta actualizada");
    render();
    return;
  }

  /* Guardar tutor (Directora) */
  if (t?.id === "saveTutorBtn") {
    if (sessionUser.role !== "director") return toast("Solo directora.", "err");

    const teacherId = $("tutorTeacherSel")?.value;
    if (!teacherId) return toast("Selecciona un docente.", "err");

    const teacher = activeTeacherUsers().find((x) => String(x.id) === String(teacherId));
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
