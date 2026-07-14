---
name: gmp-fix-issue
description: Work through the tracked list of known GMP-FRONTED logic bugs (docs/gmp-known-issues.md) one at a time, in priority order, with a full production-quality fix and verification. Use when the user says things like "keyingi xatolikni tuzat", "fix the next issue", "continue the bugfix plan", or references the GMP audit/known-issues list.
---

# GMP frontend — fix the next known issue

1. Read `docs/gmp-known-issues.md` in full.
2. Pick the highest-priority row with `status: open` — priority order is severity (Critical > High > Medium > Low), then the order the rows already appear in within a severity tier. Skip anything `status: done` or `status: skipped`.
3. Read the cited file(s) at the cited line(s) **in full context**, not just the snippet in the tracker — the line numbers may have drifted since the audit was written. Re-locate the bug by the described symptom if the line moved.
4. Before writing code, restate the failure scenario in one sentence to yourself and confirm the fix actually addresses that scenario (not a related-but-different symptom).
5. Implement a complete fix:
   - Match this repo's existing conventions (tab indentation, `ui()` for all user-facing strings, `refetch()`-based cache updates, SweetAlert2 wrappers — see the `gmp-frontend` agent's notes if unsure).
   - No half-measures: if the tracker's note says "merge instead of replace", actually merge, don't just patch the one symptom that was reported.
   - Don't refactor unrelated code while you're in the file.
6. Verify:
   - `npx tsc --noEmit` — must be clean of new errors.
   - `npm run lint` — must be clean of new errors.
   - If the fix touches a page/flow that's easy to exercise (forms, list filters, auth), prefer running it in a live `npm run dev` session over trusting types alone — ask the user or use the `verify`/`run` skill if available.
7. Update `docs/gmp-known-issues.md`: flip the row to `status: done`, add a one-line note on what changed (file:line of the fix, not a restatement of the bug).
8. Do **not** create a git commit unless the user explicitly asks for one in this conversation.
9. Report back concisely: which issue, what changed, what you verified. Then stop — don't automatically continue to the next issue unless asked.
