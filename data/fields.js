/* Resident-card fields, in display order, grouped. Labels come from data/strings.js (bt.f.<key>, bt.g.<group>).
   type: 'text' | 'textarea' | 'tel' | 'email' | 'year'. print:false keeps a field off the printable sheet and name tags
   (contact, allergies, emergency contact, social handles stay in-app only).
   Name, birthday and photo are handled separately in the edit form; the list below is the free-text part of the card.
   Adding a field: one line here + 'bt.f.<key>' in both languages in data/strings.js. Old cards simply have it empty. */
window.CARD_GROUPS = ['quick', 'consultant', 'basics', 'emergency', 'background', 'favourites', 'life', 'contact'];
/* Psych Tickler: the Quick card. These fields are shown first, in one open group ('quick'), so a busy consultant or
   senior resident can finish a useful card in two minutes. They keep their own group for everything else (cloud
   consent, printing); only the edit form and the person page move them up. */
window.QUICK_FIELDS = ['nickname', 'preferredName', 'hometown', 'languages', 'askMe', 'medSchool', 'whyPsych', 'hobbies', 'food', 'coffeeTea', 'music', 'shows', 'karaoke', 'funFact', 'advice'];
/* Groups shown only for one position (card.pos): the consultant group is hidden on a resident's form and page. */
window.POS_GROUPS = { consultant: 'consultant' };
/* Psych Tickler 1.5.0: a consultant's quick facts, in display order. Shown in a box at the top of their page, on their
   card in the directory and on #/consultants. All are plain fields of the 'consultant' group below. */
window.CONS_QUICK = ['cSpecialty', 'clinicDays', 'reachPref', 'contactHours'];
/* Sub-sections inside a group (labels: bt.s.<sub>), in display order. Fields carry sub: '<key>'. */
window.CARD_SUBS = { favourites: ['screen', 'play', 'words', 'food', 'little', 'medschool'], life: ['everyday', 'growingup', 'you', 'horizons', 'residency', 'fun'] };

