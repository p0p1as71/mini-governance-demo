/**
 * store.js
 *
 * Almacenamiento interno del ledger. Separado para evitar
 * dependencias circulares entre ledger.js y query.js.
 *
 * En producción sería un archivo, base de datos o stream.
 * Aquí es un Map keyeado por request_id.
 */

const _store = new Map();

function _reset() {
  _store.clear();
}

function getHistory(requestId) {
  return _store.get(requestId) || [];
}

function appendToStore(requestId, event) {
  if (!_store.has(requestId)) {
    _store.set(requestId, []);
  }
  _store.get(requestId).push(event);
}

function getAllRequestIds() {
  return Array.from(_store.keys());
}

module.exports = { _reset, getHistory, appendToStore, getAllRequestIds };