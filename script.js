/* ============================================================
   MAB's WEED LOVERS — script.js
   Adds interactivity to the site WITHOUT changing any HTML or CSS:
     1. Highlights the active page in the navigation
     2. Mobile menu toggle (small screens)
     3. Gallery image lightbox with prev/next and keyboard support
     4. Contact form validation with friendly status messages
     5. Highlights today's row in the operating-hours table
     6. Automatically updates the footer copyright year, and runs a live
        South Africa (SAST) clock in the footer
     7. "Back to top" floating button
   The file is loaded in <head>, so everything runs after the
   DOM is ready (DOMContentLoaded).
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  /* ---------- helpers ---------- */
  function currentFile() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    file = decodeURIComponent(file).toLowerCase();
    // "index.html" and "Home Page.html" are the same page
    if (file === 'home page.html') file = 'index.html';
    return file;
  }

  function setStyles(el, styles) {
    for (var prop in styles) {
      if (Object.prototype.hasOwnProperty.call(styles, prop)) {
        el.style[prop] = styles[prop];
      }
    }
  }

  /* ---------- 1. Active navigation link ---------- */
  var here = currentFile();
  var nav = document.querySelector('header nav');
  if (nav) {
    nav.querySelectorAll('a').forEach(function (link) {
      var target = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
      if (target === 'home page.html') target = 'index.html';
      if (target === here) {
        setStyles(link, {
          background: 'rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          fontWeight: '700',
          borderRadius: '6px',
          textDecoration: 'underline'
        });
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- 2. Mobile menu toggle (screens <= 720px) ---------- */
  var header = document.querySelector('header');
  if (header && nav) {
    var menuBtn = document.createElement('button');
    menuBtn.type = 'button';
    menuBtn.textContent = '☰ Menu';
    menuBtn.setAttribute('aria-expanded', 'false');
    setStyles(menuBtn, {
      display: 'none',
      margin: '0 0 10px',
      padding: '8px 16px',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      borderRadius: '6px',
      background: 'rgba(255, 255, 255, 0.15)',
      color: '#ffffff',
      fontWeight: '600',
      cursor: 'pointer'
    });
    header.insertBefore(menuBtn, nav);

    var mobileQuery = window.matchMedia('(max-width: 720px)');

    function applyNavMode() {
      if (mobileQuery.matches) {
        menuBtn.style.display = 'inline-block';
        var open = menuBtn.getAttribute('aria-expanded') === 'true';
        nav.style.display = open ? 'flex' : 'none';
      } else {
        menuBtn.style.display = 'none';
        nav.style.display = ''; // restore stylesheet layout on desktop
      }
    }

    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!open));
      menuBtn.textContent = open ? '☰ Menu' : '✕ Close';
      applyNavMode();
    });

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', applyNavMode);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(applyNavMode); // older browsers
    }
    applyNavMode();
  }

  /* ---------- 3. Gallery lightbox ---------- */
  var galleryImages = document.querySelectorAll('#Gallery img');
  if (galleryImages.length) {
    // Build the lightbox overlay entirely in JavaScript
    var overlay = document.createElement('div');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Image viewer');
    setStyles(overlay, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.88)',
      display: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '14px',
      zIndex: '9999',
      padding: '24px'
    });

    var bigImg = document.createElement('img');
    setStyles(bigImg, {
      maxWidth: '90vw',
      maxHeight: '78vh',
      borderRadius: '10px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
      objectFit: 'contain'
    });

    var caption = document.createElement('p');
    setStyles(caption, { color: '#e5e8e2', margin: '0', fontSize: '1rem' });

    function makeLightboxButton(label) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      setStyles(btn, {
        margin: '0',
        padding: '9px 18px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        borderRadius: '7px',
        background: 'rgba(255, 255, 255, 0.12)',
        color: '#ffffff',
        fontWeight: '600',
        cursor: 'pointer'
      });
      return btn;
    }

    var controls = document.createElement('div');
    setStyles(controls, { display: 'flex', gap: '12px' });
    var prevBtn = makeLightboxButton('← Previous');
    var closeBtn = makeLightboxButton('✕ Close');
    var nextBtn = makeLightboxButton('Next →');
    controls.appendChild(prevBtn);
    controls.appendChild(closeBtn);
    controls.appendChild(nextBtn);

    overlay.appendChild(bigImg);
    overlay.appendChild(caption);
    overlay.appendChild(controls);
    document.body.appendChild(overlay);

    var currentIndex = 0;

    function prettyName(src) {
      var file = decodeURIComponent(src.split('/').pop() || '');
      return file.replace(/\.[a-z]+$/i, '').replace(/[-_]+/g, ' ');
    }

    function showImage(index) {
      currentIndex = (index + galleryImages.length) % galleryImages.length;
      bigImg.src = galleryImages[currentIndex].src;
      bigImg.alt = prettyName(galleryImages[currentIndex].src);
      caption.textContent = bigImg.alt + '  (' + (currentIndex + 1) + ' of ' + galleryImages.length + ')';
    }

    function openLightbox(index) {
      showImage(index);
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }

    function closeLightbox() {
      overlay.style.display = 'none';
      document.body.style.overflow = '';
      bigImg.removeAttribute('src');
    }

    galleryImages.forEach(function (img, index) {
      img.style.cursor = 'zoom-in';
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge image: ' + prettyName(img.src));
      img.addEventListener('click', function () { openLightbox(index); });
      img.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    prevBtn.addEventListener('click', function () { showImage(currentIndex - 1); });
    nextBtn.addEventListener('click', function () { showImage(currentIndex + 1); });
    closeBtn.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (overlay.style.display !== 'flex') return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (event.key === 'ArrowRight') showImage(currentIndex + 1);
    });
  }

  /* ---------- 4. Contact form validation ---------- */
  var form = document.querySelector('form');
  if (form) {
    form.setAttribute('novalidate', 'novalidate'); // we handle the messages ourselves

    var status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    setStyles(status, { margin: '14px 0 0', fontWeight: '600', display: 'none' });
    form.appendChild(status);

    function showStatus(message, isError) {
      status.textContent = message;
      status.style.display = 'block';
      status.style.color = isError ? '#ff8f8f' : '#9fe6a0';
    }

    function markField(field, valid) {
      field.style.borderColor = valid ? '' : '#ff6b6b';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = form.querySelector('#name');
      var surname = form.querySelector('#surname');
      var phone = form.querySelector('#phone');
      var email = form.querySelector('#email');
      var message = form.querySelector('#message');
      var errors = [];

      [name, surname, phone, email, message].forEach(function (field) {
        if (field) markField(field, true);
      });

      if (name && name.value.trim() === '') { errors.push('your name'); markField(name, false); }
      if (surname && surname.value.trim() === '') { errors.push('your surname'); markField(surname, false); }

      if (phone) {
        var phoneValue = phone.value.trim();
        var digits = phoneValue.replace(/\D/g, '');
        if (phoneValue === '' || digits.length < 7 || !/^[+0-9()\-\s]+$/.test(phoneValue)) {
          errors.push('a valid phone number');
          markField(phone, false);
        }
      }

      if (email) {
        var emailValue = email.value.trim();
        if (emailValue === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
          errors.push('a valid email address');
          markField(email, false);
        }
      }

      if (message && message.value.trim().length < 10) {
        errors.push('a message of at least 10 characters');
        markField(message, false);
      }

      if (errors.length) {
        showStatus('Please enter ' + errors.join(', ') + '.', true);
        return;
      }

      showStatus('Thank you, ' + name.value.trim() +
        '! Your message has been received. We will get back to you ASAP. 😊', false);
      form.reset();
    });
  }

  /* ---------- 5. Highlight today's operating hours ---------- */
  var hoursTable = document.querySelector('table');
  if (hoursTable) {
    var today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    hoursTable.querySelectorAll('tr').forEach(function (row) {
      var cell = row.querySelector('td');
      if (!cell) return;
      var day = cell.textContent.trim().toLowerCase();
      // the page spells Saturday as "Saterday" — match both
      if (day === today || (day === 'saterday' && today === 'saturday')) {
        setStyles(row, {
          background: 'rgba(135, 152, 120, 0.35)',
          outline: '2px solid #879878',
          fontWeight: '700'
        });
        cell.textContent = cell.textContent + '  (Today)';
      }
    });
  }

  /* ---------- 6. Auto-update footer year ---------- */
  // Only the copyright line is touched, so the social icons and clock survive.
  var yearNow = String(new Date().getFullYear());
  document.querySelectorAll('footer .copyright').forEach(function (line) {
    line.textContent = line.textContent.replace(/\b(19|20)\d{2}\b/, yearNow);
  });

  /* ---------- 6b. Live clock in the footer ---------- */
  // Shows the current date and time in South Africa (SAST), ticking every second.
  var clock = document.getElementById('live-clock');
  if (clock) {
    var dateFormat, timeFormat;
    try {
      dateFormat = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      timeFormat = new Intl.DateTimeFormat('en-ZA', {
        timeZone: 'Africa/Johannesburg',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      });
    } catch (err) {
      // Very old browsers: fall back to the visitor's own clock
      dateFormat = new Intl.DateTimeFormat('en-ZA', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      timeFormat = new Intl.DateTimeFormat('en-ZA', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      });
    }

    function tickClock() {
      var now = new Date();
      clock.textContent = dateFormat.format(now) + '  |  ' + timeFormat.format(now);
      clock.setAttribute('datetime', now.toISOString());
      // schedule the next tick right on the next second boundary
      setTimeout(tickClock, 1000 - now.getMilliseconds());
    }
    tickClock();
  }

  /* ---------- 7. Back-to-top button ---------- */
  var topBtn = document.createElement('button');
  topBtn.type = 'button';
  topBtn.textContent = '↑ Top';
  topBtn.setAttribute('aria-label', 'Back to top');
  setStyles(topBtn, {
    position: 'fixed',
    right: '18px',
    bottom: '18px',
    zIndex: '9998',
    display: 'none',
    margin: '0',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '50px',
    background: 'rgb(0, 113, 252)',
    color: '#ffffff',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)'
  });
  document.body.appendChild(topBtn);

  window.addEventListener('scroll', function () {
    topBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });
  topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
