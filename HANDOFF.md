# Psych Tickler: handoff

Last updated 11 November 2026, at version 1.1.0 (commit `1aa5538` on `main`).

## 1. Project and audience

- **What:** Psych Tickler, a directory and social app for the whole MMWGH Psychiatry department (all residents and consultants, about 40 to 60 people). It is Batch Tickler grown for a larger group.
- **Owner:** Dr. Isabella Navarro (isaymotion@gmail.com), incoming first year.
- **Repo:** `isaymotion/psychtickler`, branch `main` (GitHub Pages deploys from `main`, root). Test tools and a copy of this doc are on branch `dev-tools`.
- **Live:** https://isaymotion.github.io/psychtickler/
- **Sister repos:** `isaymotion/tickler` (Batch Tickler, the base; 1.24.0 when last seen) and `isaymotion/DutySched`.
- **Admins of the department space:** Dr. Navarro (owner account), Doc Andrei Bargas (incoming chief resident) and Doc Vince Balilla (outgoing chief resident).

## 2. Fixed rules

- Attribution, exact: `App created by Isabella Navarro, MD. Latest version <Month YYYY>. isaymotion@gmail.com` (email as mailto link). Only the month changes.
- Storage prefix `pt:v1:`, cache prefix `psychtickler-`, backup id `psychtickler`. Never change them. Never reuse `bt:v1:` or `batchtickler-` (Batch Tickler, same origin).
- Every release: new entry on top of `data/changelog.js`, same version in `data/app-meta.js` and `VERSION` in `sw.js`.
- Plain HTML/CSS/JS, no build step, no CDN scripts. Load the `isaymotion-app-design` and `isaymotion-study-app` skills before changing the app.
- Residents are "first years, second years, third years", never PGY.
- No patient information anywhere in the app. Emergency and contact details never leave a phone without the owner's tick.
- Tagalog strings are drafts for Dr. Navarro's review.
- Her preference: use subagents (Sonnet) for simple tasks such as rewording or translation; keep design, privacy decisions and final review in the main chat.
- Push to `main` only when she asks for a build or change. Commit trailer lines come from the session's attribution reminder.

## 3. Architecture and data

Layout: `index.html`, `css/app.css`, `js/app.js` (one IIFE: shell, then Batch Tickler screens, then the section headed `PSYCH TICKLER 1.0.0` just before the Router), `js/cloud.js` (Firebase adapter, `window.BT_CLOUD`), `js/vendor/`, `data/*.js`, `sw.js`, `firestore.rules`.

- `data/fields.js`: `CARD_FIELDS`, `CARD_GROUPS` (`quick`, `consultant`, `basics`, `emergency`, `background`, `favourites`, `life`, `contact`), `QUICK_FIELDS` (15 keys shown first; `quick` is a virtual group, see `groupFields()`), `POS_GROUPS`.
- `data/strings.js`: Batch Tickler strings reworded for a department (keys still `bt.*`, `nav.*`). `data/strings-pt.js`: new strings (keys `pt.*`), English and Tagalog, merged into `window.STRINGS`.
- `data/cloud.js`: Firebase config (project `batch-tickler`, shared with Batch Tickler), `root: 'programs'`, `admins` (owner emails), `privateGroups`, `chatImgMax` 400000, `chatImgKeepDays` 90.

Card keys added by Psych Tickler (`sanitizePT`):
`pos` (`resident` | `consultant` | `alumni`), `startYear` (batch year, 0 for consultants), `chief`, `showYear`, `aud` (for example `{hobbies: 'res', food: 'batch'}`).
Year level = current year minus `startYear` plus 1; `posKey()` gives `y0` (incoming), `y1`, `y2`, `y3`, `consultant`, `alumni`.

Phone stores (under `pt:v1:`): `me`, `batch` (other cards), `cloud` (sync state incl. `role`, `batch`, `admin`, `partYear`, `partPull`), `roles` (uid to role), `owners` (cardId to uid), `parts` (restricted fields this phone may read).

Firestore, under `programs/{code}/`:
- `members/{uid}` `{name, email, joined, role, batch, admin}`; `requests/{uid}`
- `cards/{cardId}` public card (restricted fields and hidden birth year stripped)
- `partsRes/{cardId}` residents-only fields; `byBatch/{year}/parts/{cardId}` my-batch-only fields
- `channels/{id}` with `aud` (`all` | `res` | `b2027`), `messages`, `reports`, `events`
- `polls/{id}` and `polls/{id}/votes/{uid}`

