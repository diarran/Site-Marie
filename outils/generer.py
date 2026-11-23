"""Génère les 4 pages HTML du site à partir de ce fichier.
Usage : python3 outils/generer.py (depuis la racine du dépôt).
Le contenu (soins, textes, communes) se modifie ici, puis on relance le script."""
import pathlib, math, json
OUT = pathlib.Path(__file__).resolve().parent.parent
WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.42 1.32-1.95 1.36-.5.05-.98.23-3.3-.69-2.79-1.1-4.55-3.94-4.69-4.12-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34.18 0 .36 0 .52.01.17.01.39-.06.61.47.23.55.77 1.9.84 2.04.07.14.11.3.02.48-.09.18-.14.29-.27.45-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.07.18-.27.36-.22.61-.13.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.34z"/></svg>'

def wa(label="Prendre rendez-vous sur WhatsApp", soin="", cls="bouton bouton--wa", curseur="WhatsApp"):
    return (f'<a class="{cls}" href="contact.html" data-wa="{soin}" data-curseur="{curseur}" data-aimant>{WA_ICON}'
            f'<span class="roule"><span>{label}</span><span>{label}</span></span></a>')

def defile(mots, sens=1):
    suite = ''.join(f'<span>{m}</span><i>✦</i>' for m in mots)
    return f'<div class="defile" aria-hidden="true" data-r="fondu"><div class="defile__piste" data-sens="{sens}">{suite}{suite}{suite}</div></div>'

def icone(d):
    return f'<svg class="dessine" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true">{d}</svg>'

SOLEIL = icone('<circle cx="16" cy="16" r="6"/>' + ''.join(
    f'<line x1="{16+9*math.cos(a*math.pi/4):.1f}" y1="{16+9*math.sin(a*math.pi/4):.1f}" x2="{16+13*math.cos(a*math.pi/4):.1f}" y2="{16+13*math.sin(a*math.pi/4):.1f}"/>' for a in range(8)))
OEIL = icone('<path d="M3 16c4-6 8.5-9 13-9s9 3 13 9c-4 6-8.5 9-13 9S7 22 3 16z"/><circle cx="16" cy="16" r="4.5"/>')
LUNE = icone('<path d="M21 4.5A12 12 0 1 0 27.5 21 10 10 0 0 1 21 4.5z"/>')
ETOILE = icone('<path d="M16 3l2.6 10.4L29 16l-10.4 2.6L16 29l-2.6-10.4L3 16l10.4-2.6z"/>')

NAV = [("index.html","Accueil"),("soins.html","Les soins"),("a-propos.html","À propos"),("contact.html","Contact")]

SOINS = [
  # >>> SOINS : liste déduite d'une participation au salon bien-être de Varennes-Jarcy (2022). À confirmer avec Marie Ève.
  ("Libération de mémoire cellulaire", "Environ 1 h 15",
   "Un travail en douceur sur ce que le corps garde en mémoire : émotions anciennes, peurs, schémas familiaux qui se répètent. On laisse partir ce qui ne vous appartient plus pour faire de la place à ce que vous choisissez.",
   ["Échange sur ce que vous vivez", "Repérage des mémoires actives", "Libération et apaisement", "Conseils pour les jours suivants"]),
  ("Soin Shamballa", "Environ 1 h",
   "Un soin énergétique complet, reçu allongé et habillé, pour rééquilibrer l’ensemble de vos énergies. Il convient en entretien régulier, après une période éprouvante, ou quand on se sent « à plat ».",
   ["Temps d’accueil et d’intention", "Harmonisation des centres d’énergie", "Relâchement des tensions accumulées", "Retour au calme"]),
  ("Accompagnement Ho’oponopono", "Environ 1 h",
   "Une pratique d’origine hawaïenne de réconciliation et de pardon, avec soi-même et avec les autres. Je vous accompagne pendant la séance et vous repartez avec une pratique simple à poursuivre au quotidien.",
   ["Mise en mots de la situation", "Pratique guidée", "Outils à refaire chez vous"]),
  ("Point Zéro", "Environ 45 min",
   "Un soin de recentrage pour revenir à un état neutre et apaisé : stress, fatigue, sommeil perturbé, période de changement. Il peut se faire seul ou en complément d’un autre soin.",
   ["Détente profonde", "Rééquilibrage", "Ancrage"]),
]

FILTRES = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <filter id="goo"><feGaussianBlur in="SourceGraphic" stdDeviation="14" result="f"/><feColorMatrix in="f" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/></filter>
  <filter id="liquide" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence id="liquide-bruit" type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="3"/><feDisplacementMap id="liquide-dep" in="SourceGraphic" scale="18" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="distorsion" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="turbulence" baseFrequency="0.012 0.04" numOctaves="2" seed="8"/><feDisplacementMap id="distorsion-dep" in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="B"/></filter>
