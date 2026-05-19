# Ciclo de Vida de Eventos

## Qué eventos existen

Cada evento representa una transición de estado en el pipeline. Todos se registran en el ledger.

| Evento       | Generado por     | Significado                                         |
|--------------|------------------|-----------------------------------------------------|
| `submitted`  | Intake           | Solicitud recibida y normalizada                    |
| `reviewed`   | Governance       | Solicitud evaluada, decisión tomada (aprobación/rechazo/ajuste) |
| `validated`  | Validation       | Decisión verificada contra reglas estructurales     |
| `rejected`   | Governance / Validation | Solicitud o decisión rechazada (con motivo)     |
| `executed`   | Execution        | Decisión validada implementada                      |
| `correction` | Cualquier rol autorizado | Corrección registrada como nuevo evento, sin mutar el pasado |

## Transiciones válidas

```
submitted ──→ reviewed ──→ validated ──→ executed
                  │              │
                  ↓              ↓
              rejected       rejected
```

### Reglas de transición

| Desde         | Hacia         | ¿Válida? | Notas                                              |
|---------------|---------------|----------|-----------------------------------------------------|
| `submitted`   | `reviewed`    | ✅        | Toda solicitud recibida debe ser evaluada           |
| `reviewed`    | `validated`   | ✅        | Decisión aprobada pasa a validación estructural     |
| `reviewed`    | `rejected`    | ✅        | Governance puede rechazar en evaluación             |
| `validated`   | `rejected`    | ✅        | Validation puede rechazar si no cumple reglas       |
| `validated`   | `executed`    | ✅        | Decisión validada pasa a ejecución                  |
| `submitted`   | `executed`    | ❌        | Nadie puede ejecutar sin decisión ni validación      |
| `submitted`   | `validated`   | ❌        | No se puede validar una solicitud sin evaluar       |
| `reviewed`    | `executed`    | ❌        | No se puede ejecutar sin validación estructural      |
| `executed`    | cualquier     | ❌        | Una vez ejecutado, el ciclo termina                 |

### Implicación arquitectónica

```
execution requires prior legitimacy
```

No basta con que alguien decida. La ejecución solo ocurre si existe una cadena completa:

```
solicitud registrada → decisión tomada → legitimidad verificada → ejecución
```

Cualquier atajo rompe el modelo de gobernanza.

## Identidad correlacional (`request_id`)

Cada solicitud recibe un `request_id` único en el momento de `submitted`. Ese identificador se propaga a todos los eventos relacionados, atravesando las fases del pipeline.

### Ejemplo

```json
{
  "request_id": "REQ-0001",
  "event_id": "EVT-0001",
  "phase": "intake",
  "action": "submitted",
  ...
}
```

```json
{
  "request_id": "REQ-0001",
  "event_id": "EVT-0002",
  "phase": "governance",
  "action": "reviewed",
  ...
}
```

### ¿Por qué es necesario?

- El **evento** es local: ocurre en una fase, en un momento, por un actor.
- La **solicitud** es transversal: cruza todo el pipeline.
- `request_id` permite reconstruir el lineage completo de una solicitud: desde que entra hasta que se ejecuta (o se rechaza).

## Semántica de `correction`

Las correcciones no mutan el ledger. Se registran como un nuevo evento que referencia al evento original:

```json
{
  "event_id": "EVT-0005",
  "request_id": "REQ-0001",
  "action": "correction",
  "corrects": "EVT-0002",
  "reason": "error en el campo actor",
  ...
}
```

Esto preserva:
- **Lineage**: la historia completa es visible.
- **Replay**: reproducir el ledger da el mismo resultado siempre.
- **Causalidad histórica**: ningún evento desaparece.

## Resumen del ciclo

1. Una solicitud entra por **Intake** → evento `submitted`.
2. **Governance** evalúa y decide → evento `reviewed` (o `rejected`).
3. **Validation** verifica la decisión → evento `validated` (o `rejected`).
4. **Execution** implementa → evento `executed`.

Cada paso queda registrado en el ledger. No hay estados ocultos ni decisiones fuera del sistema.