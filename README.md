# Psych Tickler

A directory for the whole MMWGH Psychiatry department, all residents and consultants: fill in your own card on your phone, share it with the department, and get to know everyone's hometowns, interests, birthdays and favourites. It is Batch Tickler grown up for a larger group. It runs in the browser, works offline after the first visit, and can be installed on phones and desktops.

**Live site:** https://isaymotion.github.io/psychtickler/ (after GitHub Pages is switched on; see below)

## What is different from Batch Tickler

- **Bring my card from Batch Tickler** (`#/bring`): both apps live on `isaymotion.github.io`, so Psych Tickler reads the card Batch Tickler saved on the same phone (`bt:v1:me`) and copies it. Basics, Background, Favourites, Life, photo, birthday, lists, playlists, custom fields and game answers are ticked; Contact (per field) and Emergency are not. Chat, shoutouts, badges, Kris Kringle, votes and events are never copied. Batch Tickler is not changed.
  - **From a backup file (1.1.2):** installed Home Screen apps (iPhone, iPad, Safari "Add to Dock" on Mac) each have their own storage, so `#/bring` also takes a Batch Tickler backup file (Batch Tickler ☰ › Backup › Export, `batchtickler-backup-YYYY-MM-DD.json`). Only `app === 'batchtickler'` files are accepted (Psych Tickler backups get their own message), only `data.me` is read, files over 15 MB are refused, and the card is held in memory until "Bring my card" is tapped. No other key is imported, nothing under `bt:v1:` is written, and Psych Tickler's own backup/restore is unchanged. The Home and My card link to `#/bring` shows whenever you have no card yet.
