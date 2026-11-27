/* =====================================================
   islam.js — المواقيت · المصحف · الأذكار · الإذاعة · السبحة
   يعتمد على: islam-data.js (جداول وأذكار) و data/quran.json (نص المصحف)
   ===================================================== */
(function(){
var css=document.createElement('style');
css.textContent=[
"@font-face{font-family:'AmiriQuran';src:url('fonts/amiri-quran-arabic-400-normal.woff2') format('woff2');font-display:swap}",
".pr-row{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;border-radius:12px;margin-bottom:6px;background:var(--card);border:1px solid var(--border)}",
".pr-row b{font-size:1.02rem}.pr-row span{font-weight:800;direction:ltr;font-size:1.05rem}",
".pr-row.next{background:var(--primary-soft);border-color:var(--primary)}",
".pr-row.sun{opacity:.75}",
".zk{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px}",
".zk-t{font-family:'AmiriQuran','Cairo',serif;font-size:1.3rem;line-height:2.1;text-align:center}",
".zk-s{color:var(--muted);font-size:.8rem;text-align:center;margin:4px 0 8px}",
".zk-b{display:block;width:100%;border:0;border-radius:12px;padding:12px;font-weight:800;font-size:1rem;background:var(--primary);color:#fff;cursor:pointer}",
".zk.done{opacity:.55}.zk.done .zk-b{background:#2e7d32}",
".mq{position:fixed;inset:0;z-index:400;background:#f6efe0;display:none;flex-direction:column}",
".mq.night{background:#101010}",
".mq-bar,.mq-foot{display:flex;align-items:center;gap:8px;padding:8px 10px;background:var(--hdr1,var(--primary));color:#fff}",
".mq-bar{padding-top:calc(8px + var(--sat))}.mq-foot{padding-bottom:calc(8px + var(--sab));flex-wrap:wrap;justify-content:center}",
".mq-bar button,.mq-foot button{background:rgba(255,255,255,.18);border:0;color:#fff;border-radius:10px;padding:8px 12px;font-weight:700;cursor:pointer;font-family:inherit;min-height:38px}",
".mq-title{flex:1;text-align:center;font-weight:800}",
".mq-body{flex:1;overflow:auto;position:relative;-webkit-overflow-scrolling:touch}",
".mq-img{display:block;margin:0 auto;max-width:none;width:100%;height:auto}",
".mq.night .mq-img{filter:invert(1) hue-rotate(180deg) brightness(.9)}",
".mq-stat{position:absolute;top:40%;left:0;right:0;text-align:center;color:#555;padding:0 20px}",
".mq.night .mq-stat{color:#bbb}",
".mq-text{font-family:'AmiriQuran','Cairo',serif;line-height:2.5;padding:14px 16px 30px;text-align:justify;color:#1b1b1b;max-width:720px;margin:0 auto}",
".mq.night .mq-text{color:#e8e0cc}",
".mq-sur{text-align:center;font-weight:800;font-size:1.5em;margin:6px 0;color:var(--primary-dark)}",
".mq-bsm{text-align:center;margin:4px 0 10px}",
".mq-an{color:var(--primary);font-size:.8em;margin:0 3px}",
".mq-hl{background:rgba(255,193,7,.35);border-radius:6px}",
".mq-idx{position:absolute;inset:0;background:var(--bg);color:var(--text);display:none;flex-direction:column;z-index:2}",
".mq-idx .ih{display:flex;gap:6px;padding:10px;padding-top:calc(10px + var(--sat));background:var(--card);border-bottom:1px solid var(--border);overflow-x:auto}",
".mq-idx .ib{flex:1;overflow:auto;padding:10px}",
".mq-li{display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border);cursor:pointer;gap:8px}",
".mq-li small{color:var(--muted)}",
".tsb{width:200px;height:200px;border-radius:50%;border:0;background:linear-gradient(145deg,var(--primary),var(--primary-dark));color:#fff;font-size:3.4rem;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;display:block;margin:14px auto}",
".tsb:active{transform:scale(.96)}"
].join('\n');
document.head.appendChild(css);
})();

