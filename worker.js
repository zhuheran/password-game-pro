// 密码审批科 — The Password Bureau
// 部署：npx wrangler deploy
// 一个 Cloudflare Worker，返回完整 HTML（内联 CSS/JS，零构建）
//
// 已知解（开发期自检，不暴露给玩家）：
//   简单：aA!VJanuaryMars97531            （12 条全过）
//   困难：aA!V9753179997531799            （20 条全过）
//   地狱：无解（规则自相矛盾，讽刺现实）

const HTML = String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>The Password Bureau</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{
  --paper:#ebe2cc; --paper-light:#f4ecd8; --paper-deep:#e3d8bb;
  --ink:#1c1a14; --ink-soft:#5c5340;
  --line:#b8a984; --line-soft:#d4c8a8;
  --red:#a82820; --green:#345e3a; --orange:#b8651c;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--paper)}
body{
  font-family:'Noto Serif SC','Songti SC',serif;
  color:var(--ink);min-height:100vh;
  padding:38px 18px 100px;
  background-image:
    repeating-linear-gradient(0deg,transparent 0,transparent 33px,rgba(28,26,20,.04) 33px,rgba(28,26,20,.04) 34px),
    radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,250,230,.55),transparent);
  background-attachment:local,scroll;
}
.wrap{max-width:760px;margin:0 auto}
header{text-align:center;margin-bottom:26px;position:relative;padding:0 90px}
header::before,header::after{content:'';position:absolute;top:24px;width:80px;height:1px;background:var(--line)}
header::before{left:0}header::after{right:0}
h1{font-size:30px;font-weight:900;letter-spacing:.3em;margin-bottom:6px}
.sub{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-soft);letter-spacing:.2em}
.modes{display:flex;margin-bottom:22px;border:1px solid var(--line)}
.modes button{
  flex:1;padding:11px 8px;background:var(--paper-light);
  border:none;border-right:1px solid var(--line);
  font-family:'Noto Serif SC',serif;font-size:14px;color:var(--ink);
  cursor:pointer;transition:background .2s;letter-spacing:.08em;
}
.modes button:last-child{border-right:none}
.modes button:hover{background:#fff8e8}
.modes button.active{background:var(--ink);color:var(--paper-light);font-weight:700}
.modes button.hell.active{background:var(--red)}
.input-zone{background:var(--paper-light);border:1px solid var(--line);padding:18px 20px;margin-bottom:22px;position:relative}
.input-zone label{display:block;font-size:13px;color:var(--ink-soft);margin-bottom:10px;letter-spacing:.05em}
#pwd{
  width:100%;padding:13px 14px;font-family:'JetBrains Mono',monospace;
  font-size:16px;letter-spacing:.05em;border:1px solid var(--line);
  background:#fffdf6;color:var(--ink);outline:none;
}
#pwd:focus{border-color:var(--ink);box-shadow:0 0 0 2px rgba(28,26,20,.08)}
.meta{display:flex;gap:24px;margin-top:12px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--ink-soft);flex-wrap:wrap}
.meta b{color:var(--ink);font-weight:700}
.meta .reset{margin-left:auto;color:var(--red);cursor:pointer;background:none;border:none;font-family:inherit;font-size:11px;letter-spacing:.1em}
.meta .reset:hover{text-decoration:underline}
.status{font-family:'Noto Serif SC',serif;font-size:12px;color:var(--ink-soft);margin-top:10px;min-height:18px;letter-spacing:.05em}
.status.warn{color:var(--red)}
.rules{display:flex;flex-direction:column;gap:8px}
.rule{
  border:1px solid var(--line-soft);background:rgba(255,253,243,.7);
  padding:12px 16px;display:grid;grid-template-columns:34px 1fr auto auto;
  gap:12px;align-items:center;font-family:'JetBrains Mono',monospace;
  font-size:13px;line-height:1.5;position:relative;
  animation:stampIn .42s cubic-bezier(.2,.9,.3,1.2);
}
.rule .num{font-weight:700;color:var(--ink-soft);font-size:12px;text-align:right}
.rule .text{color:var(--ink)}
.rule .badge{font-size:11px;font-weight:700;padding:3px 9px;border:1.5px solid;letter-spacing:.12em;transform:rotate(-3deg);white-space:nowrap;font-family:'Noto Serif SC',serif}
.rule.passed{border-color:var(--green)}
.rule.passed .badge{color:var(--green);border-color:var(--green)}
.rule.active{border-color:var(--orange);border-style:dashed;background:rgba(255,250,235,.8)}
.rule.active .badge{color:var(--orange);border-color:var(--orange)}
.rule.broken{border-color:var(--red);background:rgba(168,40,32,.05)}
.rule.broken .badge{color:var(--red);border-color:var(--red)}
.rule.failed{border-color:var(--red);background:rgba(168,40,32,.12)}
.rule.failed .badge{color:var(--red);border-color:var(--red)}
.rule .countdown{font-size:12px;font-weight:700;font-family:'JetBrains Mono',monospace;min-width:30px;text-align:right}
.rule.active .countdown{color:var(--orange)}
.rule.broken .countdown{color:var(--red)}
@keyframes stampIn{0%{opacity:0;transform:translateY(-8px) scale(.96)}60%{transform:translateY(0) scale(1.02)}100%{opacity:1;transform:translateY(0) scale(1)}}
.modal-bg{position:fixed;inset:0;background:rgba(28,26,20,.72);display:none;align-items:center;justify-content:center;z-index:100;padding:20px}
.modal-bg.show{display:flex}
.modal{background:var(--paper-light);border:2px solid var(--ink);padding:40px 38px;max-width:460px;text-align:center;position:relative;animation:stampIn .5s cubic-bezier(.2,.9,.3,1.2)}
.modal .big-stamp{font-size:30px;font-weight:900;letter-spacing:.3em;color:var(--green);border:3px solid var(--green);padding:12px 22px;display:inline-block;transform:rotate(-6deg);margin-bottom:20px}
.modal.hell .big-stamp{color:var(--red);border-color:var(--red)}
.modal p{font-size:14px;color:var(--ink-soft);line-height:1.8;margin-bottom:22px}
.modal button{background:var(--ink);color:var(--paper-light);border:none;padding:11px 26px;font-family:'Noto Serif SC',serif;font-size:13px;cursor:pointer;letter-spacing:.15em}
.modal button:hover{background:#000}
footer{text-align:center;margin-top:44px;font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink-soft);letter-spacing:.12em;line-height:1.8}
footer a{color:var(--ink-soft);text-decoration:none;border-bottom:1px dotted}
</style>
</head>
<body>
<div class="wrap">
  <nav class="modes">
    <button data-mode="easy">简单模式</button>
    <button data-mode="hard">困难模式</button>
    <button data-mode="hell" class="hell">地狱模式</button>
  </nav>

  <div class="input-zone">
    <label>请输入您的密码（请如实填写，不符者不予通过）</label>
    <input id="pwd" type="text" autocomplete="off" spellcheck="false" placeholder="在此处键入密码…">
    <div class="meta">
      <span>长度 <b id="len">0</b></span>
      <span>数字和 <b id="dsum">0</b></span>
      <span>进度 <b id="prog">1/0</b></span>
      <button class="reset" id="resetBtn">重置</button>
    </div>
    <div class="status" id="status"></div>
  </div>

  <section class="rules" id="rules"></section>

  <footer>
    部署于 Cloudflare Workers · 无后端 · 无 cookie · 无出路
  </footer>
