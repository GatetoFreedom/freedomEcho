// ========== Reveal 入场 ==========
const reveal = () => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('in'));
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal,.card,.post').forEach(n => io.observe(n));
};
document.addEventListener('DOMContentLoaded', reveal);

// ========== 阅读进度条（仅公告页） ==========
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

// ========== 灵动岛式导航：下滑收缩，上滑/点击展开 ==========
const island = document.querySelector('.island');
const toggle = document.querySelector('.island-toggle');
let lockedExpand = false;

function updateIslandByScroll() {
  if (!island) return;
  const y = window.scrollY || 0;
  if (lockedExpand) return; // 展开状态下不随滚动收缩
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

// 点击品牌在收缩态时展开
document.querySelector('.brand')?.addEventListener('click', (e) => {
  if (island?.classList.contains('compact')) {
    e.preventDefault();
    island.classList.add('expanded'); lockedExpand = true;
  }
});

// ========== 页面切换动画：从点击按钮“飞出”覆盖全屏 ==========
function setupPageTransitions() {
  const origin = window.location.origin;
  const links = Array.from(document.querySelectorAll('a[href]:not([target="_blank"])'))
    .filter(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) return false;
      const url = new URL(href, window.location.href);
      return url.origin === origin;
    });

  links.forEach(a => {
    a.addEventListener('click', (e) => {
      // 组合键或新窗口放过
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const href = a.getAttribute('href');
      if (!href) return;
      e.preventDefault();
      const rect = a.getBoundingClientRect();
      animateAndGo(new URL(href, window.location.href).toString(), rect);
    });
  });
}

function animateAndGo(url, rect) {
  const xferRoot = document.getElementById('xfer-root');
  const ov = document.createElement('div');
  ov.className = 'page-xfer';
  // 将动画原点设置为点击元素的中心
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2 + window.scrollY;
  ov.style.setProperty('--ox', `${cx}px`);
  ov.style.setProperty('--oy', `${cy}px`);

  xferRoot.appendChild(ov);
  // 渐隐旧内容
  document.querySelector('main')?.classList.add('fade-out');

  requestAnimationFrame(() => ov.classList.add('in'));
  // 动画时长与 CSS 保持一致（520ms）
  setTimeout(() => { window.location.assign(url); }, 520);
}
document.addEventListener('DOMContentLoaded', setupPageTransitions);

// ========== 按钮点击的微缩放反馈 ==========
document.addEventListener('click', e => {
  const t = e.target.closest('.btn, .nav-link');
  if (!t) return;
  t.animate([{ transform:'scale(0.98)' }, { transform:'scale(1)' }], { duration: 140, easing:'ease-out' });
}, { passive: true });
