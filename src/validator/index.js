/**
 * index.js
 *
 * Pruebas manuales del transition validator.
 * Ejecutar con: node src/validator/index.js
 *
 * NO es un test suite formal. Es una verificación manual
 * de que la constitución operacional se aplica correctamente.
 */

const { validateTransition } = require("./validateTransition");

// ---------------------------------------------------------------------------
// Escenario 1: flujo válido completo
// ---------------------------------------------------------------------------
console.log("=== ESCENARIO 1: Flujo válido completo ===");

const history1 = [
  {
    event_id: "EVT-0001",
    request_id: "REQ-0001",
    role: "intaker",
    action: "submitted",
    timestamp: "2026-05-19T18:00:00Z",
    payload: {},
  },
];

const reviewEvent = {
  event_id: "EVT-0002",
  request_id: "REQ-0001",
  role: "governor",
  action: "reviewed",
  timestamp: "2026-05-19T18:05:00Z",
  payload: { decision: "approved" },
};

const validatedEvent = {
  event_id: "EVT-0003",
  request_id: "REQ-0001",
  role: "validator",
  action: "validated",
  timestamp: "2026-05-19T18:06:00Z",
  payload: { result: "valid" },
};

const executedEvent = {
  event_id: "EVT-0004",
  request_id: "REQ-0001",
  role: "executor",
  action: "executed",
  timestamp: "2026-05-19T18:10:00Z",
  payload: { result: "success" },
};

let r = validateTransition(reviewEvent, history1);
console.log("reviewed (esperado: válido):", r.valid ? "✅" : "❌");

const history2 = [...history1, reviewEvent];
r = validateTransition(validatedEvent, history2);
console.log("validated (esperado: válido):", r.valid ? "✅" : "❌");

const history3 = [...history2, validatedEvent];
r = validateTransition(executedEvent, history3);
console.log("executed (esperado: válido):", r.valid ? "✅" : "❌");

// ---------------------------------------------------------------------------
// Escenario 2: transición inválida (submitted → executed)
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 2: Transición inválida (submitted → executed) ===");

r = validateTransition(executedEvent, history1);
console.log(
  "executed tras submitted (esperado: inválido):",
  r.valid ? "✅" : "❌",
);
r.errors.forEach((e) => console.log(`  [${e.ruleId}] ${e.message}`));

// ---------------------------------------------------------------------------
// Escenario 3: rol no autorizado para la acción
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 3: Rol no autorizado ===");

const executorSubmits = {
  event_id: "EVT-000X",
  request_id: "REQ-9999",
  role: "executor",
  action: "reviewed",
  timestamp: "2026-05-19T18:00:00Z",
  payload: {},
};

r = validateTransition(executorSubmits, history1);
console.log(
  "executor emite reviewed (esperado: inválido):",
  r.valid ? "✅" : "❌",
);
r.errors.forEach((e) => console.log(`  [${e.ruleId}] ${e.message}`));

// ---------------------------------------------------------------------------
// Escenario 4: primer evento no es submitted
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 4: Primer evento no es submitted ===");

r = validateTransition(reviewEvent, []);
console.log(
  "reviewed sin historial (esperado: inválido):",
  r.valid ? "✅" : "❌",
);
r.errors.forEach((e) => console.log(`  [${e.ruleId}] ${e.message}`));

// ---------------------------------------------------------------------------
// Escenario 5: validated sin approved previo
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 5: Validated sin approved previo ===");

const historyRejected = [
  {
    event_id: "EVT-0001",
    request_id: "REQ-0002",
    role: "intaker",
    action: "submitted",
    timestamp: "2026-05-19T18:00:00Z",
    payload: {},
  },
  {
    event_id: "EVT-0002",
    request_id: "REQ-0002",
    role: "governor",
    action: "reviewed",
    timestamp: "2026-05-19T18:05:00Z",
    payload: { decision: "rejected" },
  },
];

r = validateTransition(validatedEvent, historyRejected);
console.log(
  "validated tras rejected (esperado: inválido):",
  r.valid ? "✅" : "❌",
);
r.errors.forEach((e) => console.log(`  [${e.ruleId}] ${e.message}`));

// ---------------------------------------------------------------------------
// Escenario 6: executed sin validated previo
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 6: Executed sin validated previo ===");

const historyNoValidation = [...history1, reviewEvent];
r = validateTransition(executedEvent, historyNoValidation);
console.log(
  "executed sin validated (esperado: inválido):",
  r.valid ? "✅" : "❌",
);
r.errors.forEach((e) => console.log(`  [${e.ruleId}] ${e.message}`));

// ---------------------------------------------------------------------------
// Escenario 7: correction sin reason
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 7: Correction sin reason ===");

const correctionNoReason = {
  event_id: "EVT-0005",
  request_id: "REQ-0001",
  role: "intaker",
  action: "correction",
  corrects: "EVT-0001",
  timestamp: "2026-05-19T18:15:00Z",
  payload: {},
};

const historyWithSubmitted = [history1[0]];
r = validateTransition(correctionNoReason, historyWithSubmitted);
console.log(
  "correction sin reason (esperado: inválido):",
  r.valid ? "✅" : "❌",
);
r.errors.forEach((e) => console.log(`  [${e.ruleId}] ${e.message}`));

// ---------------------------------------------------------------------------
// Escenario 8: correction válida con reason
// ---------------------------------------------------------------------------
console.log("\n=== ESCENARIO 8: Correction válida ===");

const correctionWithReason = {
  ...correctionNoReason,
  reason: "error tipográfico en la descripción",
};

r = validateTransition(correctionWithReason, historyWithSubmitted);
console.log(
  "correction con reason (esperado: válido):",
  r.valid ? "✅" : "❌",
);

// ---------------------------------------------------------------------------
// Resumen
// ---------------------------------------------------------------------------
console.log("\n==========================================");
console.log("Pruebas manuales del validator completadas.");