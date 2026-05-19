# Arquitectura del Runtime

## Pipeline operacional

```
proposal
   ↓
validator (enforcement constitucional)
   ↓
append (ledger)
   ↓
ledger (persistencia inmutable)
   ↓
query (estado derivado)
   ↓
replay (verificación histórica)
```

Cada capa tiene una responsabilidad única. Ninguna capa decide por otra.

## Responsabilidades

### Proposal (evento propuesto)

Un actor emite un evento candidato. Incluye acción, rol, `request_id` y payload. El evento aún no forma parte del ledger.

**NO puede**: escribirse directamente en el ledger sin pasar por el validator.

### Validator (enforcement constitucional)

Protege la integridad estructural del sistema. Verifica:

1. **Acción válida** — la acción propuesta es un tipo de evento conocido.
2. **Rol autorizado** — el actor puede emitir esa acción según su rol.
3. **Transición legal** — el salto desde el último estado es válido según la máquina de estados.
4. **Cadena causal** — existen los eventos previos requeridos en el orden correcto.
5. **Condiciones semánticas** — los eventos previos tienen los valores esperados (ej. `decision === "approved"`).
6. **Campos obligatorios** — el evento incluye campos requeridos (ej. `reason` para `correction`).

**NO puede**: decidir negocio, interpretar intención, improvisar reglas, mutar el evento.

Los errores del validator son violaciones constitucionales tipadas con `ruleId`, `expected`, `received` y `message`.

### Append (ledger)

Si el validator aprueba, el evento se añade al final del historial del `request_id`. Solo append. Nunca se modifica ni elimina.

**NO puede**: aceptar eventos que el validator haya rechazado.

### Ledger (almacenamiento)

Persistencia inmutable del historial de eventos. En esta implementación es un `Map<request_id, events[]>` en memoria. En producción podría ser un archivo, base de datos o stream.

**NO puede**: modificar eventos existentes, reordenar entradas, aceptar escrituras sin validación.

### Query (estado derivado)

El estado actual de una solicitud se obtiene leyendo el historial. No existe una variable mutable de "estado actual". `getState()` devuelve el último evento y la cadena completa de acciones.

**NO puede**: escribir en el ledger, mutar estado, cachear resultados sin referencia al historial.

### Replay (verificación histórica)

Reconstruye el estado reaplicando la validación de cada evento en secuencia, como si fuera la primera vez. Verifica que el ledger internamente coherente: cada transición fue legal en su momento.

**NO puede**: mutar el ledger, modificar eventos, saltarse la validación.

## Flujo de datos

```
Actor → Evento propuesto
                  ↓
            Validator ──→ ❌ rechazado (errores con ruleId + expected + received)
                  ↓ ✅
            appendEvent()
                  ↓
            Ledger (append-only)
                  ↓
            Query (derivación de estado)
                  ↓
            Replay (verificación histórica)
```

## Mapa de módulos

| Módulo               | Archivo                     | Responsabilidad                           |
|----------------------|-----------------------------|-------------------------------------------|
| Rules                | `src/validator/rules.js`    | Definición formal de la constitución      |
| Validator            | `src/validator/validateTransition.js` | Enforcement constitucional       |
| Ledger               | `src/ledger/ledger.js`      | Append gobernado                          |
| Store                | `src/ledger/store.js`       | Almacenamiento interno                    |
| Query                | `src/ledger/query.js`       | Estado derivado del historial             |
| Replay               | `src/ledger/replay.js`      | Verificación histórica de integridad      |
| Demo                 | `src/index.js`              | Flujo end-to-end                          |

## Principios de la arquitectura

| Principio                           | Significado                                                     |
|-------------------------------------|-----------------------------------------------------------------|
| Validación antes que persistencia   | El ledger nunca recibe eventos inválidos                        |
| Estado derivado, no almacenado      | El estado emerge del historial, no de una variable mutable      |
| Enforcement desacoplado de inferencia| El validator no razona, no interpreta, solo aplica reglas      |
| Ledger como autoridad operacional   | El ledger no es un log secundario, es el núcleo del sistema     |
| Errores observables y tipados       | Toda violación incluye ruleId, expected, received, message      |
| El runtime no es libre              | Toda transición pasa por enforcement constitucional             |

## Diagrama de capas

```
┌─────────────────────────────────────────────────────────────┐
│                     Runtime (src/index.js)                   │
│  Propone eventos, orquesta el flujo, muestra resultados      │
├─────────────────────────────────────────────────────────────┤
│                     Validator                                 │
│  src/validator/validateTransition.js                         │
│  Enforcement constitucional. No interpreta intención.       │
├─────────────────────────────────────────────────────────────┤
│                     Ledger                                    │
│  src/ledger/ledger.js → store.js → query.js → replay.js     │
│  Append-only. Estado derivado. Replay determinista.          │
├─────────────────────────────────────────────────────────────┤
│                     Constitución                               │
│  docs/governance-model.md                                     │
│  docs/event-lifecycle.md                                      │
│  docs/transition-rules.md                                     │
│  src/validator/rules.js                                       │
└─────────────────────────────────────────────────────────────┘