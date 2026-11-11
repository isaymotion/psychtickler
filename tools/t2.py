import json, os, tempfile
from playwright.sync_api import sync_playwright
OUT=os.environ.get('PT_SHOTS') or tempfile.mkdtemp(prefix='pt-shots-')
BASE='http://localhost:8765/'
MOCK=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'mock.js')).read()
errs=[]
def card(id,name,**k):
    c={'id':id,'name':name,'bmonth':5,'bday':2,'byear':1995,'photo':'','custom':[],'playlists':[],'netflix':[],'lists':{},'updated':'2026-11-10T00:00:00.000Z','pos':'resident','startYear':2027,'hobbies':'baking','food':'sinigang','hometown':'Balanga','whyPsych':'minds','aud':{}}
    c.update(k); return c
def phone(br, user, me, shared):
    cx=br.new_context(viewport={'width':390,'height':844}); pg=cx.new_page()
    pg.on('pageerror', lambda e: errs.append(user['uid']+' PAGEERR '+str(e)))
    pg.add_init_script("localStorage.setItem('MOCKUSER', %s); if(!localStorage.getItem('pt:v1:me')) localStorage.setItem('pt:v1:me', %s); if(%s && !localStorage.getItem('MOCKDB')) localStorage.setItem('MOCKDB', %s);" % (json.dumps(json.dumps(user)), json.dumps(json.dumps(me)), 'true' if shared else 'false', json.dumps(shared or '{}')))
    pg.add_init_script(MOCK)
    return cx,pg
def db(pg): return json.loads(pg.evaluate("localStorage.getItem('MOCKDB')") or '{}')
with sync_playwright() as p:
    br=p.chromium.launch()
    # Phone A: owner, first year batch 2027, restricts hobbies (res) and food (batch), hides birth year
    A=card('pa','Ana Owner',aud={'hobbies':'res','food':'batch'})
    cxa,pa=phone(br,{'uid':'ua','email':'isaymotion@gmail.com','name':'Ana','owner':True},A,None)
    pa.goto(BASE+'#/sync'); pa.wait_for_timeout(900)
    print('A create form:', pa.locator('#sy-create').count())
    pa.fill('#sy-create [name=bname]','MMWGH Psychiatry'); pa.locator('#sy-create button[type=submit]').click(); pa.wait_for_timeout(1500)
    d=db(pa); code=d['prog']['code']
    pub=d['cards']['pa']['card']
    print('A public card: hobbies=%r food=%r byear=%r hometown=%r' % (pub['hobbies'],pub['food'],pub['byear'],pub['hometown']))
    print('A parts res:', d['res']['pa']['fields'], 'batch:', d['byb'])
    print('A member:', d['members']['ua'])
    shared=json.dumps(d)
    def join(user, me):
        cx,pg=phone(br,user,me,shared)
        pg.goto(BASE+'#/sync'); pg.wait_for_timeout(800)
        pg.fill('#sy-join [name=code]', code); pg.locator('#sy-join button[type=submit]').click(); pg.wait_for_timeout(1000)
        return cx,pg
    # B: consultant; C: second year (batch 2026); D: first year same batch 2027
    def roundtrip(user, me):
        global shared
        cx,pg=join(user,me)
        d=db(pg); print(user['uid'],'request:', d['requests'][user['uid']])
        # admin approves by direct db edit through A's adapter semantics
        r=d['requests'][user['uid']]; d['members'][user['uid']]={'name':r['name'],'email':r['email'],'role':r['role'],'batch':r['batch'],'admin':False}; del d['requests'][user['uid']]
        pg.evaluate("v=>localStorage.setItem('MOCKDB',v)", json.dumps(d))
        pg.reload(); pg.wait_for_timeout(2500)
        pg.goto(BASE+'#/person/pa'); pg.wait_for_timeout(600)
        txt=pg.locator('#main').inner_text()
        st=json.loads(pg.evaluate("localStorage.getItem('pt:v1:cloud')"))
        print(user['uid'], 'state', st.get('state'), 'role', st.get('role'), st.get('batch'), '| sees hobbies:', 'baking' in txt, '| sees food:', 'sinigang' in txt, '| sees 1995:', '1995' in txt, '| pos line:', 'First year' in txt or 'Incoming' in txt)
        shared=pg.evaluate("localStorage.getItem('MOCKDB')")
        return cx,pg
    cxb,pb=roundtrip({'uid':'ub','email':'b@x.ph','name':'Dr B'}, card('pb','Dr Bea Consultant',pos='consultant',startYear=0,cSpecialty='Child psychiatry'))
    cxc,pc=roundtrip({'uid':'uc','email':'c@x.ph','name':'Cy'}, card('pc','Cy Second',startYear=2026))
    cxd,pd=roundtrip({'uid':'ud','email':'d@x.ph','name':'Dee'}, card('pd','Dee First',startYear=2027))
    # D screens with several cards
    for r in ['batch','cup','buddies','advice','kudos','chat','polls']:
        pd.goto(BASE+'#/'+r); pd.wait_for_timeout(500)
        txt=pd.locator('#main').inner_text(); print('D',r,len(txt), [w for w in ['pt.','bt.','undefined','NaN'] if w in txt])
    pd.goto(BASE+'#/batch'); pd.wait_for_timeout(400); print('D filters:', pd.locator('.pos-filters .filter').all_inner_texts()); pd.screenshot(path=OUT+'/dept.png', full_page=True)
    pd.goto(BASE+'#/buddies'); pd.wait_for_timeout(400); pd.screenshot(path=OUT+'/buddies.png', full_page=True)
    pd.goto(BASE+'#/cup'); pd.wait_for_timeout(400); pd.screenshot(path=OUT+'/cup.png', full_page=True)
    print('D auds:', pd.evaluate("window.MOCKLOG.filter(x=>x[0]=='auds').slice(-1)[0]"))
    print('B auds:', (pb.goto(BASE+'#/chat'), pb.wait_for_timeout(600), pb.evaluate("window.MOCKLOG.filter(x=>x[0]=='auds').slice(-1)[0]"))[2])
    # polls on D
    pd.goto(BASE+'#/polls'); pd.wait_for_timeout(500)
    pd.locator('details.ch-new summary').click(); pd.fill('#poll-new [name=q]','Where do we eat?'); pd.fill('#poll-new [name=opts]','Samgyup\nSeafood'); pd.locator('#poll-new button[type=submit]').click(); pd.wait_for_timeout(900)
    pd.locator('.poll__opt').first.click(); pd.wait_for_timeout(700)
    print('poll counts:', pd.locator('.poll__n').all_inner_texts()); pd.screenshot(path=OUT+'/polls.png', full_page=True)
    # A admin panel
    pa.evaluate("v=>localStorage.setItem('MOCKDB',v)", pd.evaluate("localStorage.getItem('MOCKDB')"))
    pa.goto(BASE+'#/sync'); pa.reload(); pa.wait_for_timeout(2500)
    print('A admin rows:', pa.locator('.sync__list--adm li').count(), 'make-admin buttons:', pa.locator('[data-adminm]').count())
    pa.locator('#sy-admin').screenshot(path=OUT+'/admin.png')
    pa.goto(BASE+'#/chat'); pa.wait_for_timeout(900); pa.screenshot(path=OUT+'/chat.png', full_page=True)
    print('A channels:', pa.locator('.ch-row').count(), 'tags:', pa.locator('.aud-tag').all_inner_texts())
    br.close()
print('\n'.join(errs) or 'no errors')
