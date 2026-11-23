/* ==========================================================================
   Marie Ève Kaya Lopez — liens WhatsApp et formulaire
   ========================================================================== */

/* >>> NUMÉRO WHATSAPP : à remplacer par le vrai numéro, au format
   international sans « + » ni espaces (ex. 33612345678 pour 06 12 34 56 78).
   C'est le seul endroit à modifier : tous les boutons du site l'utilisent. */
var WHATSAPP = "33600000000";

window.Site = (function () {
  function lienWhatsApp(message) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message);
  }
  function messageSoin(soin) {
    var base = "Bonjour Marie Ève, je vous contacte depuis votre site. ";
    if (soin) return base + "Je souhaiterais prendre rendez-vous pour le soin « " + soin + " » à domicile. Quelles sont vos disponibilités ?";
    return base + "Je souhaiterais prendre rendez-vous pour un soin énergétique à domicile. Quelles sont vos disponibilités ?";
  }

  /* Tous les liens [data-wa] ouvrent WhatsApp avec un message prérempli. */
  function relierWhatsApp(racine) {
    (racine || document).querySelectorAll("[data-wa]").forEach(function (b) {
      b.href = lienWhatsApp(messageSoin(b.getAttribute("data-wa")));
      b.target = "_blank";
      b.rel = "noopener";
    });
  }

  /* Formulaire de contact : validation animée, puis ouverture de WhatsApp. */
  function formulaire(racine) {
    var form = (racine || document).querySelector("#formulaire");
    if (!form) return;
    var v = function (id) { var el = form.querySelector("#" + id); return el ? el.value.trim() : ""; };
    form.querySelectorAll(".champ input, .champ textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        var c = el.closest(".champ");
        c.classList.toggle("valide", el.value.trim().length > 1);
        c.classList.remove("erreur");
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var champPrenom = form.querySelector("#prenom").closest(".champ");
      if (!v("prenom")) {
        champPrenom.classList.remove("erreur"); void champPrenom.offsetWidth; champPrenom.classList.add("erreur");
        form.querySelector("#prenom").focus();
        return;
      }
      var lignes = ["Bonjour Marie Ève, je vous contacte depuis votre site.", ""];
      lignes.push("Prénom : " + v("prenom"));
      if (v("soin")) lignes.push("Soin souhaité : " + v("soin"));
      if (v("commune")) lignes.push("Commune (séance à domicile) : " + v("commune"));
      if (v("dispos")) lignes.push("Disponibilités : " + v("dispos"));
      if (v("message")) { lignes.push(""); lignes.push(v("message")); }
      var url = lienWhatsApp(lignes.join("\n"));
      if (window.Experience) Experience.notifier("Message prêt", "WhatsApp s’ouvre avec votre message. Il ne reste qu’à l’envoyer.");
      var a = document.createElement("a");
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
    });
  }

  function initPage(racine) {
    relierWhatsApp(racine);
    formulaire(racine);
    var an = document.getElementById("annee");
    if (an) an.textContent = new Date().getFullYear();
  }

  initPage(document);
  return { initPage: initPage, relierWhatsApp: relierWhatsApp, lienWhatsApp: lienWhatsApp, messageSoin: messageSoin };
})();
