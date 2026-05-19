/**
 * index.js
 *
 * Flujo end-to-end del sistema de gobernanza.
 *
 * Arquitectura:
 *   event proposal → transition validator → appendEvent → ledger
 *
 * El estado emerge del historial de eventos.
 * No existe estado mutable fuera del ledger.
 *
 * Ejecutar: node src/index.js
 */

const { appendEvent } = require("./ledger/ledger");
const { getState, getAllRequestIds } = require("./ledger/query");
const { replayAll, replayRequest } = require("./ledger/replay");

function resetDemo() {
  const { _reset } = require("./ledger/ledger");
  _reset();
}

/**
 * Genera un event_id simple para la demo.
 */
let _seq = 0;
function nextEventId() {
  _seq++;
  return `EVT-${String(_seq).padStart(4, "0")}`;
}

/**
 * Ejecuta un append y muestra el resultado.
 */
function appendAndShow(event) {
  const result = appendEvent(event);
  const status = result.ok ? "✅ ACEPTADO" : "❌ RECHAZADO";
  console.log(`  ${status}  ${event.action} (${event.role})`);
  if (!result.ok) {
    result.errors.forEach((err) => {
      const rule = err.ruleId || "ERROR";
      console.log(`       └─ [${rule}] ${err.message}`);
    });
  }
  return result;
}

console.log("=".repeat(60));
console.log("  mini-governance-demo — Runtime de Gobernanza");
console.log("=".repeat(60));

// ---------------------------------------------------------------------------
// Solicitud: REQ-1001 — Flujo completo exitoso
// ---------------------------------------------------------------------------
console.log("\n--- Solicitud REQ-1001: Flujo exitoso ---");

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1001",
  actor: "usuario-externo",
  role: "intaker",
  action: "submitted",
  timestamp: new Date().toISOString(),
  payload: { type: "feature", summary: "Añadir healthcheck endpoint" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1001",
  actor: "agente-governance",
  role: "governor",
  action: "reviewed",
  timestamp: new Date().toISOString(),
  payload: { decision: "approved", rationale: "Cambio estándar, bajo riesgo" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1001",
  actor: "agente-validator",
  role: "validator",
  action: "validated",
  timestamp: new Date().toISOString(),
  payload: { result: "valid" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1001",
  actor: "agente-executor",
  role: "executor",
  action: "executed",
  timestamp: new Date().toISOString(),
  payload: { result: "success" },
});

// ---------------------------------------------------------------------------
// Solicitud: REQ-1002 — Intento de bypass (submitted → executed)
// ---------------------------------------------------------------------------
console.log("\n--- Solicitud REQ-1002: Bypass attempt ---");

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1002",
  actor: "usuario-externo",
  role: "intaker",
  action: "submitted",
  timestamp: new Date().toISOString(),
  payload: { type: "config", summary: "Cambiar timeout" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1002",
  actor: "agente-executor",
  role: "executor",
  action: "executed",
  timestamp: new Date().toISOString(),
  payload: { result: "success" },
});

// ---------------------------------------------------------------------------
// Solicitud: REQ-1003 — Decisión rechazada que intenta validarse
// ---------------------------------------------------------------------------
console.log("\n--- Solicitud REQ-1003: Rejected → intento de validate ---");

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1003",
  actor: "usuario-externo",
  role: "intaker",
  action: "submitted",
  timestamp: new Date().toISOString(),
  payload: { type: "change", summary: "Modificar base de datos crítica" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1003",
  actor: "agente-governance",
  role: "governor",
  action: "reviewed",
  timestamp: new Date().toISOString(),
  payload: { decision: "rejected", rationale: "Cambio demasiado riesgoso sin análisis" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1003",
  actor: "agente-validator",
  role: "validator",
  action: "validated",
  timestamp: new Date().toISOString(),
  payload: { result: "valid" },
});

// ---------------------------------------------------------------------------
// Solicitud: REQ-1004 — Rol no autorizado
// ---------------------------------------------------------------------------
console.log("\n--- Solicitud REQ-1004: Rol no autorizado ---");

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1004",
  actor: "usuario-externo",
  role: "intaker",
  action: "submitted",
  timestamp: new Date().toISOString(),
  payload: { type: "doc", summary: "Actualizar documentación" },
});

appendAndShow({
  event_id: nextEventId(),
  request_id: "REQ-1004",
  actor: "usuario-externo",
  role: "executor",
  action: "reviewed",
  timestamp: new Date().toISOString(),
  payload: { decision: "approved" },
});

// ---------------------------------------------------------------------------
// Estado final del ledger
// ---------------------------------------------------------------------------
console.log("\n" + "=".repeat(60));
console.log("  Estado del Ledger");
console.log("=".repeat(60));

const ids = getAllRequestIds();
ids.forEach((id) => {
  const state = getState(id);
  const actions = state.chain.join(" → ");
  console.log(`\n  ${id}: ${state.currentAction}`);
  console.log(`    ${actions}`);
});

// ---------------------------------------------------------------------------
// Replay: verificar integridad del ledger
// ---------------------------------------------------------------------------
console.log("\n" + "=".repeat(60));
console.log("  Replay — Verificación de integridad");
console.log("=".repeat(60));

const replayResult = replayAll();

if (replayResult.valid) {
  console.log(`\n  ✅ Ledger íntegro — ${replayResult.totalEvents} eventos verificados en ${replayResult.requests.length} solicitudes.`);
} else {
  console.log(`\n  ❌ Ledger con inconsistencias:`);
  replayResult.errors.forEach((e) => {
    console.log(`    ${e.requestId}:`);
    e.errors.forEach((err) => {
      console.log(`      [${err.index}] ${err.action} — ${err.errors.join("; ")}`);
    });
  });
}

replayResult.requests.forEach((req) => {
  const status = req.valid ? "✅" : "❌";
  console.log(`  ${status} ${req.requestId}: ${req.chain.join(" → ")} (${req.events} eventos)`);
});

console.log("\n" + "=".repeat(60));
console.log("  Fin del demo.");
console.log("=".repeat(60));
