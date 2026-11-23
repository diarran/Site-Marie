/* ==========================================================================
   Lotus animé (Lottie) — l'animation est décrite ici en données Lottie,
   puis jouée par lottie-web, chargé seulement quand on en a besoin.
   ========================================================================== */
window.Lotus = (function () {
  var chargement = null;
  function chargerLottie() {
    if (window.lottie) return Promise.resolve(window.lottie);
    if (chargement) return chargement;
    chargement = new Promise(function (ok, ko) {
      var s = document.createElement("script");
      s.src = "assets/vendor/lottie_light.min.js";
      s.onload = function () { ok(window.lottie); };
      s.onerror = ko;
      document.head.appendChild(s);
    });
    return chargement;
  }

  var E = { i: { x: [0.25, 0.25, 0.25], y: [1, 1, 1] }, o: { x: [0.6, 0.6, 0.6], y: [0, 0, 0] } };
  var E1 = { i: { x: [0.25], y: [1] }, o: { x: [0.6], y: [0] } };
  function kf(t, s, un) { var k = { t: t, s: s }; var e = un ? E1 : E; k.i = e.i; k.o = e.o; return k; }
  function tr() { return { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }; }

  function petale(ind, angle, couleur, opacite, retard, taille) {
    return {
      ddd: 0, ind: ind, ty: 4, nm: "petale" + ind, sr: 1, ao: 0, ip: 0, op: 150, st: 0, bm: 0,
      ks: {
        o: { a: 1, k: [kf(retard, [0], 1), kf(retard + 12, [100], 1)] },
        r: { a: 1, k: [kf(retard, [0], 1), kf(retard + 40, [angle], 1), kf(retard + 80, [angle * 1.08], 1), kf(150, [angle], 1)] },
        p: { a: 0, k: [100, 138, 0] }, a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [kf(retard, [10, 10, 100]), kf(retard + 38, [100, 100, 100]), kf(110, [104, 108, 100]), kf(150, [100, 100, 100])] }
      },
      shapes: [{ ty: "gr", nm: "g", it: [
        { ty: "el", d: 1, p: { a: 0, k: [0, -taille / 2] }, s: { a: 0, k: [taille * 0.38, taille] } },
        { ty: "fl", c: { a: 0, k: couleur }, o: { a: 0, k: opacite }, r: 1 },
        { ty: "st", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 60 }, w: { a: 0, k: 1 }, lc: 2, lj: 2 },
        tr()
      ] }]
    };
  }
  function coeur() {
    return {
      ddd: 0, ind: 99, ty: 4, nm: "coeur", sr: 1, ao: 0, ip: 0, op: 150, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 126, 0] }, a: { a: 0, k: [0, 0, 0] },
            s: { a: 1, k: [kf(30, [0, 0, 100]), kf(60, [110, 110, 100]), kf(75, [100, 100, 100]), kf(112, [118, 118, 100]), kf(150, [100, 100, 100])] } },
      shapes: [{ ty: "gr", it: [
        { ty: "el", d: 1, p: { a: 0, k: [0, 0] }, s: { a: 0, k: [16, 16] } },
        { ty: "fl", c: { a: 0, k: [0.95, 0.79, 0.54, 1] }, o: { a: 0, k: 100 }, r: 1 }, tr()
      ] }]
    };
  }
  function donnees() {
    var violet = [0.55, 0.42, 0.8, 1], lilas = [0.73, 0.61, 0.92, 1], or = [0.95, 0.79, 0.54, 1];
    var couches = [coeur()];
    var p = [[-78, or, 70, 18, 70], [78, or, 70, 18, 70], [-52, lilas, 75, 10, 86], [52, lilas, 75, 10, 86], [-26, violet, 80, 4, 98], [26, violet, 80, 4, 98], [0, lilas, 85, 0, 106]];
    p.forEach(function (x, i) { couches.push(petale(i + 1, x[0], x[1], x[2], x[3], x[4])); });
    return { v: "5.7.4", fr: 30, ip: 0, op: 150, w: 200, h: 200, nm: "lotus", ddd: 0, assets: [], layers: couches };
  }

  function monter(el) {
    if (!el || el.dataset.lotusMonte) return null;
    el.dataset.lotusMonte = "1";
    var anim = null, detruit = false;
    chargerLottie().then(function (lottie) {
      if (detruit) return;
      anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: true, animationData: donnees() });
      anim.addEventListener("complete", function () { anim.loop = true; anim.playSegments([75, 150], true); });
    }).catch(function () {});
    return function () { detruit = true; if (anim) anim.destroy(); };
  }
  return { monter: monter, charger: chargerLottie };
})();
