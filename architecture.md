# Monkmode architecture

Three independent applications live in this repository. Run npm commands from the application directory. There is no root package, npm workspace, shared dependency directory, or cross-application source import.

| Directory | Purpose | Deployment |
| --- | --- | --- |
| `backend/` | Express API and PostgreSQL schema | Render |
| `frontend/` | React web page and Three.js scene | Netlify |
| `mobile/` | Native Expo / React Native application | Android APK via EAS |

Use Node 22.13 or newer; Node 24 is also supported. Each application has its own `package.json`, `package-lock.json`, and local `node_modules`. Use `npm ci` inside an app to reproduce its dependency installation.

## Backend

From `backend/`:

```sh
npm ci
cp .env.example .env
docker compose up -d
npm run db:init
npm run db:seed
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env` to create the local configuration. Docker provides only the local PostgreSQL database; schema and seed commands are explicit. Existing `.env` files contain local settings and should stay out of Git.

- `src/server.js` starts HTTP and closes the database pool on shutdown.
- `src/app.js` configures JSON parsing, CORS, routes, and error handling.
- `src/routes/index.js` contains the complete API route map and forwards rejected async handlers to the error middleware.
- `src/controllers/` contains chapter queries, focus-session operations, and ritual operations. SQL stays with the operation that uses it.
- `src/config/db.js` owns the connection pool and connectivity check.
- `src/db/` contains the schema, seed data, and transactional setup command.
- `src/utils/apiResponse.js` defines the existing JSON response shape.

`npm run db:reset` drops and recreates all application tables, then seeds them. Use it only for disposable or intentionally reset databases.

The API exposes `/api/chapters`, `/api/sessions`, `/api/sessions/stats`, and `/api/rituals`. `/api/health` returns 200 when PostgreSQL is reachable and 503 otherwise. The web and mobile experiences currently use local presentation content; they do not call these API endpoints.

On Render, set the service root to `backend`, install with `npm ci --omit=dev`, and start with `npm start`. Set `DATABASE_URL`, `NODE_ENV=production`, and `CORS_ORIGIN` to the deployed web origin. Render supplies `PORT`. Initialize and seed the production database deliberately; server startup does not change its schema or data.

## Web

From `frontend/`:

```sh
npm ci
npm run dev
npm run lint
npm run build
```

`src/App.jsx` composes the page sections and loads the scene after mounting. Components own their markup; `components/Foreground.jsx` holds the reusable decorative-artwork configuration. Static images and embedded web fonts live in `public/secret-pathways-assets/`.

The scene modules live in `src/scene/`:

| Module | Responsibility |
| --- | --- |
| `engine.js` | Startup jobs, frame loop, adaptive resolution, and GPU cleanup |
| `world.js` | Courtyard, stairs, temple, torii, lanterns, and lights |
| `landscape.js` | Moon, maples, rocks, and near-camera foliage |
| `atmosphere.js` | Haze, rain, falling leaves, and pointer particles |
| `camera.js` | Chapter camera path and world-space wordmark |
| `postprocessing.js` | Bloom, color grading, and cached card views |
| `cloth.js` | Pointer-driven card fabric simulation |
| `page-effects.js` | Navigation, reveals, foreground stages, cursor, and grain overlay |
| `lifecycle.js` | Cancellation of listeners, observers, timers, and animation frames |
| `materials.js` | Texture upload and reusable surface cache |
| `*-textures.js`, `geometry.js`, `math.js` | Procedural texture generation and numeric helpers |
| `settings.js` | Viewport measurements, motion preference, and rendering quality |

Each mounted scene has its own runtime object. Builders receive it explicitly. There is no debug state attached to `window`. Disposing the scene cancels browser work and releases GPU resources. When WebGL cannot start, the page exposes its static artwork and navigation.

Styles are plain CSS in `src/styles/`, imported in order by `src/index.css`: base styles, loading/navigation chrome, chapters, responsive rules, fixed composition, and foreground effects. The composition rules follow the base chapter rules deliberately; preserve that cascade when changing layouts.

For Netlify, set the base directory to `frontend`, the build command to `npm run build`, and the publish directory to `dist`. The Vite `/api` proxy is for local development only. Future production API calls need an explicit backend URL or a Netlify proxy.

## Mobile

From `mobile/`:

```sh
npm ci
npm start
npm run lint
npm run typecheck
```

`App.js` owns section scrolling, the artwork modal, and loading visibility. Components keep their rendering and styles together; static content is defined outside component functions. `src/theme.js` contains presentation tokens and `src/assets.js` contains native image references. `src/images.d.ts` lets the JavaScript type checker understand WebP assets.

The native app uses Expo SDK 57. Keep its React Native and Expo packages compatible with that SDK. Use `npx expo install` when adding packages. Native animations stop when their components unmount. Web-specific Three.js and font files are not bundled into the mobile application.

Verify the Android JavaScript bundle without creating native projects:

```sh
npx expo export --platform android --output-dir <temporary-directory>
```

Build an installable APK:

```sh
npx eas-cli@latest build --platform android --profile preview
```

`eas.json` selects APK output for the preview profile. The first EAS build requires signing into an Expo account and configuring the project's application identifier and signing credentials. Cloud signing and an APK installation are separate from a JavaScript export. Generated `android/` and `ios/` directories are unnecessary for this managed Expo workflow.

## Maintenance

Retain only source, referenced assets, app configuration, app-local dependency locks, license notices, and the requested documentation. Audit documents, Gemini handoff documents, and agent instructions are protected. Keep generated builds, caches, logs, and temporary verification files outside Git. Do not install dependencies from the repository root.
