# Phase 005 - Notes search and filters

## Objetivo

Mejorar `GET /notes` para que CoachNotes funcione mejor como libreta rapida antes de incorporar IA. La API permite buscar, filtrar y paginar notas del usuario autenticado.

## Endpoint actualizado

```http
GET /notes
Authorization: Bearer <supabase_access_token>
```

Query params soportados:

| Param | Tipo | Descripcion |
| --- | --- | --- |
| `search` | string | Busca en `title`, `rawContent` y `cleanContent`. |
| `sourceType` | string | Filtra por origen de la nota. |
| `isFavorite` | boolean | Filtra favoritas o no favoritas. |
| `isArchived` | boolean | Filtra archivadas o no archivadas. Por defecto es `false`. |
| `from` | date | Filtra notas creadas desde esta fecha. |
| `to` | date | Filtra notas creadas hasta esta fecha. |
| `page` | number | Pagina actual. Por defecto `1`. |
| `limit` | number | Resultados por pagina. Por defecto `20`, maximo `100`. |

## Respuesta

`GET /notes` ahora devuelve datos y metadata de paginacion:

```json
{
  "data": [
    {
      "id": "note-id",
      "userId": "user-id",
      "title": "Entreno lunes",
      "rawContent": "Trabajo de finalizacion",
      "cleanContent": null,
      "sourceType": "TEXT",
      "isFavorite": false,
      "isArchived": false,
      "createdAt": "2026-06-14T00:00:00.000Z",
      "updatedAt": "2026-06-14T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## Validaciones y comportamiento

- El endpoint sigue protegido por Supabase Auth.
- Siempre se filtra por el usuario autenticado.
- El orden por defecto es `createdAt desc`.
- Si `isArchived` no se envia, se devuelven solo notas no archivadas para mantener el comportamiento anterior.
- `limit` no puede superar `100`.
- `from` y `to` deben ser fechas validas.

## Limitaciones actuales

- No hay embeddings.
- No hay busqueda semantica.
- No hay IA.
- No hay frontend.
- La busqueda es textual sobre columnas existentes.

## Proximos pasos

- Agregar tests de filtros y paginacion.
- Incorporar busqueda semantica cuando exista la fase de IA.
- Ajustar indices si el volumen de notas lo requiere.
