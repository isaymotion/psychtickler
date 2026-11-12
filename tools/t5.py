"""t5 (1.3.0): event posters and programmes. Run with the http.server on 8765 from the main checkout.
Part 1, no cloud: the GAPP poster and programme on Department events, the full-size view, no upload without Cloud sync.
Part 2, two phones on the mock cloud: A attaches a poster to her own event, B (a consultant) sees it; a failed upload
still saves the event; removing works; #announcements is first in Chat and pins the built-in events."""
import json, os, tempfile
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
BASE = 'http://localhost:8765/'
MOCK = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock.js')).read()
bad = []; errs = []
def ok(c, m): print(('ok   ' if c else 'FAIL ') + m); c or bad.append(m)
tmp = tempfile.mkdtemp(prefix='pt-t5-'); PNG = os.path.join(tmp, 'poster.png')
im = Image.new('RGB', (1600, 2200), (20, 60, 120)); dr = ImageDraw.Draw(im)
for i in range(0, 2200, 40): dr.rectangle([0, i, 1600, i + 18], fill=(30 + i % 200, 120, 90))
im.save(PNG)
def card(id, name, **k):
    c = {'id': id, 'name': name, 'bmonth': 5, 'bday': 2, 'byear': 1995, 'photo': '', 'custom': [], 'playlists': [], 'netflix': [], 'lists': {}, 'updated': '2026-11-10T00:00:00.000Z', 'pos': 'resident', 'startYear': 2027, 'hometown': 'Balanga', 'aud': {}}
    c.update(k); return c
def phone(br, user, me, shared):
    cx = br.new_context(viewport={'width': 390, 'height': 844}); pg = cx.new_page()
    pg.on('pageerror', lambda e: errs.append(user['uid'] + ' PAGEERR ' + str(e)))
    pg.add_init_script("localStorage.setItem('MOCKUSER', %s); if(!localStorage.getItem('pt:v1:me')) localStorage.setItem('pt:v1:me', %s); if(%s && !localStorage.getItem('MOCKDB')) localStorage.setItem('MOCKDB', %s);" % (json.dumps(json.dumps(user)), json.dumps(json.dumps(me)), 'true' if shared else 'false', json.dumps(shared or '{}')))
    pg.add_init_script(MOCK)
    return cx, pg
def db(pg): return json.loads(pg.evaluate("localStorage.getItem('MOCKDB')") or '{}')
def add_event(pg, title, poster=True):
    pg.goto(BASE + '#/events'); pg.wait_for_timeout(700)
    pg.fill('#ev-form [name=title]', title); pg.fill('#ev-form [name=date]', '2026-12-18'); pg.fill('#ev-form [name=place]', 'Conference room')
    if poster:
        pg.set_input_files('#ev-poster-file', PNG); pg.wait_for_selector('.ev-poster__prev', timeout=8000)
    pg.locator('#ev-form button[type=submit]').click(); pg.wait_for_timeout(1200)
