# Psych Tickler: handoff

Last updated 12 November 2026 (after 1.3.2), at version 1.3.2 (commit `b64b700` on `main`). All tests (t1, t2, t3, t4, t5) and both checks pass. 1.3.0 adds event posters and programmes (built-in and member-added) and pins the built-in events in #announcements. 1.3.1 rewords the admin batch year box to "Year started residency". She reports the updated `firestore.rules` (with the `posters` match) is published in Firebase (12 Nov); a live poster upload is not yet confirmed. Next: two-account test (section 7).

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
- Messages she sends: she signs "— Isay". Dr. Irene Carmelle Tan (training officer, consultant) is "Doc IC". Doc Vince is "Vince" only in her DMs to him and "Doc Vince" to everyone else. Doc Andrei stays "Doc Andrei". Never put the join code in this doc or the repo.
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
- `events/{id}` (title, date, time, place, note, `poster` = upload time or 0, `updated`, `by`, `deleted`); `posters/{eventId}` `{by, updated, data, w, h}` (1.3.0; data URL under 420,000 characters)

`firestore.rules` holds the rules for BOTH apps (`/batches` for Batch Tickler, `/programs` for Psych Tickler); one project has one rules file. The same file is in `isaymotion/tickler`; any rule change must be copied to both repos so they stay identical.

Department-wide events (1.2.1): `data/dept-events.js` sets `window.DEPT_EVENTS`; `deptEvents()` (events section of `js/app.js`) validates them and `getEvents()` adds them as `builtin` (read-only, never stored or synced). Optional fields: `end` (last day; `evLeft()` keeps a range under Upcoming until then, `evWhen()` says "Happening now", the .ics DTEND covers it), `url` (Register link, https only, also .ics `URL:`), `lists` (`[{title, names}]`, tap-to-open). The file is public on GitHub Pages; she chose to include the PPA attendee names. To add a department event: edit that file only, then bump the version.

Event posters and programmes (1.3.0), section `PSYCH TICKLER 1.3.0: EVENT POSTERS AND PROGRAMMES` in `js/app.js` (just before Didactics day):
- Built-in events take `poster` (a file in `img/events/`, about 1000 px wide, under 250 KB, also listed in `CORE` in `sw.js`), `moderator` and `program` (`[{time, title, by}]`). `evPosterHTML()`, `evProgHTML()`; any `.ev__poster` button opens `posterZoom()` (one click listener on `document`).
- Member events: the form has a Poster field (`evPosterField()`, `bindPosterField()`; only when Cloud sync is joined). The picture is shrunk with `chatPhoto()` (cap `chatImgMax`), uploaded first with `api.putPoster`, then the event is saved with `poster` = upload time. Pictures are never in localStorage: `loadPosters()` fetches them when Department events opens and keeps them in memory (`posterCache`), so they need a connection. Remove poster or deleting the event calls `api.deletePoster` (rule: uploader or admin). Phones still on 1.2.3 drop the `poster` number if they edit that event.
- `cloudSync({pushOnly})` now also sends new or edited events (before 1.3.0 they waited for the next full sync).
- Chat: `chSort()` lists `announcements` first with a "Pinned" badge; `annPinsHTML()` puts a closed "Department events" box at the top of #announcements with up to 4 upcoming built-in events (poster, programme, Register).

Didactics day (1.2.0) is phone-only (no cloud data), in the section just before `PSYCH TICKLER 1.0.0: FUN`; it wraps `VIEWS.home`, `VIEWS.events` and `AFTER.events`.

Screens added: `#/bring`, `#/cup`, `#/buddies`, `#/kudos`, `#/advice`, `#/polls`. Version 1.1.0 (other chat) added the My card tab in the bottom bar, "Your card" box on Home, per-section Edit buttons, section jump chips and a slimmer top bar. 1.1.1 (other chat) tidied the Home banner picture.

Bring section (`js/app.js`, just before `PSYCH TICKLER 1.0.0: FUN`): `btCheck()` validates a card; `btCard()` reads `bt:v1:me`; `bringFile` holds a card read from a Batch Tickler backup file (memory only, cleared after a bring); `bringSrc()` prefers the file over the local card; `bringStrip()` is the Home/My card link (shown whenever `getMe()` is empty); `bringPicker()` is the file input; `BRING_FILE_MAX` 15 MB.

## 4. Recipe for one change

