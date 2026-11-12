"""t6 (1.4.0): didactics schedule. Run with the http.server on 8765 from the main checkout.
Two phones on the mock cloud, clock fixed at Wed 18 Nov 2026 (so the next Didactics day is Thu 19 Nov 2026):
A (owner, admin) adds a topic for the week; B (a consultant, not an admin) sees it on Department events and on Home
but gets no Edit buttons; a refused write says so and keeps nothing; clearing a week reaches B."""
import json, os
from playwright.sync_api import sync_playwright
BASE = 'http://localhost:8765/'
MOCK = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mock.js')).read()
NOW = '2026-11-18T09:00:00+08:00'; THU = '2026-11-19'; THU2 = '2026-11-26'
bad = []; errs = []
def ok(c, m): print(('ok   ' if c else 'FAIL ') + m); c or bad.append(m)
def card(id, name, **k):
    c = {'id': id, 'name': name, 'bmonth': 5, 'bday': 2, 'byear': 1995, 'photo': '', 'custom': [], 'playlists': [], 'netflix': [], 'lists': {}, 'updated': '2026-11-10T00:00:00.000Z', 'pos': 'resident', 'startYear': 2027, 'hometown': 'Balanga', 'aud': {}}
    c.update(k); return c
def phone(br, user, me, shared):
    cx = br.new_context(viewport={'width': 390, 'height': 844}, timezone_id='Asia/Manila'); pg = cx.new_page()
    pg.clock.install(time=NOW)
    pg.on('pageerror', lambda e: errs.append(user['uid'] + ' PAGEERR ' + str(e)))
    pg.add_init_script("localStorage.setItem('MOCKUSER', %s); if(!localStorage.getItem('pt:v1:me')) localStorage.setItem('pt:v1:me', %s); if(%s && !localStorage.getItem('MOCKDB')) localStorage.setItem('MOCKDB', %s);" % (json.dumps(json.dumps(user)), json.dumps(json.dumps(me)), 'true' if shared else 'false', json.dumps(shared or '{}')))
    pg.add_init_script(MOCK)
    return cx, pg
def db(pg): return json.loads(pg.evaluate("localStorage.getItem('MOCKDB')") or '{}')
def resync(pg, shared):   # hand the phone the other phone's cloud and let it sync again
    pg.evaluate("v=>{localStorage.setItem('MOCKDB',v); var c=JSON.parse(localStorage.getItem('pt:v1:cloud')); delete c.lastSync; localStorage.setItem('pt:v1:cloud',JSON.stringify(c));}", shared)
    pg.goto(BASE + '#/events'); pg.reload(); pg.wait_for_timeout(2500)
def edit(pg, day):
    pg.locator('#dd-sched summary').click() if not pg.locator('#dd-sched').evaluate('e=>e.open') else None
    pg.locator('[data-ddedit="%s"]' % day).click(); pg.wait_for_timeout(300)
