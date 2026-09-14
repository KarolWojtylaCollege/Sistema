/* Autenticacion remota y guardado confirmado. No autoriza desde almacenamiento local. */
let sessionGeneration = 0;
function fetchWithDeadline(input, options = {}) {
  const controller = new AbortController();
  const relay = () => controller.abort();
  const timer = setTimeout(relay, 20000);
  if (options.signal?.aborted) relay();
  else options.signal?.addEventListener("abort", relay, { once: true });
  return fetch(input, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", relay);
  });
}

async function fetchAllRows(table, configure = (q) => q) {
  const rows = [];
  let total = null;
  for (;;) {
    const result = await withTimeout(
      configure(sb.from(table).select("*", { count: "exact" }).order("id"))
        .range(rows.length, rows.length + 499), table, 20000
    );
    if (result.error) throw new Error(`No se pudo cargar ${table}. ${result.error.message}`);
    if (!Array.isArray(result.data)) throw new Error(`Respuesta incompleta de ${table}.`);
    total = result.count ?? total;
    rows.push(...result.data);
    if (total !== null && rows.length >= total) return rows;
    if (!result.data.length) {
      if (total !== null && rows.length < total) throw new Error(`Carga incompleta de ${table}. Vuelve a intentarlo.`);
      return rows;
    }
  }
}

async function verifiedProfile() {
  const { data, error } = await sb.auth.getUser();
  if (error || !data?.user) throw new Error("La sesión no es válida. Ingresa nuevamente.");
  const profile = await sb.from("kwc_staff").select("*")
    .eq("auth_user_id", data.user.id).single();
  if (profile.error || !profile.data || profile.data.status !== "active" ||
      !["director", "teacher"].includes(profile.data.role)) {
    throw new Error("Esta cuenta no está habilitada. Comunícate con Dirección.");
  }
  return profile.data;
}

function clearAcademicSession() {
  sessionGeneration += 1;
  loadPromise = null;
  sessionUser = null;
  lastLoadAt = 0;
  state.students = [];
  state.teachers = [];
  state.marks = [];
  state.compDesc = [];
  state.evaluations = [];
  state.tutorReports = [];
  state.homeroomTutors = [];
  state.attendance = [];
  state.auditLogs = [];
  state.generatedCredential = null;
  state.teacherCourse = null;
  state.tab = "dashboard";
  state.config = { locked: true, bimestre: "I BIMESTRE" };
  stopClock();
  if ($("app-root")) $("app-root").replaceChildren();
  setView("login");
}

async function accountAction(body) {
  try {
    const result = await sb.functions.invoke("kwc-accounts", { body });
    if (result.error) {
      let message = "No se pudo actualizar la cuenta. Revisa la conexión y vuelve a intentarlo.";
      try { message = (await result.error.context.json()).error || message; } catch {}
      return { error: { message } };
    }
    return result.data || { error: { message: "El servidor no confirmó la operación." } };
  } catch {
    return { error: { message: "No se pudo conectar con el servicio de cuentas." } };
  }
}

function evaluationFor(studentId, grade, course, bimestre, compIndex) {
  return (state.evaluations || []).find((row) =>
    String(row.student_id) === String(studentId) && row.grade === grade &&
    sameCourseForGrade(row.course, course, grade) && row.bimestre === bimestre &&
    Number(row.comp_index) === Number(compIndex) && Number(row.year) === SCHOOL_YEAR
  );
}

function applyEvaluations(rows, replace = false) {
  const all = new Map((replace ? [] : state.evaluations || []).map((row) => [row.id, row]));
  rows.forEach((row) => all.set(row.id, row));
  state.evaluations = [...all.values()];
  state.marks = state.evaluations;
  state.compDesc = state.evaluations;
}

