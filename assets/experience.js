/* ==========================================================================
   EXPÉRIENCE — orchestration du motion design
   GSAP + ScrollTrigger · Lenis · SplitType · Three.js · Lottie · SVG
   ========================================================================== */
(function () {
  "use strict";
  const D = document, H = D.documentElement;
  const reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fin = window.matchMedia && matchMedia("(pointer: fine)").matches;
  const $ = (s, c) => Array.from((c || D).querySelectorAll(s));
  const $1 = (s, c) => (c || D).querySelector(s);
  const borne = (v, a, b) => Math.max(a, Math.min(b, v));
  const g = window.gsap, ST = window.ScrollTrigger;
  const NOMS = { "index.html": "Accueil", "soins.html": "Les soins", "a-propos.html": "À propos", "contact.html": "Contact" };

  let lenis = null, ctx = null, nettoyages = [];
  const etat = { mx: innerWidth / 2, my: innerHeight / 2, vitesse: 0, enTransition: false, son: false };

  /* ======================================================================
     SONS (optionnels, désactivés par défaut) — synthétisés, sans fichier
     ====================================================================== */
  let audio = null;
  function tinte(freq, duree, vol) {
    if (!etat.son) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime;
      o.type = "sine"; o.frequency.value = freq;
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(vol || .05, t + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, t + (duree || .6));
      o.connect(gain).connect(audio.destination); o.start(t); o.stop(t + (duree || .6));
    } catch (e) {}
  }
  const GAMME = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const noteSurvol = () => tinte(GAMME[Math.floor(Math.random() * GAMME.length)], .5, .025);
  const noteClic = () => { tinte(659.25, .7, .05); setTimeout(() => tinte(987.77, .9, .035), 70); };

  /* ======================================================================
     NOTIFICATION
     ====================================================================== */
  const toast = $1(".toast");
  let toastTl = null;
  function notifier(titre, texte, duree) {
    if (!toast) return;
    $1("strong", toast).textContent = titre;
    $1("span", toast).textContent = texte;
    if (toastTl) toastTl.kill();
    if (reduit || !g) { toast.style.transform = "none"; toast.style.opacity = 1; setTimeout(() => { toast.style.transform = ""; toast.style.opacity = ""; }, (duree || 5) * 1000); return; }
    toastTl = g.timeline()
      .fromTo(toast, { xPercent: 130, opacity: 0 }, { xPercent: 0, x: 0, opacity: 1, duration: .8, ease: "expo.out" })
      .fromTo($1(".toast__temps", toast), { scaleX: 1 }, { scaleX: 0, duration: duree || 5, ease: "none" }, "<")
      .to(toast, { xPercent: 130, opacity: 0, duration: .6, ease: "expo.in" });
    tinte(880, .6, .04);
  }
  if (toast) $1(".toast__fermer", toast).addEventListener("click", () => { if (toastTl) toastTl.progress(.94); else toast.style.transform = ""; });

  /* ======================================================================
     FENÊTRE DE DÉTAIL (modale)
     ====================================================================== */
  const modale = $1(".modale");
  let modaleTl = null;
  function ouvrirModale(i) {
    const s = (window.SOINS || [])[i]; if (!s || !modale) return;
    const btn = '<a class="bouton bouton--wa" data-wa="' + s.nom.replace(/"/g, "&quot;") + '" data-aimant data-curseur="WhatsApp" href="contact.html">Réserver ce soin sur WhatsApp</a>';
    $1(".modale__contenu", modale).innerHTML =
      '<span class="surtitre">À Brunoy ou à distance · ' + s.duree + '</span><h2 id="modale-titre" style="font-size:2.2rem">' + s.nom + '</h2><p>' + s.texte + '</p><ul>' +
      s.points.map(p => "<li>" + p + "</li>").join("") + '</ul><p class="note">Tarif communiqué sur WhatsApp.</p><div class="actions">' + btn + '</div>';
    if (window.Site) Site.relierWhatsApp(modale);
    modale.style.visibility = "visible";
    if (lenis) lenis.stop();
    noteClic();
    if (reduit || !g) { $1(".modale__fond", modale).style.opacity = 1; $1(".modale__boite", modale).style.opacity = 1; }
    else {
      modaleTl = g.timeline()
        .to($1(".modale__fond", modale), { opacity: 1, backdropFilter: "blur(10px)", webkitBackdropFilter: "blur(10px)", duration: .5 })
        .fromTo($1(".modale__boite", modale), { opacity: 0, scale: .8, y: 40, filter: "blur(14px)" }, { opacity: 1, scale: 1, y: 0, filter: "blur(0px)", duration: .8, ease: "expo.out" }, "<.1")
        .from($(".modale__contenu > *", modale), { y: 20, opacity: 0, stagger: .06, duration: .6, ease: "power3.out" }, "<.2");
    }
    setTimeout(() => { const f = $1(".modale__fermer", modale); if (f) f.focus(); }, 50);
  }
  function fermerModale() {
    if (!modale || modale.style.visibility !== "visible") return;
    const fin = () => { modale.style.visibility = "hidden"; if (lenis) lenis.start(); };
    if (modaleTl) modaleTl.timeScale(1.6).reverse().eventCallback("onReverseComplete", fin); else fin();
  }
  if (modale) $("[data-fermer]", modale).forEach(b => b.addEventListener("click", fermerModale));
  addEventListener("keydown", e => { if (e.key === "Escape") { fermerModale(); fermerMenu(); } });

  /* ======================================================================
     MODE SOMBRE / CLAIR ANIMÉ
     ====================================================================== */
  const btnTheme = $1(".outil--theme");
  if (btnTheme) btnTheme.addEventListener("click", e => {
    const suivant = H.getAttribute("data-theme") === "sombre" ? "clair" : "sombre";
    const appliquer = () => { H.setAttribute("data-theme", suivant); try { localStorage.setItem("me-theme", suivant); } catch (x) {} };
    noteClic();
    if (D.startViewTransition && !reduit) {
      const r = btnTheme.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const rayon = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const t = D.startViewTransition(appliquer);
      t.ready.then(() => D.documentElement.animate(
        { clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + rayon + "px at " + x + "px " + y + "px)"] },
        { duration: 900, easing: "cubic-bezier(.76,0,.24,1)", pseudoElement: "::view-transition-new(root)" }));
    } else appliquer();
  });

  /* Sons */
  const btnSon = $1(".outil--son");
  if (btnSon) btnSon.addEventListener("click", () => {
    etat.son = !etat.son;
    btnSon.setAttribute("aria-pressed", etat.son ? "true" : "false");
    btnSon.setAttribute("aria-label", etat.son ? "Couper les sons" : "Activer les sons");
    if (etat.son) noteClic();
  });

  /* ======================================================================
     MENU MOBILE : entrée et sortie animées, icône qui se transforme
     ====================================================================== */
  const burger = $1("#burger"), menuMob = $1(".menu-mobile");
  let menuOuvert = false, menuTl = null;
  function construireMenuTl() {
    if (!g || reduit) return null;
    return g.timeline({ paused: true })
      .set(menuMob, { visibility: "visible" })
      .to(menuMob, { clipPath: "circle(150% at calc(100% - 40px) 38px)", duration: .9, ease: "expo.inOut" })
      .from($("a[data-lien] > span", menuMob), { yPercent: 120, rotate: 6, stagger: .07, duration: .8, ease: "expo.out" }, "-=.4")
      .from($(".bouton, p", menuMob), { y: 30, opacity: 0, stagger: .08, duration: .6 }, "-=.5");
  }
  function ouvrirMenu() {
    menuOuvert = true; burger.classList.add("ouvert"); burger.setAttribute("aria-expanded", "true");
    if (lenis) lenis.stop();
    menuTl = menuTl || construireMenuTl();
    if (menuTl) menuTl.timeScale(1).play(); else menuMob.style.cssText = "visibility:visible;clip-path:none";
    noteClic();
  }
  function fermerMenu() {
    if (!menuOuvert) return;
    menuOuvert = false; burger.classList.remove("ouvert"); burger.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
    if (menuTl) menuTl.timeScale(1.5).reverse(); else menuMob.style.cssText = "";
  }
  if (burger && menuMob) burger.addEventListener("click", () => menuOuvert ? fermerMenu() : ouvrirMenu());

  /* ======================================================================
     ONDULATION AU CLIC SUR LES BOUTONS
     ====================================================================== */
  D.addEventListener("pointerdown", e => {
    const b = e.target.closest(".bouton");
    if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2.2;
    const o = D.createElement("span"); o.className = "onde";
    o.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
    b.appendChild(o); setTimeout(() => o.remove(), 750);
    noteClic();
  });

  /* Retour en haut */
  const haut = $1(".haut");
  if (haut) haut.addEventListener("click", () => lenis ? lenis.scrollTo(0, { duration: 2.2 }) : scrollTo({ top: 0, behavior: "smooth" }));

  /* Questions fréquentes : ouverture animée */
  D.addEventListener("click", e => {
    const s = e.target.closest(".faq summary");
    if (!s || reduit || !g) return;
    e.preventDefault();
    const d = s.parentElement, corps = $1(".faq__corps", d);
    if (d.open) {
      g.to(corps, { height: 0, duration: .5, ease: "power3.inOut", onComplete: () => { d.open = false; corps.style.height = ""; ST && ST.refresh(); } });
    } else {
      d.open = true;
      g.fromTo(corps, { height: 0 }, { height: "auto", duration: .6, ease: "expo.out", onComplete: () => ST && ST.refresh() });
      g.from($1("p", corps), { y: 16, opacity: 0, duration: .6, delay: .1 });
    }
    noteClic();
  });

  /* Fenêtre de détail depuis les cartes */
  D.addEventListener("click", e => {
    const b = e.target.closest("[data-modale]");
    if (b) { e.preventDefault(); ouvrirModale(+b.getAttribute("data-modale")); }
  });

  /* ======================================================================
     SI LE VISITEUR LIMITE LES ANIMATIONS : on s'arrête là (version calme)
     ====================================================================== */
  window.Experience = { notifier: notifier };
  if (reduit || !g || !ST) {
    const c = $1(".chargeur"); if (c) c.remove();
    $("[data-lotus]").forEach(el => window.Lotus && Lotus.monter(el));
    return;
  }

  g.registerPlugin(ST);
  g.defaults({ ease: "power3.out" });

  /* ======================================================================
     DÉFILEMENT FLUIDE (Lenis) synchronisé avec ScrollTrigger
     ====================================================================== */
  lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: .95 });
  lenis.on("scroll", e => { etat.vitesse = e.velocity; ST.update(); });
  g.ticker.add(t => lenis.raf(t * 1000));
  g.ticker.lagSmoothing(0);
  D.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const cible = $1(a.getAttribute("href"));
    if (cible) { e.preventDefault(); lenis.scrollTo(cible, { offset: -40, duration: 1.6 }); }
  });

  /* ======================================================================
     CURSEUR PERSONNALISÉ, MAGNÉTIQUE, TRAÎNÉE LUMINEUSE, PROJECTEUR
     ====================================================================== */
  const curseur = $1(".curseur"), anneau = $1(".curseur__anneau", curseur), point = $1(".curseur__point", curseur), texteC = $1(".curseur__texte", curseur);
  const projecteur = $1(".projecteur");
  let aimantCible = null;
  if (fin && curseur) {
    H.classList.add("curseur-actif");
    const ax = g.quickTo(anneau, "x", { duration: .5, ease: "power3" }), ay = g.quickTo(anneau, "y", { duration: .5, ease: "power3" });
    const px = g.quickTo(point, "x", { duration: .08 }), py = g.quickTo(point, "y", { duration: .08 });
    addEventListener("pointermove", e => {
      etat.mx = e.clientX; etat.my = e.clientY;
      px(e.clientX); py(e.clientY);
      if (aimantCible) {
        const r = aimantCible.getBoundingClientRect();
        ax(r.left + r.width / 2 + (e.clientX - r.left - r.width / 2) * .2); ay(r.top + r.height / 2 + (e.clientY - r.top - r.height / 2) * .2);
      } else { ax(e.clientX); ay(e.clientY); }
      if (projecteur) { projecteur.classList.add("actif"); projecteur.style.setProperty("--sx", e.clientX + "px"); projecteur.style.setProperty("--sy", e.clientY + "px"); }
    }, { passive: true });
    D.addEventListener("pointerover", e => {
      const t = e.target;
      const lab = t.closest("[data-curseur]");
      curseur.classList.remove("lien", "texte", "saisie");
      if (t.closest("input, textarea")) curseur.classList.add("saisie");
      else if (lab) { curseur.classList.add("texte"); texteC.textContent = lab.getAttribute("data-curseur"); }
      else if (t.closest("a, button, summary, select")) curseur.classList.add("lien");
      if (H.classList.contains("survol-cristal") && !lab) { curseur.classList.add("texte"); texteC.textContent = "Améthyste"; }
      const ai = t.closest("[data-aimant], .outil, .burger");
      if (ai !== aimantCible) { aimantCible = ai; if (ai) noteSurvol(); }
    });
    D.addEventListener("pointerdown", () => curseur.classList.add("clic"));
    D.addEventListener("pointerup", () => curseur.classList.remove("clic"));
    D.addEventListener("pointerleave", () => g.to(curseur, { opacity: 0, duration: .3 }));
    D.addEventListener("pointerenter", () => g.to(curseur, { opacity: 1, duration: .3 }));

    /* Boutons aimantés */
    let aimante = null, amx = null, amy = null;
    D.addEventListener("pointermove", e => {
      const b = aimantCible && aimantCible.matches("[data-aimant], .outil") ? aimantCible : null;
      if (b !== aimante) {
        if (aimante) g.to(aimante, { x: 0, y: 0, duration: .9, ease: "elastic.out(1,.35)", overwrite: true });
        aimante = b; amx = b ? g.quickTo(b, "x", { duration: .5, ease: "power3.out" }) : null; amy = b ? g.quickTo(b, "y", { duration: .5, ease: "power3.out" }) : null;
      }
      if (!b) return;
      const r = b.getBoundingClientRect();
      amx((e.clientX - r.left - r.width / 2 - (g.getProperty(b, "x") || 0)) * .32);
      amy((e.clientY - r.top - r.height / 2 - (g.getProperty(b, "y") || 0)) * .42);
    }, { passive: true });

    /* Traînée lumineuse */
    const tr = $1(".trainee"), tc = tr.getContext("2d"), pts = [];
    let dpr = Math.min(devicePixelRatio || 1, 2);
    const taille = () => { tr.width = innerWidth * dpr; tr.height = innerHeight * dpr; tc.setTransform(dpr, 0, 0, dpr, 0, 0); };
    taille(); addEventListener("resize", taille);
    addEventListener("pointermove", e => { pts.push({ x: e.clientX, y: e.clientY, v: 1 }); if (pts.length > 40) pts.shift(); }, { passive: true });
    let traineeVide = true;
    g.ticker.add(() => {
      if (!pts.length && traineeVide) return;
      tc.clearRect(0, 0, innerWidth, innerHeight); traineeVide = !pts.length;
      for (let i = pts.length - 1; i >= 0; i--) { pts[i].v -= .035; if (pts[i].v <= 0) pts.splice(i, 1); }
      if (pts.length < 2) return;
      tc.lineCap = "round"; tc.lineJoin = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        tc.strokeStyle = "rgba(" + (i % 2 ? "157,120,226" : "243,201,138") + "," + (b.v * .55) + ")";
        tc.lineWidth = b.v * 6;
        tc.beginPath(); tc.moveTo(a.x, a.y); tc.lineTo(b.x, b.y); tc.stroke();
      }
    });
  }

  /* ======================================================================
     EN-TÊTE DYNAMIQUE, BARRE DE PROGRESSION, INDICATEUR DE PAGE
     ====================================================================== */
  const entete = $1(".entete"), progression = $1(".progression");
  let dernierY = 0;
  lenis.on("scroll", e => {
    const y = e.scroll;
    entete.classList.toggle("compacte", y > 80);
    if (!menuOuvert) entete.classList.toggle("cachee", y > 300 && y > dernierY + 2);
    if (y < dernierY - 2) entete.classList.remove("cachee");
    dernierY = y;
    g.set(progression, { scaleX: e.progress || 0 });
  });
  const indic = $1(".menu__indic");
  function placerIndic(a) {
    if (!indic) return;
    const cible = a || $1('.menu a[aria-current="page"]');
    if (!cible) { indic.style.opacity = 0; return; }
    const r = cible.getBoundingClientRect(), rm = cible.parentElement.getBoundingClientRect();
    indic.style.opacity = 1; indic.style.left = (r.left - rm.left) + "px"; indic.style.width = r.width + "px";
  }
  $(".menu a").forEach(a => { a.addEventListener("mouseenter", () => placerIndic(a)); });
  const menuEl = $1(".menu"); if (menuEl) menuEl.addEventListener("mouseleave", () => placerIndic());
  addEventListener("resize", () => placerIndic());
  D.fonts && D.fonts.ready.then(() => placerIndic());

  /* Logo : les lettres ondulent au survol */
  const marque = $1(".marque strong");
  if (marque && window.SplitType) {
    const sp = new SplitType(marque, { types: "chars" });
    $1(".marque").addEventListener("mouseenter", () => g.fromTo(sp.chars, { y: 0 }, { y: -6, stagger: .02, duration: .25, yoyo: true, repeat: 1, ease: "sine.inOut" }));
  }

  /* ======================================================================
     ÉLÉMENTS PROPRES À CHAQUE PAGE
     ====================================================================== */
  const ENTREES = {
    monte: { y: 70 }, descend: { y: -70 }, gauche: { x: -110 }, droite: { x: 110 },
    zoom: { scale: .75 }, fondu: { scale: 1.04 }
  };

  function longueurs(svg) {
    $("path, circle, line, rect", svg).forEach(p => {
      let l = 200; try { l = Math.ceil(p.getTotalLength()); } catch (e) {}
      p.style.strokeDasharray = l; p.style.strokeDashoffset = l;
    });
  }

  function etincelles(cv) {
    const c = cv.getContext("2d"); let W = 0, Hh = 0, parts = [], vis = true, actif = true;
    const dpr = Math.min(devicePixelRatio || 1, 2), nuit = !!cv.closest(".section--nuit, .transfo__appel, .recit");
    const souris = { x: -999, y: -999 };
    const nouvelle = tout => ({ x: Math.random() * W, y: tout ? Math.random() * Hh : Hh + 10, r: Math.random() * 2.2 + .6, v: Math.random() * .4 + .15, d: Math.random() * 6.28, t: Math.random() * .03 + .01, ox: 0, oy: 0 });
    const taille = () => { W = cv.clientWidth; Hh = cv.clientHeight; cv.width = W * dpr; cv.height = Hh * dpr; c.setTransform(dpr, 0, 0, dpr, 0, 0); parts = []; for (let i = 0, n = Math.min(innerWidth < 860 ? 60 : 140, Math.round(W * Hh / 9000)); i < n; i++) parts.push(nouvelle(true)); };
    const ro = new ResizeObserver(taille); ro.observe(cv); taille();
    const io = new IntersectionObserver(e => vis = e[0].isIntersecting); io.observe(cv);
    const bouge = e => { const r = cv.getBoundingClientRect(); const p = e.touches ? e.touches[0] : e; souris.x = p.clientX - r.left; souris.y = p.clientY - r.top; };
    addEventListener("pointermove", bouge, { passive: true }); addEventListener("touchmove", bouge, { passive: true });
    const dessine = () => {
      if (!actif) return;
      requestAnimationFrame(dessine);
      if (!vis) return;
      c.clearRect(0, 0, W, Hh);
      parts.forEach((p, i) => {
        p.y -= p.v; p.d += p.t; p.x += Math.sin(p.d) * .3;
        const dx = p.x + p.ox - souris.x, dy = p.y + p.oy - souris.y, dist = Math.hypot(dx, dy);
        if (dist < 120) { p.ox += dx / dist * (120 - dist) * .06; p.oy += dy / dist * (120 - dist) * .06; }
        p.ox *= .94; p.oy *= .94;
        if (p.y < -10) parts[i] = nouvelle(false);
        const a = .35 + Math.sin(p.d * 2) * .35;
        c.beginPath(); c.arc(p.x + p.ox, p.y + p.oy, p.r * 1.3, 0, 6.283);
        c.fillStyle = nuit ? "rgba(255,240,210," + a + ")" : (i % 3 ? "rgba(207,174,106," + a + ")" : "rgba(157,120,226," + a + ")");
        c.fill();
      });
    };
    dessine();
    return () => { actif = false; ro.disconnect(); io.disconnect(); removeEventListener("pointermove", bouge); removeEventListener("touchmove", bouge); };
  }

  /* Liquide : la turbulence du filtre ondule en continu, plus fort au survol */
  const bruit = $1("#liquide-bruit"), dep = $1("#liquide-dep");
  let survolLiquide = 0, cibleLiquide = 0, tLiq = 0;
  let liqEl = null;
  D.addEventListener("pointerover", e => {
    const el = e.target.closest(".portrait, .soin__visuel");
    cibleLiquide = el ? 1 : 0;
    if (el && el !== liqEl) { if (liqEl) liqEl.classList.remove("liquide-actif"); liqEl = el; el.classList.add("liquide-actif"); }
  });
  g.ticker.add(() => {
    if (!bruit || !liqEl) return;
    if (!cibleLiquide && survolLiquide < .02) { liqEl.classList.remove("liquide-actif"); liqEl = null; survolLiquide = 0; return; }
    tLiq += .01; survolLiquide += (cibleLiquide - survolLiquide) * .06;
    bruit.setAttribute("baseFrequency", (.008 + Math.sin(tLiq) * .002 + survolLiquide * .01).toFixed(4) + " " + (.012 + Math.cos(tLiq * .8) * .003 + survolLiquide * .014).toFixed(4));
    dep.setAttribute("scale", (16 + survolLiquide * 55).toFixed(1));
  });

  function initPage(racine, opts) {
    opts = opts || {};
    const intro = g.timeline({ paused: true });
    nettoyages = [];
    const flottant = $1(".flottant");
    if (flottant && "IntersectionObserver" in window) {
      const visibles = new Set();
      const io = new IntersectionObserver(es => {
        es.forEach(e => e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target));
        flottant.classList.toggle("cache", visibles.size > 0);
      }, { rootMargin: "0px 0px -40px 0px" });
      $("[data-wa]:not(.flottant):not(.bouton--entete), .formulaire button[type=submit]", racine).forEach(b => { if (!b.closest(".menu-mobile")) io.observe(b); });
      const pied = $1(".pied"); if (pied) io.observe(pied);
      nettoyages.push(() => { io.disconnect(); flottant.classList.remove("cache"); });
    }

    ctx = g.context(() => {
      /* ---------- Titres XXL lettre par lettre + texte qui réagit au curseur ---------- */
      $("[data-xxl]", racine).forEach(h => {
        const lignes = $(".ligne", h);
        lignes.forEach(l => {
          if ($1(".mot-change, .degrade-anime", l)) { intro.from(l.firstElementChild, { yPercent: 120, rotate: 4, duration: 1.2, ease: "expo.out" }, .15); return; }
          const sp = new SplitType(l, { types: "chars" });
          intro.from(sp.chars, { yPercent: 120, rotate: 10, opacity: 0, stagger: .028, duration: 1.1, ease: "expo.out" }, .1 + lignes.indexOf(l) * .12);
        });
        h.classList.add("reagit");
        if (fin) {
          const chars = $(".char", h);
          const reagir = () => {
            chars.forEach(c => {
              const r = c.getBoundingClientRect(), dx = etat.mx - (r.left + r.width / 2), dy = etat.my - (r.top + r.height / 2), d = Math.hypot(dx, dy);
              const f = Math.max(0, 1 - d / 160);
              c.style.transform = f ? "translate(" + (-dx * f * .12) + "px," + (-dy * f * .18 - f * 8) + "px) scale(" + (1 + f * .08) + ")" : "";
              c.style.color = f > .35 ? "var(--violet)" : "";
            });
          };
          const zone = h.closest("section");
          const surv = () => { g.ticker.add(reagir); };
          const sort = () => { g.ticker.remove(reagir); chars.forEach(c => { c.style.transform = ""; c.style.color = ""; }); };
          zone.addEventListener("pointerenter", surv); zone.addEventListener("pointerleave", sort);
          nettoyages.push(sort);
        }
      });

      /* Le reste de l'ouverture entre après le titre */
      $(".ouverture [data-r]", racine).forEach((el, i) => {
        const type = el.getAttribute("data-r");
        if (type === "masque") intro.fromTo(el, { clipPath: "inset(0 100% 0 0)", autoAlpha: 1 }, { clipPath: "inset(0 0% 0 0)", duration: 1.1, ease: "expo.inOut" }, 0);
        else intro.fromTo(el, Object.assign({ autoAlpha: 0 }, ENTREES[type] || ENTREES.monte), { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.1, ease: "expo.out" }, .5 + i * .1);
        el.removeAttribute("data-r");
      });
      const sceneP = $1(".ouverture .scene", racine);
      if (sceneP) intro.fromTo(sceneP, { autoAlpha: 0, scale: .6, rotate: -6, clipPath: "circle(0% at 50% 50%)" }, { autoAlpha: 1, scale: 1, rotate: 0, clipPath: "circle(75% at 50% 50%)", duration: 1.8, ease: "expo.out", clearProps: "clipPath" }, .2);
      const fleurO = $1(".ouverture .fleur", racine);
      if (fleurO) { longueurs(fleurO); intro.to($("circle", fleurO), { strokeDashoffset: 0, duration: 2.4, stagger: .06, ease: "power2.inOut" }, 0); }

      /* ---------- Mot qui change (et change de typographie) ---------- */
      $(".mot-change", racine).forEach(m => {
        const mots = m.getAttribute("data-mots").split("|");
        m.innerHTML = mots.map((w, i) => '<span class="' + (i % 2 ? "sans" : "italique") + '">' + w + "</span>").join("");
        const sp = $("span", m);
        g.set(sp.slice(1), { yPercent: 110, opacity: 0 });
        let i = 0;
        const tl = g.timeline({ repeat: -1, delay: 2.6 });
        mots.forEach((_, k) => {
          const a = sp[k], b = sp[(k + 1) % sp.length];
          tl.to(a, { yPercent: -110, opacity: 0, filter: "blur(6px)", duration: .8, ease: "expo.inOut" })
            .fromTo(b, { yPercent: 110, opacity: 0, filter: "blur(6px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: .8, ease: "expo.inOut" }, "<")
            .to({}, { duration: 1.8 });
        });
      });

      /* ---------- Apparitions au défilement (avec disparition en sortie) ---------- */
      $("[data-r]", racine).forEach(el => {
        const type = el.getAttribute("data-r");
        const freres = Array.from(el.parentElement.children).filter(c => c.hasAttribute("data-r"));
        const retard = Math.max(0, freres.indexOf(el)) * .1;
        const base = { trigger: el, start: "top 90%", end: "bottom 6%", toggleActions: "play reverse play reverse" };
        if (type === "masque") {
          g.fromTo(el, { clipPath: el.matches(".surtitre") ? "inset(0 100% 0 0)" : "inset(100% 0 0 0)", autoAlpha: 1 },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, delay: retard, ease: "expo.inOut", scrollTrigger: base });
        } else {
          g.fromTo(el, Object.assign({ autoAlpha: 0 }, ENTREES[type] || ENTREES.monte),
            { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: 1.1, delay: retard, ease: "expo.out", scrollTrigger: base });
        }
      });

      /* ---------- Titres de section : les mots sortent du flou ---------- */
      $("[data-titre]", racine).forEach(h => {
        const sp = new SplitType(h, { types: "words" });
        g.from(sp.words, { yPercent: 60, opacity: 0, rotateX: -40, stagger: .06, duration: 1.1, ease: "expo.out",
          scrollTrigger: { trigger: h, start: "top 88%", toggleActions: "play none none reverse" } });
      });

      /* ---------- Texte révélé au défilement (et qui change de taille) ---------- */
      $("[data-revele]", racine).forEach(p => {
        const sp = new SplitType(p, { types: "words" });
        g.to(sp.words, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
        if (p.closest(".manifeste")) g.fromTo(p, { scale: .86, letterSpacing: "-.02em" }, { scale: 1, letterSpacing: "0em", ease: "none", scrollTrigger: { trigger: p, start: "top bottom", end: "center center", scrub: true } });
      });

      /* ---------- Icônes et fleur de vie qui se dessinent ---------- */
      $(".dessine", racine).forEach(svg => {
        if (svg.closest(".ouverture")) return;
        longueurs(svg);
        g.to($("path, circle, line", svg), { strokeDashoffset: 0, duration: 1.8, stagger: .08, ease: "power2.inOut", scrollTrigger: { trigger: svg, start: "top 92%", toggleActions: "play none none reverse" } });
      });
      $(".fleur", racine).forEach(f => g.to(f, { rotate: 120, ease: "none", scrollTrigger: { trigger: f.closest("section"), start: "top top", end: "bottom top", scrub: true } }));

      /* ---------- Ouverture de l'accueil : fixe, recouverte, zoom progressif ---------- */
      const ouv = $1(".ouverture--accueil", racine);
      if (ouv && innerWidth > 860) {
        g.to($1(".ouverture__texte", ouv), { y: -120, autoAlpha: 0, filter: "blur(6px)", ease: "none", scrollTrigger: { trigger: ouv, start: "top top", end: "bottom top", scrub: true } });
        g.to($1(".scene", ouv), { scale: 1.35, y: 80, ease: "none", scrollTrigger: { trigger: ouv, start: "top top", end: "bottom top", scrub: true } });
        g.to($(".halo", ouv), { y: (i) => i ? -160 : 200, ease: "none", scrollTrigger: { trigger: ouv, start: "top top", end: "bottom top", scrub: true } });
      }

      /* ---------- Parallaxe à la souris ---------- */
      $("[data-profondeur]", racine).forEach(el => {
        const d = parseFloat(el.getAttribute("data-profondeur")) || 0;
        const qx = g.quickTo(el, "x", { duration: 1.2, ease: "power3" }), qy = g.quickTo(el, "y", { duration: 1.2, ease: "power3" });
        const f = () => { qx((etat.mx / innerWidth - .5) * d); qy((etat.my / innerHeight - .5) * d); };
        if (fin) { g.ticker.add(f); nettoyages.push(() => g.ticker.remove(f)); }
      });

      /* ---------- Cartes et visuels en relief 3D ---------- */
      $("[data-relief]", racine).forEach(el => {
        if (!fin) return;
        const rx = g.quickTo(el, "rotationX", { duration: .6, ease: "power3" }), ry = g.quickTo(el, "rotationY", { duration: .6, ease: "power3" });
        const lev = g.quickTo(el, "z", { duration: .6, ease: "power3" });
        g.set(el, { transformPerspective: 900 });
        el.addEventListener("pointermove", e => {
          const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          ry((x - .5) * 16); rx((.5 - y) * 16); lev(40);
          el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
        });
        el.addEventListener("pointerleave", () => { rx(0); ry(0); lev(0); });
      });

      /* ---------- Bandes de mots (accélérées et floutées par la vitesse) ---------- */
      $(".defile__piste", racine).forEach((p, k) => {
        let x = 0, vu = false; const sens = (+p.getAttribute("data-sens") || 1) * (k % 2 ? 1 : -1);
        const io = new IntersectionObserver(e => vu = e[0].isIntersecting); io.observe(p); nettoyages.push(() => io.disconnect());
        const f = () => {
          if (!vu) return;
          const v = etat.vitesse || 0;
          x += sens * (.7 + Math.min(Math.abs(v) * .35, 18));
          const w = p.scrollWidth / 3; if (x <= -w) x += w; if (x > 0) x -= w;
          p.style.transform = "translate3d(" + x + "px,0,0) skewX(" + borne(-v * .5, -14, 14) + "deg)";
        };
        g.ticker.add(f); nettoyages.push(() => g.ticker.remove(f));
      });

      /* ---------- Titres qui glissent horizontalement ---------- */
      $("[data-glisse]", racine).forEach(t => {
        const s = +t.getAttribute("data-glisse") || -1;
        g.fromTo(t, { xPercent: s < 0 ? 5 : -45 }, { xPercent: s < 0 ? -45 : 5, ease: "none", scrollTrigger: { trigger: t, start: "top bottom", end: "bottom top", scrub: 1 } });
      });

      /* ---------- Récit épinglé à défilement horizontal ---------- */
      $("[data-recit]", racine).forEach(sec => {
        const piste = $1(".recit__piste", sec), epingle = $1(".recit__epingle", sec);
        const distance = () => Math.max(0, piste.scrollWidth - innerWidth);
        const horiz = g.to(piste, { x: () => -distance(), ease: "none",
          scrollTrigger: { trigger: sec, pin: epingle, start: "top top", end: () => "+=" + (distance() + innerHeight * .6), scrub: 1, invalidateOnRefresh: true, refreshPriority: 2 } });
        g.to($1(".recit__barre i", sec), { scaleX: 1, ease: "none", scrollTrigger: { trigger: sec, start: "top top", end: () => "+=" + (distance() + innerHeight * .6), scrub: true } });
        $(".recit__panneau", sec).forEach(pan => {
          const svg = $1("svg", pan); if (svg) longueurs(svg);
          const tl = g.timeline({ scrollTrigger: { trigger: pan, containerAnimation: horiz, start: "left 85%", toggleActions: "play none none reverse" } });
          tl.from(pan, { scale: .85, rotateY: -18, opacity: .2, duration: 1, ease: "expo.out" })
            .from($(".recit__num", pan), { yPercent: 60, opacity: 0, duration: .8 }, "<.1");
          if (svg) tl.to($("path, circle, line, rect", svg), { strokeDashoffset: 0, duration: 1.6, stagger: .08, ease: "power2.inOut" }, "<.2");
        });
      });

      /* ---------- Compteurs et jauges ---------- */
      $("[data-compte]", racine).forEach(c => {
        const cible = +c.getAttribute("data-compte"), depart = +(c.getAttribute("data-depart") || 0), suf = c.getAttribute("data-suffixe") || "";
        const o = { v: depart };
        g.to(o, { v: cible, duration: 2.2, ease: "power2.out", onUpdate: () => c.textContent = Math.round(o.v) + suf,
          scrollTrigger: { trigger: c, start: "top 88%", toggleActions: "play none none reset" } });
      });
      $(".jauge i", racine).forEach(j => g.to(j, { scaleX: 1, duration: 1.8, ease: "expo.inOut", scrollTrigger: { trigger: j, start: "top 92%", toggleActions: "play none none reset" } }));

      /* ---------- Section qui se transforme en une autre ---------- */
      $("[data-transfo]", racine).forEach(sec => {
        const appel = $1(".transfo__appel", sec);
        const tl = g.timeline({ scrollTrigger: { trigger: sec, pin: $1(".transfo__epingle", sec), start: "top top", end: "+=170%", scrub: 1, refreshPriority: 1,
          onUpdate: s => appel.classList.toggle("actif", s.progress > .6) } });
        g.timeline({ scrollTrigger: { trigger: sec, start: "top 75%", toggleActions: "play none none reverse" } })
          .from($(".transfo__zone h2, .transfo__zone p, .transfo__zone .surtitre", sec), { y: 60, autoAlpha: 0, stagger: .1, duration: .8, ease: "expo.out" })
          .from($(".communes li", sec), { scale: 0, autoAlpha: 0, stagger: .04, duration: .5, ease: "back.out(2)" }, "<.2");
        tl.to({}, { duration: .5 })
          .to($1(".transfo__zone", sec), { scale: .85, autoAlpha: .25, filter: "blur(6px)", duration: .6 })
          .to($1(".transfo__cercle", sec), { scale: 1, duration: .8, ease: "power2.in" }, "<")
          .to(appel, { autoAlpha: 1, duration: .4 }, "-=.2")
          .from($(".transfo__appel .conteneur > *", sec), { y: 70, autoAlpha: 0, stagger: .08, duration: .5 }, "<");
      });

      /* ---------- Bandeaux d'appel : s'ouvrent en zoom ---------- */
      $(".section--nuit", racine).forEach(s => g.fromTo(s, { clipPath: "inset(0% 6% round 56px)" }, { clipPath: "inset(0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: s, start: "top bottom", end: "top 30%", scrub: true } }));

      /* ---------- Soins empilés : chaque carte recule sous la suivante ---------- */
      const piles = $(".soin--pile", racine);
      piles.forEach((c, i) => {
        const suiv = piles[i + 1]; if (!suiv) return;
        g.fromTo(c, { scale: 1, filter: "brightness(1)", rotateX: 0 }, { scale: .9, filter: "brightness(.92)", rotateX: 4, ease: "none", transformOrigin: "50% 0%",
          scrollTrigger: { trigger: suiv, start: "top bottom", end: "top 100px", scrub: true } });
        g.from($(".soin__visuel, h2, p, li, .soin__infos", suiv), { y: 50, autoAlpha: 0, stagger: .05, duration: .9, ease: "expo.out",
          scrollTrigger: { trigger: suiv, start: "top 75%", toggleActions: "play none none reverse" } });
      });
      if (piles[0]) g.from($(".soin__visuel, h2, p, li, .soin__infos", piles[0]), { y: 50, autoAlpha: 0, stagger: .05, duration: .9, ease: "expo.out", scrollTrigger: { trigger: piles[0], start: "top 80%" } });
      $(".soin__visuel", racine).forEach(v => g.fromTo(v, { clipPath: "inset(100% 0 0 0 round 999px 999px 18px 18px)" }, { clipPath: "inset(0% 0 0 0 round 999px 999px 18px 18px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: v, start: "top 85%" } }));

      /* ---------- Image qui se dévoile et zoome progressivement ---------- */
      $("[data-devoile]", racine).forEach(d => {
        g.fromTo(d, { clipPath: "inset(30% 22% 30% 22% round 200px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: d, start: "top 95%", end: "center 55%", scrub: true } });
        g.fromTo($1(".portrait", d), { scale: 1.35 }, { scale: 1, ease: "none", scrollTrigger: { trigger: d, start: "top bottom", end: "bottom top", scrub: true } });
      });

      /* ---------- Pied de page animé ---------- */
      const geant = $1(".pied__geant");
      if (geant && !geant._split) { geant._split = new SplitType(geant, { types: "chars" }); }
      if (geant) g.fromTo(geant._split.chars, { yPercent: 100, rotate: 12, opacity: 0 }, { yPercent: 0, rotate: 0, opacity: 1, stagger: .04, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".pied", start: "top 85%", toggleActions: "play none none reverse" } });
      g.from($(".pied .conteneur > div"), { y: 50, autoAlpha: 0, stagger: .1, duration: 1, scrollTrigger: { trigger: ".pied .conteneur", start: "top 95%", toggleActions: "play none none reverse" } });

      /* ---------- Repères de position dans la page ---------- */
      const rep = $1(".reperes"); rep.innerHTML = "";
      $("[data-repere]", racine).forEach(sec => {
        const b = D.createElement("button"); b.type = "button"; b.setAttribute("aria-label", sec.getAttribute("data-repere"));
        b.innerHTML = "<span>" + sec.getAttribute("data-repere") + "</span>";
        b.addEventListener("click", () => lenis.scrollTo(sec, { duration: 1.6 }));
        rep.appendChild(b);
        ST.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: s => { if (s.isActive) { $("button", rep).forEach(x => x.classList.remove("actif")); b.classList.add("actif"); } } });
      });
    }, racine);

    /* ---------- Éléments chargés à la demande (3D, Lottie, particules) ---------- */
    const differes = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; differes.unobserve(el);
      let n = null;
      if (el.matches(".scene3d") && window.Scene3D) n = Scene3D.monter(el);
      else if (el.matches("[data-lotus]") && window.Lotus) n = Lotus.monter(el);
      else if (el.matches(".etincelles")) n = etincelles(el);
      if (n) nettoyages.push(n);
    }), { rootMargin: "300px" });
    $(".scene3d, [data-lotus], .etincelles", racine).forEach(el => differes.observe(el));
    nettoyages.push(() => differes.disconnect());

    if (window.Site) Site.initPage(racine);
    if (opts.lancer !== false) intro.play();
    ST.sort(); ST.refresh();
    setTimeout(() => { ST.sort(); ST.refresh(); }, 400);
    return intro;
  }

  function detruirePage() {
    nettoyages.forEach(f => { try { f(); } catch (e) {} });
    nettoyages = [];
    if (ctx) ctx.revert();
    ST.getAll().forEach(t => t.kill());
  }

  /* ======================================================================
     NAVIGATION SANS RECHARGEMENT ET TRANSITIONS CINÉMATIQUES
     ====================================================================== */
  const main = $1("#contenu"), volets = $(".volets i"), logo = $1(".volets__logo"), titreV = $1(".volets__titre"), barre = $1(".barre-chargement"), distDep = $1("#distorsion-dep");
  const cache = {};
  longueurs(logo);
  function recuperer(url) {
    if (!cache[url]) cache[url] = fetch(url, { credentials: "same-origin" }).then(r => { if (!r.ok) throw new Error(r.status); return r.text(); });
    return cache[url];
  }
  function fichierDe(url) { const f = url.split("#")[0].split("?")[0].split("/").pop(); return f || "index.html"; }

  function aller(url, pousser) {
    if (etat.enTransition) return;
    const fichier = fichierDe(url);
    etat.enTransition = true;
    fermerMenu(); fermerModale();
    const req = recuperer(fichier);
    lenis.stop();

    const sortie = g.timeline();
    const port = $1(".portrait", main);
    if (port && port.getBoundingClientRect().top < innerHeight && port.getBoundingClientRect().bottom > 0) sortie.to(port, { scale: 1.25, filter: "blur(6px)", duration: .6, ease: "power2.in" }, 0);
    sortie.to(barre, { scaleX: .7, duration: 1.2, ease: "power2.out" }, 0)
      .to(main, { scale: .93, opacity: 0, filter: "url(#distorsion) blur(8px)", duration: .8, ease: "power2.in" }, 0)
      .fromTo(distDep, { attr: { scale: 0 } }, { attr: { scale: 140 }, duration: .8, ease: "power2.in" }, 0)
      .to(volets, { scaleY: 1, duration: .75, ease: "expo.inOut", stagger: .05 }, .25)
      .set(titreV, { textContent: NOMS[fichier] || "" })
      .to(logo, { opacity: 1, duration: .2 }, "-=.2")
      .to($("path, circle", logo), { strokeDashoffset: 0, duration: .9, stagger: .08, ease: "power2.inOut" }, "<")
      .to(titreV, { opacity: 1, duration: .4, onStart: () => { titreV.classList.add("glitch", "actif"); titreV.setAttribute("data-texte", titreV.textContent); } }, "<.3");
    noteClic();

    Promise.all([req, new Promise(r => sortie.eventCallback("onComplete", r))]).then(([html]) => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const nouveau = doc.querySelector("#contenu");
      if (!nouveau) throw new Error("page");
      detruirePage();
      main.innerHTML = nouveau.innerHTML;
      main.setAttribute("data-page", nouveau.getAttribute("data-page"));
      D.title = doc.title;
      $(".menu a, .menu-mobile a").forEach(a => { if (fichierDe(a.getAttribute("href")) === fichier) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
      if (pousser) { try { history.pushState({ f: fichier }, "", fichier); } catch (e) {} }
      lenis.scrollTo(0, { immediate: true, force: true }); window.scrollTo(0, 0); entete.classList.remove("cachee");
      g.set(main, { clearProps: "filter" });
      g.set(distDep, { attr: { scale: 0 } });
      placerIndic();
      const intro = initPage(main, { lancer: false });
      g.timeline({ onComplete: () => { etat.enTransition = false; lenis.start(); titreV.classList.remove("glitch", "actif"); } })
        .to(barre, { scaleX: 1, duration: .3 })
        .to(titreV, { opacity: 0, y: -20, duration: .4 }, "<")
        .to(logo, { opacity: 0, scale: .8, duration: .4 }, "<")
        .to(volets, { scaleY: 0, duration: .9, ease: "expo.inOut", stagger: .05, transformOrigin: (i) => i ? "top" : "bottom" }, "-=.1")
        .fromTo(main, { scale: 1.08, opacity: 0, filter: "blur(10px)" }, { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "expo.out", clearProps: "transform,filter" }, "<.25")
        .add(() => intro.play(), "<.1")
        .to(barre, { opacity: 0, duration: .3 }, "<")
        .set(barre, { scaleX: 0, opacity: 1 })
        .set(volets, { transformOrigin: (i) => i ? "bottom" : "top" })
        .set(logo, { scale: 1 })
        .set($("path, circle", logo), { strokeDashoffset: (i, el) => el.style.strokeDasharray })
        .set(titreV, { y: 0 });
    }).catch(() => { location.href = fichier; });
  }

  D.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (a.target === "_blank" || a.href.indexOf("wa.me") > -1) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    if (fichierDe(href) === fichierDe(location.pathname) && !etat.enTransition) { lenis.scrollTo(0, { duration: 1.4 }); return; }
    aller(href, true);
  });
  addEventListener("popstate", () => aller(fichierDe(location.pathname), false));
  try { history.replaceState({ f: fichierDe(location.pathname) }, ""); } catch (e) {}
  /* Préchargement au survol des liens */
  D.addEventListener("pointerover", e => { const a = e.target.closest("a[data-lien]"); if (a) recuperer(fichierDe(a.getAttribute("href"))).catch(() => {}); });

  /* ======================================================================
     PRÉCHARGEUR : lotus, nom animé, compteur et barre synchronisés
     ====================================================================== */
  const chargeur = $1(".chargeur");
  const premiere = chargeur && !H.classList.contains("deja-vu");
  const intro = initPage(main, { lancer: false });

  if (premiere) {
    lenis.stop();
    if (window.Lotus) Lotus.monter($1(".chargeur__lotus", chargeur));
    const nom = new SplitType($1(".chargeur__nom", chargeur), { types: "chars" });
    g.from(nom.chars, { yPercent: 110, opacity: 0, stagger: .06, duration: 1, ease: "expo.out", delay: .2 });
    g.from($1(".chargeur__metier", chargeur), { opacity: 0, letterSpacing: ".8em", duration: 1.4, delay: .5 });
    const compte = { v: 0 }, num = $1(".chargeur__compteur", chargeur), barreC = $1(".chargeur__barre i", chargeur);
    let pret = false;
    const charge = Promise.all([
      new Promise(r => D.readyState === "complete" ? r() : addEventListener("load", r)),
      D.fonts ? D.fonts.ready : Promise.resolve(),
      new Promise(r => setTimeout(r, 1600))
    ]).then(() => pret = true);
    const avance = g.to(compte, { v: 90, duration: 2.2, ease: "power1.inOut", onUpdate: () => { num.textContent = Math.round(compte.v); g.set(barreC, { scaleX: compte.v / 100 }); } });
    charge.then(() => {
      avance.kill();
      g.timeline()
        .to(compte, { v: 100, duration: .5, onUpdate: () => { num.textContent = Math.round(compte.v); g.set(barreC, { scaleX: compte.v / 100 }); } })
        .to(nom.chars, { yPercent: -110, opacity: 0, stagger: .03, duration: .6, ease: "expo.in" }, "+=.2")
        .to([$1(".chargeur__lotus", chargeur), $1(".chargeur__metier", chargeur), num], { opacity: 0, y: -30, duration: .5 }, "<")
        .to(chargeur, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "-=.2")
        .add(() => { chargeur.classList.add("fini"); lenis.start(); intro.play(); try { sessionStorage.setItem("me-vu", "1"); } catch (e) {} }, "-=.6")
        .set(chargeur, { display: "none" });
    });
  } else {
    if (chargeur) chargeur.remove();
    intro.play();
  }

  /* Notification d'accueil, une fois par visite */
  try {
    if (sessionStorage.getItem("me-notif") !== "1") {
      const auDefil = () => {
        if (scrollY < innerHeight * .9) return;
        removeEventListener("scroll", auDefil);
        notifier("Bienvenue", "Les rendez-vous se prennent sur WhatsApp. Marie Ève répond en général dans la journée.", 6);
        sessionStorage.setItem("me-notif", "1");
      };
      addEventListener("scroll", auDefil, { passive: true });
    }
  } catch (e) {}

  addEventListener("load", () => ST.refresh());
  window.Experience = { notifier: notifier, aller: aller };
})();
