import os

directory = 'e2c-nanterre-showcase'
fix_style = """  <style>
    /* Filet de sécurité global pour forcer l'affichage (désactive le blocage opacity:0) */
    .reveal-up, .reveal-scale, .hero-stagger, .line-inner { opacity: 1 !important; transform: none !important; visibility: visible !important; }
  </style>
"""

count = 0
for filename in os.listdir(directory):
    if filename.endswith('.html'):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Si le correctif n'est pas encore présent, on l'injecte juste avant </head>
        if "opacity: 1 !important; transform: none !important; visibility: visible !important;" not in content:
            content = content.replace('</head>', fix_style + '</head>')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1

print(f"Succès : Correctif d'affichage appliqué sur {count} pages HTML.")