window.CARD_FIELDS = [
  { key: 'nickname',        group: 'basics',      type: 'text',     print: true,  icon: 'tag' },
  { key: 'preferredName',   group: 'basics',      type: 'text',     print: true,  icon: 'tag' },
  { key: 'pronouns',        group: 'basics',      type: 'text',     print: true,  icon: 'tag' },
  { key: 'hometown',        group: 'basics',      type: 'text',     print: true,  icon: 'pin' },
  { key: 'livesNow',        group: 'basics',      type: 'text',     print: true,  icon: 'pin' },
  { key: 'commute',         group: 'basics',      type: 'text',     print: false, icon: 'pin' },
  { key: 'languages',       group: 'basics',      type: 'text',     print: true,  icon: 'chat' },
  { key: 'askMe',           group: 'basics',      type: 'text',     print: true,  icon: 'chat', hint: true },
  { key: 'bloodType',       group: 'emergency',     type: 'text',     print: false, icon: 'heart' },
  { key: 'allergies',       group: 'emergency',     type: 'text',     print: false, icon: 'food' },
  { key: 'dutyConditions',  group: 'emergency',     type: 'textarea', print: false, icon: 'heart', qr: false },
  { key: 'emergencyContact',group: 'emergency',     type: 'text',     print: false, icon: 'phone' },
  { key: 'emergencyRelation',group: 'emergency',    type: 'text',     print: false, icon: 'users' },
  { key: 'emergencyNumber', group: 'emergency',     type: 'tel',      print: false, icon: 'phone' },
  { key: 'emergencyContact2',group: 'emergency',    type: 'text',     print: false, icon: 'phone' },
  { key: 'emergencyRelation2',group: 'emergency',  type: 'text',     print: false, icon: 'users' },
  { key: 'emergencyNumber2',group: 'emergency',     type: 'tel',      print: false, icon: 'phone' },
  { key: 'cSpecialty',      group: 'consultant',  type: 'text',     print: true,  icon: 'spark' },
  { key: 'clinicDays',      group: 'consultant',  type: 'text',     print: true,  icon: 'calendar' },
  { key: 'reachPref',       group: 'consultant',  type: 'text',     print: true,  icon: 'chat', hint: true },
  { key: 'referralPref',    group: 'consultant',  type: 'textarea', print: true,  icon: 'chat' },
  { key: 'contactHours',    group: 'consultant',  type: 'text',     print: true,  icon: 'phone' },
  { key: 'teaching',        group: 'consultant',  type: 'textarea', print: true,  icon: 'book' },
  { key: 'cSince',          group: 'consultant',  type: 'year',     print: true,  icon: 'school' },
  { key: 'medSchool',       group: 'background',  type: 'text',     print: true,  icon: 'school' },
  { key: 'internship',      group: 'background',  type: 'text',     print: true,  icon: 'school' },
  { key: 'gradYear',        group: 'background',  type: 'year',     print: true,  icon: 'school' },
  { key: 'pastJobs',        group: 'background',  type: 'textarea', print: true,  icon: 'school' },
  { key: 'whyPsych',        group: 'background',  type: 'textarea', print: true,  icon: 'spark' },
  { key: 'interests',       group: 'background',  type: 'textarea', print: true,  icon: 'spark' },
  { key: 'shows',           group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'tv' },
  { key: 'kdrama',          group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'tv' },
  { key: 'movies',          group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'film' },
  { key: 'cartoons',        group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'tv' },
  { key: 'anime',           group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'spark' },
  { key: 'youtubers',       group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'tv' },
  { key: 'disney',          group: 'favourites',  type: 'textarea', sub: 'screen',     print: true,  icon: 'film' },
  { key: 'games',           group: 'favourites',  type: 'textarea', sub: 'play',       print: true,  icon: 'game' },
  { key: 'sports',          group: 'favourites',  type: 'textarea', sub: 'play',       print: true,  icon: 'heart' },
  { key: 'pokemon',         group: 'favourites',  type: 'text',     sub: 'play',       print: true,  icon: 'game' },
  { key: 'boardGames',      group: 'favourites',  type: 'textarea', sub: 'play',       print: true,  icon: 'game' },
  { key: 'superhero',       group: 'favourites',  type: 'text',     sub: 'play',       print: true,  icon: 'spark' },
  { key: 'fandom',          group: 'favourites',  type: 'text',     sub: 'play',       print: true,  icon: 'spark' },
  { key: 'music',           group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'music' },
  { key: 'books',           group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'book' },
  { key: 'authors',         group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'book' },
  { key: 'podcasts',        group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'music' },
  { key: 'quote',           group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'book' },
  { key: 'bibleVerse',      group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'book' },
  { key: 'prayer',          group: 'favourites',  type: 'textarea', sub: 'words',      print: true,  icon: 'book' },
  { key: 'studyMusic',      group: 'favourites',  type: 'text',     sub: 'words',      print: true,  icon: 'music' },
  { key: 'karaoke',         group: 'favourites',  type: 'text',     sub: 'words',      print: true,  icon: 'music' },
  { key: 'food',            group: 'favourites',  type: 'textarea', sub: 'food',       print: true,  icon: 'food' },
  { key: 'snack',           group: 'favourites',  type: 'textarea', sub: 'food',       print: true,  icon: 'food' },
  { key: 'comfortFood',     group: 'favourites',  type: 'textarea', sub: 'food',       print: true,  icon: 'food' },
  { key: 'localEats',       group: 'favourites',  type: 'textarea', sub: 'food',       print: true,  icon: 'food' },
  { key: 'dessert',         group: 'favourites',  type: 'textarea', sub: 'food',       print: true,  icon: 'food' },
  { key: 'coffeeTea',       group: 'favourites',  type: 'text',     sub: 'food',       print: true,  icon: 'food' },
  { key: 'canCook',         group: 'favourites',  type: 'textarea', sub: 'food',       print: true,  icon: 'food' },
  { key: 'milkTea',         group: 'favourites',  type: 'text',     sub: 'food',       print: true,  icon: 'food' },
  { key: 'fastFood',        group: 'favourites',  type: 'text',     sub: 'food',       print: true,  icon: 'food' },
  { key: 'fruit',           group: 'favourites',  type: 'text',     sub: 'food',       print: true,  icon: 'food' },
  { key: 'colour',          group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'spark' },
  { key: 'season',          group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'spark' },
  { key: 'flower',          group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'spark' },
  { key: 'animal',          group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'heart' },
  { key: 'app',             group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'phone' },
  { key: 'holiday',         group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'cake' },
  { key: 'emoji',           group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'spark' },
  { key: 'cantLiveWithout', group: 'favourites',  type: 'text',     sub: 'little',     print: true,  icon: 'heart' },
  { key: 'subject',         group: 'favourites',  type: 'text',     sub: 'medschool',  print: true,  icon: 'school' },
  { key: 'rotation',        group: 'favourites',  type: 'text',     sub: 'medschool',  print: true,  icon: 'school' },
  { key: 'hobbies',         group: 'life',        type: 'textarea', sub: 'everyday',   print: true,  icon: 'heart' },
  { key: 'studyStyle',      group: 'life',        type: 'text',     sub: 'everyday',   print: true,  icon: 'book' },
  { key: 'pets',            group: 'life',        type: 'text',     sub: 'everyday',   print: true,  icon: 'heart', hint: true },
  { key: 'destress',        group: 'life',        type: 'text',     sub: 'everyday',   print: true,  icon: 'heart' },
  { key: 'morningEssential',group: 'life',        type: 'text',     sub: 'everyday',   print: true,  icon: 'food' },
  { key: 'weekend',          group: 'life',        type: 'textarea',  sub: 'everyday',   print: true,  icon: 'spark' },
  { key: 'guiltyPleasure',   group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'heart' },
  { key: 'petPeeve',         group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'spark' },
  { key: 'comfortShow',      group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'tv' },
  { key: 'lastBinge',        group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'tv' },
  { key: 'currentlyReading',  group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'book' },
  { key: 'nonNegotiable',    group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'heart' },
  { key: 'alwaysInBag',      group: 'life',        type: 'text',      sub: 'everyday',   print: true,  icon: 'tag' },
  { key: 'childhoodDream',   group: 'life',        type: 'text',      sub: 'growingup',  print: true,  icon: 'spark' },
  { key: 'childhoodNickname',  group: 'life',        type: 'text',      sub: 'growingup',  print: true,  icon: 'tag' },
  { key: 'firstConcert',     group: 'life',        type: 'text',      sub: 'growingup',  print: true,  icon: 'music' },
  { key: 'childhoodGame',    group: 'life',        type: 'text',      sub: 'growingup',  print: true,  icon: 'game' },
  { key: 'undergrad',        group: 'life',        type: 'text',      sub: 'growingup',  print: true,  icon: 'school' },
  { key: 'siblings',         group: 'life',        type: 'text',      sub: 'growingup',  print: true,  icon: 'users' },
  { key: 'hometownTradition',  group: 'life',        type: 'textarea',  sub: 'growingup',  print: true,  icon: 'cake' },
  { key: 'hiddenTalent',    group: 'life',        type: 'text',     sub: 'you',        print: true,  icon: 'spark' },
  { key: 'introExtro',      group: 'life',        type: 'text',     sub: 'you',        print: true,  icon: 'users' },
  { key: 'mbti',            group: 'life',        type: 'text',     sub: 'you',        print: true,  icon: 'spark' },
  { key: 'teachWords',      group: 'life',        type: 'textarea', sub: 'you',        print: true,  icon: 'chat', hint: true },
  { key: 'loveLanguage',    group: 'life',        type: 'text',     sub: 'you',        print: true,  icon: 'heart' },
  { key: 'superpower',      group: 'life',        type: 'text',     sub: 'you',        print: true,  icon: 'spark' },
  { key: 'threeWords',      group: 'life',        type: 'text',     sub: 'you',        print: true,  icon: 'chat' },
  { key: 'funFact',         group: 'life',        type: 'textarea', sub: 'you',        print: true,  icon: 'spark' },
  { key: 'roleModel',        group: 'life',        type: 'text',      sub: 'you',        print: true,  icon: 'users' },
  { key: 'motto',            group: 'life',        type: 'text',      sub: 'you',        print: true,  icon: 'book' },
  { key: 'advocacy',         group: 'life',        type: 'text',      sub: 'you',        print: true,  icon: 'heart' },
  { key: 'recharge',         group: 'life',        type: 'text',      sub: 'you',        print: true,  icon: 'heart' },
  { key: 'proudest',         group: 'life',        type: 'textarea',  sub: 'you',        print: true,  icon: 'spark' },
  { key: 'grateful',         group: 'life',        type: 'textarea',  sub: 'you',        print: true,  icon: 'heart' },
  { key: 'dreamTrip',       group: 'life',        type: 'text',     sub: 'horizons',   print: true,  icon: 'pin' },
  { key: 'travelled',       group: 'life',        type: 'textarea', sub: 'horizons',   print: true,  icon: 'pin' },
  { key: 'bucketList',      group: 'life',        type: 'textarea', sub: 'horizons',   print: true,  icon: 'spark' },
  { key: 'learningNow',     group: 'life',        type: 'text',     sub: 'horizons',   print: true,  icon: 'book' },
  { key: 'giftHints',       group: 'life',        type: 'textarea', sub: 'horizons',   print: true,  icon: 'cake' },
  { key: 'whyProgram',       group: 'life',        type: 'textarea',  sub: 'residency',  print: true,  icon: 'school' },
  { key: 'tenYears',         group: 'life',        type: 'textarea',  sub: 'residency',  print: true,  icon: 'spark' },
  { key: 'subspecialty',     group: 'life',        type: 'text',      sub: 'residency',  print: true,  icon: 'school' },
  { key: 'advice',          group: 'life',        type: 'textarea', sub: 'residency',  print: true,  icon: 'chat' },
  { key: 'studyTip',         group: 'life',        type: 'textarea',  sub: 'residency',  print: true,  icon: 'book' },
  { key: 'skillToLearn',     group: 'life',        type: 'text',      sub: 'residency',  print: true,  icon: 'spark' },
  { key: 'askMeFor',         group: 'life',        type: 'textarea',  sub: 'residency',  print: true,  icon: 'chat' },
  { key: 'hotTake',          group: 'life',        type: 'textarea',  sub: 'fun',        print: true,  icon: 'spark' },
  { key: 'ifNotDoctor',      group: 'life',        type: 'text',      sub: 'fun',        print: true,  icon: 'spark' },
  { key: 'lastPhoto',        group: 'life',        type: 'text',      sub: 'fun',        print: true,  icon: 'camera' },
  { key: 'lookalike',        group: 'life',        type: 'text',      sub: 'fun',        print: true,  icon: 'users' },
  { key: 'duetSong',         group: 'life',        type: 'text',      sub: 'fun',        print: true,  icon: 'music' },
  { key: 'phone',           group: 'contact',     type: 'tel',      print: false, icon: 'phone' },
  { key: 'viber',           group: 'contact',     type: 'tel',      print: false, icon: 'phone' },
  { key: 'telegram',        group: 'contact',     type: 'text',     print: false, icon: 'chat' },
  { key: 'email',           group: 'contact',     type: 'email',    print: false, icon: 'mail' },
  { key: 'email2',          group: 'contact',     type: 'email',    print: false, icon: 'mail' },
  { key: 'facebook',        group: 'contact',     type: 'url',      print: false, icon: 'chat',  base: 'https://www.facebook.com/' },
  { key: 'instagram',       group: 'contact',     type: 'url',      print: false, icon: 'camera', base: 'https://www.instagram.com/' },
  { key: 'spotify',         group: 'contact',     type: 'url',      print: false, icon: 'music', base: 'https://open.spotify.com/user/' },
  { key: 'steam',           group: 'contact',     type: 'url',      print: false, icon: 'game',  base: 'https://steamcommunity.com/id/' },
  { key: 'youtube',         group: 'contact',     type: 'url',      print: false, icon: 'tv',    base: 'https://www.youtube.com/@' },
  { key: 'discord',         group: 'contact',     type: 'text',     print: false, icon: 'game' },
  { key: 'social',          group: 'contact',     type: 'text',     print: false, icon: 'chat' },
  { key: 'gcash',           group: 'contact',     type: 'tel',      print: false, icon: 'phone', qr: false },
  { key: 'staying',         group: 'contact',     type: 'text',     print: false, icon: 'pin' },
  { key: 'landmark',        group: 'contact',     type: 'text',     print: false, icon: 'pin' },
  { key: 'birthdayPref',    group: 'contact',     type: 'text',     print: false, icon: 'cake' },
  { key: 'shirtSize',       group: 'contact',     type: 'text',     print: false, icon: 'tag' },
  { key: 'scrubSize',       group: 'contact',     type: 'text',     print: false, icon: 'tag' },
  { key: 'shoeSize',        group: 'contact',     type: 'text',     print: false, icon: 'tag' },
  { key: 'prcExpiry',       group: 'contact',     type: 'month',    print: false, icon: 'calendar', hint: true },
  { key: 'licenceExpiry',   group: 'contact',     type: 'month',    print: false, icon: 'calendar', hint: true },
  { key: 'passportExpiry',  group: 'contact',     type: 'month',    print: false, icon: 'calendar', hint: true }
];

