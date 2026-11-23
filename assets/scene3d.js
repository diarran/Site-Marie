/* ==========================================================================
   Scène WebGL (Three.js) : cristal d'améthyste et champ de particules 3D.
   Three.js n'est chargé que lorsqu'une scène est visible (chargement différé).
   La caméra est pilotée par le défilement, le cristal suit la souris.
   ========================================================================== */
window.Scene3D = (function () {
  var chargement = null;
  function chargerThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (chargement) return chargement;
    chargement = new Promise(function (ok, ko) {
      var s = document.createElement("script");
      s.src = "assets/vendor/three.min.js";
      s.onload = function () { ok(window.THREE); };
      s.onerror = ko;
      document.head.appendChild(s);
    });
    return chargement;
  }

  var souris = { x: 0, y: 0 };
  addEventListener("pointermove", function (e) {
    souris.x = e.clientX / innerWidth * 2 - 1;
    souris.y = -(e.clientY / innerHeight * 2 - 1);
  }, { passive: true });

  function texturePoint(THREE) {
    var c = document.createElement("canvas"); c.width = c.height = 64;
    var g = c.getContext("2d"), d = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    d.addColorStop(0, "rgba(255,255,255,1)"); d.addColorStop(.25, "rgba(255,236,200,.8)"); d.addColorStop(1, "rgba(255,236,200,0)");
    g.fillStyle = d; g.fillRect(0, 0, 64, 64);
    var t = new THREE.CanvasTexture(c); return t;
  }

  function cristal(THREE, hauteur, rayon) {
    var g = new THREE.Group();
    var mat = new THREE.MeshPhysicalMaterial({
      color: 0x9d78e2, emissive: 0x2a1650, emissiveIntensity: .35, roughness: .12, metalness: .15,
      clearcoat: 1, clearcoatRoughness: .1, transparent: true, opacity: .9, flatShading: true
    });
    var prisme = new THREE.CylinderGeometry(rayon, rayon * 1.05, hauteur, 6, 1);
    var pointe = new THREE.ConeGeometry(rayon, rayon * 1.6, 6, 1);
    var m1 = new THREE.Mesh(prisme, mat), m2 = new THREE.Mesh(pointe, mat);
    m2.position.y = hauteur / 2 + rayon * .8;
    g.add(m1, m2);
    var lignes = new THREE.LineBasicMaterial({ color: 0xf3c98a, transparent: true, opacity: .55 });
    [m1, m2].forEach(function (m) { var e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), lignes); e.position.copy(m.position); g.add(e); });
    return g;
  }

  function monter(canvas) {
    if (!canvas || canvas.dataset.monte) return null;
    canvas.dataset.monte = "1";
    var detruit = false, visible = true, raf = 0, renderer, io;
    var droite = canvas.hasAttribute("data-cristal-droite");

    chargerThree().then(function (THREE) {
      if (detruit) return;
      var mobile = innerWidth < 860;
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !mobile, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.6));
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(42, 1, .1, 100);
      camera.position.set(0, 0, 9);

      scene.add(new THREE.AmbientLight(0xffffff, .55));
      var cle = new THREE.DirectionalLight(0xfff0d8, 1.4); cle.position.set(4, 6, 6); scene.add(cle);
      var violette = new THREE.PointLight(0xb99bea, 2.2, 30); scene.add(violette);
      var doree = new THREE.PointLight(0xf3c98a, 1.6, 30); doree.position.set(-4, -2, 4); scene.add(doree);

      /* Amas de cristaux */
      var amas = new THREE.Group();
      var principal = cristal(THREE, 2.2, .55); amas.add(principal);
      [[-.75, -.55, .4, 1.3, .34, .35], [.7, -.65, -.2, 1.1, .3, -.4], [.15, -.8, .6, .8, .24, .15], [-.3, -.75, -.6, .9, .26, -.2]].forEach(function (c) {
        var k = cristal(THREE, c[3], c[4]); k.position.set(c[0], c[1], c[2]); k.rotation.z = c[5]; k.rotation.x = c[5] * .6; amas.add(k);
      });
      var socle = new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 0), new THREE.MeshStandardMaterial({ color: 0x5c3f96, roughness: .6, flatShading: true }));
      socle.scale.set(1.3, .45, 1.1); socle.position.y = -1.1; amas.add(socle);
      var ancre = new THREE.Group(); ancre.add(amas); scene.add(ancre);

      /* Anneau doré autour du cristal */
      var anneau = new THREE.Mesh(new THREE.TorusGeometry(2.1, .012, 8, 160), new THREE.MeshBasicMaterial({ color: 0xf3c98a, transparent: true, opacity: .6 }));
      anneau.rotation.x = 1.25; ancre.add(anneau);

      /* Champ de particules 3D */
      var n = mobile ? 700 : 1600, pos = new Float32Array(n * 3), vit = new Float32Array(n);
      for (var i = 0; i < n; i++) {
        var r = 3 + Math.random() * 9, t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(p) * Math.cos(t); pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * .7; pos[i * 3 + 2] = r * Math.cos(p) - 3;
        vit[i] = .002 + Math.random() * .006;
      }
      var geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var poussiere = new THREE.Points(geo, new THREE.PointsMaterial({ size: mobile ? .09 : .075, map: texturePoint(THREE), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xf3d6a8 }));
      scene.add(poussiere);

      function placer() {
        var w = canvas.clientWidth, h = canvas.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h; camera.updateProjectionMatrix();
        var etroit = w < 860;
        var x = droite ? (etroit ? 1.6 : 3.6) : (etroit ? 1.9 : .8);
        ancre.position.set(x, droite ? 0 : (etroit ? 2.6 : -1.15), droite ? 0 : 2);
        var echelle = etroit ? .5 : (droite ? .95 : .5);
        ancre.scale.setScalar(echelle);
      }
      placer();
      var ro = new ResizeObserver(placer); ro.observe(canvas);

      var ray = new THREE.Raycaster(), survol = 0, temps = 0;
      var parent = canvas.parentElement;
      io = new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { rootMargin: "100px" });
      io.observe(parent);

      function boucle() {
        raf = requestAnimationFrame(boucle);
        if (!visible || document.hidden) return;
        temps += .016;
        var r = parent.getBoundingClientRect();
        var defil = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height)));

        /* Caméra pilotée par le défilement */
        camera.position.z = 9 - defil * 3.5;
        camera.position.y = defil * 1.6 + souris.y * .35;
        camera.position.x = souris.x * .5;
        camera.lookAt(0, defil * .8, 0);

        /* Survol du cristal */
        ray.setFromCamera(souris, camera);
        var touche = ray.intersectObject(amas, true).length > 0;
        survol += ((touche ? 1 : 0) - survol) * .08;
        document.documentElement.classList.toggle("survol-cristal", touche);

        amas.rotation.y += .004 + survol * .03;
        amas.rotation.x += ((souris.y * .35) - amas.rotation.x) * .05;
        amas.rotation.z += ((-souris.x * .25) - amas.rotation.z) * .05;
        amas.position.y = Math.sin(temps * 1.2) * .12;
        amas.scale.setScalar(1 + survol * .12 + defil * .25);
        anneau.rotation.z += .003 + survol * .02;
        anneau.rotation.y = Math.sin(temps * .6) * .25;
        violette.position.set(Math.cos(temps) * 3, Math.sin(temps * .7) * 2, 3);

        /* Particules qui montent et fuient la souris */
        var a = geo.attributes.position.array;
        for (var i = 0; i < n; i++) {
          a[i * 3 + 1] += vit[i];
          if (a[i * 3 + 1] > 7) a[i * 3 + 1] = -7;
        }
        geo.attributes.position.needsUpdate = true;
        poussiere.rotation.y += .0008;
        poussiere.position.x += ((souris.x * .6) - poussiere.position.x) * .03;
        poussiere.position.y += ((souris.y * .4) - poussiere.position.y) * .03;

        renderer.render(scene, camera);
      }
      boucle();
      canvas.classList.add("pret");
      canvas._ro = ro;
    }).catch(function () {});

    return function () {
      detruit = true;
      cancelAnimationFrame(raf);
      if (io) io.disconnect();
      if (canvas._ro) canvas._ro.disconnect();
      if (renderer) { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); }
    };
  }
  return { monter: monter, charger: chargerThree };
})();
