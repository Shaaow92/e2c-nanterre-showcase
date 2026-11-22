// 1. Preloader rapide (1s) en fondu zoomé
window.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('cinema-intro');
  setTimeout(() => {
    if (intro) intro.classList.add('hide');
    document.body.classList.remove('is-loading');
    document.body.classList.add('loaded');
    startCounters();
  }, 1000);

  document.querySelectorAll('header a[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || link.target === '_blank') return;
      const bar = document.getElementById('scroll-progress');
      if (bar) {
        bar.style.transition = 'width 0.25s ease';
        bar.style.width = '75%';
      }
    });
  });
});

// 2. Bouton Mode Clair / Mode Sombre (mémorisé entre les pages)
const THEME_STORAGE_KEY = 'e2c_night_mode';
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

function applyThemeState(isDark) {
  document.body.classList.toggle('dark-mode', Boolean(isDark));
  if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
  if (themeLabel) themeLabel.textContent = isDark ? 'Mode Clair' : 'Mode Sombre';
}

const savedNightMode = localStorage.getItem(THEME_STORAGE_KEY) === '1';
if (savedNightMode) {
  applyThemeState(true);
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const nextDark = !document.body.classList.contains('dark-mode');
    applyThemeState(nextDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextDark ? '1' : '0');
    } catch (_) {}
  });
}

// 3. Toile d'étoiles et constellations interactives (hors numerique.html et maths.html)
const currentPageName = (window.location.pathname.split('/').pop() || '').toLowerCase();
const isExcludedAtelier = currentPageName === 'numerique.html' || currentPageName === 'maths.html' || currentPageName === 'projet-pro.html';

let canvas = document.getElementById('cinema-canvas') || document.getElementById('stars-canvas');
if (!canvas && !isExcludedAtelier) {
  canvas = document.createElement('canvas');
  canvas.id = 'e2c-constellation-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
}

const ctx = canvas ? canvas.getContext('2d') : null;
let width = window.innerWidth;
let height = window.innerHeight;
let particles = [];
const mouse = { x: -9999, y: -9999 };

function resizeCanvas() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
if (canvas && ctx) {
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
}

class StarNode {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.48;
    this.vy = (Math.random() - 0.5) * 0.48;
    this.baseSize = Math.random() * 2.2 + 0.9;
    this.size = this.baseSize;
    this.twinklePhase = Math.random() * Math.PI * 2;
    this.isOrange = Math.random() > 0.55;
  }
  update(time) {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 185 && dist > 1) {
      const pull = (185 - dist) / 185;
      this.x += (dx / dist) * pull * 1.15;
      this.y += (dy / dist) * pull * 1.15;
      this.size = this.baseSize + pull * 1.6;
    } else {
      this.size += (this.baseSize - this.size) * 0.08;
    }
    this.currentAlpha = 0.45 + 0.45 * Math.sin(time * 0.003 + this.twinklePhase);
  }
  draw() {
    const isDark = document.body.classList.contains('dark-mode');
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.isOrange
      ? `rgba(255, 72, 0, ${Math.min(0.9, this.currentAlpha + 0.15)})`
      : (isDark ? `rgba(255, 255, 255, ${this.currentAlpha * 0.65})` : `rgba(15, 23, 42, ${this.currentAlpha * 0.35})`);
    ctx.fill();
  }
}

if (canvas && ctx && !isExcludedAtelier) {
  const count = Math.min(95, Math.max(48, Math.floor((width * height) / 18000)));
  for (let i = 0; i < count; i++) particles.push(new StarNode());
}

