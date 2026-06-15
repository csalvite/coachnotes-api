# Phase 008 - Audio transcription pipeline

## Objetivo

Transcribir automaticamente los adjuntos de audio subidos a una nota y guardar el resultado en base de datos sin bloquear la respuesta de subida.

## Flujo

```text
Audio upload
-> note_attachments creado
-> transcription_status=PENDING
-> proceso asincrono in-process
-> descarga desde Supabase Storage con Service Role
-> transcripcion OpenAI
-> transcription_status=COMPLETED o FAILED
```

## Modelo de datos

`note_attachments` incluye:

| Campo | Tipo | Uso |
| --- | --- | --- |
| `transcription` | `TEXT NULL` | Texto transcrito devuelto por OpenAI. |
| `transcription_status` | `transcription_status NULL` | Estado del proceso para adjuntos de audio. |

Enum `transcription_status`:

```text
PENDING
PROCESSING
COMPLETED
FAILED
```

El estado es nullable para que imagenes y videos no tengan un estado de transcripcion que no aplica.

## Subida de audio

`POST /notes/:noteId/attachments` sigue respondiendo inmediatamente despues de subir el archivo a Supabase Storage y crear el registro en base de datos.

Si el attachment es `AUDIO`, se guarda con:

```json
{
  "transcription": null,
  "transcriptionStatus": "PENDING"
}
```

Despues se dispara `processAudioTranscription(attachmentId)` en segundo plano dentro del proceso NestJS.

## Procesamiento

`processAudioTranscription(attachmentId)`:

1. Busca el attachment.
2. Ignora adjuntos inexistentes o que no sean `AUDIO`.
3. Marca `transcription_status=PROCESSING`.
4. Descarga el archivo desde el bucket privado `coachnotes-audio` usando `SUPABASE_SERVICE_ROLE_KEY`.
5. Envia el audio a OpenAI con `OPENAI_API_KEY` y el modelo `gpt-4o-transcribe`.
6. Guarda `transcription` y `transcription_status=COMPLETED`.
7. Si cualquier paso falla, marca `transcription_status=FAILED`.

No se introducen Redis, BullMQ ni workers externos en esta fase.

## Listado de adjuntos

`GET /notes/:noteId/attachments` devuelve las signed URLs existentes y los campos de transcripcion:

```json
{
  "id": "attachment-id",
  "type": "AUDIO",
  "signedUrl": "https://...",
  "transcription": "Texto transcrito...",
  "transcriptionStatus": "COMPLETED"
}
```

Para imagenes y videos, `transcription` y `transcriptionStatus` son `null`.

## Variables necesarias

```text
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

## Limitaciones

- El procesamiento corre en el mismo proceso de la API.
- Si el proceso se reinicia mientras un audio esta en `PROCESSING`, no hay reintento automatico todavia.
- Las colas persistentes y reintentos avanzados quedan para una fase futura.
