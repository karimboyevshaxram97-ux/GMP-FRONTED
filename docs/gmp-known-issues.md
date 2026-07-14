# GMP-FRONTED — known logic issues

Tracked from the 2026-07-13 full-codebase audit (paired with the same audit on `GPM-SERVER`, see that repo's own `docs/gmp-known-issues.md` for backend items B1–B15). Each row: severity, status, file:line, one-line defect + failure scenario. Use the `gmp-fix-issue` skill to work through these in order.

Severity order for picking the next item: **Critical > High > Medium > Low**.

## High

### F1 — `status: done`
Fixed 2026-07-13: `updateUserInfo` now merges onto `{ ...userVar(), ... }` instead of replacing wholesale, so fields the JWT doesn't carry (bio/nationality/etc, set by `handleUpdateProfile`'s own merge just before `refreshAuthTokens()` runs) survive a token refresh.


**`libs/auth/index.ts:132-164`** (`updateUserInfo`) rebuilds `userVar` entirely from JWT claims, which don't include `bio`/`nationality`. Any call to `refreshAuthTokens()` (fired right after a profile save, avatar upload, or agency creation) wipes those two fields from the UI even though the backend saved them correctly.
**Fix:** merge onto `{ ...userVar(), ... }` instead of replacing wholesale.

### F2 — `status: done`
Fixed 2026-07-13: `doTokenRefresh()` is now single-flight — a module-level `refreshInFlight` promise is shared across concurrent callers (`performTokenRefresh()` does the actual work), so two near-simultaneous 401s no longer race a second refresh call against an already-rotated token.


**`apollo/client.ts:20-42,84-119`** — `doTokenRefresh()` has no de-duplication. Two requests that both 401 near-simultaneously each call it independently; since the backend rotates refresh tokens (single-use), the second call reads an already-consumed token and fails, logging out a session that was actually still valid.
**Fix:** single-flight the refresh call via a module-level in-flight promise.

### F5 — `status: done`
Fixed 2026-07-13: `handleSaveService` (editing path) and `handleSaveAgencyInfo` now merge the edited value onto the existing `name`/`description` object (`{...existing, en:X, uz:X}`), only touching the two keys the single-language input actually represents; `ru`/`ko` survive. New-entity creation (`handleCreateAgency`, new-service branch) is unchanged since there's nothing to preserve there.


**`pages/mypage/index.tsx:499-520` (`handleSaveService`, when editing an existing service), `:590-615` (`handleSaveAgencyInfo`)** — fan a single-language text input out to all four locale keys (`{en,uz,ru,ko}`) on save, permanently erasing any `ru`/`ko` translations that existed before.
**Fix:** merge onto the existing localized object, only overwriting `en`/`uz` (the two keys the single input actually represents via its `.en || .uz` load fallback). `handleCreateAgency` (:375) and new-service creation are **not** affected — nothing to preserve when the entity is brand new.

## Medium

### F3 — `status: done`
Fixed 2026-07-13: `agency` is now derived as `isPublic || canViewRestricted ? fetchedAgency : null`, where `canViewRestricted` (owner or SUPER_ADMIN, computed straight off `fetchedAgency`) is evaluated independently of the public status/verification gate — the owner (or an admin) can now preview a PENDING/INACTIVE agency instead of hitting the not-found state.


**`pages/agency/[id].tsx:65-68,145-159,166`** — non-ACTIVE/non-VERIFIED agencies are nulled out and the "not found" empty state renders before `isOwnAgency` is ever computed, so an agency owner can't preview their own pending agency via "View Public Profile".
**Fix:** compute `isOwnAgency` before the not-found gate; allow the owner (and SUPER_ADMIN) through regardless of status/verification.

### F6 — `status: done`
Fixed 2026-07-13: dropped the `|| conversations.length` fallback — the badge now shows the true unread count, including 0.


**`pages/mypage/index.tsx:654`** — `conversations.filter(c => c.unreadCount > 0).length || conversations.length`: when unread count is legitimately `0`, the falsy `0` falls through `||` to the total conversation count, so the badge shows everything as unread.
**Fix:** drop the `|| conversations.length` fallback.

### F9 — `status: done`
Fixed 2026-07-13: removed the `tokenAllowsAdmin` fallback entirely — a `GET_ME` failure now always denies admin access and redirects to `/account/join`, regardless of the unverified client-decoded JWT role claim.


**`libs/components/layout/LayoutAdmin.tsx:77-104`** (`verifyAdmin`) — if `GET_ME` throws (network error), the `catch` sets `isAdmin = true` from the unverified, client-decoded JWT role claim instead of denying.
**Fix:** default to `isAdmin = false` on error, not the token claim.

## Low

### F4 — `status: done`
Fixed 2026-07-13: `RegisterInput`/`LoginInput` now declare `phoneNumber` (+ optional `role` on Register), matching the real backend DTOs. Confirmed no code imports these interfaces (dead types), so this is a documentation-accuracy fix only.