</svg>'''

LOGO = '''<svg class="volets__logo" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56"/><path d="M30 84V38l18 30 18-30v46"/><path d="M90 38H74v46h16M74 61h13M80 28l6-6"/></svg>'''

def page(id_, fichier, titre, description, corps):
    liens = "\n".join(
        f'      <a href="{h}" data-lien{" aria-current=\"page\"" if h==fichier else ""}><span class="roule"><span>{t}</span><span>{t}</span></span></a>' for h,t in NAV)
    liens_mob = "\n".join(f'  <a href="{h}" data-lien{" aria-current=\"page\"" if h==fichier else ""}><span>{t}</span></a>' for h,t in NAV)
    pied_liens = "".join(f'<li><a href="{h}" data-lien>{t}</a></li>' for h,t in NAV)
    return f'''<!DOCTYPE html>
<html lang="fr" class="sans-js" data-theme="clair">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre}</title>
<meta name="description" content="{description}">
<meta name="theme-color" content="#FBF8F4">
<meta property="og:title" content="{titre}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
<script>
(function(d){{d.classList.remove("sans-js");
var calme=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
if(!calme)d.classList.add("js-anim");
try{{var t=localStorage.getItem("me-theme");if(t)d.setAttribute("data-theme",t);
if(sessionStorage.getItem("me-vu")==="1")d.classList.add("deja-vu");}}catch(e){{}}}})(document.documentElement);
</script>
</head>
<body>
{FILTRES}

<div class="chargeur" aria-hidden="true">
  <div class="chargeur__lotus"></div>
  <div class="chargeur__nom">Marie Ève</div>
  <div class="chargeur__metier">Énergéticienne · Brunoy</div>
  <div class="chargeur__compteur">0</div>
  <div class="chargeur__barre"><i></i></div>
</div>
<div class="volets" aria-hidden="true"><i></i><i></i>{LOGO}<div class="volets__titre"></div></div>
<div class="barre-chargement" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>
<div class="projecteur" aria-hidden="true"></div>
<canvas class="trainee" aria-hidden="true"></canvas>
<div class="curseur" aria-hidden="true"><span class="curseur__anneau"><em class="curseur__texte"></em></span><span class="curseur__point"></span></div>
<div class="progression" aria-hidden="true"></div>
<nav class="reperes" aria-label="Position dans la page"></nav>

<header class="entete">
  <div class="conteneur">
    <a class="marque" href="index.html" data-lien data-curseur="Accueil">
      <strong>Marie Ève Kaya Lopez</strong>
      <span>Énergéticienne · Brunoy</span>
    </a>
    <nav class="menu" id="menu" aria-label="Navigation principale">
{liens}
      <span class="menu__indic" aria-hidden="true"></span>
    </nav>
    <div class="outils">
      <button class="outil outil--theme" type="button" aria-label="Changer de mode clair ou sombre" data-curseur="Mode"><svg class="soleil" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="lune" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg></button>
      <button class="outil outil--son" type="button" aria-pressed="false" aria-label="Activer les sons" data-curseur="Son"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10v4h4l5 4V6L8 10H4z"/><path class="onde-son" d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg></button>
      {wa("Rendez-vous", cls="bouton bouton--wa bouton--entete")}
      <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="menu-mobile" aria-label="Ouvrir le menu"><i></i><i></i><i></i></button>
    </div>
  </div>
</header>

<div class="menu-mobile" id="menu-mobile">
{liens_mob}
  {wa("Prendre rendez-vous")}
  <p>Séances à domicile, Brunoy et alentour</p>
</div>

<main id="contenu" data-page="{id_}">
{corps}
</main>

<footer class="pied">
  <div class="pied__geant" aria-hidden="true">Marie <em>Ève</em></div>
  <div class="conteneur">
    <div>
      <h3>Marie Ève Kaya Lopez</h3>
      <p>Énergéticienne. Soins énergétiques à domicile à Brunoy et dans les communes voisines du Val d’Yerres.</p>
      <button class="haut" type="button" data-curseur="Haut">Revenir en haut ↑</button>
    </div>
    <div>
      <h3>Le site</h3>
      <ul>{pied_liens}</ul>
    </div>
    <div>
      <h3>Rendez-vous</h3>
      <ul>
        <li>Sur WhatsApp uniquement</li>
        <li>Séances à domicile</li>
        <li><a href="contact.html" data-lien>Écrire un message</a></li>
      </ul>
    </div>
    <div class="pied__bas">
      <span>© <span id="annee">2026</span> Marie Ève Kaya Lopez</span>
      <span>Les soins énergétiques ne remplacent pas un avis ou un traitement médical.</span>
    </div>
  </div>
</footer>

<a class="flottant" href="contact.html" data-wa="" data-curseur="WhatsApp" aria-label="Écrire à Marie Ève sur WhatsApp">{WA_ICON}</a>

<div class="toast" role="status" aria-live="polite"><strong></strong><span></span><button class="toast__fermer" type="button" aria-label="Fermer">×</button><i class="toast__temps"></i></div>

<div class="modale" role="dialog" aria-modal="true" aria-labelledby="modale-titre">
  <div class="modale__fond" data-fermer></div>
  <div class="modale__boite"><button class="modale__fermer" type="button" data-fermer aria-label="Fermer">×</button><div class="modale__contenu"></div></div>
</div>

<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/vendor/split-type.min.js"></script>
<script src="assets/vendor/lenis.min.js"></script>
<script src="assets/soins-data.js"></script>
<script src="assets/main.js"></script>
<script src="assets/lotus.js"></script>
<script src="assets/scene3d.js"></script>
<script src="assets/experience.js"></script>
</body>
</html>
'''

