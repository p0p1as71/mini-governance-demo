# mini-governance-demo

Este proyecto es una **demostración mínima de gobernanza operacional** diseñada para explorar los principios de la arquitectura evolutiva y el control en sistemas AI-native. Se centra en la **separación explícita entre intake, governance, validation y execution**, la inmutabilidad a través de un **ledger append-only**, y el **enforcement constitucional**.

**Propósito principal**: Servir como un artefacto educativo que demuestre la importancia de las restricciones estructurales y la trazabilidad en workflows complejos, especialmente aquellos que involucran agentes autónomos.

## Problema que resuelve

Los sistemas modernos, y en particular los sistemas impulsados por IA, tienden a colapsar responsabilidades, dificultando la trazabilidad, auditoría y el control. Este proyecto aborda la necesidad de:

- Establecer límites de autoridad claros.
- Asegurar que la ejecución requiere legitimidad previa, no solo capacidad.
- Preservar el historial completo de decisiones y eventos de forma inmutable.
- Proveer observabilidad y explicabilidad sobre las violaciones de las reglas.

## Qué NO intenta resolver

Este proyecto deliberadamente **NO** incluye:

- Implementación de lógica de negocio real (ej. un chatbot, una API compleja).
- Agentes autónomos avanzados, memoria vectorial o embeddings.
- Bases de datos persistentes (usa un Map en memoria).
- Seguridad o autenticación de nivel de producción.
- Integraciones con frameworks o librerías externas complejas.

Su objetivo es puramente arquitectónico y de modelado operacional.

## Principios demostrados

| Principio | Descripción | Importancia en AI-Native |
|---|---|---|
| **Separación de fases** | Intake, governance, validation y execution son dominios distintos con responsabilidades claras. | Evita que un mismo agente decida, valide y ejecute, preservando trazabilidad y auditabilidad. |
| **Autoridad explícita** | Cada rol tiene límites definidos de lo que puede y no puede hacer. | Define constitucionalmente el alcance de cada participante, limitando la deriva de agentes autónomos. |
| **Decisión ≠ legitimidad** | Una decisión necesita validación estructural, no solo autoridad. | Asegura que las decisiones cumplen un marco legal/arquitectónico, protegiendo el sistema de decisiones arbitrarias. |
| **Ledger inmutable** | Cada evento se registra una vez y no se altera (append-only). | Permite la reconstrucción determinista de la historia (replay) y garantiza la inalterabilidad de la causalidad. |
| **Trazabilidad completa** | Cada decisión es rastreable desde su origen (intake) hasta su resultado (execution). | Facilita la auditoría, la depuración y la comprensión del 