- **Position** on every card: `pos` (resident, consultant, alumni), `startYear` (the year they entered residency, which is their batch) and `chief`. Year level = this year minus `startYear` plus 1, so it rolls over each January. The position an admin records in Cloud sync wins over what the card says.
- **Quick card**: the 15 fields in `QUICK_FIELDS` (data/fields.js) come first on My card; the other groups are optional. **For consultants**: subspecialty, clinic days, referral preference, best hours, teaching topics, consultant since.
- **Birth year** is optional and is uploaded only when its owner ticks "Show my birth year".
- **Who sees this**: a resident can mark any non-private answer Residents only or My batch only (`card.aud`). Those values are removed from the public card and uploaded separately (`partsRes/{cardId}`, `byBatch/{year}/parts/{cardId}`); the security rules only let the right members read them. "My batch only" is not uploaded at all until an admin has recorded the member's batch year.
- **Admins in the database**: the owner account in `CLOUD_CONFIG.admins` creates the department space and makes other members admins (Cloud sync › Admin › Make admin). Admins approve requests, set each member's position and batch year, and mark people Alumni instead of removing them.
- **Chat**: every channel has an audience (`aud`: everyone, residents only, or one batch), fixed when it is opened. Starting channels include #announcements, #kudos and a residents-only #residents; each batch gets a private #batch-YYYY the first time one of its members opens Chat. A "No patient details" rule is pinned on every chat screen. Photos are capped at about 300 KB and an admin's phone clears photos older than 90 days (`chatImgMax`, `chatImgKeepDays` in data/cloud.js).
- **New screens**: Year-level cup (`#/cup`), Buddies and coffee roulette (`#/buddies`), Kudos wall (`#/kudos`), Advice wall (`#/advice`), Polls and potluck (`#/polls`).
- **Department-wide events (1.2.1)**: `data/dept-events.js` (`window.DEPT_EVENTS`) holds built-in events everyone sees on Department events: read-only, never synced, optional `end` (multi-day), `url` (Register link) and `lists` (tap-to-open name lists). The file is public. First entries: PPA 2027 Annual registration deadline (30 Nov 2026) and the PRCP–PPA Congress, 19–22 Jan 2027, with the Annual and Midyear attendee lists. Added in 1.2.3: the free GAPP webinar on drug prevention and control, 27 Nov 2026, 7:00 PM, Zoom.
- **Event posters and programmes (1.3.0)**: a built-in event may carry `poster` (a file in `img/events/`, also listed in `CORE` in `sw.js`), `moderator` and `program` (`[{time, title, by}]`); the GAPP webinar has all three. Members can attach a poster to an event they add: it is shrunk on the phone like a chat photo (about 300 KB) and stored in `programs/{code}/posters/{eventId}`; the event only keeps a number (`poster`, the upload time) and each phone fetches the picture when Department events is opened (needs a connection; not kept in the phone's storage). Removing the poster or the event deletes the picture (uploader or admin). In Chat, #announcements is listed first and pins the upcoming built-in events with their posters and programmes. **Needs the updated `firestore.rules`** (new `posters` match under `programs`); the same file goes into the `tickler` repo.
- **Didactics day (1.2.0)**: every Thursday Home shows a Didactics day card (a heads-up on Wednesdays), and Department events (`#/events`) pins a weekly row with the next Thursday and an "Add every Thursday to my calendar" .ics (`RRULE:FREQ=WEEKLY;BYDAY=TH`). Worked out on the phone; the weekday is `DD_DOW` in `js/app.js`.
- **Didactics schedule (1.4.0)**: the Didactics day row on Department events has a Schedule of the next 8 Thursdays (`DD_WEEKS`) with topic, presenter, moderator and a note. Admins add or edit a week there; it is saved straight to `programs/{code}/didactics/{YYYY-MM-DD}` (rule: admins write, members read) and every phone keeps a text copy in the `dd` store (`syncDD()`), so it shows offline and on the Home card. A cleared week stays in the cloud as an empty row. **`firestore.rules` changed in 1.4.0: publish it again in Firebase and copy it to `isaymotion/tickler`.**
- **Not built yet**: "who is on duty today" needs DutySched to publish duties to the program-wide space first.

## Firebase: one project, two apps

Psych Tickler uses the **same Firebase project as Batch Tickler** (`batch-tickler`) with its own top-level space, `programs/{code}/…`. Batch Tickler stays under `batches/{code}/…`.

1. A project has one rules file. `firestore.rules` in this repo contains the rules for **both** apps. Paste the whole file into Firebase console › Firestore › Rules and Publish. Do not paste the older Batch Tickler-only file afterwards (copy this file into the `tickler` repo too so the two never drift).
2. Sign in on Cloud sync with the owner account, create the department space, and share the join code.
3. As people join, approve them and check their position and batch year. Make Doc Andrei and Doc Vince admins from the member list.
4. The free plan's limits (1 GB stored, 50,000 reads a day) are shared by both apps.

The rules were written carefully but have **not** been run against the Firestore emulator (it could not be downloaded in the build environment). Test with two accounts before inviting everyone: a resident and a consultant should see different channels and answers.

## Features carried over from Batch Tickler

The text below is Batch Tickler's feature list; where it says batch, read department.

- **My card** — each resident fills in their own card on their phone: name, photo (shrunk to a small square), birthday (with year, required) and 134 fields in five collapsible groups — Basics (nickname, how to address you, pronouns, hometown, where you live, commute, languages), Background (med school, internship, year graduated, past jobs, why psychiatry, interests), Favourites — in sub-sections On screen / Games & fandoms / Music & words / Food & drink / Little things / Med school — (TV, K-drama, movies, cartoons, anime, games, music, books, authors, podcasts, sports, food, snack, dessert, comfort food, local eats, coffee/tea, colour, Pokémon, can't-live-without, karaoke song), Life — in sub-sections Everyday / Growing up / About you / Horizons / Residency / Just for fun — (hobbies, study style, pets, hidden talent, de-stress, gift hints, fun fact) and Contact & practical (phone, Viber, Telegram/WhatsApp, two emails, Facebook/Instagram/Spotify/Steam/YouTube links, Discord, other socials, GCash/Maya, where you stay, landmark, birthday preference, shirt/scrub/shoe sizes, blood type, allergies/diet, duty conditions, two emergency contacts, PRC/licence/passport expiry months — in-app only; GCash and duty conditions also stay out of QR codes). Plus up to ten Spotify playlist links, free-form custom fields, zodiac worked out from the birthday, and a completeness meter. Only the owner edits it.
- **Things in common** — a batchmate's page lists what you share (same hometown/school/year, shared shows, books, food…).
- **Batch name and batch photo** — set in About › Settings; the name shows on the home screen and prints, the photo replaces the home banner on that device.
- **The batch** — everyone's cards in one grid, with a quick filter and sorting by name, next birthday or hometown. Tap a card for the full page (contact buttons: call, message, email).
- **Today in the batch** (Home) — a featured Spotify playlist and a featured fact of the day (one question, everyone's answers). Picks change at midnight and match on every phone with the same cards; *Show another* browses more.
- **Birthday banner** (Home) — confetti and a *Greet them* button (share sheet / copy) on a batchmate's birthday.
- **Spotlight of the week** (Home) — one batchmate per week; **Residency day counter** (Home; counts from 1 January 2027 — `residencyStart` in data/hospital.js — and can be changed per phone in About).
- **Play** — *Guess who*, *Who said it?* (guess whose answer it is), *Batch Bingo* (board built from the cards, saved on the phone), *Icebreakers* (36 questions + questions from the cards), *Batch Wrapped* (swipeable year-in-review slides).
- **Link lists** — ranked `{title, url}` lists on each card, configured in `LINK_LISTS` (data/fields.js): Top 10 shows (Netflix & streaming; `card.netflix`), Birthday wishlist (Shopee/Lazada), Top films (Letterboxd), YouTube favourites, Podcasts, Books (Goodreads), Favourite food spots and Travel bucket list (Google Maps), Study stash (`card.lists[key]`). Links are host-checked; without one, the title opens a search. Home shows a Show recommendation of the day; **Batch picks** (`#/picks`) aggregates every list; wishlists show on the birthday banner; bucket-list places show on the map. In-app only (not in QR codes or the batch sheet; included in the Full directory print).
- **Kris Kringle** (`#/monito`, formerly Monito-monita) — name draw (Sattolo cycle, nobody draws themselves), budget + date (optionally added to events), per-person Send via share sheet with the match's wishlist; stored as `monito`.
- **1.15.0 fun pack** — `#/truths` (Two truths and a lie), `#/quiz/<id>` (How well do you know…?), `#/baby` (baby photo guess), Share result emoji lines on every game, `#/thisorthat` (+ `/split`), `#/superlatives` (+ `/results`), `#/qotw` (Question of the week, also on Home), Birthday wall on person pages, `#/capsule` (time capsule), `#/tcard/<id>` (trading-card PNG), `#/eat` (food-spot spinner), `#/anthem` (batch anthem). Content in `data/fun.js`.
- **Badges** (`#/badges`) — 19 badges earned on the phone (`badges` key), copied to your card (`card.badges`).
- **Batch events** (`#/events`) — `events` key; built-in first day of residency; countdown, .ics; travel in the whole-batch file (`events` array).
- **Shoutouts** — `card.shoutouts` on the sender's card, shown on the receiver's card and Home.
- **Ask me about** (`askMe` field, chips on cards) and **Word of the day** (`teachWords` field, Home).
- **Hometown map** — offline map of the Philippines (`data/cloud.js           Firebase web config, admin list, private card groups (window.CLOUD_CONFIG)
data/places.js`, Natural Earth outline + ~240 places) with dots per hometown; unrecognised hometowns listed separately.
- **Batch twins** (Batch stats) — the pairs with the most things in common.
- **Birthdays** — grouped Today / This month / by month, days to go, and the age when a year was given.
- **Cloud sync** (1.18.0, `#/sync`) — cards travel through Firebase (Firestore, free Spark plan) instead of files and QR codes (both removed in 1.18.0). Sign in with Google, enter the batch's join code, wait for the admin to approve; then your card is sent whenever you save it and new cards arrive each time the app opens (at most every 5 minutes, or Sync now). Emergency & medical and Contact details leave the phone only if their owner ticks consent. Batch events sync too. The admin (`CLOUD_CONFIG.admins` in data/cloud.js, mirrored in `firestore.rules`) creates the batch and join code, approves or declines requests and removes members. Leaving deletes your card from the cloud. Security rules: `firestore.rules` (paste into Firebase console › Firestore › Rules › Publish).
- **Finding and editing My card + cleaner look** (Psych Tickler 1.1.0, same code as Batch Tickler 1.23.0–1.24.0) — tab bar Home, Chat, My card (shows your photo), Emergency, Menu; menu starts Home, Chat, My card; Home shows the chat card then a "Your card" strip; your own page has an Edit link per section (`#/me/<section>`) and chips for empty sections; My card has jump chips, "Next empty question" and a Save bar that stays in view. On phones the top bar is one row and search opens from a button.
- **Chat** (1.21.0, `#/chat`, tab bar) — batch channels in Firestore (`batches/{code}/channels/{id}/messages`), members only. 15 starting channels made by the admin's phone the first time; any member can add one (creator or admin renames/deletes). Text with preview cards for YouTube/Spotify/TikTok/Drive/Netflix/Maps (no server, no scraping), photos shrunk in the browser to ≤1280 px and <900 KB and stored in the message, 48 built-in stickers (`data/stickers.js`, `img/stickers/`), emoji reactions, reply, delete, report to admin. Only the open channel has a realtime listener (newest 30, Load older pages 30); unread badges come from each channel's `last` at sync time. Needs the updated `firestore.rules`.
- **Birthday calendar** — add one birthday or the whole batch to the phone calendar (.ics, yearly).
- **Batch stats** — hometowns, med schools, languages, birthdays by month, oldest to youngest, most shared favourites.
- **Print sheet** — three modes: a compact "meet the batch" page without contact details; Name tags (8 per A4 page); and a Full directory with every field including contact details, one person per page. Print or save as PDF from the browser.
- **Guess who** — three modes (clue → name, photo → name, name → birth month), rounds of ten, leaderboard on this phone.
- Shared isaymotion shell: search from the top bar (press `/`), back/forward buttons and `Alt+Left/Right`, light/dark/match-device theme, text size (Aa), English / Tagalog, What's new with an unseen badge, footer backup (export / import / undo), installable, offline after the first visit.

## Files to upload

Upload everything in this folder to the root of the repository, keeping the folder structure:

```
.nojekyll               (empty file; tells GitHub Pages not to run Jekyll)
README.md
index.html              App shell (top bar, sidebar menu, footer, bottom tabs)
css/app.css             Styles (light and dark themes)
js/app.js               Router, menu, views (VIEWS), navigation (NAV), search, theme, backup
js/cloud.js             Cloud adapter (Firebase calls), loaded only for Cloud sync
js/vendor/firebase.js   Firebase JS SDK 13.2 (app, auth, firestore — full, for the chat listener since 1.21.0), bundled with esbuild, Apache-2.0
data/app-meta.js        App name, version, attribution (window.APP_META), menu links (window.APP_LINKS)
                        and the commented MIGRATE_KEYS example
data/changelog.js       What's new entries (window.APP_CHANGELOG)
data/hospital.js        Hospital, program, posts and year levels (window.HOSPITAL), shared across apps
data/strings.js         UI strings in English and Tagalog (window.STRINGS)
data/strings-pt.js      Psych Tickler's own strings (keys pt.*), merged into window.STRINGS
data/fields.js          Resident-card field list (window.CARD_FIELDS) and the Guess-who fields
data/icebreakers.js     Icebreaker questions (English + Tagalog drafts)
data/stickers.js        Chat sticker packs (window.STICKERS): Goose, Capybara, Cat × 16
data/places.js          Offline hometown map: Philippines outline + place coordinates (Natural Earth, public domain)
img/banner.jpg          Home banner (plus banner-small.jpg for phones)
img/stickers/           Chat stickers, img/stickers/<set>/<set>-NN-<slug>.webp (512×512)
icons/                  icon-192.png, icon-512.png, icon-maskable-512.png, favicon-32.png, favicon-64.png,
                        favicon.ico, apple-touch-icon.png, icon-source.png (the original artwork)
manifest.webmanifest    Install metadata
sw.js                   Offline cache
firestore.rules         Firestore security rules (not used by the site itself; pasted into the Firebase console)
```

Replace `index.html` whenever icon or manifest links change. The header logo uses `icons/icon-192.png`.

## Publish on GitHub Pages

1. Create a new repository named `psychtickler` on GitHub and upload all files in this folder, keeping the folder structure.
2. In the repository, open **Settings > Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
4. After a minute the site is live at `https://isaymotion.github.io/psychtickler/`.
5. On a phone, open that link, then use **Add to Home Screen** (iPhone Safari) or **Install app** (Android Chrome).

There is no build step and no dependencies. To preview locally, run `python3 -m http.server` in this folder and visit `http://localhost:8000`.

## How cards move between phones

Each phone holds one editable card (`pt:v1:me`) and a list of imported cards (`pt:v1:batch`). A card file is `{app:'batchtickler', kind:'card', card:{…}}`; a batch file is `{kind:'batch', cards:[…]}`; the footer backup is also accepted. Imports match on card id, then on the exact name; the copy with the newer `updated` time wins. Removing a card on one phone does not remove it elsewhere.

## Adding a screen

1. In `js/app.js`, inside the `APP VIEWS` section, add `VIEWS.myscreen = function (arg) { return '<div class="wrap page">...</div>'; };` (use `esc()` on any data).
2. Add one entry to the `NAV` array: `{ label: 'My screen', href: '#/myscreen', icon: 'star', group: 'Screens' }`. That adds it to the sidebar, the drawer and the home tiles.
3. Optional: add rows to `SEARCH_INDEX` (`{title, text, href, kind}`) so the screen shows up in search.
4. Add an entry to the top of `data/changelog.js` and bump the version (below).

Reusable CSS classes are in `css/app.css`: `btn`, `btn--solid`, `link-btn`, `filters`/`filter`, `seg`, `card`, `row`, `callout`, `table-wrap`, `page`/`page__head`, `crumb`, `empty`, `badge`, `meter`. New in this app: `.field` (form inputs), `.avatar`, `.pcard`, `.fact`, `.sheet` (print). Flashcards, quizzes and spaced repetition are not included; copy them from the Stahl or DSMVapp repos if a study app needs them.

## Shared data, languages and other apps

- `data/hospital.js` defines `window.HOSPITAL` (hospital name, program, province, posts, year levels, form prefix). It is shared across the apps: edit it in one place and copy the file to the others instead of hardcoding these values.
- `data/strings.js` defines `window.STRINGS = { en, tl }` for the shell's own UI text. Use `t('key')` in `js/app.js`; it falls back to English, then to the key. The Tagalog values are a draft until Dr. Navarro reviews them. Add the same key to both languages when you add shell text.
- `window.APP_LINKS` (in `data/app-meta.js`) feeds the "Other apps" menu group. The entry matching this app's own repo slug is skipped, so the same list works in every app. These links never appear in the home tiles, search or tab bar.
- `window.MIGRATE_KEYS` (optional; a commented example is in `data/app-meta.js`) is for a restyled app whose storage prefix changed: at startup each saved key under an old prefix is copied under the new prefix and the old key removed, so saved progress survives.

## Version and What's new

- The app version is a semantic version string (for example `1.0.0`). It lives in `data/app-meta.js` (`version`), in the first entry of `data/changelog.js`, and in `sw.js` (`VERSION`).
- `data/changelog.js` is newest first. Each entry is `{version, date, title, items:[{type, text}]}` where `date` is ISO `YYYY-MM-DD` and `type` is `feature`, `update`, `correction` or `content`. Write plain sentences, sentence-case titles, no emoji, and start an item with the feature name and a colon.
- For every release: add the changelog entry at the top, update `version` in `data/app-meta.js`, set `VERSION` in `sw.js` to the same version (this makes returning users get the new files), and update "Latest version November 2026" in `index.html`, `data/app-meta.js` and this README.
- The unseen badge is keyed on the version string: visitors see a count of entries newer than the last version they opened on the What's new page.
- Storage keys start with `pt:v1:`, and cache names start with `psychtickler-`. All isaymotion apps share one origin (`isaymotion.github.io`), so keep both unique per app. Do not change them after release, or saved data will be lost.

## Attribution

App created by Isabella Navarro, MD. Latest version November 2026. isaymotion@gmail.com

A tool for the Psychiatry and Public Mental Health Residency Training Program, Mariveles Mental Wellness and General Hospital. Your card is saved on this device; it goes to the cloud only if you join the department on Cloud sync. Never enter patient information.