def recit_illu(n):
    if n == 1:  # téléphone + bulle
        return '<svg viewBox="0 0 160 120"><rect x="20" y="10" width="54" height="100" rx="10"/><line x1="40" y1="20" x2="54" y2="20"/><path d="M86 30h56a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8h-36l-14 12v-12h-6a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z"/><line x1="98" y1="44" x2="134" y2="44"/><line x1="98" y1="56" x2="122" y2="56"/></svg>'
    if n == 2:  # maison
        return '<svg viewBox="0 0 160 120"><path d="M30 60L80 18l50 42"/><path d="M42 52v56h76V52"/><rect x="70" y="76" width="20" height="32"/><rect x="50" y="64" width="14" height="14"/><rect x="96" y="64" width="14" height="14"/><path d="M110 30v-12h10v20"/></svg>'
    if n == 4:  # soleil levant
        return '<svg viewBox="0 0 160 120"><path d="M20 90h120"/><path d="M45 90a35 35 0 0 1 70 0"/>' + ''.join(
            f'<line x1="{80+44*math.cos(math.radians(a)):.1f}" y1="{90-44*math.sin(math.radians(a)):.1f}" x2="{80+58*math.cos(math.radians(a)):.1f}" y2="{90-58*math.sin(math.radians(a)):.1f}"/>' for a in range(20,170,25)) + '<path d="M40 104h80M60 114h40"/></svg>'
    return '<div class="recit__lotus" data-lotus></div>'

RECIT = [
  ("Vous m’écrivez", "Un clic sur « Prendre rendez-vous » ouvre WhatsApp. Dites-moi ce que vous traversez et vos disponibilités."),
  ("Je viens chez vous", "Nous fixons un créneau. Vous n’avez rien à préparer, seulement un endroit calme où vous allonger."),
  ("Le soin", "Allongé·e et habillé·e, vous vous laissez aller. Je travaille en douceur sur vos énergies, à votre rythme."),
  ("Et après", "Je vous partage ce que j’ai perçu et quelques conseils simples pour les jours qui suivent."),
]

def scene_portrait(texte=True, cercle=True):
    c = '''<svg class="cercle-texte" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="cercle-chemin" d="M100,100 m-88,0 a88,88 0 1,1 176,0 a88,88 0 1,1 -176,0"/></defs><text><textPath href="#cercle-chemin">Énergéticienne · À domicile · Brunoy · Val d’Yerres · </textPath></text></svg>''' if cercle else ''
    return f'''<div class="scene" data-profondeur="-18">
      <div class="aura" aria-hidden="true"></div>
      <div class="gouttes" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      {c}
      <!-- >>> PHOTO : remplacer .portrait__image par <img class="portrait__image" src="assets/marie-eve.jpg" alt="Marie Ève Kaya Lopez"> -->
      <div class="portrait" role="img" aria-label="Emplacement de la photo de Marie Ève" data-curseur="Respirer" data-relief>
        <div class="portrait__image"></div>
        <div><span>M È</span>Photo de Marie Ève<br>à ajouter</div>
        <i class="portrait__reflet"></i>
      </div>
    </div>'''

# ---------------------------------------------------------------- ACCUEIL
cartes_soins = "".join(f'''
      <article class="carte" data-r="{'gauche' if i%2==0 else 'droite'}" data-relief data-curseur="Détails">
        <i class="carte__reflet"></i><span class="num">0{i+1}</span><h3>{s[0]}</h3><p>{s[2].split(". ")[0]}.</p>
        <button class="ouvrir" type="button" data-modale="{i}">En savoir plus →</button>
      </article>''' for i,s in enumerate(SOINS))

panneaux = "".join(f'''
        <article class="recit__panneau">
          <span class="recit__num">0{i+1}</span>
          <div class="recit__illu">{recit_illu(i+1)}</div>
          <h3>{t}</h3><p>{p}</p>
        </article>''' for i,(t,p) in enumerate(RECIT))

