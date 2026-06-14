# Phase 006 - Tags management

## Objetivo

Permitir gestionar tags del usuario autenticado y asociarlos a notas propias. Los tags ayudan a organizar CoachNotes como libreta rapida antes de incorporar IA.

## Endpoints de tags

Todos los endpoints requieren:

```http
Authorization: Bearer <supabase_access_token>
```

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/tags` | Crea un tag del usuario autenticado. |
| `GET` | `/tags` | Lista tags del usuario autenticado. |
| `PATCH` | `/tags/:id` | Actualiza un tag propio. |
| `DELETE` | `/tags/:id` | Borra un tag propio y sus relaciones en `note_tags`. |

## Endpoints de relacion con notas

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/notes/:noteId/tags/:tagId` | Asocia un tag a una nota. |
| `DELETE` | `/notes/:noteId/tags/:tagId` | Elimina la asociacion entre tag y nota. |
| `GET` | `/notes/:noteId/tags` | Lista tags asociados a una nota. |

## Validaciones

- Todos los endpoints estan protegidos con `SupabaseAuthGuard`.
- Un usuario solo puede ver, modificar o borrar sus propios tags.
- Un tag solo puede asociarse a una nota si ambos pertenecen al usuario autenticado.
- Las asociaciones no se duplican: `note_tags` usa clave compuesta `note_id` + `tag_id` y el servicio usa `upsert`.
- Al borrar un tag se eliminan primero sus relaciones en `note_tags`.

## Filtros en GET /notes

`GET /notes` mantiene su paginacion y filtros existentes, y agrega:

| Param | Tipo | Descripcion |
| --- | --- | --- |
| `tagId` | UUID | Devuelve notas asociadas a ese tag propio. |
| `tagName` | string | Devuelve notas asociadas a tags propios cuyo nombre coincide parcialmente. |

Los filtros por tag se combinan con el resto de filtros (`search`, `sourceType`, `isFavorite`, `isArchived`, `from`, `to`, `page`, `limit`) y siempre mantienen el filtro por usuario autenticado.

## Limitaciones actuales

- No hay sugerencias de tags con IA.
- No hay frontend.
- No hay normalizacion automatica de nombres.
- No se fuerza unicidad de nombre por usuario desde la API.

## Proximos pasos

- Agregar pruebas de ownership y asociaciones.
- Evaluar unicidad de tags por usuario si el producto lo necesita.
- Mostrar tags dentro de la respuesta de notas si el frontend lo requiere.
- Incorporar sugerencias de tags en fases de IA.