function animateParticles(time = 0) {
  if (!canvas || !ctx || isExcludedAtelier) return;
  ctx.clearRect(0, 0, width, height);
  const isDark = document.body.classList.contains('dark-mode');

  for (let i = 0; i < particles.length; i++) {
    particles[i].update(time);
    particles[i].draw();

    const mdx = mouse.x - particles[i].x;
    const mdy = mouse.y - particles[i].y;
    const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
    if (mdist < 165) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 72, 0, ${0.36 * (1 - mdist / 165)})`;
      ctx.lineWidth = 1.05;
      ctx.moveTo(particles[i].x, particles[i].y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }

    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 130) {
        const alpha = (1 - dist / 130) * (isDark ? 0.24 : 0.16);
        ctx.beginPath();
        ctx.strokeStyle = (particles[i].isOrange || particles[j].isOrange)
          ? `rgba(255, 72, 0, ${alpha * 1.25})`
          : (isDark ? `rgba(255, 255, 255, ${alpha})` : `rgba(15, 23, 42, ${alpha})`);
        ctx.lineWidth = 0.8;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}
if (canvas && ctx) animateParticles();

// 4. Spotlight Curseur, Barre Scroll & Parallaxe géométrique
const spotlight = document.getElementById('cursor-spotlight');
const scrollProgress = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const parallaxItems = document.querySelectorAll('[data-speed]');

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  if (spotlight) {
    spotlight.style.left = `${e.clientX}px`;
    spotlight.style.top = `${e.clientY}px`;
  }
});

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  if (navbar) navbar.classList.toggle('scrolled', scrollTop > 40);

  parallaxItems.forEach(item => {
    const speed = parseFloat(item.dataset.speed || '0');
    item.style.transform = `translateY(${scrollTop * speed}px)`;
  });
});

// 5. Effet Tilt 3D interactif sur les cartes + Halo souris interne
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5.5;
    const rotateY = ((x - centerX) / centerX) * 5.5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  });
});

// 6. Boutons magnétiques
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'translate(0px, 0px)';
  });
});

// 7. Mockups visuels réalistes des 4 logiciels
const toolsData = {
  word: {
    title: "Microsoft Word — Découverte & Création de CV",
    badge: "LES BASES DU TRAITEMENT DE TEXTE",
    description: "En atelier à l'e2c de Nanterre, on commence par apprivoiser Word pas à pas : comprendre l'espace de travail, mettre en forme un texte proprement et créer son premier CV prêt à être envoyé aux entreprises.",
    metrics: [
      { value: "Les Bases", label: "Saisie, polices, alignements & marges" },
      { value: "CV Complet", label: "Mise en page claire et export PDF" }
    ],
    deliverables: [
      "Découvrir les outils essentiels de mise en forme (titres, listes, couleurs)",
      "Structurer les rubriques d'un CV (expérience, formation, compétences)",
      "Enregistrer et exporter son CV en PDF pour ses candidatures"
    ],
    mockupHTML: `
      <div style="font-family: sans-serif;">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #185abd; padding-bottom:8px; margin-bottom:12px;">
          <span style="color:#185abd; font-weight:800; font-size:0.78rem;">APERÇU PAGE A4 • CV WORD</span>
          <span style="font-size:0.74rem; color:#64748b; font-weight:700;">Export PDF prêt</span>
        </div>
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:14px; box-shadow:0 8px 20px rgba(15,23,42,0.08); color:#0f172a;">
          <div style="display:flex; align-items:center; gap:10px; border-bottom:2px solid #eff6ff; padding-bottom:10px; margin-bottom:10px;">
            <div style="width:34px; height:34px; border-radius:50%; background:#185abd; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem;">CV</div>
            <div>
              <div style="font-weight:800; font-size:0.95rem;">Prénom NOM — Stagiaire e2c Nanterre</div>
              <div style="font-size:0.75rem; color:#185abd; font-weight:700;">Recherche de stage • Île-de-France</div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1.4fr; gap:10px; font-size:0.75rem;">
            <div style="background:#f8fafc; padding:8px; border-radius:6px;">
              <div style="font-weight:800; color:#185abd; margin-bottom:4px;">COMPÉTENCES</div>
              <div style="color:#334155;">• Word & Excel<br>• Travail d'équipe<br>• Organisation</div>
            </div>
            <div style="padding:4px;">
              <div style="font-weight:800; color:#185abd; margin-bottom:4px;">EXPÉRIENCES & PARCOURS</div>
              <div style="color:#334155;">Mise en forme propre avec alignements, puces et hiérarchie claire.</div>
            </div>
          </div>
        </div>
      </div>
    `
  },
  excel: {
    title: "Microsoft Excel — Les Bases & Les Tableurs",
    badge: "DÉCOUVERTE DU TABLEUR",
    description: "Excel peut impressionner au début, mais en atelier on dédramatise l'outil : on apprend à se repérer dans une feuille de calcul, créer des tableaux organisés et utiliser les premières formules utiles au quotidien.",
    metrics: [
      { value: "Tableurs", label: "Lignes, colonnes, cellules & bordures" },
      { value: "Calculs", label: "Premières formules (SOMME, MOYENNE)" }
    ],
    deliverables: [
      "Comprendre le fonctionnement d'un classeur et mettre en forme un tableau",
      "Créer un tableur de suivi simple (budget mensuel, planning ou liste)",
      "Automatiser les additions et calculs de base sans se tromper"
    ],
    mockupHTML: `
      <div style="font-family: monospace; color: #0f172a;">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #107c41; padding-bottom:8px; margin-bottom:10px;">
          <span style="color:#107c41; font-weight:800; font-size:0.78rem;">MINI-TABLEUR INTERACTIF</span>
          <span id="excel-formula-bar" style="font-size:0.75rem; background:#ecfdf5; color:#047857; padding:2px 8px; border-radius:4px; font-weight:700;">fx : =SOMME(B2:B4)</span>
        </div>
        <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; font-size:0.78rem; margin-bottom:10px;">
          <div style="display:grid; grid-template-columns:1.5fr 1fr; background:#107c41; color:#fff; font-weight:700; padding:6px 10px;">
            <span>Poste de dépense</span><span>Montant (€)</span>
          </div>
          <div class="excel-cell-btn" onclick="inspectExcelCell('Cellule B2 : 45,00 € (Transport)')" style="display:grid; grid-template-columns:1.5fr 1fr; padding:6px 10px; border-bottom:1px solid #e2e8f0;">
            <span>Pass Navigo / Transport</span><span style="font-weight:700;">45,00 €</span>
          </div>
          <div class="excel-cell-btn" onclick="inspectExcelCell('Cellule B3 : 60,00 € (Repas)')" style="display:grid; grid-template-columns:1.5fr 1fr; padding:6px 10px; border-bottom:1px solid #e2e8f0;">
            <span>Déjeuners atelier</span><span style="font-weight:700;">60,00 €</span>
          </div>
          <div class="excel-cell-btn" onclick="inspectExcelCell('Cellule B5 : =SOMME(B2:B3) → 105,00 €')" style="display:grid; grid-template-columns:1.5fr 1fr; padding:7px 10px; background:#f0fdf4; font-weight:800; color:#107c41;">
            <span>TOTAL AUTOMATIQUE</span><span>105,00 €</span>
          </div>
        </div>
        <div style="font-size:0.72rem; color:#64748b; text-align:right;">Clique sur une ligne du tableau pour voir sa formule</div>
      </div>
    `
  },
  canva: {
    title: "Canva — Présentations & CV Graphiques",
    badge: "CRÉATION VISUELLE & DIAPORAMAS",
    description: "Sur Canva, les stagiaires apprennent à mettre en valeur leurs idées visuellement : créer des diaporamas pour présenter leur projet professionnel à l'oral et concevoir des CV modernes.",
    metrics: [
      { value: "Diaporamas", label: "Présentations orales structurées" },
      { value: "CV Moderne", label: "Design clair, couleurs & icônes" }
    ],
    deliverables: [
      "Réaliser une présentation visuelle pour parler de son parcours ou d'un projet",
      "Créer un CV graphique personnalisé qui attire l'attention",
      "Apprendre à équilibrer le texte, les images et les couleurs sur une page"
    ],
    mockupHTML: `
      <div>
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #00a8b5; padding-bottom:8px; margin-bottom:12px;">
          <span style="color:#0891b2; font-weight:800; font-size:0.78rem;">CANVA • DIAPORAMA & CV DESIGN</span>
          <span style="font-size:0.74rem; color:#64748b; font-weight:700;">16:9 & A4</span>
        </div>
        <div style="display:grid; grid-template-columns:1.3fr 0.7fr; gap:10px;">
          <div style="background:linear-gradient(135deg, #00c4cc, #4b32c3); color:#ffffff; padding:14px; border-radius:10px; display:flex; flex-direction:column; justify-content:space-between;">
            <span style="font-size:0.66rem; letter-spacing:1.2px; opacity:0.85; font-weight:700;">SLIDE 01 • ORAL</span>
            <div style="font-weight:800; font-size:0.95rem; margin:8px 0;">Mon Projet Professionnel</div>
            <span style="font-size:0.7rem; background:rgba(255,255,255,0.2); padding:3px 8px; border-radius:99px; align-self:flex-start;">e2c Nanterre</span>
          </div>
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:10px; padding:10px; text-align:center;">
            <div style="width:24px; height:24px; border-radius:50%; background:#ff4800; margin:0 auto 6px;"></div>
            <div style="font-size:0.72rem; font-weight:800; color:#0f172a;">CV Visuel</div>
            <div style="height:4px; background:#e2e8f0; border-radius:4px; margin:6px 0;"></div>
            <div style="height:4px; background:#00c4cc; border-radius:4px; width:75%; margin:0 auto;"></div>
          </div>
        </div>
      </div>
    `
  },
  capcut: {
    title: "CapCut — Réaliser sa Vidéo en Autonomie",
    badge: "INITIATION & MONTAGE VIDÉO",
    description: "C'est l'aboutissement créatif de l'atelier : après avoir vu les bases du montage, chaque stagiaire a pu concevoir, monter et exporter sa propre vidéo en toute autonomie.",
    metrics: [
      { value: "En Autonomie", label: "De l'idée jusqu'à l'export final" },
      { value: "Montage", label: "Découpage, texte & musique" }
    ],
    deliverables: [
      "Importer ses vidéos et couper les passages inutiles sur la timeline",
      "Ajouter du texte à l'écran, des transitions simples et de la musique",
      "Gérer seul son projet vidéo de A à Z et l'exporter en MP4"
    ],
    mockupHTML: `
      <div>
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #ff4800; padding-bottom:8px; margin-bottom:12px;">
          <span style="color:#ff4800; font-weight:800; font-size:0.78rem;">CAPCUT • TIMELINE ANIMÉE</span>
          <span style="font-size:0.74rem; color:#0f172a; font-weight:700;">1080p MP4</span>
        </div>
        <div style="position:relative; background:#0f172a; padding:14px 12px; border-radius:12px; display:flex; flex-direction:column; gap:8px; overflow:hidden;">
          <div class="capcut-playhead"></div>
          <div style="background:#2563eb; color:#fff; padding:6px 10px; border-radius:6px; font-size:0.74rem; font-weight:700; width:82%; margin-left:10%;">T • Titres & sous-titres</div>
          <div style="background:#ff4800; color:#fff; padding:6px 10px; border-radius:6px; font-size:0.74rem; font-weight:700; width:96%;">🎬 • Séquences découpées en autonomie</div>
          <div style="background:#059669; color:#fff; padding:6px 10px; border-radius:6px; font-size:0.74rem; font-weight:700; width:90%; margin-left:4%;">♪ • Musique de fond synchronisée</div>
        </div>
      </div>
    `
  }
};

window.inspectExcelCell = function(info) {
  const bar = document.getElementById('excel-formula-bar');
  if (bar) bar.textContent = info;
};

// Console interactive
const viewport = document.getElementById('viewport-display');
const tabBtns = document.querySelectorAll('.tab-btn');

function renderTab(toolKey) {
  const data = toolsData[toolKey];
  if (!data || !viewport) return;

  viewport.style.animation = 'none';
  viewport.offsetHeight;
  viewport.style.animation = 'viewportFade 0.4s ease';

  viewport.innerHTML = `
    <div class="vp-info">
      <span class="section-kicker">${data.badge}</span>
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <div class="vp-metrics">
        ${data.metrics.map(m => `
          <div class="vp-metric-box">
            <strong>${m.value}</strong>
            <span>${m.label}</span>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="vp-mockup">
      ${data.mockupHTML}
    </div>
  `;
}

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTab(btn.dataset.tab);
  });
});