accueil = f'''
<section class="ouverture ouverture--accueil" data-repere="Accueil">
  <canvas class="scene3d" aria-hidden="true"></canvas>
  <div class="halo halo--1" aria-hidden="true"></div><div class="halo halo--2" aria-hidden="true"></div>
  <div class="conteneur">
    <div class="ouverture__texte">
      <span class="surtitre" data-r="masque">Énergéticienne à domicile, Brunoy</span>
      <h1 class="titre-xxl" data-xxl>
        <span class="ligne">Retrouver</span>
        <span class="ligne"><span class="mot-change" data-mots="l’équilibre|la sérénité|votre élan|la clarté"><span class="italique">l’équilibre</span></span></span>
        <span class="ligne"><em class="degrade-anime">chez vous</em>.</span>
      </h1>
      <p class="chapeau" data-r="monte">Je suis Marie Ève Kaya Lopez, énergéticienne. Je me déplace à votre domicile, à Brunoy et alentour, pour des soins énergétiques qui aident à relâcher les tensions, lever les blocages et retrouver de l’élan.</p>
      <div class="actions" data-r="monte">
        {wa()}
        <a class="lien-fleche" href="soins.html" data-lien data-curseur="Voir">Découvrir les soins</a>
      </div>
      <p class="lieu" data-r="fondu">Séances à domicile, Brunoy et communes voisines</p>
    </div>
    {scene_portrait()}
  </div>
  <a class="descendre" href="#manifeste" aria-label="Faire défiler"><span></span></a>
</section>

{defile(["Apaiser","Libérer","Rayonner","Se recentrer","Respirer","Renaître"])}

<section class="manifeste" id="manifeste" data-repere="Manifeste">
  <div class="conteneur">
    <span class="surtitre" data-r="masque">Mon approche</span>
    <!-- >>> TEXTE PROVISOIRE : à valider avec Marie Ève -->
    <p class="texte-revele" data-revele>Prendre soin de son énergie, c’est s’offrir un moment pour soi. Je viens chez vous, dans un lieu que vous connaissez, pour vous aider à relâcher ce qui pèse et à retrouver votre propre élan, en douceur et sans jugement.</p>
  </div>
</section>

<section class="intentions fond-anime" aria-label="Ce que les soins vous apportent" data-repere="Bienfaits">
  <div class="conteneur">
    <ul>
      <li data-r="descend" data-relief><div class="neumo">{SOLEIL}</div><strong>Apaiser</strong><p>Relâcher le stress et les tensions accumulées.</p></li>
      <li data-r="descend" data-relief><div class="neumo">{OEIL}</div><strong>Comprendre</strong><p>Mettre des mots sur ce qui bloque.</p></li>
      <li data-r="descend" data-relief><div class="neumo">{LUNE}</div><strong>Libérer</strong><p>Laisser partir les mémoires qui pèsent.</p></li>
      <li data-r="descend" data-relief><div class="neumo">{ETOILE}</div><strong>Rayonner</strong><p>Retrouver de l’élan et de la clarté.</p></li>
    </ul>
  </div>
</section>

<section class="section" data-repere="Pour qui">
  <div class="liquide-fond" aria-hidden="true"><i></i><i></i></div>
  <div class="conteneur">
    <div class="entete-section">
      <span class="surtitre" data-r="masque">Pour qui ?</span>
      <h2 data-titre>Quand le corps et l’esprit <em>demandent une pause</em></h2>
      <p class="chapeau" data-r="monte">Les soins énergétiques accompagnent celles et ceux qui traversent une période difficile ou qui sentent que quelque chose les freine, sans toujours pouvoir dire quoi.</p>
    </div>
    <div class="grille grille-3">
      <div class="carte" data-r="zoom" data-relief data-curseur="Ressentir"><i class="carte__reflet"></i><span class="num">i.</span><h3>Fatigue et stress</h3><p>Un épuisement qui dure, un sommeil agité, l’impression de ne jamais vraiment se reposer.</p></div>
      <div class="carte" data-r="zoom" data-relief data-curseur="Ressentir"><i class="carte__reflet"></i><span class="num">ii.</span><h3>Blocages qui se répètent</h3><p>Les mêmes situations reviennent dans votre vie personnelle, affective ou professionnelle.</p></div>
      <div class="carte" data-r="zoom" data-relief data-curseur="Ressentir"><i class="carte__reflet"></i><span class="num">iii.</span><h3>Périodes de changement</h3><p>Deuil, séparation, déménagement, nouveau départ : un soutien pour traverser et se réaligner.</p></div>
    </div>
  </div>
</section>

<section class="recit" data-repere="Le déroulement" data-recit>
  <div class="recit__epingle">
    <div class="rayons" aria-hidden="true"></div>
    <div class="recit__entete">
      <div><span class="surtitre">Le déroulement</span><h2>Un rendez-vous <em>simple</em>, en quatre temps</h2></div>
      <div class="recit__barre" aria-hidden="true"><i></i></div>
    </div>
    <div class="recit__piste">{panneaux}
    </div>
  </div>
</section>

<section class="section" data-repere="En bref">
  <div class="conteneur">
    <div class="entete-section">
      <span class="surtitre" data-r="masque">En bref</span>
      <h2 data-titre>L’essentiel <em>en quelques chiffres</em></h2>
    </div>
    <!-- >>> CHIFFRES : tirés du contenu du site, à mettre à jour si les soins ou la zone changent -->
    <div class="chiffres">
      <div class="chiffre" data-r="monte"><span class="compteur" data-compte="4">0</span><p>soins énergétiques proposés</p><div class="jauge" style="--v:100%"><i></i></div></div>
      <div class="chiffre" data-r="monte"><span class="compteur" data-compte="8">0</span><p>communes autour de Brunoy</p><div class="jauge" style="--v:80%"><i></i></div></div>
      <div class="chiffre" data-r="monte"><span class="compteur" data-compte="60" data-suffixe=" min">0</span><p>environ par séance</p><div class="jauge" style="--v:60%"><i></i></div></div>
      <div class="chiffre" data-r="monte"><span class="compteur" data-compte="0" data-depart="30" data-suffixe=" km">30</span><p>à faire pour vous : je viens chez vous</p><div class="jauge" style="--v:4%"><i></i></div></div>
    </div>
  </div>
</section>

<div class="titre-glisse" aria-hidden="true" data-glisse="-1">Énergie · <em>Équilibre</em> · Lumière · <em>Sérénité</em> ·</div>

<section class="section section--sable" data-repere="Les soins">
  <div class="conteneur">
    <div class="entete-section">
      <span class="surtitre" data-r="masque">Les soins</span>
      <h2 data-titre>Quatre <em>accompagnements</em></h2>
    </div>
    <div class="grille grille-2">{cartes_soins}
    </div>
    <div class="actions" data-r="zoom"><a class="bouton bouton--clair" href="soins.html" data-lien data-aimant data-curseur="Voir"><span class="roule"><span>Voir le détail des soins</span><span>Voir le détail des soins</span></span></a></div>
  </div>
</section>

<div class="titre-glisse titre-glisse--2" aria-hidden="true" data-glisse="1">Brunoy · Yerres · Montgeron · Épinay-sous-Sénart · Villecresnes ·</div>

<section class="transfo" data-transfo data-repere="Rendez-vous">
  <div class="transfo__epingle">
    <div class="conteneur transfo__zone">
      <div class="grille grille-2" style="align-items:center">
        <div>
          <span class="surtitre">Zone d’intervention</span>
          <h2>Je me déplace <em>chez vous</em></h2>
          <!-- >>> ZONE : liste de communes à confirmer avec Marie Ève -->
          <p>Les séances ont lieu à votre domicile, à Brunoy et dans les communes voisines. Pour une autre commune, écrivez-moi : nous verrons ensemble ce qui est possible.</p>
        </div>
        <ul class="communes">
          <li>Brunoy</li><li>Yerres</li><li>Boussy-Saint-Antoine</li><li>Épinay-sous-Sénart</li><li>Quincy-sous-Sénart</li><li>Montgeron</li><li>Mandres-les-Roses</li><li>Villecresnes</li>
        </ul>
      </div>
    </div>
    <div class="transfo__cercle" aria-hidden="true"></div>
    <div class="transfo__appel">
      <canvas class="etincelles" aria-hidden="true"></canvas>
      <div class="conteneur etroit">
        <span class="surtitre" style="color:#FFF3DA">Prendre rendez-vous</span>
        <h2>Et si vous preniez <em>un moment pour vous</em> ?</h2>
        <p class="chapeau">Écrivez-moi directement sur WhatsApp. Je vous réponds personnellement pour convenir d’un créneau.</p>
        <div class="actions">{wa()}</div>
      </div>
    </div>
  </div>
</section>
'''