function $i(id){return document.getElementById(id);}
function islLS(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function islSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function islEsc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function islToast(m,e){if(typeof toast==='function')toast(m,e);}
function islPad2(n){return String(n).padStart(2,'0');}
var ISLS=islLS('zn_isl_tab','pray');
function islData(){return window.ISL_DATA||{surahs:[],juzPages:[],juzStart:[],adhkar:[]};}
function islVib(ms){try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}

/* ================= مواقيت الصلاة (عالمية، بدون إنترنت) ================= */
// [عربي, English, خط العرض, خط الطول, المنطقة الزمنية] — أول 26 مدينة مصرية بنفس الترتيب القديم
var PR_CITIES=[
['القاهرة','Cairo',30.0444,31.2357,'Africa/Cairo'],['الجيزة','Giza',30.0131,31.2089,'Africa/Cairo'],['الإسكندرية','Alexandria',31.2001,29.9187,'Africa/Cairo'],['بورسعيد','Port Said',31.2653,32.3019,'Africa/Cairo'],['السويس','Suez',29.9668,32.5498,'Africa/Cairo'],['الإسماعيلية','Ismailia',30.5965,32.2715,'Africa/Cairo'],['دمياط','Damietta',31.4165,31.8133,'Africa/Cairo'],['المنصورة','Mansoura',31.0409,31.3785,'Africa/Cairo'],['الزقازيق','Zagazig',30.5877,31.502,'Africa/Cairo'],['طنطا','Tanta',30.7865,31.0004,'Africa/Cairo'],['بنها','Benha',30.466,31.1848,'Africa/Cairo'],['شبين الكوم','Shebin El Kom',30.5972,30.9876,'Africa/Cairo'],['كفر الشيخ','Kafr El Sheikh',31.1107,30.9388,'Africa/Cairo'],['دمنهور','Damanhur',31.0341,30.4682,'Africa/Cairo'],['الفيوم','Fayoum',29.3084,30.8428,'Africa/Cairo'],['بني سويف','Beni Suef',29.0661,31.0994,'Africa/Cairo'],['المنيا','Minya',28.1099,30.7503,'Africa/Cairo'],['أسيوط','Assiut',27.1809,31.1837,'Africa/Cairo'],['سوهاج','Sohag',26.5569,31.6948,'Africa/Cairo'],['قنا','Qena',26.1551,32.716,'Africa/Cairo'],['الأقصر','Luxor',25.6872,32.6396,'Africa/Cairo'],['أسوان','Aswan',24.0889,32.8998,'Africa/Cairo'],['الغردقة','Hurghada',27.2579,33.8116,'Africa/Cairo'],['مرسى مطروح','Marsa Matrouh',31.3543,27.2373,'Africa/Cairo'],['العريش','Arish',31.1316,33.7984,'Africa/Cairo'],['شرم الشيخ','Sharm El Sheikh',27.9158,34.33,'Africa/Cairo'],
['مكة المكرمة','Makkah',21.3891,39.8579,'Asia/Riyadh'],['المدينة المنورة','Madinah',24.5247,39.5692,'Asia/Riyadh'],['الرياض','Riyadh',24.7136,46.6753,'Asia/Riyadh'],['جدة','Jeddah',21.4858,39.1925,'Asia/Riyadh'],['دبي','Dubai',25.2048,55.2708,'Asia/Dubai'],['أبوظبي','Abu Dhabi',24.4539,54.3773,'Asia/Dubai'],['الكويت','Kuwait City',29.3759,47.9774,'Asia/Kuwait'],['الدوحة','Doha',25.2854,51.531,'Asia/Qatar'],['المنامة','Manama',26.2285,50.586,'Asia/Bahrain'],['مسقط','Muscat',23.588,58.3829,'Asia/Muscat'],['صنعاء','Sanaa',15.3694,44.191,'Asia/Aden'],['بغداد','Baghdad',33.3152,44.3661,'Asia/Baghdad'],['دمشق','Damascus',33.5138,36.2765,'Asia/Damascus'],['عمّان','Amman',31.9454,35.9284,'Asia/Amman'],['القدس','Jerusalem',31.7683,35.2137,'Asia/Jerusalem'],['بيروت','Beirut',33.8938,35.5018,'Asia/Beirut'],['طرابلس','Tripoli',32.8872,13.1913,'Africa/Tripoli'],['تونس','Tunis',36.8065,10.1815,'Africa/Tunis'],['الجزائر','Algiers',36.7538,3.0588,'Africa/Algiers'],['الرباط','Rabat',34.0209,-6.8416,'Africa/Casablanca'],['الدار البيضاء','Casablanca',33.5731,-7.5898,'Africa/Casablanca'],['الخرطوم','Khartoum',15.5007,32.5599,'Africa/Khartoum'],['نواكشوط','Nouakchott',18.0735,-15.9582,'Africa/Nouakchott'],['مقديشو','Mogadishu',2.0469,45.3182,'Africa/Mogadishu'],['أديس أبابا','Addis Ababa',9.03,38.74,'Africa/Addis_Ababa'],['نيروبي','Nairobi',-1.2921,36.8219,'Africa/Nairobi'],['لاغوس','Lagos',6.5244,3.3792,'Africa/Lagos'],['جوهانسبرغ','Johannesburg',-26.2041,28.0473,'Africa/Johannesburg'],
['إسطنبول','Istanbul',41.0082,28.9784,'Europe/Istanbul'],['أنقرة','Ankara',39.9334,32.8597,'Europe/Istanbul'],['طهران','Tehran',35.6892,51.389,'Asia/Tehran'],['كابول','Kabul',34.5553,69.2075,'Asia/Kabul'],['كراتشي','Karachi',24.8607,67.0011,'Asia/Karachi'],['إسلام آباد','Islamabad',33.6844,73.0479,'Asia/Karachi'],['لاهور','Lahore',31.5204,74.3587,'Asia/Karachi'],['دلهي','Delhi',28.6139,77.209,'Asia/Kolkata'],['مومباي','Mumbai',19.076,72.8777,'Asia/Kolkata'],['دكا','Dhaka',23.8103,90.4125,'Asia/Dhaka'],['جاكرتا','Jakarta',-6.2088,106.8456,'Asia/Jakarta'],['كوالالمبور','Kuala Lumpur',3.139,101.6869,'Asia/Kuala_Lumpur'],['سنغافورة','Singapore',1.3521,103.8198,'Asia/Singapore'],['طوكيو','Tokyo',35.6762,139.6503,'Asia/Tokyo'],
['لندن','London',51.5074,-0.1278,'Europe/London'],['باريس','Paris',48.8566,2.3522,'Europe/Paris'],['برلين','Berlin',52.52,13.405,'Europe/Berlin'],['مدريد','Madrid',40.4168,-3.7038,'Europe/Madrid'],['روما','Rome',41.9028,12.4964,'Europe/Rome'],['أمستردام','Amsterdam',52.3676,4.9041,'Europe/Amsterdam'],['موسكو','Moscow',55.7558,37.6173,'Europe/Moscow'],
['نيويورك','New York',40.7128,-74.006,'America/New_York'],['واشنطن','Washington D.C.',38.9072,-77.0369,'America/New_York'],['شيكاغو','Chicago',41.8781,-87.6298,'America/Chicago'],['لوس أنجلوس','Los Angeles',34.0522,-118.2437,'America/Los_Angeles'],['تورنتو','Toronto',43.6532,-79.3832,'America/Toronto'],['مكسيكو سيتي','Mexico City',19.4326,-99.1332,'America/Mexico_City'],['ساو باولو','São Paulo',-23.5505,-46.6333,'America/Sao_Paulo'],['سيدني','Sydney',-33.8688,151.2093,'Australia/Sydney']
];
// [عربي, English, زاوية الفجر, زاوية العشاء, دقائق بعد المغرب للعشاء (أم القرى)]
var PR_METHODS={egypt:['الهيئة المصرية العامة للمساحة','Egyptian General Authority of Survey',19.5,17.5,0],mwl:['رابطة العالم الإسلامي','Muslim World League',18,17,0],isna:['أمريكا الشمالية (ISNA)','ISNA (North America)',15,15,0],makkah:['أم القرى (مكة المكرمة)','Umm al-Qura (Makkah)',18.5,0,90],karachi:['جامعة العلوم الإسلامية — كراتشي','University of Islamic Sciences, Karachi',18,18,0]};
var PR_NAMES={fajr:'الفجر',sunrise:'الشروق',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
var PR_PRAY=['fajr','dhuhr','asr','maghrib','isha'],PR_ORDER=['fajr','sunrise','dhuhr','asr','maghrib','isha'];
function isEn(){return !!(window.I18N&&I18N.lang!=='ar');}
function prCityName(c){return isEn()?c[1]:c[0];}
function prRad(d){return d*Math.PI/180;}function prDeg(r){return r*180/Math.PI;}
function prSin(d){return Math.sin(prRad(d));}function prCos(d){return Math.cos(prRad(d));}function prTan(d){return Math.tan(prRad(d));}
function prAsin(x){return prDeg(Math.asin(x));}function prAcos(x){return prDeg(Math.acos(x));}
function prAtan2(y,x){return prDeg(Math.atan2(y,x));}function prAcot(x){return prDeg(Math.atan(1/x));}
function prFixA(a){return a-360*Math.floor(a/360);}function prFixH(a){return a-24*Math.floor(a/24);}
function prJD(y,m,d){if(m<=2){y-=1;m+=12;}var A=Math.floor(y/100),B=2-A+Math.floor(A/4);return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+B-1524.5;}
function prSun(jd){
  var D=jd-2451545.0,g=prFixA(357.529+0.98560028*D),q=prFixA(280.459+0.98564736*D);
  var L=prFixA(q+1.915*prSin(g)+0.020*prSin(2*g)),e=23.439-0.00000036*D;
  var RA=prAtan2(prCos(e)*prSin(L),prCos(L))/15,eqt=q/15-prFixH(RA);
  if(eqt>12)eqt-=24;if(eqt<-12)eqt+=24;
  return {decl:prAsin(prSin(e)*prSin(L)),eqt:eqt};
}
// يرجع الأوقات بالساعات (توقيت المدينة). method = [..,زاوية الفجر,زاوية العشاء,دقائق]
function prCompute(y,mo,d,lat,lng,tz,asrF,method){
  var M=method||PR_METHODS.egypt,j=prJD(y,mo,d)-lng/(15*24),sp=prSun(j+0.5),mid=prFixH(12-sp.eqt),dc=sp.decl;
  function T(ang){return prAcos((-prSin(ang)-prSin(dc)*prSin(lat))/(prCos(dc)*prCos(lat)))/15;}
  function A(f){var x=prAcot(f+prTan(Math.abs(lat-dc)));return prAcos((prSin(x)-prSin(dc)*prSin(lat))/(prCos(dc)*prCos(lat)))/15;}
  var shift=tz-lng/15,mg=mid+T(0.833)+shift;
  return {fajr:mid-T(M[2])+shift,sunrise:mid-T(0.833)+shift,dhuhr:mid+shift,asr:mid+A(asrF||1)+shift,maghrib:mg,isha:M[4]?mg+M[4]/60:mid+T(M[3])+shift};
}
function prCfg(){var c=islLS('zn_pr',{});return {city:c.city==null?0:c.city,lat:c.lat,lng:c.lng,asr:c.asr||1,adj:c.adj||{},alert:!!c.alert,m:PR_METHODS[c.m]?c.m:'egypt'};}
function prLoc(){
  var c=prCfg(),x;
  if(c.city>=0&&PR_CITIES[c.city]){x=PR_CITIES[c.city];return {name:prCityName(x),lat:x[2],lng:x[3],tz:x[4]};}
  if(c.lat!=null&&c.lng!=null&&isFinite(+c.lat)&&isFinite(+c.lng))return {name:isEn()?'My location':'موقعي',lat:+c.lat,lng:+c.lng,tz:null};
  x=PR_CITIES[0];return {name:prCityName(x),lat:x[2],lng:x[3],tz:x[4]};
}
// الوقت الحالي في مدينة معيّنة (أو بتوقيت الجهاز لو tz=null)
function prLocalNow(tz){
  var d=new Date();
  if(!tz)return {y:d.getFullYear(),mo:d.getMonth()+1,d:d.getDate(),sec:d.getHours()*3600+d.getMinutes()*60+d.getSeconds(),tzh:-d.getTimezoneOffset()/60};
  try{
    var f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'}),p={};
    f.formatToParts(d).forEach(function(x){p[x.type]=+x.value;});
    var h=p.hour%24,asUTC=Date.UTC(p.year,p.month-1,p.day,h,p.minute,p.second);
    return {y:p.year,mo:p.month,d:p.day,sec:h*3600+p.minute*60+p.second,tzh:Math.round((asUTC-Math.floor(d.getTime()/1000)*1000)/36e5*4)/4};
  }catch(e){return prLocalNow(null);}
}
var PRC={key:'',val:null};
function prDayMins(y,mo,d,tzh){
  var loc=prLoc(),cfg=prCfg(),key=[y,mo,d,tzh,loc.lat,loc.lng,cfg.asr,cfg.m,JSON.stringify(cfg.adj)].join('|');
  if(PRC.key===key)return PRC.val;
  var h=prCompute(y,mo,d,loc.lat,loc.lng,tzh,cfg.asr,PR_METHODS[cfg.m]),o={};
  Object.keys(h).forEach(function(k){o[k]=isFinite(h[k])?Math.round(h[k]*60)+(+cfg.adj[k]||0):NaN;});
  PRC={key:key,val:o};return o;
}
function prFmtMin(m){
  if(!isFinite(m))return '—';
  m=((m%1440)+1440)%1440;var h=Math.floor(m/60),mm=m%60,ap=h>=12?'م':'ص';h=h%12||12;
  return h+':'+islPad2(mm)+' '+ap;
}
function prNextInfo(){
  var loc=prLoc(),ln=prLocalNow(loc.tz),t=prDayMins(ln.y,ln.mo,ln.d,ln.tzh),i,k;
  for(i=0;i<PR_PRAY.length;i++){k=PR_PRAY[i];if(isFinite(t[k])&&t[k]*60>ln.sec)return {k:k,secs:t[k]*60-ln.sec,min:t[k],tomorrow:false};}
  var nd=new Date(Date.UTC(ln.y,ln.mo-1,ln.d+1)),t2=prDayMins(nd.getUTCFullYear(),nd.getUTCMonth()+1,nd.getUTCDate(),ln.tzh);
  return {k:'fajr',secs:86400-ln.sec+t2.fajr*60,min:t2.fajr,tomorrow:true};
}
function prCount(ms){var s=Math.max(0,Math.floor(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h+':'+islPad2(m)+':'+islPad2(s%60);}
function islNextText(){
  try{var n=prNextInfo();return '🕌 '+PR_NAMES[n.k]+' '+prFmtMin(n.min)+' — بعد '+prCount(n.secs*1000);}catch(e){return '';}
}
function prQibla(lat,lng){
  var p1=prRad(lat),p2=prRad(21.4225),dl=prRad(39.8262-lng);
  var y=Math.sin(dl)*Math.cos(p2),x=Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl);
  return prFixA(prDeg(Math.atan2(y,x)));
}
function prDirName(a){return ['شمال','شمال شرق','شرق','جنوب شرق','جنوب','جنوب غرب','غرب','شمال غرب'][Math.round(a/45)%8];}
var PR_ALERTED='';
function prBeep(){
  try{var C=window.AudioContext||window.webkitAudioContext,a=new C();[0,0.4,0.8].forEach(function(dl){var o=a.createOscillator(),g=a.createGain();o.frequency.value=880;g.gain.value=0.15;o.connect(g);g.connect(a.destination);o.start(a.currentTime+dl);o.stop(a.currentTime+dl+0.25);});}catch(e){}
}
function islTick(){
  var el=$i('homeNextPr');
  if(el)el.textContent=islNextText();
  var c=$i('prCount');
  if(c){try{var n=prNextInfo();c.textContent=PR_NAMES[n.k]+' بعد '+prCount(n.secs*1000);}catch(e){}}
  if(prCfg().alert){
    try{
      var loc=prLoc(),ln=prLocalNow(loc.tz),t=prDayMins(ln.y,ln.mo,ln.d,ln.tzh);
      PR_PRAY.forEach(function(k){
        var diff=ln.sec-t[k]*60,key=ln.y+'-'+ln.mo+'-'+ln.d+k;
        if(diff>=0&&diff<60&&PR_ALERTED!==key){PR_ALERTED=key;islToast('🕌 حان الآن موعد صلاة '+PR_NAMES[k]);islVib([200,100,200]);prBeep();}
      });
    }catch(e){}
  }
  rdTick();
}
function prSave(c){islSet('zn_pr',c);PRC={key:'',val:null};renderIslam();}
function prSetCity(v){var c=prCfg();c.city=+v;prSave(c);}
function prSetAsr(v){var c=prCfg();c.asr=+v;prSave(c);}
function prSetMethod(v){var c=prCfg();if(PR_METHODS[v])c.m=v;prSave(c);}
function prSetAdj(k,v){var c=prCfg();c.adj[k]=parseInt(String(v).replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d);}),10)||0;prSave(c);}
function prToggleAlert(){var c=prCfg();c.alert=!c.alert;prSave(c);if(c.alert)islToast('تم تفعيل التنبيه (والبرنامج مفتوح)');}
function prGeo(){
  if(!navigator.geolocation)return islToast('الموقع غير متاح على هذا الجهاز',true);
  islToast('جارٍ تحديد الموقع...');
  navigator.geolocation.getCurrentPosition(function(p){var c=prCfg();c.city=-1;c.lat=p.coords.latitude;c.lng=p.coords.longitude;prSave(c);islToast('تم تحديد موقعك');},function(){islToast('تعذر تحديد الموقع. اختر مدينتك من القائمة',true);},{timeout:15000});
}
function islPray(){
  var loc=prLoc(),cfg=prCfg(),ln=prLocalNow(loc.tz),t=prDayMins(ln.y,ln.mo,ln.d,ln.tzh),n=prNextInfo();
  var rows=PR_ORDER.map(function(k){
    return '<div class="pr-row'+((k===n.k&&!n.tomorrow)?' next':'')+(k==='sunrise'?' sun':'')+'"><b>'+PR_NAMES[k]+'</b><span>'+prFmtMin(t[k])+'</span></div>';
  }).join('');
  var q=prQibla(loc.lat,loc.lng);
  var opts=PR_CITIES.map(function(c,i){return '<option value="'+i+'"'+(cfg.city===i?' selected':'')+'>'+islEsc(prCityName(c))+'</option>';}).join('')+'<option value="-1"'+(cfg.city<0?' selected':'')+'>موقعي الحالي</option>';
  var mopts=Object.keys(PR_METHODS).map(function(k){return '<option value="'+k+'"'+(cfg.m===k?' selected':'')+'>'+islEsc(isEn()?PR_METHODS[k][1]:PR_METHODS[k][0])+'</option>';}).join('');
  var adj=PR_ORDER.map(function(k){return '<div class="field" style="min-width:90px"><label>'+PR_NAMES[k]+' (±د)</label><input type="text" inputmode="numeric" value="'+(cfg.adj[k]||0)+'" onchange="prSetAdj(\''+k+'\',this.value)"></div>';}).join('');
  var utc='UTC'+(ln.tzh>=0?'+':'−')+Math.abs(ln.tzh);
  return '<div class="card" style="text-align:center"><div class="hint" style="margin:0">'+islEsc(loc.name)+' · '+utc+'</div><div id="prCount" style="font-size:1.5rem;font-weight:800;color:var(--primary-dark);margin:4px 0"></div></div>'+
    rows+
    '<div class="card" style="margin-top:12px"><h3>🧭 اتجاه القبلة</h3><p><b>'+Math.round(q)+'°</b> من الشمال (جهة '+prDirName(q)+')</p></div>'+
    '<div class="card"><h3>📍 الموقع والإعدادات</h3><div class="row"><div class="field"><label>المدينة</label><select onchange="prSetCity(this.value)">'+opts+'</select></div><button class="btn light" onclick="prGeo()">📍 حدّد موقعي</button></div>'+
    '<div class="row" style="margin-top:10px"><div class="field"><label>طريقة الحساب</label><select onchange="prSetMethod(this.value)">'+mopts+'</select></div>'+
    '<div class="field"><label>حساب العصر</label><select onchange="prSetAsr(this.value)"><option value="1"'+(cfg.asr===1?' selected':'')+'>المثل (الجمهور)</option><option value="2"'+(cfg.asr===2?' selected':'')+'>المثلين (الحنفي)</option></select></div>'+
    '<button class="btn '+(cfg.alert?'':'light')+'" onclick="prToggleAlert()">'+(cfg.alert?'🔔 التنبيه مفعّل':'🔕 تنبيه وقت الصلاة')+'</button></div>'+
    '<p class="hint" style="margin-top:10px">الحساب حسب الطريقة المختارة ويعمل بدون إنترنت. للمطابقة مع مواقيت مسجدكم عدّل الدقائق:</p><div class="row">'+adj+'</div></div>';
}