with sync_playwright() as p:
    br = p.chromium.launch()
    cxa, pa = phone(br, {'uid': 'ua', 'email': 'isaymotion@gmail.com', 'name': 'Ana', 'owner': True}, card('pa', 'Ana Owner'), None)
    pa.goto(BASE + '#/events'); pa.wait_for_timeout(1200)
    ok(pa.locator('#dd-sched').count() == 0 and 'Cloud sync' in pa.locator('.dd-ev').inner_text(), 'without Cloud sync: no schedule, a hint to join')
    pa.goto(BASE + '#/sync'); pa.wait_for_timeout(900)
    pa.fill('#sy-create [name=bname]', 'MMWGH Psychiatry'); pa.locator('#sy-create button[type=submit]').click(); pa.wait_for_timeout(2500)
    pa.goto(BASE + '#/events'); pa.wait_for_timeout(900)
    wk = pa.locator('#dd-sched .dd-wk')
    ok(wk.count() == 8 and pa.locator('[data-ddedit]').count() == 8 and pa.locator('[data-ddedit]').first.get_attribute('data-ddedit') == THU, 'admin: 8 Thursdays from 19 Nov, each with a button')
    ok('No topic yet' in wk.first.inner_text() or pa.locator('#dd-sched').evaluate('e=>!e.open'), 'empty weeks say No topic yet')
    edit(pa, THU)
    pa.fill('#dd-form [name=topic]', 'Schizophrenia spectrum: first-episode psychosis'); pa.fill('#dd-form [name=presenter]', 'Doc Ana (first year)')
    pa.fill('#dd-form [name=moderator]', 'Doc Bea'); pa.fill('#dd-form [name=note]', 'Conference room, 1 PM')
    pa.locator('#dd-form button[type=submit]').click(); pa.wait_for_timeout(900)
    d = db(pa); r = (d.get('dd') or {}).get(THU)
    ok(bool(r) and r['topic'].startswith('Schizophrenia') and r['presenter'] == 'Doc Ana (first year)' and r['moderator'] == 'Doc Bea' and r['by'] == 'ua' and sorted(r.keys()) == ['by', 'moderator', 'note', 'presenter', 'topic', 'updated'], 'saved to the cloud under the date, only the allowed fields')
    ok(pa.locator('#dd-form').count() == 0 and pa.locator('#dd-sched').evaluate('e=>e.open') and 'Schizophrenia' in pa.locator('#dd-sched .dd-wk').first.inner_text(), 'form closes, schedule stays open and shows the topic')
    cur = pa.locator('.dd-cur').inner_text()
    ok('Schizophrenia' in cur and 'Presenter: Doc Ana' in cur and 'Moderator: Doc Bea' in cur and 'Conference room' in cur, 'the Didactics day row shows this week: topic, presenter, moderator, note')
    ok(THU in json.loads(pa.evaluate("localStorage.getItem('pt:v1:dd')")), 'kept on the phone for offline')
    pa.goto(BASE + '#/home'); pa.wait_for_timeout(800)
    h = pa.locator('.dd-home').inner_text()
    ok('Tomorrow is Didactics day' in h and 'Schizophrenia' in h and 'Presenter: Doc Ana' in h, 'Home card on Wednesday carries the topic and presenter')
    # refused write
    pa.goto(BASE + '#/events'); pa.wait_for_timeout(700)
    pa.evaluate("localStorage.setItem('MOCKFAIL','didactics')")
    edit(pa, THU2); pa.fill('#dd-form [name=topic]', 'Should not save'); pa.locator('#dd-form button[type=submit]').click(); pa.wait_for_timeout(800)
    ok('Not saved' in pa.locator('#dd-fst').inner_text() and pa.input_value('#dd-form [name=topic]') == 'Should not save' and THU2 not in json.loads(pa.evaluate("localStorage.getItem('pt:v1:dd')")) and THU2 not in db(pa)['dd'], 'refused write: message, typing kept, nothing stored')
    pa.evaluate("localStorage.removeItem('MOCKFAIL')"); pa.locator('#dd-cancel').click(); pa.wait_for_timeout(300)
    ok(pa.locator('#dd-form').count() == 0, 'Cancel closes the form')
    # B joins as a consultant, not an admin
    d = db(pa)
    cxb, pb = phone(br, {'uid': 'ub', 'email': 'b@x.ph', 'name': 'Dr B'}, card('pb', 'Dr Bea Consultant', pos='consultant', startYear=0), json.dumps(d))
    pb.goto(BASE + '#/sync'); pb.wait_for_timeout(800)
    pb.fill('#sy-join [name=code]', d['prog']['code']); pb.locator('#sy-join button[type=submit]').click(); pb.wait_for_timeout(1000)
    d = db(pb); r = d['requests']['ub']; d['members']['ub'] = {'name': r['name'], 'email': r['email'], 'role': r['role'], 'batch': r['batch'], 'admin': False}; del d['requests']['ub']
    pb.evaluate("v=>localStorage.setItem('MOCKDB',v)", json.dumps(d)); pb.reload(); pb.wait_for_timeout(2500)
    pb.goto(BASE + '#/events'); pb.wait_for_timeout(1200)
    ok('Schizophrenia' in pb.locator('.dd-cur').inner_text(), 'B (consultant) sees this week on Department events')
    pb.locator('#dd-sched summary').click(); pb.wait_for_timeout(200)
    ok(pb.locator('#dd-sched .dd-wk').count() == 8 and pb.locator('[data-ddedit]').count() == 0 and 'Only admins' not in pb.locator('#dd-sched').inner_text(), 'B sees 8 weeks and no Edit buttons')
    ok(pb.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'no sideways scroll on a phone')
    pb.goto(BASE + '#/home'); pb.wait_for_timeout(800)
    ok('Schizophrenia' in pb.locator('.dd-home').inner_text(), "B's Home card carries the topic")
    pb.evaluate("localStorage.setItem('pt:v1:lang','tl')"); pb.goto(BASE + '#/events'); pb.reload(); pb.wait_for_timeout(1200)
    tx = pb.locator('.dd-ev').inner_text()
    ok('pt.dd.' not in tx and 'Schizophrenia' in tx, 'Tagalog: no raw keys')
    pb.evaluate("localStorage.removeItem('pt:v1:lang')")
    # A clears the week; B learns of it
    edit(pa, THU); pa.locator('#dd-clear').click(); pa.wait_for_timeout(900)
    d = db(pa)
    ok(d['dd'][THU]['topic'] == '' and pa.locator('.dd-cur').count() == 0 and 'No topic yet' in pa.locator('#dd-sched .dd-wk').first.inner_text(), 'Clear this week empties the row')
    resync(pb, json.dumps(d))
    pb.locator('#dd-sched summary').click(); pb.wait_for_timeout(200)
    ok(pb.locator('.dd-cur').count() == 0 and 'No topic yet' in pb.locator('#dd-sched .dd-wk').first.inner_text(), 'B sees the cleared week after a sync')
    br.close()
ok(not errs, 'no page errors ' + ' '.join(errs))
print('no errors' if not bad else 'FAILED: ' + '; '.join(bad))
