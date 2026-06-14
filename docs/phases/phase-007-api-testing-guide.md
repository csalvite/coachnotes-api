# Phase 007 - API testing guide and cleanup

## Objetivo

Revisar los modulos actuales y crear una guia practica para probar manualmente todos los endpoints implementados hasta ahora.

## Modulos revisados

- `auth`
- `notes`
- `attachments`
- `tags`

No se detecto un bug claro que justificara cambiar logica en esta fase.

## Documentacion creada

Se agrego:

```text
docs/api/manual-testing-guide.md
```

La guia incluye:

- variables necesarias de entorno
- como conseguir un `access_token` de Supabase Auth
- como enviar `Authorization: Bearer <token>`
- ejemplos `curl` para notes, attachments y tags
- notas sobre buckets privados y signed URLs
- problemas comunes durante pruebas manuales

## Alcance

Esta fase es de documentacion y verificacion. No implementa:

- IA
- transcripcion
- frontend
- cambios de modelo de datos

## Verificacion esperada

Antes de cerrar esta fase se ejecutan:

```bash
npm run build
npm run lint
```

No se levanta `start:dev`.
