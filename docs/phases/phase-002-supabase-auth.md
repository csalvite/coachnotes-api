# Phase 002 - Supabase Auth basico

## Objetivo

Proteger el CRUD de `notes` con autenticacion real de Supabase Auth. A partir de esta fase, la API deja de aceptar `userId` temporal en body o query y usa el usuario autenticado del JWT.

## Contrato de autenticacion

Los endpoints protegidos esperan el header:

```http
Authorization: Bearer <supabase_access_token>
```

El backend verifica la firma y expiracion del JWT con `SUPABASE_JWT_SECRET`. El `sub` del token se usa como `userId` autenticado y se adjunta al request como `request.user.id`.

Variable requerida:

```text
SUPABASE_JWT_SECRET=
```

## Endpoints protegidos

Todos los endpoints de `notes` requieren token Bearer:

| Metodo | Ruta | Comportamiento |
| --- | --- | --- |
| `POST` | `/notes` | Crea una nota con el usuario autenticado. |
| `GET` | `/notes` | Lista notas no archivadas del usuario autenticado. |
| `GET` | `/notes/:id` | Devuelve la nota solo si pertenece al usuario autenticado. |
| `PATCH` | `/notes/:id` | Modifica la nota solo si pertenece al usuario autenticado. |
| `DELETE` | `/notes/:id` | Borra la nota solo si pertenece al usuario autenticado. |

## Estructura de auth

```text
src/auth
  auth.module.ts
  authenticated-request.ts
  supabase-auth.guard.ts
```

`SupabaseAuthGuard` lee el token Bearer, valida el JWT y agrega el usuario autenticado al request. `NotesController` usa ese usuario para llamar a `NotesService`.

## Cambios sobre notes

- `CreateNoteDto` ya no recibe `userId`.
- `UpdateNoteDto` ya no recibe `userId`.
- `NotesController` ya no lee `userId` desde query o body.
- `NotesService` recibe el `userId` autenticado desde el controller y acota todas las consultas por `user_id`.

## Limitaciones actuales

- No se implementan uploads.
- No se implementa IA.
- No se implementa transcripcion.
- No se implementa frontend.
- El guard verifica JWT localmente con el secreto configurado; si se cambia la estrategia de firma de Supabase, habra que revisar esta verificacion.

## Proximos pasos

- Confirmar la configuracion final de secretos por entorno.
- Agregar pruebas de auth y ownership de notas.
- Preparar Supabase Storage para adjuntos.
- Implementar enriquecimiento IA en una fase posterior.