1. Clone `main`; restore tools from `dev-tools` (section 5); run the tests for a baseline.
2. Edit. New UI text goes in `data/strings-pt.js` in both languages. New screens: `VIEWS.x`, `AFTER.x`, `TITLES.x`, a `NAV` entry.
3. New cloud data: adapter method in `js/cloud.js`, a rule in `firestore.rules` (then copy the file into `isaymotion/tickler` too), and the same method in `tools/mock.js`.
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
python3 ../pt-tools/tools/t3.py         # bring from a backup file (1.1.2), wrong files, nothing leaks
python3 ../pt-tools/tools/t4.py         # built-in department events (1.2.1, GAPP 1.2.3): range, Register, lists, timed .ics
python3 ../pt-tools/tools/t5.py         # posters and programmes (1.3.0): GAPP poster, upload on the mock cloud, #announcements pins
python3 <isaymotion-app-design>/scripts/check_sw.py .
python3 <isaymotion-app-design>/scripts/check_design.py . --browser   # then delete _qa/
```

Passing: `t1` ends with no `PAGEERR` and no `RAW-KEYS` (a 403 console line for Google Fonts is normal). `t2` prints: consultant sees hobbies False, food False; second year sees hobbies True, food False; same-batch first year sees both True; nobody sees 1995; ends `no errors`. `t3` prints 18 `ok` lines and `no errors`. `t4` prints 10 `ok` lines and `no errors` (update it when the PPA or GAPP entries are removed). `t5` prints 22 `ok` lines and `no errors` (it needs Pillow; update it when the GAPP entry is removed: it expects 3 built-in events pinned). Both checks print PASS. If a test cannot connect, the http.server has stopped: start it again from the main checkout.

## 6. Status

| Item | State |
|---|---|
| 1.0.0 department build | Done, pushed |
| 1.1.0 My card placement and layout (other chat) | Done, pushed; tests pass on it |
| 1.1.1 Home banner (other chat) | Done, pushed |
| 1.1.2 Bring card from a Batch Tickler backup file | Done 11 Nov 2026, pushed (`95a9254`); t3 added on dev-tools. Not yet tried by her on a real installed iPhone/iPad |
| Tagalog for `pt.*` and reworded `bt.*` strings | Draft, awaiting her review |
| `firestore.rules` on the real project | Combined file PUBLISHED in Firebase 11 Nov 2026 (no errors). Behaviour not yet verified by a two-account test |
| GitHub Pages switched on, rules pasted, department space created | Done 11 Nov 2026: rules published, space "MMWGH Psychiatry" created by the owner (join code is hers; not stored here) |
| Bring card from Batch Tickler | Fixed in 1.1.2: file route for installed apps; same-browser route still works |
| Doc Andrei and Doc Vince made admins | After they join (☰ › Cloud sync › Members, Admin option) |
| Pilot invites (12 Nov 2026) | Messages drafted for her to send (app-install-message skill): Psych Tickler to Doc IC and Doc Andrei (Andrei's says he and Doc Vince will be co-admins; Doc Vince was invited by her separately); Usap Tayo (`isaymotion.github.io/Tagalog/`, no sign-in) to Doc IC, Vince and Doc Andrei. Psych Tickler messages describe it as "for residents, consultants, and any MMWGH alumni who want to join", running on GitHub with cards, chat and polls on Google Firebase for approved members only, and ask for suggestions before the department-wide rollout. She left the Year-level cup out of the messages; it is still in the app (ask if she wants it hidden) |
| Combined rules file copied into `isaymotion/tickler` | Done 11 Nov 2026 (`8d965bc`), README there updated; Batch Tickler rules unchanged, no app or `sw.js` change |
| 1.2.0 Didactics day every Thursday | Done 11 Nov 2026, pushed (`3605fdf`): Home card on Thursdays (heads-up Wednesdays), pinned weekly row on Department events, weekly .ics (`RRULE BYDAY=TH`). Section `PSYCH TICKLER 1.2.0: DIDACTICS DAY`, weekday `DD_DOW`. 9 `pt.dd.*` Tagalog drafts to review |
| 1.2.1 PPA 2027 conventions | Done 11 Nov 2026, pushed (`dbb8d45`): `data/dept-events.js` with the Annual registration deadline (30 Nov 2026, early bird PHP 10,000, reimbursement rules) and Psychiatry Without Borders, PRCP–PPA Congress 19–22 Jan 2027 (Crowne Plaza Hotel Galleria), Register link https://ppaprcpcongress2027.org/, Annual (10) and Midyear (8) attendee lists. Midyear (July 2027) has no dates yet. `pt.ev.now` Tagalog set by her in 1.2.2 ("Ginaganap ngayon"); `pt.ev.register` ("Mag-register") approved by her |
| 1.2.3 GAPP webinar | Done 12 Nov 2026, pushed (`504d43e`): id `gapp-2026-webinar`, "Drug Prevention and Control: A Time for All to Come Together to Champion for Health" (GAPP with PPA and Otsuka), Fri 27 Nov 2026 19:00, Zoom, free, Register https://bit.ly/GAPP2026Webinar. t4 now checks it (Register link, Tomorrow on 26 Nov, .ics `DTSTART:20261127T190000`) and accepts "Ginaganap ngayon" |
| 1.3.0 Event posters and programmes | Done 12 Nov 2026, pushed (`4a70c05`): GAPP poster (`img/events/gapp-2026-webinar.jpg`, 168 KB) and programme; member poster upload; #announcements first and pinning built-in events. Rules file copied to `isaymotion/tickler` (`4a29420`). She reports the rules are published (12 Nov 2026); the live upload is not yet confirmed. 20 new Tagalog drafts (`pt.ev.poster*`, `pt.ev.program`, `pt.ev.moderator`, `pt.ev.uploading`, `pt.ann.*`) by a Sonnet subagent, for her review. She chose this over a separate forum |
| 1.3.1 Clearer batch year | Done 12 Nov 2026, pushed (`f987ed5`): `pt.pos.batchPh` is now "Year started residency" (Tagalog set by her in 1.3.2, `b64b700`: "Taon na nagsimula ng residency"), the admin hint gives the example 2027, and the box in Cloud sync › Admin is wider. Batch year = the year someone entered residency (hers is 2027) |
| "Who is on duty today" | Not built; needs DutySched to publish duties to `programs/` |

## 7. Next steps

1. She brings her own card: Batch Tickler ☰ › Backup › Export, then Psych Tickler ☰ › Bring my card › Choose a Batch Tickler backup file. If anything fails on iPhone/iPad (file picker, Files app), fix it first.
2. She confirms a poster upload works on the live space (rules published 12 Nov). Then the two-account test (one resident, one consultant) on the live space, including attaching a poster to an event and seeing it on the other account; fix any `permission-denied`.
3. Make Doc Andrei and Doc Vince admins after they join. Act on suggestions from the pilot group (Doc IC, Doc Andrei, Doc Vince), then write the department-wide install/join group message (app-install-message skill), including the backup-file steps for bringing a Batch Tickler card. Ask whether to hide the Year-level cup.
4. Review Tagalog drafts, including the 13 new/changed `pt.bring.*` strings from 1.1.2 (drafted by a Sonnet subagent). Already approved by her: `pt.pos.batchPh` "Taon na nagsimula ng residency" (her wording; ask whether `pt.pos.startYear`, still the draft "Taon ng simula mo sa residency" on My card, should match), `pt.ev.now` "Ginaganap ngayon" and `pt.ev.register` "Mag-register" (hyphen confirmed).
5. When the PPA Midyear 2027 dates are announced, add it to `data/dept-events.js` (move the Midyear list onto it) and adjust t4.
6. After 27 Nov 2026, remove the GAPP webinar from `data/dept-events.js` when it is long past: also delete `img/events/gapp-2026-webinar.jpg`, take it out of `CORE` in `sw.js`, and adjust t4 and t5.
7. Later: DutySched publishing, then "on duty today".

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

- Installed web apps on iOS/iPadOS (and Safari Add to Dock) do NOT share localStorage with each other or with the browser, even on the same origin. Anything that reads another app's local data must also offer a file route.

- Parallel chats can take a version number. Before a release, `git pull` and read the top of `data/changelog.js`; use the next free version (1.1.1 was taken, so the backup-file build became 1.1.2).
- Built-in events are always present, so the Planner badge can pop on first visit to Department events (already true with "First day of residency"); harmless.
- Push access: if `git push` returns 403 from the git proxy, attach the repo to the session with push access first.
- `BK_APP` is declared with `var` further down `js/app.js` than the bring section; it is only read inside handlers at run time, so that is fine.

- `AFTER.events` has a local variable named `cst` (the calendar status line), which hides the `cst()` cloud-state function there; use `evCode()` for the join code inside it.
- A poster is a separate cloud document on purpose: events are copied into every phone's localStorage, and pictures there would fill the 5 MB quota.

## 9. Files to re-attach

None. The icon source is in the repo at `icons/icon-source.png`.