</div>

<div class="modal-bg" id="winModal">
  <div class="modal" id="modalBox">
    <div class="big-stamp" id="bigStamp">审 批 通 过</div>
    <button id="modalBtn">知悉</button>
  </div>
</div>

<script>
// ---- 词库 ----
var MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
var PLANETS=['Mercury','Venus','Earth','Mars','Jupiter','Saturn','Uranus','Neptune'];
var ZODIAC=['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
var DYNASTY=['夏','商','周','秦','汉','晋','隋','唐','宋','元','明','清'];
var ELEMENTS=['H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar','K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr','Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe','Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu','Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn','Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr','Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'];
var COUNTRIES=['中国','美国','日本','法国','英国','德国','俄国','韩国','印度','巴西','意大利','加拿大','澳大利亚','埃及','希腊','西班牙','墨西哥'];
var CHESS=['车','马','炮','帅','将','仕','相','象','兵','卒'];
var COLORS=['红','橙','黄','绿','青','蓝','紫','黑','白','灰','粉'];
var SOLAR_TERMS=['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒'];

var SPECIAL=/[-!@#$%^&*()_=+\[\]{};:'",.<>/?\\|~]/;
var ROMAN=/[IVXLCDM]/;

// ---- 工具 ----
function digitSum(p){return (p.match(/[0-9]/g)||[]).reduce(function(a,b){return a+(+b)},0);}
function extractNumbers(p){return (p.match(/[0-9]+/g)||[]).map(Number);}
function isLeap(n){return n>=1&&n<=9999&&((n%4===0&&n%100!==0)||n%400===0);}
function isPrime(n){if(n<2)return false;for(var i=2;i*i<=n;i++)if(n%i===0)return false;return true;}
function hasPalin3(p){for(var i=0;i<=p.length-3;i++)if(p[i]===p[i+2])return true;return false;}
function any(arr,p){return arr.some(function(m){return p.indexOf(m)>=0;});}
function getDigits(p){return (p.match(/[0-9]/g)||[]).map(Number);}
function allOddDigits(p){var d=getDigits(p);return d.length>0&&d.every(function(x){return x%2===1;});}
function allEvenDigits(p){var d=getDigits(p);return d.length>0&&d.every(function(x){return x%2===0;});}
function distinctDigitCount(p){return new Set(getDigits(p)).size;}
function maxMinDigitDiff(p){var d=getDigits(p);if(d.length===0)return -1;return Math.max.apply(null,d)-Math.min.apply(null,d);}
function countDigit(p,n){return getDigits(p).filter(function(x){return x===n;}).length;}
function adjacentDiffOk(p,maxDiff){var d=getDigits(p);if(d.length<2)return true;for(var i=0;i<d.length-1;i++)if(Math.abs(d[i]-d[i+1])>maxDiff)return false;return true;}
function digitProductDivisible(p,n){var d=getDigits(p);if(d.length===0)return false;var prod=d.reduce(function(a,b){return a*b;},1);return prod%n===0;}
function halfDigitSumEqual(p){var d=getDigits(p);if(d.length===0||d.length%2!==0)return false;var h=d.length/2;var s1=d.slice(0,h).reduce(function(a,b){return a+b;},0);var s2=d.slice(h).reduce(function(a,b){return a+b;},0);return s1===s2;}
function evenDigitCount(p){return getDigits(p).length%2===0&&getDigits(p).length>0;}
function allDigitsSame(p){var d=getDigits(p);return d.length>0&&d.every(function(x){return x===d[0];});}

// ---- 简单模式 12 条（必有解）----
var easyRules=[
  {text:'密码至少 8 位',check:function(p){return p.length>=8;}},
  {text:'必须包含大写字母',check:function(p){return /[A-Z]/.test(p);}},
  {text:'必须包含小写字母',check:function(p){return /[a-z]/.test(p);}},
  {text:'必须包含数字',check:function(p){return /[0-9]/.test(p);}},
  {text:'必须包含特殊字符',check:function(p){return SPECIAL.test(p);}},
  {text:'所有数字之和必须等于 25',check:function(p){return digitSum(p)===25;}},
  {text:'必须包含一个月份名',check:function(p){return any(MONTHS,p);}},
  {text:'必须包含一颗行星名',check:function(p){return any(PLANETS,p);}},
  {text:'密码长度必须为偶数',check:function(p){return p.length%2===0;}},
  {text:'必须包含一个罗马数字字母',check:function(p){return ROMAN.test(p);}},
  {text:'密码中所有数字必须都是奇数',check:function(p){return allOddDigits(p);}},
  {text:'密码中至少包含 3 个不同的数字',check:function(p){return distinctDigitCount(p)>=3;}}
];

// ---- 困难模式 20 条（全数学逻辑，必有解）----
var hardRules=[
  {text:'密码至少 8 位',check:function(p){return p.length>=8;}},
  {text:'必须包含大写字母',check:function(p){return /[A-Z]/.test(p);}},
  {text:'必须包含小写字母',check:function(p){return /[a-z]/.test(p);}},
  {text:'必须包含数字',check:function(p){return /[0-9]/.test(p);}},
  {text:'必须包含特殊字符',check:function(p){return SPECIAL.test(p);}},
  {text:'所有数字之和必须等于 100',check:function(p){return digitSum(p)===100;}},
  {text:'密码长度必须为偶数',check:function(p){return p.length%2===0;}},
  {text:'必须包含一个罗马数字字母',check:function(p){return ROMAN.test(p);}},
  {text:'密码中所有数字必须都是奇数',check:function(p){return allOddDigits(p);}},
  {text:'密码中至少包含 5 个不同的数字',check:function(p){return distinctDigitCount(p)>=5;}},
  {text:'密码中最大数字减去最小数字等于 8',check:function(p){return maxMinDigitDiff(p)===8;}},
  {text:'数字 9 至少出现 3 次',check:function(p){return countDigit(p,9)>=3;}},
  {text:'数字 1 至少出现 2 次',check:function(p){return countDigit(p,1)>=2;}},
  {text:'密码中所有数字的乘积能被 15 整除',check:function(p){return digitProductDivisible(p,15);}},
  {text:'密码中相邻数字之差不超过 6',check:function(p){return adjacentDiffOk(p,6);}},
  {text:'密码中数字 7 至少出现 1 次',check:function(p){return countDigit(p,7)>=1;}},
  {text:'密码中数字 5 至少出现 1 次',check:function(p){return countDigit(p,5)>=1;}},
  {text:'密码中数字 3 至少出现 1 次',check:function(p){return countDigit(p,3)>=1;}},
  {text:'密码的前半部分与后半部分数字之和相等',check:function(p){return halfDigitSumEqual(p);}},
  {text:'密码中数字的总个数为偶数',check:function(p){return evenDigitCount(p);}}
];

// ---- 地狱模式 24 条（全数学逻辑，自相矛盾，无解）----
var hellRules=[
  {text:'密码至少 8 位',check:function(p){return p.length>=8;}},
  {text:'必须包含大写字母',check:function(p){return /[A-Z]/.test(p);}},
  {text:'必须包含小写字母',check:function(p){return /[a-z]/.test(p);}},
  {text:'必须包含数字',check:function(p){return /[0-9]/.test(p);}},
  {text:'必须包含特殊字符',check:function(p){return SPECIAL.test(p);}},
  {text:'所有数字之和必须等于 50',check:function(p){return digitSum(p)===50;}},
  {text:'所有数字之和必须等于 60  〔与前条冲突〕',check:function(p){return digitSum(p)===60;}},
  {text:'密码长度必须为偶数',check:function(p){return p.length%2===0;}},
  {text:'密码长度必须为奇数  〔与前条冲突〕',check:function(p){return p.length%2===1;}},
  {text:'密码中所有数字必须都是偶数',check:function(p){return allEvenDigits(p);}},
  {text:'密码中所有数字必须都是奇数  〔与前条冲突〕',check:function(p){return allOddDigits(p);}},
  {text:'密码中恰好包含 4 个数字',check:function(p){return getDigits(p).length===4;}},
  {text:'密码中恰好包含 6 个数字  〔与前条冲突〕',check:function(p){return getDigits(p).length===6;}},
  {text:'密码中最大数字必须等于 3',check:function(p){var d=getDigits(p);return d.length>0&&Math.max.apply(null,d)===3;}},
  {text:'密码中最小数字必须等于 7  〔与前条冲突〕',check:function(p){var d=getDigits(p);return d.length>0&&Math.min.apply(null,d)===7;}},
  {text:'密码中所有数字的乘积必须为质数',check:function(p){var d=getDigits(p);if(d.length===0)return false;return isPrime(d.reduce(function(a,b){return a*b;},1));}},
  {text:'密码中所有数字的乘积必须为偶数  〔与前条冲突〕',check:function(p){return digitProductDivisible(p,2);}},
  {text:'密码中数字 5 至少出现 1 次',check:function(p){return countDigit(p,5)>=1;}},
  {text:'密码中不得包含数字 5  〔与前条冲突〕',check:function(p){return countDigit(p,5)===0;}},
  {text:'密码中相邻数字之差不超过 2',check:function(p){return adjacentDiffOk(p,2);}},
  {text:'密码中必须同时包含数字 1 和数字 9  〔与前条冲突〕',check:function(p){return countDigit(p,1)>=1&&countDigit(p,9)>=1;}},
  {text:'密码中所有数字必须相同',check:function(p){return allDigitsSame(p);}},
  {text:'密码中必须包含至少 3 个不同的数字  〔与前条冲突〕',check:function(p){return distinctDigitCount(p)>=3;}},
  {text:'当前规则已无法全部满足。请反思您对「安全」的执念。',check:function(p){return false;}}
];

var RULES={easy:easyRules,hard:hardRules,hell:hellRules};

// ---- 状态 ----
var mode='easy';
var visibleCount=1;
var ruleTimers={};
var failedRule=-1;
var won=false;
var TIMEOUT=30000;

var input=document.getElementById('pwd');
var rulesEl=document.getElementById('rules');
var lenEl=document.getElementById('len');
var dsumEl=document.getElementById('dsum');
var progEl=document.getElementById('prog');
var statusEl=document.getElementById('status');
var modal=document.getElementById('winModal');
var modalBox=document.getElementById('modalBox');
var bigStamp=document.getElementById('bigStamp');

function reset(){
  visibleCount=1;ruleTimers={};failedRule=-1;won=false;
  input.value='';rulesEl.innerHTML='';
  modal.classList.remove('show');
  statusEl.textContent='';statusEl.classList.remove('warn');
  update();
}

function setMode(m){
  mode=m;
  var btns=document.querySelectorAll('.modes button');
  for(var i=0;i<btns.length;i++)btns[i].classList.toggle('active',btns[i].dataset.mode===m);
  reset();
}

function update(){
  var p=input.value;
  var rules=RULES[mode];
  lenEl.textContent=p.length;
  dsumEl.textContent=digitSum(p);
  var now=Date.now();

  if(won){renderRules();return;}

  // 揭示下一条规则：顶部规则满足后揭示下一条
  while(visibleCount<rules.length&&rules[visibleCount-1].check(p)){
    delete ruleTimers[visibleCount-1];
    visibleCount++;
  }

  // 检查所有可见规则的倒计时
  for(var i=0;i<visibleCount;i++){
    var ok=rules[i].check(p);
    if(ok){
      delete ruleTimers[i];
    }else{
      if(ruleTimers[i]===undefined)ruleTimers[i]=now;
      if(now-ruleTimers[i]>=TIMEOUT){
        failedRule=i;won=true;showFail();
        renderRules();return;
      }
    }
  }

  progEl.textContent=visibleCount+'/'+rules.length;

  // 胜利判定：所有规则可见且全部满足
  if(visibleCount===rules.length){
    var allPass=true;
    for(var j=0;j<rules.length;j++){
      if(!rules[j].check(p)){allPass=false;break;}
    }
    if(allPass&&!won){
      won=true;showWin();
      renderRules();return;
    }
  }

  // 状态文字
  if(!won){
    var firstBroken=-1,firstActive=-1;
    for(var k=0;k<visibleCount;k++){
      if(!rules[k].check(p)){
        if(k<visibleCount-1&&firstBroken<0)firstBroken=k;
        else if(k===visibleCount-1)firstActive=k;
      }
    }
    if(firstBroken>=0){statusEl.textContent='第 '+(firstBroken+1)+' 条已驳回，请修正。';statusEl.classList.add('warn');}
    else if(firstActive>=0){statusEl.textContent='请补充第 '+(firstActive+1)+' 项要求。';statusEl.classList.remove('warn');}
    else {statusEl.textContent='';statusEl.classList.remove('warn');}
  }

  renderRules();
}

function renderRules(){
  var p=input.value;
  var rules=RULES[mode];
  var now=Date.now();
  var stateText={passed:'已通过',active:'待审',broken:'驳回',failed:'失败'};
  for(var i=0;i<visibleCount;i++){
    var rule=rules[i];
    var ok=rule.check(p);
    var state;
    var cdText='';

    if(won&&i===failedRule){
      state='failed';
    }else if(ok){
      state='passed';
    }else{
      if(i===visibleCount-1)state='active';
      else state='broken';
      if(!won){
        var elapsed=ruleTimers[i]!==undefined?now-ruleTimers[i]:0;
        var remain=Math.max(0,Math.ceil((TIMEOUT-elapsed)/1000));
        cdText=remain+'s';
      }
    }

    var el=rulesEl.children[i];
    if(!el){
      el=document.createElement('div');
      var num=document.createElement('div');num.className='num';
      var text=document.createElement('div');text.className='text';
      var cd=document.createElement('div');cd.className='countdown';
      var badge=document.createElement('div');badge.className='badge';
      el.appendChild(num);el.appendChild(text);el.appendChild(cd);el.appendChild(badge);
      rulesEl.appendChild(el);
    }
    el.className='rule '+state;
    el.children[0].textContent=(i+1<10?'0':'')+(i+1);
    el.children[1].textContent=rule.text;
    el.children[2].textContent=cdText;
    el.children[3].textContent=stateText[state];
  }
  while(rulesEl.children.length>visibleCount)rulesEl.removeChild(rulesEl.lastChild);
}

function showWin(){
  bigStamp.textContent='审 批 通 过';
  modalBox.classList.remove('hell');
  modal.classList.add('show');
}

function showFail(){
  bigStamp.textContent='失 败';
  modalBox.classList.add('hell');
  modal.classList.add('show');
}

// ---- 事件 ----
input.addEventListener('input',update);
var btns=document.querySelectorAll('.modes button');
for(var i=0;i<btns.length;i++)btns[i].addEventListener('click',function(){setMode(this.dataset.mode);});
document.getElementById('resetBtn').addEventListener('click',reset);
document.getElementById('modalBtn').addEventListener('click',function(){modal.classList.remove('show');});

// 定时驱动倒计时
setInterval(update,200);

setMode('easy');
</script>
</body>
</html>`;

export default {
  async fetch() {
    return new Response(HTML, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-cache'
      }
    });
  }
};
