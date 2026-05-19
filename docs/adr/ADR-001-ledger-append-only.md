# ADR-001: Ledger append-only

**Estado**: Aceptado · **Fecha**: 2026-05-19 · **Decisor**: inicial

## Contexto

El sistema necesita un registro inmutable de eventos operacionales. Sin esto, no es posible tener trazabilidad, replay o auditoría de decisiones.

## Decisión

El ledger será **append-only**. Las entradas se añaden al final del historial de un `request_id`. Una vez escritas, no se modifican ni eliminan.

## Consecuencias

- Cualquier corrección debe registrarse como un nuevo evento de tipo `correction` que referencia al evento original.
- El estado del sistema se deriva del historial, no existe una variable mutable de "estado actual".
- El ledger funciona como fuente única de verdad operacional.

## Alternativas consideradas

- **Base de datos mutable**: se descartó porque permite modificar el pasado y rompe la trazabilidad.
- **Log plano sin estructura**: se descartó porque no permite reconstruir estado por `request_id`.