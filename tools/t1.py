import json, sys, os, tempfile
from playwright.sync_api import sync_playwright
OUT=os.environ.get('PT_SHOTS') or tempfile.mkdtemp(prefix='pt-shots-')
BASE='http://localhost:8765/'
errs=[]
bt={'id':'pbt1','name':'Maria Test','nickname':'Isay','hometown':'Balanga, Bataan','medSchool':'UST','hobbies':'board games, baking','food':'sinigang','phone':'09171234567','gcash':'09171234567','bloodType':'O+','emergencyContact':'Nanay','emergencyNumber':'0999','bmonth':3,'bday':14,'byear':1997,'photo':'','custom':[{'label':'Fav plant','value':'pothos'}],'playlists':[],'netflix':[{'title':'Reply 1988','url':''}],'lists':{},'updated':'2026-11-01T00:00:00.000Z','shoutouts':[{'to':'x','name':'Y','text':'thanks','date':'2026-11-01'}]}
with sync_playwright() as p:
    b=p.chromium.launch(); cx=b.new_context(viewport={'width':390,'height':844}); pg=cx.new_page()
    pg.on('pageerror', lambda e: errs.append('PAGEERR '+str(e)))
    pg.on('console', lambda m: errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    pg.goto(BASE); pg.wait_for_timeout(600)
    pg.evaluate("v=>localStorage.setItem('bt:v1:me',v)", json.dumps(bt))
    pg.goto(BASE+'#/'); pg.reload(); pg.wait_for_timeout(600)
    print('home strip:', pg.locator('.bring-strip').count())
    pg.goto(BASE+'#/bring'); pg.wait_for_timeout(400)
    print('bring ticks:', pg.locator('#bring-form input[type=checkbox]').count(), 'checked:', pg.locator('#bring-form input[type=checkbox]:checked').count())
    print('emergency checked:', pg.locator('input[name=g_emergency]').is_checked())
    pg.screenshot(path=OUT+'/bring.png', full_page=True)
    pg.locator('#bring-form button[type=submit]').click(); pg.wait_for_timeout(700)
    me=json.loads(pg.evaluate("localStorage.getItem('pt:v1:me')"))
    print('me:', {k:me.get(k) for k in ['name','nickname','hometown','phone','gcash','bloodType','emergencyContact','bmonth','byear','pos','startYear','showYear']}, 'custom', len(me['custom']), 'netflix', len(me['netflix']), 'shouts', len(me['shoutouts']))
    print('at', pg.url)
    # my card form
    print('quick fields:', pg.locator('details.fgroup').first.locator('label.field').count(), 'aud selects:', pg.locator('select.aud').count(), 'consultant group hidden:', pg.locator('details[data-posgroup=consultant]').is_hidden())
    pg.select_option('select[name=pos]','consultant'); pg.wait_for_timeout(100)
    print('after consultant: group visible', pg.locator('details[data-posgroup=consultant]').is_visible(), 'aud visible', pg.locator('.aud-l').first.is_visible(), 'startYear visible', pg.locator('input[name=startYear]').is_visible())
    pg.select_option('select[name=pos]','resident')
    pg.select_option('select.aud[data-k=hobbies]','res'); pg.select_option('select.aud[data-k=food]','batch')
    pg.screenshot(path=OUT+'/me.png')
    pg.locator('#me-form button[type=submit]').click(); pg.wait_for_timeout(900)
    me=json.loads(pg.evaluate("localStorage.getItem('pt:v1:me')"))
    print('saved aud:', me['aud'], 'pos', me['pos'], me['startYear'], 'at', pg.url)
    pg.screenshot(path=OUT+'/person.png', full_page=True)
    for r in ['', 'batch','cup','buddies','kudos','advice','polls','chat','sync','birthdays','stats','print','whats-new','about','wrapped','bingo']:
        pg.goto(BASE+'#/'+r); pg.wait_for_timeout(350)
        txt=pg.locator('#main').inner_text()
        bad=[w for w in ['pt.','bt.','nav.','undefined','NaN'] if w in txt]
        print(r or 'home', len(txt), 'RAW-KEYS' if bad else '', bad if bad else '')
    pg.goto(BASE+'#/'); pg.wait_for_timeout(300); pg.screenshot(path=OUT+'/home.png', full_page=True)
    b.close()
print('\n'.join(errs) or 'no errors')
