import os
import re

base_dir = 'e2c-nanterre-showcase'

new_navbar = """      <nav class="nav-links" style="gap:1.35rem; white-space:nowrap;">
        <div class="nav-dropdown">
          <a href="qui-sommes-nous.html" class="nav-item">L’E2C92 ▾</a>
          <div class="nav-dropdown-menu">
            <a href="qui-sommes-nous.html" class="dropdown-link">Qui sommes-nous ?</a>
            <a href="chiffres-cles.html" class="dropdown-link">Chiffres clés</a>
            <a href="nous-trouver.html" class="dropdown-link">Nous trouver (Sites 92)</a>
            <a href="formateurs-referents.html" class="dropdown-link">Formateurs-référents</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="formation.html" class="nav-item">Parcours E2C ▾</a>
          <div class="nav-dropdown-menu">
            <a href="formation.html" class="dropdown-link">Se former à l’E2C 92</a>
            <a href="handicap.html" class="dropdown-link">Handicap & Accessibilité</a>
            <a href="paroles-de-stagiaires.html" class="dropdown-link">Paroles de stagiaires</a>
            <a href="numerique.html" class="dropdown-link">Atelier Numérique</a>
            <a href="maths.html" class="dropdown-link">Maths au quotidien</a>
            <a href="communication.html" class="dropdown-link">Communication</a>
            <a href="projet-pro.html" class="dropdown-link">Élaboration projet pro</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a href="nos-partenaires.html" class="nav-item">Entreprises ▾</a>
          <div class="nav-dropdown-menu">
            <a href="pourquoi-sengager.html" class="dropdown-link">Pourquoi s'engager ?</a>
            <a href="comment-agir-avec-le2c-92.html" class="dropdown-link">Agir avec l’E2C 92</a>
            <a href="nos-partenaires.html" class="dropdown-link">Nos partenaires</a>
            <a href="taxe-dapprentissage.html" class="dropdown-link">Taxe d’apprentissage</a>
          </div>
        </div>
        <a href="actualites.html" class="nav-item">Actualités</a>
        <button id="theme-toggle" class="theme-toggle-btn" style="padding:0.45rem 0.65rem;" title="Basculer Mode Clair / Mode Sombre">
          <span id="theme-icon">🌙</span>
        </button>
        <a href="index.html#candidature" class="btn-nav magnetic" style="white-space:nowrap;">S'inscrire →</a>
      </nav>"""

