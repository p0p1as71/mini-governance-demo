/**
 * rules.js
 *
 * Definición formal de las reglas de transición.
 * Representación de la constitución operacional del sistema.
 *
 * Cada entrada en VALID_TRANSITIONS define:
 *   estado actual → [estados siguientes permitidos]
 *
 * Cada regla tiene un identificador semántico para que
 * los errores sean observables y explicables.
 */

const VALID_TRANSITIONS = {
  submitted:  ["reviewed", "correction"],
  reviewed:   ["validated", "rejected", "correction"],
  validated:  ["executed", "rejected", "correction"],
  rejected:   ["correction"],
  executed:   ["correction"],
  correction: [],
};

/**
 * Rol → acciones que puede generar
 */
const ROLE_ACTIONS = {
  intaker:   ["submitted", "correction"],
  governor:  ["reviewed", "rejected", "correction"],
  validator: ["validated", "rejected", "correction"],
  executor:  ["executed", "correction"],
};

/**
 * Requisitos previos por acción.
 *
 * Cada acción define:
 *   requiresChain  — lista ordenada de eventos que deben existir antes
 *   requiresEvent  — condiciones sobre eventos previos (ruta → valor esperado)
 *   requiresFields — campos obligatorios en el evento propuesto
 */const ACTION_PREREQUISITES = {
  submitted: {
    requiresChain: [],
    requiresEvent: {},
    requiresFields: {},
  },
  reviewed: {
    requiresChain: [{ action: "submitted" }],
    requiresEvent: { submitted: {} },
    requiresFields: {},
  },
  validated: {
    requiresChain: [
      { action: "submitted" },
      { action: "reviewed", field: "payload.decision", expected: "approved" },
    ],
    requiresEvent: {
      reviewed: { "payload.decision": "approved" },
    },
    requiresFields: {},
  },
  rejected: {
    requiresChain: [],
    requiresEvent: {},
    requiresFields: {},
  },
  executed: {
    requiresChain: [
      { action: "submitted" },
      { action: "reviewed", field: "payload.decision", expected: "approved" },
      { action: "validated", field: "payload.result", expected: "valid" },
    ],
    requiresEvent: {
      reviewed:  { "payload.decision": "approved" },
      validated: { "payload.result": "valid" },
    },
    requiresFields: {},
  },
  correction: {
    requiresChain: [],
    requiresEvent: {},
    requiresFields: { reason: "string" },
  },
};

/**
 * Acciones que puede emitir cada rol.
 */
function actionsForRole(role) {
  return ROLE_ACTIONS[role] || [];
}

module.exports = {
  VALID_TRANSITIONS,
  ROLE_ACTIONS,
  ACTION_PREREQUISITES,
  actionsForRole,
};