# mini-governance-demo

Demo mínima de gobernanza operacional con separación explícita entre las fases de **intake**, **governance**, **validation** y **execution**, y un ledger **append-only** como registro inmutable de decisiones.

La especificación del modelo operacional se divide en tres documentos:

| Documento | Contenido |
|-----------|-----------|
| [`docs/governance-model.md`](docs/governance-model.md) | Roles, authority boundaries, semántica del ledger |
| [`docs/event-lifecycle.md`](docs/event-lifecycle.md) | Tipos de evento, transiciones válidas, `request_id` |
| [`docs/transition-rules.md`](docs/transition-rules.md) | Quién puede generar cada transición, prerequisitos, condiciones de invalidación |

## Filosofía

Este proyecto modela un pipeline de gobernanza inspirado en principios de arquitectura evolutiva y control operacional. Cada solicitud o propuesta atraviesa cuatro etapas diferenciadas:

1. **Intake** — captura y registro de la petición inicial.
2. **Governance** — evaluación, deliberación y decisión (aprobar, rechazar, ajustar).
3. **Validation** — verificación de que la decisión cumple reglas estructurales (una decisión no es lo mismo que una decisión legítima).
4. **Execution** — implementación de la decisión validada y registro del resultado.

Todas las decisiones y eventos se registran en un ledger inmutable (append-only) que funciona como fuente única de verdad operacional.

## Estructura del proyecto

```
mini-governance-demo/
├── docs/             # Documentación del modelo de gobernanza
├── ledger/           # Registro append-only de eventos y decisiones
├── prompts/          # Prompts / instrucciones para agentes o procesos
├── src/              # Código fuente (lógica de intake, governance y execution)
├── .gitignore
└── README.md
```

### `docs/`

Documentación del modelo operacional: roles, authority boundaries, ciclo de vida de eventos, reglas de transición y políticas.

### `ledger/`

Almacenamiento append-only. Cada entrada representa un evento inmutable (propuesta recibida, decisión tomada, acción ejecutada). Una vez escrita, no se modifica ni elimina.

### `prompts/`

Instrucciones reutilizables para procesos de intake, governance y execution. Pueden ser consumidas por agentes automatizados o seguidas por operadores humanos.

### `src/`

Implementación futura de los tres módulos:

- **`intake/`** — recepción y validación de propuestas.
- **`governance/`** — evaluación y toma de decisiones.
- **`execution/`** — ejecución de las decisiones acordadas.

## Estado actual

Estructura documental inicial. No incluye lógica de negocio ni implementación funcional.

## Principios

| Principio | Descripción |
|-----------|-------------|
| **Separación de fases** | Intake, governance, validation y execution son dominios distintos con responsabilidades claras. |
| **Autoridad explícita** | Cada rol tiene límites definidos de lo que puede y no puede hacer. |
| **Decision ≠ legitimidad** | Una decisión necesita validación estructural, no solo autoridad. |
| **Ledger inmutable** | Cada evento se registra una vez y no se altera (append-only). |
| **Trazabilidad** | Cada decisión es rastreable desde su origen (intake) hasta su resultado (execution). |
| **Sin lógica prematura** | Primero se define el modelo operacional; la implementación vendrá después. |