# ---------------------------------------------------------------- SOINS
def bloc_soin(i, s):
    nom, duree, texte, points = s
    lis = "".join(f"<li>{p}</li>" for p in points)
    return f'''
    <article class="soin soin--pile" id="soin-{i+1}">
      <div class="soin__visuel" data-curseur="Respirer"><div class="portrait__image"></div><b>0{i+1}</b></div>
      <div>
        <h2 style="font-size:clamp(1.7rem,3vw,2.4rem)">{nom}</h2>
        <p>{texte}</p>
        <ul>{lis}</ul>
      </div>
      <aside class="soin__infos">
        <!-- >>> DURÉE ET TARIF : à confirmer avec Marie Ève -->
        <dl>
          <dt>Durée</dt><dd>{duree}</dd>
          <dt>Lieu</dt><dd>À votre domicile</dd>
          <dt>Tarif</dt><dd>Communiqué sur WhatsApp</dd>
        </dl>
        {wa("Réserver ce soin", soin=nom, curseur="Réserver")}
      </aside>
    </article>'''

FAQ = [
  ("Dois-je préparer quelque chose ?", "Non. Il suffit d’un endroit calme où vous pouvez vous allonger. Prévoyez des vêtements confortables."),
  ("Comment prendre rendez-vous ?", "Uniquement sur WhatsApp : chaque bouton « Prendre rendez-vous » du site ouvre la conversation avec un message déjà prêt."),
  ("Les soins remplacent-ils un suivi médical ?", "Non. Les soins énergétiques sont un accompagnement complémentaire. Ne modifiez jamais un traitement sans l’avis de votre médecin."),
  ("Dans quelles communes vous déplacez-vous ?", "À Brunoy et dans les communes voisines du Val d’Yerres. Pour une autre commune, écrivez-moi."),
]
faq = "".join(f'<details data-r="monte"><summary data-curseur="Ouvrir">{q}<span class="plus" aria-hidden="true"></span></summary><div class="faq__corps"><p>{r}</p></div></details>' for q,r in FAQ)

