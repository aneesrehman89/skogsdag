/* ===== Skogsdag – built for Norther Loggers, Jokkmokk =====
   Lars's own data stays on the phone (localStorage). Public data is read live from
   Skogsstyrelsen (fellings, protected sites) and Open-Meteo (weather, ground frost);
   data.js is the offline backup. No links leave the app. */
const P={home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',leads:'<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',calc:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8.5 7.5h7M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01"/>',log:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',mem:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.8c2 .6 3.5 2.2 3.5 5.2"/>',rep:'<path d="M5 20V10M12 20V4M19 20v-7"/>',set:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',plus:'<path d="M12 5v14M5 12h14"/>',chev:'<path d="m9 6 6 6-6 6"/>',back:'<path d="m15 6-6 6 6 6"/>',eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',cog:'<path d="M4 17h3l2-9h6l2 9h3"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/>',ok:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',warn:'<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4M12 17h.01"/>',snow:'<path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9"/>',play:'<path d="M7 5v14l11-7z"/>',map:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',tree:'<path d="m12 3 5.5 7H15l4 6H5l4-6H6.5z"/><path d="M12 16v5"/>',phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',copy:'<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',share:'<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',dl:'<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 20h14"/>'};
const ic=n=>`<svg class="i" viewBox="0 0 24 24">${P[n]}</svg>`;
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const nf=(n,dec=0)=>(Number(n)||0).toLocaleString('sv-SE',{maximumFractionDigits:dec});
const kr=n=>nf(Math.round(n))+' kr';
const DAY=864e5;

/* ---------- Swedish time (the phone may be set to another time zone) ---------- */
const TZ='Europe/Stockholm';
const fmtISO=new Intl.DateTimeFormat('en-CA',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'});
const iso=t=>fmtISO.format(t==null?new Date():new Date(t));
const sHour=()=>+new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',hourCycle:'h23'}).format(new Date());
const dUTC=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10));
const addD=(s,n)=>new Date(dUTC(s)+n*DAY).toISOString().slice(0,10);
let today=iso();
const monday=()=>addD(today,-((new Date(dUTC(today)).getUTCDay()+6)%7));
const loc=()=>lang==='sv'?'sv-SE':'en-GB';
const fmtD=(x,o)=>typeof x==='string'&&x.length===10?new Date(dUTC(x)).toLocaleDateString(loc(),{timeZone:'UTC',day:'numeric',month:'short',...o}):new Date(x).toLocaleDateString(loc(),{timeZone:TZ,day:'numeric',month:'short',...o});

/* ---------- state ---------- */
const TYPES={
  avv:{sv:'Slutavverkning',en:'Final felling',unit:'m³',price:145,prod:11,hcost:950,dl:14,move:true},
  gal:{sv:'Gallring',en:'Thinning',unit:'m³',price:260,prod:6,hcost:950,dl:12,move:true},
  mark:{sv:'Markberedning',en:'Site preparation',unit:'ha',price:3200,prod:0.9,hcost:1100,dl:18,move:true},
  plant:{sv:'Plantering',en:'Planting',unit:'ha',price:4500,prod:0.1,hcost:380,dl:0,move:false},
  roj:{sv:'Röjning',en:'Pre-commercial thinning',unit:'ha',price:3500,prod:0.12,hcost:420,dl:1,move:false}};
const STAT=[['ny','Ny','New'],['kont','Kontaktad','Contacted'],['off','Offert skickad','Quote sent'],['vun','Vunnet','Won'],['forl','Förlorat','Lost']];
let S;
try{S=JSON.parse(localStorage.getItem('skogsdag2'))}catch(e){}
if(!S){S={lang:'sv',home:{name:'Jokkmokk',lat:66.6066,lon:19.8229},radius:100,m3ha:130,diesel:21,movekm:40,target:15,hide:false,
  co:{name:'Norther Loggers',person:'Lars Forsell',org:'',phone:'',email:''},jobs:[],logs:[],contacts:[],machines:[],demo:true,my:{}};seed()}
S.f=Object.assign({per:'d30',kom:'',dist:0,sort:'new'},S.f||{});if(!['today','week','last','d30'].includes(S.f.per))S.f.per='d30';
function save(){try{localStorage.setItem('skogsdag2',JSON.stringify(S))}catch(e){}}
let lang=S.lang,view='home',param='',leadTab='av',leads=null,leadsInfo='',C=null,WX={},RISK={},maps=[],shown=40,installEvt=null;
const L=(sv,en)=>lang==='sv'?sv:en;
const tname=k=>L(TYPES[k].sv,TYPES[k].en);
function seed(){
  const d=n=>addD(today,-n);
  S.jobs=[{id:'j1',name:'Kåbdalis 4:12',type:'avv',unit:'m³',qty:900,price:145,hcost:950,dl:14,dprice:21,moveCost:4800,other:0,estCost:108000,done:false},
          {id:'j2',name:'Vuollerim gallring',type:'gal',unit:'m³',qty:320,price:260,hcost:950,dl:12,dprice:21,moveCost:2400,other:0,estCost:66000,done:false}];
  S.logs=[[1,'j1',9,118,130,'Bra bärighet, tjäle i marken.','m1'],[2,'j1',8.5,102,121,'','m1'],[4,'j2',8,44,96,'Byte av hydraulslang, 1 h stopp.','m2'],[5,'j1',9,109,128,'','m1'],[7,'j2',7.5,41,90,'','m2'],[8,'j1',9,112,126,'','m1'],[9,'j1',8,96,117,'','m1'],[11,'j2',8,47,95,'','m2']]
    .map((r,i)=>({id:'l'+i,jobId:r[1],date:d(r[0]),hours:r[2],qty:r[3],diesel:r[4],note:r[5],machine:r[6]}));
  S.machines=[{id:'m1',name:'Skördare',hours:6120,every:500,last:5750},{id:'m2',name:'Skotare',hours:4482,every:500,last:4000}];
  S.contacts=[{id:'c1',name:'Anders Nilsson (markägare)',phone:'',status:'kont',follow:d(-2),notes:[{d:d(6),t:'Har ca 12 ha vid Purkijaur som ska gallras i vinter. Vill ha pris per m³. Ring efter älgjakten.'}]},
              {id:'c2',name:'Sveaskog – produktionsledare',phone:'',status:'off',follow:d(0),notes:[{d:d(9),t:'Skickat offert på markberedning 40 ha. Besked väntas inom två veckor.'}]}];
}

/* ---------- numbers ---------- */
function jobActual(j){const ls=S.logs.filter(l=>l.jobId===j.id),sum=k=>ls.reduce((a,l)=>a+(+l[k]||0),0),hours=sum('hours'),qty=sum('qty'),diesel=sum('diesel');
  const rev=qty*j.price,cost=hours*j.hcost+diesel*(j.dprice||S.diesel)+(ls.length?(j.moveCost||0)+(j.other||0):0);return {hours,qty,diesel,rev,cost,profit:rev-cost,n:ls.length}}
function monthTotals(ym){let rev=0,cost=0,hours=0,m3=0,diesel=0;
  S.logs.filter(l=>l.date.slice(0,7)===ym).forEach(l=>{const j=S.jobs.find(x=>x.id===l.jobId);if(!j)return;rev+=(+l.qty||0)*j.price;cost+=(+l.hours||0)*j.hcost+(+l.diesel||0)*(j.dprice||S.diesel);hours+=+l.hours||0;diesel+=+l.diesel||0;if(j.unit==='m³')m3+=+l.qty||0});
  return {rev,cost,hours,m3,diesel,profit:rev-cost}}
const dist=(a,b,c,d)=>{const R=6371,p=Math.PI/180,x=Math.sin((c-a)*p/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin((d-b)*p/2)**2;return 2*R*Math.asin(Math.sqrt(x))};
function spark(){const pts=[];for(let i=13;i>=0;i--){const k=addD(today,-i);pts.push(S.logs.filter(l=>l.date===k).reduce((a,l)=>{const j=S.jobs.find(x=>x.id===l.jobId);return a+(j?(+l.qty||0)*j.price:0)},0))}
  const mx=Math.max(...pts,1);return `<svg viewBox="0 0 140 36" style="width:140px;height:36px;display:block">${pts.map((v,i)=>`<rect x="${i*10+1}" y="${34-v/mx*30}" width="6" height="${Math.max(2,v/mx*30)}" rx="3" fill="${i===13?'#E2B24C':'rgba(255,255,255,.35)'}"/>`).join('')}</svg>`}
/* WGS84 -> SWEREF 99 TM (the grid used by Lantmäteriet's maps) */
function sweref(lat,lon){const a=6378137,f=1/298.257222101,k0=.9996,l0=15*Math.PI/180,e2=f*(2-f),n=f/(2-f),ar=a/(1+n)*(1+n*n/4+n**4/64),A=e2,B=(5*e2*e2-e2**3)/6,C=(104*e2**3-45*e2**4)/120,D=1237*e2**4/1260,
  b=[n/2-2*n*n/3+5*n**3/16+41*n**4/180,13*n*n/48-3*n**3/5+557*n**4/1440,61*n**3/240-103*n**4/140,49561*n**4/161280],p=lat*Math.PI/180,dl=lon*Math.PI/180-l0,s=Math.sin(p),
  ps=p-s*Math.cos(p)*(A+B*s*s+C*s**4+D*s**6),xi=Math.atan(Math.tan(ps)/Math.cos(dl)),et=Math.atanh(Math.cos(ps)*Math.sin(dl));let N=xi,E=et;
  b.forEach((bi,i)=>{const k=2*(i+1);N+=bi*Math.sin(k*xi)*Math.cosh(k*et);E+=bi*Math.cos(k*xi)*Math.sinh(k*et)});return [Math.round(k0*ar*N),Math.round(k0*ar*E+5e5)]}

/* ---------- public data ---------- */
const SKS='https://geodpags.skogsstyrelsen.se/arcgis/rest/services/Geodataportal/';
async function getJ(url,ms=15000){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);try{const r=await fetch(url,{signal:c.signal});return await r.json()}finally{clearTimeout(t)}}
const TYP={'Föryngringsavverkning':['Slutavverkning','Final felling'],'Avverkning för annat ändamål':['Avverkning för annat ändamål','Felling for other land use']};
const typName=t=>{const x=TYP[t]||(/bevara/i.test(t||'')?['Naturvårdsavverkning','Conservation felling']:[t,t]);return L(x[0],x[1])};
function mkLead(r){const [id,kom,typ,ts,ha,plant,lat,lon,ring]=r,km=dist(S.home.lat,S.home.lon,lat,lon),ld=iso(ts),days=Math.round((dUTC(today)-dUTC(ld))/DAY);
  const sc=55-Math.min(km/150,1)*40+Math.min(ha,20)/20*25+(days<7?15:days<21?8:0)+(plant>0?4:0);
  return {k:'av',id,kom,typ,ts,ld,ha,plant,lat,lon,ring,km,days,score:Math.max(1,Math.min(99,Math.round(sc))),free:ts+42*DAY}}
const allLeads=()=>leads?leads.list:[];
const nearLeads=()=>allLeads().filter(l=>l.km<=S.radius);
let RP=null;
const utLead=r=>{const [id,kom,ts,ha,plant,lat,lon,ring]=r,km=dist(S.home.lat,S.home.lon,lat,lon);
  return {k:'ut',id,kom,typ:L('Avverkat – ska återbeskogas','Felled – must be replanted'),ts,ld:iso(ts),ha,plant,lat,lon,ring,km,score:Math.max(1,Math.min(99,Math.round(60-Math.min(km/S.radius,1)*40+Math.min(plant,20)/20*35)))}};
function buildReplant(){const key=S.radius+'|'+S.home.lat+','+S.home.lon+'|'+lang;if(RP&&RP.k===key)return RP.v;
  const v=(SNAP.ut||[]).map(utLead).filter(l=>l.km<=S.radius).sort((a,b)=>b.score-a.score);RP={k:key,v};return v}
function buildPacks(ls){
  const used=new Set(),out=[];
  [...ls].sort((a,b)=>b.ha-a.ha).forEach(a=>{if(used.has(a.id))return;const g=ls.filter(b=>!used.has(b.id)&&dist(a.lat,a.lon,b.lat,b.lon)<=6);
    if(g.length>=2){g.forEach(x=>used.add(x.id));const ha=g.reduce((s,x)=>s+x.ha,0);out.push({id:'P-'+a.id,items:g,ha,km:a.km,kom:a.kom,lat:a.lat,lon:a.lon,val:ha*S.m3ha*TYPES.avv.price,saved:(g.length-1)*a.km*1.3*2*S.movekm})}});
  return out.sort((a,b)=>b.ha/(1+b.km/50)-a.ha/(1+a.km/50));
}
/* filters: period, municipality, distance, sort */
const PERS=[['today','Idag','Today'],['week','Denna vecka','This week'],['last','Förra veckan','Last week'],['d30','30 dagar','30 days']];
function inPer(l,p){const m=monday();return p==='today'?l.ld===today:p==='week'?l.ld>=m:p==='last'?l.ld>=addD(m,-7)&&l.ld<m:l.ld>=addD(today,-29)}
function applyF(ls,skip){const f=S.f;return ls.filter(l=>(skip==='per'||inPer(l,f.per))&&(skip==='kom'||!f.kom||l.kom===f.kom)&&(skip==='dist'||!f.dist||l.km<=f.dist))}
function sortF(ls){const s=S.f.sort;return [...ls].sort(s==='score'?(a,b)=>b.score-a.score:s==='big'?(a,b)=>b.ha-a.ha:s==='near'?(a,b)=>a.km-b.km:(a,b)=>b.ts-a.ts)}
function setLeads(rows,src){const first=!leads;leads={list:rows.map(mkLead)};leadsInfo=src;
  if(view==='home'){const el=$('#homeleads');if(el)el.innerHTML=homeLeadsHtml()}
  else if(view==='leads'&&(first||leadsBusy))render(true)
  else if((view==='lead'||view==='pack')&&first)render(true)}
