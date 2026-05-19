# ADR-003: Validator separated from runtime

**Estado**: Aceptado · **Fecha**: 2026-05-19 · **Decisor**: inicial

**Archivo**: `ADR-003-validator-separation.md`

## Contexto

El runtime necesita saber si un evento propuesto es válido antes de persistirlo. La opción ingenua es que el propio runtime contenga la lógica de validación, mezclando enforcement con ejecución.

## Decisión

El validator es un módulo independiente y desacoplado del runtime. Su responsabilidad es únicamente aplicar las reglas constitucionales. No decide negocio, no interpreta intención, no improvisa.

## Consecuencias

- El runtime puede ser sustituido sin cambiar las reglas de validación.
- Las reglas viven en `src/validator/rules.js`, separadas del motor de enforcement.
- Toda violación produce errores tipados con `ruleId`, `expected`, `received` y `message`.
- El ledger nunca recibe eventos que no hayan pasado por el validator.

## Alternativas consideradas

- **Validación dentro del runtime**: se descartó porque acopla enforcement con ejecución, dificulta auditoría y cambios de reglas.
- **Validación en base de datos (constraints SQL)**: se descartó porque el ledger no es una base de datos relacional.
- **Sin validación**: se descartó porque el sistema no tendría gobernanza real.