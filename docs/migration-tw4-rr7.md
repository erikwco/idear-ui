# Playbook: migrar una app de Tailwind v3 + Remix v1 → Tailwind v4 + React Router v7

Esta es la **receta probada** con la que se migró `idearShorteningFront` (shorts) al stack de
eventos/plazas, generalizada a cualquier app en la misma condición. Varias apps de la organización
están en ese mismo punto de partida (Remix v1.16 clásico + TW v3); este documento es el camino que
salió bien, fase por fase.

> **Ejemplo trabajado de referencia:** el plan original, archivo por archivo, está en el repo de
> shorts: `docs/superpowers/plans/2026-06-26-migracion-tw4-react-router-v7.md` (656 líneas, con
> conteos reales de imports/tipos). Úsalo como anexo cuando necesites el detalle exacto de un caso.

## Stack destino (espejo de eventos/plazas)

React 19, `react-router@^7.9`, `@react-router/{dev,node,serve}@^7.9`, `vite@^7`,
`@tailwindcss/vite@^4.1`, `tailwindcss@^4.1`, `vite-tsconfig-paths`, `tailwind-merge@^3`, Node 22.
(Overlay de UI: si la app usa `@headlessui/react`, sube a `^2`; eventos/plazas usan radix, no headlessui.)

## Contratos que NO se rompen

- **Deploy / Docker.** Mantener puerto `3000`, scripts `npm run build`/`npm run start`, y salida en
  `build/`. RR7 emite `build/server/index.js` + `build/client/`; el `start` pasa a
  `react-router-serve ./build/server/index.js`. El `Dockerfile` que copia `build/` + `public/` y corre
  `start` normalmente **no cambia** — pero verifícalo (Fase 9).
- **URLs.** Inventaría todas las rutas antes y verifícalas una por una al final. Ninguna debe cambiar.
- **Auth / session / API.** La lógica de loaders/actions/session/cookies **no cambia**; solo cambian
  los imports (`@remix-run/node` → `react-router`).
- **Marca.** Si la app ya consume tokens del contrato (oklch), la migración a v4 los **simplifica**
  (desaparece el hack `<alpha-value>`); no re-derives colores.

## Reglas de ejecución

- Trabaja en **rama/worktree aislada**; commits frecuentes (uno por fase).
- **Cada fase termina compilando o renderizando.** No avances con el build roto.
- La secuencia de commits de abajo es la que funcionó — síguela en orden.

---

## Fase 0 — Rama y baseline

```bash
git switch -c migracion/tw4-rrv7
npm run typecheck && npm run build      # baseline verde: anota que el punto de partida compila
ls app/routes/ | sort                   # snapshot de rutas (referencia de regresión para la Fase 3)
```

## Fase 1 — Swap de dependencias
**Commit:** `chore: deps a react-router v7 + tailwind v4 + react 19`

Quita Remix v1 + TW3 (`@remix-run/*`, `@remix-run/css-bundle`, `tailwindcss@3`, `@types/react@18`),
y cualquier basura del `package.json` (shorts tenía una entrada `"-": "^0.0.1"`). **Conserva** las
deps no-Remix que sí se usan (`date-fns`, `tiny-invariant`, `zod`, etc.). Copia las versiones del
`package.json` de eventos para alinear. `clsx` es **nuevo y obligatorio** (lo usa el `cn` de la Fase 7).

```bash
rm -rf node_modules package-lock.json && npm install
```

Si `@headlessui/react@2` o `@heroicons/react` se quejan de React 19, confirma que resolvieron a
versiones compatibles.

## Fase 2 — Config Vite + React Router
**Commit:** `feat: config vite + react-router (borra config remix v1)`

```ts
// vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({ plugins: [tailwindcss(), reactRouter(), tsconfigPaths()] });
```

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";
export default { ssr: true } satisfies Config;
```

```bash
git rm remix.config.js remix.env.d.ts
```

Actualiza `tsconfig.json` (alinéalo con eventos): `"types": ["@react-router/node", "vite/client"]`,
`"rootDirs": [".", "./.react-router/types"]`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`,
alias `"~/*": ["./app/*"]`. Verifica con `npx react-router typegen` (puede quejarse hasta tener `routes.ts`).

## Fase 3 — Routing explícito (`app/routes.ts`)
**Commit:** `feat: routing explícito en routes.ts (equivalente a flat routes)`