/* Fields the "Guess who" clue game can ask about (needs at least 4 cards with that field filled in). */
window.GUESS_FIELDS = ['hometown', 'medSchool', 'hobbies', 'shows', 'kdrama', 'movies', 'cartoons', 'anime', 'games', 'music', 'books', 'food', 'snack', 'dessert', 'colour', 'pokemon', 'karaoke', 'hiddenTalent', 'funFact', 'pets', 'whyPsych', 'animal', 'superhero', 'quote', 'bibleVerse', 'dreamTrip', 'superpower', 'milkTea', 'emoji', 'guiltyPleasure', 'petPeeve', 'childhoodDream', 'ifNotDoctor', 'hotTake', 'roleModel', 'lookalike'];

/* Fields compared for "Things in common" on a person's page: exact match (whole value) or shared items (comma / newline separated). */
window.COMMON_FIELDS = {
  exact: ['hometown', 'livesNow', 'medSchool', 'internship', 'gradYear', 'coffeeTea', 'studyStyle', 'colour', 'pokemon', 'season', 'animal', 'superhero', 'fandom', 'introExtro', 'mbti', 'loveLanguage', 'milkTea', 'fastFood', 'fruit', 'emoji', 'undergrad', 'subspecialty', 'childhoodGame', 'guiltyPleasure'],
  items: ['languages', 'interests', 'shows', 'kdrama', 'movies', 'cartoons', 'anime', 'games', 'music', 'books', 'authors', 'podcasts', 'sports', 'food', 'snack', 'dessert', 'comfortFood', 'hobbies', 'pets', 'destress', 'boardGames', 'youtubers', 'disney', 'travelled', 'bucketList', 'canCook', 'comfortShow', 'lastBinge', 'currentlyReading', 'advocacy']
};

