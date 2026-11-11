"""1.1.2: bring my card from a Batch Tickler backup file (no bt:v1:me on this device, like an installed app).
Run from the main checkout with `python3 -m http.server 8765` serving it."""
import json, os, tempfile
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8765/'
errs = []; fails = []
def check(name, ok):
    print(('ok   ' if ok else 'FAIL ') + name)
    if not ok: fails.append(name)
bt = {'id': 'pbt1', 'name': 'Maria Test', 'nickname': 'Isay', 'hometown': 'Balanga, Bataan', 'medSchool': 'UST', 'hobbies': 'board games',
      'food': 'sinigang', 'phone': '09171234567', 'gcash': '09171234567', 'bloodType': 'O+', 'emergencyContact': 'Nanay', 'emergencyNumber': '0999',
      'bmonth': 3, 'bday': 14, 'byear': 1997, 'photo': '', 'custom': [], 'playlists': [], 'netflix': [], 'lists': {}, 'updated': '2026-11-01T00:00:00.000Z'}
d = tempfile.mkdtemp(prefix='pt-t3-')
def write(name, obj):
    p = os.path.join(d, name); open(p, 'w').write(obj if isinstance(obj, str) else json.dumps(obj)); return p
good = write('batchtickler-backup-2026-11-11.json', {'app': 'batchtickler', 'format': 1, 'exported': '2026-11-11T00:00:00Z', 'attribution': 'x', 'summary': {},
    'data': {'me': json.dumps(bt), 'batch': json.dumps([{'id': 'other', 'name': 'Should Not Import'}]), 'cloud': json.dumps({'batch': 'ZZZ'})}})
ptfile = write('psychtickler-backup.json', {'app': 'psychtickler', 'format': 1, 'data': {'me': json.dumps(bt)}})
nocard = write('batchtickler-nocard.json', {'app': 'batchtickler', 'format': 1, 'data': {'batch': '[]'}})
junk = write('notes.json', 'not json at all')
with sync_playwright() as p:
    b = p.chromium.launch(); cx = b.new_context(viewport={'width': 390, 'height': 844}); pg = cx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.goto(BASE); pg.wait_for_timeout(600)
    pg.evaluate("()=>{Object.keys(localStorage).filter(k=>k.startsWith('pt:v1:')||k.startsWith('bt:v1:')).forEach(k=>localStorage.removeItem(k))}")
    pg.reload(); pg.wait_for_timeout(600)
    check('home strip shown with no local BT card', pg.locator('.bring-strip').count() == 1)
    pg.goto(BASE + '#/me'); pg.wait_for_timeout(400)
    check('my card strip shown with no local BT card', pg.locator('.bring-strip').count() == 1)
    pg.goto(BASE + '#/bring'); pg.wait_for_timeout(400)
    check('none state has file input', pg.locator('#bring-file').count() == 1 and pg.locator('#bring-form').count() == 0)
    st = lambda: pg.locator('#bring-file-status').inner_text()
    for path, want in [(ptfile, 'Psych Tickler backup'), (nocard, 'no card'), (junk, 'not a Batch Tickler backup')]:
        pg.set_input_files('#bring-file', path); pg.wait_for_timeout(300)
        check('error for ' + os.path.basename(path) + ': ' + st()[:50], want in st() and pg.locator('#bring-file-status.is-error').count() == 1 and pg.locator('#bring-form').count() == 0)
    pg.set_input_files('#bring-file', good); pg.wait_for_timeout(400)
    check('good file renders ticks form', pg.locator('#bring-form').count() == 1)
    check('source line names the file', 'batchtickler-backup-2026-11-11.json' in pg.locator('.bring-who').inner_text())
    check('picker again below found card', pg.locator('#bring-form #bring-file').count() == 1)
    check('emergency unticked', not pg.locator('input[name=g_emergency]').is_checked())
    check('no contact field ticked', pg.locator('#bring-form input[name^=f_]:checked').count() == 0)
    check('nothing written to bt:v1: yet', pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('bt:v1:')).length") == 0)
    pg.locator('#bring-form button[type=submit]').click(); pg.wait_for_timeout(700)
    me = json.loads(pg.evaluate("localStorage.getItem('pt:v1:me')") or 'null')
    check('card saved', bool(me) and me['name'] == 'Maria Test' and me.get('hometown') == 'Balanga, Bataan')
    check('contact/emergency not copied', me and not me.get('phone') and not me.get('gcash') and not me.get('bloodType') and not me.get('emergencyContact'))
    check('other keys not imported', 'Should Not Import' not in (pg.evaluate("localStorage.getItem('pt:v1:batch')") or '') and 'ZZZ' not in (pg.evaluate("localStorage.getItem('pt:v1:cloud')") or ''))
    check('no bt:v1: keys written', pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('bt:v1:')).length") == 0)
    check('went to #/me', pg.url.endswith('#/me'))
    pg.goto(BASE + '#/'); pg.wait_for_timeout(300)
    check('home strip gone once card exists', pg.locator('.bring-strip').count() == 0)
    b.close()
for e in errs: print(e)
print('no errors' if not errs and not fails else 'ERRORS: %d fail, %d page errors' % (len(fails), len(errs)))
