# Flujo de trabajo y despliegue

## Camino normal de cada mejora

1. Crear una rama desde `develop` con un nombre como `codex/nombre-del-cambio`.
2. Hacer el cambio sin agregar datos reales ni credenciales.
3. Ejecutar `npm run check`.
4. Subir la rama y abrir un Pull Request hacia `develop`.
5. Esperar que GitHub Actions termine correctamente y revisar el cambio.
6. Integrar `develop` en `main` mediante otro Pull Request cuando la versión esté lista para producción.
7. Render despliega automáticamente sólo los cambios que llegan a `main`.

Para un arreglo urgente de producción, crear `hotfix/...` desde `main`, abrir el Pull Request hacia `main` y luego llevar el mismo arreglo a `develop`.

## Protecciones que se activan una sola vez en GitHub

En **Settings > Branches**, proteger `main` y `develop`:

- exigir Pull Request antes de fusionar;
- exigir una aprobación;
- exigir la comprobación `Compilar y probar`;
- exigir que la rama esté actualizada;
- impedir pushes directos y force-push;
- exigir revisión de CODEOWNERS.

Usar **Squash and merge** mantiene un cambio completo por commit y facilita regresar una versión.

## Responsabilidad de cada plataforma

- **GitHub:** historial, ramas, Pull Requests y pruebas automáticas.
- **Render:** publica el contenido de `dist/` cuando cambia `main`.
- **Supabase:** autenticación y datos. Las tablas expuestas deben tener RLS.

Este repositorio es actualmente un sitio estático. Por esa razón sólo recibe `SUPABASE_PUBLISHABLE_KEY`. Nunca se debe configurar aquí `SUPABASE_SERVICE_ROLE_KEY`, una clave secreta, credenciales de Gmail ni una conexión directa de base de datos: todo lo que se usa al compilar puede terminar en el navegador.

## Configuración por sistema o conjunto

Cada instalación independiente debe tener su propio proyecto de Supabase, servicio de Render, dominio y credenciales. No se copian archivos `.env`, sesiones, datos ni backups entre instalaciones.

Variables de este sitio:

- `APP_ENV`: `development`, `test` o `production`.
- `APP_BASE_URL`: dominio completo; en producción debe usar HTTPS.
- `SUPABASE_URL`: URL del proyecto correspondiente.
- `SUPABASE_PUBLISHABLE_KEY`: clave publicable del mismo proyecto.

En Supabase, agregar `APP_BASE_URL` a las URL permitidas de Auth. Aplicar las migraciones de `supabase/migrations/` primero en un proyecto de prueba y después en producción. Los buckets para documentos se crearán cuando exista el módulo de archivos y un modelo claro de permisos por conjunto; no deben hacerse públicos por comodidad.

## Publicación inicial en Render

1. Confirmar que `render.yaml` ya está fusionado en `main`.
2. Crear el Blueprint desde el repositorio.
3. Completar en Render las tres variables marcadas para captura manual.
4. Conectar el dominio propio y configurar DNS.
5. Verificar login, recuperación de contraseña y navegación.
6. Confirmar que un Pull Request no publica producción y que fusionar a `main` sí lo hace.

## Regresar una versión

Revertir en GitHub el Pull Request problemático. Esa reversión vuelve a pasar por las pruebas y, al llegar a `main`, Render publica automáticamente la versión anterior.