Reemplaza las flat routes por un `app/routes.ts` explícito **sin renombrar** los archivos de
`app/routes/*`. Mapea cada ruta del snapshot de la Fase 0. Cuidado con:
- **Layouts** (renderizan `<Outlet/>`): van como `route(path, file, [hijos])`.
- **Resource routes** (sin default export): se listan como rutas normales.
- **Rutas con opt-out de layout** (`auth_.login.tsx`, guion bajo): van FUERA del layout padre.

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";
export default [
  index("routes/_index.tsx"),
  route("auth", "routes/auth.tsx", [
    index("routes/auth._index.tsx"),
    route("register", "routes/auth.register.tsx"),
  ]),
  route("auth/login", "routes/auth_.login.tsx"),   // fuera del layout auth
  // …resto…
] satisfies RouteConfig;
```

Verifica que typegen genera un `+types` por cada ruta: `npx react-router typegen && ls .react-router/types/app/routes/`.

## Fase 4 — `root.tsx` + entries
**Commit:** `feat: root.tsx a react-router v7 (sin cssBundle/LiveReload)`

```bash
git rm app/entry.server.tsx app/entry.client.tsx   # defaults de Remix; RR7 trae equivalentes
```

En `root.tsx`:
- Imports `@remix-run/*` → `react-router`. **Quita `LiveReload`** (ya no existe) y `cssBundleHref`.
- Tipos: `Route.LinksFunction`, `Route.LoaderArgs` desde `./+types/root`.
- CSS: impórtalo como **side-effect** (`import "./tailwind.css"`) y deja que Vite lo inyecte; o
  `import href from "./tailwind.css?url"` + `{ rel: "stylesheet", href }` en `links()`.
- Loader: `return json(...)` → objeto plano.

Bootea y verifica `/` responde 200 (`npm run dev`; otras rutas pueden fallar hasta la Fase 5).

## Fase 5 — Codemod de imports y tipos
**Commit:** `refactor: migrar imports y tipos remix → react-router v7`

Mecánico pero amplio (en shorts: ~23 archivos, incluye `*.server.ts` y componentes, no solo rutas).

```bash
grep -rl "@remix-run/react" app | xargs sed -i '' 's#@remix-run/react#react-router#g'
grep -rl "@remix-run/node"  app | xargs sed -i '' 's#@remix-run/node#react-router#g'
```

Luego, **a mano** (el sed no basta):
- Tipos por ruta: `LoaderArgs`/`ActionArgs`/`V2_MetaFunction` → `Route.LoaderArgs`/`Route.ActionArgs`/
  `Route.MetaArgs` desde `./+types/<ruta>`. Quita los imports de tipo muertos que el sed dejó.
- **`json()` → `data()` u objeto plano** (en shorts: 24 sitios). `return json(x)` → `return x`;
  `return json(x, { status })` → `import { data } from "react-router"` y `return data(x, { status })`.
  Igual para `{ headers }`. Hazlo archivo por archivo; el typecheck caza los olvidos.

```bash
npm run typecheck     # 0 errores
```

Regresión: render de todas las URLs del inventario (esperar 200/302, nunca 500).

## Fase 6 — Tailwind v3 → v4 (CSS-first)
**Commit:** `feat: tailwind v4 CSS-first (consume tokens de la marca desde idear-ui)`

El payoff: en v4 los tokens se declaran en `:root`/`.dark` con oklch completo y un puente
`@theme inline`; las utilidades (`bg-primary`, `bg-primary/90`) se generan solas. **Desaparece el
patrón `L C H` pelado.** Lo más seguro: **copiar/adaptar el `theme-<marca>.css` del registro**
(`idear-ui/tokens/`), que ya está en v4 con ese patrón split y expone `--color-brand-*`.

```bash
git rm tailwind.config.ts
```

Reescribe `app/tailwind.css` con `@import "tailwindcss"`, `@custom-variant dark`, los valores en
`:root`/`.dark`, el puente `@theme inline`, los `@keyframes` que usara la app (toast/fade) y el
`@layer base`. Reescribe `cn`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
```

Revierte los hacks de v3 (`!pt-6` → `pt-6`; `bg-primary-700` → `bg-brand-700` ahora que
`--color-brand-*` existe; mantén `text-white` en paneles de marca). Build + screenshot headless
(login claro/oscuro, y una vista con `bg-success/10` para confirmar los modificadores de opacidad).

## Fase 7 — Overlays (headlessui v1 → v2), si aplica
**Commit:** `refactor: headlessui v1 → v2 (Dialog/Modal)`

> **Mayor riesgo del playbook.** headlessui v2 + React 19 es la mayor superficie de incompatibilidad
> fuera del framework. Solo aplica si la app usa headlessui (eventos/plazas usan radix).

APIs que cambian: `Dialog.Panel` → `DialogPanel`, `Transition`/`Transition.Child` → prop `transition`
+ data-attributes (`data-closed`, `data-enter`). Migra el menú móvil de `root.tsx` y los `Modal`.
**Fallback si bloquea:** quédate en React 18 + headlessui 1.7 (RR7 soporta React 18) y sube React en
un PR aparte.

## Fase 8 — Build de producción + Docker
**Commit (si hubo cambios):** `chore: verificar Dockerfile con salida build/ de react-router v7`

```bash
npm run build
ls build/server/index.js build/client      # deben existir
# react-router-serve NO lee .env: exporta las vars al probar el build local
API_HOST_URL=… SHORTENER_SERVER=… PORT=3010 npm run start &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3010/
docker build -t app-migracion-test . && docker run --rm -p 3011:3000 app-migracion-test   # smoke
```

## Fase 9 — Regresión final + PR

```bash
npm run typecheck && npm run build
# render de TODAS las URLs del inventario (200/302, ninguna 500)
# screenshot del login en claro y oscuro
git push -u origin migracion/tw4-rrv7
gh pr create --title "Migración: Tailwind v4 + React Router v7" --body "…"
```

---

## Notas de riesgo (de la migración real)

- **headlessui v2 + React 19**: el cambio con más superficie. Ten listo el fallback a React 18.
- **`json()` → raw/`data()`**: tedioso pero mecánico; el typecheck lo caza.
- **`react-router-serve` no lee `.env`**: solo afecta pruebas locales de producción; en Docker/CI las
  vars vienen del entorno.
- **Tokens v4**: consume el `theme-<marca>.css` del registro en vez de re-derivar; mantenlo
  sincronizado con qrUI si es la marca naranja.
- **Rutas con diseño pendiente** (p. ej. un `register` que quedó como card centrado): son cambios de
  UI independientes de la migración; no los mezcles en este PR.

## Después de migrar

La app ya está en TW4 + RR7: aplica/confirma la marca con [`apply-tokens.md`](apply-tokens.md)
(Camino A) y, si quieres, consume los componentes React del registro.
