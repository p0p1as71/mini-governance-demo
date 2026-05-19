/**
 * replay.js
 *
 * Replay: reconstrucción determinista del estado a partir del historial.
 *
 * Concepto:
 *   "el ledger ES la máquina"
 *
 * No es un log. No es auditoría secundaria.
 * Es memoria, causalidad, estado, legitimidad, trazabilidad.
 *
 * replay NO muta, NO escribe, NO interpreta.
 * Solo reproduce causalidad histórica.
 */

const { getHistory } = require("./store");

/**
 * Reconstruye el estado de una solicitud reaplicando
 * la validación de cada evento en secuencia.
 *
 * Verifica que el ledger sea internamente coherente:
 *   - cada transición es legal desde el estado anterior
 *   - todas las reglas de rol, cadena y campo se cumplen
 *
 * @param {string} requestId
 * @returns {{
 *   valid: boolean,
 *   requestId: string,
 *   chain: string[],
 *   events: number,
 *   errors: string[]
 * }}
 */
function replayRequest(requestId) {
  const history = getHistory(requestId);
  const errors = [];

  if (history.length === 0) {
    return {
      valid: false,
      requestId,
      chain: [],
      events: 0,
      errors: ["NO_EVENTS: no hay eventos para este request_id"],
    };
  }

  // Reaplicar cada evento en orden, como si fuera la primera vez
  const { validateTransition } = require("../validator/validateTransition");

  for (let i = 0; i < history.length; i++) {
    const event = history[i];
    const precedingEvents = history.slice(0, i);

    const result = validateTransition(event, precedingEvents);

    if (!result.valid) {
      errors.push({
        index: i,
        event_id: event.event_id || "(sin id)",
        action: event.action,
        role: event.role,
        errors: result.errors,
      });
    }
  }

  const chain = history.map((e) => {
    const role = e.role || "?";
    return `${role}:${e.action}`;
  });

  return {
    valid: errors.length === 0,
    requestId,
    chain,
    events: history.length,
    errors,
  };
}

/**
 * Replay completo de todas las solicitudes en el ledger.
 *
 * @returns {{ valid: boolean, totalEvents: number, requests: Object[], errors: Object[] }}
 */
function replayAll() {
  const { getAllRequestIds } = require("./store");
  const ids = getAllRequestIds();
  let totalEvents = 0;
  const allErrors = [];

  const requests = ids.map((id) => {
    const result = replayRequest(id);
    totalEvents += result.events;
    if (!result.valid) {
      allErrors.push({ requestId: id, errors: result.errors });
    }
    return result;
  });

  return {
    valid: allErrors.length === 0,
    totalEvents,
    requests,
    errors: allErrors,
  };
}

module.exports = { replayRequest, replayAll };