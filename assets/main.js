/* ==========================================================================
   Marie Ève Kaya Lopez — scripts communs
   ========================================================================== */

/* >>> NUMÉRO WHATSAPP : à remplacer par le vrai numéro, au format
   international sans « + » ni espaces (ex. 33612345678 pour 06 12 34 56 78).
   C'est le seul endroit à modifier : tous les boutons du site l'utilisent. */
var WHATSAPP = "33600000000";

(function () {
  document.documentElement.classList.remove("sans-js");

  function lienWhatsApp(message) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message);
  }

  function messageSoin(soin) {
    var base = "Bonjour Marie Ève, je vous contacte depuis votre site. ";
    if (soin) {
      return base + "Je souhaiterais prendre rendez-vous pour le soin « " + soin + " » à domicile. Quelles sont vos disponibilités ?";
    }
    return base + "Je souhaiterais prendre rendez-vous pour un soin énergétique à domicile. Quelles sont vos disponibilités ?";
  }

  /* Tous les boutons [data-wa] ouvrent WhatsApp avec un message prérempli. */
  var boutons = document.querySelectorAll("[data-wa]");
  for (var i = 0; i < boutons.length; i++) {
    var b = boutons[i];
    b.href = lienWhatsApp(messageSoin(b.getAttribute("data-wa")));
    b.target = "_blank";
    b.rel = "noopener";
  }

  /* Formulaire de la page contact : compose un message WhatsApp complet. */
  var form = document.getElementById("formulaire");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      if (!v("prenom")) { document.getElementById("prenom").focus(); return; }
      var lignes = ["Bonjour Marie Ève, je vous contacte depuis votre site.", ""];
      lignes.push("Prénom : " + v("prenom"));
      if (v("soin")) lignes.push("Soin souhaité : " + v("soin"));
      if (v("commune")) lignes.push("Commune (séance à domicile) : " + v("commune"));
      if (v("dispos")) lignes.push("Disponibilités : " + v("dispos"));
      if (v("message")) { lignes.push(""); lignes.push(v("message")); }
      window.open(lienWhatsApp(lignes.join("\n")), "_blank", "noopener");
    });
  }

  /* Menu mobile */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var ouvert = menu.classList.toggle("ouvert");
      burger.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  /* Apparition douce au défilement */
  var el = document.querySelectorAll(".paraitre");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("vu"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    el.forEach(function (x) { io.observe(x); });
  } else {
    el.forEach(function (x) { x.classList.add("vu"); });
  }

  /* Décalage en cascade des éléments d'une même grille */
  document.querySelectorAll(".grille,.etapes,.communes").forEach(function (g) {
    var enfants = g.querySelectorAll(".paraitre");
    enfants.forEach(function (x, i) { x.style.setProperty("--d", (i * 0.12) + "s"); });
  });

  /* Barre de lecture et halos qui suivent le défilement */
  var reduit = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var barre = document.querySelector(".progression");
  var nuits = document.querySelectorAll(".section--nuit");
  var enCours = false;
  function surDefilement() {
    enCours = false;
    var h = document.documentElement.scrollHeight - innerHeight;
    if (barre) barre.style.setProperty("--lecture", h > 0 ? scrollY / h : 0);
    if (reduit) return;
    nuits.forEach(function (n) {
      var r = n.getBoundingClientRect();
      n.style.setProperty("--p", ((r.top + r.height / 2 - innerHeight / 2) * -0.25) + "px");
    });
  }
  addEventListener("scroll", function () { if (!enCours) { enCours = true; requestAnimationFrame(surDefilement); } }, { passive: true });
  surDefilement();

  var an = document.getElementById("annee");
  if (an) an.textContent = new Date().getFullYear();
})();
