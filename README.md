# Elussila Gallery

Galeria artistica con panel de administracion para publicar obras, editar biografia y gestionar inventario.

## Stack

- Next.js 16 (App Router)
- React 19
- Google Drive API (imagenes)
- Google Sheets API (inventario y configuracion)

## Variables de entorno

Duplica `.env.example` a `.env.local` y llena estos valores:

- `GOOGLE_CREDENTIALS`: JSON completo de service account en una sola linea.
- `GOOGLE_SHEET_ID`: ID de tu hoja de calculo.
- `GOOGLE_DRIVE_FOLDER_ID`: carpeta fija de tu Drive personal donde se suben las fotos.
- `GOOGLE_DRIVE_PUBLIC`: `true` para hacer visibles las imagenes publicamente.
- `ADMIN_USERNAME`: usuario para `/admin/login`.
- `ADMIN_PASSWORD`: password para `/admin/login`.
- `ADMIN_SESSION_SECRET`: secreto largo para firmar la sesion.

## Configuracion de Google Drive personal

No necesitas crear Shared Drive.

1. Crea una carpeta en **tu Drive personal**.
2. Comparte esa carpeta con el correo del service account (`client_email` dentro de `GOOGLE_CREDENTIALS`) como **Editor**.
3. Copia el ID de carpeta y usalo en `GOOGLE_DRIVE_FOLDER_ID`.

Si falla la subida, casi siempre es por permisos de esa carpeta o por credenciales mal serializadas.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

Panel admin:

- `http://localhost:3000/admin`
- Si no hay sesion, redirige automaticamente a `/admin/login`.

## Comandos de validacion

```bash
npm run lint
npm run build
```

## Seguridad implementada

- Sesion httpOnly para admin.
- Rutas protegidas por `proxy.ts`:
  - `/admin/*` (excepto `/admin/login`)
  - `/api/upload`
  - `/api/delete`
  - `POST /api/config`

## Deploy automatico en Vercel con GitHub Actions

Workflow: `.github/workflows/vercel-deploy.yml`

Secretos requeridos en GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Flujo:

- Pull request a `main` => deploy preview.
- Push a `main` => deploy production.

## Troubleshooting rapido

- **Error subiendo fotos**: revisa `GOOGLE_DRIVE_FOLDER_ID` y que la carpeta este compartida al service account.
- **Error de auth admin**: revisa `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET`.
- **Build falla por imports**: ejecuta `npm run lint` para detectar inconsistencias antes de `build`.
