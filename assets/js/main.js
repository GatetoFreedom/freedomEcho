// 滚动显现
const reveal = () => {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting && e.target.classList.add('in'));
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal,.card,.post').forEach(n => io.observe(n));
};
document.addEventListener('DOMContentLoaded', reveal);

// 阅读进度条（公告单页）
const bar = document.querySelector('.readbar span');
if (bar) {
  const onScroll = () => {
    const h = document.documentElement;
    const scroll = h.scrollTop;
    const height = h.scrollHeight - h.clientHeight;
    const p = Math.max(0, Math.min(1, scroll / height));
    bar.style.width = (p * 100).toFixed(2) + '%';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// 按钮波纹（点击反馈）
document.addEventListener('click', e => {
  const t = e.target.closest('.btn');
  if (!t) return;
  t.animate([{ transform:'scale(0.98)' }, { transform:'scale(1)' }], { duration: 140, easing:'ease-out' });
}, { passive: true });
