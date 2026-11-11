/* Psych Tickler 1.21.0: built-in sticker packs for the chat (her Gemini sheets, cut on the dev-tools branch with
   tools/stickers/cut.py). Files: img/stickers/<set>/<set>-NN-<slug>.webp, 512×512 transparent.
   A chat message stores only "<set>/<NN>-<slug>"; never rename or renumber an item once released. */
window.STICKERS = (function () {
  var items = [
    ['01', 'congrats', 'Congrats!'], ['02', 'you-got-this', 'You got this!'], ['03', 'amazing', 'Amazing!'], ['04', 'sadness', 'Sadness'],
    ['05', 'cheer-up', 'Cheer up!'], ['06', 'hooray', 'Hooray!'], ['07', 'love', 'Love'], ['08', 'crying', 'Crying'],
    ['09', 'dance', 'Dance, dance!'], ['10', 'time-to-eat', 'Time to eat!'], ['11', 'time-to-sleep', 'Time to sleep…'], ['12', 'karaoke', 'Karaoke time!'],
    ['13', 'brb', 'BRB!'], ['14', 'nerd-mode', 'Nerd mode'], ['15', 'daldal', 'DALDAL!'], ['16', 'hugs', 'HUGS!']
  ];
  return [['goose', 'Goose'], ['capybara', 'Capybara'], ['cat', 'Cat']].map(function (s) {
    return { set: s[0], name: s[1], items: items.map(function (i) { return { id: i[0] + '-' + i[1], label: i[2], src: 'img/stickers/' + s[0] + '/' + s[0] + '-' + i[0] + '-' + i[1] + '.webp' }; }) };
  });
})();
