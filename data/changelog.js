/* What's new. Newest entry FIRST. version = semver string (also the key for the unseen badge),
   date = ISO YYYY-MM-DD. Item type: feature | update | correction | content.
   Optional per item: href (an in-app '#/...' link) shown as "Open". Add an entry for every release,
   then bump APP_META.version, VERSION in sw.js, and "Latest version" in the footer / README. */
window.APP_CHANGELOG = [
  {
    version: '1.5.1', date: '2026-11-13', title: 'Export backup works on Android',
    items: [
      { type: 'correction', text: 'Export backup on Android phones said "Export cancelled" and saved nothing. It now saves the backup file to the phone\'s Downloads folder.' },
      { type: 'correction', text: '"Last exported" now changes only when a backup file was really saved.' }
    ]
  },
  {
    version: '1.5.0', date: '2026-11-12', title: 'Consultant quick facts',
    items: [
      { type: 'feature', text: 'Consultants at a glance: a new screen lists every consultant with their clinic days, subspecialty or interests, and the best way and hours to reach them. Search it by name, day or interest.', href: '#/consultants' },
      { type: 'feature', text: 'A consultant\'s page now opens with a Quick facts box, and their card in the directory shows their subspecialty and clinic days.', href: '#/batch' },
      { type: 'feature', text: 'My card for consultants: new answer "Preferred way to be reached". Consultants who have not filled in their quick facts see a reminder.', href: '#/me' },
      { type: 'correction', text: 'The "For consultants" answers no longer show on the page of someone who is not a consultant.' }
    ]
  },
  {
    version: '1.4.0', date: '2026-11-12', title: 'Didactics schedule',
    items: [
      { type: 'feature', text: 'Didactics schedule: Department events now lists the next 8 Thursdays with the topic, presenter and moderator for each. It needs Cloud sync.', href: '#/events' },
      { type: 'feature', text: 'Didactics schedule for admins: Add or Edit beside a Thursday sets the topic, presenter, moderator and a short note for everyone in the department.', href: '#/events' },
      { type: 'update', text: 'Didactics day: the Home card on Wednesdays and Thursdays shows that week\'s topic and presenter.', href: '#/home' },
      { type: 'correction', text: 'Department events: the page no longer scrolls sideways on phones that joined Cloud sync.', href: '#/events' }
    ]
  },
  {
    version: '1.3.3', date: '2026-11-12', title: 'Tagalog wording',
    items: [
      { type: 'correction', text: 'Tagalog: My card asks for "Taon na nagsimula ka ng residency".', href: '#/me' }
    ]
  },
  {
    version: '1.3.2', date: '2026-11-12', title: 'Tagalog wording',
    items: [
      { type: 'correction', text: 'Tagalog: the batch year box says "Taon na nagsimula ng residency".', href: '#/sync' }
    ]
  },
  {
    version: '1.3.1', date: '2026-11-12', title: 'Clearer batch year',
    items: [
      { type: 'update', text: 'Cloud sync: the batch year box now says "Year started residency", and the admin hint gives an example (2027).', href: '#/sync' }
    ]
  },
  {
    version: '1.3.0', date: '2026-11-12', title: 'Event posters and programmes',
    items: [
      { type: 'feature', text: 'Department events can show a poster: tap the picture to see it full size. The GAPP webinar (27 November) now has its poster and the full programme with times and speakers.', href: '#/events' },
      { type: 'feature', text: 'Adding an event of your own? You can attach a poster. It is shrunk on your phone and shared with the department through Cloud sync. No patient details.', href: '#/events' },
      { type: 'update', text: 'Chat: #announcements is now first in the list and pins the upcoming department events, with their posters and programmes.', href: '#/chat/announcements' }
    ]
  },
  {
    version: '1.2.3', date: '2026-11-12', title: 'GAPP webinar on Department events',
    items: [
      { type: 'content', text: 'Department events now shows the free GAPP webinar "Drug Prevention and Control: A Time for All to Come Together to Champion for Health" (with the PPA and Otsuka), Friday 27 November 2026, 7:00 PM on Zoom, with a Register link.', href: '#/events' }
    ]
  },
  {
    version: '1.2.2', date: '2026-11-11', title: 'Tagalog wording',
    items: [
      { type: 'correction', text: 'Tagalog: an event that is on now says "Ginaganap ngayon".', href: '#/events' }
    ]
  },
  {
    version: '1.2.1', date: '2026-11-11', title: 'PPA 2027 conventions on Department events',
    items: [
      { type: 'content', text: 'Department events now shows Psychiatry Without Borders, the PRCP–PPA Congress 2027 (19–22 January 2027, Crowne Plaza Hotel Galleria), with a Register link and the Annual and Midyear attendee lists.', href: '#/events' },
      { type: 'content', text: 'Reminder for residents listed for the Annual convention: pay and register by 30 November 2026 (early bird PHP 10,000). The hospital reimburses one registration a year once post-training documents are complete.', href: '#/events' },
      { type: 'update', text: 'Events that run over several days show the full date range, stay under Upcoming until their last day, and add to your calendar as one multi-day event.' }
    ]
  },
  {
    version: '1.2.0', date: '2026-11-11', title: 'Didactics day every Thursday',
    items: [
      { type: 'feature', text: 'Didactics day: every Thursday, Home shows a Didactics day reminder, and on Wednesdays a heads-up that it is tomorrow.', href: '#/' },
      { type: 'feature', text: 'Department events: Didactics day is pinned at the top with the next Thursday, and one tap adds every Thursday to your phone calendar.', href: '#/events' }
    ]
  },
  {
    version: '1.1.2', date: '2026-11-11', title: 'Bring your card from a Batch Tickler backup file',
    items: [
      { type: 'feature', text: 'Bring my card now works with installed apps: in Batch Tickler tap ☰ › Backup › Export, then in Psych Tickler open Bring my card and choose that file. Only your card is read from it; contact and emergency details stay unticked unless you tick them.', href: '#/bring' },
      { type: 'update', text: 'Until you have a card here, Home and My card show a link to Bring my card, even when no Batch Tickler card is found on this device.' }
    ]
  },
  {
    version: '1.1.1', date: '2026-11-11', title: 'Tidier Home picture',
    items: [
      { type: 'update', text: 'Home: the title is no longer written twice over the picture, and the space around the picture is purple to match the rest of the app.' }
    ]
  },
  {
    version: '1.1.0', date: '2026-11-11', title: 'My card is easier to find, and a cleaner look',
    items: [
      { type: 'feature', text: 'My card now has its own button in the middle of the bottom bar (it shows your photo) and a "Your card" box near the top of Home, right under the chat. In the menu, Chat and My card come first, right after Home.', href: '#/me' },
      { type: 'feature', text: 'On your own page, every section has an Edit button that opens just that part of your card. Sections you have not filled in yet are listed at the bottom; tap one to add it.' },
      { type: 'feature', text: 'My card: tap a section name at the top to jump to it, or tap "Next empty question" to go straight to what is still blank. The Save button stays on screen while you scroll.', href: '#/me' },
      { type: 'update', text: 'A cleaner look, the same as Batch Tickler: on phones the top bar is one slim row (tap the magnifying glass to search), the picture on Home is shorter with no text over the faces, cards are tighter, labels are no longer in ALL CAPS, and each person\'s photo sits beside their name.' },
      { type: 'update', text: 'Bottom bar is now Home, Chat, My card, Emergency, Menu. About moved to the menu and the bottom of every page.' },
      { type: 'correction', text: 'Names inside sentences (twins, shoutouts, the map list) are plain links again.' }
    ]
  },
  {
    version: '1.0.0', date: '2026-11-11', title: 'Psych Tickler: the whole department',
    items: [
      { type: 'feature', text: 'Psych Tickler: one directory for the whole MMWGH Psychiatry department, all residents and consultants. It is built on Batch Tickler and keeps its games, birthdays, chat and printing.' },
      { type: 'feature', text: 'Bring my card from Batch Tickler: one tap copies the card you already filled in on this phone. Contact and emergency details are left behind unless you tick them.', href: '#/bring' },
      { type: 'feature', text: 'Position: say whether you are a resident, consultant or alumni, and the year you started residency. Year levels are worked out from that each January. The department page can be filtered by position.', href: '#/batch' },
      { type: 'feature', text: 'Quick card: fifteen short answers come first on My card, so a useful card takes about two minutes. Everything else is optional.', href: '#/me' },
      { type: 'feature', text: 'For consultants: subspecialty, clinic days, how you prefer referrals, best hours to reach you and topics you enjoy teaching.', href: '#/me' },
      { type: 'feature', text: 'Who sees this: residents can mark any answer as Residents only or My batch only. Those answers are stored separately and never reach phones that should not see them.', href: '#/me' },
      { type: 'update', text: 'Birthday: the year is optional and stays on your phone unless you choose to show it. Others see only the day and month.', href: '#/me' },
      { type: 'feature', text: 'Admins: more than one person can approve join requests and set positions. Members who finish residency become Alumni instead of being removed.', href: '#/sync' },
      { type: 'feature', text: 'Chat: residents-only and per-batch channels, a pinned reminder never to post patient details, smaller photos, and photos older than 90 days are cleared.', href: '#/chat' },
      { type: 'feature', text: 'Year-level cup: first years, second years, third years and consultants ranked by badges per person.', href: '#/cup' },
      { type: 'feature', text: 'Buddies and coffee roulette: a new coffee pair every Monday, and the people outside your year level you have the most in common with.', href: '#/buddies' },
      { type: 'feature', text: 'Kudos wall: every shoutout in the department, with the most thanked people of the month.', href: '#/kudos' },
      { type: 'feature', text: 'Advice wall: what seniors and consultants wish they had known in first year.', href: '#/advice' },
      { type: 'feature', text: 'Polls and potluck: quick department votes, and sign-up lists for who brings what.', href: '#/polls' }
    ]
  }
];
