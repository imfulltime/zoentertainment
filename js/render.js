/* ZENTRA ONE ENTERTAINMENT — renders editable content from data/content.json.
   If the fetch fails (e.g. local preview from file://), pages keep their built-in text. */
(function () {
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  var COLORS = { singer: 'blue', dancer: 'green', host: 'orange', comedian: 'orange', athlete: 'blue', influencer: 'green' };

  function apply(C) {
    var T = C.texts || {};
    var L = C.links || {};

    document.querySelectorAll('[data-cms]').forEach(function (el) {
      var k = el.getAttribute('data-cms');
      if (T[k] !== undefined && T[k] !== '') el.textContent = T[k];
    });
    document.querySelectorAll('[data-cms-href]').forEach(function (el) {
      var k = el.getAttribute('data-cms-href');
      if (L[k] && L[k] !== '#') el.href = (k === 'email' && L[k].indexOf('mailto:') !== 0) ? 'mailto:' + L[k] : L[k];
    });

    function talentCard(t, i) {
      var col = COLORS[t.category] || 'blue';
      var hasPhoto = t.photo && t.photo.length;
      var bg = hasPhoto ? ' style="background-image:url(\'' + esc(t.photo) + '\');background-size:cover;background-position:center top"' : '';
      return '<div class="talent-card reveal in" data-cat="' + esc(t.category) + '"' + bg + '>' +
        (hasPhoto ? '' : '<div class="tint-' + col + '"></div><div class="backdrop">' + String(i + 1).padStart(2, '0') + '</div>') +
        '<div class="info"><span class="cat cat-' + col + '">' + esc(t.catLabel || t.category) + '</span>' +
        '<h3>' + esc(t.name) + '</h3><p>' + esc(t.blurb) + '</p></div></div>';
    }

    var grid = document.getElementById('talentGrid');
    if (grid && C.talents && C.talents.length) grid.innerHTML = C.talents.map(talentCard).join('');

    var buttons = document.querySelectorAll('.filter-btn');
    if (buttons.length && grid) {
      buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
          buttons.forEach(function (b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var f = btn.getAttribute('data-filter');
          grid.querySelectorAll('.talent-card').forEach(function (c) {
            c.style.display = (f === 'all' || c.getAttribute('data-cat') === f) ? '' : 'none';
          });
        });
      });
    }

    var feat = document.getElementById('featuredGrid');
    if (feat && C.talents && C.talents.length) {
      var picks = C.talents.filter(function (t) { return t.featured; }).slice(0, 3);
      if (!picks.length) picks = C.talents.slice(0, 3);
      feat.innerHTML = picks.map(talentCard).join('');
    }

    var GLOWS = ['glow-orange', 'glow-green', 'glow-blue'];
    var up = document.getElementById('upcomingGrid');
    if (up && C.productions) {
      var u = C.productions.filter(function (p) { return p.status === 'upcoming'; });
      if (u.length) {
        up.innerHTML = u.map(function (p, i) {
          var tix = (p.tickets || L.tickets) ?
            '<p style="margin-top:14px"><a class="btn btn-fill" style="font-size:0.95rem;padding:10px 22px" href="' +
            esc(p.tickets || L.tickets) + '" target="_blank" rel="noopener">Buy Tickets on Kalyx One</a></p>' : '';
          return '<div class="poster ' + GLOWS[i % 3] + ' reveal in"><div class="p-num">★</div>' +
            '<h3>' + esc(p.title) + '</h3><p>' + esc(p.blurb) + '</p>' + tix + '</div>';
        }).join('');
      }
    }
    var ar = document.getElementById('archiveGrid');
    if (ar && C.productions) {
      var a = C.productions.filter(function (p) { return p.status === 'past'; });
      if (a.length) {
        ar.innerHTML = a.map(function (p, i) {
          var col = ['blue', 'green', 'orange'][i % 3];
          var hasPhoto = p.photo && p.photo.length;
          var bg = hasPhoto ? ' style="background-image:url(\'' + esc(p.photo) + '\');background-size:cover;background-position:center"' : '';
          var yr = p.date ? "'" + String(p.date).slice(2, 4) : 'ZOE';
          return '<div class="talent-card reveal in"' + bg + '>' +
            (hasPhoto ? '' : '<div class="tint-' + col + '"></div><div class="backdrop">' + esc(yr) + '</div>') +
            '<div class="info"><span class="cat cat-' + col + '">' + esc(p.kind || 'Show') + '</span>' +
            '<h3>' + esc(p.title) + '</h3><p>' + esc(p.blurb) + '</p></div></div>';
        }).join('');
      }
    }

    var form = document.getElementById('inquiryForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = new FormData(form);
        var payload = {};
        data.forEach(function (v, k) { payload[k] = v; });
        var note = document.getElementById('formNote');
        fetch('/api/inquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) { if (!r.ok) throw 0; return r.json(); })
          .then(function () {
            form.reset();
            if (note) { note.textContent = 'Sent! We’ll get back to you soon.'; note.style.color = '#59d94e'; }
          })
          .catch(function () {
            var to = (L.email || T.contact_email || 'info@zentraone.com.au').replace('mailto:', '');
            var body = ['Name: ' + data.get('name'), 'Email: ' + data.get('email'), 'Phone: ' + (data.get('phone') || ''),
              'Type: ' + data.get('type'), 'Location: ' + data.get('location'), 'Date: ' + (data.get('date') || ''),
              '', data.get('message') || ''].join('\n');
            location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('ZOE Inquiry from ' + data.get('name')) +
              '&body=' + encodeURIComponent(body);
          });
      });
    }
  }

  fetch('data/content.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(apply)
    .catch(function () { /* local preview or missing file: keep built-in content */ });
})();
