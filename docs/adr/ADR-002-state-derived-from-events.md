# ADR-002: State derived from events

**Estado**: Aceptado · **Fecha**: 2026-05-19 · **Decisor**: inicial

## Contexto

El sistema necesita conocer el estado actual de cada solicitud (ej. si está pendiente de revisión, aprobada, rechazada o ejecutada). La opción ingenua es mantener una variable mutable de "estado actual" que se actualiza con cada transición.

## Decisión

El estado no se almacena como variable mutable. Se **deriva del historial** de eventos. `getState()` lee el ledger y extrae el último evento de la cadena para determinar el estado actual.

## Consecuencias

- No existe "estado actual" fuera del ledger.
- El estado es siempre consistente con el historial.
- Replay puede reconstruir el estado en cualquier punto del tiempo.
- No hay riesgo de que el estado mutante y el historial diverjan.

## Alternativas consideradas

- **Variable mutable `currentState`**: se descartó porque permite inconsistencias entre el estado y el historial de eventos.
- **Caché de estado sin referencia al ledger**: se descartó porque rompe la propiedad de que el ledger es la única fuente de verdad.