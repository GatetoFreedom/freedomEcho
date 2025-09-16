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

/* ========= 灵动岛：下滑收缩，上滑/点击展开 ========= */
const island = document.querySelector('.island');
const toggle = document.querySelector('.island-toggle');
let lockedExpand = false;

function updateIslandByScroll() {
  if (!island) return;
  const y = window.scrollY || 0;
  if (lockedExpand) return;
  if (y > 100) island.classList.add('compact');
  else island.classList.remove('compact');
}
document.addEventListener('scroll', updateIslandByScroll, { passive: true });
document.addEventListener('DOMContentLoaded', updateIslandByScroll);

toggle?.addEventListener('click', (e) => {
  e.stopPropagation();
  const expanded = island.classList.toggle('expanded');
  lockedExpand = expanded;
  if (expanded) island.classList.remove('compact');
});
document.addEventListener('click', (e) => {
  if (!island) return;
  if (island.classList.contains('expanded') && !island.contains(e.target)) {
    island.classList.remove('expanded'); lockedExpand = false; updateIslandByScroll();
  }
});
document.querySelector('.brand')?.addEventListener('click', (e) => {
  if (island?.classList.contains('compact')) {
    e.preventDefault();
    island.classList.add('expanded'); lockedExpand = true;
  }
});

/* ========= 选取与当前环境匹配的壁纸 ========= */
function pickBgImage(){
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const portrait = window.matchMedia('(orientation: portrait)').matches;
  if (portrait) return dark ? '/assets/img/ios26-dark.jpg' : '/assets/img/ios26-light.jpg';
  return dark ? '/assets/img/ipados26-dark.jpg' : '/assets/img/ipados26-light.jpg';
}

/* ========= 页面切换：从点击按钮位置飞出覆盖层 ========= */
function setupPageTransitions() {
  const origin = window.location.origin;
  const links = Array.from(document.querySelectorAll('a[href]:not([target="_blank"])')).filter(a => {
    const href = a.getAttribute('href') || '';
    if (href.startsWith('#')) return false;
    const url = new URL(href, window.location.href);
    return url.origin === origin;
  });

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute('href'); if (!href) return;

      // 公告分页：翻页动画
      if (a.closest('.pager')) {
        e.preventDefault();
        const grid = document.querySelector('.ann-grid');
        if (grid) grid.classList.add('flip-out');
        setTimeout(() => { window.location.assign(new URL(href, window.location.href).toString()); }, 460);
        return;
      }

      e.preventDefault();
      const rect = a.getBoundingClientRect();
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

  // 旧页淡出
  document.querySelector('main')?.classList.add('fade-out');

  // 保存归一化坐标给新页入场（用于必要时的中心参考）
  sessionStorage.setItem('xfer', JSON.stringify({ ox: cx / window.innerWidth, oy: cy / window.innerHeight }));

  xferRoot.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  setTimeout(() => { window.location.assign(url); }, 620); // 与 CSS --t-slow 对齐
}
document.addEventListener('DOMContentLoaded', setupPageTransitions);

/* ========= 新页进场：分组分层（Zoom/Rise/卡片级联） ========= */
function stagedEnter(){
  const raw = sessionStorage.getItem('xfer');
  if (!raw) return;
  try{
    const {ox, oy} = JSON.parse(raw);
    document.body.style.setProperty('--ox', `${ox * window.innerWidth}px`);
    document.body.style.setProperty('--oy', `${oy * window.innerHeight}px`);
  }catch(_){}

  // 初始隐藏 → 触发入场动画
  document.body.classList.add('pre-enter');
  // 卡片级联延时
  document.querySelectorAll('.grid .card').forEach((el, i) => el.style.setProperty('--d', (i*60)+'ms'));
  // 文章内容轻度级联
  document.querySelectorAll('.post .post-body > *').forEach((el, i) => el.style.setProperty('--i', i+1));

  requestAnimationFrame(() => {
    document.body.classList.add('enter');
    sessionStorage.removeItem('xfer');
  });
}
document.addEventListener('DOMContentLoaded', stagedEnter);

/* ========= 卡片 Tilt（视差倾斜） ========= */
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
      card.style.transition = 'transform .28s var(--ease-bouncy)';
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