count = 0
for filename in os.listdir(base_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(base_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        content = re.sub(r'<nav class="nav-links".*?</nav>', new_navbar, content, flags=re.DOTALL)
        
        if "taxe-dapprentissage.html" in filename:
            content = re.sub(r'<a href="https://www\.soltea\.education\.gouv\.fr[^"]+" target="_blank"[^>]+>(.*?)</a>',
                             r'<span class="btn-primary" style="display:inline-flex; margin-top:1rem; opacity:0.6; cursor:not-allowed;">Plateforme Soltéa (Portail Externe Désactivé)</span>', 
                             content)
        
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        count += 1

base_html = """<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[TITLE] • E2C92</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    .nav-dropdown { position: relative; display: inline-flex; align-items: center; }
    .nav-dropdown-menu { position: absolute; top: calc(100% + 12px); left: 0; min-width: 240px; background: var(--bg-surface); border: 1.5px solid var(--border-highlight); border-radius: 16px; padding: 0.55rem; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.14); opacity: 0; visibility: hidden; transform: translateY(8px); transition: all 0.25s ease; z-index: 200; display: flex; flex-direction: column; gap: 0.25rem; }
    .nav-dropdown:hover .nav-dropdown-menu, .nav-dropdown:focus-within .nav-dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
    .dropdown-link { padding: 0.55rem 0.85rem; border-radius: 10px; color: var(--text-main); text-decoration: none; font-size: 0.86rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s ease, color 0.2s ease; }
    .dropdown-link:hover { background: var(--e2c-orange-soft); color: var(--e2c-orange); }
  </style>
</head>
<body>
  <header class="navbar" id="navbar">
    <div class="nav-container">
      <a href="index.html" class="brand magnetic">
        <div class="brand-text">
          <span class="brand-title">E2C92</span>
          <span class="brand-sub">HAUTS-DE-SEINE • NANTERRE • CLICHY • BAGNEUX</span>
        </div>
      </a>
""" + new_navbar + """
    </div>
  </header>

  <section class="hero" style="padding-top:10rem; min-height: 40vh;">
    <div class="hero-content">
      <h1 class="hero-title">[TITLE_H1]</h1>
      <p class="hero-desc">[DESC]</p>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:24px; padding:3rem; max-width:900px; margin:0 auto; box-shadow:var(--card-shadow);">
        [CONTENT]
      </div>
    </div>
  </section>
</body>
</html>"""

ps_content = """
<h2 style="font-family:'Space Grotesk', sans-serif; font-size:2rem; margin-bottom:1.5rem; color:var(--text-main);">Un engagement sociétal fort</h2>
<p style="color:var(--text-body); font-size:1.05rem; line-height:1.7; margin-bottom:1.5rem;">S'engager auprès de l'E2C92, c'est participer à la réduction du chômage des jeunes et favoriser l'égalité des chances sur notre territoire. C'est aussi l'opportunité pour votre entreprise de sourcer de nouveaux talents motivés et de répondre à vos besoins en recrutement.</p>
<ul class="skill-list">
  <li><strong>Démarche RSE :</strong> Valorisez l'image citoyenne de votre entreprise.</li>
  <li><strong>Mécénat de compétences :</strong> Impliquez vos collaborateurs dans des actions qui ont du sens.</li>
  <li><strong>Soutien financier :</strong> Contribuez au développement de nos équipements et projets pédagogiques.</li>
</ul>
"""

html_ps = base_html.replace("[TITLE]", "Pourquoi s'engager ?")\
                   .replace("[TITLE_H1]", "POURQUOI <span class=\"gradient-text\">S'ENGAGER ?</span>")\
                   .replace("[DESC]", "Découvrez les bénéfices d'un partenariat avec l'École de la 2ᵉ Chance.")\
                   .replace("[CONTENT]", ps_content)

with open(os.path.join(base_dir, "pourquoi-sengager.html"), "w", encoding="utf-8") as f:
    f.write(html_ps)

actu_content = """
<h2 style="font-family:'Space Grotesk', sans-serif; font-size:2rem; margin-bottom:1.5rem; color:var(--text-main);">Dernières nouvelles du réseau</h2>
<div style="display:grid; gap:1.5rem;">
  <article style="padding:1.5rem; border:1px solid var(--border-subtle); border-radius:16px; background:var(--bg-surface);">
    <span style="font-size:0.85rem; color:var(--e2c-orange); font-weight:700;">OCTOBRE 2026</span>
    <h3 style="margin:0.5rem 0; color:var(--text-main); font-family:'Space Grotesk', sans-serif;">Workshop pédagogique 2026</h3>
    <p style="color:var(--text-body); margin:0;">Renforcer les liens entre pédagogie et entreprise.</p>
  </article>
  <article style="padding:1.5rem; border:1px solid var(--border-subtle); border-radius:16px; background:var(--bg-surface);">
    <span style="font-size:0.85rem; color:var(--e2c-orange); font-weight:700;">SEPTEMBRE 2026</span>
    <h3 style="margin:0.5rem 0; color:var(--text-main); font-family:'Space Grotesk', sans-serif;">Renouvellement du partenariat avec France Travail</h3>
    <p style="color:var(--text-body); margin:0;">Le Réseau E2C France et France Travail consolident leur accompagnement commun.</p>
  </article>
  <article style="padding:1.5rem; border:1px solid var(--border-subtle); border-radius:16px; background:var(--bg-surface);">
    <span style="font-size:0.85rem; color:var(--e2c-orange); font-weight:700;">JUILLET 2026</span>
    <h3 style="margin:0.5rem 0; color:var(--text-main); font-family:'Space Grotesk', sans-serif;">Les tiers-lieux, de nouveaux espaces d'apprentissage</h3>
    <p style="color:var(--text-body); margin:0;">Les stagiaires de l'E2C explorent de nouvelles méthodes de travail pour développer leur autonomie.</p>
  </article>
</div>
"""

html_actu = base_html.replace("[TITLE]", "Actualités")\
                     .replace("[TITLE_H1]", "NOS <span class=\"gradient-text\">ACTUALITÉS</span>")\
                     .replace("[DESC]", "Restez informé des événements et projets de l'E2C92.")\
                     .replace("[CONTENT]", actu_content)

with open(os.path.join(base_dir, "actualites.html"), "w", encoding="utf-8") as f:
    f.write(html_actu)

print(f"Mise à jour réussie : {count} pages HTML ont été rendues 100% autonomes.")
