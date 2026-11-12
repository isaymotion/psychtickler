// in-memory cloud shared through localStorage key 'MOCKDB' so two "phones" (contexts on the same origin) see the same data
(function(){
  function db(){ try { return JSON.parse(localStorage.getItem('MOCKDB'))||{}; } catch(e){ return {}; } }
  function save(d){ localStorage.setItem('MOCKDB', JSON.stringify(d)); }
  var U = JSON.parse(localStorage.getItem('MOCKUSER')||'null');
  window.MOCKLOG = [];
  window.BT_CLOUD = function(cfg){
    function P(v){ return Promise.resolve(v); }
    function mem(){ var d=db(); return (d.members||{})[U.uid]||null; }
    var api = {
      user: function(){ if(!U) return null; var m=mem()||{}; return {uid:U.uid,email:U.email,name:U.name,verified:true,owner:!!U.owner,admin:!!U.owner||!!m.admin,role:m.role||'',batch:m.batch||0}; },
      setFlags: function(){}, ready: function(){ return P(api.user()); }, signIn: function(){ return P(api.user()); }, signOut: function(){ return P(); },
      getBatch: function(code){ var d=db(); return P(d.prog&&d.prog.code===code?d.prog:null); },
      setBatchInfo: function(){ return P(); }, myBatches: function(){ return P([]); },
      createBatch: function(code,name,who){ var d=db(); d.prog={code:code,name:name}; d.members={}; d.members[U.uid]={name:who.name,email:U.email,role:who.role,batch:who.batch,admin:true}; save(d); return P(); },
      status: function(code){ var d=db(); return P((d.members||{})[U.uid]?'member':(d.requests||{})[U.uid]?'pending':'none'); },
      self: function(){ var m=mem(); return P(m?{role:m.role,batch:m.batch,admin:!!m.admin}:null); },
      request: function(code,who){ var d=db(); d.requests=d.requests||{}; d.requests[U.uid]={name:who.name,email:U.email,created:Date.now(),role:who.role,batch:who.batch}; save(d); return P(); },
      cancelRequest: function(){ return P(); },
      requests: function(){ var d=db(); return P(Object.keys(d.requests||{}).map(function(k){ return Object.assign({uid:k},d.requests[k]); })); },
      approve: function(code,r){ var d=db(); d.members[r.uid]={name:r.name,email:r.email,role:r.role,batch:r.batch,admin:false}; delete d.requests[r.uid]; save(d); return P(); },
      decline: function(){ return P(); },
      members: function(){ var d=db(); return P(Object.keys(d.members||{}).map(function(k){ return Object.assign({uid:k,joined:1},d.members[k]); })); },
      setMember: function(code,uid,patch){ var d=db(); Object.assign(d.members[uid],patch); save(d); return P(); },
      removeMember: function(){ return P(); }, leave: function(){ return P(); },
      putCard: function(code,card,shared,parts){ var d=db(); d.cards=d.cards||{}; d.res=d.res||{}; d.byb=d.byb||{}; var up=Date.parse(card.updated);
        d.cards[card.id]={owner:U.uid,updated:up,shared:shared,card:card};
        if(parts.res) d.res[card.id]={owner:U.uid,updated:up,fields:parts.res};
        if(parts.year){ d.byb[parts.year]=d.byb[parts.year]||{}; d.byb[parts.year][card.id]={owner:U.uid,updated:up,fields:parts.batch}; }
        save(d); window.MOCKLOG.push(['putCard',card,parts]); return P(); },
      deleteCard: function(){ return P(); },
      cardsSince: function(code,since){ var d=db(); return P(Object.keys(d.cards||{}).filter(function(k){ return d.cards[k].updated>since; }).map(function(k){ return Object.assign({id:k},d.cards[k]); })); },
      partsSince: function(code,since,canRes,year){ var d=db(), m=mem()||{}, out=[];
        if(canRes && m.role!=='consultant') Object.keys(d.res||{}).forEach(function(k){ if(d.res[k].updated>since) out.push(Object.assign({id:k,aud:'res'},d.res[k])); });
        if(year && m.batch===year) Object.keys((d.byb||{})[year]||{}).forEach(function(k){ var x=d.byb[year][k]; if(x.updated>since) out.push(Object.assign({id:k,aud:'batch'},x)); });
        return P(out); },
      putEvent: function(code,ev){ var d=db(); d.ev=d.ev||{}; var x={title:ev.title||'',date:ev.date||'',time:ev.time||'',place:ev.place||'',note:ev.note||'',poster:+ev.poster||0,updated:Date.parse(ev.updated)||Date.now(),by:U.uid}; if(ev.deleted) x.deleted=true; d.ev[ev.id]=x; save(d); return P(); },
      eventsSince: function(code,since){ var d=db(); return P(Object.keys(d.ev||{}).filter(function(k){ return d.ev[k].updated>since; }).map(function(k){ return Object.assign({id:k},d.ev[k]); })); },
      // 1.3.0 posters; MOCKFAIL=posters makes uploads fail the way unpublished rules would
      putPoster: function(code,id,im){ if(localStorage.getItem('MOCKFAIL')==='posters') return Promise.reject({code:'permission-denied',message:'Missing or insufficient permissions.'}); var d=db(); d.posters=d.posters||{}; d.posters[id]={by:U.uid,updated:Date.now(),data:im.data,w:im.w,h:im.h}; save(d); return P(); },
      getPoster: function(code,id){ var d=db(); window.MOCKLOG.push(['getPoster',id]); return P((d.posters||{})[id]||null); },
      deletePoster: function(code,id){ var d=db(); if(d.posters) delete d.posters[id]; save(d); return P(); },
      // 1.4.0 didactics schedule; only admins may write (as the rules do); MOCKFAIL=didactics makes the write fail
      putDidactic: function(code,day,x){ var m=mem()||{}; if(localStorage.getItem('MOCKFAIL')==='didactics' || !(U.owner||m.admin)) return Promise.reject({code:'permission-denied',message:'Missing or insufficient permissions.'}); var d=db(); d.dd=d.dd||{}; d.dd[day]={topic:x.topic||'',presenter:x.presenter||'',moderator:x.moderator||'',note:x.note||'',updated:+x.updated||Date.now(),by:U.uid}; save(d); window.MOCKLOG.push(['putDidactic',day]); return P(); },
      didacticsSince: function(code,since){ var d=db(); return P(Object.keys(d.dd||{}).filter(function(k){ return d.dd[k].updated>since; }).map(function(k){ return Object.assign({id:k},d.dd[k]); })); },
      chatChannels: function(code,auds){ var d=db(); window.MOCKLOG.push(['auds',auds]); return P((d.ch||[]).filter(function(c){ return auds.indexOf(c.aud)>=0; })); },
      chatCreateChannels: function(code,list){ var d=db(); d.ch=(d.ch||[]).concat(list.map(function(c){ return Object.assign({by:U.uid,created:1,last:0,lastName:''},c); })); save(d); return P(); },
      chatChannelExists: function(){ return P(false); }, chatReports: function(){ return P([]); }, chatListen: function(){ return function(){}; }, chatOldPhotos: function(){ return P([]); },
      polls: function(){ var d=db(); return P(d.polls||[]); },
      pollCreate: function(code,p){ var d=db(); d.polls=d.polls||[]; d.polls.unshift(Object.assign({id:'p'+d.polls.length,by:U.uid,created:Date.now(),closed:false},p)); save(d); return P(); },
      pollVotes: function(code,id){ var d=db(); return P(Object.keys((d.votes||{})[id]||{}).map(function(u){ return Object.assign({uid:u},d.votes[id][u]); })); },
      pollVote: function(code,id,v){ var d=db(); d.votes=d.votes||{}; d.votes[id]=d.votes[id]||{}; d.votes[id][U.uid]=v; save(d); return P(); },
      pollUnvote: function(code,id){ var d=db(); delete d.votes[id][U.uid]; save(d); return P(); },
      pollClose: function(){ return P(); }, pollDelete: function(){ return P(); }
    };
    return api;
  };
})();
