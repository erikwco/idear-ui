---
name: migrate-to-tw4-rr7
description: Use when migrating an app from Tailwind v3 + Remix v1 (classic) to Tailwind v4 + React Router v7 + React 19 — the proven recipe from the shorts migration. Triggers on "migra a tailwind v4 / react router v7", "migrate to RR7", "actualiza el stack de esta app como shorts".
---

# Migrar TW3 + Remix v1 → TW4 + React Router v7

Receta probada (migración de `idearShorteningFront`/shorts), generalizada. **Fuente de verdad:**
`idear-ui/docs/migration-tw4-rr7.md`. Ejemplo trabajado archivo-por-archivo:
`idearShorteningFront/docs/superpowers/plans/2026-06-26-migracion-tw4-react-router-v7.md`.

## Cómo ejecutar (IMPORTANTE)
- **Por fases, con checkpoint humano.** No automatices a ciegas: cada fase termina compilando o
  renderizando, hace **un commit**, y se confirma antes de seguir. Usa
  superpowers:executing-plans o subagent-driven-development si están disponibles.
- Trabaja en **rama/worktree aislada**.
- **Contratos que NO se rompen:** URLs (inventaríalas y verifícalas), auth/session/API (solo cambian
  imports), deploy/Docker (puerto 3000, `build/`, `npm run start`).

## Fases (cada una = 1 commit)

0. **Baseline**: `git switch -c migracion/tw4-rrv7`; `npm run typecheck && npm run build` verde;
   `ls app/routes/ | sort` (snapshot de regresión).
1. **Deps** → `chore: deps a react-router v7 + tailwind v4 + react 19`. Quita `@remix-run/*` y TW3;
   añade RR7 + TW4 + React 19 + `clsx` + `tailwind-merge` (copia versiones de eventos). Conserva
   `date-fns`/`tiny-invariant`/`zod`. `rm -rf node_modules package-lock.json && npm install`.
2. **Config Vite** → `feat: config vite + react-router (borra config remix v1)`. Crea
   `vite.config.ts` (reactRouter+tailwindcss+tsconfigPaths) y `react-router.config.ts` (`{ssr:true}`);
   `git rm remix.config.js remix.env.d.ts`; alinea `tsconfig.json` con eventos.
3. **Routing** → `feat: routing explícito en routes.ts`. Crea `app/routes.ts` explícito sin renombrar
   archivos; cuida layouts (`<Outlet/>`), resource routes y opt-outs (`auth_.login.tsx` fuera del
   layout). Verifica typegen genera un `+types` por ruta.
4. **root.tsx** → `feat: root.tsx a react-router v7`. `git rm app/entry.*.tsx`; imports → `react-router`;
   quita `LiveReload`/`cssBundleHref`; CSS como side-effect; `json()`→objeto plano. `/` responde 200.
5. **Codemod** → `refactor: migrar imports y tipos remix → react-router v7`. `sed` de
   `@remix-run/{react,node}`→`react-router`; tipos por ruta `Route.LoaderArgs`/`ActionArgs`/`MetaArgs`
   desde `./+types/<ruta>`; **`json()`→`data()`/plano** (a mano, ~24 sitios en shorts). `typecheck` 0
   errores; regresión de URLs (200/302).
6. **TW v4 CSS-first** → `feat: tailwind v4 CSS-first (consume tokens de la marca)`. `git rm
   tailwind.config.ts`; **copia/adapta el `theme-<marca>.css` del registro idear-ui** (ya en v4, patrón
   split, expone `--color-brand-*`); reescribe `cn` con clsx+tailwind-merge; revierte hacks v3 (`!pt-6`
   →`pt-6`, `bg-primary-700`→`bg-brand-700`, mantén `text-white` en paneles de marca). Build +
   screenshot (login claro/oscuro + una vista con `bg-success/10`).
7. **headlessui v1→v2** (SI aplica) → `refactor: headlessui v1 → v2`. **Mayor riesgo** (v2 + React 19).
   `Dialog.Panel`→`DialogPanel`, `Transition`→prop `transition`+data-attrs. **Fallback:** quedarse en
   React 18 + headlessui 1.7 y subir React en PR aparte.
8. **Build prod + Docker** → `chore: verificar Dockerfile…`. `build/server/index.js`+`build/client/`
   existen; `react-router-serve` **no lee `.env`** (exporta vars al probar local); `docker build` smoke.
9. **Regresión + PR**: `typecheck && build`; render de TODAS las URLs; screenshot login claro/oscuro;
   `gh pr create`.

## Notas de riesgo
- headlessui v2 + React 19 = más superficie de fallo (ten el fallback listo).
- `json()`→`data()` tedioso pero el typecheck lo caza.
- `react-router-serve` no lee `.env` (solo pruebas locales; en Docker/CI las vars vienen del entorno).
- Tokens v4: consume el preset del registro, no re-derives.

## Después
La app queda en TW4+RR7 → confirma la marca con la skill `apply-idear-tokens` (Camino A).
