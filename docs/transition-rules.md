# Reglas de Transición

## ¿Quién valida las transiciones?

Conceptualmente aparece una nueva capa: **Transition Authority**. No decide negocio, no ejecuta. Solo comprueba si la transición solicitada es legal dentro del modelo de gobernanza.

```
Transition Authority
     ↓
¿la transición solicitada es legal?
     ↓
    ✅ permitida  →  se registra en el ledger
    ❌ denegada   →  se registra el rechazo
```

Esta capa aún no está implementada como código. Está definida como restricciones formales que cualquier runtime futuro deberá respetar.

## Qué actor puede generar qué transición

| Rol        | Puede generar                                       |
|------------|-----------------------------------------------------|
| Intaker    | `submitted`                                         |
| Governor   | `reviewed`, `rejected`                              |
| Validator  | `validated`, `rejected`                             |
| Executor   | `executed`                                          |
| Cualquiera | `correction` (solo si está autorizado y referenciando un evento existente) |

### Regla

Un actor no puede generar una transición fuera de su rol. Si `executor` emite `reviewed`, la transición es inválida aunque el formato del evento sea correcto.

## Qué transiciones requieren qué prerequisitos

### `submitted`

- No requiere ningún evento previo.
- Es la transición raíz de toda solicitud.

### `reviewed`

- **Requiere**: un evento `submitted` previo con el mismo `request_id`.
- **Requiere**: que el `request_id` exista en el ledger.
- **Requiere**: que no exista ya un evento `reviewed` para ese `request_id` (no se puede revisar dos veces la misma solicitud sin una corrección previa).

### `validated`

- **Requiere**: un evento `reviewed` previo con el mismo `request_id`.
- **Requiere**: que el `reviewed` previo tenga `decision: "approved"`. Una decisión rechazada no puede validarse.
- **Requiere**: que el `request_id` exista en el ledger.

### `rejected`

Puede emitirse desde governance o validation. En ambos casos:

- **Requiere**: un evento previo (`submitted` para governance, `reviewed` para validation) con el mismo `request_id`.
- **Requiere**: que el evento previo no esté ya en estado terminal (ejecutado o rechazado previamente).

### `executed`

- **Requiere**: un evento `submitted` previo con el mismo `request_id`.
- **Requiere**: un evento `reviewed` previo con `decision: "approved"`.
- **Requiere**: un evento `validated` previo con `result: "valid"`.
- **Requiere**: que `validated` sea el evento inmediatamente anterior en la secuencia de ese `request_id`. No puede ejecutarse si hay eventos intermedios no resueltos.
- **Requiere**: que todos los eventos previos tengan timestamps coherentes (cada evento posterior debe tener timestamp posterior al anterior).

### `correction`

- **Requiere**: que el evento referenciado (`corrects`) exista en el ledger.
- **Requiere**: que el actor esté autorizado (mismo rol que generó el evento original, o un rol superior explícitamente autorizado).
- **Requiere**: un `reason` explícito. No se permiten correcciones sin motivo documentado.

## Qué invalida una transición

| Condición                                | Ejemplo                                          |
|------------------------------------------|--------------------------------------------------|
| Actor sin rol válido                     | `executor` emite `reviewed`                      |
| Transición no permitida desde el estado actual | `submitted → executed`                     |
| `request_id` inexistente                 | Se intenta validar una solicitud no registrada   |
| `request_id` duplicado en raíz           | Dos eventos `submitted` con el mismo `request_id` |
| Ejecución sin validación previa          | `executed` sin `validated` precedente            |
| Decisión rechazada que se intenta validar | `reviewed` con `rejected` seguido de `validated` |
| Timestamps inconsistentes                | `validated` con timestamp anterior a `reviewed`  |
| Corrección sin motivo                    | `correction` sin campo `reason`                  |
| Evento huérfano                          | Evento que referencia un `request_id` que nunca fue `submitted` |

## Implicación arquitectónica

El runtime no es libre. Está constreñido por:

1. **Roles** — cada actor solo puede emitir las transiciones de su rol.
2. **Estado** — cada transición solo es válida desde ciertos estados previos.
3. **Integridad referencial** — todo evento debe encadenarse a un `request_id` existente y a eventos previos coherentes.
4. **Causalidad temporal** — los timestamps deben ser monótonos dentro de cada `request_id`.

Estas reglas constituyen la **constitución operacional** del sistema. Cualquier runtime —agente, humano, script— debe respetarlas para que una transición sea considerada legítima.