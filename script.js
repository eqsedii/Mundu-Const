(function () {
  'use strict';
  var d = document, w = window;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };

  // Hide the loading screen (safe to call many times)
  function hideLoader() {
    var l = $('#loader');
    if (l) l.classList.add('done');
    d.body.classList.add('ready');
  }
  // Never let the loader get stuck: hide on load, DOM ready, or after 2.5s
  if (d.readyState === 'complete') hideLoader();
  else w.addEventListener('load', hideLoader);
  d.addEventListener('DOMContentLoaded', function () { setTimeout(hideLoader, 600); });
  setTimeout(hideLoader, 2500);

  function init() {
    try {
      // Footer year
      var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

      // Header solid on scroll + scroll progress bar
      var header = $('#top'), bar = $('#progress');
      function onScroll() {
        var y = w.pageYOffset || d.documentElement.scrollTop;
        if (header && !header.hasAttribute('data-solid') || (header && !header.getAttribute('data-solid'))) {
          header.classList.toggle('solid', y > 40);
        }
        if (bar) {
          var h = d.documentElement.scrollHeight - w.innerHeight;
          bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
        }
      }
      w.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Mobile menu
      var burger = $('.burger'), nav = $('nav');
      if (burger && nav) {
        burger.addEventListener('click', function () {
          var open = nav.classList.toggle('open');
          burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        $$('a', nav).forEach(function (a) {
          a.addEventListener('click', function () {
            nav.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
          });
        });
      }

      // Reveal on scroll
      var rv = $$('.rv');
      if ('IntersectionObserver' in w) {
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
          });
        }, { threshold: 0.12 });
        rv.forEach(function (el) { io.observe(el); });
      } else rv.forEach(function (el) { el.classList.add('in'); });

      // Count-up numbers
      var nums = $$('[data-n]');
      function count(el) {
        var to = parseInt(el.getAttribute('data-n'), 10) || 0, t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 1200, 1);
          el.textContent = Math.round(to * p);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }
      if ('IntersectionObserver' in w) {
        var io2 = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { count(e.target); io2.unobserve(e.target); }
          });
        }, { threshold: 0.4 });
        nums.forEach(function (n) { io2.observe(n); });
      } else nums.forEach(function (n) { n.textContent = n.getAttribute('data-n'); });

      // Tilt effect (desktop pointer only)
      if (w.matchMedia && w.matchMedia('(hover:hover)').matches) {
        $$('#logoCard, .tilt').forEach(function (el) {
          el.addEventListener('mousemove', function (e) {
            var r = el.getBoundingClientRect();
            var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = 'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg)';
          });
          el.addEventListener('mouseleave', function () { el.style.transform = ''; });
        });
      }

      // Lightbox for project photos
      var lb = $('#lb');
      if (lb) {
        var lbImg = $('img', lb), lbCap = $('p', lb);
        var close = function () { lb.hidden = true; };
        $$('figure img').forEach(function (img) {
          if (!img.closest('.rv') || img.closest('.tilt')) return;
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', function () {
            lbImg.src = img.currentSrc || img.src;
            lbImg.alt = img.alt;
            var fc = img.parentNode.querySelector('figcaption');
            lbCap.textContent = fc ? fc.textContent : '';
            lb.hidden = false;
          });
        });
        lb.addEventListener('click', function (e) { if (e.target !== lbImg) close(); });
        d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      }

      // Quote form -> WhatsApp
      var form = $('#quote');
      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var f = form.elements;
          var msg = 'Hello Mundu Wangai Construction, I need a quote.\n' +
            'Name: ' + f.n.value + '\nPhone: ' + f.p.value +
            '\nService: ' + f.s.value + '\nDetails: ' + f.m.value;
          var btn = $('button[type=submit]', form);
          if (btn) { btn.classList.add('is-loading'); setTimeout(function () { btn.classList.remove('is-loading'); }, 1500); }
          w.open('https://wa.me/254718878924?text=' + encodeURIComponent(msg), '_blank', 'noopener');
        });
      }

      // Page-to-page loading overlay
      var nl = $('#navload');
      if (nl) {
        $$('a[href]').forEach(function (a) {
          var h = a.getAttribute('href');
          if (!/^[\w-]+\.html(#.*)?$/.test(h)) return;
          a.addEventListener('click', function (e) {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
            nl.classList.add('on');
          });
        });
        w.addEventListener('pageshow', function () { nl.classList.remove('on'); });
      }

      // Hero video: try to play, keep poster if blocked
      var v = $('.hero video');
      if (v && v.play) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    } catch (err) {
      if (w.console) console.error(err);
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init);
  else init();
})();
