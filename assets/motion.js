/* ==========================================================================
   Motion design : zooms au défilement, particules, relief, transitions.
   Désactivé si le visiteur a demandé à limiter les animations.
   ========================================================================== */
(function () {
  var reduit = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fin = window.matchMedia && matchMedia("(pointer: fine)").matches;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var borne = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Titres : découpage en mots qui sortent du flou ---------- */
  $("h2, .ouverture:not(.ouverture--accueil) h1").forEach(function (h) {
    if (reduit || h.closest(".monte")) return;
    var i = 0;
    (function couper(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (m) {
            if (!m) return;
            if (/^\s+$/.test(m)) { f.appendChild(document.createTextNode(m)); return; }
            var s = document.createElement("span"); s.className = "mot"; s.style.setProperty("--i", i++); s.textContent = m; f.appendChild(s);
          });
          n.replaceChild(f, c);
        } else if (c.nodeType === 1) couper(c);
      });
    })(h);
    h.classList.add("titre-mots");
  });
  if ("IntersectionObserver" in window) {
    var oTitres = new IntersectionObserver(function (e) {
      e.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("titre-vu"); oTitres.unobserve(x.target); } });
    }, { threshold: 0.3 });
    $(".titre-mots").forEach(function (h) { oTitres.observe(h); });
  } else $(".titre-mots").forEach(function (h) { h.classList.add("titre-vu"); });

  /* ---------- Transitions entre les pages ---------- */
  var rideau = document.querySelector(".rideau");
  if (rideau && !reduit) {
    $("a[href$='.html']").forEach(function (a) {
      if (a.hasAttribute("data-wa") && a.href.indexOf("wa.me") > -1) return;
      a.addEventListener("click", function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
        var dest = a.getAttribute("href");
        e.preventDefault();
        rideau.style.setProperty("--x", e.clientX + "px");
        rideau.style.setProperty("--y", e.clientY + "px");
        rideau.classList.add("ferme");
        setTimeout(function () { location.href = dest; }, 650);
      });
    });
    addEventListener("pageshow", function (e) { if (e.persisted) rideau.classList.remove("ferme"); });
  }

  if (reduit) return;

  /* ---------- Apparitions et disparitions ---------- */
  var regles = [
    [".ouverture--accueil .surtitre, .entete-section .surtitre, .bandeau .surtitre, .ouverture .surtitre", "masque-texte"],
    [".entete-section .chapeau, .bandeau .chapeau", "monte"],
    [".bandeau .actions", "zoom"],
    [".defile", "fondu"],
    [".intentions li", "descend"],
    [".grille-3 > .carte", "zoom"],
    [".grille-2 > .carte", "alterne"],
    [".etapes li", "monte"],
    [".communes li", "zoom"],
    [".soin--pile .soin__num", "gauche"],
    [".soin--pile > div:nth-child(2)", "monte"],
    [".soin__infos", "masque"],
    [".valeurs li", "alterne"],
    [".formulaire", "gauche"],
    [".coordonnees li", "droite"],
    [".avertissement", "gauche"],
    [".grille-2 > div:first-child.paraitre", "gauche"],
    [".grille-2 > .paraitre:last-child", "droite"],
    [".pied .conteneur > div", "monte"],
    [".actions:not(.ouverture .actions)", "zoom"]
  ];
  var vus = [];
  regles.forEach(function (r) {
    $(r[0]).forEach(function (el, i) {
      if (el.hasAttribute("data-anim") || el.closest(".ouverture--accueil .ouverture__texte") && r[1] !== "masque-texte") return;
      var type = r[1] === "alterne" ? (Array.prototype.indexOf.call(el.parentNode.children, el) % 2 ? "droite" : "gauche") : r[1];
      el.setAttribute("data-anim", type);
      vus.push(el);
    });
  });
  $(".paraitre").forEach(function (el) {
    if (!el.hasAttribute("data-anim") && !el.querySelector("[data-anim]")) { el.setAttribute("data-anim", "monte"); vus.push(el); }
    el.classList.remove("paraitre");
  });
  /* Cascade : chaque élément attend un peu après son voisin */
  vus.forEach(function (el) {
    var freres = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute("data-anim"); });
    el.style.setProperty("--d", (Math.max(0, freres.indexOf(el)) * 0.12) + "s");
  });
  if ("IntersectionObserver" in window) {
    var oAnim = new IntersectionObserver(function (e) {
      e.forEach(function (x) {
        var el = x.target;
        if (x.isIntersecting) { el.classList.add("anim-vu"); el.classList.remove("anim-parti"); }
        else if (x.boundingClientRect.top < 0) { el.classList.add("anim-parti"); el.classList.remove("anim-vu"); }
        else { el.classList.remove("anim-vu", "anim-parti"); }
      });
    }, { threshold: 0, rootMargin: "-6% 0px -10% 0px" });
    vus.forEach(function (el) { oAnim.observe(el); });
  } else vus.forEach(function (el) { el.classList.add("anim-vu"); });

  /* ---------- Particules dorées ---------- */
  $(".etincelles").forEach(function (cv) {
    var ctx = cv.getContext("2d"), parts = [], W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), visible = true;
    var nuit = !!cv.closest(".section--nuit");
    function taille() {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(W * H / (nuit ? 9000 : 14000)); parts = [];
      for (var i = 0; i < n; i++) parts.push(nouvelle(true));
    }
    function nouvelle(partout) {
      return { x: Math.random() * W, y: partout ? Math.random() * H : H + 10, r: Math.random() * 2.2 + .6,
               v: Math.random() * .35 + .12, d: Math.random() * Math.PI * 2, t: Math.random() * .03 + .01 };
    }
    function dessine() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        parts.forEach(function (p, i) {
          p.y -= p.v; p.d += p.t; p.x += Math.sin(p.d) * .3;
          if (p.y < -10) parts[i] = nouvelle(false);
          var a = .35 + Math.sin(p.d * 2) * .35;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
          ctx.fillStyle = nuit ? "rgba(255,240,210," + a + ")" : (i % 3 ? "rgba(207,174,106," + a + ")" : "rgba(157,120,226," + a + ")");
          ctx.shadowBlur = 8; ctx.shadowColor = nuit ? "rgba(255,230,180,.9)" : "rgba(243,201,138,.9)";
          ctx.fill();
        });
      }
      requestAnimationFrame(dessine);
    }
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(cv);
    if ("ResizeObserver" in window) new ResizeObserver(taille).observe(cv); else taille();
    taille(); dessine();
  });

  /* ---------- Souris : lueur, parallaxe, relief, boutons aimantés ---------- */
  var mx = innerWidth / 2, my = innerHeight / 2, lx = mx, ly = my;
  var lueur = document.querySelector(".lueur");
  if (fin) {
    addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; if (lueur) lueur.classList.add("active"); }, { passive: true });

    $(".relief").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", ((x - .5) * 14) + "deg");
        el.style.setProperty("--rx", ((.5 - y) * 14) + "deg");
        el.style.setProperty("--mx", x * 100 + "%"); el.style.setProperty("--my", y * 100 + "%");
      });
      el.addEventListener("mouseleave", function () { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });

    $(".bouton").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty("--bx", ((e.clientX - r.left - r.width / 2) * .25) + "px");
        b.style.setProperty("--by", ((e.clientY - r.top - r.height / 2) * .35) + "px");
      });
      b.addEventListener("mouseleave", function () { b.style.setProperty("--bx", "0px"); b.style.setProperty("--by", "0px"); });
    });
  }

  /* ---------- Boucle unique : défilement + souris ---------- */
  var texte = document.querySelector(".ouverture--accueil .ouverture__texte");
  var scene = document.querySelector(".ouverture--accueil .scene");
  var profondeurs = $("[data-profondeur]");
  var pistes = $(".defile__piste").map(function (p, i) { return { el: p, x: 0, sens: i % 2 ? 1 : -1 }; });
  var zooms = $(".zoom-ouvre");
  var piles = $(".soin--pile");
  var dernierY = scrollY, vitesse = 0;

  function boucle() {
    var y = scrollY, vh = innerHeight;
    vitesse += ((y - dernierY) - vitesse) * .1; dernierY = y;
    lx += (mx - lx) * .12; ly += (my - ly) * .12;
    var nx = (lx / innerWidth - .5), ny = (ly / innerHeight - .5);

    if (lueur && fin) lueur.style.transform = "translate(" + lx + "px," + ly + "px)";

    /* Ouverture : le texte s'éloigne, le portrait zoome vers vous */
    if (texte && scene) {
      var p = borne(y / (vh * .9), 0, 1);
      texte.style.transform = "translate3d(0," + (p * -60) + "px,0) scale(" + (1 - p * .08) + ")";
      texte.style.opacity = 1 - p * 1.1;
      scene.style.setProperty("--zoom", 1 + p * .35);
    }
    profondeurs.forEach(function (el) {
      var d = parseFloat(el.getAttribute("data-profondeur")) || 0;
      var extra = el.classList.contains("scene") ? " scale(" + (el.style.getPropertyValue("--zoom") || 1) + ")" : "";
      el.style.transform = "translate3d(" + (fin ? nx * d : 0) + "px," + ((fin ? ny * d : 0) + y * d * -.004) + "px,0)" + extra;
    });

    /* Bandes de mots : défilement continu, accéléré par la molette */
    pistes.forEach(function (t) {
      t.x += t.sens * (0.6 + Math.min(Math.abs(vitesse) * .25, 12));
      var w = t.el.scrollWidth / 3;
      if (t.x <= -w) t.x += w; if (t.x > 0) t.x -= w;
      t.el.style.transform = "translate3d(" + t.x + "px,0,0) skewX(" + borne(-vitesse * .4, -12, 12) + "deg)";
    });

    /* Bandeau d'appel : s'ouvre en plein écran */
    zooms.forEach(function (z) {
      var r = z.getBoundingClientRect();
      var q = borne((vh - r.top) / (vh * .8), 0, 1);
      z.style.setProperty("--ins", ((1 - q) * 7) + "%");
      z.style.setProperty("--rayon", ((1 - q) * 60) + "px");
      var c = z.querySelector(".conteneur"); if (c) c.style.transform = "scale(" + (.9 + q * .1) + ")";
    });

    /* Soins empilés : la carte du dessous recule quand la suivante arrive */
    piles.forEach(function (s, i) {
      var suiv = piles[i + 1];
      if (!suiv) return;
      var r = s.getBoundingClientRect(), rs = suiv.getBoundingClientRect();
      var q = borne(1 - (rs.top - r.top) / r.height, 0, 1);
      s.style.setProperty("--recul", 1 - q * .08);
      s.style.setProperty("--lum", 1 - q * .12);
    });

    requestAnimationFrame(boucle);
  }
  requestAnimationFrame(boucle);
})();