/* Spotify playlists: a list of up to PLAYLIST_MAX {label, url} links on the card (card.playlists). In-app only. */
window.PLAYLIST_MAX = 10;
/* Link lists (1.12.0 Netflix, 1.13.0 the rest): ranked lists of up to `max` {title, url} on the card. In-app only, not in QR.
   Storage: netflix -> card.netflix (kept from 1.12.0); every other list -> card.lists[key].
   hosts: allowed link hosts ('host' or 'host/path-prefix', subdomains allowed; '*' = any https link). url is optional;
   without one the title links to `search` ({q} = title) or, with no search, shows as plain text.
   common: counts in Things in common / twins. map: titles are plotted on the Hometown map's Bucket list layer. */
(function () {
  var MAPS = ['maps.app.goo.gl', 'goo.gl/maps', 'google.com/maps', 'google.com.ph/maps', 'maps.google.com'];
  var MAPSEARCH = 'https://www.google.com/maps/search/?api=1&query={q}';
  window.LINK_LISTS = [
    { key: 'netflix', icon: 'tv', max: 10, common: true, hosts: ['netflix.com', 'disneyplus.com', 'primevideo.com', 'amazon.com/gp/video', 'hbomax.com', 'max.com', 'viu.com', 'tv.apple.com', 'iwant.ph', 'iwanttfc.com'], search: 'https://www.netflix.com/search?q={q}', ph: 'https://www.netflix.com/title/…' },
    { key: 'wishlist', icon: 'gift', max: 10, hosts: ['shopee.ph', 'shope.ee', 'shp.ee', 'lazada.com.ph', 'lzd.co'], search: 'https://shopee.ph/search?keyword={q}', ph: 'https://shopee.ph/…' },
    { key: 'films', icon: 'film', max: 10, common: true, hosts: ['letterboxd.com', 'boxd.it'], search: 'https://letterboxd.com/search/{q}/', ph: 'https://letterboxd.com/film/…' },
    { key: 'youtube', icon: 'play', max: 10, common: true, hosts: ['youtube.com', 'youtu.be'], search: 'https://www.youtube.com/results?search_query={q}', ph: 'https://youtube.com/@…' },
    { key: 'podcasts', icon: 'mic', max: 10, common: true, hosts: ['open.spotify.com', 'spotify.link', 'podcasts.apple.com'], search: 'https://open.spotify.com/search/{q}', ph: 'https://open.spotify.com/show/…' },
    { key: 'books', icon: 'book', max: 10, common: true, hosts: ['goodreads.com'], search: 'https://www.goodreads.com/search?q={q}', ph: 'https://www.goodreads.com/book/show/…' },
    { key: 'foodSpots', icon: 'food', max: 10, common: true, hosts: MAPS, search: MAPSEARCH, ph: 'https://maps.app.goo.gl/…' },
    { key: 'travel', icon: 'plane', max: 10, common: true, map: true, hosts: MAPS, search: MAPSEARCH, ph: 'https://maps.app.goo.gl/…' },
    { key: 'study', icon: 'school', max: 10, hosts: ['*'], search: '', ph: 'https://…' }
  ];
})();
window.NETFLIX_MAX = 10;