soins = f'''
<section class="ouverture ouverture--page" data-repere="Les soins">
  <canvas class="scene3d" aria-hidden="true" data-cristal-droite></canvas>
  <div class="halo halo--1" aria-hidden="true"></div><div class="halo halo--2" aria-hidden="true"></div>
  <div class="conteneur">
    <span class="surtitre" data-r="masque">Les soins</span>
    <h1 class="titre-xxl" data-xxl><span class="ligne">Des soins</span><span class="ligne"><em class="degrade-anime">sur mesure</em>,</span><span class="ligne">à domicile</span></h1>
    <p class="chapeau" data-r="monte">Chaque séance s’adapte à ce que vous vivez au moment où nous nous voyons. Les durées sont indicatives et nous choisissons ensemble le soin le plus juste lors de la prise de contact.</p>
  </div>
</section>

{defile(["Mémoire cellulaire","Shamballa","Ho’oponopono","Point Zéro"])}

<section class="section" style="padding-top:60px" data-repere="Le détail">
  <div class="conteneur pile">{"".join(bloc_soin(i,s) for i,s in enumerate(SOINS))}
    <p class="avertissement" data-r="gauche">Les soins énergétiques sont un accompagnement complémentaire. Ils ne remplacent en aucun cas un diagnostic, un avis ou un traitement médical. Ne modifiez jamais un traitement en cours sans l’avis de votre médecin.</p>
  </div>
</section>

<section class="section section--sable" data-repere="Questions">
  <div class="liquide-fond" aria-hidden="true"><i></i><i></i></div>
  <div class="conteneur">
    <div class="entete-section"><span class="surtitre" data-r="masque">Questions fréquentes</span><h2 data-titre>Vous vous <em>demandez</em>…</h2></div>
    <div class="faq">{faq}</div>
  </div>
</section>

<section class="section section--nuit bandeau" data-repere="Rendez-vous">
  <div class="rayons" aria-hidden="true"></div>
  <canvas class="etincelles" aria-hidden="true"></canvas>
  <div class="conteneur etroit">
    <h2 data-titre>Vous hésitez entre <em>deux soins</em> ?</h2>
    <p class="chapeau" data-r="monte">Décrivez-moi simplement ce que vous ressentez, je vous orienterai vers le soin le plus adapté.</p>
    <div class="actions" data-r="zoom">{wa("Me demander conseil sur WhatsApp")}</div>
  </div>
</section>
'''

# ---------------------------------------------------------------- À PROPOS
fleur = '<svg class="fleur dessine" viewBox="0 0 200 200" aria-hidden="true" data-fleur>' + '<circle cx="100" cy="100" r="30"/>' + ''.join(
    f'<circle cx="{100+30*math.cos(math.radians(a)):.2f}" cy="{100+30*math.sin(math.radians(a)):.2f}" r="30"/>' for a in range(0,360,60)) + ''.join(
    f'<circle cx="{100+52*math.cos(math.radians(a)):.2f}" cy="{100+52*math.sin(math.radians(a)):.2f}" r="30"/>' for a in range(30,390,60)) + '<circle cx="100" cy="100" r="90"/><circle cx="100" cy="100" r="96"/></svg>'

