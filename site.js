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
    // Once an element has faded in, drop the reveal styles so its own hover transitions stay quick.
    document.addEventListener('transitionend', function (e) {
      var el = e.target;
      if (e.propertyName === 'opacity' && el.classList && el.classList.contains('reveal') && el.classList.contains('in')) el.classList.remove('reveal', 'in');
    });
    // Safety net: anything still hidden after load and a few seconds (e.g. odd browsers) just shows.
    setTimeout(function () { document.querySelectorAll('.reveal:not(.in)').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add('in'); }); }, 2500);
  }

  // Header state and scroll progress, at most once per frame
  var hd = document.querySelector('.site-header'), bar = document.querySelector('.progress'), ticking = false, scrolled = null;
  function onScroll() {
    ticking = false;
    var max = doc.scrollHeight - innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
    var s = scrollY > 8; if (hd && s !== scrolled) { scrolled = s; hd.classList.toggle('scrolled', s); }
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // Watch face tabs
  var tabs = document.querySelector('.tabs');
  if (tabs) {
    var btns = tabs.querySelectorAll('[role="tab"]'), cur = 0, timer = 0;
    var panels = [].map.call(btns, function (b) { return document.getElementById(b.getAttribute('aria-controls')); });
    function show(p, dir) {
      panels.forEach(function (q) { if (q !== p) { q.hidden = true; q.classList.remove('out', 'enter'); } });
      p.querySelectorAll('.face').forEach(function (f) { f.classList.remove('reveal', 'in'); });
      p.style.setProperty('--dir', dir); p.hidden = false;
      p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter');
    }
    function select(i, focus, first) {
      tabs.dataset.tab = i;
      btns.forEach(function (b, k) { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; });
      if (focus) btns[i].focus();
      if (first) { panels.forEach(function (p, k) { p.hidden = k !== i; }); cur = i; return; }
      if (i === cur) return;
      var dir = i > cur ? 1 : -1, old = panels[cur], next = panels[i];
      cur = i; clearTimeout(timer);
      if (reduce) { panels.forEach(function (p) { p.hidden = p !== next; }); next.querySelectorAll('.face').forEach(function (f) { f.classList.remove('reveal', 'in'); }); return; }
      if (!old.hidden) { old.style.setProperty('--dir', dir); old.classList.remove('enter'); old.classList.add('out'); }
      timer = setTimeout(function () { show(next, dir); }, 220);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); select((i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length, true); }
      });
    });
    select(0, false, true);
  }

  // Watch face details: the card grows out of the tapped face
  var sheet = document.getElementById('face-sheet');
  if (sheet && sheet.showModal) {
    var card = sheet.querySelector('.sheet-card'), body = sheet.querySelector('.sheet-body'), simg = sheet.querySelector('.sheet-dial img'),
        buy = sheet.querySelector('.sheet-buy .store'), price = sheet.querySelector('.sheet-price b'), from = null, busy = false;
    function rectAnim(el, a, b, back) {
      var sx = a.width / b.width, sy = a.height / b.height, dx = a.left + a.width / 2 - (b.left + b.width / 2), dy = a.top + a.height / 2 - (b.top + b.height / 2);
      var start = { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sx + ',' + sy + ')', opacity: 0, borderRadius: '24px' }, end = { transform: 'none', opacity: 1 };
      return el.animate(back ? [end, start] : [start, end], { duration: back ? 320 : 520, easing: back ? 'cubic-bezier(.4,0,.6,1)' : 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
    }
    document.querySelectorAll('[data-face]').forEach(function (f) {
      f.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || busy) return;
        e.preventDefault();
        from = f;
        body.innerHTML = f.querySelector('template').innerHTML;
        body.querySelector('h3').id = 'sheet-title';
        var img = f.querySelector('.dial img'); simg.src = img.currentSrc || img.src; simg.alt = img.alt;
        buy.href = f.href; price.textContent = f.querySelector('.price').textContent;
        buy.setAttribute('aria-label', 'Get ' + body.querySelector('h3').textContent + ' on Google Play for ' + price.textContent);
        doc.classList.add('modal-open');
        sheet.classList.add('opening'); sheet.showModal(); card.scrollTop = 0;
        requestAnimationFrame(function () { sheet.classList.remove('opening'); });
        if (!reduce) {
          var a = rectAnim(card, f.getBoundingClientRect(), card.getBoundingClientRect(), false);
          sheet.querySelectorAll('.sheet-body > *, .sheet-buy').forEach(function (el, k) {
            el.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 450, delay: 180 + k * 45, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
          });
          simg.animate([{ transform: 'rotate(-90deg) scale(.7)' }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)' });
          a.onfinish = function () { a.cancel(); };
        }
      });
    });
    function close() {
      if (busy || !sheet.open) return;
      function done() { busy = false; sheet.close(); sheet.classList.remove('closing'); doc.classList.remove('modal-open'); if (from) from.focus({ preventScroll: true }); }
      sheet.classList.add('closing');
      if (reduce || !from) return done();
      busy = true;
      var a = rectAnim(card, from.getBoundingClientRect(), card.getBoundingClientRect(), true);
      a.onfinish = function () { done(); a.cancel(); };
    }
    sheet.querySelector('.sheet-x').addEventListener('click', close);
    sheet.addEventListener('click', function (e) { if (e.target === sheet) close(); });
    sheet.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  }

  // Highlight the menu link for the section on screen
  var links = document.querySelectorAll('.nav a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {}; links.forEach(function (a) { var s = document.querySelector(a.getAttribute('href')); if (s) map[s.id] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { var a = map[e.target.id]; if (a) a.classList.toggle('active', e.isIntersecting); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { so.observe(document.getElementById(id)); });
  }

  // Pause the looping hero and ticker animations while they're off screen
  if ('IntersectionObserver' in window) {
    var po = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('paused', !e.isIntersecting); }); });
    document.querySelectorAll('.hero, .ticker').forEach(function (el) { po.observe(el); });
  }

  if (!fine || reduce) return;

  // Gentle tilt of the hero phones toward the pointer, eased every frame (no restarted CSS transitions)
  var stack = document.querySelector('.stack'), hero = document.querySelector('.hero');
  if (stack && hero) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function step() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      stack.style.transform = 'perspective(1200px) rotateY(' + cx.toFixed(3) + 'deg) rotateX(' + cy.toFixed(3) + 'deg)';
      raf = (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) ? requestAnimationFrame(step) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(step); }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * 10; ty = -((e.clientY - r.top) / r.height - .5) * 8; kick();
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  }
})();