with sync_playwright() as p:
    br = p.chromium.launch()
    # ---- Part 1: no cloud
    pg = br.new_page(viewport={'width': 390, 'height': 844}); pg.on('pageerror', lambda e: errs.append('P1 ' + str(e)))
    pg.goto(BASE + '#/events'); pg.wait_for_timeout(1500)
    row = pg.locator('.ev-list .ev', has_text='GAPP webinar').first
    img = row.locator('.ev__poster img')
    ok(img.count() == 1 and img.get_attribute('src') == 'img/events/gapp-2026-webinar.jpg', 'GAPP event has its poster')
    ok(img.evaluate('i => i.complete && i.naturalWidth >= 900'), 'poster file loads (about 1000 px wide)')
    kb = pg.evaluate("fetch('img/events/gapp-2026-webinar.jpg').then(r=>r.blob()).then(b=>b.size)") / 1024
    ok(kb < 250, 'poster file under 250 KB (%d KB)' % kb)
    prog = row.locator('.ev__prog'); prog.locator('summary').click()
    txt = prog.inner_text()
    ok(prog.locator('li').count() == 7 and '7:10 PM' in txt and 'Maglaque' in txt and 'Open forum' in txt and 'Obra-Puno' in txt, 'programme: 7 rows, times, speakers, moderator')
    row.locator('.ev__poster').click(); pg.wait_for_timeout(300)
    z = pg.locator('.chat-zoom--poster')
    ok(z.count() == 1 and z.locator('img').evaluate('i => i.getBoundingClientRect().width') >= 340, 'tap opens the poster full width')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    ok(pg.locator('.chat-zoom--poster').count() == 0, 'Escape closes it')
    ok(pg.locator('#ev-poster-file').count() == 0 and 'Cloud sync' in pg.locator('#ev-poster').inner_text(), 'no upload without Cloud sync, with a hint')
    ok(pg.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'no sideways scroll on a phone')
    pg.close()
    # ---- Part 2: mock cloud
    cxa, pa = phone(br, {'uid': 'ua', 'email': 'isaymotion@gmail.com', 'name': 'Ana', 'owner': True}, card('pa', 'Ana Owner'), None)
    pa.goto(BASE + '#/sync'); pa.wait_for_timeout(900)
    pa.fill('#sy-create [name=bname]', 'MMWGH Psychiatry'); pa.locator('#sy-create button[type=submit]').click(); pa.wait_for_timeout(1500)
    pa.goto(BASE + '#/events'); pa.wait_for_timeout(600)
    pa.fill('#ev-form [name=title]', 'Typed before the poster')
    pa.set_input_files('#ev-poster-file', PNG); pa.wait_for_selector('.ev-poster__prev', timeout=8000)
    ok(pa.input_value('#ev-form [name=title]') == 'Typed before the poster' and 'KB' in pa.locator('#ev-poster-st').inner_text(), 'choosing a poster keeps what was typed and says it is ready')
    add_event(pa, 'Journal club')
    d = db(pa); ids = list((d.get('posters') or {}).keys())
    ok(len(ids) == 1 and d['posters'][ids[0]]['by'] == 'ua' and len(d['posters'][ids[0]]['data']) < 400000 and d['posters'][ids[0]]['data'].startswith('data:image/'), 'poster uploaded once, under the cap (%d KB)' % (len(d['posters'][ids[0]]['data']) * 0.75 / 1024 if ids else 0))
    rowa = pa.locator('.ev-list .ev', has_text='Journal club').first
    ok(rowa.locator('.ev__poster img').count() == 1, 'A sees the poster on her event')
    pa.wait_for_timeout(4500)   # the push timer
    d = db(pa); ev = (d.get('ev') or {}).get(ids[0]) if ids else None
    ok(bool(ev) and ev['poster'] > 0 and 'data' not in ev, 'the synced event carries only the poster stamp, not the picture')
    st = json.loads(pa.evaluate("localStorage.getItem('pt:v1:events')"))
    ok(all('data:image' not in json.dumps(e) for e in st), "no picture in the phone's event store")
    # B joins as a consultant
    shared = json.dumps(d)
    cxb, pb = phone(br, {'uid': 'ub', 'email': 'b@x.ph', 'name': 'Dr B'}, card('pb', 'Dr Bea Consultant', pos='consultant', startYear=0), shared)
    pb.goto(BASE + '#/sync'); pb.wait_for_timeout(800)
    pb.fill('#sy-join [name=code]', d['prog']['code']); pb.locator('#sy-join button[type=submit]').click(); pb.wait_for_timeout(1000)
    d = db(pb); r = d['requests']['ub']; d['members']['ub'] = {'name': r['name'], 'email': r['email'], 'role': r['role'], 'batch': r['batch'], 'admin': False}; del d['requests']['ub']
    pb.evaluate("v=>localStorage.setItem('MOCKDB',v)", json.dumps(d)); pb.reload(); pb.wait_for_timeout(2500)
    pb.goto(BASE + '#/events'); pb.wait_for_timeout(1500)
    rowb = pb.locator('.ev-list .ev', has_text='Journal club').first
    ok(rowb.count() == 1 and rowb.locator('.ev__poster img').count() == 1 and rowb.locator('.ev__poster img').get_attribute('src').startswith('data:image/'), 'B (consultant) gets the event and its poster')
    rowb.locator('.ev__poster').click(); pb.wait_for_timeout(300)
    ok(pb.locator('.chat-zoom--poster img').count() == 1, 'B opens it full size'); pb.locator('.chat-zoom--poster').click()
    # chat: announcements first, pins
    pb.goto(BASE + '#/chat'); pb.wait_for_timeout(1500)
    if not pb.locator('.ch-row').count():   # the admin's phone opens the starting channels
        pa.goto(BASE + '#/chat'); pa.wait_for_timeout(1500); pb.evaluate("v=>localStorage.setItem('MOCKDB',v)", pa.evaluate("localStorage.getItem('MOCKDB')")); pb.reload(); pb.wait_for_timeout(2500)
    ok('#announcements' in pb.locator('.ch-row').first.inner_text(), '#announcements is first in Chat')
    pb.goto(BASE + '#/chat/announcements'); pb.wait_for_timeout(900)
    pins = pb.locator('#chat-pins'); pins.locator('summary').first.click(); pb.wait_for_timeout(200)
    ok(pins.locator('.ev').count() == 3 and pins.locator('.ev__poster img').count() == 1 and pins.locator('.ev__prog li').count() == 7, '#announcements pins the 3 built-in events with the GAPP poster and programme')
    pins.locator('.ev__poster').click(); pb.wait_for_timeout(300)
    ok(pb.locator('.chat-zoom--poster img').count() == 1, 'poster opens from #announcements'); pb.keyboard.press('Escape')
    pb.goto(BASE + '#/chat/general'); pb.wait_for_timeout(700)
    ok(pb.locator('#chat-pins').count() == 0, 'other channels have no pins')
    # failed upload (rules not published yet): event still saved, clear message
    pa.evaluate("v=>localStorage.setItem('MOCKDB',v)", pb.evaluate("localStorage.getItem('MOCKDB')"))
    pa.evaluate("localStorage.setItem('MOCKFAIL','posters')")
    add_event(pa, 'Christmas party')
    stt = pa.locator('#ev-status').inner_text()
    ok(pa.locator('.ev-list .ev', has_text='Christmas party').count() == 1 and 'could not be uploaded' in stt and pa.locator('.ev-list .ev', has_text='Christmas party').locator('.ev__poster, [data-evposter]').count() == 0, 'failed upload: event saved without a poster, with a message')
    pa.evaluate("localStorage.removeItem('MOCKFAIL')")
    # remove the poster
    pa.locator('.ev-list .ev', has_text='Journal club').locator('[data-evedit]').click(); pa.wait_for_timeout(500)
    pa.locator('#ev-poster-rm').click(); pa.wait_for_timeout(200)
    pa.locator('#ev-form button[type=submit]').click(); pa.wait_for_timeout(1200)
    d = db(pa)
    ok(not (d.get('posters') or {}) and pa.locator('.ev-list .ev', has_text='Journal club').locator('.ev__poster').count() == 0, 'Remove poster deletes the picture')
    br.close()
ok(not errs, 'no page errors ' + ' '.join(errs))
print('no errors' if not bad else 'FAILED: ' + '; '.join(bad))