renderTab('word');

// Modale détaillée
const modal = document.getElementById('skill-modal');
const modalBody = document.getElementById('modal-body');

function openModal(toolKey) {
  const data = toolsData[toolKey];
  if (!data) return;

  modalBody.innerHTML = `
    <span class="section-kicker">${data.badge}</span>
    <h2 style="font-family:'Space Grotesk',sans-serif; font-size:1.75rem; color:var(--text-main); margin-bottom:1rem;">${data.title}</h2>
    <p style="color:var(--text-body); margin-bottom:1.5rem;">${data.description}</p>
    <h4 style="color:#ff4800; font-size:0.85rem; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:0.8rem;">Ce qu'on apprend en atelier :</h4>
    <ul class="skill-list" style="margin-bottom:0;">
      ${data.deliverables.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// Observer pour animations au scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal-up, .reveal-scale').forEach(el => observer.observe(el));

// Compteurs Hero
function startCounters() {
  document.querySelectorAll('.stat-num').forEach(counter => {
    const target = +counter.getAttribute('data-target');
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 35));
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = current;
      }
    }, 28);
  });
}

// 8. Nadine — Formatrice Numérique (100% visuel, sans son, planche nadine.jpg)
const nadineSpriteEl = document.getElementById('nadine-sprite');
const nadineTextEl = document.getElementById('nadine-text');
const nadineGuideEl = document.getElementById('nadine-guide');
const nadineMoodEl = document.getElementById('nadine-mood');
const nadineNextBtn = document.getElementById('nadine-next');
const nadineToggleBtn = document.getElementById('nadine-toggle');
const nadineAvatarBtn = document.getElementById('nadine-avatar-btn');

let nadineSheetUrl = 'nadine.jpg';
const checkJpeg = new Image();
checkJpeg.onerror = () => { nadineSheetUrl = 'nadine.jpeg'; };
checkJpeg.src = 'nadine.jpg';

const spriteFrames = {
  neutral:    { col: 0, row: 0 },
  happy:      { col: 1, row: 0 },
  talk1:      { col: 2, row: 0 },
  talk2:      { col: 3, row: 0 },
  smileWide:  { col: 4, row: 0 },
  smirk:      { col: 5, row: 0 },
  gentle:     { col: 0, row: 1 },
  excited:    { col: 1, row: 1 },
  wow:        { col: 2, row: 1 },
  laugh:      { col: 3, row: 1 },
  wink:       { col: 4, row: 1 },
  focused:    { col: 5, row: 1 },
  warm:       { col: 0, row: 2 },
  joy:        { col: 1, row: 2 },
  cute:       { col: 2, row: 2 },
  lookLeft:   { col: 3, row: 2 },
  lookRight:  { col: 4, row: 2 },
  surprised:  { col: 5, row: 2 }
};

function renderNadineFace(expression = 'happy', mouthOpen = false) {
  if (!nadineSpriteEl) return;
  const frameKey = mouthOpen
    ? (Math.random() > 0.5 ? 'talk1' : 'talk2')
    : (spriteFrames[expression] ? expression : 'happy');
  const frame = spriteFrames[frameKey];
  const posX = (frame.col / 5) * 100;
  const posY = (frame.row / 2) * 100;
  nadineSpriteEl.style.backgroundImage = `url('${nadineSheetUrl}')`;
  nadineSpriteEl.style.backgroundPosition = `${posX}% ${posY}%`;
}

const nadineScripts = {
  hero: [
    { text: "Bonjour ! Moi c'est Nadine, formatrice numérique à l'e2c de Nanterre. Ici, on apprend sans pression et dans l'entraide !", expr: "excited", mood: "● Bienvenue en atelier" },
    { text: "Même si tu pars de zéro, on avance étape par étape sur Word, Excel, Canva et CapCut jusqu'à ce que tu sois à l'aise.", expr: "happy", mood: "● Progression à ton rythme" }
  ],
  vision: [
    { text: "Mon objectif en atelier avec les stagiaires, c'est que chacun prenne confiance devant l'ordinateur et reparte avec des outils utiles.", expr: "happy", mood: "● Entraide & Bienveillance" }
  ],
  modules: [
    { text: "Voici les 4 logiciels qu'on découvre ensemble : clique sur celui qui t'intéresse pour voir ce qu'on fait concrètement !", expr: "excited", mood: "● Les 4 ateliers" }
  ],
  showcase: [
    { text: "Regarde juste au-dessus : ce sont les vrais exercices réalisés par les stagiaires, du premier CV sur Word jusqu'à la vidéo en autonomie !", expr: "wink", mood: "● Exemples d'atelier" }
  ],
  parcours: [
    { text: "Bravo aux stagiaires de Nanterre ! Voir chacun réussir à monter sa propre vidéo en autonomie sur CapCut, c'est une vraie fierté.", expr: "excited", mood: "● Fierté de l'atelier" }
  ],
  word: [
    { text: "Sur Word, on a découvert le logiciel ensemble et appris toutes les bases de la mise en page pour créer de vrais CV propres !", expr: "happy", mood: "● Atelier Word : Bases & CV" }
  ],
  excel: [
    { text: "Sur Excel, on a pris le temps d'apprendre les bases du tableur : comprendre les cellules, organiser un tableau et faire ses premiers calculs.", expr: "wink", mood: "● Atelier Excel : Tableurs" }
  ],
  canva: [
    { text: "Avec Canva, les stagiaires ont réalisé de super présentations pour l'oral ainsi que des CV modernes et bien structurés !", expr: "excited", mood: "● Atelier Canva : Présentations & CV" }
  ],
  capcut: [
    { text: "Sur CapCut, après avoir vu les bases du montage, chacun a pu créer et exporter sa propre vidéo en totale autonomie !", expr: "excited", mood: "● Atelier CapCut : Autonomie" }
  ]
};

let typingTimer = null;
let mouthTimer = null;
let currentZone = 'hero';
let scriptIndex = 0;

function nadineSpeak(zoneKey, customIndex = null) {
  const list = nadineScripts[zoneKey] || nadineScripts.hero;
  if (customIndex !== null) {
    scriptIndex = customIndex % list.length;
  }
  const entry = list[scriptIndex % list.length];
  currentZone = zoneKey;

  if (nadineMoodEl) nadineMoodEl.textContent = entry.mood;
  clearInterval(typingTimer);
  clearInterval(mouthTimer);

  if (nadineGuideEl) nadineGuideEl.classList.add('talking');
  let i = 0;
  let mouthState = false;
  nadineTextEl.textContent = '';

  mouthTimer = setInterval(() => {
    mouthState = !mouthState;
    renderNadineFace(entry.expr, mouthState);
  }, 130);

  typingTimer = setInterval(() => {
    nadineTextEl.textContent += entry.text.charAt(i);
    i++;
    if (i >= entry.text.length) {
      clearInterval(typingTimer);
      clearInterval(mouthTimer);
      renderNadineFace(entry.expr, false);
      if (nadineGuideEl) nadineGuideEl.classList.remove('talking');
    }
  }, 22);
}

const isTechSubpage = document.body.classList.contains('tech-body');
setTimeout(() => {
  renderNadineFace('excited', false);
  nadineSpeak('hero', 0);
}, isTechSubpage ? 350 : 1150);

if (nadineNextBtn) {
  nadineNextBtn.addEventListener('click', () => {
    scriptIndex++;
    nadineSpeak(currentZone, scriptIndex);
  });
}

if (nadineToggleBtn) {
  nadineToggleBtn.addEventListener('click', () => {
    nadineGuideEl.classList.toggle('minimized');
  });
}

if (nadineAvatarBtn) {
  nadineAvatarBtn.addEventListener('click', () => {
    if (nadineGuideEl.classList.contains('minimized')) {
      nadineGuideEl.classList.remove('minimized');
    }
    scriptIndex++;
    nadineSpeak(currentZone, scriptIndex);
  });
}

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target.id && nadineScripts[entry.target.id]) {
      if (currentZone !== entry.target.id) {
        scriptIndex = 0;
        nadineSpeak(entry.target.id, 0);
      }
    }
  });
}, { threshold: 0.45 });

['hero', 'vision', 'modules', 'showcase', 'parcours'].forEach(id => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

document.querySelectorAll('.tab-btn, .bento-card').forEach(el => {
  el.addEventListener('click', () => {
    const tool = el.dataset.tab || el.dataset.tool;
    if (tool && nadineScripts[tool]) {
      nadineSpeak(tool, 0);
    }
  });
});

// 4. Menu Burger Mobile (3 traits) reprenant les liens de navigation
(function initMobileBurgerMenu() {
  const navContainer = document.querySelector('header .nav-container');
  const navLinks = document.querySelector('header .nav-links');
  if (!navContainer || !navLinks || document.getElementById('mobile-menu-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'mobile-menu-btn';
  btn.type = 'button';
  btn.className = 'mobile-menu-btn';
  btn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '&#9776;';

  const drawer = document.createElement('div');
  drawer.id = 'mobile-nav-drawer';
  drawer.className = 'mobile-nav-drawer';
  drawer.setAttribute('role', 'navigation');

  navLinks.querySelectorAll(':scope > a, :scope > .nav-dropdown').forEach(item => {
    if (item.matches('a')) {
      const a = document.createElement('a');
      a.className = 'mobile-nav-link';
      a.href = item.getAttribute('href') || '#';
      a.textContent = item.textContent.trim();
      drawer.appendChild(a);
    } else if (item.classList.contains('nav-dropdown')) {
      const topLink = item.querySelector(':scope > a.nav-item');
      const subLinks = item.querySelectorAll('.nav-dropdown-menu a');
      if (topLink) {
        const head = document.createElement('a');
        head.className = 'mobile-nav-link';
        head.href = topLink.getAttribute('href') || '#';
        head.textContent = topLink.textContent.replace('▾', '').trim();
        drawer.appendChild(head);
      }
      if (subLinks.length) {
        const subWrap = document.createElement('div');
        subWrap.className = 'mobile-nav-sub';
        subLinks.forEach(sl => {
          const subA = document.createElement('a');
          subA.href = sl.getAttribute('href') || '#';
          subA.textContent = sl.textContent.trim();
          subWrap.appendChild(subA);
        });
        drawer.appendChild(subWrap);
      }
    }
  });

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn && toggleBtn.parentElement === navContainer) {
    navContainer.insertBefore(btn, toggleBtn);
  } else {
    navContainer.appendChild(btn);
  }
  document.body.appendChild(drawer);

  function setOpen(open) {
    drawer.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  btn.addEventListener('click', e => {
    e.stopPropagation();
    setOpen(!drawer.classList.contains('is-open'));
  });

  drawer.addEventListener('click', e => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('click', e => {
    if (!drawer.contains(e.target) && e.target !== btn) setOpen(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setOpen(false);
  });
})();