`firestore.rules` holds the rules for BOTH apps (`/batches` for Batch Tickler, `/programs` for Psych Tickler); one project has one rules file.

Screens added: `#/bring`, `#/cup`, `#/buddies`, `#/kudos`, `#/advice`, `#/polls`. Version 1.1.0 (other chat) added the My card tab in the bottom bar, "Your card" box on Home, per-section Edit buttons, section jump chips and a slimmer top bar.

## 4. Recipe for one change

1. Clone `main`; restore tools from `dev-tools` (section 5); run the tests for a baseline.
2. Edit. New UI text goes in `data/strings-pt.js` in both languages. New screens: `VIEWS.x`, `AFTER.x`, `TITLES.x`, a `NAV` entry.
3. New cloud data: adapter method in `js/cloud.js`, a rule in `firestore.rules`, and the same method in `tools/mock.js`.
4. Bump version in `data/app-meta.js`, `sw.js`, `data/changelog.js`; update README.
5. Run all checks (section 5). Commit, push `main`.
6. Tell her which files changed, that `sw.js` was bumped, and whether `firestore.rules` must be pasted again.
7. Update this doc and `HANDOFF.md` on `dev-tools`.

## 5. Commands

```
git clone https://github.com/isaymotion/psychtickler && cd psychtickler
git fetch origin dev-tools && git worktree add ../pt-tools origin/dev-tools
python3 -m http.server 8765 &          # run from the main checkout
python3 ../pt-tools/tools/t1.py         # bring card, edit, save, open every screen
python3 ../pt-tools/tools/t2.py         # four phones on a mock cloud
python3 <isaymotion-app-design>/scripts/check_sw.py .
python3 <isaymotion-app-design>/scripts/check_design.py . --browser   # then delete _qa/
```

Passing: `t1` ends with no `PAGEERR` and no `RAW-KEYS` (a 403 console line for Google Fonts is normal). `t2` prints: consultant sees hobbies False, food False; second year sees hobbies True, food False; same-batch first year sees both True; nobody sees 1995; ends `no errors`. Both checks print PASS.

## 6. Status

| Item | State |
|---|---|
| 1.0.0 department build | Done, pushed |
| 1.1.0 My card placement and layout (other chat) | Done, pushed; tests pass on it |
| Tagalog for `pt.*` and reworded `bt.*` strings | Draft, awaiting her review |
| `firestore.rules` on the real project | NOT verified. Never run on an emulator or live |
| GitHub Pages switched on, rules pasted, department space created | Hers to do; not confirmed |
| Doc Andrei and Doc Vince made admins | After they join |
| Combined rules file copied into `isaymotion/tickler` | Not done (offered) |
| "Who is on duty today" | Not built; needs DutySched to publish duties to `programs/` |

## 7. Next steps

1. Ask her whether Pages is on, the rules are published and the space is created; help with any rule error (`permission-denied`) from a two-account test (one resident, one consultant).
2. If she agrees, copy `firestore.rules` into the `tickler` repo so the old file is never pasted again.
3. Next version is 1.1.1 or 1.2.0; next cache name `psychtickler-<that version>`.
4. Later: DutySched publishing, then "on duty today".

## 8. Pitfalls learned

- The Firestore emulator jar cannot be downloaded here (storage.googleapis.com is blocked), so rules can only be checked by reading and by a live two-account test.
- Rules are not filters. Queries must carry the constraint the rule checks: channels are listed with one `where('aud','==',x)` per audience; batch parts live in a per-year subcollection to avoid a composite index.
- `get` on a missing document fails rules that read `resource.data`; the channel rule allows `resource == null`.
- "My batch only" answers are not uploaded until the member's batch year is known (`cst().batch`); `pullRoles` runs before the first push.
- An admin who is a consultant cannot read residents-only parts, so `removeMember` deletes parts by card id without reading them.
- `sanitizeCard` runs during start-up: anything it needs (`POS`, `PRIV_GROUPS`, `FIELD_BY`) must be defined near the top of the card section.
- Batch Tickler requires a birth year; Psych Tickler must not.
- Playwright: 1.1.0 added a second element with `data-posgroup`; select `details[data-posgroup=consultant]`. Click sticky top bar buttons with `page.mouse.click`.
- A fresh clone of an empty repo has no `origin/main` ref until the first fetch names it; use `git pull origin main`.

## 9. Files to re-attach

None. The icon source is in the repo at `icons/icon-source.png`.