apropos = f'''
<section class="ouverture ouverture--page" data-repere="À propos">
  <div class="halo halo--1" aria-hidden="true"></div><div class="halo halo--2" aria-hidden="true"></div>
  {fleur}
  <div class="conteneur">
    <span class="surtitre" data-r="masque">À propos</span>
    <h1 class="titre-xxl" data-xxl><span class="ligne">Marie Ève</span><span class="ligne"><em class="degrade-anime">Kaya Lopez</em></span></h1>
    <p class="chapeau" data-r="monte">Énergéticienne installée à Brunoy, j’accompagne les personnes qui souhaitent se libérer de ce qui leur pèse et retrouver un équilibre intérieur.</p>
  </div>
</section>

<section class="section" data-repere="Mon histoire">
  <div class="conteneur">
    <div class="grille grille-2" style="align-items:center">
      <div class="devoile-cadre" data-devoile>{scene_portrait(cercle=False)}</div>
      <div>
        <span class="surtitre" data-r="masque">Mon chemin</span>
        <!-- >>> PARCOURS : texte provisoire, à réécrire avec le vrai parcours et les formations de Marie Ève -->
        <p class="texte-revele" data-revele style="font-size:clamp(1.5rem,2.6vw,2.2rem)">Mon chemin vers les soins énergétiques est né d’une sensibilité et d’une écoute : celle de ce que le corps exprime quand les mots ne suffisent plus.</p>
        <p data-r="monte">Au fil des années et des formations, j’ai développé une pratique douce et attentive, que j’ai choisi d’exercer à domicile pour que chacun puisse recevoir son soin dans un cadre familier, sans avoir à se déplacer.</p>
        <p data-r="monte">Je ne promets pas de miracle. Je m’engage à être pleinement présente, à vous écouter sans jugement et à vous accompagner à votre rythme.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section--sable fond-anime" data-repere="Pourquoi à domicile">
  <div class="conteneur">
    <div class="grille grille-2">
      <div>
        <span class="surtitre" data-r="masque">Pourquoi à domicile ?</span>
        <h2 data-titre>Le soin vient <em>à vous</em></h2>
        <p data-r="monte">Recevoir un soin chez soi, c’est éviter le trajet, rester dans un lieu où l’on se sent en sécurité et pouvoir se reposer tout de suite après. C’est aussi plus simple pour les personnes âgées, fatiguées ou peu mobiles, et pour les parents qui ne peuvent pas facilement s’absenter.</p>
      </div>
      <!-- >>> FORMATIONS : à compléter (intitulés, organismes, années) -->
      <div class="carte" data-r="droite" data-relief><i class="carte__reflet"></i>
        <span class="num">Formations</span>
        <h3>Mon parcours</h3>
        <p class="note">Cette partie attend les formations et certifications de Marie Ève (intitulés, organismes, années).</p>
      </div>
    </div>
  </div>
</section>

<section class="section" data-repere="Engagements">
  <div class="liquide-fond" aria-hidden="true"><i></i><i></i></div>
  <div class="conteneur">
    <div class="entete-section"><span class="surtitre" data-r="masque">Mes engagements</span><h2 data-titre>Un cadre <em>clair et respectueux</em></h2></div>
    <div class="grille grille-2">
      <div class="carte" data-r="gauche" data-relief><i class="carte__reflet"></i><h3>Complémentaire de la médecine</h3><p>Mon accompagnement ne remplace jamais un avis, un diagnostic ou un traitement médical.</p></div>
      <div class="carte" data-r="droite" data-relief><i class="carte__reflet"></i><h3>Respect de votre libre arbitre</h3><p>Rien n’est fait sans votre accord, et vous restez libre d’arrêter à tout moment.</p></div>
      <div class="carte" data-r="gauche" data-relief><i class="carte__reflet"></i><h3>Confidentialité</h3><p>Ce qui se dit pendant la séance reste entre nous.</p></div>
      <div class="carte" data-r="droite" data-relief><i class="carte__reflet"></i><h3>Honnêteté</h3><p>Si votre situation relève d’un autre professionnel, je vous le dirai et je vous orienterai.</p></div>
    </div>
  </div>
</section>

<section class="section section--nuit bandeau" data-repere="Rendez-vous">
  <div class="rayons" aria-hidden="true"></div>
  <canvas class="etincelles" aria-hidden="true"></canvas>
  <div class="conteneur etroit">
    <h2 data-titre>Faisons <em>connaissance</em></h2>
    <p class="chapeau" data-r="monte">Une question avant de réserver ? Écrivez-moi, je vous réponds avec plaisir.</p>
    <div class="actions" data-r="zoom">{wa("Écrire sur WhatsApp")}</div>
  </div>
</section>
'''

