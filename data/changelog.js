/* What's new. Newest entry FIRST. version = semver string (also the key for the unseen badge),
   date = ISO YYYY-MM-DD. Item type: feature | update | correction | content.
   Optional per item: href (an in-app '#/...' link) shown as "Open". Add an entry for every release,
   then bump APP_META.version, VERSION in sw.js, and "Latest version" in the footer / README. */
window.APP_CHANGELOG = [
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
