/**
 * query.js
 *
 * Consultas sobre el ledger.
 *
 * El estado emerge de la secuencia de eventos válidos.
 * No existe "estado actual" mutable fuera del historial.
 */

const { getHistory, getAllRequestIds } = require("./store");

/**
 * Obtiene el historial completo de eventos para un request_id.
 *
 * @param {string} requestId
 * @returns {Object[]} Lista ordenada de eventos (vacía si no existe el request_id)
 */
function getHistoryEvents(requestId) {
  return getHistory(requestId);
}

/**
 * Reconstruye el estado actual de una solicitud a partir de su historial.
 * El estado se deriva del último evento de la cadena, no de una variable mutable.
 *
 * @param {string} requestId
 * @returns {{ exists: boolean, currentAction: string|null, lastEvent: Object|null, chain: string[] }}
 */
function getState(requestId) {
  const history = getHistory(requestId);
  if (history.length === 0) {
    return { exists: false, currentAction: null, lastEvent: null, chain: [] };
  }

  const lastEvent = history[history.length - 1];
  return {
    exists: true,
    currentAction: lastEvent.action,
    lastEvent,
    chain: history.map((e) => e.action),
  };
}

/**
 * Obtiene todos los request_id conocidos por el ledger.
 *
 * @returns {string[]}
 */
function listAllRequestIds() {
  return getAllRequestIds();
}

module.exports = { getHistory: getHistoryEvents, getState, getAllRequestIds: listAllRequestIds };