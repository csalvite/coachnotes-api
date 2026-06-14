# CoachNotes API - Manual testing guide

Esta guia sirve para probar manualmente los endpoints implementados hasta Phase 007: auth, notes, attachments, signed URLs y tags.

Los ejemplos usan `curl` y asumen que la API esta corriendo localmente. Esta guia no requiere levantar `start:dev`; solo documenta como probar cuando el servidor este disponible.

## Variables necesarias

Backend:

```text
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Uso de cada variable:

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexion Prisma normal. |
| `DIRECT_URL` | Conexion directa Prisma cuando aplique. |
| `SUPABASE_URL` | URL del proyecto Supabase. |
| `SUPABASE_ANON_KEY` | Puede usarse para conseguir tokens de prueba contra Supabase Auth. |
| `SUPABASE_SERVICE_ROLE_KEY` | Uso exclusivo backend para Supabase Auth/Storage privado. Nunca usar en frontend. |

Variables locales recomendadas para probar con `curl`:

```bash
API_URL="http://localhost:3001"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
EMAIL="coach@example.com"
PASSWORD="your-password"
```

## Conseguir un access_token de Supabase Auth

Si el usuario ya existe y tiene email/password habilitado:

```bash
curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }"
```

La respuesta incluye `access_token`. Guardalo:

```bash
TOKEN="paste-access-token-here"
```

Todas las rutas protegidas deben enviar:

```bash
-H "Authorization: Bearer $TOKEN"
```

Si necesitas crear un usuario de prueba y el proyecto permite signup:

```bash
curl -s -X POST "$SUPABASE_URL/auth/v1/signup" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }"
```

## Notes

### POST /notes

```bash
curl -s -X POST "$API_URL/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Entreno lunes",
    "rawContent": "Ejercicio de finalizacion tras pared.",
    "sourceType": "TEXT",
    "isFavorite": true
  }'
```

Guarda el `id` devuelto:

```bash
NOTE_ID="paste-note-id-here"
```

### GET /notes

Lista paginada, por defecto no archivadas:

```bash
curl -s "$API_URL/notes" \
  -H "Authorization: Bearer $TOKEN"
```

Con busqueda, filtros y paginacion:

```bash
curl -s "$API_URL/notes?search=finalizacion&sourceType=TEXT&isFavorite=true&page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

Con fechas:

```bash
curl -s "$API_URL/notes?from=2026-06-01T00:00:00.000Z&to=2026-06-30T23:59:59.999Z" \
  -H "Authorization: Bearer $TOKEN"
```

Con tags:

```bash
curl -s "$API_URL/notes?tagId=$TAG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

```bash
curl -s "$API_URL/notes?tagName=ataque" \
  -H "Authorization: Bearer $TOKEN"
```

Formato de respuesta:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### GET /notes/:id

```bash
curl -s "$API_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### PATCH /notes/:id

```bash
curl -s -X PATCH "$API_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Entreno lunes actualizado",
    "isFavorite": false
  }'
```

### DELETE /notes/:id