**`libs/types/user/user.input.ts`** — `LoginInput`/`RegisterInput` interfaces declare `email` (no `phoneNumber` on Login, no `role` on Register). **Verified not a functional bug**: the real backend `LoginInput`/`RegisterInput` DTOs (`GPM-SERVER apps/gmp-api/src/libs/dto/auth/{login,register}.input.ts`) require `phoneNumber` + optional `role`, exactly matching what `libs/auth/index.ts` `logIn`/`signUp` actually send (they don't even import these interfaces). Fix is documentation-only: correct the interfaces to match reality so a future developer doesn't trust the stale shape.

### F7 — `status: done`
Fixed 2026-07-13: added a debounced (`useDebounce`, matching the admin pages' existing convention) `TextField` wired to `setSearch` in the agency-directory toolbar, using the already-translated-but-unused `agency.searchByAgencyNameOr` placeholder key. `setPage(1)` on debounced-search change.

**`pages/agency/index.tsx`** — reads/displays a `search` state (empty-state copy, clearable chip) but no input anywhere calls `setSearch`; agency keyword search is unreachable dead UI.
**Fix:** add the missing search input wired to `setSearch`.

### F8 — `status: done`
Fixed 2026-07-13: added `serviceType?: ServiceType` to `GetAgenciesInput`, confirmed against the real backend `AgenciesInquiryInput` DTO. Documentation-accuracy fix only — the query already worked correctly at runtime.

**`pages/service/index.tsx:120-131` vs `libs/types/agency/agency.input.ts`** — local `GetAgenciesInput` interface is missing `serviceType`. **Verified not a functional bug**: the backend's real `AgenciesInquiryInput` (`GPM-SERVER apps/gmp-api/src/libs/dto/agency/agencies-inquiry.input.ts:27-30`) does declare and correctly use `serviceType` — the "related agencies" panel works fine at runtime. Fix is documentation-only: add the missing field to the interface.

### F10 — `status: done`
Fixed 2026-07-13: sort-pill `onClick` now calls `setPage(1)` alongside `setSort(...)`.

**`pages/service/index.tsx:221`** — changing the sort pill doesn't reset `page` to 1, so paging to page 3 then re-sorting can show a blank grid against out-of-range results.
**Fix:** `setPage(1)` alongside `setSort(...)`.

### F11 — `status: done`
Fixed 2026-07-13: all six handlers wrapped in try/catch with `sweetMixinErrorAlert(toFriendlyError(err, ui('errors.failedToLike'|'errors.failedToFollow')))`; new translation keys added to all four locale files.

**`pages/service/detail.tsx:67-71`, `pages/agency/[id].tsx:91-101`, `pages/service/index.tsx:139-149`, `pages/agency/index.tsx:82-87`** — six like/follow `onClick` handlers with no `try/catch`; a rejected mutation is an unhandled promise rejection with no user-facing error.
**Fix:** wrap each in try/catch with a `sweetMixinErrorAlert`.

### F12 — `status: done`
Fixed 2026-07-13: added `mypage.logo`/`mypage.cover` keys to all four locale files, `handleFinishProfile` now uses `ui('mypage.logo')`/`ui('mypage.cover')`.

**`pages/mypage/index.tsx:312-313`** (`handleFinishProfile`) — `missing.push('Logo')` / `missing.push('Cover')` are hardcoded English while the surrounding pushes use `ui(...)`.
**Fix:** add `mypage.logo`/`mypage.cover` translation keys to `public/locales/*/common.json`, use `ui()`.

### F13 — `status: done`
Fixed 2026-07-13. **Correction from the earlier note above:** verified `next-i18next.config.js` — `defaultLocale: 'ko'` is the actual configured site default (Korean), not Uzbek. Both `apollo/store.ts`'s `userVar` initial `preferredLanguage` and `libs/auth/index.ts`'s `logOut()` reset now use `Lang.KO`, matching `langVar`'s own default and `updateUserInfo`'s existing fallback chain (`getSavedLang() ?? tokenLang ?? Lang.KO`).

**`apollo/store.ts:20`** (`userVar` initial `preferredLanguage: Lang.EN`) **vs** **`libs/auth/index.ts:180`** (`logOut()` resets to `Lang.UZ`) — inconsistent default causes a locale flash right after logout.

### F14 — `status: done`
Fixed 2026-07-13: added `libs/enums/view.enum.ts` (`ViewTargetType`), switched all three `recordView` call sites (`PhotoBoard.tsx`, `service/detail.tsx`, `agency/[id].tsx`) from raw string literals to the enum.

**`libs/enums/`** — no `ViewTargetType` enum exists (unlike `LikeTargetType`); `recordView` call sites pass raw string literals `'SERVICE'/'AGENCY'/'PHOTO'` with no compile-time protection.
**Fix:** add the enum, switch call sites to use it.