# ---------------------------------------------------------------- CONTACT
options = "".join(f'<option>{s[0]}</option>' for s in SOINS)
OK = '<svg class="ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
contact = f'''
<section class="ouverture ouverture--page" data-repere="Contact">
  <canvas class="scene3d" aria-hidden="true" data-cristal-droite></canvas>
  <div class="halo halo--1" aria-hidden="true"></div><div class="halo halo--2" aria-hidden="true"></div>
  <div class="conteneur">
    <span class="surtitre" data-r="masque">Contact et rendez-vous</span>
    <h1 class="titre-xxl" data-xxl><span class="ligne">Prendre</span><span class="ligne"><em class="degrade-anime">rendez-vous</em></span></h1>
    <p class="chapeau" data-r="monte">Les rendez-vous se prennent sur WhatsApp. Le plus simple : cliquez sur le bouton. Vous pouvez aussi remplir le petit formulaire ci-dessous, qui prépare le message pour vous.</p>
    <div class="actions" data-r="monte">{wa()}</div>
  </div>
</section>

<section class="section" style="padding-top:30px" data-repere="Formulaire">
  <div class="conteneur">
    <div class="grille grille-2" style="align-items:start">
      <form class="formulaire" id="formulaire" novalidate data-r="gauche">
        <h2 style="font-size:2rem" data-titre>Préparer <em>mon message</em></h2>
        <div class="champs-2">
          <div class="champ champ--flottant"><input id="prenom" name="prenom" autocomplete="given-name" required placeholder=" "><label for="prenom">Prénom *</label><i class="champ__ligne"></i>{OK}<div class="msg">Indiquez votre prénom.</div></div>
          <div class="champ champ--flottant"><input id="commune" name="commune" placeholder=" "><label for="commune">Votre commune</label><i class="champ__ligne"></i>{OK}</div>
        </div>
        <div class="champ"><label for="soin">Soin souhaité</label>
          <select id="soin" name="soin"><option value="">Je ne sais pas encore</option>{options}</select><i class="champ__ligne"></i></div>
        <div class="champ champ--flottant"><input id="dispos" name="dispos" placeholder=" "><label for="dispos">Vos disponibilités (ex. mardi après-midi)</label><i class="champ__ligne"></i>{OK}</div>
        <div class="champ champ--flottant"><textarea id="message" name="message" placeholder=" "></textarea><label for="message">Quelques mots sur ce que vous traversez</label><i class="champ__ligne"></i></div>
        <button class="bouton bouton--wa" type="submit" data-aimant data-curseur="Envoyer">{WA_ICON}<span class="roule"><span>Envoyer sur WhatsApp</span><span>Envoyer sur WhatsApp</span></span></button>
        <p class="note" style="margin-top:14px">Aucune donnée n’est enregistrée sur ce site : le formulaire ouvre simplement WhatsApp avec votre message prêt à envoyer.</p>
      </form>
      <div>
        <div class="recit__lotus" data-lotus style="width:140px;margin:-20px 0 10px" aria-hidden="true"></div>
        <h2 style="font-size:2rem" data-titre>Informations <em>pratiques</em></h2>
        <ul class="coordonnees">
          <!-- >>> COORDONNÉES : horaires et zone à confirmer -->
          <li data-r="droite"><strong>Rendez-vous</strong>Sur WhatsApp uniquement</li>
          <li data-r="droite"><strong>Lieu des séances</strong>À votre domicile</li>
          <li data-r="droite"><strong>Zone</strong>Brunoy et communes voisines (Yerres, Boussy-Saint-Antoine, Épinay-sous-Sénart, Montgeron…)</li>
          <li data-r="droite"><strong>Horaires</strong>Sur rendez-vous, du lundi au samedi</li>
          <li data-r="droite"><strong>Réponse</strong>Je vous réponds personnellement, en général dans la journée</li>
        </ul>
        <p class="avertissement" data-r="gauche">Les soins énergétiques ne remplacent pas un suivi médical. En cas d’urgence, appelez le 15.</p>
      </div>
    </div>
  </div>
</section>
'''

pages = [
  ("accueil","index.html","Marie Ève Kaya Lopez — Énergéticienne à domicile à Brunoy","Soins énergétiques à domicile à Brunoy et alentour (Essonne). Rendez-vous sur WhatsApp avec Marie Ève Kaya Lopez, énergéticienne.",accueil),
  ("soins","soins.html","Les soins — Marie Ève Kaya Lopez, énergéticienne à Brunoy","Libération de mémoire cellulaire, soin Shamballa, Ho’oponopono, Point Zéro : des soins énergétiques à domicile à Brunoy.",soins),
  ("apropos","a-propos.html","À propos — Marie Ève Kaya Lopez, énergéticienne à Brunoy","Qui est Marie Ève Kaya Lopez, énergéticienne qui se déplace à domicile à Brunoy et dans le Val d’Yerres.",apropos),
  ("contact","contact.html","Contact et rendez-vous — Marie Ève Kaya Lopez","Prendre rendez-vous sur WhatsApp pour un soin énergétique à domicile à Brunoy.",contact),
]
for id_,f,t,d,c in pages:
    (OUT/f).write_text(page(id_,f,t,d,c), encoding="utf-8")

# Données des soins pour la fenêtre de détail
(OUT/"assets"/"soins-data.js").write_text("window.SOINS = " + json.dumps([{"nom":s[0],"duree":s[1],"texte":s[2],"points":s[3]} for s in SOINS], ensure_ascii=False) + ";\n", encoding="utf-8")
print("ok")
