"""t7 (1.5.0): consultant quick facts. Run with the http.server on 8765 from the main checkout.
No cloud: cards are seeded in localStorage. Checks the new My card field, the Quick facts box on a consultant's page
(and that the same answers are not repeated below it), the directory card lines, #/consultants (list, filter, empty
consultant, nudge for a consultant who has not filled them in), search, residents unaffected, Tagalog, phone width."""
import json, os, tempfile
from playwright.sync_api import sync_playwright
bad = []
def ok(c, m): print(('ok   ' if c else 'FAIL ') + m); c or bad.append(m)
NOW = 1794400000000
def card(i, name, pos, **kw):
    c = {'id': i, 'name': name, 'pos': pos, 'startYear': 0 if pos == 'consultant' else 2027, 'updated': NOW, 'bmonth': 0, 'bday': 0, 'byear': 0}
    c.update(kw); return c
ME = card('me1', 'Rina Resident', 'resident', hobbies='baking')
C1 = card('c1', 'Dr Carla Consultant', 'consultant', cSpecialty='Child and adolescent psychiatry', clinicDays='Mon and Wed AM clinic; Fri rounds',
          reachPref='Viber message first <b>please</b>', contactHours='8 AM to 5 PM', teaching='Psychopharmacology', referralPref='Send the summary first')
C2 = card('c2', 'Dr Dan Consultant', 'consultant', cSpecialty='Addiction psychiatry', clinicDays='Tue and Thu')
C3 = card('c3', 'Dr Eve Empty', 'consultant', bmonth=5, bday=9)
R2 = card('r2', 'Sam Second', 'resident', startYear=2026, cSpecialty='should not show', clinicDays='never')
def page(b, me, others, lang=None, w=390):
    cx = b.new_context(viewport={'width': w, 'height': 844}); pg = cx.new_page()
    pg.add_init_script("if(!localStorage.getItem('pt:v1:me')){localStorage.setItem('pt:v1:me', %s); localStorage.setItem('pt:v1:batch', %s); %s}" % (
        json.dumps(json.dumps(me)), json.dumps(json.dumps(others)), ("localStorage.setItem('pt:v1:lang', %s);" % json.dumps(json.dumps(lang))) if lang else ''))
    return pg