let leadsBusy=false;
async function loadLeads(force){
  if(leads&&!force)return;leadsBusy=!!force;
  try{const q=new URLSearchParams({where:`Lannr='25' AND Inkomdatum >= DATE '${addD(today,-31)}'`,outFields:'Kommun,Beteckn,Avverktyp,Inkomdatum,AnmaldHa,SkogsodlHa',returnGeometry:'true',outSR:'4326',maxAllowableOffset:'0.0004',geometryPrecision:'5',orderByFields:'Inkomdatum DESC',f:'json'});
    const j=await getJ(SKS+'GeodataportalVisaAvverkningsanmalan/MapServer/0/query?'+q,25000);
    if(j.features&&j.features.length){const rows=j.features.filter(x=>x.geometry&&x.geometry.rings).map(x=>{const a=x.attributes,g=x.geometry.rings.reduce((m,r)=>r.length>m.length?r:m,[]),flat=[];g.forEach(p=>flat.push(+p[1].toFixed(5),+p[0].toFixed(5)));
        return [a.Beteckn,a.Kommun.charAt(0)+a.Kommun.slice(1).toLowerCase(),a.Avverktyp,a.Inkomdatum,a.AnmaldHa||0,a.SkogsodlHa||0,g.reduce((s,p)=>s+p[1],0)/g.length,g.reduce((s,p)=>s+p[0],0)/g.length,flat]});
      setLeads(rows,L('Live från Skogsstyrelsen kl ','Live from the Swedish Forest Agency at ')+new Date().toLocaleTimeString('sv-SE',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}))}
    else throw new Error('empty');
  }catch(e){if(!leads)setLeads(SNAP.av||[],L('Sparad data från ','Saved data from ')+fmtD(SNAP.date));else if(force)toast(L('Ingen täckning – visar sparad data','No signal – showing saved data'))}
  leadsBusy=false;
}
/* weather + ground frost (Open-Meteo, free) */
async function wx(lat,lon){
  const k=lat.toFixed(1)+','+lon.toFixed(1);if(WX[k])return WX[k];
  const j=await getJ(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&current=temperature_2m,wind_gusts_10m,snow_depth,soil_temperature_6cm,soil_temperature_18cm&daily=temperature_2m_max,temperature_2m_min,wind_gusts_10m_max,snowfall_sum,sunrise,sunset,daylight_duration&timezone=Europe%2FStockholm&wind_speed_unit=ms&forecast_days=7`,12000);
  const c=j.current,d=j.daily,s6=c.soil_temperature_6cm,s18=c.soil_temperature_18cm;
  const ground=s6<=-1&&s18<0?{c:'',sv:'Tjäle – marken bär maskiner',en:'Frozen ground – carries machines'}:s6<0?{c:'a',sv:'Ytfruset – bär inte tunga maskiner än',en:'Surface frost – will not carry heavy machines yet'}:{c:'r',sv:'Ofruset – undvik blöt mark',en:'Not frozen – avoid wet ground'};
  const days=d.time.map((t,i)=>{const g=d.wind_gusts_10m_max[i],mx=d.temperature_2m_max[i],mn=d.temperature_2m_min[i],sn=d.snowfall_sum[i];let c='',why=['Bra arbetsdag','Good working day'];
    if(g>=15){c='r';why=[`Hårda vindbyar ${nf(g)} m/s – fällning farlig`,`Gusts ${nf(g)} m/s – felling dangerous`]}else if(mn<=-30){c='r';why=[`${nf(mn)}° – risk för maskinskador`,`${nf(mn)}° – risk of machine damage`]}
    else if(g>=11){c='a';why=[`Byig vind ${nf(g)} m/s`,`Gusty ${nf(g)} m/s`]}else if(mx>1.5){c='a';why=[`Töväder ${nf(mx)}° – mjukare mark och väg`,`Thaw ${nf(mx)}° – softer ground and roads`]}else if(sn>=10){c='a';why=[`Snöfall ${nf(sn)} cm`,`Snowfall ${nf(sn)} cm`]}else if(mn<=-25){c='a';why=[`${nf(mn)}° – varmkör hydrauliken`,`${nf(mn)}° – warm up the hydraulics`]}
    return {t,c,why,mx,mn,g}});
  const hm=s=>s.slice(11,16),dl=d.daylight_duration[0];
  return WX[k]={temp:c.temperature_2m,gust:c.wind_gusts_10m,snow:Math.round((c.snow_depth||0)*100),ground,days,rise:hm(d.sunrise[0]),set:hm(d.sunset[0]),light:Math.floor(dl/3600)+' h '+Math.round(dl%3600/60)+' min'};
}
const wday=t=>new Date(dUTC(t)).toLocaleDateString(loc(),{timeZone:'UTC',weekday:'short'}).replace('.','').slice(0,2);
const weekHtml=(w,light)=>`<div class="week ${light?'light':''}">${w.days.map(d=>`<div title="${esc(L(d.why[0],d.why[1]))}"><i class="${d.c}"></i>${wday(d.t)}</div>`).join('')}</div>`;
/* rule check: protected and sensitive sites around a felling (Skogsstyrelsen open data) */
const RL=[[1,'r','Biotopskyddsområde','Habitat protection area',a=>a.Biotyp],[2,'r','Naturvårdsavtal','Nature conservation agreement',a=>a.NvaTyp],[3,'r','Nyckelbiotop','Woodland key habitat',a=>[a.Objnamn,a.Biotop1].filter(Boolean).join(' – ')],[4,'a','Objekt med naturvärden','Site with nature values',a=>a.Objnamn],[5,'a','Sumpskog – kör bara på tjälad mark','Swamp forest – drive only on frozen ground',a=>(a.Hydrtext||'').trim()],[8,'a','Kulturlämning (punkt)','Cultural remain (point)',a=>a.Sakord||a.Lamnnamn],[9,'a','Kulturlämning (linje)','Cultural remain (line)',a=>a.Sakord||a.Lamnnamn],[10,'a','Kulturlämning (yta)','Cultural remain (area)',a=>a.Sakord||a.Lamnnamn]];
async function riskCheck(l){
  if(RISK[l.id])return RISK[l.id];
  const m=Math.round(Math.sqrt(l.ha*1e4/Math.PI)+100),q=d=>new URLSearchParams({geometry:l.lon+','+l.lat,geometryType:'esriGeometryPoint',inSR:'4326',distance:d,units:'esriSRUnit_Meter',spatialRel:'esriSpatialRelIntersects',outFields:'*',returnGeometry:'false',f:'json'});
  const res=await Promise.allSettled([...RL.map(r=>getJ(SKS+'GeodataportalVisaNaturkultur/MapServer/'+r[0]+'/query?'+q(m))),getJ(SKS+'GeodataportalVisaFjallnaragransyta/MapServer/0/query?'+q(1))]);
  const hits=[];let fail=0;
  res.forEach((r,i)=>{if(r.status!=='fulfilled'||!r.value.features){fail++;return}const n=r.value.features.length;if(!n)return;
    if(i===RL.length)hits.push({c:'r',t:['Fjällnära skog – tillstånd krävs för avverkning','Near-mountain forest – felling needs a permit'],d:''});
    else{const R=RL[i];hits.push({c:R[1],t:[R[2],R[3]],n,d:[...new Set(r.value.features.map(f=>R[4](f.attributes)).filter(Boolean))].slice(0,3).join(', ')})}});
  const out={hits,m,fail};if(fail<res.length)RISK[l.id]=out;if(fail===res.length)throw new Error('offline');return out;
}

/* ---------- maps (Leaflet, bundled in the app) ---------- */
let LP=null;
function loadLeaflet(){if(window.L&&window.L.map)return Promise.resolve();if(LP)return LP;
  LP=new Promise((ok,no)=>{const c=document.createElement('link');c.rel='stylesheet';c.href='vendor/leaflet.css';document.head.appendChild(c);const s=document.createElement('script');s.src='vendor/leaflet.js';s.onload=ok;s.onerror=()=>{LP=null;no()};document.head.appendChild(s)});return LP}
const ringLL=f=>{const o=[];for(let i=0;i<f.length;i+=2)o.push([f[i],f[i+1]]);return o};
const tiles=m=>window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:17,attribution:'© OpenStreetMap'}).addTo(m);
function clearMaps(){maps.forEach(m=>{try{m.remove()}catch(e){}});maps=[]}
function mapFail(id){const el=document.getElementById(id);if(el)el.innerHTML=`<div class="pad mut">${L('Kartan kunde inte laddas.','The map could not be loaded.')}</div>`}
function polyMap(id,items){loadLeaflet().then(()=>{const el=document.getElementById(id);if(!el||el._leaflet_id)return;const m=window.L.map(el,{scrollWheelZoom:false});maps.push(m);tiles(m);
  const fg=window.L.featureGroup().addTo(m);items.forEach(l=>{const r=l.ring&&l.ring.length>=6?ringLL(l.ring):null;
    (r?window.L.polygon(r,{color:'#E2950F',weight:3,fillColor:'#E2B24C',fillOpacity:.25}):window.L.circleMarker([l.lat,l.lon],{radius:8,color:'#E2950F'})).addTo(fg).on('click',()=>items.length>1&&go('#/lead/'+encodeURIComponent(l.id)))});
  m.fitBounds(fg.getBounds(),{padding:[28,28],maxZoom:14})}).catch(()=>mapFail(id))}
function drawMap(){loadLeaflet().then(()=>{const el=$('#map');if(!el||el._leaflet_id)return;const m=window.L.map(el);maps.push(m);tiles(m);
  const ls=applyF(allLeads());window.L.circleMarker([S.home.lat,S.home.lon],{radius:8,color:'#fff',weight:3,fillColor:'#062A1F',fillOpacity:1}).addTo(m).bindTooltip(esc(S.home.name));
  ls.slice(0,500).forEach(l=>window.L.circleMarker([l.lat,l.lon],{radius:4+Math.min(l.ha,20)/3,color:'#fff',weight:1.5,fillColor:l.score>=70?'#187255':l.score>=45?'#E2B24C':'#9AA8A0',fillOpacity:.9}).addTo(m).on('click',()=>go('#/lead/'+encodeURIComponent(l.id))));
  if(ls.length)m.fitBounds(window.L.latLngBounds(ls.map(l=>[l.lat,l.lon]).concat([[S.home.lat,S.home.lon]])),{padding:[20,20],maxZoom:11});else m.setView([S.home.lat,S.home.lon],8)}).catch(()=>mapFail('map'))}

/* ---------- shared UI ---------- */
function hdr(title,sub){return `<div class="top slim"><div class="trow"><div class="who"><div class="ava">${ic('tree')}</div><div><small>${esc(S.co.name)}</small><b>${title}</b></div></div><button class="tbtn" data-a="lang">${lang==='sv'?'EN':'SV'}</button></div>${sub?`<div class="sub" style="margin-top:12px">${sub}</div>`:''}</div>`}
function dhdr(kicker,title){return `<div class="top slim"><div class="trow"><div class="who" style="min-width:0"><button class="tbtn bk" data-a="back" aria-label="${L('Tillbaka','Back')}">${ic('back')}</button><div style="min-width:0"><small>${esc(kicker)}</small><b class="ell">${title}</b></div></div><button class="tbtn" data-a="lang">${lang==='sv'?'EN':'SV'}</button></div></div>`}
const ring=s=>`<div class="ring" style="--p:${s};--c:${s>=70?'#187255':s>=45?'#E2B24C':'#B7C2BB'}"><span>${s}</span></div>`;
const tile=(lab,val)=>`<div class="tl"><span>${lab}</span><b>${val}</b></div>`;
function leadRow(l){const saved=S.contacts.some(c=>c.ref===l.id),isNew=l.k==='av'&&l.days<=2;
  return `<div class="card tap" data-a="lead" data-id="${esc(l.id)}"><div class="lead">${ring(l.score)}<div class="x"><h3>${nf(l.k==='ut'?l.plant:l.ha,1)} ha · ${esc(l.kom)}</h3>
  <div class="mut">${nf(l.km)} km · ${l.k==='ut'?L('avverkat ','felled ')+fmtD(l.ts):L('inkom ','received ')+fmtD(l.ts)}${l.k==='av'?' · ≈ '+nf(l.ha*S.m3ha)+' m³':''}</div></div><span class="chev">${ic('chev')}</span></div>
  ${isNew||saved||(l.k==='av'&&l.plant)?`<div class="tags">${isNew?`<span class="pill gold">${l.days===0?L('Ny idag','New today'):L('Ny','New')}</span>`:''}${l.k==='av'&&l.plant?`<span class="pill">${L('Ska planteras','To be replanted')} ${nf(l.plant,1)} ha</span>`:''}${saved?`<span class="pill dark">${L('Sparad','Saved')}</span>`:''}</div>`:''}</div>`}
function jobCard(j){const a=jobActual(j),pct=Math.min(100,j.qty?a.qty/j.qty*100:0);
  return `<div class="card"><div class="row"><div><h3>${esc(j.name)}</h3><div class="mut">${tname(j.type)}</div></div><span class="pill ${a.profit<0?'red':''}">${a.n?(a.profit<0?'':'+')+kr(a.profit):L('Ej startat','Not started')}</span></div>
  <div class="bar"><i style="width:${pct}%"></i></div><div class="row mut"><span>${nf(a.qty,1)} / ${nf(j.qty,1)} ${j.unit}</span><span>${nf(a.hours,1)} h · ${nf(a.diesel)} l</span></div>
  <div class="btns"><button class="b p" data-a="newlog" data-id="${j.id}">${ic('plus')}${L('Logga dag','Log day')}</button><button class="b" data-a="jobdone" data-id="${j.id}">${L('Klart','Done')}</button></div></div>`}
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function installCard(){if(standalone()||S.noInstall)return '';
  if(installEvt)return `<div class="card inst"><div class="lead"><div class="dot">${ic('dl')}</div><div class="x"><h3>${L('Installera Skogsdag','Install Skogsdag')}</h3><div class="mut">${L('Få appen på hemskärmen – öppnas som en vanlig app och fungerar utan täckning.','Get the app on your home screen – opens like a normal app and works without signal.')}</div></div></div><div class="btns"><button class="b p" data-a="install">${L('Installera','Install')}</button><button class="b" data-a="noinst">${L('Inte nu','Not now')}</button></div></div>`;
  if(isIOS)return `<div class="card inst"><div class="lead"><div class="dot">${ic('share')}</div><div class="x"><h3>${L('Lägg till på hemskärmen','Add to Home Screen')}</h3><div class="mut">${L('Tryck på Dela-knappen i Safari och välj ”Lägg till på hemskärmen”. Då öppnas Skogsdag som en vanlig app.','Tap the Share button in Safari and choose "Add to Home Screen". Skogsdag then opens like a normal app.')}</div></div></div><div class="btns"><button class="b" data-a="noinst">OK</button></div></div>`;
  return ''}

/* ---------- views ---------- */
function briefHtml(w){return w?`<div class="row"><div><div class="big">${nf(w.temp)}°</div><div class="mut">${L(w.ground.sv,w.ground.en)}</div></div><button class="listen" data-a="speak">${ic('play')}${L('Lyssna','Listen')}</button></div>
    <div class="bgrid"><div>${L('Dagsljus','Daylight')}<b>${w.rise}–${w.set} · ${w.light}</b></div><div>${L('Vindbyar / snödjup','Gusts / snow depth')}<b>${nf(w.gust)} m/s · ${w.snow} cm</b></div></div>
    ${weekHtml(w)}<div class="mut" style="margin-top:8px">${L('7 dagar: grön = bra arbetsdag, gul = var försiktig, röd = stå still','7 days: green = good working day, yellow = take care, red = stand still')}</div>`:`<div class="skel" style="width:40%;opacity:.3"></div><div class="skel" style="opacity:.3"></div><div class="skel" style="width:70%;opacity:.3"></div>`}
function homeLeadsHtml(){const ls=leads?nearLeads():null;if(!ls)return `<div class="sum">${'<div><div class="skel" style="margin:6px auto;width:50%"></div><div class="skel" style="margin:6px auto;width:70%"></div></div>'.repeat(3)}</div><div class="card"><div class="skel"></div><div class="skel" style="width:60%"></div></div>`;
  return `<div class="sum"><div><b>${ls.filter(l=>l.ld===today).length}</b><span>${L('nya idag','new today')}</span></div><div><b>${ls.filter(l=>l.ld>=monday()).length}</b><span>${L('denna vecka','this week')}</span></div><div><b>${buildPacks(ls).length}</b><span>${L('jobbpaket','job packages')}</span></div></div>${[...ls].sort((a,b)=>b.score-a.score).slice(0,2).map(leadRow).join('')}`}
function vHome(){
  const m=monthTotals(today.slice(0,7)),hr=sHour(),gr=hr<5?L('God natt','Good night'):hr<10?L('God morgon','Good morning'):hr<18?L('Hej','Hello'):L('God kväll','Good evening');
  const due=S.contacts.filter(c=>c.follow&&c.follow<=today&&c.status!=='vun'&&c.status!=='forl'),act=S.jobs.filter(j=>!j.done);
  const svc=S.machines.map(x=>({...x,left:x.last+x.every-x.hours})).filter(x=>x.left<=60);
  const w=WX[S.home.lat.toFixed(1)+','+S.home.lon.toFixed(1)];
  if(!w)wx(S.home.lat,S.home.lon).then(nw=>{const el=$('#brief');if(view==='home'&&el)el.innerHTML=briefHtml(nw)}).catch(()=>{const el=$('#brief');if(el)el.innerHTML=`<div class="mut">${L('Vädret kunde inte hämtas – kontrollera täckningen.','Weather could not be loaded – check your signal.')}</div>`});
  return `<div class="top"><div class="trow"><div class="who"><div class="ava">${esc((S.co.person||'L F').split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><small>${gr}</small><b>${esc((S.co.person||'Lars').split(' ')[0])}</b></div></div>
   <div style="display:flex;gap:8px"><button class="tbtn" data-a="lang">${lang==='sv'?'EN':'SV'}</button><button class="tbtn" data-a="settings" aria-label="${L('Inställningar','Settings')}">${ic('set')}</button></div></div>
   <div class="bal"><div class="row" style="align-items:flex-end"><div><div class="l">${L('Intjänat denna månad','Earned this month')} <button class="eye" data-a="hide" aria-label="${L('Dölj belopp','Hide amounts')}">${ic('eye')}</button></div>
   <div class="v">${S.hide?'•••••':nf(Math.round(m.rev))}<small>kr</small></div></div>${spark()}</div>
   <div class="chips"><span class="chip">${L('Vinst','Profit')} <b>${S.hide?'•••':kr(m.profit)}</b></span><span class="chip"><b>${nf(m.hours,1)}</b> h</span><span class="chip"><b>${nf(m.m3)}</b> m³</span></div></div></div>
  <div class="sheetbody">
   <div class="qa"><button data-go="leads"><span class="ic gold">${ic('leads')}</span>${L('Hitta jobb','Find work')}</button><button data-go="calc"><span class="ic">${ic('calc')}</span>${L('Kalkyl','Calculator')}</button><button data-go="log"><span class="ic">${ic('log')}</span>${L('Dagbok','Day log')}</button><button data-a="report"><span class="ic dark">${ic('rep')}</span>${L('Rapport','Report')}</button></div>
   <div style="height:14px"></div><div id="inst">${installCard()}</div>
   ${S.demo?`<div class="banner">${L('Exempeldata visas så att du ser hur appen fungerar.','Sample data is shown so you can see how the app works.')} <b data-a="cleardemo" style="text-decoration:underline;cursor:pointer">${L('Börja från noll','Start from zero')}</b></div>`:''}
   <h2>${L('Dagens läge','Today\'s outlook')}<span class="mut" style="font-weight:600">${esc(S.home.name)}</span></h2>
   <div class="card brief" id="brief">${briefHtml(w)}</div>
   ${svc.map(x=>`<div class="card tap" data-a="machines"><div class="lead"><div class="dot ${x.left<=20?'r':'a'}">${ic('warn')}</div><div class="x"><h3>${esc(x.name)}: ${L('service om','service in')} ${nf(Math.max(0,x.left))} h</h3><div class="mut">${L('Boka nu – ett planerat stopp är billigare än ett haveri','Book now – a planned stop is cheaper than a breakdown')}</div></div></div></div>`).join('')}
   <h2>${L('Nya jobb nära dig','New work near you')}<span class="lnk" data-go="leads">${L('Visa alla','See all')}</span></h2>
   <div id="homeleads">${homeLeadsHtml()}</div>
   ${due.length?`<h2>${L('Ring idag','Call today')}</h2>`+due.map(c=>`<div class="card tap" data-a="contact" data-id="${c.id}"><div class="row"><h3>${esc(c.name)}</h3><span class="pill red">${fmtD(c.follow)}</span></div><div class="note">${esc(((c.notes[0]||{}).t||'').slice(0,120))}</div></div>`).join(''):''}
   <h2>${L('Pågående jobb','Active jobs')}</h2>
   ${act.length?act.map(jobCard).join(''):`<div class="card mut">${L('Inga jobb ännu. Räkna på ett jobb i Kalkyl och spara det.','No jobs yet. Price a job in the calculator and save it.')}</div>`}
  </div>`;
}
function filterCard(){
  const all=allLeads(),f=S.f,pc=applyF(all,'per'),kc=applyF(all,'kom'),koms={};kc.forEach(l=>koms[l.kom]=(koms[l.kom]||0)+1);
  if(f.kom&&!koms[f.kom])koms[f.kom]=0;
  return `<div class="card fcard"><div class="fchips">${PERS.map(p=>{const n=pc.filter(l=>inPer(l,p[0])).length;return `<button class="fchip ${f.per===p[0]?'on':''}" data-a="fper" data-v="${p[0]}">${L(p[1],p[2])}<em>${n}</em></button>`}).join('')}</div>
  <label>${L('Kommun','Municipality')}</label><select data-c="fkom"><option value="">${L('Alla kommuner','All municipalities')} (${kc.length})</option>${Object.keys(koms).sort((a,b)=>a.localeCompare(b,'sv')).map(k=>`<option value="${esc(k)}" ${k===f.kom?'selected':''}>${esc(k)} (${koms[k]})</option>`).join('')}</select>
  <div class="g2"><div><label>${L('Avstånd','Distance')}</label><select data-c="fdist">${[[0,L('Alla','Any')],[25,'≤ 25 km'],[50,'≤ 50 km'],[100,'≤ 100 km'],[150,'≤ 150 km']].map(o=>`<option value="${o[0]}" ${+f.dist===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div>
  <div><label>${L('Sortera','Sort')}</label><select data-c="fsort">${[['new',L('Nyast','Newest')],['score',L('Bäst match','Best match')],['big',L('Störst','Largest')],['near',L('Närmast','Nearest')]].map(o=>`<option value="${o[0]}" ${f.sort===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select></div></div></div>`}
const NU={SE332:'Norrbotten',SE331:'Västerbotten',SE322:'Jämtland',SE321:'Västernorrland',SE313:'Gävleborg',SE312:'Dalarna',SE311:'Värmland',SE110:'Stockholm',SE121:'Uppsala',SE122:'Södermanland',SE123:'Östergötland',SE124:'Örebro',SE125:'Västmanland',SE211:'Jönköping',SE212:'Kronoberg',SE213:'Kalmar',SE214:'Gotland',SE221:'Blekinge',SE224:'Skåne',SE231:'Halland',SE232:'Västra Götaland'};
const tenders=()=>(SNAP.ted||[]).filter(t=>t.dl>=today).map(t=>({...t,north:t.reg.some(r=>r==='SE332'||r==='SE331')})).sort((a,b)=>(b.north-a.north)||a.dl.localeCompare(b.dl));
const TABY={};
function switchTab(t){if(t===leadTab){const mk=$('#segmark');if(mk&&scrollY>mk.offsetTop)window.scrollTo({top:mk.offsetTop,behavior:'smooth'});return}
  TABY[leadTab]=scrollY;leadTab=t;shown=40;render(true);const mk=$('#segmark'),top=mk?mk.offsetTop:0;
  window.scrollTo(0,TABY[t]!=null&&TABY[t]>top?TABY[t]:Math.min(scrollY,top))}
function vLeads(){
  const tabs=[['av',L('Anmälda','Fellings'),'leads'],['pack',L('Paket','Packages'),'cog'],['ut',L('Plantera','Replant'),'tree'],['map',L('Karta','Map'),'map'],['ted',L('Anbud','Tenders'),'doc']];
  let body='';
  if(!leads&&leadTab!=='ted'&&leadTab!=='ut'){body=`<div class="card"><div class="skel"></div><div class="skel" style="width:60%"></div></div>`.repeat(3)}
  else if(leadTab==='av'){const ls=sortF(applyF(allLeads())),ha=ls.reduce((a,l)=>a+l.ha,0);
    body=filterCard()+`<div class="sum"><div><b>${ls.length}</b><span>${L('jobbtips','leads')}</span></div><div><b>${nf(ha)}</b><span>ha</span></div><div><b>${nf(ha*S.m3ha*TYPES.avv.price/1e6,1)}</b><span>${L('Mkr i arbete','M SEK of work')}</span></div></div>
    <div class="mut" style="margin:0 4px 12px">${esc(leadsInfo)} · <span data-a="reload" class="lnk2">${L('Uppdatera','Refresh')}</span></div>`+
    (ls.length?ls.slice(0,shown).map(leadRow).join('')+(ls.length>shown?`<button class="b w" data-a="more">${L('Visa fler','Show more')} (${ls.length-shown})</button>`:''):`<div class="card mut">${L('Inga avverkningar matchar filtret. Prova en längre period eller ett större avstånd.','No fellings match the filter. Try a longer period or a larger distance.')}</div>`)}
  else if(leadTab==='pack'){const ps=buildPacks(nearLeads());
    body=`<div class="card mut">${L(`Avverkningar inom 6 km från varandra, inom ${S.radius} km från ${esc(S.home.name)}. En maskinflytt, flera jobb – så blir även små trakter lönsamma.`,`Fellings within 6 km of each other, within ${S.radius} km of ${esc(S.home.name)}. One machine move, several jobs – so even small sites become profitable.`)}</div>`+(ps.length?ps.slice(0,25).map(p=>`<div class="card tap" data-a="pack" data-id="${esc(p.id)}"><div class="row"><div><h3>${p.items.length} ${L('trakter','sites')} · ${nf(p.ha,1)} ha</h3><div class="mut">${esc(p.kom)} · ${nf(p.km)} km · ≈ ${nf(p.val/1e3)} tkr</div></div><span class="chev">${ic('chev')}</span></div>
     <div class="tags"><span class="pill gold">${L('Sparar ca','Saves about')} ${kr(p.saved)} ${L('i flytt','in moves')}</span></div></div>`).join(''):`<div class="card mut">${L('Inga paket just nu.','No packages right now.')}</div>`)}
  else if(leadTab==='ut'){const us=buildReplant(),ha=us.reduce((a,l)=>a+l.plant,0);
    body=`<div class="sum"><div><b>${us.length}</b><span>${L('hyggen','clear-cuts')}</span></div><div><b>${nf(ha)}</b><span>${L('ha att plantera','ha to replant')}</span></div><div><b>${nf(ha*TYPES.mark.price/1e6,1)}</b><span>${L('Mkr markberedning','M SEK site prep')}</span></div></div>
    <div class="card mut">${L(`Hyggen avverkade i år inom ${S.radius} km där lagen kräver ny skog. Ägaren behöver markberedning och plantering – ring innan någon annan gör det. Data från `,`Sites felled this year within ${S.radius} km where the law requires new forest. The owner needs site preparation and planting – call before someone else does. Data from `)+fmtD(SNAP.date)}.</div>`+us.slice(0,shown).map(leadRow).join('')+(us.length>shown?`<button class="b w" data-a="more">${L('Visa fler','Show more')} (${us.length-shown})</button>`:'')}
  else if(leadTab==='map'){body=filterCard()+`<div id="map" class="lmap"></div><div class="mut" style="margin:10px 4px">${L('Visar avverkningarna i filtret. Grön = bäst match, gul = medel. Tryck på en punkt.','Shows the fellings in the filter. Green = best match, yellow = medium. Tap a dot.')}</div>`}
  else{const ts=tenders();
    body=`<div class="card mut">${L('Offentliga upphandlingar av skogstjänster i Sverige som går att lämna anbud på. Uppdaterad ','Open public tenders for forestry services in Sweden. Updated ')+fmtD(SNAP.date)}.</div>`+(ts.length?ts.map(t=>`<div class="card tap" data-a="tender" data-id="${t.id}"><div class="row"><h3>${esc(t.t)}</h3><span class="chev">${ic('chev')}</span></div><div class="mut" style="margin-top:4px">${esc(t.b)} · ${t.reg.length>3?(t.north?'Norrbotten + ':'')+t.reg.length+' '+L('län','regions'):t.reg.map(r=>NU[r]).filter(Boolean).join(', ')||L('Sverige','Sweden')}</div>
    <div class="tags">${t.north?`<span class="pill">${L('Norr','North')}</span>`:''}<span class="pill gold">${L('Sista dag','Deadline')} ${fmtD(t.dl)}</span></div></div>`).join(''):`<div class="card mut">${L('Inga öppna upphandlingar just nu.','No open tenders right now.')}</div>`)}
  return hdr(L('Hitta jobb','Find work'),L('Jobben kommer till dig – du behöver inte leta','The work comes to you – no searching'))+`<div class="pad view"><div id="segmark"></div><div class="segw" id="segw"><div class="seg">${tabs.map(t=>`<button class="${leadTab===t[0]?'on':''}" data-tab="${t[0]}" aria-pressed="${leadTab===t[0]}">${ic(t[2])}<span>${t[1]}</span></button>`).join('')}</div></div><div id="tabbody" class="tabbody">${body}</div></div>`;
}
function findLead(id){if(!id)return null;if(id[0]==='U'){const r=(SNAP.ut||[]).find(x=>x[0]===id);return r?utLead(r):null}return allLeads().find(x=>x.id===id)||null}
const loadingPage=k=>dhdr(k,L('Laddar…','Loading…'))+`<div class="pad view"><div class="minimap skelbox"></div><div class="tiles">${'<div class="tl"><div class="skel" style="width:60%"></div><div class="skel"></div></div>'.repeat(4)}</div></div>`;
function vLead(){
  if(!leads&&param[0]!=='U')return loadingPage(L('Jobbtips','Lead'));
  const l=findLead(param);
  if(!l)return dhdr(L('Jobbtips','Lead'),L('Hittades inte','Not found'))+`<div class="pad view"><div class="card mut">${leads?L('Det här ärendet finns inte längre bland de senaste 30 dagarnas anmälningar.','This case is no longer among the last 30 days of notifications.'):L('Laddar…','Loading…')}</div></div>`;
  const saved=S.contacts.find(c=>c.ref===l.id),[N,E]=sweref(l.lat,l.lon),wgs=l.lat.toFixed(5)+', '+l.lon.toFixed(5);
  const tl=l.k==='av'?[tile(L('Anmäld areal','Notified area'),nf(l.ha,1)+' ha'),tile(L('Inkom till Skogsstyrelsen','Received by the agency'),fmtD(l.ts)),tile(L('Tidigast avverkning','Earliest felling date'),l.free<=Date.now()?L('Nu','Now'):fmtD(l.free)),tile(L('Ska planteras','To be replanted'),l.plant?nf(l.plant,1)+' ha':'–'),tile(L('Fågelvägen','Straight-line distance'),nf(l.km)+' km '+L('från ','from ')+esc(S.home.name)),tile(L('Ärendenummer','Case number'),esc(l.id))]
    :[tile(L('Avverkad areal','Felled area'),nf(l.ha,1)+' ha'),tile(L('Avverkad','Felled'),fmtD(l.ts,{year:'numeric'})),tile(L('Ska planteras','To be replanted'),nf(l.plant,1)+' ha'),tile(L('Fågelvägen','Straight-line distance'),nf(l.km)+' km '+L('från ','from ')+esc(S.home.name)),tile(L('Markberedning','Site preparation'),'≈ '+nf(l.plant*TYPES.mark.price/1e3)+' tkr'),tile(L('Plantering','Planting'),'≈ '+nf(l.plant*TYPES.plant.price/1e3)+' tkr')];
  return dhdr(l.k==='av'?typName(l.typ):l.typ,`${nf(l.k==='ut'?l.plant:l.ha,1)} ha · ${esc(l.kom)}`)+`<div class="pad view">
  <div id="lmap" class="minimap"></div>
  <div class="tiles">${tl.join('')}</div>
  <div class="card"><div class="lead">${ring(l.score)}<div class="x"><h3>${L('Matchning','Match')} ${l.score} %</h3><div class="mut">${l.k==='av'?L(`≈ ${nf(l.ha*S.m3ha)} m³ · ≈ ${nf(l.ha*S.m3ha*TYPES.avv.price/1e3)} tkr i drivning`,`≈ ${nf(l.ha*S.m3ha)} m³ · ≈ ${nf(l.ha*S.m3ha*TYPES.avv.price/1e3)} k SEK of harvesting`):L('Markberedning och plantering till våren','Site preparation and planting by spring')}</div></div></div>
   <div class="btns"><button class="b p" data-a="leadcalc" data-id="${esc(l.id)}">${ic('calc')}${L('Räkna','Price it')}</button><button class="b ${saved?'':'gold'}" data-a="leadsave" data-id="${esc(l.id)}">${saved?L('Sparad ✓','Saved ✓'):L('Spara','Save')}</button>${navigator.share?`<button class="b" data-a="leadshare" data-id="${esc(l.id)}">${ic('share')}${L('Dela','Share')}</button>`:''}</div></div>
  <h2>${L('Regelkoll på platsen','Rule check on the site')}</h2><div class="card" id="risk"><div class="skel"></div><div class="skel" style="width:70%"></div></div>
  <h2>${L('Mark och väder på platsen','Ground and weather on the site')}</h2><div class="card" id="lwx"><div class="skel"></div><div class="skel" style="width:70%"></div></div>
  <h2>${L('Vem ringer jag?','Who do I call?')}</h2>
  <div class="card"><div class="mut">${L('Anmälan visar platsen men inte ägarens namn. Så hittar du rätt person:','The notification shows the place but not the owner\'s name. This is how you find the right person:')}</div>
   <div class="step"><div class="n">1</div><div style="flex:1;min-width:0"><b>${L('Platsens koordinater','The site\'s coordinates')}</b><span class="mut">${L('Klistra in i sökrutan i Lantmäteriets ”Min karta”. Tryck på marken så visas fastighetsbeteckningen.','Paste into the search box in Lantmäteriet\'s "Min karta". Tap the land to see the property designation.')}</span>
    <div class="coord"><span>SWEREF 99 TM<b>N ${N} · E ${E}</b></span><button class="b" data-a="copy" data-v="${N} ${E}" aria-label="${L('Kopiera','Copy')}">${ic('copy')}</button></div><div class="coord"><span>WGS 84 (GPS)<b>${wgs}</b></span><button class="b" data-a="copy" data-v="${wgs}" aria-label="${L('Kopiera','Copy')}">${ic('copy')}</button></div></div></div>
   <div class="step"><div class="n">2</div><div><b>${L('Ägaren','The owner')}</b><span class="mut">${L('Med fastighetsbeteckningen visar Lantmäteriets e-tjänst ”Vem äger fastigheten” ägaren när du loggar in med BankID.','With the property designation, Lantmäteriet\'s e-service "Vem äger fastigheten" shows the owner when you log in with BankID.')}</span></div></div>
   <div class="step"><div class="n">3</div><div style="flex:1"><b>${L('Spara ägaren här','Save the owner here')}</b><span class="mut">${L('Appen sparar kontakten med ett färdigt meddelande och påminner dig.','The app saves the contact with a ready message and reminds you.')}</span>
    <input id="own-name" placeholder="${L('Ägarens namn','Owner\'s name')}" style="margin-top:10px" value="${esc(saved&&saved.owner||'')}"><input id="own-phone" type="tel" placeholder="${L('Telefon','Phone')}" style="margin-top:8px" value="${esc(saved&&saved.phone||'')}">
    <div class="btns"><button class="b p" data-a="ownsave" data-id="${esc(l.id)}">${L('Spara ägare','Save owner')}</button>${saved&&saved.phone?`<a class="b" href="tel:${esc(saved.phone.replace(/[^\d+]/g,''))}">${ic('phone')}${L('Ring','Call')}</a>`:''}</div></div></div></div>
  <div class="card"><h3>${L('Eller ring virkesköparen','Or call the timber buyer')}</h3><div class="mut" style="margin:4px 0 6px">${L('Ofta är det virkesköparen som anmält avverkningen och som anlitar entreprenör. Lägg till som kontakt så påminner appen dig.','Often the timber buyer filed the notification and hires the contractor. Add as a contact and the app reminds you.')}</div>
   ${[['Sveaskog',L('Statens skogsbolag','State forest company')],['SCA Skog',L('Skogsbolag och sågverk','Forest company and sawmills')],['Norra Skog',L('Skogsägarnas förening','Forest owners\' association')],['Stenvalls Trä',L('Sågverk','Sawmill')]].map(b=>`<div class="chk"><div class="dot">${ic('tree')}</div><div style="flex:1"><b>${b[0]}</b><div class="mut">${b[1]}</div></div><button class="b sm" data-a="buyer" data-v="${b[0]}" data-id="${esc(l.id)}" aria-label="${L('Lägg till','Add')}">${S.contacts.some(c=>c.name===b[0]+' – '+l.kom)?'✓':ic('plus')}</button></div>`).join('')}</div></div>`;
}
function fillLead(){const l=findLead(param);if(!l)return;polyMap('lmap',[l]);
  const dot=(c,i)=>`<div class="dot ${c}">${ic(i)}</div>`;
  riskCheck(l).then(r=>{const el=$('#risk');if(!el)return;
    el.innerHTML=(r.hits.length?r.hits.map(h=>`<div class="chk">${dot(h.c,'warn')}<div><b>${esc(L(h.t[0],h.t[1]))}${h.n>1?` (${h.n})`:''}</b>${h.d?`<div class="mut">${esc(h.d)}</div>`:''}</div></div>`).join(''):`<div class="chk">${dot('','ok')}<div><b>${L('Inga kända hinder','No known obstacles')}</b><div class="mut">${L(`Ingen nyckelbiotop, biotopskydd, sumpskog eller kulturlämning registrerad inom ${r.m} m.`,`No key habitat, habitat protection, swamp forest or cultural remain registered within ${r.m} m.`)}</div></div></div>`)
     +(l.k==='av'&&l.ha>=20?`<div class="chk">${dot('a','warn')}<div><b>${L('Stor trakt – samråd med samebyn kan krävas','Large site – consultation with the Sami village may be required')}</b><div class="mut">${L('Kontrollera med beställaren innan start.','Check with the client before starting.')}</div></div></div>`:'')
     +`<div class="mut" style="margin-top:8px">${L(`Källa: Skogsstyrelsens öppna data, sökradie ${r.m} m. Hjälpmedel – beställaren ansvarar för traktdirektivet.`,`Source: Forest Agency open data, search radius ${r.m} m. A support tool – the client is responsible for the site instructions.`)}${r.fail?' '+L('Vissa lager svarade inte.','Some layers did not answer.'):''}</div>`}).catch(()=>{const el=$('#risk');if(el)el.innerHTML=`<div class="mut">${L('Kunde inte hämta regeldata just nu. Kontrollera täckningen.','Could not fetch rule data right now. Check your signal.')}</div>`});
  wx(l.lat,l.lon).then(w=>{const el=$('#lwx');if(!el)return;const bad=w.days.filter(d=>d.c);
    el.innerHTML=`<div class="chk">${dot(w.ground.c,'snow')}<div><b>${L(w.ground.sv,w.ground.en)}</b><div class="mut">${nf(w.temp)}° · ${L('snödjup','snow depth')} ${w.snow} cm · ${L('dagsljus','daylight')} ${w.rise}–${w.set}</div></div></div>${weekHtml(w,1)}
    ${bad.length?bad.slice(0,3).map(d=>`<div class="mut" style="margin-top:6px">${new Date(dUTC(d.t)).toLocaleDateString(loc(),{timeZone:'UTC',weekday:'long'})}: ${esc(L(d.why[0],d.why[1]))}</div>`).join(''):`<div class="mut" style="margin-top:6px">${L('Sju bra arbetsdagar framåt.','Seven good working days ahead.')}</div>`}
    <div class="mut" style="margin-top:8px">${L('Marktemperatur från väderprognosmodell – kontrollera alltid bärigheten på plats.','Ground temperature from a weather model – always check bearing capacity on site.')}</div>`}).catch(()=>{const el=$('#lwx');if(el)el.innerHTML=`<div class="mut">${L('Kunde inte hämta väder just nu.','Could not fetch weather right now.')}</div>`});
}
function vPack(){if(!leads)return loadingPage(L('Jobbpaket','Job package'));const p=buildPacks(nearLeads()).find(x=>x.id===param);
  if(!p)return dhdr(L('Jobbpaket','Job package'),L('Hittades inte','Not found'))+`<div class="pad view"><div class="card mut">${leads?L('Paketet finns inte längre.','The package no longer exists.'):L('Laddar…','Loading…')}</div></div>`;
  return dhdr(L('Jobbpaket','Job package'),`${p.items.length} ${L('trakter','sites')} · ${nf(p.ha,1)} ha`)+`<div class="pad view"><div id="pmap" class="minimap"></div>
  <div class="sum"><div><b>${nf(p.ha*S.m3ha)}</b><span>m³</span></div><div><b>${nf(p.val/1e3)}</b><span>${L('tkr drivning','k SEK harvest')}</span></div><div><b>${nf(p.saved/1e3,1)}</b><span>${L('tkr sparad flytt','k SEK moves saved')}</span></div></div>
  <div class="card mut">${L(`${esc(p.kom)}, ${nf(p.km)} km från ${esc(S.home.name)}. En flytt i stället för ${p.items.length}. Ring samma köpare eller grannarna och erbjud ett paketpris.`,`${esc(p.kom)}, ${nf(p.km)} km from ${esc(S.home.name)}. One move instead of ${p.items.length}. Call the same buyer or the neighbours and offer a package price.`)}</div>
  <button class="b p w" data-a="packcalc" data-id="${esc(p.id)}">${ic('calc')}${L('Räkna på hela paketet','Price the whole package')}</button><div style="height:12px"></div>${p.items.map(leadRow).join('')}</div>`}
function vTender(){const t=(SNAP.ted||[]).find(x=>x.id===param);
  if(!t)return dhdr(L('Upphandling','Tender'),L('Hittades inte','Not found'))+`<div class="pad view"><div class="card mut">${L('Upphandlingen finns inte längre.','The tender no longer exists.')}</div></div>`;
  const left=Math.round((dUTC(t.dl)-dUTC(today))/DAY),watched=S.contacts.some(c=>c.ref==='T'+t.id);
  return dhdr(L('Upphandling','Tender'),esc(t.t))+`<div class="pad view"><div class="tiles">${tile(L('Beställare','Buyer'),esc(t.b))+tile(L('Ort','City'),esc(t.city||'–'))+tile(L('Publicerad','Published'),fmtD(t.pub))+tile(L('Sista anbudsdag','Deadline'),fmtD(t.dl)+` · ${left} ${L('dagar kvar','days left')}`)+tile(L('Område','Area'),esc([...t.reg].sort((a,b)=>b.localeCompare(a)).map(r=>NU[r]).filter(Boolean).join(', ')||L('Sverige','Sweden')))+tile(L('Annonsnummer (TED)','Notice no. (TED)'),esc(t.id))}</div>
  ${t.d?`<div class="card"><h3>${L('Vad upphandlas','What is procured')}</h3><p style="margin:8px 0 0">${esc(t.d)}</p></div>`:''}
  <div class="card mut">${L('Anbud lämnas i beställarens upphandlingssystem. Sök på annonsnumret hos beställaren eller i TED.','Bids are submitted in the buyer\'s procurement system. Search for the notice number with the buyer or in TED.')}</div>
  <div class="btns"><button class="b" data-a="copy" data-v="${esc(t.id)}">${ic('copy')}${L('Kopiera nummer','Copy number')}</button><button class="b ${watched?'':'gold'}" data-a="watch" data-id="${esc(t.id)}">${watched?L('Bevakas ✓','Watching ✓'):L('Bevaka','Watch')}</button></div></div>`}
function calcInit(type,pre){const T=TYPES[type],my=S.my[type]||{};C={type,name:pre?.name||'',cust:pre?.cust||'',qty:pre?.qty||'',price:my.price??T.price,prod:my.prod??T.prod,hcost:my.hcost??T.hcost,dl:my.dl??T.dl,dprice:S.diesel,km:pre?.km??'',kmcost:S.movekm,other:''}}
function calcRes(){const n=k=>+C[k]||0,T=TYPES[C.type],hours=n('prod')?n('qty')/n('prod'):0,rev=n('qty')*n('price'),mach=hours*n('hcost'),fuel=hours*n('dl')*n('dprice'),move=T.move?n('km')*2*n('kmcost'):0,cost=mach+fuel+move+n('other'),profit=rev-cost;return {hours,rev,mach,fuel,move,cost,profit,marg:rev?profit/rev*100:0,minp:n('qty')?cost/(n('qty')*(1-S.target/100)):0,T}}
function vCalc(){
  if(!C)calcInit('avv');const T=TYPES[C.type],f=(k,lab)=>`<div><label>${lab}</label><input type="number" inputmode="decimal" step="any" data-k="${k}" value="${C[k]}"></div>`;
  return hdr(L('Kalkyl','Job calculator'),L('Se vinsten innan du säger ja','See the profit before you say yes'))+`<div class="pad view">
  <div class="card"><label style="margin-top:0">${L('Typ av jobb','Type of job')}</label><select data-c="ctype">${Object.keys(TYPES).map(k=>`<option value="${k}" ${k===C.type?'selected':''}>${tname(k)}</option>`).join('')}</select>
  <label>${L('Namn på jobbet / trakten','Job / site name')}</label><input data-k="name" data-txt="1" value="${esc(C.name)}" placeholder="${L('t.ex. Kåbdalis 4:12','e.g. Kåbdalis 4:12')}">
  <div class="g2">${f('qty',L('Mängd','Quantity')+` (${T.unit})`)}${f('price',L('Pris','Price')+` (kr/${T.unit})`)}</div>
  <div class="g2">${f('prod',`${T.unit} ${L('per timme','per hour')}`)}${f('hcost',L('Kostnad per timme (kr)','Cost per hour (kr)'))}</div>
  <div class="g2">${f('dl',L('Diesel (liter/timme)','Diesel (litres/hour)'))}${f('dprice',L('Dieselpris (kr/l)','Diesel price (kr/l)'))}</div>
  ${T.move?`<div class="g2">${f('km',L('Maskinflytt enkel väg (km)','Machine move one way (km)'))}${f('kmcost',L('Flyttkostnad (kr/km)','Move cost (kr/km)'))}</div>`:''}${f('other',L('Övriga kostnader (kr)','Other costs (kr)'))}</div>
  <div id="calcout">${calcOut()}</div></div>`;
}
function calcOut(){const r=calcRes();if(!r.rev)return `<div class="card mut">${L('Fyll i mängd och pris så räknar appen direkt.','Enter quantity and price and the app calculates right away.')}</div>`;
  const col=r.marg>=S.target?'linear-gradient(140deg,#1C8A66,#0B3D2E)':r.marg>=0?'linear-gradient(140deg,#D99A2B,#9C6410)':'linear-gradient(140deg,#D8543F,#8E2417)',txt=r.marg>=S.target?L('Bra jobb – ta det','Good job – take it'):r.marg>=0?L('Tunn marginal – förhandla upp priset','Thin margin – negotiate the price up'):L('Förlust – tacka nej eller höj priset','Loss – decline or raise the price');
  return `<div class="verdict" style="background:${col}"><div class="v1">${L('Beräknad vinst','Estimated profit')} · ${nf(r.marg,1)} %</div><div class="v2">${kr(r.profit)}</div><div class="v3">${txt}</div></div>
  <div class="card"><div class="kv"><span>${L('Intäkt','Revenue')}</span><b>${kr(r.rev)}</b></div><div class="kv"><span>${L('Maskin och förare','Machine and operator')} (${nf(r.hours,1)} h)</span><b>${kr(r.mach)}</b></div><div class="kv"><span>Diesel</span><b>${kr(r.fuel)}</b></div>${r.T.move?`<div class="kv"><span>${L('Maskinflytt tur och retur','Machine move, return')}</span><b>${kr(r.move)}</b></div>`:''}<div class="kv"><span>${L('Övrigt','Other')}</span><b>${kr(+C.other||0)}</b></div>
  <div class="kv"><span><b>${L(`Lägsta pris för ${S.target} % marginal`,`Lowest price for ${S.target}% margin`)}</b></span><b style="color:var(--g6)">${nf(r.minp)} kr/${r.T.unit}</b></div></div>
  <div class="btns"><button class="b gold" data-a="quote">${ic('doc')}${L('Skapa offert','Create quote')}</button><button class="b p" data-a="savejob">${L('Spara som jobb','Save as job')}</button></div>`}
function vQuote(){
  if(!C||!+C.qty)return dhdr(L('Offert','Quote'),L('Ingen kalkyl','No calculation'))+`<div class="pad view"><div class="card mut">${L('Räkna på ett jobb i Kalkyl först.','Price a job in the calculator first.')}</div><button class="b p w" data-go="calc">${L('Till Kalkyl','Go to calculator')}</button></div>`;
  const r=calcRes(),T=r.T,valid=iso(Date.now()+30*DAY),no=today.replace(/-/g,'').slice(2)+'-'+String(S.jobs.length+1).padStart(2,'0');
  return dhdr(L('Offert','Quote'),`${esc(tname(C.type))}${C.name?' · '+esc(C.name):''}`)+`<div class="pad view"><div class="noprint"><label style="margin-top:0">${L('Kund','Customer')}</label><input id="q-cust" data-q="1" value="${esc(C.cust||'')}" placeholder="${L('Namn på markägare eller bolag','Landowner or company name')}"></div>
  <div class="doc" style="margin-top:14px"><div class="row" style="align-items:flex-start"><div><h4>${esc(S.co.name)}</h4><div class="mut">${esc([S.co.person,S.co.phone,S.co.email].filter(Boolean).join(' · '))}${S.co.org?'<br>Org.nr '+esc(S.co.org):''}</div></div><div style="text-align:right"><b>OFFERT ${no}</b><div class="mut">${today}</div></div></div>
   <p style="margin:16px 0 0"><b>Till:</b> <span id="q-to">${esc(C.cust||'…')}</span><br><b>Avser:</b> ${esc(TYPES[C.type].sv)}${C.name?', '+esc(C.name):''}</p>
   <table><tr><td>${esc(TYPES[C.type].sv)}<br><span class="mut">Beräknad mängd ${nf(C.qty,1)} ${T.unit}</span></td><td>${nf(C.price)} kr/${T.unit}</td></tr>
   ${r.move?`<tr><td>Maskinflytt tur och retur</td><td>Ingår</td></tr>`:''}<tr class="tot"><td>Beräknad summa exkl. moms</td><td>${kr(r.rev)}</td></tr><tr><td class="mut" style="border:0">Moms 25 %</td><td class="mut" style="border:0;font-weight:500">${kr(r.rev*.25)}</td></tr></table>
   <p class="mut">Slutlig ersättning beräknas på inmätt mängd. Arbetet utförs enligt ABSE 20 och gällande skogsvårdslag. Offerten gäller till ${valid}. Betalning 30 dagar netto.</p>
   <p style="margin-bottom:0">Med vänlig hälsning<br><b>${esc(S.co.person)}</b>, ${esc(S.co.name)}</p></div>
  <div class="btns noprint"><button class="b p" data-a="print">${ic('doc')}${L('PDF / Skriv ut','PDF / Print')}</button>${navigator.share?`<button class="b" data-a="sharequote">${ic('share')}${L('Dela','Share')}</button>`:''}<button class="b gold" data-a="quotesave">${L('Spara som skickad','Save as sent')}</button></div>
  <div class="mut noprint" style="margin-top:10px">${L('Offerten är alltid på svenska. Fyll i telefon och org.nr under Inställningar.','The quote is always in Swedish. Add phone and company number under Settings.')}</div></div>`}
function quoteText(){const r=calcRes();return `OFFERT – ${S.co.name}\nTill: ${C.cust||''}\nAvser: ${TYPES[C.type].sv}${C.name?', '+C.name:''}\nBeräknad mängd: ${nf(C.qty,1)} ${r.T.unit} à ${nf(C.price)} kr/${r.T.unit}${r.move?'\nMaskinflytt tur och retur: ingår':''}\nBeräknad summa: ${kr(r.rev)} exkl. moms (moms 25 %: ${kr(r.rev*.25)})\nSlutlig ersättning beräknas på inmätt mängd. Offerten gäller till ${iso(Date.now()+30*DAY)}. Betalning 30 dagar netto.\n\nMed vänlig hälsning\n${S.co.person}, ${S.co.name}${S.co.phone?'\n'+S.co.phone:''}`}
function vLog(){
  const m=monthTotals(today.slice(0,7)),ls=[...S.logs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,30);
  return hdr(L('Dagbok','Day log'),L('30 sekunder per dag – rapporten gör sig själv','30 seconds a day – the report writes itself'))+`<div class="pad view">
  <div class="sum"><div><b>${nf(m.hours,1)}</b><span>${L('timmar i månaden','hours this month')}</span></div><div><b>${nf(m.m3)}</b><span>m³</span></div><div><b>${nf(m.diesel)}</b><span>${L('liter diesel','litres diesel')}</span></div></div>
  <div class="btns" style="margin:0 0 4px"><button class="b p" data-a="newlog">${ic('plus')}${L('Logga dag','Log day')}</button><button class="b" data-a="report">${ic('rep')}${L('Rapport','Report')}</button><button class="b" data-a="machines">${ic('cog')}${L('Maskiner','Machines')}</button></div>
  <h2>${L('Senaste dagar','Recent days')}</h2>
  ${ls.length?ls.map(l=>{const j=S.jobs.find(x=>x.id===l.jobId)||{name:'–',unit:''};return `<div class="card tap" data-a="editlog" data-id="${l.id}"><div class="row"><h3>${esc(j.name)}</h3><span class="pill grey">${fmtD(l.date)}</span></div><div class="mut">${nf(l.hours,1)} h · ${nf(l.qty,1)} ${j.unit} · ${nf(l.diesel)} l diesel</div>${l.note?`<div class="note">${esc(l.note)}</div>`:''}</div>`}).join(''):`<div class="card mut">${L('Inget loggat ännu.','Nothing logged yet.')}</div>`}</div>`;
}
function vMem(){
  const cs=[...S.contacts].sort((a,b)=>(a.follow||'9').localeCompare(b.follow||'9')),cnt=k=>S.contacts.filter(c=>c.status===k).length;
  return hdr(L('Kontakter','Contacts'),L('Appen minns varje samtal åt dig','The app remembers every conversation for you'))+`<div class="pad view">
  <div class="sum"><div><b>${cnt('ny')+cnt('kont')}</b><span>${L('att bearbeta','to work on')}</span></div><div><b>${cnt('off')}</b><span>${L('offerter ute','quotes out')}</span></div><div><b>${cnt('vun')}</b><span>${L('vunna','won')}</span></div></div>
  <button class="b p w" data-a="newcontact">${ic('plus')}${L('Ny kontakt','New contact')}</button><div style="height:14px"></div>
  ${cs.length?cs.map(c=>{const st=STAT.find(s=>s[0]===c.status)||STAT[0];return `<div class="card tap" data-a="contact" data-id="${c.id}"><div class="row"><h3>${esc(c.name)}</h3><span class="pill ${c.status==='vun'?'':c.status==='forl'?'grey':'gold'}">${L(st[1],st[2])}</span></div>
   <div class="mut">${c.follow?L('Följ upp ','Follow up ')+fmtD(c.follow)+' · ':''}${c.notes.length} ${L('anteckningar','notes')}${c.phone?' · '+esc(c.phone):''}</div>${c.notes[0]?`<div class="note">${esc(c.notes[0].t.slice(0,140))}</div>`:''}</div>`}).join(''):`<div class="card mut">${L('Inga kontakter ännu. Spara ett jobbtips eller lägg till en markägare.','No contacts yet. Save a lead or add a landowner.')}</div>`}</div>`;
}
let repYm=today.slice(0,7);
const monthName=ym=>new Date(dUTC(ym+'-15')).toLocaleDateString(loc(),{timeZone:'UTC',month:'long',year:'numeric'});
function reportText(ym){
  const m=monthTotals(ym),ln=[];
  ln.push(S.co.name.toUpperCase()+' – '+L('MÅNADSRAPPORT','MONTHLY REPORT')+' '+monthName(ym).toUpperCase(),'');
  S.jobs.forEach(j=>{const ls=S.logs.filter(l=>l.jobId===j.id&&l.date.slice(0,7)===ym).sort((a,b)=>a.date.localeCompare(b.date));if(!ls.length)return;const s=k=>ls.reduce((a,l)=>a+(+l[k]||0),0);
    ln.push(`${j.name} (${tname(j.type)})`);ls.forEach(l=>ln.push(`  ${l.date}  ${nf(l.hours,1)} h  ${nf(l.qty,1)} ${j.unit}  ${nf(l.diesel)} l${l.note?'  – '+l.note:''}`));
    ln.push(`  ${L('Summa','Total')}: ${nf(s('hours'),1)} h, ${nf(s('qty'),1)} ${j.unit}, ${nf(s('diesel'))} l diesel`,`  ${L('Att fakturera','To invoice')}: ${nf(s('qty'),1)} ${j.unit} × ${nf(j.price)} kr = ${kr(s('qty')*j.price)} ${L('exkl. moms','excl. VAT')}`,'')});
  ln.push(L('TOTALT','TOTAL')+`: ${nf(m.hours,1)} h · ${nf(m.diesel)} l diesel · ${L('att fakturera','to invoice')} ${kr(m.rev)} ${L('exkl. moms','excl. VAT')}`);return ln.join('\n')}
function vReport(){const m=monthTotals(repYm);
  return dhdr(L('Månadsrapport','Monthly report'),monthName(repYm))+`<div class="pad view">
  <div class="noprint"><div class="mut">${L('Underlaget till den som sköter ditt pappersarbete – klart med ett tryck.','The basis for whoever does your paperwork – ready in one tap.')}</div><label>${L('Månad','Month')}</label><input type="month" id="rp-m" value="${repYm}"></div>
  <div class="sum noprint" style="margin-top:12px"><div><b>${nf(m.rev/1e3,1)}</b><span>${L('tkr att fakturera','k SEK to invoice')}</span></div><div><b>${nf(m.hours,1)}</b><span>${L('timmar','hours')}</span></div><div><b>${nf(m.diesel)}</b><span>${L('liter diesel','litres diesel')}</span></div></div>
  <pre class="rep">${esc(reportText(repYm))}</pre>
  <div class="btns noprint"><button class="b p" data-a="share">${ic('share')}${L('Skicka','Send')}</button><button class="b" data-a="copy" data-v="${esc(reportText(repYm))}">${ic('copy')}${L('Kopiera','Copy')}</button><button class="b" data-a="print">PDF</button></div></div>`}

/* ---------- sheets (small forms) ---------- */
let sheetPushed=false,afterClose=null;
const sheetOpen=()=>$('#sheet').classList.contains('on');
function sheet(html){$('#sheetin').innerHTML='<div class="grab"></div>'+html;$('#sheet').classList.add('on');$('#sheetin').scrollTop=0;
  if(!sheetPushed){history.pushState({d:(history.state&&history.state.d||0)+1,sheet:1},'',location.hash);sheetPushed=true}}
function hideSheet(){$('#sheet').classList.remove('on');stopMic();if(window.speechSynthesis)speechSynthesis.cancel()}
function closeSheet(then){if(sheetPushed){afterClose=then||null;history.back()}else{hideSheet();then&&then()}}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
const micBtn=t=>SR?`<button class="mic" data-a="mic" data-t="${t}" aria-label="${L('Tala in','Dictate')}">${ic('mic')}</button>`:'';
function leadMsg(l){return L(`Hej!\n\nJag såg att en avverkning på ${nf(l.ha,1)} ha i ${l.kom} är ${l.k==='ut'?'utförd och ska återbeskogas':'anmäld till Skogsstyrelsen'}${l.k==='av'?' (ärende '+l.id+')':''}.\n\nJag driver ${S.co.name} i ${S.home.name} och har ledig kapacitet – ${l.k==='ut'?'markberedning och plantering':'avverkning, markberedning och plantering'}. Vi finns ${nf(l.km)} km från trakten, så flyttkostnaden blir låg.\n\nVill du ha ett pris? Jag återkommer samma dag.\n\nHälsningar\n${S.co.person}, ${S.co.name}${S.co.phone?'\n'+S.co.phone:''}`,
  `Hi!\n\nI saw that a ${nf(l.ha,1)} ha felling in ${l.kom} ${l.k==='ut'?'has been carried out and must be replanted':'has been notified to the Forest Agency'}${l.k==='av'?' (case '+l.id+')':''}.\n\nI run ${S.co.name} in ${S.home.name} and have free capacity – ${l.k==='ut'?'site preparation and planting':'felling, site preparation and planting'}. We are ${nf(l.km)} km from the site, so moving costs stay low.\n\nWould you like a price? I will get back to you the same day.\n\nRegards\n${S.co.person}, ${S.co.name}${S.co.phone?'\n'+S.co.phone:''}`)}
function saveLead(l,owner,phone){
  let c=S.contacts.find(x=>x.ref===l.id);
  if(!c){c={id:uid(),ref:l.id,name:`${l.kom} ${nf(l.ha,1)} ha`,phone:'',status:'ny',follow:addD(today,2),msg:leadMsg(l),notes:[{d:today,t:L(`Jobbtips sparat: ${l.k==='av'?typName(l.typ):l.typ}, ${nf(l.ha,1)} ha, ${nf(l.km)} km bort${l.k==='av'?', ärende '+l.id:''}. Koordinater ${l.lat.toFixed(5)}, ${l.lon.toFixed(5)}.`,`Lead saved: ${l.k==='av'?typName(l.typ):l.typ}, ${nf(l.ha,1)} ha, ${nf(l.km)} km away${l.k==='av'?', case '+l.id:''}. Coordinates ${l.lat.toFixed(5)}, ${l.lon.toFixed(5)}.`)}]};S.contacts.unshift(c)}
  if(owner){c.owner=owner;c.name=`${owner} – ${l.kom} ${nf(l.ha,1)} ha`}if(phone)c.phone=phone;save();return c;
}
function shLog(id,jobId){
  const l=S.logs.find(x=>x.id===id)||{jobId:jobId||(S.jobs.find(j=>!j.done)||{}).id,date:today,hours:'',qty:'',diesel:'',note:'',machine:''},jobs=S.jobs.filter(j=>!j.done||j.id===l.jobId);
  if(!jobs.length){toast(L('Spara ett jobb i Kalkyl först','Save a job in the calculator first'));go('#/calc');return}
  const j=jobs.find(x=>x.id===l.jobId)||jobs[0];
  sheet(`<div class="sh-t">${id?L('Ändra dag','Edit day'):L('Logga dag','Log day')}</div>
  <label>${L('Jobb','Job')}</label><select id="lg-job">${jobs.map(x=>`<option value="${x.id}" ${x.id===j.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>
  <div class="g2"><div><label>${L('Datum','Date')}</label><input type="date" id="lg-date" value="${l.date}"></div><div><label>${L('Timmar','Hours')}</label><input type="number" inputmode="decimal" id="lg-h" value="${l.hours}"></div></div>
  <div class="g2"><div><label>${L('Producerat','Produced')} (m³ / ha)</label><input type="number" inputmode="decimal" id="lg-q" value="${l.qty}"></div><div><label>${L('Diesel (liter)','Diesel (litres)')}</label><input type="number" inputmode="decimal" id="lg-d" value="${l.diesel}"></div></div>
  ${S.machines.length?`<label>${L('Maskin (timmarna räknas mot service)','Machine (hours count towards service)')}</label><select id="lg-m"><option value="">–</option>${S.machines.map(x=>`<option value="${x.id}" ${x.id===l.machine?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`:''}
  <label>${L('Anteckning (stopp, väder, markägare…)','Note (downtime, weather, landowner…)')}</label><div style="display:flex;gap:8px"><textarea id="lg-n">${esc(l.note)}</textarea>${micBtn('lg-n')}</div>
  <div class="btns"><button class="b" data-a="close">${L('Avbryt','Cancel')}</button>${id?`<button class="b d" data-a="dellog" data-id="${id}">${L('Ta bort','Delete')}</button>`:''}<button class="b p" data-a="savelog" data-id="${id||''}">${L('Spara','Save')}</button></div>`)}
function shContact(id){
  const c=S.contacts.find(x=>x.id===id)||{name:'',phone:'',status:'ny',follow:'',notes:[]},tel=(c.phone||'').replace(/[^\d+]/g,'');
  sheet(`<div class="sh-t">${id?esc(c.name):L('Ny kontakt','New contact')}</div>
  <label>${L('Namn','Name')}</label><input id="ct-name" value="${esc(c.name)}">
  <div class="g2"><div><label>${L('Telefon','Phone')}</label><input id="ct-phone" type="tel" value="${esc(c.phone)}"></div><div><label>${L('Följ upp','Follow up')}</label><input id="ct-follow" type="date" value="${c.follow||''}"></div></div>
  <label>Status</label><select id="ct-status">${STAT.map(s=>`<option value="${s[0]}" ${s[0]===c.status?'selected':''}>${L(s[1],s[2])}</option>`).join('')}</select>
  <label>${L('Ny anteckning – vad sa ni?','New note – what was said?')}</label><div style="display:flex;gap:8px"><textarea id="ct-note"></textarea>${micBtn('ct-note')}</div>
  <div class="btns">${tel?`<a class="b" href="tel:${esc(tel)}">${ic('phone')}${L('Ring','Call')}</a>`:''}${(c.lead||c.ref)&&(c.lead||c.ref)[0]!=='T'&&findLead(c.lead||c.ref)?`<button class="b" data-a="openlead" data-id="${esc(c.lead||c.ref)}">${L('Visa jobbet','Show the job')}</button>`:''}${c.ref&&c.ref[0]==='T'?`<button class="b" data-a="opentender" data-id="${esc(c.ref.slice(1))}">${L('Visa upphandlingen','Show the tender')}</button>`:''}<button class="b p" data-a="savecontact" data-id="${id||''}">${L('Spara','Save')}</button></div>
  ${c.msg?`<label>${L('Färdigt meddelande att skicka','Ready-made message to send')}</label><pre class="rep" style="margin:0">${esc(c.msg)}</pre><div class="btns"><button class="b gold" data-a="copy" data-v="${esc(c.msg)}">${ic('copy')}${L('Kopiera meddelandet','Copy the message')}</button>${tel?`<a class="b" href="sms:${esc(tel)}?body=${encodeURIComponent(c.msg)}">SMS</a>`:''}</div>`:''}
  ${c.notes.length?`<label>${L('Historik','History')}</label>`+c.notes.map(n=>`<div class="note"><span class="mut">${fmtD(n.d)}</span><br>${esc(n.t)}</div>`).join(''):''}
  <div class="btns"><button class="b" data-a="close">${L('Stäng','Close')}</button>${id?`<button class="b d" data-a="delcontact" data-id="${id}">${L('Ta bort','Delete')}</button>`:''}</div>`)}
function shMachines(){sheet(`<div class="sh-t">${L('Maskiner och service','Machines and service')}</div><div class="mut">${L('Timmarna räknas upp automatiskt när du loggar en dag.','Hours count up automatically when you log a day.')}</div><div style="height:12px"></div>
  ${S.machines.map(x=>{const left=x.last+x.every-x.hours,pct=Math.max(0,Math.min(100,(x.hours-x.last)/x.every*100));return `<div class="card"><div class="row"><h3>${esc(x.name)}</h3><span class="pill ${left<=20?'red':left<=60?'gold':''}">${L('service om','service in')} ${nf(Math.max(0,left))} h</span></div><div class="bar"><i style="width:${pct}%"></i></div><div class="row mut"><span>${nf(x.hours)} h ${L('totalt','total')}</span><span>${L('var','every')} ${x.every} h</span></div>
   <div class="btns"><button class="b p" data-a="svcdone" data-id="${x.id}">${L('Service gjord','Service done')}</button><button class="b d" data-a="delmach" data-id="${x.id}">${L('Ta bort','Delete')}</button></div></div>`}).join('')||`<div class="card mut">${L('Inga maskiner inlagda.','No machines added.')}</div>`}
  <div class="card"><h3>${L('Lägg till maskin','Add machine')}</h3><label>${L('Namn','Name')}</label><input id="mc-n" placeholder="${L('t.ex. Skördare','e.g. Harvester')}"><div class="g2"><div><label>${L('Mätarställning (h)','Hour meter (h)')}</label><input id="mc-h" type="number" inputmode="decimal"></div><div><label>${L('Serviceintervall (h)','Service interval (h)')}</label><input id="mc-e" type="number" value="500"></div></div><div class="btns"><button class="b p" data-a="addmach">${L('Lägg till','Add')}</button><button class="b" data-a="close">${L('Stäng','Close')}</button></div></div>`)}
function shSettings(){sheet(`<div class="sh-t">${L('Inställningar','Settings')}</div>
  <label>${L('Företag','Company')}</label><input id="st-co" value="${esc(S.co.name)}"><div class="g2"><div><label>${L('Ditt namn','Your name')}</label><input id="st-pe" value="${esc(S.co.person)}"></div><div><label>Org.nr</label><input id="st-or" value="${esc(S.co.org)}"></div></div>
  <div class="g2"><div><label>${L('Telefon','Phone')}</label><input id="st-ph" type="tel" value="${esc(S.co.phone)}"></div><div><label>E-post</label><input id="st-em" type="email" value="${esc(S.co.email)}"></div></div>
  <label>${L('Hemort','Home base')}</label><input id="st-name" value="${esc(S.home.name)}"><div class="g2"><div><label>Lat</label><input id="st-lat" type="number" value="${S.home.lat}"></div><div><label>Lon</label><input id="st-lon" type="number" value="${S.home.lon}"></div></div>
  <button class="b w" style="margin-top:10px" data-a="gps">${ic('map')}${L('Använd min position','Use my location')}</button>
  <div class="g2"><div><label>${L('”Nära dig” inom (km)','"Near you" within (km)')}</label><input id="st-r" type="number" value="${S.radius}"></div><div><label>${L('Vinstmål (%)','Profit target (%)')}</label><input id="st-t" type="number" value="${S.target}"></div></div>
  <div class="g2"><div><label>${L('Dieselpris (kr/l)','Diesel price (kr/l)')}</label><input id="st-d" type="number" value="${S.diesel}"></div><div><label>${L('Flytt (kr/km)','Move (kr/km)')}</label><input id="st-k" type="number" value="${S.movekm}"></div></div>
  <label>${L('Virke per ha (m³)','Timber per ha (m³)')}</label><input id="st-m" type="number" value="${S.m3ha}">
  <div class="btns"><button class="b" data-a="close">${L('Avbryt','Cancel')}</button><button class="b p" data-a="saveset">${L('Spara','Save')}</button></div>
  <div class="btns"><button class="b d" data-a="cleardemo">${L('Radera all data i appen','Erase all data in the app')}</button></div><p class="mut">${L('Dina uppgifter sparas bara i den här telefonen. Offentlig data: Skogsstyrelsen, Open-Meteo, TED. Karta © OpenStreetMap.','Your data is stored only on this phone. Public data: Swedish Forest Agency, Open-Meteo, TED. Map © OpenStreetMap.')}</p>`)}

/* ---------- voice ---------- */
function stopMic(){if(rec){try{rec.stop()}catch(e){}rec=null}document.querySelectorAll('.mic.rec').forEach(b=>b.classList.remove('rec'))}
function startMic(btn){if(rec){stopMic();return}const ta=document.getElementById(btn.dataset.t);rec=new SR();rec.lang=lang==='sv'?'sv-SE':'en-US';rec.continuous=true;
  rec.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)ta.value=(ta.value?ta.value+' ':'')+e.results[i][0].transcript.trim()};
  rec.onerror=()=>{toast(L('Mikrofonen kunde inte startas','Could not start the microphone'));stopMic()};rec.onend=stopMic;btn.classList.add('rec');try{rec.start()}catch(e){stopMic()}}
function briefText(){
  const w=WX[S.home.lat.toFixed(1)+','+S.home.lon.toFixed(1)],ls=leads?nearLeads():[],nw=ls.filter(l=>l.ld>=monday()),td=ls.filter(l=>l.ld===today),due=S.contacts.filter(c=>c.follow&&c.follow<=today&&c.status!=='vun'&&c.status!=='forl'),bad=w?w.days.slice(0,3).filter(d=>d.c):[],b=[...ls].sort((a,b)=>b.score-a.score)[0];
  return L(`Hej ${S.co.person.split(' ')[0]}. ${w?`I ${S.home.name} är det ${nf(w.temp)} grader. ${w.ground.sv}. Dagsljus från ${w.rise} till ${w.set}. ${bad.length?'Tänk på: '+bad.map(d=>d.why[0]).join('. ')+'.':'Bra arbetsväder de närmaste dagarna.'}`:''} ${td.length} nya avverkningar anmäldes idag och ${nw.length} den här veckan inom ${S.radius} kilometer. ${b?`Bästa tipset är ${nf(b.ha,1)} hektar i ${b.kom}, ${nf(b.km)} kilometer bort.`:''} ${due.length?`Du har ${due.length} ${due.length===1?'kontakt':'kontakter'} att ringa idag.`:''}`,
   `Hello ${S.co.person.split(' ')[0]}. ${w?`In ${S.home.name} it is ${nf(w.temp)} degrees. ${w.ground.en}. Daylight from ${w.rise} to ${w.set}. ${bad.length?'Note: '+bad.map(d=>d.why[1]).join('. ')+'.':'Good working weather in the coming days.'}`:''} ${td.length} new fellings were notified today and ${nw.length} this week within ${S.radius} kilometres. ${b?`The best lead is ${nf(b.ha,1)} hectares in ${b.kom}, ${nf(b.km)} kilometres away.`:''} ${due.length?`You have ${due.length} contact${due.length===1?'':'s'} to call today.`:''}`)}
function speak(){if(!window.speechSynthesis){toast(L('Uppläsning stöds inte här','Speech is not supported here'));return}if(speechSynthesis.speaking){speechSynthesis.cancel();return}
  const u=new SpeechSynthesisUtterance(briefText());u.lang=lang==='sv'?'sv-SE':'en-GB';u.rate=.95;speechSynthesis.speak(u)}

/* ---------- routing (hash routes, so the phone's back button works) ---------- */
const TABS=['home','leads','calc','log','mem'],PARENT={lead:'#/leads',pack:'#/leads',tender:'#/leads',quote:'#/calc',report:'#/home'},SCROLL={};
function parse(){const h=(location.hash||'#/home').replace(/^#\/?/,'').split('/');let v=h[0]||'home';const p=decodeURIComponent(h.slice(1).join('/')||'');
  if(!TABS.includes(v)&&!PARENT[v])v='home';return [v,p]}
function go(h){if(location.hash===h)return;SCROLL[location.hash]=scrollY;history.pushState({d:(history.state&&history.state.d||0)+1},'',h);route(false)}
function back(){const st=history.state;if(st&&st.d>0)history.back();else{history.replaceState({d:0},'',PARENT[view]||'#/home');route(false)}}
function route(restore){today=iso();[view,param]=parse();render(false);
  window.scrollTo(0,restore&&SCROLL[location.hash]!=null?SCROLL[location.hash]:0)}
window.addEventListener('popstate',()=>{
  if(sheetPushed){sheetPushed=false;hideSheet();const f=afterClose;afterClose=null;if(f)f();return}
  if(sheetOpen())hideSheet();
  route(true)});

/* ---------- render & events ---------- */
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2400)}
function render(keep){
  const y=scrollY;document.documentElement.lang=lang;clearMaps();$('#app').classList.toggle('noanim',!!keep);
  $('#app').innerHTML=({home:vHome,leads:vLeads,calc:vCalc,log:vLog,mem:vMem,lead:vLead,pack:vPack,tender:vTender,quote:vQuote,report:vReport})[view]();
  const nb=(k,t)=>`<button class="${view===k||PARENT[view]==='#/'+k?'on':''}" data-go="${k}">${ic(k)}${t}</button>`;
  $('#nav').innerHTML=nb('home',L('Hem','Home'))+nb('leads',L('Jobb','Work'))+`<button class="fab" data-a="newlog" aria-label="${L('Logga dag','Log day')}">${ic('plus')}</button>`+nb('calc',L('Kalkyl','Calc'))+nb('mem',L('Kontakter','Contacts'));
  if(view==='lead')fillLead();if(view==='pack'){const p=leads&&buildPacks(nearLeads()).find(x=>x.id===param);if(p)polyMap('pmap',p.items)}
  if(view==='leads'&&leadTab==='map')drawMap();
  if(keep)window.scrollTo(0,y);
}
async function copy(t){try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}toast(L('Kopierat','Copied'))}
const val=id=>(document.getElementById(id)||{}).value||'';
document.addEventListener('click',async e=>{
  if(e.target.id==='sheet'){closeSheet();return}
  const tb=e.target.closest('[data-tab]');if(tb){switchTab(tb.dataset.tab);return}
  const el=e.target.closest('[data-a]'),gt=e.target.closest('[data-go]');
  if(!el&&gt){const h='#/'+gt.dataset.go;if(sheetOpen())closeSheet(()=>go(h));else if(location.hash===h)window.scrollTo({top:0,behavior:'smooth'});else go(h);return}
  if(!el)return;const a=el.dataset.a,id=el.dataset.id;
  if(a==='lang'){lang=S.lang=lang==='sv'?'en':'sv';save();render(true)}
  else if(a==='back')back();
  else if(a==='close')closeSheet();
  else if(a==='hide'){S.hide=!S.hide;save();render(true)}
  else if(a==='speak')speak();
  else if(a==='copy')copy(el.dataset.v);
  else if(a==='install'){if(installEvt){installEvt.prompt();const r=await installEvt.userChoice;installEvt=null;if(r&&r.outcome==='accepted')toast(L('Appen installeras','Installing the app'));instUpd()}}
  else if(a==='noinst'){S.noInstall=true;save();instUpd()}
  else if(a==='cleardemo'){if(confirm(L('Radera all data och börja från noll?','Erase all data and start from zero?'))){S.jobs=[];S.logs=[];S.contacts=[];S.machines=[];S.demo=false;save();closeSheet(()=>render(true))}}
  else if(a==='reload'){toast(L('Hämtar…','Loading…'));loadLeads(true)}
  else if(a==='more'){shown+=40;render(true)}
  else if(a==='fper'){S.f.per=el.dataset.v;shown=40;save();render(true)}
  else if(a==='lead')go('#/lead/'+encodeURIComponent(id));
  else if(a==='openlead')closeSheet(()=>go('#/lead/'+encodeURIComponent(id)));
  else if(a==='opentender')closeSheet(()=>go('#/tender/'+encodeURIComponent(id)));
  else if(a==='pack')go('#/pack/'+encodeURIComponent(id));
  else if(a==='tender')go('#/tender/'+encodeURIComponent(id));
  else if(a==='leadcalc'){const l=findLead(id);calcInit(l.k==='ut'?'mark':'avv',{name:l.kom+(l.k==='av'?' '+l.id:' '+L('hygge','clear-cut')),qty:l.k==='ut'?l.plant:Math.round(l.ha*S.m3ha),km:Math.round(l.km*1.3),cust:(S.contacts.find(c=>c.ref===l.id)||{}).owner||''});go('#/calc')}
  else if(a==='packcalc'){const p=buildPacks(nearLeads()).find(x=>x.id===id);calcInit('avv',{name:`${p.kom} ${L('paket','package')} ${p.items.length} ${L('trakter','sites')}`,qty:Math.round(p.ha*S.m3ha),km:Math.round(p.km*1.3)});go('#/calc')}
  else if(a==='leadsave'){saveLead(findLead(id));el.textContent=L('Sparad ✓','Saved ✓');el.classList.remove('gold');toast(L('Sparad i Kontakter med färdigt meddelande','Saved to Contacts with a ready message'))}
  else if(a==='leadshare'){const l=findLead(id);try{await navigator.share({title:`${nf(l.ha,1)} ha · ${l.kom}`,text:`${l.k==='av'?typName(l.typ):l.typ}: ${nf(l.ha,1)} ha, ${l.kom}${l.k==='av'?', '+L('ärende','case')+' '+l.id:''}. ${L('Koordinater','Coordinates')} ${l.lat.toFixed(5)}, ${l.lon.toFixed(5)}`})}catch(e){}}
  else if(a==='buyer'){const l=findLead(id),n=el.dataset.v+' – '+l.kom;if(!S.contacts.some(c=>c.name===n)){S.contacts.unshift({id:uid(),name:n,phone:'',status:'ny',follow:addD(today,1),lead:l.id,notes:[{d:today,t:L(`Virkesköpare. Fråga om de har anlitat entreprenör för ${l.k==='av'?'ärende '+l.id:'hygget'} (${nf(l.ha,1)} ha i ${l.kom}) och om fler uppdrag i området.`,`Timber buyer. Ask whether they have hired a contractor for ${l.k==='av'?'case '+l.id:'the clear-cut'} (${nf(l.ha,1)} ha in ${l.kom}) and about more work in the area.`)}]});save()}el.textContent='✓';toast(L('Tillagd i Kontakter – påminnelse i morgon','Added to Contacts – reminder tomorrow'))}
  else if(a==='ownsave'){const n=val('own-name').trim();if(!n){toast(L('Skriv ägarens namn först','Type the owner\'s name first'));return}saveLead(findLead(id),n,val('own-phone').trim());toast(L('Ägaren sparad i Kontakter','Owner saved to Contacts'));render(true)}
  else if(a==='watch'){const t=(SNAP.ted||[]).find(x=>x.id===id);if(!S.contacts.some(c=>c.ref==='T'+id)){const f=addD(t.dl,-5);S.contacts.unshift({id:uid(),ref:'T'+id,name:t.b+' – '+t.t,phone:'',status:'ny',follow:f<today?today:f,notes:[{d:today,t:L(`Upphandling ${t.id}, sista anbudsdag ${t.dl}.`,`Tender ${t.id}, deadline ${t.dl}.`)}]});save()}render(true);toast(L('Bevakas – påminnelse fem dagar före sista dag','Watching – reminder five days before the deadline'))}
  else if(a==='savejob'){const r=calcRes();if(!C.name.trim()){toast(L('Ge jobbet ett namn','Give the job a name'));return}
    S.jobs.unshift({id:uid(),name:C.name.trim(),type:C.type,unit:r.T.unit,qty:+C.qty,price:+C.price,hcost:+C.hcost,dl:+C.dl,dprice:+C.dprice,moveCost:r.move,other:+C.other||0,estCost:r.cost,done:false});
    S.my[C.type]={price:+C.price,prod:+C.prod,hcost:+C.hcost,dl:+C.dl};S.diesel=+C.dprice||S.diesel;S.movekm=+C.kmcost||S.movekm;save();C=null;go('#/home');toast(L('Jobbet är sparat','Job saved'))}
  else if(a==='quote')go('#/quote');
  else if(a==='sharequote'){try{await navigator.share({title:'Offert – '+S.co.name,text:quoteText()})}catch(e){}}
  else if(a==='quotesave'){const cu=(C.cust||'').trim();if(!cu){toast(L('Fyll i kund','Enter the customer'));$('#q-cust').focus();return}const r=calcRes();let c=S.contacts.find(x=>x.name===cu||x.owner===cu);if(!c){c={id:uid(),name:cu,phone:'',notes:[]};S.contacts.unshift(c)}
    c.status='off';c.follow=addD(today,7);c.notes.unshift({d:today,t:L(`Offert skickad: ${tname(C.type)}${C.name?', '+C.name:''}, ${nf(C.qty,1)} ${r.T.unit} à ${nf(C.price)} kr = ${kr(r.rev)} exkl. moms.`,`Quote sent: ${tname(C.type)}${C.name?', '+C.name:''}, ${nf(C.qty,1)} ${r.T.unit} at ${nf(C.price)} kr = ${kr(r.rev)} excl. VAT.`)});save();toast(L('Sparad – påminnelse om en vecka','Saved – reminder in one week'))}
  else if(a==='newlog')shLog(null,id);else if(a==='editlog')shLog(id);
  else if(a==='savelog'){const o={jobId:val('lg-job'),date:val('lg-date')||today,hours:+val('lg-h')||0,qty:+val('lg-q')||0,diesel:+val('lg-d')||0,note:val('lg-n').trim(),machine:val('lg-m')};
    if(!o.hours&&!o.qty){toast(L('Fyll i timmar eller mängd','Enter hours or quantity'));return}const old=S.logs.find(x=>x.id===id);
    if(old){const om=S.machines.find(x=>x.id===old.machine);if(om)om.hours-=+old.hours||0;Object.assign(old,o)}else S.logs.push({id:uid(),...o});
    const mc=S.machines.find(x=>x.id===o.machine);if(mc)mc.hours+=o.hours;save();closeSheet(()=>render(true));toast(L('Dagen är loggad','Day logged'))}
  else if(a==='dellog'){const old=S.logs.find(x=>x.id===id),om=old&&S.machines.find(x=>x.id===old.machine);if(om)om.hours-=+old.hours||0;S.logs=S.logs.filter(x=>x.id!==id);save();closeSheet(()=>render(true))}
  else if(a==='jobdone'){S.jobs.find(j=>j.id===id).done=true;save();render(true);toast(L('Jobbet markerat som klart','Job marked as done'))}
  else if(a==='newcontact')shContact();else if(a==='contact')shContact(id);
  else if(a==='savecontact'){const name=val('ct-name').trim();if(!name){toast(L('Skriv ett namn','Enter a name'));return}let c=S.contacts.find(x=>x.id===id);if(!c){c={id:uid(),notes:[]};S.contacts.unshift(c)}
    Object.assign(c,{name,phone:val('ct-phone').trim(),follow:val('ct-follow'),status:val('ct-status')});const n=val('ct-note').trim();if(n)c.notes.unshift({d:today,t:n});save();closeSheet(()=>render(true));toast(L('Sparat','Saved'))}
  else if(a==='delcontact'){if(confirm(L('Ta bort kontakten?','Delete this contact?'))){S.contacts=S.contacts.filter(x=>x.id!==id);save();closeSheet(()=>render(true))}}
  else if(a==='report'){repYm=today.slice(0,7);if(sheetOpen())closeSheet(()=>go('#/report'));else go('#/report')}
  else if(a==='share'){const t=reportText(repYm);if(navigator.share){try{await navigator.share({title:S.co.name+' – '+repYm,text:t})}catch(e){}}else copy(t)}
  else if(a==='print')window.print();
  else if(a==='machines')shMachines();
  else if(a==='svcdone'){const x=S.machines.find(m=>m.id===id);x.last=x.hours;save();shMachines();render(true);toast(L('Service noterad','Service noted'))}
  else if(a==='delmach'){S.machines=S.machines.filter(m=>m.id!==id);save();shMachines();render(true)}
  else if(a==='addmach'){const n=val('mc-n').trim();if(!n){toast(L('Skriv ett namn','Enter a name'));return}const h=+val('mc-h')||0;S.machines.push({id:uid(),name:n,hours:h,every:+val('mc-e')||500,last:h});save();shMachines()}
  else if(a==='settings')shSettings();
  else if(a==='gps'){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(p=>{$('#st-lat').value=p.coords.latitude.toFixed(4);$('#st-lon').value=p.coords.longitude.toFixed(4);toast(L('Position hämtad','Location set'))},()=>toast(L('Kunde inte hämta position','Could not get location')))}
  else if(a==='saveset'){S.co={name:val('st-co')||S.co.name,person:val('st-pe')||S.co.person,org:val('st-or'),phone:val('st-ph'),email:val('st-em')};S.home={name:val('st-name')||'Hem',lat:+val('st-lat')||S.home.lat,lon:+val('st-lon')||S.home.lon};S.radius=+val('st-r')||S.radius;S.diesel=+val('st-d')||S.diesel;S.target=+val('st-t')||S.target;S.m3ha=+val('st-m')||S.m3ha;S.movekm=+val('st-k')||S.movekm;RP=null;
    if(leads)leads.list=leads.list.map(l=>mkLead([l.id,l.kom,l.typ,l.ts,l.ha,l.plant,l.lat,l.lon,l.ring]));save();closeSheet(()=>render(true));toast(L('Sparat','Saved'))}
  else if(a==='mic')startMic(el);
});
document.addEventListener('input',e=>{const k=e.target.dataset.k;if(k&&C){C[k]=e.target.value;if(!e.target.dataset.txt)$('#calcout').innerHTML=calcOut()}
  if(e.target.dataset.q&&C){C.cust=e.target.value;$('#q-to').textContent=C.cust||'…'}});
document.addEventListener('change',e=>{const c=e.target.dataset.c;
  if(c==='fkom'){S.f.kom=e.target.value;shown=40;save();render(true)}
  else if(c==='fdist'){S.f.dist=+e.target.value;shown=40;save();render(true)}
  else if(c==='fsort'){S.f.sort=e.target.value;save();render(true)}
  else if(c==='ctype'){calcInit(e.target.value,{name:C.name,km:C.km,cust:C.cust});render(true)}
  else if(e.target.id==='rp-m'){repYm=e.target.value||repYm;render(true)}});
const instUpd=()=>{const el=$('#inst');if(el)el.innerHTML=installCard()};
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;instUpd()});
window.addEventListener('appinstalled',()=>{installEvt=null;S.noInstall=true;save();instUpd()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&iso()!==today){today=iso();if(leads)leads.list=leads.list.map(l=>mkLead([l.id,l.kom,l.typ,l.ts,l.ha,l.plant,l.lat,l.lon,l.ring]));render(true)}});
history.replaceState({d:0},'',location.hash||'#/home');route(false);loadLeads();
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('sw.js').catch(()=>{});
