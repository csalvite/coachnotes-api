# Phase 003 - Note attachments upload

## Objetivo

Permitir subir, listar y borrar adjuntos de una nota existente del usuario autenticado. Los adjuntos se guardan en Supabase Storage y se registran en `note_attachments`.

Esta fase no implementa transcripcion, IA, generacion de sesiones ni frontend.

## Buckets usados

Los buckets de Supabase Storage son privados:

| Mime type | Type guardado | Bucket |
| --- | --- | --- |
| `image/*` | `IMAGE` | `coachnotes-images` |
| `audio/*` | `AUDIO` | `coachnotes-audio` |
| `video/*` | `VIDEO` | `coachnotes-video` |

La API guarda el path privado del objeto en `note_attachments.url`. Tambien guarda `bucket` y `path` en `metadata` para facilitar operaciones internas. Desde Phase 004, ese path privado se transforma en una signed URL temporal al listar adjuntos.

## Endpoints creados

Todos los endpoints requieren:

```http
Authorization: Bearer <supabase_access_token>
```

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/notes/:noteId/attachments` | Recibe `multipart/form-data` con campo `file`, sube el archivo y crea el registro. |
| `GET` | `/notes/:noteId/attachments` | Lista adjuntos de la nota si pertenece al usuario autenticado. |
| `DELETE` | `/notes/:noteId/attachments/:attachmentId` | Borra el archivo de Storage y el registro de base de datos. |

## Validaciones

- El usuario debe estar autenticado con Supabase Auth.
- La nota debe pertenecer al usuario autenticado.
- El archivo es obligatorio.
- Solo se aceptan mime types `image/*`, `audio/*` y `video/*`.
- Al borrar, el attachment debe pertenecer a la nota indicada.
- El backend usa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`; la service role key nunca debe usarse en frontend.

## Por que buckets privados

Los adjuntos pueden incluir contenido sensible de entrenamientos, sesiones o ideas del entrenador. Por eso los buckets son privados y el backend actua como unica capa que decide si un usuario puede operar sobre un archivo.

En esta fase no se generaban signed URLs publicas o temporales. Desde Phase 004, la API devuelve el path privado y una `signedUrl` temporal para lectura desde frontend.

## Limitaciones actuales

- No hay transcripcion de audio.
- No hay analisis IA de imagen, audio o video.
- No hay generacion de sesiones.
- No hay frontend.
- Las signed URLs de lectura se agregan en Phase 004.
- El limite actual por archivo es de 100 MB.

## Proximos pasos

- Ajustar el frontend para consumir las signed URLs agregadas en Phase 004.
- Procesar audio con transcripcion.
- Enriquecer notas con IA usando los adjuntos.
- Definir reglas de compresion o normalizacion de archivos.
