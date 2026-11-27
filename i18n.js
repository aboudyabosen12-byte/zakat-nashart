/* =====================================================
   i18n.js — نظام اللغات (Arabic / English / وأي لغة تُضاف بملف في lang/)
   يترجم الواجهة وقت التشغيل: نصوص الصفحة، placeholder، الرسائل (toast/confirm)، وعناوين التقارير.
   لإضافة لغة: انسخ lang/en.js إلى lang/xx.js ثم ترجم القيم، وأضف اللغة في LANGS أدناه.
   ===================================================== */
(function(){
'use strict';
var LANGS={
  ar:{code:'ar',name:'العربية',short:'ع',dir:'rtl',loc:'ar-EG-u-nu-latn',hloc:'ar-SA-u-ca-islamic-umalqura-nu-latn'},
  en:{code:'en',name:'English',short:'EN',dir:'ltr',loc:'en-GB',hloc:'en-u-ca-islamic-umalqura'}
};
var AR_LET='\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF';
var AR_RE=new RegExp('['+AR_LET+']');
var lang='ar',FR=null,EX={},RX=[],D={};
var ORIG=new WeakMap(),AORIG=new WeakMap(),obs=null,busy=false,booted=false;
var ATTRS=['placeholder','title','aria-label','alt'];

function ls(){try{return localStorage.getItem('zn_lang');}catch(e){return null;}}
function esc(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
function pack(l){return (window.I18N_DICT||{})[l]||null;}
function available(l){return l==='ar'||(!!LANGS[l]&&!!pack(l));}
function build(){
  D={};EX={};RX=[];FR=null;
  var p=lang==='ar'?null:pack(lang);if(!p)return;
  D=p.D||{};EX=p.EXACT||{};
  RX=(p.RX||[]).map(function(x){return [new RegExp(x[0],'g'),x[1]];});
  var keys=Object.keys(D).sort(function(a,b){return b.length-a.length;});
  if(keys.length)FR=new RegExp('(?<!['+AR_LET+'])(?:'+keys.map(esc).join('|')+')(?!['+AR_LET+'])','g');
}
// ترجمة نص (جملة أو جزء جملة). الأجزاء الديناميكية (أرقام/أسماء) تبقى كما هي
function tr(s){
  if(s==null||lang==='ar')return s;
  s=String(s);
  if(!AR_RE.test(s))return s;
  if(EX[s]!=null)return EX[s];
  var o=s,i;
  for(i=0;i<RX.length;i++)o=o.replace(RX[i][0],RX[i][1]);
  if(FR)o=o.replace(FR,function(m){var v=D[m];return v==null?m:v;});
  return o.replace(/،/g,',').replace(/؟/g,'?');
}
function skip(el){return !el||!!(el.closest&&el.closest('script,style,textarea,[translate="no"]'));}
function setText(n){
  if(skip(n.parentNode))return;
  var rec=ORIG.get(n),cur=n.nodeValue,orig=(rec&&cur===rec.t)?rec.o:cur;
  if(!orig||!AR_RE.test(orig)){if(rec)ORIG.delete(n);return;}
  var tt=lang==='ar'?orig:tr(orig);
  if(tt!==cur)n.nodeValue=tt;
  if(tt!==orig)ORIG.set(n,{o:orig,t:tt});else ORIG.delete(n);
}
function setAttr(el,a){
  var v=el.getAttribute(a);if(v==null)return;
  var rec=AORIG.get(el)||{},r=rec[a],orig=(r&&v===r.t)?r.o:v;
  if(!AR_RE.test(orig)){if(r){delete rec[a];}return;}
  var tt=lang==='ar'?orig:tr(orig);
  if(tt!==v)el.setAttribute(a,tt);
  if(tt!==orig){rec[a]={o:orig,t:tt};AORIG.set(el,rec);}else if(r){delete rec[a];}
}
function walk(node){
  var t=node.nodeType;
  if(t===3){setText(node);return;}
  if(t!==1&&t!==9&&t!==11)return;
  if(t===1){
    var tag=node.tagName;if(tag==='SCRIPT'||tag==='STYLE')return;
    if(node.closest&&node.closest('[translate="no"]'))return;
    for(var i=0;i<ATTRS.length;i++)if(node.hasAttribute(ATTRS[i]))setAttr(node,ATTRS[i]);
  }
  var c=node.firstChild;while(c){var nx=c.nextSibling;walk(c);c=nx;}
}
function startObserver(){
  if(obs||typeof MutationObserver==='undefined')return;
  obs=new MutationObserver(function(muts){
    if(busy||lang==='ar')return;
    busy=true;
    try{
      muts.forEach(function(m){
        if(m.type==='childList'){for(var i=0;i<m.addedNodes.length;i++)walk(m.addedNodes[i]);}
        else if(m.type==='characterData')setText(m.target);
        else if(m.type==='attributes'&&m.target.nodeType===1)setAttr(m.target,m.attributeName);
      });
    }finally{busy=false;obs.takeRecords();}
  });
  obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
}
function other(){var l=Object.keys(LANGS).filter(available);return LANGS[l[(l.indexOf(lang)+1)%l.length]];}
function updateToggles(){
  var o=other();
  var els=document.querySelectorAll('.langtoggle');
  for(var i=0;i<els.length;i++){
    var e=els[i];e.setAttribute('translate','no');
    var txt=e.id==='langBtn'?'🌐 '+o.short:'🌐 '+o.name;
    if(e.textContent!==txt)e.textContent=txt;
  }
}
function wrapMessages(){
  ['alert','confirm','prompt'].forEach(function(f){
    var o=window[f];
    if(typeof o==='function'&&!o.__i){var w=function(){var a=Array.prototype.slice.call(arguments);a[0]=tr(a[0]);return o.apply(window,a);};w.__i=1;window[f]=w;}
  });
  if(typeof window.toast==='function'&&!window.toast.__i){
    var ot=window.toast,wt=function(m,e){return ot.call(window,tr(m),e);};wt.__i=1;window.toast=wt;
  }
}
function applyAttrs(){
  var c=LANGS[lang];
  document.documentElement.setAttribute('lang',c.code);
  document.documentElement.setAttribute('dir',c.dir);
}
function apply(render){
  build();applyAttrs();
  busy=true;try{walk(document.documentElement);}finally{busy=false;if(obs)obs.takeRecords();}
  updateToggles();
  if(typeof window.buildLocale==='function')window.buildLocale();
  if(render&&booted){try{if(typeof window.tickClock==='function')window.tickClock();if(typeof window.renderAll==='function')window.renderAll();}catch(e){}}
}
function set(l){
  if(!available(l))return;
  lang=l;try{localStorage.setItem('zn_lang',l);}catch(e){}
  apply(true);
}
function toggle(){set(other().code);}
function init(){
  var l=ls();lang=(l&&available(l))?l:'ar';
  wrapMessages();
  apply(false);startObserver();booted=true;
}
window.tr=tr;
window.I18N={
  get lang(){return lang;},
  cfg:function(){return LANGS[lang];},
  list:function(){return Object.keys(LANGS).filter(available).map(function(k){return LANGS[k];});},
  set:set,toggle:toggle,init:init,tr:tr,isRTL:function(){return LANGS[lang].dir==='rtl';}
};
})();
