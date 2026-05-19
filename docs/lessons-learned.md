# Lecciones Aprendidas (v1.0-learning-demo)

## Qué se aprendió

Este proyecto, aunque mínimo en su implementación de lógica de negocio, ha servido como un artefacto pedagógico invaluable para comprender los principios de la gobernanza operacional en arquitecturas AI-native. Las principales lecciones aprendidas incluyen:

1.  **Gobernanza por restricciones estructurales**: La IA no necesita más autonomía, sino mejores constituciones operacionales. La gobernanza efectiva reside en límites explícitos y un enforcement determinista, no en la inferencia o el "razonamiento" de los agentes.
2.  **Separación de responsabilidades**: La clara delimitación entre `Intake`, `Governance`, `Validation` y `Execution` (y la distinción crítica `Decisión ≠ Legitimidad`) es fundamental para la trazabilidad, auditabilidad y control. Ninguna capa debe decidir por otra o ser omnisciente.
3.  **El Ledger como autoridad histórica**: El ledger append-only no es un mero log, sino la fuente única de verdad y autoridad operacional. El estado del sistema se deriva exclusivamente de este historial inmutable, garantizando consistencia y reproducibilidad.
4.  **Enforcement desacoplado de inferencia**: El `Validator` debe ser una autoridad externa y determinista. No "piensa" ni "interpreta", solo aplica reglas constitucionales. Esto protege la integridad estructural del workflow de la posible deriva del runtime.
5.  **Replay como verificación constitucional**: El mecanismo de replay permite auditar la integridad del historial re-ejecutando la validación constitucional. Esto proporciona reproducibilidad operacional y verifica que la causalidad histórica se mantiene legítima.
6.  **Observabilidad constitucional**: Los errores tipados (`ruleId`, `expected`, `received`) transforman los fallos técnicos en violaciones constitucionales explicables. Esto es crucial para entender *qué* principio se rompió y *por qué*.
7.  **Gobernanza del cambio (Git y ADRs)**: El uso disciplinado de Git con commits atómicos y ADRs para decisiones arquitectónicas es vital para preservar el *lineage evolutivo* del sistema y la *intención* detrás de cada cambio, no solo el código. La constitución del sistema debe poder evolucionar de forma controlada.

## Qué funcionó bien

-   La evolución incremental del proyecto, comenzando por la documentación (`docs/`) antes que el código (`src/`), permitió solidificar el modelo conceptual primero.
-   La implementación mínima del validator y el ledger en memoria fue suficiente para demostrar los principios sin introducir complejidad de infraestructura prematura.
-   Los escenarios de prueba (incluyendo los de fallo) y el `Replay` confirmaron que las restricciones operacionales se aplican de manera efectiva.
-   El diálogo iterativo durante el proceso ayudó a refinar las ideas y a hacer explícitos conceptos que inicialmente eran implícitos.

## Qué problemas se vieron o qué no se haría igual

-   La dependencia circular inicial entre `ledger.js` y `query.js` (resuelta con `store.js`) subraya la importancia de una arquitectura de módulos muy limpia, incluso en proyectos pequeños.
-   La falta de un sistema de versionado de reglas en `rules.js` (actualmente estático y global) es una limitación obvia para la evolución real de la constitución del sistema. Sería una prioridad en un proyecto real.

## Patrones arquitectónicos emergentes

-   **Constitutional Runtime Governance**: El runtime operativo está subordinado a un conjunto de restricciones constitucionales explícitas.
-   **Event Sourcing Básico**: El estado del sistema se deriva de una secuencia inmutable de eventos.
-   **Policy Enforcement Layer**: Una capa dedicada (el validator) se encarga de hacer cumplir las políticas estructurales.
-   **Observability-driven Governance**: Los mecanismos de observabilidad se diseñan para explicar las violaciones de la gobernanza.
-   **Immutable Log as Authority**: El ledger actúa como la autoridad final sobre la historia y la causalidad del sistema.

## Próximos pasos (hipotéticos en un proyecto real)

1.  **Versionado de reglas**: Implementar un mecanismo para versionar las reglas de validación y permitir replay contra versiones históricas.
2.  **Persistencia real**: Reemplazar el `Map` en memoria por un sistema de persistencia de eventos (ej. archivos de eventos en disco, base de datos de eventos, Kafka).
3.  **Agentes orquestados**: Introducir agentes o microservicios que orquesten las transiciones (`Intake`, `Governance`, `Validation`, `Execution`), respetando siempre el `Validator` y el `Ledger`.
4.  **Integración de ADRs**: Explorar cómo los ADRs podrían integrarse más directamente con el ciclo de vida del código (ej. generar tests de reglas a partir de ADRs).