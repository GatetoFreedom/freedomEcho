/* ========= Reveal（滚动显现） ========= */
const reveal = () => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('in'));
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal,.card,.post').forEach(n => io.observe(n));
};
document.addEventListener('DOMContentLoaded', reveal);

/* ========= 阅读进度条（公告页） ========= */
const bar = document.querySelector('.readbar span');
if (bar) {
  const onScroll = () => {
    const h = document.documentElement;
    const p = (h.scrollTop) / (h.scrollHeight - h.clientHeight);
    bar.style.width = Math.max(0, Math.min(1, p)) * 100 + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ========= 灵动岛：速度/加速度驱动的自动展开/收起 + 按钮临时展开 ========= */
const island = document.querySelector('.island');
const toggleBtn = document.querySelector('.island-toggle');

const IslandCtrl = (() => {
  // 阈值（px/ms、px/ms^2），按触控板/手机均衡调校
  const TH = {
    vExpand: -0.55,     // 向上快滑（负速度）→ 展开
    aExpand: -0.0045,
    vCollapse: 0.55,    // 向下快滑（正速度）→ 收起
    aCollapse: 0.0045,
    hysteresis: 240,    // 状态切换“消抖”毫秒
    manualGrace: 160    // 按钮临时展开后，短暂保护不立刻被微小下滑打断
  };

  let isExpanded = true;            // 初始展开
  let lastSwitch = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let vPrev = 0;                    // 上一瞬时速度（px/ms）
  let vEMA = 0;                     // 速度指数平滑
  let aEMA = 0;                     // 加速度指数平滑
  let manualUntil = 0;              // 按钮触发后的保护时间戳

  // 设置状态（只在需要时切换）
  function setExpanded(next, reason = 'auto') {
    if (!island) return;
    if (next === isExpanded) return;

    const now = performance.now();
    if (now - lastSwitch < TH.hysteresis && reason === 'auto') return; // 消抖：自动切换不连跳

    isExpanded = next;
    island.classList.toggle('expanded', isExpanded);
    island.classList.toggle('compact', !isExpanded);

    // 按钮朝向提示（下拉=展开，收起=上拉）
    toggleBtn?.classList.toggle('hint-up', !isExpanded);
    toggleBtn?.classList.toggle('hint-down', isExpanded);

    lastSwitch = now;
  }

  function handleScroll() {
    if (!island) return;
    const t = performance.now();
    const y = window.scrollY;
    const dt = Math.max(8, t - lastT);              // 避免除以 0，最小 8ms
    const dy = y - lastY;

    const vInst = dy / dt;                          // 瞬时速度（px/ms）
    const aInst = (vInst - vPrev) / dt;             // 瞬时加速度

    // 指数平滑（速度更稳，加速度更敏）
    vEMA = 0.25 * vInst + 0.75 * vEMA;
    aEMA = 0.5  * aInst + 0.5  * aEMA;

    // 判定逻辑：上划足够快/加速度足够强 → 展开；下滑足够快/强 → 收起
    const now = performance.now();
    const manualGuard = now < manualUntil;

    // 贴近顶部也默认展开，更自然
    const nearTop = y <= 24;

    if (!manualGuard) {
      if (vEMA <= TH.vExpand || (vEMA < -0.25 && aEMA <= TH.aExpand) || nearTop) {
        setExpanded(true, 'auto');
      } else if (vEMA >= TH.vCollapse || (vEMA > 0.25 && aEMA >= TH.aCollapse)) {
        setExpanded(false, 'auto');
      }
    }

    lastY = y; lastT = t; vPrev = vInst;
  }

  function manualExpandOnce() {
    // 立即展开，但不是“锁死”；若下滑达到阈值，仍会自动收起
    setExpanded(true, 'manual');
    manualUntil = performance.now() + TH.manualGrace;

    // 按钮微动效：轻微缩放 + 回弹
    toggleBtn?.animate(
      [{ transform: 'scale(0.94)' }, { transform: 'scale(1)' }],
      { duration: 160, easing: 'ease-out' }
    );
  }

  // 绑定事件
  document.addEventListener('scroll', handleScroll, { passive: true });
  toggleBtn?.addEventListener('click', (e) => { e.preventDefault(); manualExpandOnce(); });

  // 初始状态：进入页面时，如果不在顶部也先展开一次，避免“收起”突兀
  setExpanded(true, 'init');
  return { setExpanded };
})();

/* ========= 选取与当前环境匹配的壁纸（四张） ========= */
function pickBgImage(){
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  if (portrait) return dark ? '/assets/img/ios26-dark.png' : '/assets/img/ios26-light.png';
  return dark ? '/assets/img/ipados26-dark.png' : '/assets/img/ipados26-light.png';
}

/* ========= 页面切换：从点击点 clip-path 水滴扩散 ========= */
function setupPageTransitions() {
  const origin = window.location.origin;
  const links = Array.from(document.querySelectorAll('a[href]:not([target="_blank"])')).filter(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) return false;
    const url = new URL(href, window.location.href);
    // 排除“加入我们”确认按钮
    if (a.classList.contains('join-confirm')) return false;
    return url.origin === origin;
  });

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      const target = e.currentTarget;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = target.getAttribute('href'); if (!href) return;

      // 公告分页：翻页动画
      if (target.closest('.pager')) {
        e.preventDefault();
        const grid = document.querySelector('.ann-grid');
        if (grid) grid.classList.add('flip-out');
        setTimeout(() => { window.location.assign(new URL(href, window.location.href).toString()); }, 480);
        return;
      }

      e.preventDefault();
      const rect = target.getBoundingClientRect();
      animateAndGo(new URL(href, window.location.href).toString(), rect);
    });
  });
}