```bash
curl -i -X DELETE "$API_URL/notes/$NOTE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta esperada: `204 No Content`.

## Attachments

Los adjuntos pertenecen a notas. Primero crea o localiza un `NOTE_ID`.

Tipos aceptados:

| Mime type | Bucket privado |
| --- | --- |
| `image/*` | `coachnotes-images` |
| `audio/*` | `coachnotes-audio` |
| `video/*` | `coachnotes-video` |

### POST /notes/:noteId/attachments

El campo multipart debe llamarse `file`.

Imagen:

```bash
curl -s -X POST "$API_URL/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./sample.jpg"
```

Audio:

```bash
curl -s -X POST "$API_URL/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./sample.m4a"
```

Video:

```bash
curl -s -X POST "$API_URL/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./sample.mp4"
```

Guarda el `id` devuelto:

```bash
ATTACHMENT_ID="paste-attachment-id-here"
```

### GET /notes/:noteId/attachments

```bash
curl -s "$API_URL/notes/$NOTE_ID/attachments" \
  -H "Authorization: Bearer $TOKEN"
```

Cada attachment devuelve:

```json
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
```

### DELETE /notes/:noteId/attachments/:attachmentId

```bash
curl -i -X DELETE "$API_URL/notes/$NOTE_ID/attachments/$ATTACHMENT_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta esperada: `204 No Content`.

## Tags

### POST /tags

```bash
curl -s -X POST "$API_URL/tags" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ataque",
    "color": "#22c55e"
  }'
```

Guarda el `id` devuelto:

```bash
TAG_ID="paste-tag-id-here"
```

### GET /tags

```bash
curl -s "$API_URL/tags" \
  -H "Authorization: Bearer $TOKEN"
```

### PATCH /tags/:id

```bash
curl -s -X PATCH "$API_URL/tags/$TAG_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ataque organizado",
    "color": "#16a34a"
  }'
```

### DELETE /tags/:id

```bash
curl -i -X DELETE "$API_URL/tags/$TAG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta esperada: `204 No Content`. Tambien elimina sus relaciones en `note_tags`.

## Note tags

### POST /notes/:noteId/tags/:tagId

```bash
curl -s -X POST "$API_URL/notes/$NOTE_ID/tags/$TAG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Si la relacion ya existe, no se duplica.

### GET /notes/:noteId/tags

```bash
curl -s "$API_URL/notes/$NOTE_ID/tags" \
  -H "Authorization: Bearer $TOKEN"
```

### DELETE /notes/:noteId/tags/:tagId

```bash
curl -i -X DELETE "$API_URL/notes/$NOTE_ID/tags/$TAG_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta esperada: `204 No Content`.

## Buckets privados y signed URLs

Los buckets `coachnotes-images`, `coachnotes-audio` y `coachnotes-video` son privados porque los archivos pueden contener informacion sensible de entrenamientos, ideas o sesiones.

La API guarda en base de datos solo el path interno del objeto. En `GET /notes/:noteId/attachments`, el backend genera `signedUrl` temporal para que el frontend pueda visualizar o reproducir el archivo. Las signed URLs expiran en 60 minutos.

Si la signed URL falla para un adjunto concreto, ese adjunto se devuelve con:

```json
{
  "signedUrl": null
}
```

La lista completa no falla por un error parcial de signed URL.

## Problemas comunes

### 401 Missing bearer token

Falta el header:

```bash
-H "Authorization: Bearer $TOKEN"
```

### 401 Invalid or expired token

El token expiro, esta mal copiado o Supabase Auth no lo reconoce. Pide un token nuevo a Supabase Auth.

### 401 Supabase auth is not configured

Falta `SUPABASE_URL` o una clave Supabase de backend (`SUPABASE_SERVICE_ROLE_KEY` o `SUPABASE_ANON_KEY`) en el entorno.

### 404 Note not found

La nota no existe o pertenece a otro usuario. La API devuelve el mismo tipo de error para no exponer ownership.

### 404 Tag not found

El tag no existe o pertenece a otro usuario.

### 400 Unsupported attachment type

El mime type del archivo no empieza por `image/`, `audio/` o `video/`.

### 500 Supabase Storage is not configured

Falta `SUPABASE_URL` o `SUPABASE_SERVICE_ROLE_KEY` en el entorno del backend.

### signedUrl null

El registro existe, pero Supabase no pudo firmar el path. Revisa que el objeto exista en el bucket correcto y que `SUPABASE_SERVICE_ROLE_KEY` sea valida.

### GET /notes devuelve menos resultados de lo esperado

Por defecto `GET /notes` filtra `isArchived=false`. Para ver archivadas:

```bash
curl -s "$API_URL/notes?isArchived=true" \
  -H "Authorization: Bearer $TOKEN"
```

Para revisar paginacion:

```bash
curl -s "$API_URL/notes?page=1&limit=100" \
  -H "Authorization: Bearer $TOKEN"
```