/* ================= الأذكار ================= */
var ADK={cat:null};
function adkDay(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function adkState(){var s=islLS('zn_adk',null);return (s&&s.d===adkDay())?s:{d:adkDay(),c:{}};}
function adkAuto(){var h=new Date().getHours();return (h>=3&&h<15)?'morning':'evening';}
function adkLeft(s,cat,i){var k=cat.id+':'+i;return s.c[k]==null?cat.items[i].c:s.c[k];}
function adkTap(ci,ii){
  var cat=islData().adhkar[ci],s=adkState(),left=adkLeft(s,cat,ii);
  if(left>0){s.c[cat.id+':'+ii]=left-1;islSet('zn_adk',s);islVib(left-1===0?[40,30,40]:15);}
  renderIslam();
}
function adkReset(ci){var cat=islData().adhkar[ci],s=adkState();cat.items.forEach(function(x,i){delete s.c[cat.id+':'+i];});islSet('zn_adk',s);renderIslam();}
function adkSetCat(id){ADK.cat=id;renderIslam();}
function islAdhkar(){
  var D=islData().adhkar;if(!D.length)return '<div class="empty">بيانات الأذكار غير محمّلة</div>';
  if(!ADK.cat||!D.some(function(c){return c.id===ADK.cat;}))ADK.cat=adkAuto();
  var ci=D.findIndex(function(c){return c.id===ADK.cat;}),cat=D[ci],s=adkState();
  var doneN=cat.items.filter(function(x,i){return adkLeft(s,cat,i)===0;}).length;
  var chips='<div class="chips">'+D.map(function(c){return '<button class="chip'+(c.id===ADK.cat?' on':'')+'" onclick="adkSetCat(\''+c.id+'\')">'+c.icon+' '+c.name+'</button>';}).join('')+'</div>';
  var list=cat.items.map(function(it,i){
    var left=adkLeft(s,cat,i);
    return '<div class="zk'+(left===0?' done':'')+'"><div class="zk-t" translate="no">'+islEsc(it.t)+'</div><div class="zk-s">'+islEsc(it.s||'')+'</div>'+
      '<button class="zk-b" onclick="adkTap('+ci+','+i+')">'+(left===0?'✓ تم':(it.c>1?'المتبقي: '+left+' من '+it.c:'اضغط عند الانتهاء'))+'</button></div>';
  }).join('');
  return chips+'<div class="card" style="display:flex;justify-content:space-between;align-items:center"><span>أنجزت <b>'+doneN+'</b> من '+cat.items.length+'</span><button class="btn light sm" onclick="adkReset('+ci+')">↺ إعادة</button></div>'+list;
}

/* ================= المصحف ================= */
var MQ_CACHE='zn-mushaf-v1',MQ_BASE_DEF='https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master';
var MQ={open:false,page:1,mode:'img',night:false,zoom:1,obj:null,fs:1.6,sur:1,ay:0,idx:'surah'};
var MQ_Q=null,MQ_N=null;
function mqBase(){var b=''; try{b=localStorage.getItem('zn_mq_base')||'';}catch(e){} return (b||MQ_BASE_DEF).replace(/\/$/,'');}
function mqUrl(p){return mqBase()+'/'+String(p).padStart(3,'0')+'.png';}
function mqSurahOfPage(p){var S=islData().surahs,r=0;for(var i=0;i<S.length;i++){if(S[i][3]<=p)r=i;}return r+1;}
function mqJuzOfPage(p){var J=islData().juzPages,r=1;for(var i=0;i<J.length;i++){if(J[i]<=p)r=i+1;}return r;}
function mqIsOpen(){return MQ.open;}
function mqArD(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d];});}
function mqAr(n){return isEn()?String(n):mqArD(n);}
function mqSN(i){var p=window.I18N&&I18N.lang!=='ar'&&window.I18N_DICT&&window.I18N_DICT[I18N.lang];var S=islData().surahs;return (p&&p.SURAH&&p.SURAH[i])||(S[i]?S[i][0]:'');}
function mqDom(){
  if($i('mqView'))return;
  var d=document.createElement('div');d.id='mqView';d.className='mq';
  d.innerHTML='<div class="mq-bar"><button onclick="mqClose()">✕</button><div class="mq-title" id="mqTitle"></div><button id="mqModeBtn" onclick="mqToggleMode()">📜 نص</button><button onclick="mqIndex()">☰ فهرس</button></div>'+
   '<div class="mq-body" id="mqBody"></div>'+
   '<div class="mq-foot" id="mqFoot"></div>'+
   '<div class="mq-idx" id="mqIdx"></div>';
  document.body.appendChild(d);
  var b=$i('mqBody'),sx=0,sy=0,multi=false;
  b.addEventListener('touchstart',function(e){multi=e.touches.length>1;sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  b.addEventListener('touchend',function(e){
    if(multi||MQ.mode!=='img'||MQ.zoom!==1||!e.changedTouches.length)return;
    var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6){if(dx<0)mqNext();else mqPrev();}
  },{passive:true});
  document.addEventListener('keydown',function(e){
    if(!MQ.open||(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)))return;
    if(e.key==='ArrowLeft')mqNext();else if(e.key==='ArrowRight')mqPrev();else if(e.key==='Escape')mqClose();
  });
}
function mqOpen(p,mode,s,a){
  mqDom();
  MQ.open=true;MQ.night=!!islLS('zn_mq_night',false);MQ.fs=+islLS('zn_mq_fs',1.6)||1.6;MQ.zoom=1;
  var v=$i('mqView');v.style.display='flex';v.classList.toggle('night',MQ.night);
  MQ.mode=mode||islLS('zn_mq_mode','img');
  if(MQ.mode==='txt'){var lt=islLS('zn_mq_lt',{s:1,a:0});mqText(s||lt.s,a!=null?a:lt.a);}
  else mqShow(p||islLS('zn_mq_last',1));
}
function mqClose(){
  MQ.open=false;var v=$i('mqView');if(v)v.style.display='none';
  var ix=$i('mqIdx');if(ix)ix.style.display='none';
  if(MQ.obj){try{URL.revokeObjectURL(MQ.obj);}catch(e){}MQ.obj=null;}
  if(typeof renderAll==='function')renderAll();
}
function mqFootImg(){
  $i('mqFoot').innerHTML='<button onclick="mqPrev()"><span translate="no">▶</span> السابقة</button>'+
   '<input id="mqJump" type="text" inputmode="numeric" value="'+MQ.page+'" style="width:64px;text-align:center;border-radius:10px;border:0;padding:8px" onchange="mqShow(parseInt(this.value,10))"> <span>/ 604</span>'+
   '<button onclick="mqNext()">التالية <span translate="no">◀</span></button>'+
   '<button onclick="mqBookmark()">🔖</button><button onclick="mqNight()">🌙</button><button onclick="mqZoom()">🔍</button>';
}
function mqFootTxt(){
  $i('mqFoot').innerHTML='<button onclick="mqSur(MQ.sur-1)"><span translate="no">▶</span> السورة السابقة</button><button onclick="mqFs(-0.15)">أ−</button><button onclick="mqFs(0.15)">أ+</button><button onclick="mqNight()">🌙</button><button onclick="mqSur(MQ.sur+1)">السورة التالية <span translate="no">◀</span></button>';
}
function mqShow(p){
  p=parseInt(p,10);if(!(p>=1))p=1;if(p>604)p=604;
  MQ.mode='img';MQ.page=p;islSet('zn_mq_last',p);islSet('zn_mq_mode','img');
  var S=islData().surahs,si=mqSurahOfPage(p);
  $i('mqTitle').textContent=(S[si-1]?'سورة '+mqSN(si-1):'')+' — الجزء '+mqJuzOfPage(p)+' — صفحة '+p;
  $i('mqModeBtn').textContent='📜 نص';
  $i('mqBody').innerHTML='<div class="mq-scroll"><img id="mqImg" class="mq-img" alt="صفحة '+p+'" style="width:'+(MQ.zoom*100)+'%"></div><div class="mq-stat" id="mqStat"></div>';
  mqFootImg();mqLoadImg(p);
}
function mqNext(){if(MQ.mode==='img'){if(MQ.page<604)mqShow(MQ.page+1);}}
function mqPrev(){if(MQ.mode==='img'){if(MQ.page>1)mqShow(MQ.page-1);}}
async function mqFetchCached(url){
  if(!('caches' in window))return null;
  var c=await caches.open(MQ_CACHE),r=await c.match(url);
  if(!r){var f=await fetch(url,{mode:'cors'});if(!f.ok)throw new Error('http '+f.status);await c.put(url,f.clone());r=f;}
  return r;
}
async function mqLoadImg(p){
  var st=$i('mqStat'),img=$i('mqImg'),url=mqUrl(p),src=url,obj=null;
  if(st){st.style.display='';st.textContent='جارٍ تحميل الصفحة...';}
  try{var r=await mqFetchCached(url);if(r){var b=await r.blob();obj=URL.createObjectURL(b);src=obj;}}catch(e){}
  if(MQ.page!==p||MQ.mode!=='img'||!$i('mqImg')){if(obj)URL.revokeObjectURL(obj);return;}
  if(MQ.obj){try{URL.revokeObjectURL(MQ.obj);}catch(e){}}
  MQ.obj=obj;img=$i('mqImg');st=$i('mqStat');
  img.onload=function(){if(st)st.style.display='none';};
  img.onerror=function(){if(st)st.innerHTML='تعذر تحميل الصفحة.<br>تأكد من الإنترنت ثم <button class="btn sm" onclick="mqShow(MQ.page)">إعادة المحاولة</button>';};
  img.src=src;
  if(p<604&&navigator.onLine!==false)mqFetchCached(mqUrl(p+1)).catch(function(){});
}
function mqZoom(){MQ.zoom=MQ.zoom===1?1.9:1;var i=$i('mqImg');if(i)i.style.width=(MQ.zoom*100)+'%';}
function mqNight(){MQ.night=!MQ.night;islSet('zn_mq_night',MQ.night);$i('mqView').classList.toggle('night',MQ.night);}
function mqFs(d){MQ.fs=Math.max(1,Math.min(2.8,MQ.fs+d));islSet('zn_mq_fs',MQ.fs);var t=$i('mqTxt');if(t)t.style.fontSize=MQ.fs+'rem';}
function mqBookmark(){
  var b=islLS('zn_mq_bm',[]),p=MQ.mode==='img'?MQ.page:(islData().surahs[MQ.sur-1]||[0,0,0,1])[3];
  if(b.some(function(x){return x.p===p;}))return islToast('الصفحة محفوظة بالفعل في العلامات');
  b.push({p:p,t:Date.now()});islSet('zn_mq_bm',b);islToast('🔖 تم حفظ العلامة (صفحة '+p+')');
}
/* ---- نص المصحف ---- */
async function mqLoadQ(){
  if(MQ_Q)return MQ_Q;
  var r=await fetch('data/quran.json');if(!r.ok)throw new Error('quran.json');
  MQ_Q=await r.json();return MQ_Q;
}
async function mqText(s,a){
  s=parseInt(s,10);if(!(s>=1))s=1;if(s>114)s=114;
  MQ.mode='txt';MQ.sur=s;MQ.ay=a||0;islSet('zn_mq_mode','txt');islSet('zn_mq_lt',{s:s,a:a||0});
  var S=islData().surahs[s-1]||['',0,'m',1];
  $i('mqTitle').textContent='سورة '+mqSN(s-1)+' — '+mqAr(S[1])+' آية';$i('mqModeBtn').textContent='📖 صور';
  $i('mqBody').innerHTML='<div class="mq-stat" id="mqStat">جارٍ التحميل...</div>';
  mqFootTxt();
  try{
    var Q=await mqLoadQ();
    if(MQ.mode!=='txt'||MQ.sur!==s)return;
    var vs=Q.v[s-1],h='<div class="mq-text" translate="no" id="mqTxt" style="font-size:'+MQ.fs+'rem"><div class="mq-sur">سورة '+islEsc(mqSN(s-1))+'</div>';
    if(s!==1&&s!==9)h+='<div class="mq-bsm">بِسْمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</div>';
    h+=vs.map(function(t,i){return '<span class="mq-ay" id="ay'+(i+1)+'">'+islEsc(t)+' <span class="mq-an">﴿'+mqArD(i+1)+'﴾</span></span> ';}).join('');
    h+='<div style="text-align:center;font-family:Cairo;font-size:.7rem;color:var(--muted);margin-top:24px">'+islEsc(Q.src||'')+'</div></div>';
    $i('mqBody').innerHTML=h;
    if(a){var e=$i('ay'+a);if(e){e.classList.add('mq-hl');e.scrollIntoView({block:'center'});}}
  }catch(e){$i('mqBody').innerHTML='<div class="mq-stat">تعذر تحميل نص المصحف</div>';}
}
function mqSur(n){if(n>=1&&n<=114)mqText(n,0);}
function mqToggleMode(){
  if(MQ.mode==='img'){mqText(mqSurahOfPage(MQ.page),0);}
  else{var S=islData().surahs[MQ.sur-1];mqShow(S?S[3]:1);}
}
/* ---- الفهرس والبحث ---- */
function mqIndex(){
  var ix=$i('mqIdx');ix.style.display='flex';mqIdxRender();
}
function mqIdxClose(){$i('mqIdx').style.display='none';}
function mqIdxTab(t){MQ.idx=t;mqIdxRender();}
function mqIdxRender(){
  var ix=$i('mqIdx'),D=islData(),t=MQ.idx;
  var tabs=[['surah','السور'],['juz','الأجزاء'],['bm','العلامات'],['find','بحث']].map(function(x){return '<button class="chip'+(t===x[0]?' on':'')+'" onclick="mqIdxTab(\''+x[0]+'\')">'+x[1]+'</button>';}).join('');
  var body='';
  if(t==='surah')body=D.surahs.map(function(s,i){return '<div class="mq-li" onclick="mqGoSurah('+(i+1)+')"><span><b>'+mqAr(i+1)+'. '+islEsc(mqSN(i))+'</b><br><small>'+(s[2]==='m'?'مكية':'مدنية')+' — '+mqAr(s[1])+' آية</small></span><small>صفحة '+mqAr(s[3])+'</small></div>';}).join('');
  else if(t==='juz')body=D.juzPages.map(function(p,i){var js=D.juzStart[i]||[1,1];return '<div class="mq-li" onclick="mqGoJuz('+(i+1)+')"><span><b>الجزء '+mqAr(i+1)+'</b><br><small>'+islEsc(mqSN(js[0]-1))+' — آية '+mqAr(js[1])+'</small></span><small>صفحة '+mqAr(p)+'</small></div>';}).join('');
  else if(t==='bm'){var b=islLS('zn_mq_bm',[]);body=b.length?b.map(function(x,i){var si=mqSurahOfPage(x.p);return '<div class="mq-li"><span onclick="mqGoPage('+x.p+')"><b>صفحة '+mqAr(x.p)+'</b><br><small>'+islEsc(mqSN(si-1))+'</small></span><button class="btn danger sm" onclick="mqDelBm('+i+')">حذف</button></div>';}).join(''):'<div class="empty">لا توجد علامات بعد. اضغط 🔖 أثناء القراءة.</div>';}
  else body='<div class="field"><input id="mqQ" placeholder="🔍 اكتب كلمة أو جزء من آية (بدون تشكيل)" oninput="mqSearch(this.value)"></div><div id="mqRes" class="hint" style="margin-top:10px">اكتب 3 حروف على الأقل.</div>';
  ix.innerHTML='<div class="ih"><button class="btn light sm" onclick="mqIdxClose()">✕ إغلاق</button>'+tabs+'</div><div class="ib">'+body+'</div>';
}
function mqGoSurah(n){mqIdxClose();if(MQ.mode==='txt')mqText(n,0);else mqShow(islData().surahs[n-1][3]);}
function mqGoJuz(j){mqIdxClose();var D=islData();if(MQ.mode==='txt'){var js=D.juzStart[j-1]||[1,1];mqText(js[0],js[1]);}else mqShow(D.juzPages[j-1]);}
function mqGoPage(p){mqIdxClose();mqShow(p);}
function mqDelBm(i){var b=islLS('zn_mq_bm',[]);b.splice(i,1);islSet('zn_mq_bm',b);mqIdxRender();}
// تطبيع للبحث: إزالة التشكيل وكل الألفات (لأن الرسم العثماني يستخدم ألفاً خنجرية) وتوحيد الهمزات والياء والتاء المربوطة
function mqNorm(s){return String(s).replace(/[\u0640\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ا/g,'').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/ؤ/g,'و').replace(/ئ/g,'ي');}
async function mqSearch(q){
  var out=$i('mqRes');if(!out)return;
  q=mqNorm(q.trim());if(q.length<3){out.textContent='اكتب 3 حروف على الأقل.';return;}
  try{
    var Q=await mqLoadQ();
    if(!MQ_N)MQ_N=Q.v.map(function(a){return a.map(mqNorm);});
    var res=[],S=islData().surahs;
    for(var i=0;i<MQ_N.length&&res.length<60;i++)for(var j=0;j<MQ_N[i].length&&res.length<60;j++)if(MQ_N[i][j].indexOf(q)>=0)res.push([i+1,j+1]);
    out.innerHTML=res.length?res.map(function(r){return '<div class="mq-li" onclick="mqGoAyah('+r[0]+','+r[1]+')"><span style="font-family:AmiriQuran,Cairo;line-height:1.9">'+islEsc(Q.v[r[0]-1][r[1]-1].slice(0,120))+'</span><small>'+islEsc(mqSN(r[0]-1))+' '+mqAr(r[1])+'</small></div>';}).join(''):'لا توجد نتائج';
  }catch(e){out.textContent='تعذر البحث';}
}
function mqGoAyah(s,a){mqIdxClose();mqText(s,a);}
/* ---- تحميل الصفحات للقراءة بدون إنترنت ---- */
var MQ_DL={run:false,stop:false};
async function mqCachedCount(){
  try{if(!('caches' in window))return 0;var c=await caches.open(MQ_CACHE),k=await c.keys(),b=mqBase();return k.filter(function(r){return r.url.indexOf(b)===0;}).length;}catch(e){return 0;}
}
async function mqDownload(from,to){
  if(MQ_DL.run)return islToast('التحميل شغّال بالفعل');
  if(!('caches' in window))return islToast('التخزين غير مدعوم هنا',true);
  MQ_DL.run=true;MQ_DL.stop=false;var done=0,total=to-from+1,p=from,fails=0;
  function upd(){var e=$i('mqDlStat');if(e)e.textContent='تم '+done+' من '+total+(fails?' (فشل '+fails+')':'');}
  async function worker(){
    while(p<=to&&!MQ_DL.stop){var cur=p++;try{await mqFetchCached(mqUrl(cur));}catch(e){fails++;}done++;upd();}
  }
  await Promise.all([worker(),worker(),worker()]);
  MQ_DL.run=false;islToast(MQ_DL.stop?'تم إيقاف التحميل':'انتهى التحميل'+(fails?' — فشلت '+fails+' صفحة':''));
  renderIslam();
}
function mqDlStop(){MQ_DL.stop=true;}
async function mqClearCache(){try{await caches.delete(MQ_CACHE);islToast('تم مسح الصفحات المحمّلة');renderIslam();}catch(e){}}
function mqSetBase(v){try{if(v.trim())localStorage.setItem('zn_mq_base',v.trim());else localStorage.removeItem('zn_mq_base');}catch(e){}islToast('تم حفظ رابط الصور');}
function islQuran(){
  var last=islLS('zn_mq_last',1),mode=islLS('zn_mq_mode','img'),lt=islLS('zn_mq_lt',{s:1,a:0}),S=islData().surahs,si=mqSurahOfPage(last);
  var juzBtns=islData().juzPages.map(function(p,i){var to=(islData().juzPages[i+1]||605)-1;return '<button class="chip" onclick="mqDownload('+p+','+to+')">جزء '+mqAr(i+1)+'</button>';}).join('');
  setTimeout(function(){mqCachedCount().then(function(n){var e=$i('mqCached');if(e)e.textContent=n+' من 604 صفحة محمّلة على الجهاز';});},0);
  return '<div class="card" style="text-align:center"><h3>📖 المصحف الشريف</h3>'+
    '<button class="btn big" style="width:100%;margin-bottom:10px" onclick="mqOpen()">▶ متابعة القراءة — '+(mode==='txt'?'سورة '+islEsc(mqSN(lt.s-1)):'صفحة '+last+' ('+islEsc(mqSN(si-1))+')')+'</button>'+
    '<div class="row"><button class="btn light" style="flex:1" onclick="mqOpen(1,\'img\')">📖 مصحف المدينة (صور)</button><button class="btn light" style="flex:1" onclick="mqOpen(1,\'txt\',1,0)">📜 نص المصحف</button></div>'+
    '<div class="row" style="margin-top:8px"><button class="btn light" style="flex:1" onclick="mqOpen(1,\'img\');setTimeout(mqIndex,50)">☰ فهرس السور والأجزاء</button><button class="btn light" style="flex:1" onclick="mqOpen(1,\'img\');setTimeout(function(){mqIdxTab(\'find\');mqIndex();},50)">🔍 بحث في القرآن</button></div></div>'+
    '<div class="card"><h3>⬇ القراءة بدون إنترنت</h3><p class="hint" id="mqCached" style="margin:0 0 8px"></p><p class="hint" id="mqDlStat" style="margin:0 0 8px"></p>'+
    '<div class="chips" style="flex-wrap:wrap">'+juzBtns+'</div>'+
    '<div class="row" style="margin-top:8px"><button class="btn" onclick="if(confirm(\'تحميل المصحف كاملاً (حوالي 120 ميجا). متابعة؟\'))mqDownload(1,604)">تحميل المصحف كاملاً</button><button class="btn light" onclick="mqDlStop()">إيقاف</button><button class="btn danger" onclick="mqClearCache()">مسح المحمّل</button></div>'+
    '<p class="hint" style="margin-top:10px">صور مصحف المدينة (برواية حفص) تُحمَّل من الإنترنت عند القراءة وتُحفظ على جهازك. نص المصحف مدمج بالبرنامج ويعمل بدون إنترنت.</p>'+
    '<details><summary style="cursor:pointer;font-weight:700">إعدادات متقدمة</summary><div class="field" style="margin-top:8px"><label>رابط مجلد الصور (اتركه فارغاً للافتراضي)</label><input dir="ltr" value="'+islEsc(mqBase()===MQ_BASE_DEF?'':mqBase())+'" onchange="mqSetBase(this.value)" placeholder="'+MQ_BASE_DEF+'"></div><p class="hint">الصور بأسماء 001.png إلى 604.png.</p></details></div>';
}

