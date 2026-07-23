# Find it

Aplicación privada doméstica para localizar cajas y objetos. Frontend Angular + Ionic en GitHub Pages; autenticación, base de datos y fotografías en Supabase.

## Seguridad

- La clave publicable de Supabase puede estar en el frontend.
- La contraseña común y la `service_role` solo viven como secretos de Edge Functions.
- Todas las tablas y el bucket privado usan RLS.
- El selector de perfil atribuye acciones; la contraseña común concede el acceso real.
- Las sesiones anónimas no tienen acceso hasta que `household-access` crea una autorización temporal.

## 1. Crear Supabase

1. Crea un proyecto nuevo.
2. Activa **Authentication > Providers > Anonymous Sign-Ins**.
3. En SQL Editor ejecuta `supabase/migrations/001_find_it.sql`.
4. Instala e inicia Supabase CLI:

```bash
npm install -g supabase
supabase login
supabase link --project-ref TU_PROJECT_REF
```

5. Configura la contraseña común (no la subas a GitHub):

```bash
supabase secrets set HOUSEHOLD_PASSWORD='TU_CONTRASEÑA_MUY_LARGA'
```

6. Despliega la función:

```bash
supabase functions deploy household-access
```

7. Configura un Cron en Supabase para ejecutar semanalmente:

```sql
select public.purge_soft_deleted();
```

## 2. Configurar Angular

Edita:

- `src/environments/environment.ts`
- `src/environments/environment.prod.ts`

Solo necesitas la URL del proyecto y la clave **publishable/anon**, nunca `service_role`.

```bash
npm install
npm start
```

## 3. GitHub Pages

```bash
git init
git add .
git commit -m "Initial Find it app"
git branch -M main
git remote add origin git@github.com:nahuelrubio/find-it.git
git push -u origin main
```

En GitHub abre **Settings > Pages > Source > GitHub Actions**. La acción publicará en `https://nahuelrubio.github.io/find-it/`.

## Categorías disponibles

Electrónica, Cables y cargadores, Herramientas, Documentos, Ropa, Decoración, Cocina, Limpieza, Juegos y consolas, Recuerdos y Otros. La base empieza sin ubicaciones, cajas ni objetos.

## Mejoras recomendadas antes de uso prolongado

- Activar CAPTCHA para reducir creación abusiva de usuarios anónimos.
- Añadir rate limiting a la Edge Function.
- Probar las políticas RLS con un segundo navegador sin contraseña.
- Revisar Security Advisor de Supabase.
