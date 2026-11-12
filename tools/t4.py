"""t4 (1.2.1): built-in department events (data/dept-events.js). Run with the http.server on 8765 from the main checkout.
Checks (1.2.3 adds the GAPP webinar): dept events listed and read-only, Register link, name lists, multi-day range stays upcoming ('Happening now'), 4-day .ics."""
from playwright.sync_api import sync_playwright
bad = []
def ok(c, m): print(('ok   ' if c else 'FAIL ') + m); c or bad.append(m)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 390, 'height': 844}); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://127.0.0.1:8765/#/events'); pg.wait_for_timeout(1200)
    ids = [x.get_attribute('data-evcal') for x in pg.query_selector_all('[data-evcal]')]
    ok('ppa-prcp-2027' in ids and 'ppa-2027-reg-deadline' in ids, 'dept events listed')
    ok(not pg.query_selector('[data-evedit="ppa-prcp-2027"], [data-evdel="ppa-prcp-2027"]'), 'dept events read-only')
    ok(any(a.get_attribute('href') == 'https://ppaprcpcongress2027.org/' for a in pg.query_selector_all('.ev__acts a')), 'Register link')
    ok(len(pg.query_selector_all('.ev__list')) == 3, 'three name lists')
    ok('gapp-2026-webinar' in ids and any(a.get_attribute('href') == 'https://bit.ly/GAPP2026Webinar' for a in pg.query_selector_all('.ev__acts a')), 'GAPP webinar listed with Register link (1.2.3)')
    pg.close()
    pg = b.new_context().new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.clock.install(time='2026-11-26T09:00:00+08:00')
    pg.goto('http://127.0.0.1:8765/#/events'); pg.wait_for_timeout(1200)
    first = pg.query_selector_all('.ev-list .ev')[0].inner_text()
    ok('GAPP' in first and 'Tomorrow' in first and 'Zoom' in first, 'GAPP webinar first, tomorrow, on Zoom, the day before')
    with pg.expect_download() as d: pg.click('[data-evcal="gapp-2026-webinar"]')
    ics = open(d.value.path()).read()
    ok('DTSTART:20261127T190000' in ics and 'URL:https://bit.ly/GAPP2026Webinar' in ics, '.ics at 7:00 PM 27 Nov with URL')
    pg.close()
    pg = b.new_context().new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.clock.install(time='2027-01-20T09:00:00+08:00')
    pg.goto('http://127.0.0.1:8765/#/events'); pg.wait_for_timeout(1200)
    ok(pg.query_selector_all('.ev-list .ev__d')[0].inner_text() in ('Happening now', 'Ginaganap ngayon'), 'congress shown as happening now on day 2')
    with pg.expect_download() as d: pg.click('[data-evcal="ppa-prcp-2027"]')
    ics = open(d.value.path()).read()
    ok('DTSTART;VALUE=DATE:20270119' in ics and 'DTEND;VALUE=DATE:20270123' in ics and 'URL:https://ppaprcpcongress2027.org/' in ics, '.ics covers 19-22 Jan with URL')
    ok(not errs, 'no page errors ' + ' '.join(errs))
    b.close()
print('no errors' if not bad else 'FAILED: ' + '; '.join(bad))
