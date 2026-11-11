/* UI strings for the app shell only (menu, search, theme, text size, What's new, About, backup, Explore).
   Screen content stays in the screens' own data. t(key) looks up STRINGS[lang][key], then STRINGS.en[key], then the key.
   Placeholders like {name} are filled in by the code. In text, **bold** and [[key]] give bold and a keyboard key. */
window.STRINGS = {
  en: {
    /* ---- Psych Tickler screens ---- */
    'nav.batch': 'The department',
    'nav.me': 'My card',
    'nav.birthdays': 'Birthdays',
    'nav.print': 'Print & PDF',
    'nav.guess': 'Guess who',
    'bt.hero.cta': 'Fill in my card',
    'bt.hero.ctaDone': 'See the department',
    'nav.play': 'Play',
    'nav.map': 'Hometown map',
    'nav.whosaid': 'Who said it?',
    'nav.bingo': 'Department Bingo',
    'nav.icebreakers': 'Icebreakers',
    'nav.wrapped': 'Department Wrapped',
    'bt.day.title': 'Residency',
    'bt.day.set': 'Set your start date in About to count the days.',
    'bt.day.tomorrow': 'Starts tomorrow!',
    'bt.day.inN': 'Starts in {n} days',
    'bt.day.dayN': 'Day {n}',
    'bt.day.year': 'Year {n} of residency',
    'bt.day.m1': 'Day one. Welcome to residency!',
    'bt.day.mN': 'Day {n}: a milestone!',
    'bt.day.mYear': '{n} year(s) of residency today!',
    'bt.day.setting': 'Residency start date',
    'bt.day.hint': 'Residency for the incoming first years starts on 1 January 2027. Change this to your own start date; clear it to go back to 1 January 2027.',
    'bt.bdt.kicker': 'Birthday today',
    'bt.bdt.title': 'Happy birthday, {names}!',
    'bt.bdt.you': 'Happy birthday to you!',
    'bt.bdt.youToo': 'And happy birthday to you too!',
    'bt.bdt.greet': 'Greet them',
    'bt.bdt.copied': 'Greeting copied. Paste it in your chat.',
    'bt.bdt.msg': 'Happy birthday, {name}! 🎂 Wishing you a great year ahead. From your colleagues.',
    'bt.bdt.msgBatch': 'Happy birthday, {name}! 🎂 Wishing you a great year ahead. From your {batch} colleagues.',
    'bt.spot.h': 'Spotlight of the week',
    'bt.spot.open': 'Read their card',
    'bt.ws.intro': 'One question, everyone’s answers: read an answer and guess who gave it.',
    'bt.ws.notEnough': 'Needs at least two cards that answer the same question.',
    'bt.ws.topic': 'Question',
    'bt.ws.other': 'Another question',
    'bt.ws.ask': 'Who gave this as their {field}?',
    'bt.bingo.intro': 'Find colleagues who match each square. Tap a square when you find someone. Five in a row (or column, or diagonal) wins.',
    'bt.bingo.notEnough': 'Not enough details on the cards yet. Wait for more cards to sync.',
    'bt.bingo.win': 'BINGO! 🎉',
    'bt.bingo.winN': 'BINGO × {n}! 🎉',
    'bt.bingo.free': 'Free',
    'bt.bingo.new': 'New card',
    'bt.bingo.newConfirm': 'Start a new bingo card? Your marks on this one will be cleared.',
    'bt.bingo.how': 'Squares come from the department’s cards. Ask around instead of peeking; Show who matches is for checking.',
    'bt.bingo.reveal': 'Show who matches',
    'bt.bingo.hide': 'Hide names',
    'bt.twins.h': 'Department twins',
    'bt.twins.intro': 'The pairs with the most things in common.',
    'bt.twins.n1': '1 thing in common',
    'bt.twins.nN': '{n} things in common',
    'bt.twins.top': 'closest match',
    'bt.twins.more': 'and {n} more',
    'bt.twins.none': 'No two cards share anything yet.',
    'bt.ice.intro': 'Conversation starters for duty breaks, lunch and department nights.',
    'bt.ice.modeQ': 'Questions',
    'bt.ice.modeCard': 'From the cards',
    'bt.ice.ask': 'Ask this',
    'bt.ice.askWho': 'Try asking {name}.',
    'bt.ice.next': 'Next',
    'bt.ice.otherWho': 'Someone else',
    'bt.ice.noCards': 'No colleagues’ cards yet. Check Cloud sync.',
    'bt.ice.cardQ': 'Ask {name} about their {field}.',
    'bt.ice.theirCard': 'Their card says',
    'bt.ice.reveal': 'Peek at their card',
    'bt.map.intro': 'Where everyone is from, based on the Hometown on each card.',
    'bt.map.noData': 'The map data did not load.',
    'bt.map.aria': 'Map of the Philippines with the department’s hometowns',
    'bt.map.hosp': 'the hospital',
    'bt.map.tap': 'Tap a dot to see who is from there.',
    'bt.map.places': '{n} places',
    'bt.map.empty': 'No hometowns found on the map yet.',
    'bt.map.off': 'Not on the map',
    'bt.map.offHint': 'Hometowns the map did not recognise (abroad, or spelled differently). Writing “city, province” helps.',
    'bt.map.none': '{n} without a hometown on their card.',
    'bt.map.src': 'Map outline: Natural Earth (public domain). Dots are approximate.',
    'bt.wrap.intro': 'The department in a few slides. Tap Next or swipe.',
    'bt.wrap.notEnough': 'Needs at least two cards.',
    'bt.wrap.prev': 'Back',
    'bt.wrap.next': 'Next',
    'bt.wrap.again': 'Start over',
    'bt.wrap.note': 'Made from the cards on this device.',
    'bt.wrap.theBatch': 'The department',
    'bt.wrap.k0': 'Department Wrapped {year}',
    'bt.wrap.s0': 'Let’s look back at who we are.',
    'bt.wrap.k1': 'In numbers',
    'bt.wrap.s1': 'residents on this device',
    'bt.wrap.towns': 'hometowns',
    'bt.wrap.schools': 'medical schools',
    'bt.wrap.langs': 'languages',
    'bt.wrap.k2': 'Birthday season',
    'bt.wrap.s2': '{n} birthdays that month',
    'bt.wrap.s2one': 'the first birthday on the list',
    'bt.wrap.zodiac': 'Most common sign: {sign} ({n})',
    'bt.wrap.k3': 'Born between',
    'bt.wrap.s3': '{n} birth years in one department',
    'bt.wrap.k4': 'Department favourites',
    'bt.wrap.b4': 'What we love',
    'bt.wrap.food': 'Food: {v} ({n})',
    'bt.wrap.shows': 'Show: {v} ({n})',
    'bt.wrap.music': 'Music: {v} ({n})',
    'bt.wrap.movies': 'Movie: {v} ({n})',
    'bt.wrap.games': 'Game: {v} ({n})',
    'bt.wrap.hobbies': 'Hobby: {v} ({n})',
    'bt.wrap.k5': 'Most common hometown',
    'bt.wrap.s5': 'home to {n} of us',
    'bt.wrap.k6': 'Playlists shared',
    'bt.wrap.s6': 'Spotify playlists on the department’s cards',
    'bt.wrap.s6one': 'Spotify playlist on the department’s cards',
    'bt.wrap.k7': 'Here’s to residency',
    'bt.wrap.s7': 'Glad you’re in this department.',
    'bt.today.h': 'Today in the department',
    'bt.today.pl': 'Featured Spotify playlist today',
    'bt.today.fact': 'Featured fact of the day',
    'bt.today.by': 'Shared by {name}',
    'bt.today.another': 'Show another',
    'bt.home.count1': '{n} colleague in your department so far.',
    'bt.home.countN': '{n} colleagues in your department so far.',
    'bt.home.nextBirthday': 'Next birthday',
    'bt.home.today': 'Today!',
    'bt.home.inDays1': 'tomorrow',
    'bt.home.inDaysN': 'in {n} days',
    'bt.home.noMe': 'Start with your own card; it reaches the department after you save it.',
    'bt.batch.intro': 'Everyone whose card is on this device. Tap a card to read more.',
    'bt.batch.filter': 'Filter by name, hometown, school…',
    'bt.batch.sortName': 'By name',
    'bt.batch.sortBirthday': 'By birthday',
    'bt.batch.sortHometown': 'By hometown',
    'bt.batch.emptyTitle': 'No cards yet',
    'bt.batch.emptyText': 'Fill in your own card first, then your colleagues’ cards arrive through Cloud sync.',
    'bt.batch.noMatch': 'Nobody matches that.',
    'bt.batch.you': 'You',
    'bt.person.notFound': 'That card is not on this device.',
    'bt.person.edit': 'Edit my card',
    'bt.nv.homeH': 'Your card',
    'bt.nv.homeNone': 'You don’t have a card yet',
    'bt.nv.homeNoneT': 'Make your card so the department can get to know you. It takes a minute to start.',
    'bt.nv.make': 'Make my card',
    'bt.nv.secEdit': 'Edit',
    'bt.nv.secEditA': 'Edit {section}',
    'bt.nv.emptyH': 'Not filled in yet',
    'bt.nv.emptyT': 'Tap a section to add it to your card.',
    'bt.nv.jump': 'Jump to a section',
    'bt.nv.nextEmpty': 'Next empty question',
    'bt.nv.allDone': 'Every question has an answer.',
    'bt.person.remove': 'Remove this card',
    'bt.person.confirmRemove': 'Remove {name} from this device? Their card comes back at the next sync.',
    'bt.person.updated': 'Card updated {date}',
    'bt.person.birthday': 'Birthday',
    'bt.person.turns': 'turns {n}',
    'bt.person.contact': 'Contact',
    'bt.person.call': 'Call',
    'bt.person.text': 'Message',
    'bt.person.mail': 'Email',
    'bt.me.title': 'My card',
    'bt.me.intro': 'Only you can edit this card. It is saved on this device and reaches the department through Cloud sync.',
    'bt.me.name': 'Full name',
    'bt.me.nameHint': 'As you would like the department to see it.',
    'bt.me.photo': 'Photo',
    'bt.me.photoHint': 'Optional. Square photos look best; it is shrunk to keep the card small.',
    'bt.me.choosePhoto': 'Choose photo',
    'bt.me.removePhoto': 'Remove photo',
    'bt.me.birthday': 'Birthday',
    'bt.me.month': 'Month',
    'bt.me.day': 'Day',
    'bt.me.year': 'Year',
    'bt.me.none': '—',
    'bt.me.save': 'Save my card',
    'bt.me.saved': 'Saved. Your card is up to date on this device.',
    'bt.me.needName': 'Please enter your name first.',
    'bt.me.badBirthday': 'That birthday is not a real date.',
    'bt.me.photoTooBig': 'That photo could not be read. Try a smaller image.',
    'bt.me.clear': 'Clear my card',
    'bt.me.draftH': 'Unsaved changes restored',
    'bt.me.draftText': 'These are the edits you made on {when}. They are kept on this phone but not on your card yet — tap Save to keep them.',
    'bt.me.draftDiscard': 'Discard these changes',
    'bt.me.draftConfirm': 'Discard your unsaved changes and go back to your saved card?',
    'bt.me.draftNote': 'Changes kept on this phone · tap Save',
    'bt.me.confirmClear': 'Clear everything on your card? Your colleagues’ cards stay.',
    'bt.f.nickname': 'Nickname',
    'bt.f.hometown': 'Hometown',
    'bt.f.medSchool': 'Med school',
    'bt.f.hobbies': 'Hobbies',
    'bt.f.shows': 'Favourite TV shows',
    'bt.f.movies': 'Favourite movies',
    'bt.f.cartoons': 'Favourite cartoons',
    'bt.f.anime': 'Favourite anime',
    'bt.f.games': 'Favourite video games',
    'bt.f.music': 'Music & artists',
    'bt.f.food': 'Favourite food',
    'bt.f.funFact': 'Fun fact',
    'bt.f.phone': 'Mobile number',
    'bt.f.email': 'Email',
    'bt.g.basics': 'Basics',
    'bt.g.background': 'Background',
    'bt.g.favourites': 'Favourites',
    'bt.g.life': 'Life',
    'bt.g.contact': 'Contact & practical',
    'bt.g.custom': 'More about me',
    'bt.f.preferredName': 'How to address you',
    'bt.f.pronouns': 'Pronouns',
    'bt.f.livesNow': 'Where you live now',
    'bt.f.commute': 'How you get to Mariveles',
    'bt.f.languages': 'Languages & dialects',
    'bt.f.internship': 'Internship hospital',
    'bt.f.gradYear': 'Year graduated',
    'bt.f.pastJobs': 'Past jobs / pre-residency life',
    'bt.f.whyPsych': 'Why psychiatry',
    'bt.f.interests': 'Interest areas',
    'bt.f.kdrama': 'Favourite K-dramas',
    'bt.f.books': 'Favourite books',
    'bt.f.authors': 'Favourite authors',
    'bt.f.podcasts': 'Podcasts',
    'bt.f.sports': 'Sports & teams',
    'bt.f.snack': 'Favourite snack',
    'bt.f.comfortFood': 'Comfort food',
    'bt.f.localEats': 'Go-to Mariveles / Balanga eats',
    'bt.f.dessert': 'Favourite dessert',
    'bt.f.coffeeTea': 'Coffee or tea order',
    'bt.f.colour': 'Favourite colour',
    'bt.f.pokemon': 'Favourite Pokémon',
    'bt.f.cantLiveWithout': 'Can’t live without',
    'bt.f.karaoke': 'Karaoke song',
    'bt.f.studyStyle': 'Night owl or early bird',
    'bt.f.pets': 'Pets',
    'bt.f.hiddenTalent': 'Hidden talent',
    'bt.f.destress': 'Go-to de-stress activity',
    'bt.f.giftHints': 'Gift hints / wish list',
    'bt.f.social': 'Social handles',
    'bt.f.allergies': 'Allergies or diet',
    'bt.f.emergencyContact': 'Emergency contact name',
    'bt.f.inAppOnly': 'in-app only',
    'bt.custom.title': 'Your own fields',
    'bt.custom.hint': 'Anything the list missed — give it a label and an answer.',
    'bt.custom.label': 'Label',
    'bt.custom.value': 'Answer',
    'bt.custom.add': 'Add a field',
    'bt.custom.remove': 'Remove',
    'bt.me.complete': '{n} of {total} filled in',
    'bt.me.completeHint': 'The more you fill in, the better the department gets to know you.',
    'bt.me.expandAll': 'Open all sections',
    'bt.me.collapseAll': 'Close all sections',
    'bt.common.title': 'Things in common',
    'bt.common.none': 'Nothing in common yet — fill in more of your card and theirs.',
    'bt.common.same': 'Same {field}: {value}',
    'bt.common.shared': 'You both like: {value} ({field})',
    'bt.batchName': 'Department name',
    'bt.batchNameHint': 'Shown on the home screen and the printed sheet, e.g. “MMWGH Psychiatry”.',
    'nav.stats': 'Department stats',
    'bt.cal.one': 'Add to calendar',
    'bt.cal.all': 'Department birthday calendar',
    'bt.cal.allText': 'One calendar file with every birthday, repeating yearly. Open it on your phone and it offers to add the events.',
    'bt.cal.summary': '{name}’s birthday',
    'bt.cal.saved': 'Calendar file ready: {name}.',
    'bt.stats.intro': 'What the department looks like, from the cards on this device.',
    'bt.stats.residents': 'residents',
    'bt.stats.withPhoto': 'with a photo',
    'bt.stats.avgComplete': 'average card filled in',
    'bt.stats.hometowns': 'Hometowns',
    'bt.stats.schools': 'Med schools',
    'bt.stats.languages': 'Languages & dialects',
    'bt.stats.months': 'Birthdays by month',
    'bt.stats.ages': 'Oldest to youngest',
    'bt.stats.thisMonth': 'This month in the department',
    'bt.stats.thisMonthNone': 'No birthdays this month.',
    'bt.stats.shared': 'Most shared favourites',
    'bt.stats.sharedNone': 'No favourite is shared by two or more people yet.',
    'bt.stats.n1': '{n} person',
    'bt.stats.nN': '{n} people',
    'bt.stats.empty': 'Nothing to count yet.',
    'bt.print.modeSheet': 'Department sheet',
    'bt.print.modeTags': 'Name tags',
    'bt.print.tagsHint': 'Eight tags per A4 page. Cut along the borders.',
    'bt.guess.modeClue': 'Clue → name',
    'bt.guess.modePhoto': 'Photo → name',
    'bt.guess.modeMonth': 'Name → birth month',
    'bt.guess.whosePhoto': 'Who is this?',
    'bt.guess.whichMonth': 'Which month is {name}’s birthday?',
    'bt.guess.roundOf': 'Question {i} of {n}',
    'bt.guess.roundDone': 'Round over: {right} of {n}.',
    'bt.guess.playAgain': 'Play again',
    'bt.guess.board': 'Leaderboard (this phone)',
    'bt.guess.boardEmpty': 'No rounds finished yet.',
    'bt.guess.boardRow': '{right}/{n} · {mode} · {date}',
    'bt.guess.needPhotos': 'Needs four cards with photos.',
    'bt.guess.needDates': 'Needs four cards with birthdays.',
    'bt.guess.player': 'Player',
    'bt.banner.title': 'Department photo',
    'bt.banner.hint': 'Optional. Replaces the home-screen picture on this device — a wide group photo works best. It is included in backups; it is not synced to the cloud.',
    'bt.banner.choose': 'Choose photo',
    'bt.banner.remove': 'Use the default picture',
    'bt.banner.saved': 'Department photo saved.',
    'bt.f.season': 'Favourite season or weather',
    'bt.f.flower': 'Favourite flower or plant',
    'bt.f.animal': 'Favourite animal',
    'bt.f.boardGames': 'Favourite board or card games',
    'bt.f.youtubers': 'Favourite YouTubers / streamers',
    'bt.f.canCook': 'Filipino dish you can cook',
    'bt.f.milkTea': 'Milk tea order',
    'bt.f.fastFood': 'Favourite fast food',
    'bt.f.fruit': 'Favourite fruit',
    'bt.f.app': 'Favourite app',
    'bt.f.holiday': 'Favourite holiday or fiesta',
    'bt.f.disney': 'Favourite Disney / Pixar films',
    'bt.f.superhero': 'Favourite superhero',
    'bt.f.fandom': 'Fandom / house (Hogwarts house, etc.)',
    'bt.f.emoji': 'Favourite emoji',
    'bt.f.quote': 'Favourite quote or motto',
    'bt.f.bibleVerse': 'Favourite Bible verse',
    'bt.f.prayer': 'Favourite prayer',
    'bt.f.subject': 'Favourite (and least favourite) med school subject',
    'bt.f.rotation': 'Favourite rotation so far',
    'bt.f.studyMusic': 'Go-to study music',
    'bt.f.introExtro': 'Introvert, extrovert or ambivert',
    'bt.f.mbti': 'MBTI or Enneagram',
    'bt.f.loveLanguage': 'Love language',
    'bt.f.morningEssential': 'Morning routine essential',
    'bt.f.dreamTrip': 'Dream travel destination',
    'bt.f.travelled': 'Places travelled',
    'bt.f.bucketList': 'Bucket-list item',
    'bt.f.superpower': 'Superpower you’d pick',
    'bt.f.threeWords': 'Three words friends use for you',
    'bt.f.learningNow': 'Something you’re learning right now',
    'bt.f.facebook': 'Facebook',
    'bt.f.instagram': 'Instagram',
    'bt.f.spotify': 'Spotify profile',
    'bt.f.steam': 'Steam',
    'bt.f.shirtSize': 'Shirt size (department shirts)',
    'bt.f.bloodType': 'Blood type',
    'bt.f.urlHint': 'Paste the link, or just the username.',
    'bt.f.playlists': 'Spotify playlists',
    'bt.nf.find': 'Find on Netflix',
    'bt.today.nfBy': '#{n} on {name}’s top 10',
    'bt.today.nfAlso': 'Also on the top 10 of {names}',
    'bt.wrap.k8': 'Most-loved Netflix show',
    'bt.wrap.s8': 'on {n} top-10 lists',
    'bt.l.intro': 'Link lists — ranked, best first. Use Move up to reorder.',
    'bt.l.up': 'Move up',
    'bt.l.search': '(opens a search)',
    'bt.l.seeAll': 'See all {n}',
    'bt.l.needTitle': '{list}: add a title next to each link.',
    'bt.l.badUrl': '{list}: links must be from {hosts}.',
    'nav.picks': 'Department picks',
    'bt.picks.intro': 'Everyone’s lists in one place — shows, films, food spots, wishlists and more. Most-listed first.',
    'bt.picks.none': 'No lists yet. Add some to your card and save it.',
    'bt.picks.wishIntro': 'Sorted by whose birthday is next.',
    'bt.picks.onMap': 'See the bucket list on the map',
    'bt.map.offHintTravel': 'Places outside the Philippines, or names the map did not recognise.',
    'bt.map.tapTravel': 'Tap a dot to see who wants to go there.',
    'bt.map.introTravel': 'Where the department wants to go, from everyone’s travel bucket lists.',
    'bt.map.modeHome': 'Hometowns',
    'bt.nf.watchOn': 'Watch on {s}',
    'bt.today.nf': 'Show recommendation of the day',
    'bt.l.netflix': 'Top 10 shows (Netflix & streaming)',
    'bt.l.netflix.short': 'Shows',
    'bt.l.netflix.hint': 'Your top {n} series, best first. Type the title; the link is optional (Netflix, Disney+, Prime Video, Max, Viu, Apple TV or iWant — Share › Copy link). Without a link the title opens a Netflix search.',
    'bt.l.netflix.item': 'Show title',
    'bt.l.netflix.url': 'Streaming link (optional)',
    'bt.l.netflix.add': 'Add a show',
    'bt.l.netflix.hosts': 'Netflix, Disney+, Prime Video, Max, Viu, Apple TV or iWant',
    'bt.l.wishlist': 'Birthday wishlist',
    'bt.l.wishlist.short': 'Wishlists',
    'bt.l.wishlist.hint': 'Up to {n} things you’d love to get, top wish first. Paste a Shopee or Lazada link (Share › Copy link). It shows on your birthday banner so colleagues know what to give.',
    'bt.l.wishlist.item': 'Item',
    'bt.l.wishlist.url': 'Shopee or Lazada link (optional)',
    'bt.l.wishlist.add': 'Add a wish',
    'bt.l.wishlist.hosts': 'Shopee or Lazada',
    'bt.l.films': 'Top films',
    'bt.l.films.short': 'Films',
    'bt.l.films.hint': 'Your top {n} films. Add a Letterboxd link if you use it; without one the title opens a Letterboxd search.',
    'bt.l.films.item': 'Film title',
    'bt.l.films.url': 'Letterboxd link (optional)',
    'bt.l.films.add': 'Add a film',
    'bt.l.films.hosts': 'Letterboxd',
    'bt.l.youtube': 'YouTube favourites',
    'bt.l.youtube.short': 'YouTube',
    'bt.l.youtube.hint': 'Up to {n} channels or videos you love. Paste the YouTube link (Share › Copy link).',
    'bt.l.youtube.item': 'Channel or video',
    'bt.l.youtube.url': 'YouTube link (optional)',
    'bt.l.youtube.add': 'Add a YouTube favourite',
    'bt.l.youtube.hosts': 'YouTube',
    'bt.l.podcasts': 'Podcasts',
    'bt.l.podcasts.short': 'Podcasts',
    'bt.l.podcasts.hint': 'Up to {n} podcasts you listen to. Paste a Spotify or Apple Podcasts link.',
    'bt.l.podcasts.item': 'Podcast name',
    'bt.l.podcasts.url': 'Spotify or Apple Podcasts link (optional)',
    'bt.l.podcasts.add': 'Add a podcast',
    'bt.l.podcasts.hosts': 'Spotify or Apple Podcasts',
    'bt.l.books': 'Books',
    'bt.l.books.short': 'Books',
    'bt.l.books.hint': 'Up to {n} books you recommend. Add a Goodreads link if you have one; without one the title opens a Goodreads search.',
    'bt.l.books.item': 'Book title',
    'bt.l.books.url': 'Goodreads link (optional)',
    'bt.l.books.add': 'Add a book',
    'bt.l.books.hosts': 'Goodreads',
    'bt.l.foodSpots': 'Favourite food spots',
    'bt.l.foodSpots.short': 'Food spots',
    'bt.l.foodSpots.hint': 'Up to {n} places to eat — near the hospital, in your hometown, anywhere. Paste the Google Maps link (Share › Copy link).',
    'bt.l.foodSpots.item': 'Place name',
    'bt.l.foodSpots.url': 'Google Maps link (optional)',
    'bt.l.foodSpots.add': 'Add a food spot',
    'bt.l.foodSpots.hosts': 'Google Maps',
    'bt.l.travel': 'Travel bucket list',
    'bt.l.travel.short': 'Bucket list',
    'bt.l.travel.hint': 'Up to {n} places you want to go. Write the place name (e.g. Siargao, Batanes, Kyoto) — Philippine places also show on the Hometown map. Google Maps link optional.',
    'bt.l.travel.item': 'Place',
    'bt.l.travel.url': 'Google Maps link (optional)',
    'bt.l.travel.add': 'Add a place',
    'bt.l.travel.hosts': 'Google Maps',
    'bt.l.study': 'Study stash',
    'bt.l.study.short': 'Study stash',
    'bt.l.study.hint': 'Up to {n} study resources you swear by — a lecture channel, an app, a book, a website.',
    'bt.l.study.item': 'Resource',
    'bt.l.study.url': 'Link (optional)',
    'bt.l.study.add': 'Add a resource',
    'bt.l.study.hosts': 'https links',
    'nav.events': 'Department events',
    'nav.monito': 'Kris Kringle',
    'nav.badges': 'Badges',
    'bt.f.askMe': 'Ask me about',
    'bt.h.askMe': 'Up to 3 topics, separated by commas — e.g. K-dramas, running, cats. They show on your card in the department list.',
    'bt.f.teachWords': 'Words to teach the department',
    'bt.h.teachWords': 'One per line: word or phrase — meaning (language). e.g. Mayap a abak — good morning (Kapampangan). One shows on Home as the Word of the day.',
    'bt.ask.k': 'Ask me about',
    'bt.word.h': 'Word of the day',
    'bt.word.by': 'Taught by {name}',
    'bt.badge.earned': 'Badge earned: {name} 🎉',
    'bt.badge.intro': '{n} of {total} badges earned on this phone.',
    'bt.badge.on': 'Earned {date}',
    'bt.badge.note': 'Badges are earned on this phone and show on your card, which reaches your colleagues after you save it.',
    'bt.shout.h': 'Shoutouts',
    'bt.shout.forYou': 'Shoutouts for you',
    'bt.shout.none': 'No shoutouts yet. Be the first!',
    'bt.shout.noneYou': 'None yet. When colleagues send you a shoutout, it shows here after their card syncs.',
    'bt.shout.you': 'you',
    'bt.shout.label': 'A shoutout for {name}',
    'bt.shout.ph': 'Thanks for covering my rounds! 🙏',
    'bt.shout.hint': 'Up to 280 characters. It travels with your card, so they see it after you save.',
    'bt.shout.send': 'Send shoutout',
    'bt.shout.sent': 'Shoutout added to your card. It reaches them after you save.',
    'bt.shout.needCard': 'Make your card first to send shoutouts',
    'bt.shout.homeH': 'A shoutout for you',
    'bt.shout.all': 'See all {n}',
    'bt.ev.intro': 'Welcome dinners, first days, exams, outings — with a countdown and add-to-calendar.',
    'bt.ev.firstDay': 'First day of residency',
    'bt.ev.tomorrow': 'Tomorrow',
    'bt.ev.yesterday': 'Yesterday',
    'bt.ev.ago': '{n} days ago',
    'bt.ev.next': 'Next event',
    'bt.ev.none': 'No upcoming events yet. Add one below.',
    'bt.ev.allCal': 'Add all upcoming to calendar',
    'bt.ev.past': 'Past events',
    'bt.ev.shareHint': 'Events are shared with the department through Cloud sync.',
    'bt.ev.add': 'Add an event',
    'bt.ev.edit': 'Edit event',
    'bt.ev.title': 'What',
    'bt.ev.titlePh': 'Welcome dinner',
    'bt.ev.date': 'Date',
    'bt.ev.time': 'Time (optional)',
    'bt.ev.place': 'Where (optional)',
    'bt.ev.note': 'Notes (optional)',
    'bt.ev.save': 'Save event',
    'bt.ev.cancel': 'Cancel',
    'bt.ev.editBtn': 'Edit',
    'bt.ev.need': 'Add a title and a date.',
    'bt.ev.saved': 'Event saved.',
    'bt.ev.confirmDel': 'Remove “{title}”?',
    'bt.ev.imported': '{n} event(s) added or updated.',
    'bt.mm.intro': 'Draw names for the gift exchange. Each person gets one colleague to give to — never themselves — and you send each one their match privately.',
    'bt.mm.notEnough': 'Needs at least 3 cards on this phone.',
    'bt.mm.who': 'Who’s joining?',
    'bt.mm.budget': 'Budget (optional)',
    'bt.mm.date': 'Exchange date (optional)',
    'bt.mm.addEvent': 'Add the exchange date to Department events',
    'bt.mm.warn': 'Joining the exchange yourself? Don’t peek — just tap Send for each person. Or let someone who isn’t joining run the draw.',
    'bt.mm.draw': 'Draw names',
    'bt.mm.need3': 'Pick at least 3 people.',
    'bt.mm.drawn': '{n} people drawn on {date}',
    'bt.mm.budgetIs': 'Budget: {budget}',
    'bt.mm.howSend': 'Tap Send to open your share sheet with that person’s match (and their wishlist), then send it to them only.',
    'bt.mm.hidden': 'match hidden',
    'bt.mm.sent': 'sent ✓',
    'bt.mm.send': 'Send',
    'bt.mm.peek': 'Peek',
    'bt.mm.hide': 'Hide',
    'bt.mm.redraw': 'Draw again',
    'bt.mm.clear': 'Clear the draw',
    'bt.mm.redrawConfirm': 'Start over with a new draw? The current matches will be lost.',
    'bt.mm.clearConfirm': 'Clear the draw? The matches will be lost.',
    'bt.mm.sentTo': 'Sent to {name}.',
    'bt.mm.copied': 'Copied {name}’s match — paste it in a private chat with them.',
    'bt.mm.evTitle': 'Kris Kringle exchange',
    'bt.mm.msg': 'Hi {giver}! 🎁 Your Kris Kringle for {batch} is {receiver}.',
    'bt.mm.msgBudget': 'Budget: {budget}',
    'bt.mm.msgDate': 'Exchange: {date}',
    'bt.mm.msgWish': 'Their wishlist:',
    'bt.mm.msgSecret': 'Keep it a secret! 🤫',
    'bt.badge.started': 'Getting started',
    'bt.badge.started.how': 'Save your own card.',
    'bt.badge.openbook': 'Open book',
    'bt.badge.openbook.how': 'Fill in half of your card.',
    'bt.badge.wholestory': 'Whole story',
    'bt.badge.wholestory.how': 'Fill in 80% of your card.',
    'bt.badge.curator': 'Curator',
    'bt.badge.curator.how': 'Fill in 3 link lists on your card.',
    'bt.badge.polyglot': 'Polyglot',
    'bt.badge.polyglot.how': 'Add words to teach the department.',
    'bt.badge.collector5': 'Collector',
    'bt.badge.collector5.how': 'Have 5 colleagues’ cards.',
    'bt.badge.collector10': 'Big collector',
    'bt.badge.collector10.how': 'Have 10 colleagues’ cards.',
    'bt.badge.collector20': 'Whole department',
    'bt.badge.collector20.how': 'Have 20 colleagues’ cards.',
    'bt.badge.meteveryone': 'Met everyone',
    'bt.badge.meteveryone.how': 'Open every colleague’s card (at least 5).',
    'bt.badge.perfectguess': 'Perfect round',
    'bt.badge.perfectguess.how': 'Get 10 out of 10 in Guess who.',
    'bt.badge.streak10': 'On a roll',
    'bt.badge.streak10.how': 'Guess 10 right in a row in Guess who.',
    'bt.badge.whosaid': 'Mind reader',
    'bt.badge.whosaid.how': 'Get every answer right in a Who said it? round (4 or more).',
    'bt.badge.bingo': 'Bingo!',
    'bt.badge.bingo.how': 'Get a line in Department Bingo.',
    'bt.badge.wrapped': 'Wrapped up',
    'bt.badge.wrapped.how': 'Watch Department Wrapped to the last slide.',
    'bt.badge.icebreaker': 'Icebreaker',
    'bt.badge.icebreaker.how': 'Go through 10 icebreakers.',
    'bt.badge.greeter': 'Birthday greeter',
    'bt.badge.greeter.how': 'Greet a colleague on their birthday.',
    'bt.badge.shoutout': 'Cheerleader',
    'bt.badge.shoutout.how': 'Send a shoutout.',
    'bt.badge.planner': 'Planner',
    'bt.badge.planner.how': 'Add a department event.',
    'bt.badge.monito': 'Santa’s helper',
    'bt.badge.monito.how': 'Run a Kris Kringle draw.',
    'bt.pl.hint': 'Up to {n} playlists. Paste the Spotify share link and give it a name.',
    'bt.pl.label': 'Playlist name',
    'bt.pl.url': 'Spotify link',
    'bt.pl.add': 'Add a playlist',
    'bt.pl.badUrl': 'A playlist link must start with https://open.spotify.com/ or https://spotify.link/',
    'bt.pl.open': 'Open in Spotify',
    'bt.zodiac': 'Zodiac',
    'bt.zodiac.cn': 'Chinese zodiac',
    'bt.link.open': 'Open',
    'bt.f.weekend': 'Typical weekend',
    'bt.f.guiltyPleasure': 'Guilty pleasure',
    'bt.f.petPeeve': 'Pet peeve',
    'bt.f.comfortShow': 'Comfort show for a bad day',
    'bt.f.lastBinge': 'Last thing you binge-watched',
    'bt.f.currentlyReading': 'Currently reading / listening to',
    'bt.f.nonNegotiable': 'Daily non-negotiable',
    'bt.f.alwaysInBag': 'Always in your bag',
    'bt.f.childhoodDream': 'Childhood dream job',
    'bt.f.childhoodNickname': 'Childhood nickname',
    'bt.f.firstConcert': 'First concert / first fandom',
    'bt.f.childhoodGame': 'Favourite childhood game',
    'bt.f.undergrad': 'Undergrad school and course',
    'bt.f.siblings': 'Siblings (how many, where you fall)',
    'bt.f.hometownTradition': 'Hometown fiesta or tradition you love',
    'bt.f.roleModel': 'Role model / person you look up to',
    'bt.f.motto': 'Life motto in one line',
    'bt.f.advocacy': 'Charity or advocacy you care about',
    'bt.f.recharge': 'What recharges you after a hard duty',
    'bt.f.proudest': 'Proudest moment so far',
    'bt.f.grateful': 'Something you’re grateful for this year',
    'bt.f.whyProgram': 'Why this program / why Mariveles',
    'bt.f.tenYears': 'Where you hope to be in 10 years',
    'bt.f.subspecialty': 'Subspecialty you’re curious about',
    'bt.f.studyTip': 'Best study tip you swear by',
    'bt.f.skillToLearn': 'Skill you want to learn during residency',
    'bt.f.askMeFor': 'Colleagues can always ask you for help with…',
    'bt.f.hotTake': 'Hot take (food or pop culture)',
    'bt.f.ifNotDoctor': 'If you weren’t a doctor, you’d be…',
    'bt.f.lastPhoto': 'Last photo on your camera roll (describe it)',
    'bt.f.lookalike': 'Celebrity lookalike people mention',
    'bt.f.duetSong': 'Karaoke duet partner wanted for…',
    'bt.f.viber': 'Viber number (if different)',
    'bt.f.telegram': 'Telegram / WhatsApp',
    'bt.f.email2': 'Second email (school / personal)',
    'bt.f.youtube': 'YouTube channel',
    'bt.f.discord': 'Discord',
    'bt.f.gcash': 'GCash / Maya number (for splitting department expenses)',
    'bt.f.staying': 'Staying at a boarding house / dorm, or commuting from home',
    'bt.f.landmark': 'Nearest landmark to where you stay (for pick-ups)',
    'bt.f.birthdayPref': 'Birthday celebration preference (surprise OK? cake flavour?)',
    'bt.f.scrubSize': 'Scrub size',
    'bt.f.shoeSize': 'Shoe size',
    'bt.f.dutyConditions': 'Conditions to be aware of on duty (optional)',
    'bt.f.emergencyNumber': 'Emergency contact number',
    'bt.f.emergencyRelation': 'Emergency contact relationship',
    'nav.emergency': "Emergency info",
    'nav.emergencyShort': "Emergency",
    'nav.partners': "Partners",
    'bt.pt.intro': "The jowas and asawas of the department. They have full cards, but stay out of the games, stats and department grid.",
    'bt.pt.how': "How to add a partner",
    'bt.pt.howText': 'Your partner installs Psych Tickler on their own phone and signs in on Cloud sync with the same join code; the admin approves them. Then they fill in My card and choose “I’m a partner” and pick you.',
    'bt.pt.none': "No partner cards yet.",
    'bt.pt.of': "Partner of {name}",
    'bt.pt.ofLead': "Partner of",
    'bt.pt.section': "Jowa / Asawa",
    'bt.pt.role': "Whose card is this?",
    'bt.pt.roleRes': "I’m a resident or consultant in the department",
    'bt.pt.rolePt': "I’m the partner (jowa/asawa) of a resident",
    'bt.pt.pick': "My partner is",
    'bt.pt.pickNone': "— not on this phone yet —",
    'bt.pt.name': "Or type their full name",
    'bt.pt.nameOnly': "Your partner’s full name",
    'bt.pt.hint': "Partner cards show on their resident’s page, in Birthdays and on the Partners screen — not in the games, stats or department grid.",
    'bt.pt.needWho': "Pick your partner, or type their name.",
    'bt.pt.count1': "1 partner card",
    'bt.pt.countN': "{n} partner cards",
    'bt.pt.tag': "Partner",
    'bt.g.emergency': "Emergency & medical",
    'bt.f.emergencyRelation2': "Second emergency contact relationship",
    'bt.f.emergencyNote': 'Shown on the Emergency info screen of your department members only if you tick Emergency & medical on Cloud sync. Never on the printed sheet or name tags.',
    'bt.em.intro': "Blood types, allergies, conditions and emergency contacts for the whole department in one place. Works offline.",
    'bt.em.note': 'From the cards colleagues chose to share through Cloud sync. In a real emergency, call for help first.',
    'bt.em.call911': "Call 911",
    'bt.em.filter': "Find a colleague",
    'bt.em.yours': "You",
    'bt.em.add': "Add your emergency info",
    'bt.em.addText': "Your card has no blood type, allergies or emergency contact yet. It takes a minute, and it helps the department help you.",
    'bt.em.edit': "Edit my emergency info",
    'bt.em.blood': "Blood type",
    'bt.em.allergies': "Allergies",
    'bt.em.noAllergy': "None listed",
    'bt.em.conditions': "Conditions",
    'bt.em.own': "Own number",
    'bt.em.contact': "Emergency contact",
    'bt.em.missing': "No emergency info yet",
    'bt.em.missingText': 'Ask them to fill in Emergency & medical on their card and tick it on Cloud sync.',
    'bt.em.none': 'No cards yet. Add yours, then check Cloud sync for your colleagues’ cards.',
    'bt.em.noMatch': "No one matches.",
    'bt.em.homeS1': "1 colleague · blood types, allergies, emergency contacts",
    'bt.em.homeSN': "{n} colleagues · blood types, allergies, emergency contacts",
    'bt.em.homeAdd': "Add yours",
    'bt.em.all': "Whole department",
    'bt.f.emergencyContact2': 'Second emergency contact',
    'bt.f.emergencyNumber2': 'Second emergency contact number',
    'bt.f.prcExpiry': 'PRC licence expiry (month)',
    'bt.f.licenceExpiry': 'Driver’s licence expiry (month)',
    'bt.f.passportExpiry': 'Passport valid until (month)',
    'bt.h.prcExpiry': 'Just the month — to remind us when to renew. No numbers, please.',
    'bt.h.licenceExpiry': 'Just the month — to remind us when to renew. No numbers, please.',
    'bt.h.passportExpiry': 'Just the month — to remind us when to renew (and when to plan the department trip). No numbers, please.',
    'bt.h.dutyConditions': 'Only sent to department members if you tick Emergency & medical on Cloud sync; never in prints.',
    'bt.h.gcash': 'Never in prints; sent to department members only if you tick Contact on Cloud sync.',
    'bt.s.screen': 'On screen',
    'bt.s.play': 'Games & fandoms',
    'bt.s.words': 'Music & words',
    'bt.s.food': 'Food & drink',
    'bt.s.little': 'Little things',
    'bt.s.medschool': 'Med school',
    'bt.s.everyday': 'Everyday',
    'bt.s.growingup': 'Growing up',
    'bt.s.you': 'About you',
    'bt.s.horizons': 'Horizons',
    'bt.s.residency': 'Residency',
    'bt.s.fun': 'Just for fun',
    'bt.me.yearRequired': 'Please add your birth year too.',
    'bt.print.modeFull': 'Full directory',
    'bt.print.fullHint': 'Everything on every card, contact and practical details included, over as many pages as needed. Treat the printout as personal.',
    'bt.print.fullTitle': 'Department directory (full)',
    'bt.print.custom': 'More',
    'bt.print.photoNone': 'no photo',
    'bt.f.contactNote': 'Fields marked “in-app only” (contact, allergies, emergency contact, socials) never appear on the printed sheet or name tags.',
    'bt.bd.intro': 'Birthdays by month, starting from today, with the age each person turns.',
    'bt.bd.today': 'Today',
    'bt.bd.thisMonth': 'This month',
    'bt.bd.upcoming': 'Coming up',
    'bt.bd.none': 'No birthdays entered yet. Each resident adds theirs on My card.',
    'bt.bd.noDate': 'Birthday not given',
    'bt.share.shared': 'Ready to send — pick a chat or save it to Files.',
    'bt.share.cancelled': 'Sharing cancelled.',
    'bt.print.intro': 'Department sheet: a compact “meet the department” page without contact details. Name tags: eight per page. Full directory: everything, over as many pages as needed. Use your browser’s Print (or Share → Print on iPhone) to print or save as PDF.',
    'bt.print.btn': 'Print',
    'bt.print.title': 'Meet the department',
    'bt.print.subtitle': '{program} · {hospital}',
    'bt.print.empty': 'Nothing to print yet.',
    'bt.pdf.btn': 'Make PDF',
    'bt.pdf.intro': 'Make a PDF on this phone, then save it to Files, send it, or print it. Print is there as a backup. Department sheet: a compact “meet the department” page. Name tags: eight per page. Full directory: everything except emergency & medical info. Birthday calendar: one page per month.',
    'bt.pdf.making': 'Making your PDF…',
    'bt.pdf.done': 'PDF ready.',
    'bt.pdf.fail': 'Couldn’t make the PDF. Try Print instead.',
    'bt.pdf.noEm': 'Emergency & medical info is never put in the PDF.',
    'bt.print.modeCal': 'Birthday calendar',
    'bt.print.calTitle': 'Birthday calendar',
    'bt.print.calHint': 'One page per month for the next 12 months, partners included.',
    'bt.print.facts': 'What’s on each card',
    'bt.print.factsHint': 'Pick up to 8 facts for the department sheet. The birthday is always shown.',
    'bt.print.factsMax': 'You can pick up to 8.',
    'bt.print.reset': 'Reset to suggested',
    'bt.print.sort': 'Order',
    'bt.print.sortName': 'By name',
    'bt.print.sortBday': 'By birthday',
    'bt.print.page': 'Page {n} of {total}',
    'bt.guess.intro': 'A quick game: read the clue, pick the colleague. Needs at least four cards with that detail filled in.',
    'bt.guess.notEnough': 'Not enough cards yet. Once four colleagues have filled in their hometowns, hobbies or favourites, the game opens.',
    'bt.guess.whose': 'Whose {field} is this?',
    'bt.guess.right': 'Right!',
    'bt.guess.wrong': 'Not quite — it was {name}.',
    'bt.guess.next': 'Next clue',
    'bt.guess.score': 'Score {right} of {total}',
    'bt.guess.open': 'Open their card',
    'skip': 'Skip to content',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    'menu.title': 'Menu',
    'menu.main': 'Main menu',
    'sidebar.hide': 'Hide the sidebar',
    'sidebar.show': 'Show the sidebar',
    'hist.group': 'Page history',
    'hist.back': 'Back',
    'hist.backTitle': 'Back (Alt+Left)',
    'hist.fwd': 'Forward',
    'hist.fwdTitle': 'Forward (Alt+Right)',
    'brand.home': '{name}, home',
    'search.label': 'Search the whole app',
    'search.placeholder': 'Search this app',
    'search.title': 'Search',
    'search.noMatches': 'No matches for “{q}”',
    'search.seeAll1': 'See all {n} result',
    'search.seeAllN': 'See all {n} results',
    'search.count1': '{n} result for “{q}”',
    'search.countN': '{n} results for “{q}”',
    'search.prompt': 'Type in the search box above.',
    'search.filterBy': 'Filter by type',
    'search.all': 'All',
    'search.noneTitle': 'No matches',
    'search.noneText': 'Try a different word, or check the spelling.',
    'search.newsText': 'New features, content and corrections, newest first.',
    'search.aboutText': 'About this app, keyboard shortcuts, language, text size, theme and backup.',
    'textsize.title': 'Text size',
    'textsize.smaller': 'Smaller',
    'textsize.default': 'Default',
    'textsize.larger': 'Larger',
    'textsize.largest': 'Largest',
    'theme.title': 'Theme',
    'theme.label': 'Theme: {name}',
    'theme.auto': 'Match device',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'nav.start': 'Start',
    'nav.screens': 'Screens',
    'nav.app': 'App',
    'nav.otherApps': 'Other apps',
    'nav.newTab': '(opens in a new tab)',
    'nav.home': 'Home',
    'nav.whatsNew': 'What’s new',
    'nav.about': 'About',
    'nav.quick': 'Quick navigation',
    'home.explore': 'Explore',
    'home.emptyTitle': 'Nothing here yet',
    'home.emptyText': 'Nothing to show yet.',
    'home.latest': '{title} · version {version}',
    'news.intro1': 'New features, content and corrections, newest first. Entries marked ',
    'news.new': 'New',
    'news.intro2': ' were added since your last visit.',
    'news.version': 'Version {v}',
    'news.open': 'Open',
    'news.type.feature': 'Feature',
    'news.type.update': 'Update',
    'news.type.correction': 'Correction',
    'news.type.content': 'Content',
    'news.note': 'Suggestions or corrections? Email ',
    'about.title': 'About',
    'about.version': 'version',
    'about.settings': 'Settings',
    'about.language': 'Language',
    'about.langEn': 'English',
    'about.langTl': 'Tagalog',
    'about.tips': 'Tips',
    'about.tip1': 'Press [[/]] to search from anywhere.',
    'about.tip2': 'Back and forward: the arrow buttons in the top bar, or [[Alt]]+[[Left]] and [[Alt]]+[[Right]].',
    'about.tip3': 'Make text smaller or larger with the **Aa** button. The sun/moon button switches between match device, light and dark.',
    'about.tip4': 'Use **Export backup** in the footer to save what this app stores on this device, and **Import backup** to restore it elsewhere.',
    'about.tip5': 'Install it: use **Add to Home Screen** (iPhone Safari) or **Install app** (Android Chrome).',
    'notfound.title': 'Page not found',
    'notfound.text': 'That page does not exist in this app.',
    'notfound.home': 'Go home',
    'backup.title': 'Back up your data',
    'backup.text': 'Anything this app saves lives only in this browser. Export a backup file to keep it safe, then import it on another phone, tablet or computer to pick up where you left off.',
    'backup.export': 'Export backup',
    'backup.import': 'Import backup',
    'backup.undo': 'Undo last import',
    'backup.item1': '{n} saved item',
    'backup.itemN': '{n} saved items',
    'backup.nothing': 'nothing saved yet',
    'backup.onDevice': 'On this device: {summary}.',
    'backup.lastExported': 'Last exported {date}.',
    'backup.notExported': 'Not exported yet.',
    'backup.shareTitle': '{app} backup',
    'backup.shared': 'Backup ready: save it somewhere you can reach from your other device.',
    'backup.exportCancelled': 'Export cancelled.',
    'backup.saved': 'Saved {name}. Move it to your other device and choose Import backup there.',
    'backup.notBackup': 'That is not a {app} backup file.',
    'backup.unreadable': 'That file could not be read.',
    'backup.unknownDate': 'an unknown date',
    'backup.confirmImport': 'Import the backup from {date}?\n\nBackup: {backup}.\nThis device now: {device}.\n\nData on this device will be replaced. You can undo this from the footer.',
    'backup.importCancelled': 'Import cancelled.',
    'backup.importFailed': 'Import failed: this browser would not save the data.',
    'backup.imported': 'Backup imported. Reloading…',
    'backup.confirmUndo': 'Restore the data this device had before the last import ({summary})?',
    'backup.undoFailed': 'Undo failed.',
    'backup.restored': 'Previous data restored. Reloading…',
    // 1.15.0
    'nav.truths': 'Two truths and a lie',
    'nav.quiz': 'How well do you know…?',
    'nav.baby': 'Baby photo guess',
    'nav.tot': 'This or that',
    'nav.sup': 'Department superlatives',
    'nav.qotw': 'Question of the week',
    'nav.capsule': 'Time capsule',
    'nav.eat': 'Where should we eat?',
    'nav.anthem': 'Department anthem',
    'bt.fun.needCard': 'Make your card first so your answers can travel with it.',
    'bt.fun.more': 'More on your card',
    'bt.fun.moreHint': 'These live on their own screens and travel with your card.',
    'bt.common.tot': 'Same This-or-that picks: {value}',
    'bt.res.text': '{game} — {right}/{n} · {batch}',
    'bt.res.bingo': 'Department Bingo! · {batch} · {n} squares',
    'bt.res.share': 'Share result',
    'bt.res.copied': 'Result copied — paste it in the group chat.',
    'bt.tt.intro': 'Everyone writes two true things and one lie. Can you spot the lie?',
    'bt.tt.mine': 'Your two truths and a lie',
    'bt.tt.mineHint': 'Write three short statements about yourself — two true, one false — then mark the lie. They travel with your card.',
    'bt.tt.stmt': 'Statement {n}',
    'bt.tt.isLie': 'This is the lie',
    'bt.tt.need3': 'Fill in all three statements.',
    'bt.tt.needLie': 'Mark which one is the lie.',
    'bt.tt.saved': 'Saved. Your card reaches the department so they can play.',
    'bt.tt.none': 'Nobody else has added theirs yet. Once colleagues add theirs and their cards sync, you can play here.',
    'bt.tt.ask': 'Which one is the lie?',
    'bt.quiz.intro': 'A quick quiz made from one colleague’s card. Then send them your score.',
    'bt.quiz.title': 'How well do you know {name}?',
    'bt.quiz.none': 'Needs colleagues with fuller cards — wait for more cards to sync.',
    'bt.quiz.few': 'Their card doesn’t have enough answers for a quiz yet.',
    'bt.quiz.nq': '{n} questions',
    'bt.quiz.best': 'your best: {right}/{n}',
    'bt.quiz.qField': '{field} — which is {name}’s answer?',
    'bt.quiz.qMonth': 'Which month is {name}’s birthday?',
    'bt.quiz.qTot': 'This or that: what did {name} pick?',
    'bt.quiz.qLie': 'Which one is {name}’s lie?',
    'bt.quiz.v0': 'Time for a kwentuhan session!',
    'bt.quiz.v1': 'Not bad — you’re getting there.',
    'bt.quiz.v2': 'You know them well!',
    'bt.quiz.v3': 'Perfect! Certified best friend.',
    'bt.quiz.other': 'Another colleague',
    'bt.baby.intro': 'Match each baby photo to the colleague.',
    'bt.baby.mine': 'Your baby photo',
    'bt.baby.hint': 'Optional. A childhood photo of you. It travels with your card to department members.',
    'bt.baby.saved': 'Baby photo saved.',
    'bt.baby.none': 'Needs at least 2 colleagues with baby photos (and 4 cards). Ask the department to add theirs!',
    'bt.baby.ask': 'Who is this baby?',
    'bt.tot.intro': 'Quick picks — then see how the department splits.',
    'bt.tot.mine': 'My picks',
    'bt.tot.split': 'Department split',
    'bt.tot.or': 'or',
    'bt.tot.progress': '{n} of {total} answered. Tap again to clear a pick.',
    'bt.tot.twins': 'Most like you',
    'bt.tot.same': 'same pick on {same} of {both}',
    'bt.tot.none': 'No picks yet. Answer yours and save your card.',
    'bt.sup.intro': 'Yearbook-style awards. Vote for a colleague in each; results count the votes on every card on this phone.',
    'bt.sup.vote': 'My votes',
    'bt.sup.results': 'Results',
    'bt.sup.pick': '— choose —',
    'bt.sup.progress': '{n} of {total} voted.',
    'bt.sup.noOthers': 'No colleagues’ cards yet, so there is no one to vote for. Check Cloud sync.',
    'bt.sup.note': 'Your votes travel with your card, so colleagues see the totals once it syncs.',
    'bt.sup.votes1': '1 vote',
    'bt.sup.votesN': '{n} votes',
    'bt.sup.also': 'Also voted:',
    'bt.sup.none': 'No votes yet.',
    'bt.qotw.intro': 'One new question every Monday. Answer it, save your card, and read everyone’s answers.',
    'bt.qotw.thisWeek': 'This week',
    'bt.qotw.yours': 'You:',
    'bt.qotw.ph': 'Your answer',
    'bt.qotw.post': 'Post',
    'bt.qotw.posted': 'Answer saved. It travels with your card.',
    'bt.qotw.first': 'No answers from the department yet — be the first.',
    'bt.qotw.noneYet': 'No answers yet.',
    'bt.qotw.more': '+{n} more',
    'bt.qotw.all': 'All weeks',
    'bt.qotw.past': 'Past weeks',
    'bt.bw.h': 'Birthday wall',
    'bt.bw.about': 'Messages for {name}’s birthday ({date}). They see them on the day.',
    'bt.bw.none': 'No messages yet — write the first one.',
    'bt.bw.noneYou': 'No birthday messages yet.',
    'bt.bw.wait1': '1 message is waiting for your birthday.',
    'bt.bw.waitN': '{n} messages are waiting for your birthday.',
    'bt.bw.label': 'A birthday message for {name}',
    'bt.bw.ph': 'Happy birthday! …',
    'bt.bw.hint': 'It travels with your card. {name} sees it on their birthday once it syncs.',
    'bt.bw.post': 'Add to the wall',
    'bt.bw.posted': 'Added to the birthday wall.',
    'bt.bw.home1': '1 message on the birthday wall',
    'bt.bw.homeN': '{n} messages on the birthday wall',
    'bt.bw.read': 'Read the wall',
    'bt.cap.intro': 'Write a letter that stays sealed until a date you pick — to future you, or to the whole department.',
    'bt.cap.write': 'Write a letter',
    'bt.cap.to': 'To',
    'bt.cap.toSelfL': 'Future me (stays on this phone)',
    'bt.cap.toBatchL': 'The department (travels with your card, up to 5)',
    'bt.cap.letter': 'Letter',
    'bt.cap.ph': 'Dear future me…',
    'bt.cap.openOn': 'Open on',
    'bt.cap.seal': 'Seal it',
    'bt.cap.sealed': 'Sealed. 🔒',
    'bt.cap.note': 'Sealed means hidden in this app, not encrypted — anyone with access to your synced card could still read a letter to the department.',
    'bt.cap.needText': 'Write something first.',
    'bt.cap.needDate': 'Pick an opening date after today.',
    'bt.cap.max': 'Up to 5 letters to the department. Remove one first.',
    'bt.cap.none': 'No letters yet.',
    'bt.cap.toSelf': 'To future you',
    'bt.cap.fromYou': 'From you to the department',
    'bt.cap.from': 'From {name}',
    'bt.cap.opens': 'opens {date}',
    'bt.cap.opened': 'opened {date}',
    'bt.cap.peek': 'Peek early',
    'bt.cap.peekConfirm': 'Open this letter before its date?',
    'bt.cap.delConfirm': 'Remove this letter?',
    'bt.cap.homeH': 'A time capsule just opened',
    'bt.tc.title': 'Trading card',
    'bt.tc.intro': 'Your card as a picture — post it in the group chat or your story.',
    'bt.tc.alt': 'Trading card for {name}',
    'bt.tc.share': 'Share or save image',
    'bt.tc.saved': 'Image saved: {name}',
    'bt.eat.intro': 'Can’t decide? Spin through everyone’s favourite food spots.',
    'bt.eat.none': 'Nobody has added favourite food spots yet (My card › Favourite food spots).',
    'bt.eat.spin': 'Spin!',
    'bt.eat.again': 'Spin again',
    'bt.eat.count': '{n} places in the pool',
    'bt.eat.from': 'From the favourites of {names}',
    'bt.eat.maps': 'Open in Maps',
    'bt.eat.share': 'Send to the group',
    'bt.eat.msg': 'Tara, kain tayo sa {place}! 🍽️',
    'bt.eat.who': 'Who’s coming?',
    'bt.eat.list': 'All the spots',
    'bt.an.intro': 'Everyone picks one song that sums them up. Together they’re the department anthem.',
    'bt.an.mine': 'Your song',
    'bt.an.song': 'Song (title — artist)',
    'bt.an.songPh': 'e.g. Tadhana — Up Dharma Down',
    'bt.an.url': 'Link (optional)',
    'bt.an.hint': 'A Spotify, YouTube or Apple Music link.',
    'bt.an.needTitle': 'Add the song title.',
    'bt.an.badUrl': 'That link isn’t from Spotify, YouTube or Apple Music.',
    'bt.an.saved': 'Song saved.',
    'bt.an.none': 'No songs yet.',
    'bt.an.play': 'Play',
    'bt.an.find': 'Find it',
    'bt.an.k': 'Anthem',
    'bt.an.homeH': 'Department anthem of the week',
    'bt.badge.liedetector': 'Lie detector',
    'bt.badge.liedetector.how': 'Spot 5 lies in Two truths and a lie.',
    'bt.badge.quizmaster': 'Best friend material',
    'bt.badge.quizmaster.how': 'Get every question right in a How well do you know…? quiz.',
    'bt.badge.babyface': 'Baby whisperer',
    'bt.badge.babyface.how': 'Match every baby photo in a round (3 or more).',
    'bt.badge.pollster': 'Decisive',
    'bt.badge.pollster.how': 'Answer every This or that.',
    'bt.badge.voter': 'Ballot caster',
    'bt.badge.voter.how': 'Vote in every department superlative.',
    'bt.badge.qotw': 'Weekly regular',
    'bt.badge.qotw.how': 'Answer a Question of the week.',
    'bt.badge.timekeeper': 'Time traveller',
    'bt.badge.timekeeper.how': 'Seal a time-capsule letter.',
    'bt.badge.dj': 'Department DJ',
    'bt.badge.dj.how': 'Add your song to the department anthem.',
    'bt.badge.foodie': 'Food tripper',
    'bt.badge.foodie.how': 'Spin Where should we eat?',
    // 1.18.0 Cloud sync
    'nav.sync': 'Cloud sync',
    'bt.sync.intro': 'Your card reaches every approved colleague through the cloud, and theirs reach you. No more swapping files or QR codes.',
    'bt.sync.loading': 'Connecting to the cloud…',
    'bt.sync.retry': 'Try again',
    'bt.sync.step1': 'Sign in',
    'bt.sync.signInText': 'Sign in with your Google account. It is only used to check that you belong to the department; Psych Tickler never sees your password.',
    'bt.sync.signIn': 'Sign in with Google',
    'bt.sync.signingIn': 'Opening Google sign-in…',
    'bt.sync.signedInAs': 'Signed in as {email}',
    'bt.sync.signOut': 'Sign out',
    'bt.sync.confirmOut': 'Sign out of the cloud on this phone? The cards already here stay; they just stop updating until you sign in again.',
    'bt.sync.joinH': 'Join your department',
    'bt.sync.joinText': 'Type the join code you got from the admin. The admin then approves you, and the cards start to arrive.',
    'bt.sync.code': 'Join code',
    'bt.sync.join': 'Ask to join',
    'bt.sync.badCode': 'That code looks too short. Check it and try again.',
    'bt.sync.checking': 'Checking the code…',
    'bt.sync.noBatch': 'No department space has that code. Check it with the admin.',
    'bt.sync.createH': 'Create a department space (admin)',
    'bt.sync.createText': 'Makes a new department space and its join code. Give the code to your colleagues, then approve each request here.',
    'bt.sync.create': 'Create department space',
    'bt.sync.existing': 'Or open a department space you already made:',
    'bt.sync.pendingH': 'Waiting for approval',
    'bt.sync.pendingText': 'Your request to join {name} was sent. Once the admin approves it, your colleagues’ cards arrive here on their own.',
    'bt.sync.checkAgain': 'Check again',
    'bt.sync.stillPending': 'Not approved yet. Try again later.',
    'bt.sync.cancelReq': 'Cancel request',
    'bt.sync.approved': 'You’re in! Getting the department’s cards…',
    'bt.sync.removed': 'This account is no longer a member of the department. Ask the admin, or enter the code again to request to join.',
    'bt.sync.batch': 'Your department',
    'bt.sync.memberText': 'You’re a member. Your card is sent whenever you save it, and new cards come in each time you open the app.',
    'bt.sync.inviteCode': 'Join code:',
    'bt.sync.copy': 'Copy',
    'bt.sync.copied': 'Join code copied.',
    'bt.sync.now': 'Sync now',
    'bt.sync.busy': 'Syncing…',
    'bt.sync.last': 'Last synced {when}',
    'bt.sync.never': 'Not synced yet',
    'bt.sync.result': 'Synced: {added} new, {updated} updated, {removed} removed.',
    'bt.sync.upToDate': 'Everything is up to date.',
    'bt.sync.gotMe': 'Your card came in from your other device.',
    'bt.sync.tb.off': 'Cloud sync is not set up. Tap to open Cloud sync.',
    'bt.sync.tb.pending': 'Cloud sync: waiting for approval. Tap to check.',
    'bt.sync.tb.busy': 'Syncing…',
    'bt.sync.tb.err': 'Sync didn’t go through. Tap to try again.',
    'bt.sync.tb.ok': 'Synced {when}. Tap to sync now.',
    'bt.sync.tb.okNever': 'Cloud sync is on. Tap to sync now.',
    'bt.sync.needCard': 'Fill in My card so your colleagues get yours too.',
    'bt.sync.consentH': 'What leaves your phone',
    'bt.sync.consentText': 'Everything on your card is sent to department members except the two groups below, which stay on this phone until you tick them. You can untick them any time.',
    'bt.sync.consent.emergency': 'Blood type, allergies, conditions and emergency contacts. Shown on everyone’s Emergency info screen.',
    'bt.sync.consent.contact': 'Your numbers, emails, GCash, socials, where you stay and sizes.',
    'bt.sync.consentConfirm.emergency': 'Share your Emergency & medical details with the members of your department? This is sensitive personal information; only approved members can see it, and you can stop sharing it any time.',
    'bt.sync.consentConfirm.contact': 'Share your Contact details (numbers, emails, GCash, socials) with the members of your department? Only approved members can see them, and you can stop sharing any time.',
    'bt.sync.consentOn': 'Saved. Sending your card…',
    'bt.sync.consentOff': 'Saved. That group is removed from the cloud copy of your card.',
    'bt.sync.adminH': 'Admin',
    'bt.sync.requests': 'Join requests',
    'bt.sync.noRequests': 'No requests waiting.',
    'bt.sync.approve': 'Approve',
    'bt.sync.decline': 'Decline',
    'bt.sync.approvedX': '{name} approved.',
    'bt.sync.confirmDecline': 'Decline the request from {name}?',
    'bt.sync.members': 'Members',
    'bt.sync.you': 'You',
    'bt.sync.remove': 'Remove',
    'bt.sync.confirmRemove': 'Remove {name} from the department? Their card is deleted from the cloud and disappears from everyone’s phone at the next daily sync.',
    'bt.sync.reload': 'Refresh the lists',
    'bt.sync.leaveH': 'Leave the department',
    'bt.sync.leaveText': 'Deletes your card from the cloud and stops syncing on this phone. Cards already on this phone stay.',
    'bt.sync.leave': 'Leave department',
    'bt.sync.confirmLeave': 'Leave the department? Your card is deleted from the cloud and removed from your colleagues’ phones at their next daily sync.',
    'bt.sync.left': 'You left the department.',
    'bt.sync.privacyH': 'Privacy',
    'bt.sync.privacy1': 'Only department members approved by the admin can read the cards. Each person can only change their own.',
    'bt.sync.privacy2': 'Cards are stored in Google Firebase (Firestore) for this app only. There are no ads and no tracking.',
    'bt.sync.privacy3': 'Emergency & medical and Contact details leave your phone only if you tick them on this screen.',
    'bt.sync.privacy4': 'Leaving the department deletes your card from the cloud.',
    'bt.sync.errPerm': 'The cloud refused that. You may not be approved yet, or you were removed from the department.',
    'bt.sync.errNet': 'Can’t reach the cloud. Check your internet connection and try again.',
    'bt.sync.errClosed': 'Sign-in was closed before it finished.',
    'bt.sync.errSignedOut': 'You are signed out. Sign in again on Cloud sync.',
    'bt.sync.errOther': 'Something went wrong ({code}).',
    'bt.sync.homeH': 'Join your department in the cloud',
    'bt.sync.home': 'Sign in once and everyone’s cards arrive on their own.',
    'bt.sync.homePendingH': 'Waiting for approval',
    'bt.sync.homePending': 'The admin hasn’t approved your join request yet.',
    'bt.sync.tmdbH': 'Show info (TMDB key)',
    'bt.sync.tmdbText': 'Paste your TMDB API key to give the show of the day a picture and a description. It is saved with your department in the cloud, never in the app’s public code.',
    'bt.sync.tmdbSet': 'A key is saved. Colleagues’ phones pick it up at their next sync. Paste a new one to replace it.',
    'bt.sync.tmdbKey': 'TMDB API key',
    'bt.sync.tmdbSave': 'Save key',
    'bt.sync.tmdbRemove': 'Remove key',
    'bt.sync.tmdbConfirmRm': 'Remove the TMDB key? The show of the day goes back to title only.',
    'bt.sync.tmdbBad': 'That doesn’t look like a TMDB API key (32 letters and numbers).',
    'bt.sync.tmdbSaved': 'Key saved. Show info turns on at each phone’s next sync.',
    'bt.sync.tmdbRemoved': 'Key removed.',
    // 1.19.0 Spotify player, show info, pets
    'nav.pets': 'Pets',
    'bt.pets.intro': 'Everyone’s furry, feathered and scaly family — one card per pet, with a photo.',
    'bt.pets.mine': 'My pets',
    'bt.pets.noneMine': 'No pets added yet. Add your first one below.',
    'bt.pets.add': 'Add a pet',
    'bt.pets.addAnother': 'Add another pet',
    'bt.pets.edit': 'Edit pet',
    'bt.pets.editBtn': 'Edit',
    'bt.pets.photo': 'Add a photo',
    'bt.pets.photoChange': 'Change photo',
    'bt.pets.photoBusy': 'Preparing the photo…',
    'bt.pets.name': 'Name',
    'bt.pets.kind': 'Kind',
    'bt.pets.breed': 'Breed',
    'bt.pets.breedPh': 'Aspin, Shih Tzu, Puspin…',
    'bt.pets.note': 'About them',
    'bt.pets.notePh': 'Age, favourite treat, silly habit…',
    'bt.pets.save': 'Add pet',
    'bt.pets.saveEdit': 'Save changes',
    'bt.pets.cancel': 'Cancel',
    'bt.pets.up': 'Move up',
    'bt.pets.remove': 'Remove',
    'bt.pets.confirmRemove': 'Remove {name} from your card?',
    'bt.pets.needName': 'Give your pet a name first.',
    'bt.pets.saved': '{name} is on your card.',
    'bt.pets.max': 'That’s the most a card can hold ({n} pets). Remove one to add another.',
    'bt.pets.batchH': 'The department’s pets',
    'bt.pets.none': 'No colleagues’ pets yet.',
    'bt.pets.count1': '1 pet so far.',
    'bt.pets.countN': '{n} pets so far.',
    'bt.pets.of': '{name}’s',
    'bt.pets.personH': 'Pets',
    'bt.pets.manage': 'Edit my pets',
    'bt.pets.k.dog': 'Dog',
    'bt.pets.k.cat': 'Cat',
    'bt.pets.k.bird': 'Bird',
    'bt.pets.k.fish': 'Fish',
    'bt.pets.k.rabbit': 'Rabbit',
    'bt.pets.k.hamster': 'Hamster',
    'bt.pets.k.turtle': 'Turtle',
    'bt.pets.k.other': 'Other',
    'bt.h.pets': 'A quick summary. Add each pet with a photo on the Pets screen (More on your card › My pets).',
    'bt.pl.embedTitle': 'Spotify player: {name}',
    'bt.tmdb.alt': 'Still from {title}',
    'bt.tmdb.credit': 'Info and image from',
    'bt.tmdb.notice': 'Show descriptions and images come from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.',
    'nav.chat': "Chat",
    'nav.chatShort': "Chat",
    'bt.chat.intro': "Department chat channels. Tap a channel to read and write; anyone in the department can start a new one.",
    'bt.chat.joinH': "Join your department to chat",
    'bt.chat.joinText': "Chat runs through Cloud sync. Sign in and join your department with its code, then come back here.",
    'bt.chat.joinBtn': "Open Cloud sync",
    'bt.chat.loading': "Loading…",
    'bt.chat.channels': "Channels",
    'bt.chat.lastBy': "{name} · {when}",
    'bt.chat.empty': "No messages yet",
    'bt.chat.unread': "New messages",
    'bt.chat.newH': "Start a new channel",
    'bt.chat.newText': "Pick a short name. You can rename or delete channels you start.",
    'bt.chat.emoji': "Emoji",
    'bt.chat.chName': "Channel name",
    'bt.chat.create': "Create channel",
    'bt.chat.creating': "Creating…",
    'bt.chat.created': "{ch} is ready",
    'bt.chat.needName': "Type a channel name (letters or numbers).",
    'bt.chat.exists': "A channel with that name already exists.",
    'bt.chat.reportsH': "Reported messages",
    'bt.chat.noReports': "Nothing reported.",
    'bt.chat.reportedBy': "reported by {name}",
    'bt.chat.open': "Open",
    'bt.chat.dismiss': "Dismiss",
    'bt.chat.note': "Messages are seen only by members of your department. New messages show up while a channel is open; the dots on the channel list refresh when you open the app or sync. There are no phone notifications yet.",
    'bt.chat.rename': "Rename",
    'bt.chat.renamePrompt': "New name for this channel:",
    'bt.chat.deleteCh': "Delete channel",
    'bt.chat.confirmDeleteCh': "Delete {ch} and every message in it, for everyone? This can't be undone.",
    'bt.chat.chDeleted': "{ch} deleted",
    'bt.chat.older': "Load older messages",
    'bt.chat.first': "No messages yet. Say hi!",
    'bt.chat.newMsgs': "New messages",
    'bt.chat.addPhoto': "Add a photo",
    'bt.chat.stickers': "Stickers",
    'bt.chat.message': "Message",
    'bt.chat.placeholder': "Message {ch}",
    'bt.chat.send': "Send",
    'bt.chat.sending': "Sending…",
    'bt.chat.shrinking': "Getting the photo ready…",
    'bt.chat.photoBad': "That photo couldn't be used. Try another one (JPEG, PNG, WebP or a small GIF).",
    'bt.chat.photoReady': "Photo ready ({kb} KB)",
    'bt.chat.removePhoto': "Remove photo",
    'bt.chat.photo': "Photo",
    'bt.chat.sticker': "Sticker",
    'bt.chat.someone': "Colleague",
    'bt.chat.actions': "Message options",
    'bt.chat.msgActions': "Options for the message from {name}",
    'bt.chat.reactN': "{emoji} {n}",
    'bt.chat.reply': "Reply",
    'bt.chat.replyingTo': "Replying to {name}",
    'bt.chat.cancelReply': "Cancel reply",
    'bt.chat.copy': "Copy text",
    'bt.chat.copied': "Copied",
    'bt.chat.deleteMsg': "Delete message",
    'bt.chat.confirmDelete': "Delete this message for everyone?",
    'bt.chat.deleted': "Message deleted",
    'bt.chat.report': "Report to admin",
    'bt.chat.confirmReport': "Report this message to the department admin?",
    'bt.chat.reported': "Reported. Thank you.",
    'bt.chat.close': "Close",
    'bt.chat.playHere': "Play here",
    'bt.chat.player': "Player",
    'bt.chat.today': "Today",
    'bt.chat.yesterday': "Yesterday",
    'bt.chat.set.goose': "Goose",
    'bt.chat.set.capybara': "Capybara",
    'bt.chat.set.cat': "Cat",
    'bt.badge.chatter': "Chatterbox",
    'bt.badge.chatter.how': "Send your first chat message",
    'bt.chat.homeH': "Department chat",
    'bt.chat.homeLoading': "Opening your channels…",
    'bt.chat.homeNew1': "New messages in {ch} from {name}",
    'bt.chat.homeNewN': "New messages in {n} channels · latest in {ch}",
    'bt.chat.homeLatest': "Latest: {name} in {ch} · {when}",
    'bt.chat.homeQuiet': "No messages yet. Say hi in #general!",
  },

  // Tagalog draft — Dr. Navarro reviews before release
  tl: {
    /* ---- Psych Tickler screens (Tagalog draft — Dr. Navarro reviews before release) ---- */
    'nav.batch': 'Ang department',
    'nav.me': 'Card ko',
    'nav.birthdays': 'Mga kaarawan',
    'nav.print': 'Print at PDF',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.guess': 'Hulaan kung sino',
    'bt.hero.cta': 'Punan ang card ko',
    'bt.hero.ctaDone': 'Tingnan ang department',
    'nav.play': 'Laro',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.map': 'Mapa ng probinsya',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.whosaid': 'Sino ang nagsabi?',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.bingo': 'Department Bingo',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.icebreakers': 'Icebreakers',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.wrapped': 'Department Wrapped',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.title': 'Residency',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.set': 'Ilagay ang start date sa About para mabilang ang araw.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.tomorrow': 'Magsisimula bukas!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.inN': 'Magsisimula sa loob ng {n} araw',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.dayN': 'Araw {n}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.year': 'Taon {n} ng residency',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.m1': 'Unang araw. Welcome sa residency!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.mN': 'Araw {n}: isang milestone!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.mYear': '{n} taon na ng residency ngayon!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.setting': 'Petsa ng simula ng residency',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.day.hint': 'Magsisimula ang residency ng mga incoming first year sa 1 Enero 2027. Palitan ng sarili mong petsa; burahin para bumalik sa 1 Enero 2027.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.kicker': 'Kaarawan ngayon',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.title': 'Maligayang kaarawan, {names}!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.you': 'Maligayang kaarawan sa iyo!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.youToo': 'At maligayang kaarawan din sa iyo!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.greet': 'Batiin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.copied': 'Nakopya ang bati. I-paste sa chat mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.msg': 'Happy birthday, {name}! 🎂 Masayang taon sa iyo. Mula sa mga ka-department mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bdt.msgBatch': 'Happy birthday, {name}! 🎂 Masayang taon sa iyo. Mula sa mga ka-department mo sa {batch}.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.spot.h': 'Spotlight ngayong linggo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.spot.open': 'Basahin ang card niya',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ws.intro': 'Isang tanong, sagot ng lahat: basahin ang sagot at hulaan kung kanino.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ws.notEnough': 'Kailangan ng dalawang card man lang na sumagot sa parehong tanong.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ws.topic': 'Tanong',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ws.other': 'Ibang tanong',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ws.ask': 'Kanino ang sagot na ito sa {field}?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.intro': 'Hanapin ang mga ka-department na tugma sa bawat kahon. I-tap ang kahon kapag may nahanap ka. Lima nang sunod-sunod (pahalang, pababa o pahilis) ang panalo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.notEnough': 'Kulang pa ang detalye sa mga card. Hintayin munang ma-sync ang iba pang card.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.win': 'BINGO! 🎉',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.winN': 'BINGO × {n}! 🎉',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.free': 'Libre',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.new': 'Bagong card',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.newConfirm': 'Magsimula ng bagong bingo card? Mabubura ang mga marka sa card na ito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.how': 'Galing sa mga card ng department ang mga kahon. Magtanong-tanong sa halip na sumilip; pang-check ang Ipakita kung sino.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.reveal': 'Ipakita kung sino',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bingo.hide': 'Itago ang pangalan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.h': 'Department twins',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.intro': 'Ang mga pares na pinakamaraming pagkakapareho.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.n1': '1 pagkakapareho',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.nN': '{n} pagkakapareho',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.top': 'pinakamalapit',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.more': 'at {n} pa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.twins.none': 'Wala pang dalawang card na may pagkakapareho.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.intro': 'Pambukas ng usapan sa break sa duty, tanghalian at department night.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.modeQ': 'Mga tanong',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.modeCard': 'Mula sa mga card',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.ask': 'Itanong ito',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.askWho': 'Subukang tanungin si {name}.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.next': 'Susunod',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.otherWho': 'Iba naman',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.noCards': 'Wala pang card ng ka-department. Tingnan ang Cloud sync.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.cardQ': 'Tanungin si {name} tungkol sa {field} niya.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.theirCard': 'Sabi ng card niya',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ice.reveal': 'Silipin ang card niya',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.intro': 'Kung taga-saan ang lahat, batay sa Hometown sa bawat card.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.noData': 'Hindi nag-load ang datos ng mapa.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.aria': 'Mapa ng Pilipinas na may mga hometown ng department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.hosp': 'ang ospital',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.tap': 'I-tap ang tuldok para makita kung sino ang taga-roon.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.places': '{n} lugar',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.empty': 'Wala pang hometown na nasa mapa.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.off': 'Wala sa mapa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.offHint': 'Mga hometown na hindi nakilala ng mapa (abroad, o iba ang baybay). Makakatulong ang “siyudad, probinsya”.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.none': '{n} na walang hometown sa card.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.src': 'Balangkas ng mapa: Natural Earth (public domain). Tantiya lang ang mga tuldok.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.intro': 'Ang department sa ilang slide. I-tap ang Susunod o mag-swipe.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.notEnough': 'Kailangan ng dalawang card man lang.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.prev': 'Bumalik',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.next': 'Susunod',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.again': 'Ulitin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.note': 'Ginawa mula sa mga card sa device na ito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.theBatch': 'Ang department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k0': 'Department Wrapped {year}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s0': 'Balikan natin kung sino tayo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k1': 'Sa bilang',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s1': 'residente sa device na ito',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.towns': 'hometown',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.schools': 'medical school',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.langs': 'wika',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k2': 'Panahon ng kaarawan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s2': '{n} kaarawan sa buwang iyon',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s2one': 'ang unang kaarawan sa listahan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.zodiac': 'Pinakakaraniwang sign: {sign} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k3': 'Ipinanganak mula',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s3': '{n} taon ng kapanganakan sa iisang department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k4': 'Paborito ng department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.b4': 'Ang mga gusto natin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.food': 'Pagkain: {v} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.shows': 'Show: {v} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.music': 'Musika: {v} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.movies': 'Pelikula: {v} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.games': 'Laro: {v} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.hobbies': 'Hobby: {v} ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k5': 'Pinakakaraniwang hometown',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s5': 'tahanan ng {n} sa atin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k6': 'Mga playlist na ibinahagi',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s6': 'Spotify playlist sa mga card ng department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s6one': 'Spotify playlist sa mga card ng department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k7': 'Para sa residency',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s7': 'Masaya kaming kasama ka sa department na ito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.h': 'Ngayong araw sa department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.pl': 'Tampok na Spotify playlist ngayon',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.fact': 'Tampok na kaalaman ngayong araw',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.by': 'Ibinahagi ni {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.another': 'Iba pa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.home.count1': '{n} kasama na sa department mo.',
    'bt.home.countN': '{n} kasama na sa department mo.',
    'bt.home.nextBirthday': 'Susunod na kaarawan',
    'bt.home.today': 'Ngayon!',
    'bt.home.inDays1': 'bukas',
    'bt.home.inDaysN': 'sa loob ng {n} araw',
    'bt.home.noMe': 'Magsimula sa sarili mong card; makakarating ito sa department pagkatapos mong i-save.',
    'bt.batch.intro': 'Lahat ng may card sa device na ito. I-tap ang card para magbasa pa.',
    'bt.batch.filter': 'I-filter ayon sa pangalan, bayan, paaralan…',
    'bt.batch.sortName': 'Ayon sa pangalan',
    'bt.batch.sortBirthday': 'Ayon sa kaarawan',
    'bt.batch.sortHometown': 'Ayon sa bayan',
    'bt.batch.emptyTitle': 'Wala pang card',
    'bt.batch.emptyText': 'Punan muna ang sarili mong card, tapos darating ang mga card ng ka-department mo sa pamamagitan ng Cloud sync.',
    'bt.batch.noMatch': 'Walang tumutugma.',
    'bt.batch.you': 'Ikaw',
    'bt.person.notFound': 'Wala ang card na iyan sa device na ito.',
    'bt.person.edit': 'I-edit ang card ko',
    'bt.nv.homeH': 'Card mo',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.homeNone': 'Wala ka pang card',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.homeNoneT': 'Gawin ang card mo para makilala ka ng department. Isang minuto lang para makapagsimula.',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.make': 'Gawin ang card ko',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.secEdit': 'I-edit',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.secEditA': 'I-edit ang {section}',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.emptyH': 'Hindi pa napupunan',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.emptyT': 'I-tap ang isang seksyon para idagdag ito sa card mo.',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.jump': 'Pumunta sa isang seksyon',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.nextEmpty': 'Susunod na tanong na walang sagot',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.nv.allDone': 'May sagot na ang lahat ng tanong.',   // Tagalog draft — Dr. Navarro reviews before release
    'bt.person.remove': 'Alisin ang card na ito',
    'bt.person.confirmRemove': 'Alisin si {name} sa device na ito? Babalik ang card niya sa susunod na sync.',
    'bt.person.updated': 'Na-update ang card noong {date}',
    'bt.person.birthday': 'Kaarawan',
    'bt.person.turns': 'magiging {n}',
    'bt.person.contact': 'Kontak',
    'bt.person.call': 'Tawagan',
    'bt.person.text': 'I-message',
    'bt.person.mail': 'I-email',
    'bt.me.title': 'Card ko',
    'bt.me.intro': 'Ikaw lang ang puwedeng mag-edit ng card na ito. Naka-save ito sa device na ito at makakarating sa department sa pamamagitan ng Cloud sync.',
    'bt.me.name': 'Buong pangalan',
    'bt.me.nameHint': 'Kung paano mo gustong makita ito ng department.',
    'bt.me.photo': 'Larawan',
    'bt.me.photoHint': 'Opsyonal. Pinakamaganda ang parisukat na larawan; pinaliliit ito para manatiling maliit ang card.',
    'bt.me.choosePhoto': 'Pumili ng larawan',
    'bt.me.removePhoto': 'Alisin ang larawan',
    'bt.me.birthday': 'Kaarawan',
    'bt.me.month': 'Buwan',
    'bt.me.day': 'Araw',
    'bt.me.year': 'Taon',
    'bt.me.none': '—',
    'bt.me.save': 'I-save ang card ko',
    'bt.me.saved': 'Na-save. Napapanahon na ang card mo sa device na ito.',
    'bt.me.needName': 'Ilagay muna ang pangalan mo.',
    'bt.me.badBirthday': 'Hindi totoong petsa ang kaarawang iyan.',
    'bt.me.photoTooBig': 'Hindi mabasa ang larawang iyan. Sumubok ng mas maliit na larawan.',
    'bt.me.clear': 'Burahin ang card ko',
    'bt.me.draftH': 'Naibalik ang mga hindi pa na-save',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.me.draftText': 'Ito ang mga binago mo noong {when}. Nakatabi ito sa phone na ito pero wala pa sa card mo — i-tap ang Save para manatili.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.me.draftDiscard': 'Itapon ang mga pagbabagong ito',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.me.draftConfirm': 'Itapon ang mga hindi pa na-save at bumalik sa naka-save mong card?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.me.draftNote': 'Nakatabi sa phone na ito · i-tap ang Save',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.me.confirmClear': 'Burahin ang lahat sa card mo? Mananatili ang mga card ng mga ka-department mo.',
    'bt.f.nickname': 'Palayaw',
    'bt.f.hometown': 'Bayan',
    'bt.f.medSchool': 'Med school',
    'bt.f.hobbies': 'Mga libangan',
    'bt.f.shows': 'Paboritong TV show',
    'bt.f.movies': 'Paboritong pelikula',
    'bt.f.cartoons': 'Paboritong cartoon',
    'bt.f.anime': 'Paboritong anime',
    'bt.f.games': 'Paboritong video game',
    'bt.f.music': 'Musika at artist',
    'bt.f.food': 'Paboritong pagkain',
    'bt.f.funFact': 'Fun fact',
    'bt.f.phone': 'Numero ng cellphone',
    'bt.f.email': 'Email',
    'bt.g.basics': 'Pangunahin',
    'bt.g.background': 'Pinagmulan',
    'bt.g.favourites': 'Mga paborito',
    'bt.g.life': 'Buhay',
    'bt.g.contact': 'Kontak at praktikal',
    'bt.g.custom': 'Higit pa tungkol sa akin',
    'bt.f.preferredName': 'Paano ka tatawagin',
    'bt.f.pronouns': 'Panghalip',
    'bt.f.livesNow': 'Saan ka nakatira ngayon',
    'bt.f.commute': 'Paano ka pumupunta sa Mariveles',
    'bt.f.languages': 'Mga wika at diyalekto',
    'bt.f.internship': 'Ospital ng internship',
    'bt.f.gradYear': 'Taon ng pagtatapos',
    'bt.f.pastJobs': 'Dating trabaho / buhay bago mag-residency',
    'bt.f.whyPsych': 'Bakit psychiatry',
    'bt.f.interests': 'Mga larangan ng interes',
    'bt.f.kdrama': 'Paboritong K-drama',
    'bt.f.books': 'Paboritong libro',
    'bt.f.authors': 'Paboritong may-akda',
    'bt.f.podcasts': 'Mga podcast',
    'bt.f.sports': 'Sports at koponan',
    'bt.f.snack': 'Paboritong meryenda',
    'bt.f.comfortFood': 'Comfort food',
    'bt.f.localEats': 'Paboritong kainan sa Mariveles / Balanga',
    'bt.f.dessert': 'Paboritong panghimagas',
    'bt.f.coffeeTea': 'Order na kape o tsaa',
    'bt.f.colour': 'Paboritong kulay',
    'bt.f.pokemon': 'Paboritong Pokémon',
    'bt.f.cantLiveWithout': 'Hindi mabubuhay nang wala',
    'bt.f.karaoke': 'Kantang pang-karaoke',
    'bt.f.studyStyle': 'Night owl o early bird',
    'bt.f.pets': 'Mga alaga',
    'bt.f.hiddenTalent': 'Tagong talento',
    'bt.f.destress': 'Pampawala ng stress',
    'bt.f.giftHints': 'Mga gustong regalo / wish list',
    'bt.f.social': 'Mga social media handle',
    'bt.f.allergies': 'Allergy o diyeta',
    'bt.f.emergencyContact': 'Emergency contact name',
    'bt.f.inAppOnly': 'sa app lang',
    'bt.custom.title': 'Sarili mong mga field',
    'bt.custom.hint': 'Kung may nakaligtaan ang listahan — lagyan ng label at sagot.',
    'bt.custom.label': 'Label',
    'bt.custom.value': 'Sagot',
    'bt.custom.add': 'Magdagdag ng field',
    'bt.custom.remove': 'Alisin',
    'bt.me.complete': '{n} sa {total} ang napunan',
    'bt.me.completeHint': 'Kapag mas marami kang pinunan, mas makikilala ka ng department.',
    'bt.me.expandAll': 'Buksan ang lahat ng seksyon',
    'bt.me.collapseAll': 'Isara ang lahat ng seksyon',
    'bt.common.title': 'Mga pagkakatulad',
    'bt.common.none': 'Wala pang pagkakatulad — punan pa ang card mo at ang kanila.',
    'bt.common.same': 'Parehong {field}: {value}',
    'bt.common.shared': 'Pareho kayong mahilig sa: {value} ({field})',
    'bt.batchName': 'Pangalan ng department',
    'bt.batchNameHint': 'Lalabas sa home screen at sa printed sheet, hal. “MMWGH Psychiatry”.',
    'nav.stats': 'Department stats',
    'bt.cal.one': 'Idagdag sa kalendaryo',
    'bt.cal.all': 'Kalendaryo ng mga kaarawan ng department',
    'bt.cal.allText': 'Isang calendar file na may lahat ng kaarawan, taun-taon. Buksan ito sa telepono mo at iaalok nitong idagdag ang mga event.',
    'bt.cal.summary': 'Kaarawan ni {name}',
    'bt.cal.saved': 'Handa na ang calendar file: {name}.',
    'bt.stats.intro': 'Ang hitsura ng department, mula sa mga card sa device na ito.',
    'bt.stats.residents': 'residente',
    'bt.stats.withPhoto': 'may larawan',
    'bt.stats.avgComplete': 'average na napunan sa card',
    'bt.stats.hometowns': 'Mga bayan',
    'bt.stats.schools': 'Mga med school',
    'bt.stats.languages': 'Mga wika at diyalekto',
    'bt.stats.months': 'Mga kaarawan ayon sa buwan',
    'bt.stats.ages': 'Pinakamatanda hanggang pinakabata',
    'bt.stats.thisMonth': 'Ngayong buwan sa department',
    'bt.stats.thisMonthNone': 'Walang kaarawan ngayong buwan.',
    'bt.stats.shared': 'Pinakamaraming nagkakatulad na paborito',
    'bt.stats.sharedNone': 'Wala pang paboritong pareho ng dalawa o higit pang tao.',
    'bt.stats.n1': '{n} tao',
    'bt.stats.nN': '{n} tao',
    'bt.stats.empty': 'Wala pang mabibilang.',
    'bt.print.modeSheet': 'Department sheet',
    'bt.print.modeTags': 'Mga name tag',
    'bt.print.tagsHint': 'Walong tag bawat A4 na pahina. Gupitin sa mga gilid.',
    'bt.guess.modeClue': 'Clue → pangalan',
    'bt.guess.modePhoto': 'Larawan → pangalan',
    'bt.guess.modeMonth': 'Pangalan → buwan ng kaarawan',
    'bt.guess.whosePhoto': 'Sino ito?',
    'bt.guess.whichMonth': 'Anong buwan ang kaarawan ni {name}?',
    'bt.guess.roundOf': 'Tanong {i} sa {n}',
    'bt.guess.roundDone': 'Tapos ang round: {right} sa {n}.',
    'bt.guess.playAgain': 'Maglaro ulit',
    'bt.guess.board': 'Leaderboard (sa teleponong ito)',
    'bt.guess.boardEmpty': 'Wala pang natapos na round.',
    'bt.guess.boardRow': '{right}/{n} · {mode} · {date}',
    'bt.guess.needPhotos': 'Kailangan ng apat na card na may larawan.',
    'bt.guess.needDates': 'Kailangan ng apat na card na may kaarawan.',
    'bt.guess.player': 'Manlalaro',
    'bt.banner.title': 'Larawan ng department',
    'bt.banner.hint': 'Opsyonal. Pinapalitan nito ang larawan sa home screen sa device na ito — pinakamaganda ang malapad na group photo. Kasama ito sa backup; hindi ito sini-sync sa cloud.',
    'bt.banner.choose': 'Pumili ng larawan',
    'bt.banner.remove': 'Gamitin ang default na larawan',
    'bt.banner.saved': 'Na-save ang larawan ng department.',
    'bt.f.season': 'Paboritong panahon',
    'bt.f.flower': 'Paboritong bulaklak o halaman',
    'bt.f.animal': 'Paboritong hayop',
    'bt.f.boardGames': 'Paboritong board o card game',
    'bt.f.youtubers': 'Paboritong YouTuber / streamer',
    'bt.f.canCook': 'Pagkaing Pilipino na kaya mong lutuin',
    'bt.f.milkTea': 'Order na milk tea',
    'bt.f.fastFood': 'Paboritong fast food',
    'bt.f.fruit': 'Paboritong prutas',
    'bt.f.app': 'Paboritong app',
    'bt.f.holiday': 'Paboritong holiday o pista',
    'bt.f.disney': 'Paboritong Disney / Pixar na pelikula',
    'bt.f.superhero': 'Paboritong superhero',
    'bt.f.fandom': 'Fandom / house (Hogwarts house, atbp.)',
    'bt.f.emoji': 'Paboritong emoji',
    'bt.f.quote': 'Paboritong kasabihan o motto',
    'bt.f.bibleVerse': 'Paboritong talata sa Bibliya',
    'bt.f.prayer': 'Paboritong panalangin',
    'bt.f.subject': 'Paborito (at pinakaayaw) na subject sa med school',
    'bt.f.rotation': 'Paboritong rotation sa ngayon',
    'bt.f.studyMusic': 'Musika habang nag-aaral',
    'bt.f.introExtro': 'Introvert, extrovert o ambivert',
    'bt.f.mbti': 'MBTI o Enneagram',
    'bt.f.loveLanguage': 'Love language',
    'bt.f.morningEssential': 'Hindi puwedeng mawala sa umaga',
    'bt.f.dreamTrip': 'Pangarap na puntahan',
    'bt.f.travelled': 'Mga napuntahan',
    'bt.f.bucketList': 'Bucket list',
    'bt.f.superpower': 'Superpower na pipiliin mo',
    'bt.f.threeWords': 'Tatlong salitang panglarawan sa iyo ng mga kaibigan',
    'bt.f.learningNow': 'Pinag-aaralan mo ngayon',
    'bt.f.facebook': 'Facebook',
    'bt.f.instagram': 'Instagram',
    'bt.f.spotify': 'Spotify profile',
    'bt.f.steam': 'Steam',
    'bt.f.shirtSize': 'Sukat ng damit (department shirt)',
    'bt.f.bloodType': 'Blood type',
    'bt.f.urlHint': 'I-paste ang link, o ang username lang.',
    'bt.f.playlists': 'Mga Spotify playlist',
    'bt.nf.find': 'Hanapin sa Netflix',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.nfBy': '#{n} sa top 10 ni {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.nfAlso': 'Nasa top 10 din nina {names}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.k8': 'Pinakamamahal na Netflix show',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.wrap.s8': 'nasa {n} top-10 list',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.intro': 'Mga link list — naka-ranggo, pinakapaborito muna. Gamitin ang Itaas para ayusin.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.up': 'Itaas',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.search': '(magbubukas ng search)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.seeAll': 'Tingnan lahat ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.needTitle': '{list}: maglagay ng pamagat sa tabi ng bawat link.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.badUrl': '{list}: dapat galing sa {hosts} ang mga link.',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.picks': 'Department picks',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.picks.intro': 'Lahat ng list ng department sa iisang lugar — show, pelikula, kainan, wishlist at iba pa. Pinakamaraming naglista muna.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.picks.none': 'Wala pang list. Magdagdag sa card mo at i-save.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.picks.wishIntro': 'Ayon sa kung kaninong kaarawan ang susunod.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.picks.onMap': 'Tingnan ang bucket list sa mapa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.offHintTravel': 'Mga lugar sa labas ng Pilipinas, o pangalang hindi nakilala ng mapa.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.tapTravel': 'I-tap ang tuldok para makita kung sino ang gustong pumunta roon.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.introTravel': 'Kung saan gustong pumunta ng department, mula sa travel bucket list ng lahat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.map.modeHome': 'Mga hometown',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.nf.watchOn': 'Panoorin sa {s}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.today.nf': 'Show na rekomendasyon ngayong araw',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix': 'Top 10 shows (Netflix at streaming)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix.short': 'Mga show',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix.hint': 'Ang top {n} na serye mo, pinakapaborito muna. I-type ang pamagat; opsyonal ang link (Netflix, Disney+, Prime Video, Max, Viu, Apple TV o iWant — Share › Copy link). Kung walang link, magbubukas ng Netflix search ang pamagat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix.item': 'Pamagat ng show',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix.url': 'Streaming link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix.add': 'Magdagdag ng show',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.netflix.hosts': 'Netflix, Disney+, Prime Video, Max, Viu, Apple TV o iWant',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist': 'Birthday wishlist',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist.short': 'Mga wishlist',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist.hint': 'Hanggang {n} bagay na gusto mong matanggap, pinakagusto muna. I-paste ang Shopee o Lazada link (Share › Copy link). Lalabas ito sa birthday banner mo para alam ng ka-department kung ano ang ireregalo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist.item': 'Item',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist.url': 'Shopee o Lazada link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist.add': 'Magdagdag ng wish',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.wishlist.hosts': 'Shopee o Lazada',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films': 'Top films',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films.short': 'Mga pelikula',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films.hint': 'Ang top {n} na pelikula mo. Maglagay ng Letterboxd link kung gamit mo ito; kung wala, magbubukas ng Letterboxd search ang pamagat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films.item': 'Pamagat ng pelikula',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films.url': 'Letterboxd link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films.add': 'Magdagdag ng pelikula',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.films.hosts': 'Letterboxd',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube': 'Paborito sa YouTube',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube.short': 'YouTube',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube.hint': 'Hanggang {n} channel o video na gusto mo. I-paste ang YouTube link (Share › Copy link).',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube.item': 'Channel o video',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube.url': 'YouTube link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube.add': 'Magdagdag ng YouTube',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.youtube.hosts': 'YouTube',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts': 'Mga podcast',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts.short': 'Mga podcast',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts.hint': 'Hanggang {n} podcast na pinapakinggan mo. I-paste ang Spotify o Apple Podcasts link.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts.item': 'Pangalan ng podcast',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts.url': 'Spotify o Apple Podcasts link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts.add': 'Magdagdag ng podcast',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.podcasts.hosts': 'Spotify o Apple Podcasts',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books': 'Mga libro',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books.short': 'Mga libro',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books.hint': 'Hanggang {n} librong nirerekomenda mo. Maglagay ng Goodreads link kung mayroon; kung wala, magbubukas ng Goodreads search ang pamagat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books.item': 'Pamagat ng libro',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books.url': 'Goodreads link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books.add': 'Magdagdag ng libro',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.books.hosts': 'Goodreads',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots': 'Paboritong kainan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots.short': 'Mga kainan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots.hint': 'Hanggang {n} kainan — malapit sa ospital, sa probinsya mo, kahit saan. I-paste ang Google Maps link (Share › Copy link).',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots.item': 'Pangalan ng lugar',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots.url': 'Google Maps link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots.add': 'Magdagdag ng kainan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.foodSpots.hosts': 'Google Maps',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel': 'Travel bucket list',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel.short': 'Bucket list',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel.hint': 'Hanggang {n} lugar na gusto mong puntahan. Isulat ang pangalan ng lugar (hal. Siargao, Batanes, Kyoto) — lalabas din sa Hometown map ang mga lugar sa Pilipinas. Opsyonal ang Google Maps link.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel.item': 'Lugar',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel.url': 'Google Maps link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel.add': 'Magdagdag ng lugar',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.travel.hosts': 'Google Maps',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study': 'Study stash',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study.short': 'Study stash',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study.hint': 'Hanggang {n} study resource na maaasahan — lecture channel, app, libro, website.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study.item': 'Resource',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study.url': 'Link (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study.add': 'Magdagdag ng resource',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.l.study.hosts': 'mga https link',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.events': 'Mga department event',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.monito': 'Kris Kringle',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.badges': 'Mga badge',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.f.askMe': 'Tanungin mo ako tungkol sa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.h.askMe': 'Hanggang 3 paksa, hiwalay sa kuwit — hal. K-drama, running, pusa. Lalabas ito sa card mo sa department list.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.f.teachWords': 'Mga salitang ituturo sa department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.h.teachWords': 'Isa bawat linya: salita o parirala — kahulugan (wika). hal. Mayap a abak — good morning (Kapampangan). Isa ang lalabas sa Home bilang Salita ng araw.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ask.k': 'Tanungin mo ako',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.word.h': 'Salita ng araw',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.word.by': 'Itinuro ni {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.earned': 'Nakakuha ng badge: {name} 🎉',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.intro': '{n} sa {total} badge ang nakuha sa phone na ito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.on': 'Nakuha {date}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.note': 'Nakukuha ang mga badge sa phone na ito at lumalabas sa card mo, na makakarating sa mga ka-department mo pagkatapos mong i-save.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.h': 'Mga shoutout',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.forYou': 'Mga shoutout para sa iyo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.none': 'Wala pang shoutout. Ikaw na ang mauna!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.noneYou': 'Wala pa. Kapag nagpadala ng shoutout ang ka-department, lalabas ito rito pagka-sync ng card nila.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.you': 'ikaw',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.label': 'Shoutout para kay {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.ph': 'Salamat sa pag-cover ng rounds ko! 🙏',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.hint': 'Hanggang 280 character. Kasama ito ng card mo, kaya makikita nila ito pagkatapos mong i-save.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.send': 'Ipadala ang shoutout',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.sent': 'Naidagdag ang shoutout sa card mo. Makakarating ito sa kanila pagkatapos mong i-save.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.needCard': 'Gumawa muna ng card para makapag-shoutout',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.homeH': 'Shoutout para sa iyo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.shout.all': 'Tingnan lahat ({n})',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.intro': 'Welcome dinner, unang araw, exam, lakad — may countdown at add-to-calendar.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.firstDay': 'Unang araw ng residency',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.tomorrow': 'Bukas',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.yesterday': 'Kahapon',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.ago': '{n} araw na ang nakalipas',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.next': 'Susunod na event',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.none': 'Wala pang paparating na event. Magdagdag sa ibaba.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.allCal': 'Idagdag lahat ng paparating sa calendar',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.past': 'Mga nakaraang event',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.shareHint': 'Ibinabahagi ang mga event sa department sa pamamagitan ng Cloud sync.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.add': 'Magdagdag ng event',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.edit': 'I-edit ang event',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.title': 'Ano',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.titlePh': 'Welcome dinner',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.date': 'Petsa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.time': 'Oras (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.place': 'Saan (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.note': 'Tala (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.save': 'I-save ang event',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.cancel': 'Kanselahin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.editBtn': 'I-edit',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.need': 'Maglagay ng pamagat at petsa.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.saved': 'Na-save ang event.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.confirmDel': 'Alisin ang “{title}”?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.ev.imported': '{n} event ang naidagdag o na-update.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.intro': 'Bumunot ng pangalan para sa exchange gift. Bawat isa ay may isang ka-department na reregaluhan — hindi ang sarili — at ipapadala mo nang pribado ang match ng bawat isa.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.notEnough': 'Kailangan ng 3 card man lang sa phone na ito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.who': 'Sino ang sasali?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.budget': 'Budget (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.date': 'Petsa ng exchange (opsyonal)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.addEvent': 'Idagdag ang petsa ng exchange sa Department events',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.warn': 'Kasali ka rin? Huwag sumilip — i-tap lang ang Send para sa bawat isa. O ipaubaya ang draw sa hindi kasali.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.draw': 'Bumunot',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.need3': 'Pumili ng 3 tao man lang.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.drawn': '{n} tao ang nabunot noong {date}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.budgetIs': 'Budget: {budget}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.howSend': 'I-tap ang Send para buksan ang share sheet na may match ng taong iyon (at wishlist), saka ipadala sa kanya lang.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.hidden': 'nakatago ang match',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.sent': 'naipadala ✓',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.send': 'Ipadala',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.peek': 'Silipin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.hide': 'Itago',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.redraw': 'Bumunot ulit',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.clear': 'Burahin ang draw',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.redrawConfirm': 'Magsimula ulit sa bagong draw? Mawawala ang kasalukuyang mga match.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.clearConfirm': 'Burahin ang draw? Mawawala ang mga match.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.sentTo': 'Naipadala kay {name}.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.copied': 'Nakopya ang match ni {name} — i-paste sa pribadong chat ninyo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.evTitle': 'Kris Kringle exchange',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.msg': 'Hi {giver}! 🎁 Ang Kris Kringle mo para sa {batch} ay si {receiver}.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.msgBudget': 'Budget: {budget}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.msgDate': 'Exchange: {date}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.msgWish': 'Wishlist niya:',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.mm.msgSecret': 'Sikreto lang! 🤫',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.started': 'Nagsimula na',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.started.how': 'I-save ang sarili mong card.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.openbook': 'Bukas na libro',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.openbook.how': 'Punan ang kalahati ng card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.wholestory': 'Buong kuwento',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.wholestory.how': 'Punan ang 80% ng card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.curator': 'Curator',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.curator.how': 'Punan ang 3 link list sa card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.polyglot': 'Polyglot',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.polyglot.how': 'Magdagdag ng mga salitang ituturo sa department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.collector5': 'Kolektor',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.collector5.how': 'Magkaroon ng 5 card ng ka-department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.collector10': 'Malaking kolektor',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.collector10.how': 'Magkaroon ng 10 card ng ka-department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.collector20': 'Buong department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.collector20.how': 'Magkaroon ng 20 card ng ka-department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.meteveryone': 'Nakilala lahat',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.meteveryone.how': 'Buksan ang card ng bawat ka-department (5 man lang).',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.perfectguess': 'Perpektong round',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.perfectguess.how': 'Makakuha ng 10 sa 10 sa Guess who.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.streak10': 'Tuloy-tuloy',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.streak10.how': 'Makahula ng 10 nang sunod-sunod sa Guess who.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.whosaid': 'Mind reader',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.whosaid.how': 'Tamaan lahat sa isang round ng Sino ang nagsabi? (4 pataas).',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.bingo': 'Bingo!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.bingo.how': 'Makabuo ng linya sa Department Bingo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.wrapped': 'Wrapped up',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.wrapped.how': 'Panoorin ang Department Wrapped hanggang huling slide.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.icebreaker': 'Icebreaker',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.icebreaker.how': 'Dumaan sa 10 icebreaker.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.greeter': 'Tagabati',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.greeter.how': 'Batiin ang ka-department sa kaarawan niya.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.shoutout': 'Cheerleader',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.shoutout.how': 'Magpadala ng shoutout.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.planner': 'Planner',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.planner.how': 'Magdagdag ng department event.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.monito': 'Katulong ni Santa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.monito.how': 'Magpatakbo ng Kris Kringle draw.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pl.hint': 'Hanggang {n} playlist. I-paste ang Spotify share link at pangalanan ito.',
    'bt.pl.label': 'Pangalan ng playlist',
    'bt.pl.url': 'Spotify link',
    'bt.pl.add': 'Magdagdag ng playlist',
    'bt.pl.badUrl': 'Dapat magsimula ang playlist link sa https://open.spotify.com/ o https://spotify.link/',
    'bt.pl.open': 'Buksan sa Spotify',
    'bt.zodiac': 'Zodiac',
    'bt.zodiac.cn': 'Chinese zodiac',
    'bt.link.open': 'Buksan',
    'bt.f.weekend': 'Karaniwang weekend',
    'bt.f.guiltyPleasure': 'Guilty pleasure',
    'bt.f.petPeeve': 'Pet peeve',
    'bt.f.comfortShow': 'Comfort show kapag malungkot',
    'bt.f.lastBinge': 'Huling binge-watch',
    'bt.f.currentlyReading': 'Binabasa / pinakikinggan ngayon',
    'bt.f.nonNegotiable': 'Araw-araw na hindi puwedeng laktawan',
    'bt.f.alwaysInBag': 'Laging nasa bag mo',
    'bt.f.childhoodDream': 'Pangarap na trabaho noong bata',
    'bt.f.childhoodNickname': 'Palayaw noong bata',
    'bt.f.firstConcert': 'Unang concert / unang fandom',
    'bt.f.childhoodGame': 'Paboritong laro noong bata',
    'bt.f.undergrad': 'Paaralan at kurso sa undergrad',
    'bt.f.siblings': 'Mga kapatid (ilan, pang-ilan ka)',
    'bt.f.hometownTradition': 'Paboritong pista o tradisyon sa bayan',
    'bt.f.roleModel': 'Huwaran / taong hinahangaan',
    'bt.f.motto': 'Motto sa buhay sa isang linya',
    'bt.f.advocacy': 'Charity o adbokasiyang mahalaga sa iyo',
    'bt.f.recharge': 'Pampabalik ng lakas pagkatapos ng mahirap na duty',
    'bt.f.proudest': 'Pinakaipinagmamalaking sandali',
    'bt.f.grateful': 'Pinasasalamatan mo ngayong taon',
    'bt.f.whyProgram': 'Bakit ang programang ito / bakit Mariveles',
    'bt.f.tenYears': 'Saan mo gustong makarating sa loob ng 10 taon',
    'bt.f.subspecialty': 'Subspecialty na kinaiinteresan',
    'bt.f.studyTip': 'Pinakamagandang study tip mo',
    'bt.f.skillToLearn': 'Kasanayang gustong matutunan sa residency',
    'bt.f.askMeFor': 'Laging puwedeng humingi ng tulong sa iyo sa…',
    'bt.f.hotTake': 'Hot take (pagkain o pop culture)',
    'bt.f.ifNotDoctor': 'Kung hindi ka doktor, ikaw ay…',
    'bt.f.lastPhoto': 'Huling litrato sa camera roll (ilarawan)',
    'bt.f.lookalike': 'Celebrity na sinasabing kamukha mo',
    'bt.f.duetSong': 'Naghahanap ng karaoke duet partner para sa…',
    'bt.f.viber': 'Numero sa Viber (kung iba)',
    'bt.f.telegram': 'Telegram / WhatsApp',
    'bt.f.email2': 'Pangalawang email (school / personal)',
    'bt.f.youtube': 'YouTube channel',
    'bt.f.discord': 'Discord',
    'bt.f.gcash': 'Numero sa GCash / Maya (para sa hatian ng gastos ng department)',
    'bt.f.staying': 'Nakatira sa boarding house / dorm, o galing sa bahay',
    'bt.f.landmark': 'Pinakamalapit na landmark sa tinutuluyan mo (para sa sundo)',
    'bt.f.birthdayPref': 'Gusto sa pagdiriwang ng kaarawan (puwede ang surprise? anong cake?)',
    'bt.f.scrubSize': 'Sukat ng scrub',
    'bt.f.shoeSize': 'Sukat ng sapatos',
    'bt.f.dutyConditions': 'Mga kondisyong dapat malaman habang naka-duty (opsyonal)',
    'bt.f.emergencyNumber': 'Numero ng emergency contact',
    'bt.f.emergencyRelation': 'Relasyon sa emergency contact',
    'nav.emergency': "Emergency info",  // Tagalog draft — Dr. Navarro reviews before release
    'nav.emergencyShort': "Emergency",  // Tagalog draft — Dr. Navarro reviews before release
    'nav.partners': "Mga jowa/asawa",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.intro': "Ang mga jowa at asawa ng department. May buong card sila, pero wala sa mga laro, stats at department grid.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.how': "Paano magdagdag ng jowa/asawa",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.howText': 'I-install ng partner mo ang Psych Tickler sa sarili niyang phone at mag-sign in sa Cloud sync gamit ang parehong join code; aaprubahan siya ng admin. Saka niya punan ang My card, piliin ang “Partner ako” at piliin ka.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.none': "Wala pang card ng partner.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.of': "Partner ni {name}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.ofLead': "Partner ni",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.section': "Jowa / Asawa",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.role': "Kanino ang card na ito?",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.roleRes': "Residente o consultant ako sa department",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.rolePt': "Partner (jowa/asawa) ako ng isang residente",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.pick': "Ang partner ko ay si",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.pickNone': "— wala pa sa phone na ito —",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.name': "O i-type ang buong pangalan niya",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.nameOnly': "Buong pangalan ng partner mo",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.hint': "Lumalabas ang card ng partner sa page ng residente niya, sa Birthdays at sa screen na Mga jowa/asawa — hindi sa mga laro, stats o department grid.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.needWho': "Piliin ang partner mo, o i-type ang pangalan niya.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.count1': "1 card ng partner",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.countN': "{n} card ng partner",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pt.tag': "Partner",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.g.emergency': "Emergency at medikal",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.f.emergencyRelation2': "Relasyon sa pangalawang emergency contact",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.f.emergencyNote': 'Makikita sa Emergency info ng mga ka-department mo kung titikan mo lang ang Emergency & medical sa Cloud sync. Hindi kailanman sa printed sheet o name tag.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.intro': "Blood type, allergy, kondisyon at emergency contact ng buong department sa iisang lugar. Gumagana kahit offline.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.note': 'Mula sa mga card na piniling ibahagi ng mga ka-department sa pamamagitan ng Cloud sync. Sa tunay na emergency, tumawag muna ng tulong.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.call911': "Tumawag sa 911",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.filter': "Hanapin ang ka-department",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.yours': "Ikaw",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.add': "Ilagay ang emergency info mo",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.addText': "Wala pang blood type, allergy o emergency contact sa card mo. Isang minuto lang, at makakatulong ito para matulungan ka ng department.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.edit': "I-edit ang emergency info ko",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.blood': "Blood type",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.allergies': "Allergy",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.noAllergy': "Walang nakalista",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.conditions': "Mga kondisyon",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.own': "Sariling numero",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.contact': "Emergency contact",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.missing': "Wala pang emergency info",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.missingText': 'Pakiusapan silang punan ang Emergency at medikal sa card nila at tikan ito sa Cloud sync.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.none': 'Wala pang card. Ilagay ang sa iyo, saka tingnan ang Cloud sync para sa mga card ng ka-department mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.noMatch': "Walang tumugma.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.homeS1': "1 ka-department · blood type, allergy, emergency contact",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.homeSN': "{n} ka-department · blood type, allergy, emergency contact",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.homeAdd': "Ilagay ang sa iyo",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.em.all': "Buong department",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.f.emergencyContact2': 'Pangalawang emergency contact',
    'bt.f.emergencyNumber2': 'Numero ng pangalawang emergency contact',
    'bt.f.prcExpiry': 'Pag-expire ng PRC license (buwan)',
    'bt.f.licenceExpiry': 'Pag-expire ng driver’s license (buwan)',
    'bt.f.passportExpiry': 'Bisa ng pasaporte hanggang (buwan)',
    'bt.h.prcExpiry': 'Buwan lang — para maalala natin kung kailan mag-renew. Walang numero, please.',
    'bt.h.licenceExpiry': 'Buwan lang — para maalala natin kung kailan mag-renew. Walang numero, please.',
    'bt.h.passportExpiry': 'Buwan lang — para maalala natin kung kailan mag-renew (at kung kailan magplano ng department trip). Walang numero, please.',
    'bt.h.dutyConditions': 'Ipinapadala lang sa mga miyembro ng department kung titikan mo ang Emergency & medical sa Cloud sync; hindi kailanman sa print.',
    'bt.h.gcash': 'Hindi kailanman sa print; ipinapadala lang sa mga miyembro ng department kung titikan mo ang Contact sa Cloud sync.',
    'bt.s.screen': 'Sa screen',
    'bt.s.play': 'Mga laro at fandom',
    'bt.s.words': 'Musika at salita',
    'bt.s.food': 'Pagkain at inumin',
    'bt.s.little': 'Maliliit na bagay',
    'bt.s.medschool': 'Med school',
    'bt.s.everyday': 'Araw-araw',
    'bt.s.growingup': 'Paglaki',
    'bt.s.you': 'Tungkol sa iyo',
    'bt.s.horizons': 'Mga pangarap',
    'bt.s.residency': 'Residency',
    'bt.s.fun': 'Para sa saya',
    'bt.me.yearRequired': 'Ilagay rin ang taon ng kapanganakan mo.',
    'bt.print.modeFull': 'Buong direktoryo',
    'bt.print.fullHint': 'Lahat ng nasa bawat card, kasama ang kontak at praktikal na detalye, sa kahit ilang pahina. Ituring na personal ang printout.',
    'bt.print.fullTitle': 'Direktoryo ng department (buo)',
    'bt.print.custom': 'Iba pa',
    'bt.print.photoNone': 'walang larawan',
    'bt.f.contactNote': 'Ang mga field na may markang “sa app lang” (kontak, allergy, emergency contact, socials) ay hindi kailanman lumalabas sa printed sheet o name tag.',
    'bt.bd.intro': 'Mga kaarawan ayon sa buwan, simula ngayon. Maglagay ng taon sa card at ipapakita rin ang edad.',
    'bt.bd.today': 'Ngayon',
    'bt.bd.thisMonth': 'Ngayong buwan',
    'bt.bd.upcoming': 'Paparating',
    'bt.bd.none': 'Wala pang nakalagay na kaarawan. Idinadagdag ito ng bawat residente sa Card ko.',
    'bt.bd.noDate': 'Walang ibinigay na kaarawan',
    'bt.share.shared': 'Handa nang ipadala — pumili ng chat o i-save sa Files.',
    'bt.share.cancelled': 'Kinansela ang pagbabahagi.',
    'bt.print.intro': 'Department sheet: compact na “meet the department” na pahina na walang contact details. Mga name tag: walo bawat pahina. Buong direktoryo: lahat, sa kahit ilang pahina. Gamitin ang Print ng browser (o Share → Print sa iPhone) para i-print o i-save bilang PDF.',
    'bt.print.btn': 'I-print',
    'bt.print.title': 'Kilalanin ang department',
    'bt.print.subtitle': '{program} · {hospital}',
    'bt.print.empty': 'Wala pang maipi-print.',
    'bt.pdf.btn': 'Gumawa ng PDF',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pdf.intro': 'Gumawa ng PDF sa phone na ito, tapos i-save sa Files, ipadala, o i-print. Nandiyan ang Print bilang backup. Department sheet: compact na “meet the department” na pahina. Mga name tag: walo bawat pahina. Buong direktoryo: lahat maliban sa emergency at medical info. Kalendaryo ng kaarawan: isang pahina bawat buwan.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pdf.making': 'Ginagawa ang PDF mo…',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pdf.done': 'Handa na ang PDF.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pdf.fail': 'Hindi nagawa ang PDF. Subukan ang Print.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.pdf.noEm': 'Hindi kailanman isinasama sa PDF ang emergency at medical info.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.modeCal': 'Kalendaryo ng kaarawan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.calTitle': 'Kalendaryo ng kaarawan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.calHint': 'Isang pahina bawat buwan para sa susunod na 12 buwan, kasama ang mga partner.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.facts': 'Ano ang nasa bawat card',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.factsHint': 'Pumili ng hanggang 8 detalye para sa department sheet. Laging ipinapakita ang kaarawan.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.factsMax': 'Hanggang 8 lang ang mapipili.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.reset': 'Ibalik sa mungkahi',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.sort': 'Ayos',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.sortName': 'Ayon sa pangalan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.sortBday': 'Ayon sa kaarawan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.print.page': 'Pahina {n} ng {total}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.guess.intro': 'Mabilis na laro: basahin ang clue, piliin ang ka-department. Kailangan ng apat na card man lang na may ganoong detalye.',
    'bt.guess.notEnough': 'Kulang pa ang mga card. Kapag apat na ka-department na ang nagpuno ng bayan, libangan o paborito nila, bubukas ang laro.',
    'bt.guess.whose': 'Kanino ang {field} na ito?',
    'bt.guess.right': 'Tama!',
    'bt.guess.wrong': 'Hindi — si {name} iyon.',
    'bt.guess.next': 'Susunod na clue',
    'bt.guess.score': 'Iskor {right} sa {total}',
    'bt.guess.open': 'Buksan ang card niya',
    'skip': 'Lumaktaw sa nilalaman',
    'menu.open': 'Buksan ang menu',
    'menu.close': 'Isara ang menu',
    'menu.title': 'Menu',
    'menu.main': 'Pangunahing menu',
    'sidebar.hide': 'Itago ang sidebar',
    'sidebar.show': 'Ipakita ang sidebar',
    'hist.group': 'Kasaysayan ng mga pahina',
    'hist.back': 'Bumalik',
    'hist.backTitle': 'Bumalik (Alt+Left)',
    'hist.fwd': 'Susunod',
    'hist.fwdTitle': 'Susunod (Alt+Right)',
    'brand.home': '{name}, pangunahing pahina',
    'search.label': 'Maghanap sa buong app',
    'search.placeholder': 'Maghanap sa app na ito',
    'search.title': 'Paghahanap',
    'search.noMatches': 'Walang nakita para sa “{q}”',
    'search.seeAll1': 'Tingnan ang lahat ng {n} resulta',
    'search.seeAllN': 'Tingnan ang lahat ng {n} resulta',
    'search.count1': '{n} resulta para sa “{q}”',
    'search.countN': '{n} resulta para sa “{q}”',
    'search.prompt': 'Mag-type sa search box sa itaas.',
    'search.filterBy': 'I-filter ayon sa uri',
    'search.all': 'Lahat',
    'search.noneTitle': 'Walang nakita',
    'search.noneText': 'Subukan ang ibang salita, o suriin ang baybay.',
    'search.newsText': 'Mga bagong feature, nilalaman at pagwawasto, mula sa pinakabago.',
    'search.aboutText': 'Tungkol sa app na ito, mga keyboard shortcut, wika, laki ng teksto, tema at backup.',
    'textsize.title': 'Laki ng teksto',
    'textsize.smaller': 'Mas maliit',
    'textsize.default': 'Karaniwan',
    'textsize.larger': 'Mas malaki',
    'textsize.largest': 'Pinakamalaki',
    'theme.title': 'Tema',
    'theme.label': 'Tema: {name}',
    'theme.auto': 'Ayon sa device',
    'theme.light': 'Maliwanag',
    'theme.dark': 'Madilim',
    'nav.start': 'Simula',
    'nav.screens': 'Mga screen',
    'nav.app': 'App',
    'nav.otherApps': 'Iba pang app',
    'nav.newTab': '(bubukas sa bagong tab)',
    'nav.home': 'Home',
    'nav.whatsNew': 'Ano ang bago',
    'nav.about': 'Tungkol dito',
    'nav.quick': 'Mabilis na nabigasyon',
    'home.explore': 'Galugarin',
    'home.emptyTitle': 'Wala pa rito',
    'home.emptyText': 'Magdagdag ng screen sa NAV at VIEWS sa js/app.js at lalabas ito rito.',
    'home.latest': '{title} · bersyon {version}',
    'news.intro1': 'Mga bagong feature, nilalaman at pagwawasto, mula sa pinakabago. Ang mga may markang ',
    'news.new': 'Bago',
    'news.intro2': ' ay idinagdag mula noong huli mong bisita.',
    'news.version': 'Bersyon {v}',
    'news.open': 'Buksan',
    'news.type.feature': 'Bagong feature',
    'news.type.update': 'Update',
    'news.type.correction': 'Pagwawasto',
    'news.type.content': 'Nilalaman',
    'news.note': 'May mungkahi o pagwawasto? Mag-email sa ',
    'about.title': 'Tungkol dito',
    'about.version': 'bersyon',
    'about.settings': 'Mga setting',
    'about.language': 'Wika',
    'about.langEn': 'English',
    'about.langTl': 'Tagalog',
    'about.tips': 'Mga tip',
    'about.tip1': 'Pindutin ang [[/]] para maghanap mula saanman.',
    'about.tip2': 'Pabalik at pasulong: gamitin ang mga arrow button sa itaas, o [[Alt]]+[[Left]] at [[Alt]]+[[Right]].',
    'about.tip3': 'Paliitin o palakihin ang teksto gamit ang **Aa** button. Ang button na araw/buwan ay nagpapalit sa pagitan ng ayon sa device, maliwanag at madilim.',
    'about.tip4': 'Gamitin ang **I-export ang backup** sa ibaba para i-save ang laman ng app na ito sa device mo, at ang **I-import ang backup** para ibalik ito sa iba.',
    'about.tip5': 'I-install ito: piliin ang **Add to Home Screen** (iPhone Safari) o **Install app** (Android Chrome).',
    'notfound.title': 'Hindi mahanap ang pahina',
    'notfound.text': 'Walang ganyang pahina sa app na ito.',
    'notfound.home': 'Bumalik sa simula',
    'backup.title': 'I-back up ang iyong data',
    'backup.text': 'Ang lahat ng sine-save ng app na ito ay nasa browser na ito lang. Mag-export ng backup file para ligtas ito, tapos i-import ito sa ibang telepono, tablet o computer para magpatuloy kung saan ka tumigil.',
    'backup.export': 'I-export ang backup',
    'backup.import': 'I-import ang backup',
    'backup.undo': 'I-undo ang huling import',
    'backup.item1': '{n} na-save na item',
    'backup.itemN': '{n} na-save na item',
    'backup.nothing': 'wala pang na-save',
    'backup.onDevice': 'Sa device na ito: {summary}.',
    'backup.lastExported': 'Huling na-export noong {date}.',
    'backup.notExported': 'Hindi pa na-export.',
    'backup.shareTitle': 'Backup ng {app}',
    'backup.shared': 'Handa na ang backup: i-save ito sa lugar na maaabot mo mula sa ibang device.',
    'backup.exportCancelled': 'Kinansela ang pag-export.',
    'backup.saved': 'Na-save ang {name}. Ilipat ito sa ibang device at piliin doon ang I-import ang backup.',
    'backup.notBackup': 'Hindi ito backup file ng {app}.',
    'backup.unreadable': 'Hindi mabasa ang file na iyon.',
    'backup.unknownDate': 'hindi alam na petsa',
    'backup.confirmImport': 'I-import ang backup mula {date}?\n\nBackup: {backup}.\nSa device na ito ngayon: {device}.\n\nMapapalitan ang data sa device na ito. Maaari mo itong i-undo mula sa ibaba ng pahina.',
    'backup.importCancelled': 'Kinansela ang pag-import.',
    'backup.importFailed': 'Hindi nagtagumpay ang pag-import: hindi na-save ng browser na ito ang data.',
    'backup.imported': 'Na-import na ang backup. Nagre-reload…',
    'backup.confirmUndo': 'Ibalik ang data na nasa device na ito bago ang huling import ({summary})?',
    'backup.undoFailed': 'Hindi nagtagumpay ang pag-undo.',
    'backup.restored': 'Naibalik na ang dating data. Nagre-reload…',
    // 1.15.0
    'nav.truths': 'Two truths and a lie',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.quiz': 'How well do you know…?',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.baby': 'Hulaan ang baby photo',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.tot': 'This or that',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.sup': 'Department superlatives',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.qotw': 'Tanong ng linggo',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.capsule': 'Time capsule',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.eat': 'Saan tayo kakain?',  // Tagalog draft — Dr. Navarro reviews before release
    'nav.anthem': 'Department anthem',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.fun.needCard': 'Gawin muna ang card mo para sumama ang mga sagot mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.fun.more': 'Higit pa sa card mo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.fun.moreHint': 'May sarili silang screen at sumasama sa card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.common.tot': 'Parehong pick sa This or that: {value}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.res.text': '{game} — {right}/{n} · {batch}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.res.bingo': 'Department Bingo! · {batch} · {n} squares',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.res.share': 'I-share ang result',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.res.copied': 'Na-copy ang result — i-paste sa group chat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.intro': 'Bawat isa ay magsusulat ng dalawang totoo at isang kasinungalingan. Kaya mo bang hulaan ang lie?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.mine': 'Ang two truths and a lie mo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.mineHint': 'Sumulat ng tatlong maikling statement tungkol sa sarili mo — dalawang totoo, isang hindi — tapos markahan ang lie. Sasama ito sa card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.stmt': 'Statement {n}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.isLie': 'Ito ang lie',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.need3': 'Punan ang lahat ng tatlong statement.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.needLie': 'Markahan kung alin ang lie.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.saved': 'Na-save. Makakarating ang card mo sa department para makapaglaro sila.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.none': 'Wala pang nagdagdag ng sa kanila. Kapag nagdagdag na ang mga ka-department mo at na-sync na ang mga card nila, makakapaglaro ka na dito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tt.ask': 'Alin ang lie?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.intro': 'Mabilis na quiz mula sa card ng isang ka-department. Tapos ipadala sa kanila ang score mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.title': 'Gaano mo kakilala si {name}?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.none': 'Kailangan ng mga ka-department na mas kumpleto ang card — hintayin munang ma-sync ang iba pang card.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.few': 'Kulang pa ang sagot sa card nila para sa quiz.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.nq': '{n} tanong',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.best': 'best mo: {right}/{n}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.qField': '{field} — alin ang sagot ni {name}?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.qMonth': 'Anong buwan ang birthday ni {name}?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.qTot': 'This or that: ano ang pinili ni {name}?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.qLie': 'Alin ang lie ni {name}?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.v0': 'Oras na para sa kwentuhan!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.v1': 'Not bad — malapit ka na.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.v2': 'Kilalang-kilala mo sila!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.v3': 'Perfect! Certified best friend.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.quiz.other': 'Ibang ka-department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.baby.intro': 'Ipares ang bawat baby photo sa ka-department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.baby.mine': 'Baby photo mo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.baby.hint': 'Optional. Childhood photo mo. Sumasama ito sa card mo papunta sa mga miyembro ng department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.baby.saved': 'Na-save ang baby photo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.baby.none': 'Kailangan ng hindi bababa sa 2 mga ka-department na may baby photo (at 4 na cards). Sabihan ang department na magdagdag!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.baby.ask': 'Sino ang baby na ito?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.intro': 'Mabilis na picks — tapos tingnan kung paano nahati ang department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.mine': 'Mga pick ko',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.split': 'Hati ng department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.or': 'o',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.progress': '{n} sa {total} ang nasagot. I-tap ulit para burahin ang pick.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.twins': 'Pinakakapareho mo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.same': 'parehong pick sa {same} sa {both}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tot.none': 'Wala pang picks. Sagutan ang sa iyo at i-save ang card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.intro': 'Awards na parang yearbook. Bumoto ng ka-department sa bawat isa; bibilangin ng results ang votes sa lahat ng cards sa phone na ito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.vote': 'Mga boto ko',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.results': 'Results',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.pick': '— pumili —',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.progress': '{n} sa {total} ang nabotohan.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.noOthers': 'Wala pang card ng mga ka-department mo kaya wala pang mabotohan. Tingnan ang Cloud sync.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.note': 'Sumasama ang votes mo sa card mo, kaya makikita ng mga ka-department ang totals pagka-sync nito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.votes1': '1 boto',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.votesN': '{n} boto',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.also': 'Binoto rin:',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sup.none': 'Wala pang boto.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.intro': 'Isang bagong tanong tuwing Lunes. Sagutin ito, i-save ang card mo, at basahin ang sagot ng lahat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.thisWeek': 'Ngayong linggo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.yours': 'Ikaw:',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.ph': 'Sagot mo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.post': 'I-post',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.posted': 'Na-save ang sagot. Sasama ito sa card mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.first': 'Wala pang sagot mula sa department — ikaw na ang mauna.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.noneYet': 'Wala pang sagot.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.more': '+{n} pa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.all': 'Lahat ng linggo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.qotw.past': 'Mga nakaraang linggo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.h': 'Birthday wall',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.about': 'Mga mensahe para sa birthday ni {name} ({date}). Makikita niya ito sa mismong araw.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.none': 'Wala pang mensahe — ikaw ang mauna.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.noneYou': 'Wala pang birthday messages.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.wait1': 'May 1 mensaheng naghihintay sa birthday mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.waitN': 'May {n} mensaheng naghihintay sa birthday mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.label': 'Birthday message para kay {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.ph': 'Happy birthday! …',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.hint': 'Sasama ito sa card mo. Makikita ito ni {name} sa birthday niya pagka-sync nito.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.post': 'Idagdag sa wall',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.posted': 'Naidagdag sa birthday wall.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.home1': '1 mensahe sa birthday wall',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.homeN': '{n} mensahe sa birthday wall',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.bw.read': 'Basahin ang wall',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.intro': 'Sumulat ng sulat na mananatiling sealed hanggang sa petsang pipiliin mo — para sa future you, o sa buong department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.write': 'Sumulat ng sulat',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.to': 'Para kay',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.toSelfL': 'Future me (mananatili sa phone na ito)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.toBatchL': 'Sa department (sasama sa card mo, hanggang 5)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.letter': 'Sulat',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.ph': 'Dear future me…',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.openOn': 'Bubuksan sa',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.seal': 'I-seal',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.sealed': 'Naka-seal na. 🔒',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.note': 'Ang sealed ay nakatago lang sa app na ito, hindi encrypted — mababasa pa rin ng sinumang may access sa na-sync mong card ang sulat para sa department.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.needText': 'Sumulat muna ng kahit ano.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.needDate': 'Pumili ng petsa ng pagbubukas pagkatapos ng ngayon.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.max': 'Hanggang 5 sulat lang para sa department. Magtanggal muna ng isa.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.none': 'Wala pang sulat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.toSelf': 'Para sa future you',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.fromYou': 'Mula sa iyo para sa department',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.from': 'Mula kay {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.opens': 'bubukas sa {date}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.opened': 'nabuksan noong {date}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.peek': 'Silip muna',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.peekConfirm': 'Buksan ang sulat na ito bago ang petsa nito?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.delConfirm': 'Tanggalin ang sulat na ito?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.cap.homeH': 'May time capsule na kakabukas lang',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tc.title': 'Trading card',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tc.intro': 'Ang card mo bilang picture — i-post sa group chat o sa story mo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tc.alt': 'Trading card ni {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tc.share': 'I-share o i-save ang image',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.tc.saved': 'Na-save ang larawan: {name}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.intro': 'Hindi makapagdesisyon? I-spin ang mga paboritong kainan ng lahat.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.none': 'Wala pang nagdagdag ng paboritong kainan (My card › Favourite food spots).',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.spin': 'Spin!',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.again': 'Spin ulit',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.count': '{n} lugar sa pool',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.from': 'Mula sa mga paborito nina {names}',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.maps': 'Buksan sa Maps',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.share': 'Ipadala sa group',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.msg': 'Tara, kain tayo sa {place}! 🍽️',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.who': 'Sinong sasama?',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.eat.list': 'Lahat ng kainan',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.intro': 'Bawat isa ay pipili ng isang kantang nagpapakita kung sino sila. Pagsama-samahin, ito na ang department anthem.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.mine': 'Kanta mo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.song': 'Kanta (title — artist)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.songPh': 'hal. Tadhana — Up Dharma Down',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.url': 'Link (optional)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.hint': 'Link mula sa Spotify, YouTube o Apple Music.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.needTitle': 'Ilagay ang title ng kanta.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.badUrl': 'Hindi galing sa Spotify, YouTube o Apple Music ang link na iyan.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.saved': 'Na-save ang kanta.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.none': 'Wala pang kanta.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.play': 'Play',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.find': 'Hanapin',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.k': 'Anthem',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.an.homeH': 'Department anthem ng linggo',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.liedetector': 'Lie detector',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.liedetector.how': 'Makahuli ng 5 lies sa Two truths and a lie.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.quizmaster': 'Best friend material',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.quizmaster.how': 'Tamang lahat ng sagot sa isang How well do you know…? quiz.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.babyface': 'Baby whisperer',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.babyface.how': 'Mahulaan lahat ng baby photo sa isang round (3 o higit pa).',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.pollster': 'Decisive',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.pollster.how': 'Sagutin lahat ng This or that.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.voter': 'Botante',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.voter.how': 'Bumoto sa bawat department superlative.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.qotw': 'Weekly regular',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.qotw.how': 'Sumagot sa isang Tanong ng linggo.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.timekeeper': 'Time traveller',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.timekeeper.how': 'Mag-seal ng time capsule letter.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.dj': 'Department DJ',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.dj.how': 'Idagdag ang kanta mo sa department anthem.',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.foodie': 'Food tripper',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.foodie.how': 'Mag-spin sa Saan tayo kakain?',  // Tagalog draft — Dr. Navarro reviews before release
    // 1.18.0 Cloud sync — Tagalog draft — Dr. Navarro reviews before release
    'nav.sync': 'Cloud sync',
    'bt.sync.intro': 'Dumadating ang card mo sa bawat aprubadong ka-department sa pamamagitan ng cloud, at dumadating din sa iyo ang sa kanila. Wala nang palitan ng file o QR code.',
    'bt.sync.loading': 'Kumokonekta sa cloud…',
    'bt.sync.retry': 'Subukan ulit',
    'bt.sync.step1': 'Mag-sign in',
    'bt.sync.signInText': 'Mag-sign in gamit ang Google account mo. Ginagamit lang ito para tiyaking kabilang ka sa department; hindi kailanman nakikita ng Psych Tickler ang password mo.',
    'bt.sync.signIn': 'Mag-sign in gamit ang Google',
    'bt.sync.signingIn': 'Binubuksan ang Google sign-in…',
    'bt.sync.signedInAs': 'Naka-sign in bilang {email}',
    'bt.sync.signOut': 'Mag-sign out',
    'bt.sync.confirmOut': 'Mag-sign out sa cloud sa phone na ito? Mananatili ang mga card na nandito na; hihinto lang silang mag-update hangga’t hindi ka ulit nagsa-sign in.',
    'bt.sync.joinH': 'Sumali sa department mo',
    'bt.sync.joinText': 'I-type ang join code na galing sa admin. Aaprubahan ka ng admin, at saka darating ang mga card.',
    'bt.sync.code': 'Join code',
    'bt.sync.join': 'Humiling na sumali',
    'bt.sync.badCode': 'Parang masyadong maikli ang code na iyan. Suriin at subukan ulit.',
    'bt.sync.checking': 'Sinusuri ang code…',
    'bt.sync.noBatch': 'Walang department space na may ganyang code. Itanong sa admin.',
    'bt.sync.createH': 'Gumawa ng department space (admin)',
    'bt.sync.createText': 'Gagawa ng bagong department space at join code nito. Ibigay ang code sa mga ka-department mo, tapos aprubahan dito ang bawat request.',
    'bt.sync.create': 'Gumawa ng department space',
    'bt.sync.existing': 'O buksan ang department space na nagawa mo na:',
    'bt.sync.pendingH': 'Naghihintay ng approval',
    'bt.sync.pendingText': 'Naipadala na ang request mong sumali sa {name}. Kapag inaprubahan ito ng admin, kusang darating dito ang mga card ng ka-department mo.',
    'bt.sync.checkAgain': 'Tingnan ulit',
    'bt.sync.stillPending': 'Hindi pa aprubado. Subukan ulit mamaya.',
    'bt.sync.cancelReq': 'Bawiin ang request',
    'bt.sync.approved': 'Kasama ka na! Kinukuha ang mga card ng department…',
    'bt.sync.removed': 'Hindi na miyembro ng department ang account na ito. Magtanong sa admin, o ilagay ulit ang code para humiling na sumali.',
    'bt.sync.batch': 'Department mo',
    'bt.sync.memberText': 'Miyembro ka na. Naipapadala ang card mo tuwing sine-save mo ito, at pumapasok ang mga bagong card tuwing bubuksan mo ang app.',
    'bt.sync.inviteCode': 'Join code:',
    'bt.sync.copy': 'Kopyahin',
    'bt.sync.copied': 'Nakopya na ang join code.',
    'bt.sync.now': 'I-sync ngayon',
    'bt.sync.busy': 'Nagsi-sync…',
    'bt.sync.last': 'Huling na-sync {when}',
    'bt.sync.never': 'Hindi pa na-sync',
    'bt.sync.result': 'Na-sync: {added} bago, {updated} na-update, {removed} inalis.',
    'bt.sync.upToDate': 'Updated na ang lahat.',
    'bt.sync.gotMe': 'Dumating ang card mo mula sa iba mong device.',
    'bt.sync.tb.off': 'Hindi pa naka-set up ang Cloud sync. I-tap para buksan.',
    'bt.sync.tb.pending': 'Cloud sync: hinihintay ang approval. I-tap para tingnan.',
    'bt.sync.tb.busy': 'Nagsi-sync…',
    'bt.sync.tb.err': 'Hindi natuloy ang sync. I-tap para subukan ulit.',
    'bt.sync.tb.ok': 'Na-sync {when}. I-tap para mag-sync ngayon.',
    'bt.sync.tb.okNever': 'Naka-on ang Cloud sync. I-tap para mag-sync ngayon.',
    'bt.sync.needCard': 'Punan ang My card para makuha rin ng mga ka-department mo ang sa iyo.',
    'bt.sync.consentH': 'Ano ang lumalabas sa phone mo',
    'bt.sync.consentText': 'Lahat ng nasa card mo ay ipinapadala sa mga miyembro ng department maliban sa dalawang grupo sa ibaba, na mananatili sa phone na ito hangga’t hindi mo tinitikan. Puwede mo silang alisan ng tick anumang oras.',
    'bt.sync.consent.emergency': 'Blood type, allergy, kondisyon, at emergency contacts. Lalabas sa Emergency info screen ng lahat.',
    'bt.sync.consent.contact': 'Mga numero, email, GCash, socials, tinutuluyan, at sizes mo.',
    'bt.sync.consentConfirm.emergency': 'Ibahagi ang Emergency & medical details mo sa mga miyembro ng department? Sensitibong personal na impormasyon ito; ang mga aprubadong miyembro lang ang makakakita, at puwede mong ihinto ang pagbabahagi anumang oras.',
    'bt.sync.consentConfirm.contact': 'Ibahagi ang Contact details mo (numero, email, GCash, socials) sa mga miyembro ng department? Ang mga aprubadong miyembro lang ang makakakita, at puwede mong ihinto ang pagbabahagi anumang oras.',
    'bt.sync.consentOn': 'Na-save. Ipinapadala ang card mo…',
    'bt.sync.consentOff': 'Na-save. Inalis na ang grupong iyon sa cloud copy ng card mo.',
    'bt.sync.adminH': 'Admin',
    'bt.sync.requests': 'Mga request na sumali',
    'bt.sync.noRequests': 'Walang naghihintay na request.',
    'bt.sync.approve': 'Aprubahan',
    'bt.sync.decline': 'Tanggihan',
    'bt.sync.approvedX': 'Naaprubahan na si {name}.',
    'bt.sync.confirmDecline': 'Tanggihan ang request ni {name}?',
    'bt.sync.members': 'Mga miyembro',
    'bt.sync.you': 'Ikaw',
    'bt.sync.remove': 'Alisin',
    'bt.sync.confirmRemove': 'Alisin si {name} sa department? Made-delete ang card niya sa cloud at mawawala sa phone ng lahat sa susunod na daily sync.',
    'bt.sync.reload': 'I-refresh ang mga listahan',
    'bt.sync.leaveH': 'Umalis sa department',
    'bt.sync.leaveText': 'Idi-delete ang card mo sa cloud at titigil ang pag-sync sa phone na ito. Mananatili ang mga card na nasa phone na ito.',
    'bt.sync.leave': 'Umalis sa department',
    'bt.sync.confirmLeave': 'Umalis sa department? Made-delete ang card mo sa cloud at maaalis ito sa phone ng mga ka-department mo sa susunod nilang daily sync.',
    'bt.sync.left': 'Umalis ka na sa department.',
    'bt.sync.privacyH': 'Privacy',
    'bt.sync.privacy1': 'Ang mga miyembro lang ng department na inaprubahan ng admin ang makakabasa ng mga card. Bawat isa ay makakapagbago lang ng sarili niyang card.',
    'bt.sync.privacy2': 'Naka-store ang mga card sa Google Firebase (Firestore) para sa app na ito lang. Walang ads at walang tracking.',
    'bt.sync.privacy3': 'Lumalabas lang sa phone mo ang Emergency & medical at Contact details kapag tinikan mo ang mga ito sa screen na ito.',
    'bt.sync.privacy4': 'Kapag umalis ka sa department, made-delete ang card mo sa cloud.',
    'bt.sync.errPerm': 'Tinanggihan ng cloud iyon. Baka hindi ka pa aprubado, o inalis ka na sa department.',
    'bt.sync.errNet': 'Hindi maabot ang cloud. Suriin ang internet connection mo at subukan ulit.',
    'bt.sync.errClosed': 'Nasarhan ang sign-in bago matapos.',
    'bt.sync.errSignedOut': 'Naka-sign out ka. Mag-sign in ulit sa Cloud sync.',
    'bt.sync.errOther': 'May nangyaring mali ({code}).',
    'bt.sync.homeH': 'Sumali sa department mo sa cloud',
    'bt.sync.home': 'Mag-sign in nang isang beses at kusang darating ang mga card ng lahat.',
    'bt.sync.homePendingH': 'Naghihintay ng approval',
    'bt.sync.homePending': 'Hindi pa inaaprubahan ng admin ang request mong sumali.',
    'bt.sync.tmdbH': 'Show info (TMDB key)',  // Tagalog draft — Dr. Navarro reviews before release
    'bt.sync.tmdbText': 'I-paste ang TMDB API key mo para magkaroon ng larawan at paglalarawan ang show of the day. Naka-save ito kasama ng department mo sa cloud, hindi sa pampublikong code ng app.',
    'bt.sync.tmdbSet': 'May naka-save nang key. Makukuha ito ng phones ng mga ka-department sa susunod nilang sync. Mag-paste ng bago para palitan.',
    'bt.sync.tmdbKey': 'TMDB API key',
    'bt.sync.tmdbSave': 'I-save ang key',
    'bt.sync.tmdbRemove': 'Alisin ang key',
    'bt.sync.tmdbConfirmRm': 'Alisin ang TMDB key? Babalik sa pamagat lang ang show of the day.',
    'bt.sync.tmdbBad': 'Mukhang hindi ito TMDB API key (32 na letra at numero).',
    'bt.sync.tmdbSaved': 'Na-save ang key. Mag-o-on ang show info sa susunod na sync ng bawat phone.',
    'bt.sync.tmdbRemoved': 'Inalis ang key.',
    // 1.19.0 — Tagalog draft — Dr. Navarro reviews before release
    'nav.pets': 'Mga alaga',
    'bt.pets.intro': 'Ang mga mabalahibo, may-balahibo at may-kaliskis na pamilya ng lahat — isang card kada alaga, may kasamang litrato.',
    'bt.pets.mine': 'Mga alaga ko',
    'bt.pets.noneMine': 'Wala ka pang naidagdag na alaga. Idagdag ang una mo sa ibaba.',
    'bt.pets.add': 'Magdagdag ng alaga',
    'bt.pets.addAnother': 'Magdagdag pa ng alaga',
    'bt.pets.edit': 'I-edit ang alaga',
    'bt.pets.editBtn': 'I-edit',
    'bt.pets.photo': 'Magdagdag ng litrato',
    'bt.pets.photoChange': 'Palitan ang litrato',
    'bt.pets.photoBusy': 'Inihahanda ang litrato…',
    'bt.pets.name': 'Pangalan',
    'bt.pets.kind': 'Uri',
    'bt.pets.breed': 'Lahi',
    'bt.pets.breedPh': 'Aspin, Shih Tzu, Puspin…',
    'bt.pets.note': 'Tungkol sa kanya',
    'bt.pets.notePh': 'Edad, paboritong treat, nakakatawang ugali…',
    'bt.pets.save': 'Idagdag ang alaga',
    'bt.pets.saveEdit': 'I-save ang mga pagbabago',
    'bt.pets.cancel': 'Kanselahin',
    'bt.pets.up': 'Iakyat',
    'bt.pets.remove': 'Alisin',
    'bt.pets.confirmRemove': 'Alisin si {name} sa card mo?',
    'bt.pets.needName': 'Bigyan muna ng pangalan ang alaga mo.',
    'bt.pets.saved': 'Nasa card mo na si {name}.',
    'bt.pets.max': 'Iyan na ang pinakamarami na kaya ng isang card ({n} alaga). Mag-alis muna ng isa para makapagdagdag.',
    'bt.pets.batchH': 'Mga alaga ng department',
    'bt.pets.none': 'Wala pang alaga ang mga ka-department mo.',
    'bt.pets.count1': '1 alaga pa lang.',
    'bt.pets.countN': '{n} alaga na sa ngayon.',
    'bt.pets.of': 'Alaga ni {name}',
    'bt.pets.personH': 'Mga alaga',
    'bt.pets.manage': 'I-edit ang mga alaga ko',
    'bt.pets.k.dog': 'Aso',
    'bt.pets.k.cat': 'Pusa',
    'bt.pets.k.bird': 'Ibon',
    'bt.pets.k.fish': 'Isda',
    'bt.pets.k.rabbit': 'Kuneho',
    'bt.pets.k.hamster': 'Hamster',
    'bt.pets.k.turtle': 'Pagong',
    'bt.pets.k.other': 'Iba pa',
    'bt.h.pets': 'Maikling buod lang ito. Idagdag ang bawat alaga kasama ang litrato sa Pets screen (Higit pa sa card mo › Mga alaga ko).',
    'bt.pl.embedTitle': 'Spotify player: {name}',
    'bt.tmdb.alt': 'Eksena mula sa {title}',
    'bt.tmdb.credit': 'Impormasyon at larawan mula sa',
    'bt.tmdb.notice': 'Ang mga paglalarawan at larawan ng palabas ay galing sa TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.',
    'nav.chat': "Chat",  // Tagalog draft — Dr. Navarro reviews before release
    'nav.chatShort': "Chat",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.intro': "Mga chat channel ng department. I-tap ang channel para magbasa at magsulat; kahit sino sa department puwedeng gumawa ng bago.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.joinH': "Sumali sa department para makapag-chat",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.joinText': "Gumagana ang chat sa pamamagitan ng Cloud sync. Mag-sign in at sumali sa department mo gamit ang code nito, tapos bumalik ka dito.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.joinBtn': "Buksan ang Cloud sync",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.loading': "Nilo-load…",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.channels': "Mga Channel",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.lastBy': "{name} · {when}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.empty': "Wala pang mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.unread': "May bagong mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.newH': "Gumawa ng bagong channel",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.newText': "Pumili ng maikling pangalan. Puwede mong palitan ang pangalan o i-delete ang mga channel na ginawa mo.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.emoji': "Emoji",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.chName': "Pangalan ng channel",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.create': "Gumawa ng channel",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.creating': "Ginagawa…",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.created': "Ready na ang {ch}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.needName': "Mag-type ng pangalan ng channel (letra o numero).",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.exists': "May channel nang may ganyang pangalan.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.reportsH': "Mga na-report na mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.noReports': "Walang na-report.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.reportedBy': "ni-report ni {name}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.open': "Buksan",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.dismiss': "I-dismiss",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.note': "Ang mga miyembro lang ng department mo ang nakakakita ng mga mensahe. Lumalabas ang mga bagong mensahe habang bukas ang channel; nare-refresh ang mga tuldok sa listahan ng channel kapag binuksan mo ang app o nag-sync ka. Wala pang phone notification.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.rename': "Palitan ang pangalan",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.renamePrompt': "Bagong pangalan ng channel na ito:",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.deleteCh': "I-delete ang channel",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.confirmDeleteCh': "I-delete ang {ch} at lahat ng mensahe dito, para sa lahat? Hindi na ito mababawi.",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.chDeleted': "Na-delete na ang {ch}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.older': "I-load ang mas lumang mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.first': "Wala pang mensahe. Mag-hi ka na!",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.newMsgs': "Mga bagong mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.addPhoto': "Mag-add ng photo",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.stickers': "Mga Sticker",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.message': "Mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.placeholder': "Mag-message sa {ch}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.send': "Ipadala",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.sending': "Ipinapadala…",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.shrinking': "Inihahanda ang photo…",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.photoBad': "Hindi magamit ang photo na iyon. Subukan ang iba (JPEG, PNG, WebP o maliit na GIF).",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.photoReady': "Ready na ang photo ({kb} KB)",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.removePhoto': "Alisin ang photo",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.photo': "Photo",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.sticker': "Sticker",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.someone': "Ka-department",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.actions': "Mga option sa mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.msgActions': "Mga option para sa mensahe ni {name}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.reactN': "{emoji} {n}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.reply': "Mag-reply",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.replyingTo': "Nagre-reply kay {name}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.cancelReply': "Kanselahin ang reply",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.copy': "I-copy ang text",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.copied': "Na-copy",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.deleteMsg': "I-delete ang mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.confirmDelete': "I-delete ang mensaheng ito para sa lahat?",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.deleted': "Na-delete ang mensahe",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.report': "I-report sa admin",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.confirmReport': "I-report ang mensaheng ito sa admin ng department?",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.reported': "Na-report na. Salamat!",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.close': "Isara",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.playHere': "I-play dito",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.player': "Player",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.today': "Ngayon",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.yesterday': "Kahapon",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.set.goose': "Goose",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.set.capybara': "Capybara",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.set.cat': "Pusa",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.chatter': "Chatterbox",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.badge.chatter.how': "Magpadala ng una mong chat message",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.homeH': "Department chat",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.homeLoading': "Binubuksan ang mga channel mo…",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.homeNew1': "May bagong mensahe sa {ch} mula kay {name}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.homeNewN': "May bagong mensahe sa {n} channel · pinakabago sa {ch}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.homeLatest': "Pinakabago: si {name} sa {ch} · {when}",  // Tagalog draft — Dr. Navarro reviews before release
    'bt.chat.homeQuiet': "Wala pang mensahe. Mag-hi sa #general!",  // Tagalog draft — Dr. Navarro reviews before release
  }
};
