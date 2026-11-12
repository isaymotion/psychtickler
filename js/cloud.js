/* Psych Tickler cloud adapter. Loaded on demand after js/vendor/firebase.js (window.BTFB).
   The app only talks to window.BT_CLOUD(config) -> an object of promise-returning methods, so tests can
   swap in a mock with the same shape. All data lives under programs/{code}/… (see firestore.rules); the
   Batch Tickler app uses batches/{code}/… in the same Firebase project and the two never touch.
   Differences from Batch Tickler's adapter:
   - members carry role ('resident' | 'consultant' | 'alumni'), batch (year they entered residency, 0 if none)
     and admin (true | false). Owners (config.admins) are always admins and are the only ones who change `admin`.
   - cards are split by audience: cards/{id} is what everyone in the department sees; partsRes/{id} holds the
     fields their owner marked "residents only"; byBatch/{year}/parts/{id} the ones marked "my batch only".
   - chat channels carry aud ('all' | 'res' | 'b<year>'); the rules only let the right people read them.
   - polls/{id} + polls/{id}/votes/{uid} for polls and potluck sign-ups. */
(function () {
  'use strict';
  if (window.BT_CLOUD) return;   // a test mock is already in place
  window.BT_CLOUD = function (cfg) {
    var F = window.BTFB;
    if (!F) throw new Error('firebase-missing');
    var app = F.initializeApp(cfg.firebase), auth = F.getAuth(app), db = F.getFirestore(app);
    var admins = (cfg.admins || []).map(function (e) { return String(e).toLowerCase(); });
    var ROOT = cfg.root || 'programs', flags = { admin: false, role: '', batch: 0 };
    var readyP = null;

    function d() { return F.doc.apply(null, [db].concat([].slice.call(arguments))); }
    function col() { return F.collection.apply(null, [db].concat([].slice.call(arguments))); }
    function me() { var u = auth.currentUser; if (!u) throw new Error('signed-out'); return u; }
    function rows(snap) { var out = []; snap.forEach(function (s) { var x = s.data() || {}; x._id = s.id; out.push(x); }); return out; }
    function user() {
      var u = auth.currentUser; if (!u) return null;
      var email = String(u.email || '').toLowerCase();
      var owner = !!(u.emailVerified && admins.indexOf(email) >= 0);
      return { uid: u.uid, email: email, name: u.displayName || '', verified: !!u.emailVerified, owner: owner, admin: owner || !!flags.admin, role: flags.role, batch: flags.batch };
    }

    return {
      user: user,
      ready: function () {   // resolves once the saved sign-in (if any) has been restored
        if (readyP) return readyP;
        readyP = F.setPersistence(auth, F.indexedDBLocalPersistence).catch(function () { return F.setPersistence(auth, F.browserLocalPersistence).catch(function () {}); })
          .then(function () { return F.getRedirectResult(auth).catch(function () { return null; }); })
          .then(function () { return new Promise(function (res) { var off = F.onAuthStateChanged(auth, function () { off(); res(user()); }); }); });
        return readyP;
      },
      signIn: function () {
        var p = new F.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
        return F.signInWithPopup(auth, p).then(user).catch(function (e) {
          var c = e && e.code || '';
          // Installed iPhone apps can refuse popups: fall back to a full-page redirect (the page reloads afterwards).
          if (/popup-blocked|operation-not-supported|web-storage-unsupported/.test(c)) return F.signInWithRedirect(auth, p).then(function () { return new Promise(function () {}); });
          throw e;
        });
      },
      signOut: function () { return F.signOut(auth); },

      getBatch: function (code) { return F.getDoc(d(ROOT, code)).then(function (s) { return s.exists() ? Object.assign({ code: code }, s.data()) : null; }); },
      setBatchInfo: function (code, info) { return F.setDoc(d(ROOT, code), info, { merge: true }); },   // admin only (rules)
      myBatches: function () { return F.getDocs(col(ROOT)).then(function (s) { return rows(s).map(function (x) { return { code: x._id, name: x.name || '' }; }); }); },
      createBatch: function (code, name, who) {
        var u = me(), b = F.writeBatch(db), now = Date.now();
        b.set(d(ROOT, code), { name: name, created: now, by: u.uid });
        b.set(d(ROOT, code, 'members', u.uid), { name: who.name || '', email: user().email, joined: now, role: who.role || 'resident', batch: who.batch || 0, admin: true });
        return b.commit();
      },
      status: function (code) {   // 'member' | 'pending' | 'none'
        var u = me();
        return F.getDoc(d(ROOT, code, 'members', u.uid)).then(function (s) {
          if (s.exists()) { var m = s.data() || {}; flags = { admin: !!m.admin, role: m.role || 'resident', batch: +m.batch || 0 }; return 'member'; }
          return F.getDoc(d(ROOT, code, 'requests', u.uid)).then(function (r) { return r.exists() ? 'pending' : 'none'; });
        });
      },
      setFlags: function (f) { flags = { admin: !!(f && f.admin), role: (f && f.role) || '', batch: +(f && f.batch) || 0 }; },   // remembered from the last sync, so the right buttons show before the network answers
      self: function (code) {   // my own member row: role, batch, admin
        return F.getDoc(d(ROOT, code, 'members', me().uid)).then(function (s) {
          if (!s.exists()) return null;
          var m = s.data() || {}; flags = { admin: !!m.admin, role: m.role || 'resident', batch: +m.batch || 0 };
          return { role: flags.role, batch: flags.batch, admin: flags.admin };
        });
      },
      request: function (code, who) { var u = me(); return F.setDoc(d(ROOT, code, 'requests', u.uid), { name: who.name || '', email: u.email || '', created: Date.now(), role: who.role || 'resident', batch: +who.batch || 0 }); },   // email exactly as in the sign-in token (the rules compare them)
      cancelRequest: function (code) { return F.deleteDoc(d(ROOT, code, 'requests', me().uid)); },
      requests: function (code) { return F.getDocs(col(ROOT, code, 'requests')).then(function (s) { return rows(s).map(function (x) { return { uid: x._id, name: x.name || '', email: x.email || '', created: x.created || 0, role: x.role || 'resident', batch: +x.batch || 0 }; }); }); },
      approve: function (code, r) {
        var b = F.writeBatch(db);
        b.set(d(ROOT, code, 'members', r.uid), { name: r.name || '', email: r.email || '', joined: Date.now(), role: r.role || 'resident', batch: +r.batch || 0, admin: false });
        b.delete(d(ROOT, code, 'requests', r.uid));
        return b.commit();
      },
      decline: function (code, uid) { return F.deleteDoc(d(ROOT, code, 'requests', uid)); },
      members: function (code) { return F.getDocs(col(ROOT, code, 'members')).then(function (s) { return rows(s).map(function (x) { return { uid: x._id, name: x.name || '', email: x.email || '', joined: x.joined || 0, role: x.role || 'resident', batch: +x.batch || 0, admin: !!x.admin }; }); }); },
      setMember: function (code, uid, patch) { return F.updateDoc(d(ROOT, code, 'members', uid), patch); },   // admin: {role, batch}; owner: {admin}
      removeMember: function (code, uid, batch) {   // admin: the member, every card they uploaded and the restricted parts of those cards
        // the parts are deleted by card id, without reading them: an admin who is a consultant may not read residents-only parts
        return F.getDocs(F.query(col(ROOT, code, 'cards'), F.where('owner', '==', uid))).then(function (s) {
          var b = F.writeBatch(db);
          s.forEach(function (x) { b.delete(x.ref); b.delete(d(ROOT, code, 'partsRes', x.id)); if (batch) b.delete(d(ROOT, code, 'byBatch', String(batch), 'parts', x.id)); });
          b.delete(d(ROOT, code, 'members', uid)); return b.commit();
        });
      },
      leave: function (code) {   // delete my cards and their parts first (owner rule), then my membership
        var u = me(), qs = [F.getDocs(F.query(col(ROOT, code, 'cards'), F.where('owner', '==', u.uid))), F.getDocs(F.query(col(ROOT, code, 'partsRes'), F.where('owner', '==', u.uid))).catch(function () { return null; })];
        if (flags.batch) qs.push(F.getDocs(F.query(col(ROOT, code, 'byBatch', String(flags.batch), 'parts'), F.where('owner', '==', u.uid))).catch(function () { return null; }));
        return Promise.all(qs).then(function (ss) {
          var b = F.writeBatch(db); ss.forEach(function (s) { if (s) s.forEach(function (x) { b.delete(x.ref); }); }); return b.commit();
        }).then(function () { return F.deleteDoc(d(ROOT, code, 'members', u.uid)); });
      },

      /* parts = { res: {field: value}, batch: {field: value}, year: my batch year or 0, oldYear: the year my batch part was last written under }.
         The public card never contains a restricted value; the parts are rewritten on every save (empty when nothing is restricted). */
      putCard: function (code, card, shared, parts) {
        var u = me(), b = F.writeBatch(db), up = Date.parse(card.updated) || Date.now(); parts = parts || {};
        b.set(d(ROOT, code, 'cards', card.id), { owner: u.uid, updated: up, shared: { emergency: !!shared.emergency, contact: !!shared.contact }, card: card });
        if (parts.res) b.set(d(ROOT, code, 'partsRes', card.id), { owner: u.uid, updated: up, fields: parts.res });
        if (parts.year) b.set(d(ROOT, code, 'byBatch', String(parts.year), 'parts', card.id), { owner: u.uid, updated: up, fields: parts.batch || {} });
        if (parts.oldYear && parts.oldYear !== parts.year) b.delete(d(ROOT, code, 'byBatch', String(parts.oldYear), 'parts', card.id));
        return b.commit();
      },
      partsSince: function (code, since, canRes, year) {   // the restricted parts I am allowed to read; since < 0 = all of them
        function q(c) { return since >= 0 ? F.query(c, F.where('updated', '>', since)) : c; }
        function get(c, aud) { return F.getDocs(q(c)).then(function (s) { return rows(s).map(function (x) { return { id: x._id, aud: aud, owner: x.owner, updated: x.updated || 0, fields: x.fields || {} }; }); }).catch(function () { return []; }); }
        return Promise.all([canRes ? get(col(ROOT, code, 'partsRes'), 'res') : [], year ? get(col(ROOT, code, 'byBatch', String(year), 'parts'), 'batch') : []]).then(function (r) { return r[0].concat(r[1]); });
      },
      deleteCard: function (code, id) { return F.deleteDoc(d(ROOT, code, 'cards', id)); },   // owner rule: only my own
      cardsSince: function (code, since) {   // since < 0 = every card (daily full pull)
        var q = since >= 0 ? F.query(col(ROOT, code, 'cards'), F.where('updated', '>', since)) : col(ROOT, code, 'cards');
        return F.getDocs(q).then(function (s) { return rows(s).map(function (x) { return { id: x._id, owner: x.owner, updated: x.updated || 0, shared: x.shared || {}, card: x.card }; }); });
      },
      putEvent: function (code, ev) {
        var x = { title: ev.title || '', date: ev.date || '', time: ev.time || '', place: ev.place || '', note: ev.note || '', poster: +ev.poster || 0, updated: Date.parse(ev.updated) || Date.now(), by: me().uid };
        if (ev.deleted) x.deleted = true;
        return F.setDoc(d(ROOT, code, 'events', ev.id), x);
      },
      // 1.3.0 event posters: one small picture per event, kept apart from the event so the event list stays light
      putPoster: function (code, id, im) { return F.setDoc(d(ROOT, code, 'posters', id), { by: me().uid, updated: Date.now(), data: im.data, w: +im.w || 0, h: +im.h || 0 }); },
      getPoster: function (code, id) { return F.getDoc(d(ROOT, code, 'posters', id)).then(function (s) { return s.exists() ? s.data() : null; }); },
      deletePoster: function (code, id) { return F.deleteDoc(d(ROOT, code, 'posters', id)); },   // rule: whoever uploaded it, or an admin
      eventsSince: function (code, since) {
        return F.getDocs(F.query(col(ROOT, code, 'events'), F.where('updated', '>', since))).then(function (s) { return rows(s).map(function (x) { x.id = x._id; delete x._id; return x; }); });
      },

      // 1.4.0 didactics schedule: one row per Thursday (id = the date). Admins write (rules), members read.
      putDidactic: function (code, day, x) { return F.setDoc(d(ROOT, code, 'didactics', day), { topic: x.topic || '', presenter: x.presenter || '', moderator: x.moderator || '', note: x.note || '', updated: +x.updated || Date.now(), by: me().uid }); },
      didacticsSince: function (code, since) {
        return F.getDocs(F.query(col(ROOT, code, 'didactics'), F.where('updated', '>', since))).then(function (s) { return rows(s).map(function (x) { x.id = x._id; delete x._id; return x; }); });
      },

      /* ---- chat: programs/{code}/channels/{id} + …/messages/{mid}; reports in programs/{code}/reports ---- */
      chatChannels: function (code, auds) {   // one query per audience I may read: the rules check the audience, so an unfiltered list would be refused
        return Promise.all((auds || ['all']).map(function (a) {
          return F.getDocs(F.query(col(ROOT, code, 'channels'), F.where('aud', '==', a))).then(function (s) { return rows(s).map(function (x) { x.id = x._id; delete x._id; return x; }); }).catch(function () { return []; });
        })).then(function (r) { return [].concat.apply([], r); });
      },
      chatCreateChannels: function (code, list) {   // [{id, name, emoji, order}] — fails if one already exists (rules allow create only)
        var u = me(), b = F.writeBatch(db), now = Date.now();
        list.forEach(function (c) { b.set(d(ROOT, code, 'channels', c.id), { name: c.name, emoji: c.emoji || '', order: c.order || 0, by: u.uid, created: now, last: 0, lastName: '', aud: c.aud || 'all' }); });
        return b.commit();
      },
      chatChannelExists: function (code, id) { return F.getDoc(d(ROOT, code, 'channels', id)).then(function (s) { return s.exists(); }, function () { return true; }); },   // refused = it exists but is not mine to read
      chatOldPhotos: function (code, ch, before, n) {   // admin housekeeping: messages older than `before` that still carry a photo
        return F.getDocs(F.query(col(ROOT, code, 'channels', ch, 'messages'), F.where('created', '<', before), F.orderBy('created', 'asc'), F.limit(n || 100)))
          .then(function (s) { var out = []; s.forEach(function (x) { if ((x.data() || {}).img) out.push(x.id); }); return out; });
      },
      chatRenameChannel: function (code, id, name, emoji) { return F.updateDoc(d(ROOT, code, 'channels', id), { name: name, emoji: emoji || '' }); },
      chatDeleteChannel: function (code, id) {   // messages first (in pages), then the channel
        function page() {
          return F.getDocs(F.query(col(ROOT, code, 'channels', id, 'messages'), F.limit(200))).then(function (s) {
            if (s.empty) return;
            var b = F.writeBatch(db); s.forEach(function (x) { b.delete(x.ref); });
            return b.commit().then(page);
          });
        }
        return page().then(function () { return F.deleteDoc(d(ROOT, code, 'channels', id)); });
      },
      chatListen: function (code, ch, n, onList, onErr) {   // realtime: the newest n messages of the open channel only
        var q = F.query(col(ROOT, code, 'channels', ch, 'messages'), F.orderBy('created', 'desc'), F.limit(n));
        return F.onSnapshot(q, function (s) { onList(rows(s).map(function (x) { x.id = x._id; delete x._id; return x; })); }, function (e) { if (onErr) onErr(e); });
      },
      chatOlder: function (code, ch, before, n) {
        return F.getDocs(F.query(col(ROOT, code, 'channels', ch, 'messages'), F.orderBy('created', 'desc'), F.where('created', '<', before), F.limit(n)))
          .then(function (s) { return rows(s).map(function (x) { x.id = x._id; delete x._id; return x; }); });
      },
      chatSend: function (code, ch, msg) {   // the message and the channel's "last" in one write
        var u = me(), ref = F.doc(F.collection(db, ROOT, code, 'channels', ch, 'messages')), b = F.writeBatch(db);
        var m = Object.assign({}, msg, { uid: u.uid });
        b.set(ref, m);
        b.update(d(ROOT, code, 'channels', ch), { last: m.created, lastName: m.name });
        return b.commit().then(function () { return ref.id; });
      },
      chatReact: function (code, ch, mid, key, on) {
        var x = {}; x['react.' + key] = on ? F.arrayUnion(me().uid) : F.arrayRemove(me().uid);
        return F.updateDoc(d(ROOT, code, 'channels', ch, 'messages', mid), x);
      },
      chatDelete: function (code, ch, mid) { return F.deleteDoc(d(ROOT, code, 'channels', ch, 'messages', mid)); },
      chatReport: function (code, r) { return F.addDoc(col(ROOT, code, 'reports'), Object.assign({}, r, { by: me().uid, created: Date.now() })); },
      chatReports: function (code) { return F.getDocs(col(ROOT, code, 'reports')).then(function (s) { return rows(s).map(function (x) { x.id = x._id; delete x._id; return x; }); }); },
      chatDismiss: function (code, id) { return F.deleteDoc(d(ROOT, code, 'reports', id)); },

      /* ---- polls and potluck sign-ups: programs/{code}/polls/{id} + …/votes/{uid} ---- */
      polls: function (code) { return F.getDocs(F.query(col(ROOT, code, 'polls'), F.orderBy('created', 'desc'), F.limit(30))).then(function (s) { return rows(s).map(function (x) { x.id = x._id; delete x._id; return x; }); }); },
      pollCreate: function (code, p) { var u = me(); return F.addDoc(col(ROOT, code, 'polls'), { kind: p.kind, q: p.q, opts: p.opts, by: u.uid, name: p.name || '', created: Date.now(), closed: false }).then(function (r) { return r.id; }); },
      pollVotes: function (code, id) { return F.getDocs(col(ROOT, code, 'polls', id, 'votes')).then(function (s) { return rows(s).map(function (x) { return { uid: x._id, o: x.o, name: x.name || '', text: x.text || '' }; }); }); },
      pollVote: function (code, id, v) { return F.setDoc(d(ROOT, code, 'polls', id, 'votes', me().uid), { o: v.o, name: v.name || '', text: v.text || '', at: Date.now() }); },
      pollUnvote: function (code, id) { return F.deleteDoc(d(ROOT, code, 'polls', id, 'votes', me().uid)); },
      pollClose: function (code, id, closed) { return F.updateDoc(d(ROOT, code, 'polls', id), { closed: !!closed }); },
      pollDelete: function (code, id) {
        return F.getDocs(col(ROOT, code, 'polls', id, 'votes')).then(function (s) { var b = F.writeBatch(db); s.forEach(function (x) { b.delete(x.ref); }); b.delete(d(ROOT, code, 'polls', id)); return b.commit(); });
      }
    };
  };
})();