def go(pg, h): pg.goto('http://127.0.0.1:8765/' + h); pg.wait_for_timeout(700)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = page(b, ME, [C1, C2, C3, R2]); pg.on('pageerror', lambda e: errs.append(str(e)))
    go(pg, '#/consultants')
    rows = pg.query_selector_all('.cons__row')
    ok(len(rows) == 3 and [r.get_attribute('data-cons') for r in rows] == ['c1', 'c2', 'c3'], 'three consultants listed by name, no residents')
    t1 = rows[0].inner_text()
    ok(all(x in t1 for x in ['Child and adolescent', 'Mon and Wed AM clinic', 'Viber message first', '8 AM to 5 PM']), 'first row has subspecialty, clinic days, how to reach, hours')
    ok('Psychopharmacology' not in t1 and 'Send the summary' not in t1, 'only the quick facts are in the list')
    ok(not rows[0].query_selector('b') and '<b>please</b>' in t1, 'answers are escaped')
    ok('No quick facts yet' in rows[2].inner_text(), 'empty consultant says No quick facts yet')
    ok(pg.inner_text('#cons-n') == '3 consultants', 'count line')
    ok(not pg.query_selector('.cq-nudge'), 'no nudge for a resident')
    pg.fill('#cons-q', 'thu'); pg.wait_for_timeout(500)
    ok([r.get_attribute('data-cons') for r in pg.query_selector_all('.cons__row')] == ['c2'] and pg.inner_text('#cons-n') == '1 consultant', 'filter by day finds Tue and Thu')
    ok(pg.evaluate("document.activeElement && document.activeElement.id") == 'cons-q', 'typing keeps the cursor in the box')
    pg.fill('#cons-q', 'zzzz'); pg.wait_for_timeout(500)
    ok('No consultant matches' in pg.inner_text('main'), 'no match message')
    pg.fill('#cons-q', ''); pg.wait_for_timeout(500)
    ok(pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), 'no sideways scroll on a phone')
    pg.click('.cons__row[data-cons="c1"] .cons__who'); pg.wait_for_timeout(600)
    ok('#/person/c1' in pg.url, 'name opens the card')
    box = pg.query_selector('.cq')
    ok(box and len(box.query_selector_all('.fact')) == 4, 'Quick facts box with 4 rows on her page')
    keys = [k.inner_text().strip().upper() for k in pg.query_selector_all('.person .fact__k')]
    ok(keys.count('CLINIC AND ROUNDS DAYS') == 1 and keys.count('PREFERRED WAY TO BE REACHED') == 1, 'quick facts are not repeated lower down')
    ok('TOPICS I ENJOY TEACHING' in keys and 'HOW I PREFER REFERRALS AND ENDORSEMENTS' in keys, 'the other consultant answers stay in For consultants')
    hs = [h.inner_text() for h in pg.query_selector_all('.person h2')]
    ok(hs.index('Quick facts') < hs.index('For consultants'), 'Quick facts comes first')
    go(pg, '#/person/c3'); ok(not pg.query_selector('.cq') and not pg.query_selector('.cq-nudge'), "empty consultant's page: no box, no nudge for others")
    go(pg, '#/person/r2'); ok(not pg.query_selector('.cq') and 'should not show' not in pg.inner_text('main'), "a resident's page has no quick facts")
    go(pg, '#/batch')
    c1 = pg.query_selector('a.pcard[href="#/person/c1"]').inner_text(); r2 = pg.query_selector('a.pcard[href="#/person/r2"]').inner_text()
    ok('Child and adolescent' in c1 and 'Mon and Wed' in c1 and 'Viber' not in c1, 'directory card shows subspecialty and clinic days')
    ok('should not show' not in r2 and 'never' not in r2, "resident's directory card unchanged")
    ok(pg.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), 'directory: no sideways scroll')
    go(pg, '#/')
    ok(pg.evaluate("!!document.querySelector('a[href=\"#/consultants\"]')"), 'Consultants at a glance is in the menu')
    go(pg, '#/me'); ok(pg.evaluate("(function(){var e=document.querySelector('[name=reachPref]'); var d=e&&e.closest('[data-posgroup=consultant]'); return !!e && !!d && d.hidden;})()"), 'resident: the new field is in the hidden consultant section')
    pg.context.close()
    # a consultant who has filled in nothing
    pg = page(b, dict(C3, id='me2'), [C1]); pg.on('pageerror', lambda e: errs.append(str(e)))
    go(pg, '#/consultants')
    ok(pg.query_selector('.cq-nudge') and pg.query_selector('.cq-nudge a[href="#/me"]'), 'consultant with no quick facts is asked to add them')
    go(pg, '#/person/me2'); ok(pg.query_selector('.cq-nudge') is not None, 'and on her own page')
    go(pg, '#/me')
    pg.evaluate("document.querySelectorAll('details').forEach(function(d){d.open=true})")
    vis = pg.evaluate("(function(){var e=document.querySelector('[name=reachPref]'); return !!e && e.offsetParent!==null;})()")
    ok(vis, 'consultant: Preferred way to be reached is on My card')
    ok('Viber message first; call only if urgent' in pg.inner_text('main'), 'with its example')
    pg.fill('[name=reachPref]', 'Text, then call'); pg.fill('[name=clinicDays]', 'Mon to Wed'); pg.fill('[name=cSpecialty]', 'Geriatric psychiatry')
    pg.locator('#me-form button[type=submit]').first.click(); pg.wait_for_timeout(900)
    me = json.loads(pg.evaluate("localStorage.getItem('pt:v1:me')"))
    ok(me.get('reachPref') == 'Text, then call' and me.get('clinicDays') == 'Mon to Wed', 'saved on the card' + ('' if me.get('reachPref') else ' ' + pg.url + ' ' + json.dumps(me)[:300]))
    go(pg, '#/consultants')
    ok(not pg.query_selector('.cq-nudge') and 'Text, then call' in pg.inner_text('.cons__row[data-cons="me2"]'), 'nudge gone, her facts are listed')
    pg.context.close()
    # Tagalog, tablet width
    pg = page(b, ME, [C1, C2, C3], lang='tl', w=820); pg.on('pageerror', lambda e: errs.append(str(e)))
    go(pg, '#/consultants'); tx = pg.inner_text('main')
    lang = pg.evaluate("localStorage.getItem('pt:v1:lang')")
    ok('pt.cq.' not in tx and 'nav.consultants' not in tx and 'bt.f.' not in tx, 'Tagalog: no raw keys (lang ' + str(lang) + ')')
    go(pg, '#/person/c1'); ok('pt.cq.' not in pg.inner_text('main') and 'bt.f.reachPref' not in pg.inner_text('main'), 'Tagalog: person page has no raw keys')
    shots = os.environ.get('PT_SHOTS') or tempfile.mkdtemp(); pg.screenshot(path=os.path.join(shots, 't7-person-tl.png'), full_page=True)
    pg.context.close()
    ok(not errs, 'no page errors ' + ' '.join(errs))
    b.close()
print('no errors' if not bad else 'FAILED: ' + '; '.join(bad))
