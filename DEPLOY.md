# Deploy de Nutri Panel

## 1. Preparar variables de entorno

En local, crea un archivo `.env.local` con:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

En Vercel usarás exactamente los mismos nombres:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 2. Publicar en Vercel

1. Sube este proyecto a GitHub.
2. Entra a [https://vercel.com](https://vercel.com)
3. Pulsa `Add New Project`
4. Importa el repositorio
5. Vercel detectará `Vite` automáticamente
6. En `Environment Variables`, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Pulsa `Deploy`

## 3. Qué revisar en Supabase antes de compartir

La app funciona hoy con políticas `anon` bastante abiertas para facilitar pruebas. Antes de compartirla con más personas, conviene:

1. Revisar `Authentication` si luego quieres acceso por usuario.
2. Restringir políticas RLS de tablas clínicas sensibles.
3. Evitar que cualquier visitante pueda leer o escribir datos de pacientes.

## 4. SQL mínimo de verificación en Supabase

Pega esto en `SQL Editor` para revisar qué tablas tienen RLS activado:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

Y esto para revisar políticas creadas:

```sql
select schemaname, tablename, policyname, permissive, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

## 5. Siguiente endurecimiento recomendado

Antes de abrir la app al público:

1. Agregar autenticación.
2. Relacionar cada paciente con un propietario.
3. Cambiar políticas `anon` por políticas por usuario autenticado.
4. Mover operaciones sensibles a backend o funciones protegidas si hace falta.
