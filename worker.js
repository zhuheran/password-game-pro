// 密码审批科 — The Password Bureau
// 部署：npx wrangler deploy
// 一个 Cloudflare Worker，返回完整 HTML（内联 CSS/JS，零构建）
//
// 已知解（开发期自检，不暴露给玩家）：
//   简单：aA!V一月火星鼠唐7990         （12 条全过）
//   困难：中国红车aA!V一月火星鼠唐2024立春7s9999999994 （20 条全过）
//   地狱：无解（规则自相矛盾，讽刺现实）

const HTML = String.raw`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>密码审批科 · The Password Bureau</title>
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
.input-zone::before{content:'机密';position:absolute;top:-10px;left:14px;background:var(--paper);padding:0 8px;font-size:11px;color:var(--red);letter-spacing:.3em;font-family:'JetBrains Mono',monospace}
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
  padding:12px 16px;display:grid;grid-template-columns:34px 1fr auto;
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
.rule.force{border-color:var(--orange);background:rgba(184,101,28,.06)}
.rule.force .badge{color:var(--orange);border-color:var(--orange)}
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
  <header>
    <h1>密码审批科</h1>
    <div class="sub">WINDOW NO.72 · 第七十二号审批窗口</div>
  </header>

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
    密码审批科 · 仅以讽刺为业 · 本窗口服务永远不结束<br>
    部署于 Cloudflare Workers · 无后端 · 无 cookie · 无出路
  </footer>
</div>

<div class="modal-bg" id="winModal">
  <div class="modal" id="modalBox">
    <div class="big-stamp" id="bigStamp">审 批 通 过</div>
    <p id="modalMsg"></p>
    <button id="modalBtn">知悉</button>
  </div>
</div>

<script>
// ---- 词库 ----
var MONTHS=['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
var PLANETS=['水星','金星','地球','火星','木星','土星','天王星','海王星'];
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

// ---- 简单模式 12 条（必有解）----
var easyRules=[
  {text:'密码至少 8 位',check:function(p){return p.length>=8;}},
  {text:'必须包含大写字母',check:function(p){return /[A-Z]/.test(p);}},
  {text:'必须包含小写字母',check:function(p){return /[a-z]/.test(p);}},
  {text:'必须包含数字',check:function(p){return /[0-9]/.test(p);}},
  {text:'必须包含特殊字符',check:function(p){return SPECIAL.test(p);}},
  {text:'所有数字之和必须等于 25',check:function(p){return digitSum(p)===25;}},
  {text:'必须包含一个月份名（如「三月」）',check:function(p){return any(MONTHS,p);}},
  {text:'必须包含一颗行星名（如「火星」）',check:function(p){return any(PLANETS,p);}},
  {text:'密码长度必须为偶数',check:function(p){return p.length%2===0;}},
  {text:'必须包含一个罗马数字字母（I V X L C D M）',check:function(p){return ROMAN.test(p);}},
  {text:'必须包含一个生肖（鼠牛虎兔…）',check:function(p){return any(ZODIAC,p);}},
  {text:'必须包含一个中国朝代名（唐宋元明清…）',check:function(p){return any(DYNASTY,p);}}
];

// ---- 困难模式 20 条（必有解）----
var hardRules=[
  {text:'密码至少 8 位',check:function(p){return p.length>=8;}},
  {text:'必须包含大写字母',check:function(p){return /[A-Z]/.test(p);}},
  {text:'必须包含小写字母',check:function(p){return /[a-z]/.test(p);}},
  {text:'必须包含数字',check:function(p){return /[0-9]/.test(p);}},
  {text:'必须包含特殊字符',check:function(p){return SPECIAL.test(p);}},
  {text:'所有数字之和必须等于 100',check:function(p){return digitSum(p)===100;}},
  {text:'必须包含一个月份名',check:function(p){return any(MONTHS,p);}},
  {text:'必须包含一颗行星名',check:function(p){return any(PLANETS,p);}},
  {text:'密码长度必须为偶数',check:function(p){return p.length%2===0;}},
  {text:'必须包含一个罗马数字字母',check:function(p){return ROMAN.test(p);}},
  {text:'必须包含一个生肖',check:function(p){return any(ZODIAC,p);}},
  {text:'必须包含一个中国朝代名',check:function(p){return any(DYNASTY,p);}},
  {text:'必须包含一个化学元素符号（如 H、O、Fe、V）',check:function(p){return any(ELEMENTS,p);}},
  {text:'必须包含一个国家名（如「中国」）',check:function(p){return any(COUNTRIES,p);}},
  {text:'必须包含一个中国象棋棋子（车马炮帅将士相象兵卒）',check:function(p){return any(CHESS,p);}},
  {text:'必须包含一个三字符回文（如「aba」「999」）',check:function(p){return hasPalin3(p);}},
  {text:'必须包含一个颜色名（红黄蓝绿…）',check:function(p){return any(COLORS,p);}},
  {text:'必须包含一个闰年（如 2024、2000）',check:function(p){return extractNumbers(p).some(isLeap);}},
  {text:'必须包含一个质数（如 2、3、5、7）',check:function(p){return extractNumbers(p).some(isPrime);}},
  {text:'必须包含一个二十四节气名（如「立春」）',check:function(p){return any(SOLAR_TERMS,p);}}
];

// ---- 地狱模式 24 条（自相矛盾，无解）----
var hellRules=[
  {text:'密码至少 8 位',check:function(p){return p.length>=8;}},
  {text:'必须包含大写字母',check:function(p){return /[A-Z]/.test(p);}},
  {text:'必须包含小写字母',check:function(p){return /[a-z]/.test(p);}},
  {text:'必须包含数字',check:function(p){return /[0-9]/.test(p);}},
  {text:'必须包含特殊字符',check:function(p){return SPECIAL.test(p);}},
  {text:'所有数字之和必须等于 25',check:function(p){return digitSum(p)===25;}},
  {text:'所有数字之和必须等于 30  〔与前条冲突〕',check:function(p){return digitSum(p)===30;}},
  {text:'密码长度必须为偶数',check:function(p){return p.length%2===0;}},
  {text:'密码长度必须为奇数  〔与前条冲突〕',check:function(p){return p.length%2===1;}},
  {text:'不得包含字母 e（大小写皆禁）',check:function(p){return !/e/i.test(p);}},
  {text:'必须包含单词「Welcome」  〔含 e，与前条冲突〕',check:function(p){return p.indexOf('Welcome')>=0;}},
  {text:'恰好包含 5 个数字',check:function(p){return (p.match(/[0-9]/g)||[]).length===5;}},
  {text:'恰好包含 3 个数字  〔与前条冲突〕',check:function(p){return (p.match(/[0-9]/g)||[]).length===3;}},
  {text:'密码必须只含中文字符',check:function(p){return /^[\u4e00-\u9fa5]+$/.test(p);}},
  {text:'必须包含至少一个字母  〔与前条冲突〕',check:function(p){return /[a-zA-Z]/.test(p);}},
  {text:'必须包含一个闰年（如 2024）',check:function(p){return extractNumbers(p).some(isLeap);}},
  {text:'不得包含任何数字  〔与多前条冲突〕',check:function(p){return !/[0-9]/.test(p);}},
  {text:'密码必须以数字开头',check:function(p){return /^[0-9]/.test(p);}},
  {text:'密码必须以字母结尾',check:function(p){return /[a-zA-Z]$/.test(p);}},
  {text:'密码必须以数字结尾  〔与前条冲突〕',check:function(p){return /[0-9]$/.test(p);}},
  {text:'不得包含任何大写字母  〔与第 2 条冲突〕',check:function(p){return !/[A-Z]/.test(p);}},
  {text:'必须包含罗马数字 V',check:function(p){return /V/.test(p);}},
  {text:'不得包含字母 V（大小写皆禁）  〔与前条冲突〕',check:function(p){return !/v/i.test(p);}},
  {text:'当前规则已无法全部满足。请反思您对「安全」的执念。',check:function(p){return false;}}
];

var RULES={easy:easyRules,hard:hardRules,hell:hellRules};

// ---- 状态 ----
var mode='easy';
var visibleCount=1;
var forcePassed={};
var ruleVisibleSince={};
var won=false;

var input=document.getElementById('pwd');
var rulesEl=document.getElementById('rules');
var lenEl=document.getElementById('len');
var dsumEl=document.getElementById('dsum');
var progEl=document.getElementById('prog');
var statusEl=document.getElementById('status');
var modal=document.getElementById('winModal');
var modalBox=document.getElementById('modalBox');
var bigStamp=document.getElementById('bigStamp');
var modalMsg=document.getElementById('modalMsg');

function reset(){
  visibleCount=1;forcePassed={};ruleVisibleSince={};won=false;
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

  if(mode==='hell'){
    var topIdx=visibleCount-1;
    if(topIdx<rules.length-1){
      if(ruleVisibleSince[topIdx]===undefined)ruleVisibleSince[topIdx]=Date.now();
      var top=rules[topIdx];
      if(top.check(p)){
        visibleCount++;delete ruleVisibleSince[topIdx];
      }else if(Date.now()-ruleVisibleSince[topIdx]>6000){
        forcePassed[topIdx]=true;visibleCount++;delete ruleVisibleSince[topIdx];
      }
    }
  }else{
    while(visibleCount<rules.length&&rules[visibleCount-1].check(p))visibleCount++;
  }

  progEl.textContent=visibleCount+'/'+rules.length;

  // 状态提示
  var allPass=rules.slice(0,visibleCount).every(function(r){return r.check(input.value);});
  if(mode==='hell'&&visibleCount===rules.length&&!won){
    won=true;showHellFail();
  }else if(mode!=='hell'&&visibleCount===rules.length&&allPass&&!won){
    won=true;showWin();
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
  var stateText={passed:'已通过',active:'待审',broken:'驳回',force:'强通'};
  for(var i=0;i<visibleCount;i++){
    var rule=rules[i];
    var ok=rule.check(p);
    var state;
    if(forcePassed[i])state='force';
    else if(i<visibleCount-1)state=ok?'passed':'broken';
    else state=ok?'passed':'active';

    var el=rulesEl.children[i];
    if(!el){
      el=document.createElement('div');
      var num=document.createElement('div');num.className='num';
      var text=document.createElement('div');text.className='text';
      var badge=document.createElement('div');badge.className='badge';
      el.appendChild(num);el.appendChild(text);el.appendChild(badge);
      rulesEl.appendChild(el);
    }
    el.className='rule '+state;
    el.children[0].textContent=(i+1<10?'0':'')+(i+1);
    el.children[1].textContent=rule.text;
    el.children[2].textContent=stateText[state];
  }
  while(rulesEl.children.length>visibleCount)rulesEl.removeChild(rulesEl.lastChild);
}

function showWin(){
  bigStamp.textContent='审 批 通 过';
  modalBox.classList.remove('hell');
  modalMsg.textContent=mode==='easy'
    ?'审批通过。您的密码已录入第七十二号档案。讽刺的是，它并不比「123456」更安全。'
    :'审批通过。您已通过全部 20 项审查。系统建议您将密码刻在石碑上以防遗忘，并通知您的继承人。';
  modal.classList.add('show');
}

function showHellFail(){
  bigStamp.textContent='审 批 终 止';
  modalBox.classList.add('hell');
  modalMsg.textContent='您已查阅全部 24 条规则。经系统判定，您的密码永无通过之可能——因为规则本身自相矛盾。这正是您每日面对的互联网现实。';
  modal.classList.add('show');
}

// ---- 事件 ----
input.addEventListener('input',update);
var btns=document.querySelectorAll('.modes button');
for(var i=0;i<btns.length;i++)btns[i].addEventListener('click',function(){setMode(this.dataset.mode);});
document.getElementById('resetBtn').addEventListener('click',reset);
document.getElementById('modalBtn').addEventListener('click',function(){modal.classList.remove('show');});

// 定时驱动地狱模式的「强通」计时
setInterval(update,400);

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
