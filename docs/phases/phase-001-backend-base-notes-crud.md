# Phase 001 - Backend base + Notes CRUD

## Objetivo

Dejar preparada la base del backend de CoachNotes con NestJS, Prisma y Supabase, e implementar el CRUD inicial de notas para poder guardar y consultar capturas rapidas de entrenadores.

Esta fase prioriza simplicidad y velocidad de captura. No incluye IA, adjuntos, transcripcion, generacion de sesiones ni auth completa.

## Endpoints creados

Todos los endpoints trabajan sobre el recurso `notes`.

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/notes` | Crea una nota. Recibe `userId` temporal en el body. |
| `GET` | `/notes?userId=...` | Lista notas no archivadas del usuario temporal. |
| `GET` | `/notes/:id?userId=...` | Obtiene una nota concreta del usuario temporal. |
| `PATCH` | `/notes/:id?userId=...` | Actualiza una nota. El `userId` temporal puede ir en query o body. |
| `DELETE` | `/notes/:id?userId=...` | Elimina una nota del usuario temporal. |

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

El controlador expone la API HTTP. El servicio contiene la logica de acceso a datos y comprueba que cada operacion este acotada al `userId` temporal. Los DTOs usan `class-validator` para validar entradas basicas.

## Prisma

Se agrego un `PrismaModule` compartido:

```text
src/prisma
  prisma.module.ts
  prisma.service.ts
```

`PrismaService` extiende `PrismaClient` y conecta/desconecta con el ciclo de vida de NestJS.

## UserId temporal

Hasta implementar Supabase Auth, la API recibe un `userId` temporal en body o query segun el endpoint. Esto existe solo para esta fase y sera sustituido por el usuario autenticado obtenido desde Supabase Auth en la siguiente fase.

## Limitaciones actuales

- No hay guards de autenticacion.
- No se gestionan adjuntos ni Supabase Storage desde la API.
- No hay analisis IA ni transcripcion de audio.
- No hay generacion de sesiones.
- El borrado es fisico con `DELETE`; si se quiere papelera o recuperacion, se puede usar `is_archived` en una fase posterior.

## Proximos pasos

- Integrar Supabase Auth y eliminar el `userId` temporal de requests.
- Definir politicas de acceso definitivas entre backend, Supabase y RLS.
- Agregar adjuntos sobre Supabase Storage.
- Preparar enriquecimiento con IA sobre `note_ai_analysis`.
- Agregar pruebas del modulo `notes` cuando se cierre el contrato de auth.