function animateAndGo(url, rect) {
  const xferRoot = document.getElementById('xfer-root');
  const ov = document.createElement('div'); ov.className = 'page-xfer';
  const imgLayer = document.createElement('div'); imgLayer.className = 'page-xfer-img';
  imgLayer.style.backgroundImage = `url("${pickBgImage()}")`;
  ov.appendChild(imgLayer);

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2 + window.scrollY;
  ov.style.setProperty('--ox', `${cx}px`);
  ov.style.setProperty('--oy', `${cy}px`);

  // 覆盖全屏的最小半径
  const w = window.innerWidth, h = window.innerHeight;
  const dx = Math.max(cx, w - cx);
  const dy = Math.max(cy, h - cy);
  const R = Math.hypot(dx, dy) + 48;
  ov.style.setProperty('--R', `${R}px`);

  // 旧页淡出
  document.querySelector('main')?.classList.add('fade-out');

  // 传递归一化坐标，给新页入场节奏
  sessionStorage.setItem('xfer', JSON.stringify({ ox: cx / w, oy: cy / h }));

  xferRoot.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  setTimeout(() => { window.location.assign(url); }, 780);
}
document.addEventListener('DOMContentLoaded', setupPageTransitions);

/* ========= 新页进场：瀑布级联 ========= */
function stagedEnter(){
  const raw = sessionStorage.getItem('xfer');
  if (!raw) return; // 直接打开/刷新不做转场

  try{
    const {ox, oy} = JSON.parse(raw);
    document.body.style.setProperty('--ox', `${ox * window.innerWidth}px`);
    document.body.style.setProperty('--oy', `${oy * window.innerHeight}px`);
  }catch(_){}

  document.body.classList.add('pre-enter');

  // 卡片级联延时（每 60ms 递增）
  document.querySelectorAll('.grid .card').forEach((el, i) => el.style.setProperty('--d', (i*60)+'ms'));
  // 文章正文轻度级联
  document.querySelectorAll('.post .post-body > *').forEach((el, i) => el.style.setProperty('--i', i+1));

  requestAnimationFrame(() => {
    document.body.classList.add('enter');
    document.body.classList.remove('pre-enter');   // 保证正文可见
    sessionStorage.removeItem('xfer');
  });
}
document.addEventListener('DOMContentLoaded', stagedEnter);
window.addEventListener('pageshow', () => { document.body.classList.remove('pre-enter'); });

/* ========= 卡片 Tilt ========= */
function setupTilt() {
  const cards = document.querySelectorAll('.card.tilt, .ann-grid .card');
  cards.forEach(card => {
    let raf = null;
    function reset(){ card.style.transform=''; }
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*7).toFixed(2)}deg) translateY(-1px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.transition = 'transform .28s cubic-bezier(.18,.9,.22,1.08)';
      reset(); setTimeout(()=>{ card.style.transition=''; }, 280);
    });
  });
}
document.addEventListener('DOMContentLoaded', setupTilt);

/* ========= 按钮微反馈 ========= */
document.addEventListener('click', e => {
  const t = e.target.closest('.btn, .nav-link');
  if (!t) return;
  t.animate([{ transform:'scale(0.98)' }, { transform:'scale(1)' }], { duration: 140, easing:'ease-out' });
}, { passive: true });

/* ========= 背景轻微视差 ========= */
const sheen = document.querySelector('.bg-sheen');
if (sheen){
  document.addEventListener('scroll', () => {
    const y = window.scrollY || 0;
    sheen.style.transform = `translateY(${y * -0.03}px)`;
  }, { passive: true });
}

/* ========= “加入我们”二次确认（保留） ========= */
function createModal(html){
  const root = document.getElementById('modal-root');
  const wrap = document.createElement('div');
  wrap.innerHTML = html.trim();
  const frag = wrap.firstElementChild;
  root.appendChild(frag);
  requestAnimationFrame(() => {
    frag.querySelector('.modal')?.classList.add('in');
    frag.querySelector('.modal-backdrop')?.classList.add('in');
  });
  return frag;
}
function closeModal(node){
  node.querySelector('.modal')?.classList.remove('in');
  node.querySelector('.modal-backdrop')?.classList.remove('in');
  setTimeout(()=> node.remove(), 220);
}
function openJoinConfirm(url){
  const tpl = `
  <div class="modal-shell" style="pointer-events:auto">
    <div class="modal-backdrop"></div>
    <div class="modal glass" role="dialog" aria-modal="true" aria-label="外部跳转确认">
      <h3>即将离开本站</h3>
      <p>你将打开 Telegram 链接：<br><code>${url}</code></p>
      <div class="modal-actions">
        <button class="btn" data-role="cancel">取消</button>
        <button class="btn primary" data-role="go">继续前往</button>
      </div>
    </div>
  </div>`;
  const node = createModal(tpl);
  node.querySelector('[data-role="cancel"]')?.addEventListener('click', () => closeModal(node));
  node.querySelector('.modal-backdrop')?.addEventListener('click', () => closeModal(node));
  node.querySelector('[data-role="go"]')?.addEventListener('click', () => {
    closeModal(node);
    window.open(url, '_blank', 'noopener');
  });
}
function setupJoinConfirm(){
  document.querySelectorAll('a.join-confirm').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopImmediatePropagation();
      const url = a.dataset.href || a.href;
      openJoinConfirm(url);
    });
  });
}
document.addEventListener('DOMContentLoaded', setupJoinConfirm);