/* ================= الإذاعة ================= */
var RD={audio:null,state:'stop',cands:[],i:0,sleepAt:0,vol:+islLS('zn_rd_vol',0.8)};
var RD_DEF=['https://stream.radiojar.com/8s5u5tpdtwzuv'];
function rdUrls(){var c='';try{c=localStorage.getItem('zn_rd_url')||'';}catch(e){}return (c?[c]:[]).concat(RD_DEF);}
function rdStatus(t,state){RD.state=state||RD.state;var e=$i('rdStat');if(e)e.textContent=t;var b=$i('rdBtn');if(b)b.textContent=RD.state==='play'?'⏸ إيقاف':RD.state==='load'?'⏳ جارٍ الاتصال...':'▶ تشغيل';}
async function rdApiUrl(){
  try{var r=await fetch('https://www.mp3quran.net/api/v3/radios?language=ar',{cache:'no-store'}),j=await r.json(),list=j.radios||j;
    var x=(list||[]).find(function(o){return o&&/القاهرة/.test(o.name||'');});return x&&x.url;}catch(e){return null;}
}
function rdStop(){
  if(RD.audio){try{RD.audio.pause();RD.audio.removeAttribute('src');RD.audio.load();}catch(e){}}
  RD.state='stop';RD.sleepAt=0;rdStatus('متوقفة','stop');
}
async function rdToggle(){
  if(RD.state==='play'||RD.state==='load')return rdStop();
  RD.cands=rdUrls();RD.i=0;rdStatus('جارٍ الاتصال بالإذاعة...','load');
  var tried=false;
  while(true){
    if(RD.i>=RD.cands.length){
      if(!tried){tried=true;var u=await rdApiUrl();if(u&&RD.cands.indexOf(u)<0){RD.cands.push(u);continue;}}
      rdStatus('تعذر تشغيل الإذاعة. تأكد من الإنترنت أو ضع رابطاً آخر من الإعدادات.','stop');return;
    }
    var url=RD.cands[RD.i++];
    if(await rdTry(url))return;
    if(RD.state==='stop')return;
  }
}
function rdTry(url){
  return new Promise(function(resolve){
    try{
      if(!RD.audio){RD.audio=new Audio();RD.audio.preload='none';}
      var a=RD.audio,fin=false,tok=(RD.tok=(RD.tok||0)+1);
      a.volume=RD.vol;a.src=url;
      function done(ok){if(fin||tok!==RD.tok)return;fin=true;a.onerror=null;a.onplaying=null;clearTimeout(tm);resolve(ok);}
      var tm=setTimeout(function(){done(false);},15000);
      a.onplaying=function(){if(tok!==RD.tok)return;rdStatus('🔴 مباشر — إذاعة القرآن الكريم من القاهرة','play');done(true);if('mediaSession' in navigator){try{navigator.mediaSession.metadata=new MediaMetadata({title:'إذاعة القرآن الكريم',artist:'القاهرة'});}catch(e){}}};
      a.onerror=function(){if(tok!==RD.tok)return;done(false);};
      var p=a.play();if(p&&p.catch)p.catch(function(){done(false);});
    }catch(e){resolve(false);}
  });
}
function rdVol(v){RD.vol=Math.max(0,Math.min(1,v/100));islSet('zn_rd_vol',RD.vol);if(RD.audio)RD.audio.volume=RD.vol;}
function rdSleep(min){RD.sleepAt=min?Date.now()+min*60000:0;islToast(min?'سيتم إيقاف الإذاعة بعد '+min+' دقيقة':'تم إلغاء المؤقت');renderIslam();}
function rdTick(){
  if(RD.sleepAt){
    var left=RD.sleepAt-Date.now();
    if(left<=0){rdStop();islToast('تم إيقاف الإذاعة (انتهى المؤقت)');}
    else{var e=$i('rdSleepLbl');if(e)e.textContent='يتوقف بعد '+prCount(left);}
  }
}
function rdSetUrl(v){try{if(v.trim())localStorage.setItem('zn_rd_url',v.trim());else localStorage.removeItem('zn_rd_url');}catch(e){}islToast('تم حفظ الرابط');}
function islRadio(){
  return '<div class="card" style="text-align:center"><div style="font-size:3rem">📻</div><h3>إذاعة القرآن الكريم من القاهرة</h3>'+
   '<p class="hint" id="rdStat" style="margin:4px 0 12px">'+(RD.state==='play'?'🔴 مباشر':'متوقفة')+'</p>'+
   '<button class="btn big" id="rdBtn" style="width:100%" onclick="rdToggle()">'+(RD.state==='play'?'⏸ إيقاف':'▶ تشغيل')+'</button>'+
   '<div class="field" style="margin-top:14px"><label>مستوى الصوت</label><input type="range" min="0" max="100" value="'+Math.round(RD.vol*100)+'" oninput="rdVol(this.value)"></div>'+
   '<div class="chips" style="margin-top:10px;justify-content:center"><button class="chip" onclick="rdSleep(15)">⏱ 15 د</button><button class="chip" onclick="rdSleep(30)">30 د</button><button class="chip" onclick="rdSleep(60)">60 د</button><button class="chip" onclick="rdSleep(0)">إلغاء</button></div>'+
   '<p class="hint" id="rdSleepLbl" style="margin:0"></p></div>'+
   '<div class="card"><details><summary style="cursor:pointer;font-weight:700">إعدادات الإذاعة</summary><div class="field" style="margin-top:8px"><label>رابط بث مخصص (اختياري)</label><input dir="ltr" value="'+islEsc((function(){try{return localStorage.getItem('zn_rd_url')||'';}catch(e){return '';}})())+'" onchange="rdSetUrl(this.value)" placeholder="https://..."></div><p class="hint">لو الرابط الافتراضي اتغيّر، البرنامج بيدوّر تلقائياً على رابط إذاعة القاهرة من mp3quran.net. البث بيستهلك إنترنت، وقد يتوقف عند قفل الشاشة على بعض الأجهزة.</p></details></div>';
}

