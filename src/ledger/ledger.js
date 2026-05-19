/**
 * ledger.js
 *
 * Ledger append-only. Runtime state authority.
 *
 * Responsabilidad única:
 *   si el validator aprueba  → append al ledger
 *   si no                    → reject
 *
 * El estado del sistema es derivado del historial de eventos,
 * no existe un "estado actual" mutable.
 */

const { validateTransition } = require("../validator/validateTransition");
const { getHistory, appendToStore, _reset } = require("./store");

/**
 * Intenta agregar un evento al ledger.
 *
 * 1. Obtiene el historial existente para el request_id.
 * 2. Ejecuta el transition validator.
 * 3. Si es válido → persiste el evento.
 * 4. Si no es válido → devuelve los errores sin persistir nada.
 *
 * @param {Object} event - Evento propuesto
 * @returns {{ ok: boolean, event?: Object, errors?: string[] }}
 */
function appendEvent(event) {
  const requestId = event.request_id;
  if (!requestId) {
    return { ok: false, errors: ["MISSING_REQUEST_ID: event debe tener un request_id"] };
  }

  const history = getHistory(requestId);
  const validation = validateTransition(event, history);

  if (!validation.valid) {
    return { ok: false, errors: validation.errors };
  }

  // Append: el ledger es inmutable, solo se añade al final
  appendToStore(requestId, event);

  return { ok: true, event };
}

module.exports = { appendEvent, _reset };