# ADR-001 - Usar Supabase

## Estado

Aceptada.

## Contexto

CoachNotes necesita una base rapida para usuarios, persistencia y archivos. El producto apunta a una experiencia mobile-first donde entrenadores puedan capturar notas, imagenes, audio y video sin dedicar esfuerzo inicial a infraestructura propia.

## Decision

Usaremos Supabase como plataforma base para:

- PostgreSQL como base de datos principal.
- Supabase Auth como sistema de usuarios.
- Supabase Storage para imagenes, audio y video.

El backend NestJS accedera a PostgreSQL mediante Prisma. Supabase Auth se integrara en una fase posterior para reemplazar el `userId` temporal usado durante Phase 001.

## Consecuencias

- Se reduce el tiempo de arranque del producto.
- La base de datos sigue siendo PostgreSQL estandar.
- Storage y Auth quedan preparados dentro del mismo ecosistema.
- Hay que coordinar cuidadosamente Prisma, permisos de base de datos y politicas RLS de Supabase.

## Limitaciones actuales

En Phase 001 no se implementan guards de Supabase Auth, subida de archivos ni flujos de Storage. Las tablas existen, pero solo se usa el CRUD basico de `notes`.
