// WL Digital: small, dependency-free interactions. Everything is optional: without this file the page still shows everything.
(function () {
  var doc = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var y = document.getElementById('y'); if (y) y.textContent = new Date().getFullYear();

  // Scroll reveal
  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0 });
    items.forEach(function (el) { io.observe(el); });
    // Safety net: anything still hidden after load and a few seconds (e.g. odd browsers) just shows.
    setTimeout(function () { document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }); }, 2500);
  }

  // Header state and scroll progress, at most once per frame
  var hd = document.querySelector('.site-header'), bar = document.querySelector('.progress'), ticking = false;
  function onScroll() {
    ticking = false;
    var max = doc.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    if (hd) hd.classList.toggle('scrolled', scrollY > 8);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Watch face tabs
  var tabs = document.querySelector('.tabs');
  if (tabs) {
    var btns = tabs.querySelectorAll('[role="tab"]');
    function select(i, focus) {
      tabs.dataset.tab = i;
      btns.forEach(function (b, k) {
        var on = k === i, panel = document.getElementById(b.getAttribute('aria-controls'));
        b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1;
        panel.hidden = !on;
        if (on && !reduce) panel.querySelectorAll('.face').forEach(function (f) {
          f.classList.remove('in'); void f.offsetWidth; f.classList.add('in'); });
      });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select((i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length, true); }
      });
    });
    select(0);
  }

  if (!fine || reduce) return;

  // Spotlight that follows the pointer on cards
  document.querySelectorAll('.spot').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Gentle tilt of the hero phones toward the pointer
  var stack = document.querySelector('.stack'), hero = document.querySelector('.hero');
  if (stack && hero) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5;
      stack.style.transform = 'perspective(1200px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-yy * 8) + 'deg)';
    });
    hero.addEventListener('pointerleave', function () { stack.style.transform = ''; });
  }
})();
