# ADR-005: Replay as constitutional verification

**Estado**: Aceptado · **Fecha**: 2026-05-19 · **Decisor**: Equipo inicial

## Contexto

El ledger append-only registra el historial de eventos. Es fundamental poder verificar la integridad y coherencia de este historial de forma independiente y determinista, especialmente en un sistema donde el estado se deriva y la trazabilidad es crítica.

## Decisión

Se implementará un mecanismo de `Replay` (en `src/ledger/replay.js`) que permite **re-ejecutar la validación constitucional** sobre el historial de eventos de una solicitud. El replay no es un simple logging o visualización, sino una **verificación activa** de que cada transición en el historial fue legítima según las reglas activas en el momento de la re-ejecución.

- El replay verifica que el ledger sea internamente coherente.
- El replay es determinista: siempre produce el mismo resultado a partir del mismo historial.
- `Replay` NO muta el ledger, NO escribe, y NO interpreta intención de negocio.

## Consecuencias

- **Auditabilidad fuerte**: Es posible auditar la totalidad de la historia de una solicitud para detectar cualquier inconsistencia o violación pasada de las reglas constitucionales.
- **Reproducibilidad operacional**: Se puede reconstruir la cadena de legitimidad de cualquier acción, demostrando que `execution requires prior legitimacy`.
- **Verificación temporalmente desacoplada**: Un runtime puede aceptar un evento en un momento dado, pero el replay posterior puede detectar una inconsistencia si las reglas cambiaron o si hubo un error en la validación inicial (aunque el validator está diseñado para ser infalible en este modelo).
- **El ledger como autoridad**: Refuerza la noción de que el ledger es la fuente única de verdad y que el estado es derivado del historial.

## Alternativas consideradas

- **No implementar replay**: Descartado por sacrificar la auditabilidad profunda y la capacidad de verificar la integridad del ledger de forma independiente.
- **Replay como simple visualización**: Descartado porque no incluiría la re-validación constitucional, reduciendo su valor como herramienta de gobernanza. Se necesita una `re-ejecución` de las reglas, no solo una lectura.