function captureCompetencies(studentId, grade, course, bimestre, director = false) {
  const comps = competenciasPorCurso(course, grade);
  if (!comps.length) throw new Error("Este curso no tiene competencias configuradas.");
  // Capturar todos los campos antes de la primera espera de red.
  return comps.map((_, idx) => {
    const mark = $(director ? `dir_mk_${idx}` : teacherMarkInputId(studentId, idx));
    const desc = $(director ? `dir_cd_${idx}` : teacherDescInputId(studentId, idx));
    if (!mark || !desc) throw new Error(`No se encontró el campo de la competencia ${idx + 1}. No se guardaron cambios.`);
    const text = String(desc.value ?? "");
    if (text.length > MAX_COMMENT_CHARS) throw new Error(`La competencia ${idx + 1} supera los 350 caracteres.`);
    if (!NIVELES.includes(mark.value)) throw new Error(`Calificación inválida en la competencia ${idx + 1}.`);
    desc.value = text;
    return {
      comp_index: idx, nl: mark.value, desc: text,
      expected_revision: Number(evaluationFor(studentId, grade, course, bimestre, idx)?.revision || 0),
    };
  });
}

async function saveEvaluationForm(button, director = false) {
  if (button.dataset.saving === "true") return;
  const studentId = director ? String(state.editorStudentId || "") : button.dataset.saveSt;
  const grade = state.grade;
  const course = normalizeCourseForGrade(director ? state.editorCourse : state.teacherCourse, grade);
  const bimestre = (director ? state.editorBimestre : state.config.bimestre) || "I BIMESTRE";
  let fields = [];
  let oldLabel = button.textContent;
  try {
    button.parentElement.querySelector('[data-save-error]')?.remove();
    const rows = captureCompetencies(studentId, grade, course, bimestre, director);
    const tutor = director && $("dir_tr_comment")
      ? buildTutorReportPayloadFromForm("dir_tr", studentId, grade, bimestre, sessionUser.email)
      : null;
    fields = rows.flatMap((row) => [
      $(director ? `dir_mk_${row.comp_index}` : teacherMarkInputId(studentId, row.comp_index)),
      $(director ? `dir_cd_${row.comp_index}` : teacherDescInputId(studentId, row.comp_index)),
    ]);
    if (tutor) fields.push(...document.querySelectorAll('[id^="dir_tr_"]'));
    fields.forEach((field) => { field.disabled = true; });
    button.dataset.saving = "true";
    button.disabled = true;
    button.textContent = "Guardando...";
    const result = await sb.rpc("kwc_save_evaluations", {
      p_student_id: studentId, p_grade: grade, p_course: course,
      p_bimestre: bimestre, p_year: SCHOOL_YEAR, p_rows: rows, p_tutor: tutor,
    });
    if (result.error) throw new Error(result.error.message);
    const saved = result.data;
    if (!saved || !Array.isArray(saved.evaluations) || saved.evaluations.length !== rows.length ||
        !rows.every((row) => saved.evaluations.some((item) =>
          Number(item.comp_index) === row.comp_index && item.nl === row.nl && item.desc === row.desc &&
          String(item.student_id) === String(studentId) && item.grade === grade &&
          item.course === course && item.bimestre === bimestre && Number(item.year) === SCHOOL_YEAR))) {
      throw new Error("El servidor no confirmó todas las competencias. Tus textos siguen en pantalla; verifica antes de reintentar.");
    }
    applyEvaluations(saved.evaluations);
    if (saved.tutor) {
      state.tutorReports = state.tutorReports.filter((row) => String(row.id) !== String(saved.tutor.id));
      state.tutorReports.push(saved.tutor);
    }
    // No reconstruir la tabla: otras filas pueden tener textos aun sin guardar.
    oldLabel = "Guardado";
    toast(tutor ? "Libreta y tutoría guardadas en el servidor" : "Todas las competencias guardadas en el servidor");
  } catch (err) {
    oldLabel = "Reintentar";
    showSaveError(button, `No se confirmó el guardado. ${err.message || "Revisa la conexión."} Los campos se conservaron.`);
  } finally {
    fields.forEach((field) => { field.disabled = false; });
    button.disabled = false;
    button.dataset.saving = "false";
    button.textContent = oldLabel;
  }
}

function showSaveError(button, message) {
  let box = button.parentElement.querySelector('[data-save-error]');
  if (!box) {
    box = document.createElement("p");
    box.dataset.saveError = "";
    box.setAttribute("role", "alert");
    box.className = "save-error-message";
    button.parentElement.appendChild(box);
  }
  box.textContent = message;
}
