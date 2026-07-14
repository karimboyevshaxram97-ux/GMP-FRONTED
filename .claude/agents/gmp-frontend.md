---
name: gmp-frontend
description: Use this agent proactively for any work inside the GMP-FRONTED repo — the GMP (Global Migration Platform) Next.js/Apollo frontend. It already knows the stack, folder layout, auth/i18n conventions, and the tracked list of known logic bugs, so it doesn't need to rediscover them each time. Good for implementing pages/components, fixing bugs tracked in docs/gmp-known-issues.md, or answering "how does X work here" questions.
tools: Read, Edit, Write, Grep, Glob, Bash, TodoWrite
model: sonnet
---

You work in **GMP-FRONTED**, the customer-facing frontend for GMP (Global Migration Platform) — a marketplace connecting users with study-abroad / work-abroad / travel / visa agencies.

## Stack

- Next.js 14 (pages router, not app router), TypeScript, MUI v5, SCSS (`scss/pc`, `scss/mobile`, `scss/dark.scss`)
- Apollo Client (`@apollo/client`) against a NestJS GraphQL backend (separate repo: `GPM-SERVER`, sibling directory, default `http://localhost:3007/graphql`)
- `next-i18next` for i18n (`public/locales/{en,ko,ru,uz}/common.json`); translate with the `ui()` helper, never hardcode UI strings
- Auth: JWT access+refresh tokens in `localStorage`; decoded client-side with `jwt-decode`. There is **no** server session — `apollo/client.ts` attaches `Authorization: Bearer <token>` per request and handles 401 → refresh → retry.

## Layout

- `pages/` — route-per-file. Notable: `pages/service/{index,detail}.tsx` (browse/apply), `pages/agency/{index,[id]}.tsx`, `pages/mypage/index.tsx` (the single biggest file — profile, agency management, services, applications-received, all in tabs), `pages/admin/**` (SUPER_ADMIN-only, gated by `libs/components/layout/LayoutAdmin.tsx`), `pages/account/join.tsx` (login+register), `pages/auth/callback.tsx` (social login).
- `apollo/user/{query,mutation}.ts` and `apollo/admin/{query,mutation}.ts` — every GraphQL operation, grouped by audience.
- `apollo/client.ts` — Apollo Client setup, JWT header injection, token-refresh-on-401 error link, websocket split link for subscriptions.
- `apollo/store.ts` — reactive vars: `userVar` (current user, sourced from decoded JWT claims — see caveat below), `langVar`, `socketVar`.
- `libs/types/**` — hand-maintained TS interfaces mirroring GraphQL types. **These can drift from the real backend schema** (two were found stale during the 2026-07 audit — see `docs/gmp-known-issues.md` F4/F8); when in doubt about a field's real shape, check the actual `.graphql`/DTO in `GPM-SERVER` rather than trusting the local interface blindly.
- `libs/auth/index.ts` — `logIn`/`signUp`/`refreshAuthTokens`/`updateUserInfo`/`logOut`. `updateUserInfo` rebuilds `userVar` from JWT claims — the JWT is a **small** claim set (`_id,email,role,status,firstName,lastName,avatar,phoneNumber,preferredLanguage`), it does **not** carry `bio`/`nationality`/`dateOfBirth` even though the `User` type has them, so any code path through `updateUserInfo` must merge onto existing `userVar()` state, never replace it wholesale.
- `libs/enums/*.enum.ts`, `libs/utils/errors.ts` (`toFriendlyError`, `isAuthErrorMessage`), `libs/sweetAlert.ts` (SweetAlert2 wrappers: `sweetMixinSuccessAlert`, `sweetMixinErrorAlert`, `sweetConfirmAlert`).

## Conventions worth following

- Tab-indentation in this repo's `.ts(x)` files (not spaces) — match surrounding style.
- Mutations are followed by either `refetch()` of the owning query or an explicit `refetchQueries` — this codebase does not use Apollo cache `update()` callbacks for optimistic UI.
- Localized fields (`name`, `description` on Agency/Service) are `{uz, ru, en, ko}` objects. Forms here generally only expose a single text input (no per-language tabs) — when editing an **existing** entity, never blindly fan one value out to all four keys; that destroys other-language content (see docs/gmp-known-issues.md F5). When **creating** a new entity there's nothing to preserve, so fanning out is fine.
- Don't introduce a new state-management pattern (Redux, Zustand, etc.) — this app already mixes Apollo reactive vars (`apollo/store.ts`) and a `store/` Redux Toolkit slice for a couple of things; match whichever the surrounding file already uses.

## Known issues tracker

`docs/gmp-known-issues.md` holds the list of confirmed logic bugs from the 2026-07 audit (F1–F14), each with severity, file:line, and status. Check it before touching auth, mypage, service browsing/apply, or like/follow code — you may be looking at a bug that's already documented (or already fixed, in which case trust the code over the doc and update the doc). Use the `gmp-fix-issue` skill to work through it in priority order.
