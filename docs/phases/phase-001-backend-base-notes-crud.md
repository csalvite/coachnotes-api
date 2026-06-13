# Phase 001 - Backend base + Notes CRUD

## Objetivo

Dejar preparada la base del backend de CoachNotes con NestJS, Prisma y Supabase, e implementar el CRUD inicial de notas para poder guardar y consultar capturas rapidas de entrenadores.

Esta fase prioriza simplicidad y velocidad de captura. No incluye IA, adjuntos, transcripcion, generacion de sesiones ni auth completa.

## Endpoints creados en esta fase

Todos los endpoints trabajan sobre el recurso `notes`. En Phase 001 usaban `userId` temporal; desde Phase 002 el contrato actual usa `Authorization: Bearer <supabase_access_token>` y ya no acepta `userId` en body o query.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/notes` | Crea una nota. |
| `GET` | `/notes` | Lista notas no archivadas del usuario. |
| `GET` | `/notes/:id` | Obtiene una nota concreta del usuario. |
| `PATCH` | `/notes/:id` | Actualiza una nota. |
| `DELETE` | `/notes/:id` | Elimina una nota. |

## Estructura del modulo notes

```text
src/notes
  dto/
    create-note.dto.ts
    update-note.dto.ts
  notes.controller.ts
  notes.module.ts
  notes.service.ts
```

El controlador expone la API HTTP. El servicio contiene la logica de acceso a datos y comprueba que cada operacion este acotada al usuario propietario. Los DTOs usan `class-validator` para validar entradas basicas.

## Prisma

Se agrego un `PrismaModule` compartido:

```text
src/prisma
  prisma.module.ts
  prisma.service.ts
```

`PrismaService` extiende `PrismaClient` y conecta/desconecta con el ciclo de vida de NestJS.

## UserId temporal

En Phase 001 la API recibia un `userId` temporal en body o query segun el endpoint. Desde Phase 002 esto queda retirado: los endpoints de `notes` usan el usuario autenticado obtenido desde el JWT de Supabase Auth.

## Limitaciones actuales

- Phase 001 no incluia guards de autenticacion; esto se implementa en Phase 002.
- No se gestionan adjuntos ni Supabase Storage desde la API.
- No hay analisis IA ni transcripcion de audio.
- No hay generacion de sesiones.
- El borrado es fisico con `DELETE`; si se quiere papelera o recuperacion, se puede usar `is_archived` en una fase posterior.

## Proximos pasos

- Supabase Auth queda implementado en Phase 002.
- Definir politicas de acceso definitivas entre backend, Supabase y RLS.
- Agregar adjuntos sobre Supabase Storage.
- Preparar enriquecimiento con IA sobre `note_ai_analysis`.
- Agregar pruebas del modulo `notes` cuando se cierre el contrato de auth.
