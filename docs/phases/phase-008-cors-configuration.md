# Phase 008 - CORS configuration

## Objetivo

Permitir que el frontend Next.js local en `http://localhost:3000` pueda consumir la CoachNotes API local en `http://localhost:3001`.

## Configuracion

CORS se configura en `src/main.ts` con:

- origen permitido por defecto: `http://localhost:3000`
- variable opcional: `CORS_ORIGIN`
- metodos permitidos: `GET`, `POST`, `PATCH`, `PUT`, `DELETE`, `OPTIONS`
- headers permitidos: `Authorization`, `Content-Type`
- `credentials: true`

Ejemplo de entorno:

```text
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## Seguridad

No se usa `origin: *`. En desarrollo se permite solo el frontend local. Para produccion, `CORS_ORIGIN` debe apuntar al dominio real del frontend.

## Limitaciones actuales

- Solo se necesita un origen local por ahora.
- No se implementa lista multiple de origenes.
- No se agregan librerias nuevas.

## Proximos pasos

- Configurar `CORS_ORIGIN` por entorno cuando exista deployment.
- Evaluar lista de origenes si aparecen previews o entornos staging.
