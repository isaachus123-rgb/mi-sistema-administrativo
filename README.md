# Mi Sistema Administrativo

Sitio administrativo estático con autenticación de Supabase y publicación automática en Render.

## Trabajar localmente

Requiere Node.js 20.

1. Copia `.env.example` como `.env` y completa la URL y la clave publicable de tu proyecto de Supabase.
2. Ejecuta `npm run dev`.
3. Abre `http://localhost:4173`.

Antes de abrir un Pull Request, ejecuta:

```text
npm run check
```

## Supabase

Aplica en orden los archivos de `supabase/migrations/`. La migración actual crea una tabla pública de sólo lectura con RLS habilitado.

La segunda migración crea perfiles y roles protegidos con RLS. Si ya hay una sola cuenta, será el primer superadministrador. Si existen varias, selecciona la tuya con:

```sql
update public.profiles set role = 'super_administrador' where email = 'tu@correo.com';
```

Publica también `supabase/functions/invite-user` para habilitar las invitaciones desde la pantalla **Usuarios**.

Este frontend sólo puede usar una clave publicable. Nunca agregues una clave `service_role`, clave secreta, credenciales de Gmail o contraseñas a variables usadas por la compilación.

## GitHub y Render

Las mejoras se hacen en ramas, pasan por Pull Request y GitHub Actions, y llegan a producción al fusionarse en `main`. Render toma `main`, ejecuta todas las validaciones y publica `dist/`.

La configuración completa, protecciones de ramas y pasos de despliegue están en [docs/FLUJO-DE-TRABAJO.md](docs/FLUJO-DE-TRABAJO.md).