/* ================= السبحة ================= */
var TSB_Z=['سُبْحَانَ اللَّهِ','الْحَمْدُ لِلَّهِ','اللَّهُ أَكْبَرُ','لَا إِلَهَ إِلَّا اللَّهُ','أَسْتَغْفِرُ اللَّهَ','اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ','لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ'];
function tsbState(){var s=islLS('zn_tsb',null),d=adkDay();if(!s||s.d!==d)s={d:d,n:0,total:0,target:33,z:0};if(s.z==null)s.z=0;return s;}
function tsbTap(){var s=tsbState();s.n++;s.total++;islSet('zn_tsb',s);islVib(s.target&&s.n%s.target===0?[60,40,60]:12);var b=$i('tsbN'),t=$i('tsbT');if(b)b.textContent=s.n;if(t)t.textContent=s.total;}
function tsbReset(){var s=tsbState();s.n=0;islSet('zn_tsb',s);renderIslam();}
function tsbTarget(v){var s=tsbState();s.target=parseInt(v,10)||0;islSet('zn_tsb',s);renderIslam();}
function tsbZ(i){var s=tsbState();s.z=+i;s.n=0;islSet('zn_tsb',s);renderIslam();}
function islTasbeeh(){
  var s=tsbState();
  return '<div class="card" style="text-align:center"><h3>📿 السبحة</h3>'+
   '<div class="field"><select translate="no" onchange="tsbZ(this.value)">'+TSB_Z.map(function(z,i){return '<option value="'+i+'"'+(s.z===i?' selected':'')+'>'+z+'</option>';}).join('')+'</select></div>'+
   '<div class="zk-t" style="margin-top:8px" translate="no">'+TSB_Z[s.z]+'</div>'+
   '<button class="tsb" id="tsbN" onclick="tsbTap()">'+s.n+'</button>'+
   '<p class="hint">إجمالي اليوم: <b id="tsbT">'+s.total+'</b></p>'+
   '<div class="row" style="justify-content:center"><div class="field" style="max-width:150px"><label>الهدف (0 = بدون)</label><select onchange="tsbTarget(this.value)">'+[0,33,100,500,1000].map(function(n){return '<option value="'+n+'"'+(s.target===n?' selected':'')+'>'+n+'</option>';}).join('')+'</select></div><button class="btn light" onclick="tsbReset()">↺ تصفير العدّاد</button></div></div>';
}

/* ================= تبويب الإسلاميات ================= */
function islSeg(s){ISLS=s;islSet('zn_isl_tab',s);renderIslam();}
function renderIslam(){
  var tab=$i('tab-islam');if(!tab||!tab.classList.contains('active'))return;
  var segs=[['pray','🕌 المواقيت'],['quran','📖 المصحف'],['adhkar','🤲 الأذكار'],['radio','📻 الإذاعة'],['tasbeeh','📿 السبحة']];
  $i('islSeg').innerHTML=segs.map(function(x){return '<button class="chip'+(ISLS===x[0]?' on':'')+'" onclick="islSeg(\''+x[0]+'\')">'+x[1]+'</button>';}).join('');
  var f={pray:islPray,quran:islQuran,adhkar:islAdhkar,radio:islRadio,tasbeeh:islTasbeeh}[ISLS]||islPray;
  $i('islBody').innerHTML=f();
  islTick();
}
function islGo(s){ISLS=s;islSet('zn_isl_tab',s);if(typeof showTab==='function')showTab('islam');}
