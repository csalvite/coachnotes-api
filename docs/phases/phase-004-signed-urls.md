# Phase 004 - Signed URLs for note attachments

## Objetivo

Permitir que el frontend pueda visualizar o reproducir adjuntos almacenados en buckets privados de Supabase Storage sin exponer los objetos como publicos.

## Endpoint actualizado

`GET /notes/:noteId/attachments` sigue protegido por Supabase Auth y ahora devuelve cada adjunto con una `signedUrl` temporal.

Ejemplo de respuesta:

```json
[
  {
    "id": "attachment-id",
    "noteId": "note-id",
    "type": "IMAGE",
    "path": "user-id/note-id/file.jpg",
    "signedUrl": "https://...",
    "fileName": "file.jpg",
    "mimeType": "image/jpeg",
    "fileSize": 12345,
    "metadata": {
      "bucket": "coachnotes-images",
      "path": "user-id/note-id/file.jpg"
    },
    "createdAt": "2026-06-14T00:00:00.000Z"
  }
]
```

## Expiracion

Las signed URLs expiran en 60 minutos.

La base de datos sigue guardando solo el path interno del objeto en `note_attachments.url`. Las signed URLs se generan dinamicamente en lectura y no se persisten.

## Validaciones

- El usuario debe estar autenticado con Supabase Auth.
- La nota debe pertenecer al usuario autenticado antes de listar adjuntos.
- El bucket se resuelve por `attachment.type`:
  - `IMAGE` -> `coachnotes-images`
  - `AUDIO` -> `coachnotes-audio`
  - `VIDEO` -> `coachnotes-video`

## Fallos parciales

Si Supabase Storage no puede generar la signed URL de un adjunto concreto, la API no rompe toda la respuesta. Ese adjunto se devuelve con `signedUrl: null`.

Esto permite que el frontend siga mostrando la lista y decida como representar adjuntos temporalmente no disponibles.

## Limitaciones actuales

- No hay transcripcion.
- No hay IA.
- No hay frontend.
- No se agregan cambios de estructura de base de datos.

## Proximos pasos

- Agregar pruebas de ownership y signed URLs.
- Definir estrategia de refresh de signed URLs en frontend.
- Implementar transcripcion y analisis IA en fases posteriores.
