# ADR-002 - Usar Prisma y NestJS

## Estado

Aceptada.

## Contexto

CoachNotes necesita un backend mantenible, tipado y facil de ampliar. La primera fase requiere un CRUD sencillo, pero el producto crecera hacia adjuntos, analisis IA, sesiones generadas y autenticacion real.

## Decision

Usaremos NestJS 11 como framework HTTP y Prisma 6 como capa de acceso a PostgreSQL.

NestJS aporta modulos, controladores, servicios, validacion con DTOs y una estructura clara para crecer por fases. Prisma aporta cliente tipado, introspeccion de la base existente en Supabase y consultas simples sobre PostgreSQL.

## Consecuencias

- El codigo queda organizado por modulos funcionales.
- Los DTOs permiten validar contratos de entrada desde el inicio.
- Prisma encaja con el `db pull` actual y evita escribir SQL manual para el CRUD base.
- El schema introspectado mantiene nombres de tablas y campos existentes, por lo que la capa de servicio traduce entre API camelCase y columnas snake_case.

## Limitaciones actuales

En Phase 001 no se modela una capa de dominio compleja ni repositorios adicionales. El objetivo es mantener el backend simple hasta que aparezcan necesidades reales con auth, adjuntos e IA.
