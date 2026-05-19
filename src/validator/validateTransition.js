/**
 * validateTransition.js
 *
 * Enforcement de la constitución operacional.
 * No decide negocio, no interpreta intención, no improvisa.
 * Solo protege integridad estructural.
 *
 * Los errores incluyen metadatos de governance observability:
 *   ruleId    — identificador de la regla constitucional violada
 *   expected  — qué se esperaba
 *   received  — qué se encontró
 *   message   — descripción legible
 *
 * Uso:
 *   const result = validateTransition(eventoPropuesto, historialEventos);
 *   // result.valid === true | false
 *   // result.errors[]  → lista de violaciones estructuradas
 */

const { VALID_TRANSITIONS, ACTION_PREREQUISITES, actionsForRole } = require("./rules");

/**
 * Valida una transición propuesta contra el historial existente.
 *
 * @param {Object} event - Evento propuesto { action, role, request_id, payload, timestamp, ... }
 * @param {Array}  history - Lista de eventos existentes para ese request_id
 * @returns {{ valid: boolean, errors: Object[] }}
 */
function validateTransition(event, history) {
  const errors = [];

  // 1. Validar que la acción sea una transición conocida
  if (!VALID_TRANSITIONS[event.action]) {
    errors.push({
      ruleId: "UNKNOWN_ACTION",
      expected: `una acción válida: [${Object.keys(VALID_TRANSITIONS).join(", ")}]`,
      received: event.action,
      message: `"${event.action}" no es una acción válida`,
    });
    return { valid: false, errors };
  }

  // 2. Validar que el rol pueda emitir esta acción
  const allowedActions = actionsForRole(event.role);
  if (!allowedActions.includes(event.action)) {
    errors.push({
      ruleId: "ROLE_ACTION_MISMATCH",
      expected: `el rol "${event.role}" puede emitir: [${allowedActions.join(", ")}]`,
      received: `${event.role} emitió "${event.action}"`,
      message: `el rol "${event.role}" no puede emitir "${event.action}"`,
    });
  }

  // 3. Validar última transición conocida (máquina de estados)
  const lastEvent = history.length > 0 ? history[history.length - 1] : null;
  const lastAction = lastEvent ? lastEvent.action : null;

  if (lastAction) {
    const allowedNext = VALID_TRANSITIONS[lastAction];
    if (!allowedNext || !allowedNext.includes(event.action)) {
      errors.push({
        ruleId: "INVALID_TRANSITION",
        expected: `desde "${lastAction}" se permite: [${(allowedNext || []).join(", ")}]`,
        received: `"${lastAction}" → "${event.action}"`,
        message: `"${lastAction}" → "${event.action}" no es una transición válida`,
      });
    }
  } else {
    // Si no hay historial, la única acción válida es "submitted"
    if (event.action !== "submitted") {
      errors.push({
        ruleId: "INVALID_TRANSITION",
        expected: '"submitted" como primer evento',
        received: event.action,
        message: `Sin eventos previos, la única acción válida es "submitted", no "${event.action}"`,
      });
    }
  }

  // 4. Validar prerequisitos de cadena (requiresChain)
  const prereqs = ACTION_PREREQUISITES[event.action];
  if (prereqs && prereqs.requiresChain && prereqs.requiresChain.length > 0) {
    const actionsInHistory = history.map((e) => e.action);

    for (let i = 0; i < prereqs.requiresChain.length; i++) {
      const requirement = prereqs.requiresChain[i];
      const expectedAction = requirement.action;

      if (actionsInHistory[i] !== expectedAction) {
        // Verificar si el fallo es por campo (la acción existe pero su field no coincide)
        if (requirement.field && actionsInHistory[i] === expectedAction) {
          const eventAtPos = history[i];
          const actualValue = getNestedValue(eventAtPos, requirement.field);
          errors.push({
            ruleId: "CHAIN_FIELD_MISMATCH",
            expected: `${expectedAction}.${requirement.field} = "${requirement.expected}"`,
            received: `${expectedAction}.${requirement.field} = "${actualValue}"`,
            message: `En posición ${i} se esperaba "${expectedAction}" con ${requirement.field} = "${requirement.expected}", pero se encontró "${actualValue}"`,
          });
        } else {
          errors.push({
            ruleId: "CHAIN_REQUIREMENT",
            expected: `"${expectedAction}" en posición ${i}`,
            received: `"${actionsInHistory[i] || "(ninguno)"}" en posición ${i}`,
            message: `Se requiere "${expectedAction}" previo en posición ${i}`,
          });
        }
        break;
      }
    }
  }

  // 5. Validar condiciones sobre eventos previos (requiresEvent)
  if (prereqs && prereqs.requiresEvent) {
    for (const [action, conditions] of Object.entries(prereqs.requiresEvent)) {
      const matchingEvent = history.find((e) => e.action === action);
      if (!matchingEvent && Object.keys(conditions).length > 0) {
        errors.push({
          ruleId: "PREREQUISITE_EVENT_MISSING",
          expected: `evento "${action}" previo`,
          received: `no existe evento "${action}" en el historial de ${event.request_id}`,
          message: `Se requiere un evento "${action}" previo`,
        });
        continue;
      }
      for (const [fieldPath, expectedValue] of Object.entries(conditions)) {
        if (matchingEvent) {
          const actualValue = getNestedValue(matchingEvent, fieldPath);
          if (actualValue !== expectedValue) {
            errors.push({
              ruleId: "PREREQUISITE_FIELD_MISMATCH",
              expected: `${fieldPath} = "${expectedValue}"`,
              received: `${fieldPath} = "${actualValue}"`,
              message: `En evento "${action}" se esperaba "${fieldPath}" === "${expectedValue}", pero se encontró "${actualValue}"`,
            });
          }
        }
      }
    }
  }

  // 6. Validar campos obligatorios en el evento propuesto (requiresFields)
  if (prereqs && prereqs.requiresFields) {
    for (const [field, expectedType] of Object.entries(prereqs.requiresFields)) {
      const value = event[field];
      if (value === undefined || value === null) {
        errors.push({
          ruleId: "REQUIRED_FIELD_MISSING",
          expected: `campo "${field}" de tipo "${expectedType}"`,
          received: `"${field}" no presente o nulo`,
          message: `El campo "${field}" es obligatorio para "${event.action}"`,
        });
      } else if (typeof value !== expectedType) {
        errors.push({
          ruleId: "REQUIRED_FIELD_TYPE",
          expected: `"${field}" de tipo "${expectedType}"`,
          received: `"${field}" es tipo "${typeof value}"`,
          message: `El campo "${field}" debe ser de tipo "${expectedType}", pero es "${typeof value}"`,
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Accede a un valor anidado en un objeto usando notación de puntos.
 * Ejemplo: getNestedValue({ a: { b: 1 } }, "a.b") → 1
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

module.exports = { validateTransition };