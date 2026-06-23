# Mi Sistema Administrativo

Primera versión pública del sistema. Muestra un mensaje de bienvenida almacenado en Supabase y usa un texto local de respaldo mientras se configura la conexión.

## Uso local

1. Copia `.env.example` como `.env` y agrega la URL y la clave publicable de Supabase.
2. Ejecuta `npm run dev`.
3. Abre `http://localhost:4173`.

## Supabase

Ejecuta `supabase/migrations/001_welcome_messages.sql` en el editor SQL del proyecto. La migración crea una tabla pública de solo lectura con RLS habilitado.

## Publicación en Render

El archivo `render.yaml` configura un sitio estático. En Render se deben definir:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

La clave publicable es apta para el navegador; nunca se debe usar una clave `service_role` en este proyecto.
