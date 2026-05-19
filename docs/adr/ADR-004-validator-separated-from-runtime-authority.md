# ADR-004: Validator separated from runtime authority

**Estado**: Aceptado · **Fecha**: 2026-05-19 · **Decisor**: Equipo inicial

## Contexto

En sistemas complejos y especialmente en aquellos que integran IA, existe el riesgo de que el runtime (el código en ejecución o los agentes autónomos) derive de las reglas establecidas, reinterprete intenciones o se salte pasos. Es crucial garantizar que la legitimidad de una acción sea verificada por una autoridad externa al propio runtime de ejecución.

## Decisión

El `Validator` (implementado en `src/validator/`) es una **autoridad externa y desacoplada** del runtime de negocio y de los agentes de `Intake`, `Governance`, `Validation` y `Execution`. Su única responsabilidad es aplicar las reglas constitucionales definidas en `src/validator/rules.js` (y documentadas en `docs/transition-rules.md`).

- No interpreta intención.
- No decide lógica de negocio.
- No improvisa ni negocia reglas.
- Solo protege la integridad estructural del workflow.

## Consecuencias

- **Enforcement robusto**: La ejecución siempre se subordina a la validación constitucional, impidiendo bypasses o acciones no autorizadas.
- **Observabilidad constitucional**: Los errores del validator son tipados (`ruleId`, `expected`, `received`) para explicar con precisión qué principio constitucional se violó.
- **Desacoplamiento fuerte**: El runtime puede evolucionar o ser reemplazado sin afectar la lógica de validación estructural.
- **Protección del sistema**: El validator actúa como un guardián que protege el sistema no solo de actores externos, sino de la posible deriva o malfuncionamiento del propio runtime.

## Alternativas consideradas

- **Validación dentro del runtime de negocio**: Descartado porque acopla la lógica de enforcement con la de ejecución, dificultando la auditoría y la evolución independiente de las reglas.
- **Validación mediante prompts/razonamiento de IA**: Descartado por ser inherentemente probabilístico, opaco, difícil de auditar y no determinista. La gobernanza requiere certidumbre estructural, no inferencia.
- **Sin validación explícita**: Descartado porque permitiría un comportamiento incontrolado y sin trazabilidad, incompatible con los objetivos de gobernanza del proyecto.