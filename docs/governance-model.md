# Modelo de Gobernanza Operacional

## Pipeline

```
intake
   ↓
governance
   ↓
validation
   ↓
execution
   ↓
ledger (append-only en todas las fases)
```

Cuatro fases diferenciadas, no tres. La separación entre **governance** y **validation** es crítica: una decide, la otra verifica legitimidad estructural.

## Diferenciación conceptual

| Fase        | Responsabilidad                                    | Analogía                     |
|-------------|----------------------------------------------------|------------------------------|
| Intake      | Capturar, normalizar y registrar la solicitud      | Ventanilla única             |
| Governance  | Decidir si algo debe hacerse                       | Parlamento / autoridad       |
| Validation  | Verificar que la decisión cumple reglas            | Tribunal / compliance        |
| Execution   | Implementar la decisión validada                   | Ejecutivo / operaciones      |

### Intake ≠ Governance

Recibir una solicitud no implica autoridad para decidir sobre ella.

### Governance ≠ Validation

Que algo se decida no significa que cumpla las reglas estructurales. Una decisión necesita legitimidad formal además de autoridad.

### Validation ≠ Execution

Validar no es ejecutar. Verificar reglas no implica implementar.

## Ciclo de vida de un evento

```
submitted → reviewed → validated → approved → executed → closed
```

Cada transición genera una entrada en el ledger.

## Roles

| Rol        | Responsabilidad                                    |
|------------|----------------------------------------------------|
| Intaker    | Registrar y normalizar solicitudes entrantes       |
| Governor   | Evaluar y decidir (aprobar, rechazar, ajustar)     |
| Validator  | Verificar que la decisión cumple reglas formales   |
| Executor   | Implementar la decisión validada                   |
| Ledger     | Registrar eventos de forma inmutable (append-only) |

## Authority boundaries (límites de autoridad)

### Intake

**Puede:**
- Recibir solicitudes de cualquier origen
- Normalizar y estructurar la solicitud
- Registrar la solicitud en el ledger

**NO puede:**
- Evaluar el fondo de la solicitud
- Aprobar ni rechazar
- Ejecutar la solicitud
- Modificar solicitudes ya registradas

### Governance

**Puede:**
- Evaluar el fondo de la solicitud
- Decidir: aprobar, rechazar, solicitar ajustes, escalar
- Registrar la decisión en el ledger

**NO puede:**
- Ejecutar directamente
- Omitir validación posterior
- Reinterpretar reglas estructurales
- Modificar decisiones ya registradas

### Validation

**Puede:**
- Verificar que la decisión cumple reglas formales y políticas
- Rechazar decisiones que no cumplen reglas estructurales
- Registrar el resultado de la validación en el ledger

**NO puede:**
- Decidir el fondo de la solicitud
- Ejecutar la decisión
- Modificar reglas de validación sobre la marcha
- Ignorar incumplimientos

### Execution

**Puede:**
- Implementar la decisión validada
- Reportar resultado (éxito, fallo, parcial)
- Registrar el resultado en el ledger

**NO puede:**
- Reinterpretar la decisión
- Desviarse del alcance aprobado
- Saltarse validación
- Modificar registros de ejecución previa

### Ledger

**Puede:**
- Aceptar nuevos eventos (append)
- Entregar historial completo bajo demanda
- Proveer hash de integridad (potencial)

**NO puede:**
- Modificar eventos existentes
- Eliminar entradas
- Aceptar eventos sin actor identificado
- Reordenar eventos

## Semántica del ledger

### Append-only

Solo se añaden entradas nuevas. Nunca se modifican ni eliminan entradas existentes.

### Immutable

Una vez escrita, una entrada no cambia. Cualquier corrección se registra como un nuevo evento de tipo `correction` que referencia al evento original.

### Source of truth

El ledger es la fuente única de verdad operacional. No existen estados paralelos ni memorias ambiguas. Toda decisión, transición y resultado vive exclusivamente en el ledger.

## Estructura de un evento

Cada evento en el ledger contiene:

```json
{
  "event_id": "uuid",
  "actor": "identificador del actor",
  "role": "intaker | governor | validator | executor",
  "action": "submitted | reviewed | validated | approved | rejected | executed | closed",
  "phase": "intake | governance | validation | execution",
  "timestamp": "ISO 8601",
  "payload": { },
  "previous_event_hash": "hash del evento anterior (futuro)"
}
```

| Campo               | Propósito                                           |
|---------------------|------------------------------------------------------|
| `event_id`          | Identificador único del evento                       |
| `actor`             | Quién realizó la acción                              |
| `role`              | Bajo qué rol actuó                                   |
| `action`            | Qué acción se tomó                                   |
| `phase`             | En qué fase del pipeline ocurrió                     |
| `timestamp`         | Cuándo ocurrió                                       |
| `payload`           | Datos específicos del evento                         |
| `previous_event_hash` | Encadenamiento criptográfico (pendiente de implementar) |

## Principios rectores

| Principio                      | Descripción                                                       |
|--------------------------------|-------------------------------------------------------------------|
| Separación de fases            | Intake, governance, validation y execution son dominios distintos |
| Autoridad explícita            | Cada rol tiene límites claros de lo que puede y no puede hacer    |
| Ledger inmutable               | Append-only como única fuente de verdad                           |
| Trazabilidad completa          | Toda decisión es rastreable desde origen hasta resultado          |
| Decision ≠ legitimidad         | Una decisión necesita validación estructural, no solo autoridad   |
| Sin lógica prematura           | Primero el modelo operacional; la implementación después          |