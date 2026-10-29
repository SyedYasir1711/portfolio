/* Syed Yasir — Portfolio behaviour (no dependencies).
 * - Intro: canvas particle preloader -> portrait burst (startLanding / drawLanding)
 * - Top nav appears once "All Projects" reaches the top third of the screen
 * - Capabilities: particle icons morph every 3.2 s (fsShapes / xShapes / lblShapes)
 * - FAQ: any number of items can be open
 * State changes go through setState(), which calls sync() to update the DOM.
 */
(function () {
  'use strict';

  class Portfolio {
    constructor() {
      this.props = {};
      this.state = { open: { 0: true }, fsPhase: -1, landed: false, navOn: false };
      this.lndSrc = 'assets/portrait.jpg';
    }

    setState(patch) {
      Object.assign(this.state, patch);
      this.sync(patch);
    }

    mount() {
      document.querySelectorAll('[data-action="replay"]').forEach(btn => btn.addEventListener('click', () => this.replayLanding()));
      document.querySelectorAll('[data-faq-toggle]').forEach(btn => btn.addEventListener('click', () => {
        const i = Number(btn.getAttribute('data-faq-toggle'));
        const open = !!this.state.open[i];
        this.setState({ open: Object.assign({}, this.state.open, { [i]: !open }) });
      }));
  
      this.initLanding();
      this._navChk = () => {
        const el = document.getElementById('projects-e'); if (!el) return;
        const on = el.getBoundingClientRect().top <= Math.max(140, window.innerHeight * 0.35);
        if (on !== this.state.navOn) this.setState({ navOn: on });
      };
      window.addEventListener('scroll', this._navChk, { passive: true, capture: true });
      window.addEventListener('resize', this._navChk);
      this._navChk();
      let reduce = false;
      try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
      this._fsT = setTimeout(() => this.setState({ fsPhase: 0 }), 300);
      if (!reduce) this._fsI = setInterval(() => { const p = this.state.fsPhase; this.setState({ fsPhase: ((p < 0 ? 0 : p) + 1) % 3 }); }, 3200);
    
    }

    // ---- DOM sync -------------------------------------------------------
    sync(patch) {
      if ('landed' in patch) document.querySelectorAll('.lnd-t').forEach(el => el.classList.toggle('on', this.state.landed));
      if ('navOn' in patch) document.querySelectorAll('.top-nav').forEach(el => el.classList.toggle('on', this.state.navOn));
      if (!('fsPhase' in patch) && !('open' in patch)) return;
      const v = this.dynamicVals();
      if ('fsPhase' in patch) {
        [['fs', v.fs], ['dv', v.dv], ['pm', v.pm]].forEach(([g, arr]) => {
          const svg = document.querySelector('svg[data-pg="' + g + '"]'); if (!svg) return;
          const dots = svg.querySelectorAll('circle.fs-p');
          arr.forEach((pt, i) => {
            const c = dots[i]; if (!c) return;
            c.setAttribute('r', pt.r);
            c.style.transition = 'transform 1.15s cubic-bezier(.65,0,.35,1) ' + pt.d + ', fill .6s ease ' + pt.d;
            c.style.transform = 'translate(' + pt.x + 'px, ' + pt.y + 'px)';
            c.style.fill = pt.c;
          });
        });
      }
      if ('open' in patch) {
        v.faqs.forEach((f, i) => {
          const item = document.querySelector('[data-faq="' + i + '"]'); if (!item) return;
          item.style.background = f.bg; item.style.borderColor = f.border;
          const btn = item.querySelector('[data-faq-toggle]'); btn.setAttribute('aria-expanded', String(f.open));
          const ic = item.querySelector('[data-faq-icon]');
          ic.textContent = f.icon; ic.style.background = f.iconBg; ic.style.color = f.iconInk; ic.style.borderColor = f.iconBorder;
          const a = item.querySelector('[data-faq-a]'); if (a) a.hidden = !f.open;
        });
      }
    }

    // Values that change with state (particle positions, FAQ styling).
    dynamicVals() {
    const fsS = this.fsShapes();
    const fsPh = this.state.fsPhase;
    const fsPts = fsPh < 0 ? fsS.scatter : fsS.list[fsPh];
    const fsParticles = fsPts.map((p, i) => ({ x: p.x.toFixed(1), y: p.y.toFixed(1), c: p.k === 'a' ? 'var(--lime)' : (fsPh < 0 ? 'var(--bd)' : 'var(--mu)'), d: (((i * 37) % 40) * 0.0125).toFixed(4) + 's' }));
    const fsLabel = fsPh < 0 ? '' : ['Front-end', 'Back-end', 'Database'][fsPh];
    const xS = this.xShapes();
    const mkP = (pts, base) => pts.map((p, i) => ({ x: p.x.toFixed(1), y: p.y.toFixed(1), c: p.k === 'a' ? 'var(--lime)' : (fsPh < 0 ? 'var(--bd)' : 'var(--mu)'), d: (base + ((i * 37) % 40) * 0.0125).toFixed(4) + 's' }));
    const dvParticles = mkP(fsPh < 0 ? fsS.scatter : xS.dv[fsPh], 0.35);
    const pmParticles = mkP(fsPh < 0 ? fsS.scatter : xS.pm[fsPh], 0.7);
    const dvLabel = fsPh < 0 ? '' : ['Build', 'Test', 'Deploy'][fsPh];
    const pmLabel = fsPh < 0 ? '' : ['Plan', 'Schedule', 'Deliver'][fsPh];
    const LB = this.lblShapes();
    const mkL = (text, base) => { const pts = text ? LB.map[text.toUpperCase()] : null; return Array.from({ length: LB.M }, (_, i) => { const d = (base + 0.15 + ((i * 23) % 40) * 0.0125).toFixed(4) + 's'; if (!pts) return { x: (75 + 55 * Math.cos(i * 2.1)).toFixed(1), y: (118 + 5 * Math.sin(i * 1.3)).toFixed(1), r: '0.62', c: 'transparent', d }; const p = pts[i % pts.length]; return { x: p[0].toFixed(1), y: p[1].toFixed(1), r: '0.62', c: i < pts.length ? 'var(--mu)' : 'transparent', d }; }); };
    const withR = (arr) => arr.map(p => Object.assign({}, p, { r: '1.15' }));
    const accent = this.props.accent ?? '#ACDC2E';
    const faqList = [
      { q: 'What kind of projects do you work on?', a: 'Full-stack web applications — authentication, role-based access, case management, file uploads — along with the CI/CD and deployment work that keeps them reliable.' },
      { q: 'What is your main tech stack?', a: 'JavaScript and TypeScript with Node.js and Express, MongoDB and PostgreSQL, Handlebars and React Native, automated with GitHub Actions and deployed to Azure and Cloudflare R2.' },
      { q: 'How do you approach a new project?', a: 'I plan first: scope, a work breakdown structure, the critical path and the risks. Then I build in Agile iterations, with Gitflow branching and code review through pull requests.' },
      { q: 'How do you make sure releases are safe?', a: 'Automated tests and quality gates in CI, end-to-end tests for key flows, health checks and rollback safeguards on deploy, and automated database backups.' },
      { q: 'What are your thoughts on AI?', a: 'I personally see AI as an extremely powerful tool that requires human touch and intervention to maximize its output. While I support coding with AI, I do NOT support shipping features and generated code where the developer does not know what is happening. The solutions for the problems should still be engineered by the engineer.' },
      { q: 'How can we get started?', a: 'Email me at syedyasir1711@gmail.com or connect on LinkedIn. I am based in Doha, Qatar.' }
    ];
    const faqs = faqList.map((f, i) => {
      const open = !!(this.state.open && this.state.open[i]);
      return {
        ...f, open,
        icon: open ? '×' : '+',
        iconBg: open ? '#ACDC2E' : 'transparent',
        iconInk: open ? '#00110E' : 'var(--tx)',
        iconBorder: open ? 'var(--lime)' : 'var(--bd2)',
        bg: open ? 'linear-gradient(180deg, var(--sf4) 0%, var(--sf) 100%)' : 'var(--sf)',
        border: open ? 'rgba(var(--lime-rgb),0.6)' : 'var(--bd)',
      };
    });

      return {
        fs: withR(fsParticles).concat(mkL(fsLabel, 0)),
        dv: withR(dvParticles).concat(mkL(dvLabel, 0.35)),
        pm: withR(pmParticles).concat(mkL(pmLabel, 0.7)),
        faqs
      };
    }

    // ---- intro engine + particle shapes ---------------------------------
  initLanding() {
    let tries = 0;
    const go = () => {
      const cv = (typeof document !== 'undefined') ? document.getElementById('lnd-cv-v') : null;
      if (!cv || !cv.getBoundingClientRect().width) { if (tries++ < 60) this._lndR = setTimeout(go, 60); return; }
      this.startLanding(cv);
    };
    go();
  }

  startLanding(cv) {
    const ctx = cv.getContext('2d'); if (!ctx) return;
    let reduce = false; try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    const S = this._lnd = { cv, ctx, W: 0, H: 0, dpr: 1, t0: performance.now(), stars: [], ring: [], pts: [], mouse: null, landed: false, reduce, raf: 0, img: null, ready: false };
    try { S.mq = window.matchMedia('(prefers-color-scheme: light)'); } catch (e) {}
    S.resize = () => {
      const r = cv.getBoundingClientRect(); const pW = S.W, pH = S.H; S.W = Math.max(300, r.width); S.H = Math.max(480, r.height);
      const rebuild = Math.abs(S.W - pW) > 1 || Math.abs(S.H - pH) > 120;
      S.dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(S.W * S.dpr); cv.height = Math.round(S.H * S.dpr);
      ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); if (S.img && rebuild) this.buildPortrait(true);
    };
    window.addEventListener('resize', S.resize); S.resize();
    for (let i = 0; i < 180; i++) S.stars.push({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.35, a: Math.random() * 0.45 + 0.12, vx: (Math.random() - 0.5) * 0.006, vy: (Math.random() - 0.5) * 0.006, tw: Math.random() * 6.28 });
    for (let i = 0; i < 56; i++) { const ca = Math.random() * 6.2832, cr = Math.sqrt(Math.random()) * 12; S.ring.push({ sx: Math.random(), sy: Math.random(), cx: Math.cos(ca) * cr, cy: Math.sin(ca) * cr }); }
    S.move = (e) => { const r = cv.getBoundingClientRect(); S.mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    S.leave = () => { S.mouse = null; };
    cv.addEventListener('mousemove', S.move); cv.addEventListener('mouseleave', S.leave);
    S.tmove = (e) => { const tt = e.touches && e.touches[0]; if (tt) S.move(tt); };
    cv.addEventListener('touchstart', S.tmove, { passive: true }); cv.addEventListener('touchmove', S.tmove, { passive: true });
    cv.addEventListener('touchend', S.leave, { passive: true }); cv.addEventListener('touchcancel', S.leave, { passive: true });
    const img = new Image(); img.onload = () => { S.img = img; this.buildPortrait(false); }; img.src = this.lndSrc;
    if (reduce) S.t0 -= 9000;
    const loop = (now) => { this.drawLanding(now); S.raf = requestAnimationFrame(loop); };
    S.raf = requestAnimationFrame(loop);
  }

  buildPortrait(keep) {
    const S = this._lnd; const img = S.img;
    const sw = 210, sh = Math.round(210 * img.height / img.width);
    const oc = document.createElement('canvas'); oc.width = sw; oc.height = sh;
    const o = oc.getContext('2d'); o.drawImage(img, 0, 0, sw, sh);
    let d; try { d = o.getImageData(0, 0, sw, sh).data; } catch (e) { S.pts = []; S.ready = true; return; } // canvas tainted (e.g. opened via file://)
    const mob = S.W < 720;
    const scale = mob ? Math.min(S.H * 0.7 / sh, S.W * 1.0 / sw) : Math.min(S.H * 0.94 / sh, S.W * 0.6 / sw);
    const ox = S.W / 2 - sw * scale / 2, oy = S.H - sh * scale;
    let pts = [];
    for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
      const k = (y * sw + x) * 4; const r = d[k], gg = d[k + 1], bb = d[k + 2];
      const lum = 0.299 * r + 0.587 * gg + 0.114 * bb;
      const dist = Math.sqrt((r - 19) * (r - 19) + (gg - 23) * (gg - 23) + (bb - 26) * (bb - 26));
      if (dist < 13) continue;
      if (y < sh * 0.12 && (x < sw * 0.2 || x > sw * 0.8)) continue;
      const pr = 0.26 + Math.min(1, Math.max(0, (lum - 20) / 190)) * 0.42;
      if (Math.random() > pr) continue;
      pts.push({ tx: ox + (x + Math.random()) * scale, ty: oy + (y + Math.random()) * scale, b: lum > 140 ? 2 : (lum > 48 ? 1 : 0) });
    }
    const MAX = mob ? 6500 : 10000; if (pts.length > MAX) { pts.sort(() => Math.random() - 0.5); pts = pts.slice(0, MAX); }
    pts.sort((a, b) => a.b - b.b);
    pts.forEach(p => { p.sx = S.W / 2; p.sy = S.H / 2; p.dl = Math.random() * Math.random() * 0.45; p.ph = Math.random() * 6.28; p.ox = 0; p.oy = 0; });
    S.pts = pts; S.ready = true;
  }

  replayLanding() {
    const S = this._lnd; if (!S) return;
    S.t0 = performance.now(); S.landed = false;
    S.ring.forEach(r => { r.sx = Math.random(); r.sy = Math.random(); });
    if (this.state && this.state.landed) this.setState({ landed: false });
  }

  drawLanding(now) {
    const S = this._lnd; const ctx = S.ctx; const W = S.W, H = S.H;
    let t = (now - S.t0) / 1000;
    const L = !!(S.mq && S.mq.matches);
    if (!S.ready && t > 4.6) { S.t0 = now - 4600; t = 4.6; }
    ctx.clearRect(0, 0, W, H);
    const dt = 1 / 60;
    for (const s of S.stars) {
      s.x = (s.x + s.vx * dt + 1) % 1; s.y = (s.y + s.vy * dt + 1) % 1;
      const a = s.a * (0.65 + 0.35 * Math.sin(now / 900 + s.tw));
      ctx.fillStyle = L ? 'rgba(60,96,88,' + (a * 0.7).toFixed(3) + ')' : 'rgba(159,194,186,' + a.toFixed(3) + ')';
      ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
    }
    const cx = W / 2, cy = H / 2;
    const ease = (x) => x <= 0 ? 0 : x >= 1 ? 1 : (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const lerp = (a, b, e) => a + (b - a) * e;
    if (t < 5.45) {
      const N = S.ring.length; const R = Math.max(24, Math.min(38, W * 0.03)); const rot = now / 1000 * 1.7;
      const p = Math.max(0, Math.min(1, (t - 2.4) / 2.2));
      ctx.fillStyle = L ? '#5A8700' : '#ACDC2E';
      S.ring.forEach((r, i) => {
        const sx = r.sx * W, sy = r.sy * H, kx = cx + r.cx, ky = cy + r.cy;
        const ang = i / N * Math.PI * 2 + rot - Math.PI / 2; const rx = cx + Math.cos(ang) * R, ry = cy + Math.sin(ang) * R;
        let x, y, a = 1;
        if (t < 1.0) { x = sx; y = sy; a = Math.min(1, t) * 0.8; }
        else if (t < 1.9) { const e = ease((t - 1.0) / 0.9); x = lerp(sx, kx, e); y = lerp(sy, ky, e); a = 0.8 + 0.2 * e; }
        else if (t < 2.4) { const e = ease((t - 1.9) / 0.5); x = lerp(kx, rx, e); y = lerp(ky, ry, e); }
        else if (t < 4.6) { x = rx; y = ry; a = (i / N <= p) ? 1 : 0.2; }
        else if (t < 5.1) { const e = ease((t - 4.6) / 0.5); x = lerp(rx, cx, e); y = lerp(ry, cy, e); }
        else { const e = (t - 5.1) / 0.35; x = cx; y = cy; a = Math.max(0, 1 - e); }
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (t >= 2.4 && t < 4.75) {
        ctx.fillStyle = L ? 'rgba(10,35,31,0.8)' : 'rgba(242,251,248,0.85)'; ctx.font = '600 11px Manrope, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.min(100, Math.round(p * 100)) + '%', cx, cy);
      }
    }
    if (t >= 4.95 && t < 5.6) {
      const k = t < 5.1 ? (t - 4.95) / 0.15 : Math.max(0, 1 - (t - 5.1) / 0.5);
      const fr = 4 + k * 26; const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, fr);
      fg.addColorStop(0, L ? 'rgba(90,135,0,' + (0.85 * k).toFixed(3) + ')' : 'rgba(236,255,190,' + (0.95 * k).toFixed(3) + ')'); fg.addColorStop(1, 'rgba(172,220,46,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(cx, cy, fr, 0, Math.PI * 2); ctx.fill();
    }
    if (t >= 5.1 && S.ready) {
      const cols = L ? ['rgba(14,52,92,0.88)', 'rgba(14,130,108,0.85)', 'rgba(16,147,122,0.38)'] : ['rgba(52,124,196,0.8)', 'rgba(22,170,140,0.9)', 'rgba(198,240,226,0.95)'];
      let cur = -1; const m = S.mouse; const RR = 95;
      for (const p of S.pts) {
        const q = Math.max(0, Math.min(1, (t - 5.1 - p.dl) / 1.7)); const e = 1 - Math.pow(1 - q, 3);
        let x = lerp(p.sx, p.tx, e), y = lerp(p.sy, p.ty, e);
        x += Math.sin(now / 1100 + p.ph) * 0.7 * e; y += Math.cos(now / 1300 + p.ph) * 0.7 * e;
        let fx = 0, fy = 0;
        if (m && q >= 1) { const dx = x - m.x, dy = y - m.y; const dd = Math.sqrt(dx * dx + dy * dy); if (dd < RR && dd > 0.01) { const f = (1 - dd / RR) * 22; fx = dx / dd * f; fy = dy / dd * f; } }
        p.ox += (fx - p.ox) * 0.12; p.oy += (fy - p.oy) * 0.12;
        if (p.b !== cur) { cur = p.b; ctx.fillStyle = cols[cur]; }
        ctx.fillRect(x + p.ox, y + p.oy, 1.25, 1.25);
      }
    }
    if (!S.landed && t > 6.3) { S.landed = true; if (this.setState) this.setState({ landed: true }); }
  }

  fsShapes() {
    if (this._fsShapes) return this._fsShapes;
    const seg = (pts, n, closed) => {
      const P = closed ? pts.concat([pts[0]]) : pts; const L = []; let tot = 0;
      for (let i = 0; i < P.length - 1; i++) { const d = Math.hypot(P[i+1][0]-P[i][0], P[i+1][1]-P[i][1]); L.push(d); tot += d; }
      const out = [];
      for (let k = 0; k < n; k++) {
        let t = closed ? (k / n) * tot : (n === 1 ? 0 : (k / (n - 1)) * tot); let i = 0;
        while (i < L.length - 1 && t > L[i]) { t -= L[i]; i++; }
        const f = L[i] ? Math.min(1, t / L[i]) : 0;
        out.push([P[i][0] + (P[i+1][0]-P[i][0]) * f, P[i][1] + (P[i+1][1]-P[i][1]) * f]);
      }
      return out;
    };
    const rect = (x1, y1, x2, y2) => [[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
    const grid = (x1, y1, x2, y2, c, r) => { const o = []; for (let j = 0; j < r; j++) for (let i = 0; i < c; i++) o.push([x1 + (c > 1 ? i * (x2-x1)/(c-1) : 0), y1 + (r > 1 ? j * (y2-y1)/(r-1) : 0)]); return o; };
    const ring = (cx, cy, rad, n, off) => Array.from({ length: n }, (_, i) => { const a = (off || 0) + i * 2 * Math.PI / n; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; });
    const tag = (arr, k) => arr.map(p => ({ x: p[0], y: p[1], k }));
    const front = [].concat(
      tag(seg(rect(30,14,120,74), 72, true), 's'), tag(seg([[75,74],[75,86]], 6), 's'), tag(seg([[58,90],[92,90]], 12), 's'),
      tag(grid(40,24,62,38,6,4), 'a'), tag(seg([[70,26],[110,26]], 10), 's'), tag(seg([[70,34],[110,34]], 10), 's'),
      tag(seg([[40,52],[80,52]], 10), 's'), tag(grid(88,48,108,60,8,2), 'a'));
    const teeth = []; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; [-0.17, -0.06, 0.06, 0.17].forEach(da => teeth.push([60 + 27 * Math.cos(a + da), 58 + 27 * Math.sin(a + da)])); }
    const back = [].concat(
      tag(ring(60,58,20,52), 's'), tag(teeth, 's'), tag(ring(60,58,7,16), 's'),
      tag(ring(104,32,11,28), 'a'), tag(ring(104,32,16,12,0.26), 'a'), tag(ring(102,84,8,20), 'a'));
    let db = [];
    [12,36,60].forEach(y => { db = db.concat(tag(seg(rect(38,y,112,y+18), 40, true), 's'), tag([[89,y+9],[91,y+9],[96,y+9],[98,y+9]], 's'), tag([[103,y+9],[105,y+9]], 'a')); });
    db = db.concat(tag(seg([[75,78],[75,90]], 6), 's'), tag(seg([[50,94],[100,94]], 16), 's'));
    const scatter = front.map((p, i) => ({ x: 75 + 66 * Math.cos(i * 2.39), y: 55 + 46 * Math.sin(i * 1.71), k: 's' }));
    this._fsShapes = { scatter, list: [front, back, db] };
    return this._fsShapes;
  }

  lblShapes() {
    if (this._lbl) return this._lbl;
    const F = {
      A: ['01110','10001','10001','11111','10001','10001','10001'], B: ['11110','10001','10001','11110','10001','10001','11110'],
      C: ['01110','10001','10000','10000','10000','10001','01110'], D: ['11110','10001','10001','10001','10001','10001','11110'],
      E: ['11111','10000','10000','11110','10000','10000','11111'], F: ['11111','10000','10000','11110','10000','10000','10000'],
      H: ['10001','10001','10001','11111','10001','10001','10001'], I: ['01110','00100','00100','00100','00100','00100','01110'],
      K: ['10001','10010','10100','11000','10100','10010','10001'], L: ['10000','10000','10000','10000','10000','10000','11111'],
      N: ['10001','11001','10101','10011','10001','10001','10001'], O: ['01110','10001','10001','10001','10001','10001','01110'],
      P: ['11110','10001','10001','11110','10000','10000','10000'], R: ['11110','10001','10001','11110','10100','10010','10001'],
      S: ['01111','10000','10000','01110','00001','00001','11110'], T: ['11111','00100','00100','00100','00100','00100','00100'],
      U: ['10001','10001','10001','10001','10001','10001','01110'], V: ['10001','10001','10001','10001','10001','01010','00100'],
      Y: ['10001','10001','01010','00100','00100','00100','00100'], '-': ['00000','00000','00000','11111','00000','00000','00000']
    };
    const sp = 1.45, cw = 5 * sp + 1.6, top = 113;
    const words = ['FRONT-END', 'BACK-END', 'DATABASE', 'BUILD', 'TEST', 'DEPLOY', 'PLAN', 'SCHEDULE', 'DELIVER'];
    const map = {};
    words.forEach(t => {
      const w = t.length * cw - 1.6 - sp; const x0 = 75 - w / 2; const pts = [];
      t.split('').forEach((ch, ci) => { (F[ch] || []).forEach((row, ry) => row.split('').forEach((v, rx) => { if (v === '1') pts.push([x0 + ci * cw + rx * sp, top + ry * sp]); })); });
      map[t] = pts;
    });
    const M = Math.max.apply(null, words.map(t => map[t].length));
    this._lbl = { map, M };
    return this._lbl;
  }

  xShapes() {
    if (this._xShapes) return this._xShapes;
    const seg = (pts, n, closed) => {
      const P = closed ? pts.concat([pts[0]]) : pts; const L = []; let tot = 0;
      for (let i = 0; i < P.length - 1; i++) { const d = Math.hypot(P[i+1][0]-P[i][0], P[i+1][1]-P[i][1]); L.push(d); tot += d; }
      const out = [];
      for (let k = 0; k < n; k++) {
        let t = closed ? (k / n) * tot : (n === 1 ? 0 : (k / (n - 1)) * tot); let i = 0;
        while (i < L.length - 1 && t > L[i]) { t -= L[i]; i++; }
        const f = L[i] ? Math.min(1, t / L[i]) : 0;
        out.push([P[i][0] + (P[i+1][0]-P[i][0]) * f, P[i][1] + (P[i+1][1]-P[i][1]) * f]);
      }
      return out;
    };
    const rect = (x1, y1, x2, y2) => [[x1,y1],[x2,y1],[x2,y2],[x1,y2]];
    const ring = (cx, cy, rad, n, off) => Array.from({ length: n }, (_, i) => { const a = (off || 0) + i * 2 * Math.PI / n; return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)]; });
    const pick = (arr, n) => Array.from({ length: n }, (_, i) => arr[Math.floor(i * arr.length / n)]);
    const tag = (arr, k) => arr.map(p => ({ x: p[0], y: p[1], k }));
    const dv1 = [].concat(
      tag(seg(rect(18,12,132,98), 84, true), 's'), tag(seg([[18,26],[132,26]], 20), 's'),
      tag([[26,19],[27.5,19],[33,19],[34.5,19],[40,19],[41.5,19]], 'a'),
      tag(seg([[62,44],[48,60],[62,76]], 16), 'a'), tag(seg([[88,44],[102,60],[88,76]], 16), 'a'), tag(seg([[80,40],[70,80]], 18), 'a'));
    const dv2 = [].concat(
      tag(seg(rect(8,38,40,70), 32, true), 's'), tag(seg(rect(59,38,91,70), 32, true), 's'), tag(seg(rect(110,38,142,70), 32, true), 's'),
      tag(seg([[16,54],[22,60],[32,48]], 10), 'a'), tag(seg([[67,54],[73,60],[83,48]], 10), 'a'),
      tag(seg([[126,46],[126,62]], 6), 'a'), tag(seg([[118,54],[134,54]], 6), 'a'),
      tag(seg([[40,54],[59,54]], 8), 's'), tag(seg([[53,49],[59,54],[53,59]], 8), 's'),
      tag(seg([[91,54],[110,54]], 8), 's'), tag(seg([[104,49],[110,54],[104,59]], 8), 's'));
    const circles = [[52,58,18],[80,46,24],[106,60,16]]; const cand = [];
    circles.forEach(([cx, cy, r], ci) => { for (let d = 0; d < 360; d += 2) { const a = d * Math.PI / 180; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
      if (y > 76.01) continue; if (x > 53 && x < 105 && y > 62) continue; if (circles.some(([ox, oy, orr], oi) => oi !== ci && Math.hypot(x-ox, y-oy) < orr - 0.5)) continue; cand.push([x, y]); } });
    cand.sort((p, q) => Math.atan2(p[1]-60, p[0]-80) - Math.atan2(q[1]-60, q[0]-80));
    const dv3 = [].concat(
      tag(pick(cand, 100), 's'), tag(seg([[52,76],[106,76]], 20), 's'),
      tag(seg([[80,92],[80,56]], 14), 'a'), tag(seg([[68,68],[80,56],[92,68]], 14), 'a'), tag(seg([[58,102],[102,102]], 12), 's'));
    const pm1 = [].concat(
      tag(seg(rect(58,10,92,28), 28, true), 'a'), tag(seg([[75,28],[75,40]], 4), 's'), tag(seg([[30,40],[120,40]], 21), 's'),
      tag(seg([[30,41],[30,50]], 3), 's'), tag(seg([[75,41],[75,50]], 3), 's'), tag(seg([[120,41],[120,50]], 3), 's'),
      tag(seg(rect(14,50,46,66), 20, true), 's'), tag(seg(rect(59,50,91,66), 20, true), 's'), tag(seg(rect(104,50,136,66), 20, true), 's'),
      tag(seg([[30,67],[30,76]], 3), 's'), tag(seg(rect(18,76,42,90), 16, true), 'a'),
      tag(seg([[120,67],[120,76]], 3), 's'), tag(seg(rect(108,76,132,90), 16, true), 'a'));
    const pm2 = [].concat(
      tag(seg([[10,10],[10,100],[145,100]], 46), 's'),
      tag(seg(rect(22,20,66,32), 24, true), 's'), tag(seg(rect(48,40,102,52), 28, true), 'a'),
      tag(seg(rect(78,60,118,72), 22, true), 's'), tag(seg(rect(100,80,136,92), 22, true), 'a'),
      tag(seg([[66,26],[75,26],[75,40]], 6), 's'), tag(seg([[102,46],[110,46],[110,60]], 6), 's'), tag(seg([[118,66],[124,66],[124,80]], 6), 's'));
    const pm3 = [].concat(tag(ring(75,55,38,100, -Math.PI/2), 's'), tag(seg([[56,56],[70,70],[96,40]], 60), 'a'));
    this._xShapes = { dv: [dv1, dv2, dv3], pm: [pm1, pm2, pm3] };
    return this._xShapes;
  }
  }

  const start = () => new Portfolio().mount();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
