/* Animación de entrada de ACJ STUDIOS (~5 s). En el <head>, sin defer y en este orden:
     <link rel="stylesheet" href="acj-intro/acj-intro.css">
     <script src="acj-intro/acj-intro-datos.js"></script>
     <script src="acj-intro/acj-intro.js"></script>
   Secuencia: en la oscuridad se encienden los ojos y parpadean → la franja se forma con granos de arena que llegan con
   el viento → destello → ACJ cae con un golpe → una línea de luz descubre STUDIOS → acercamiento lento → la cámara
   atraviesa los ojos y aparece la web.
   Sale una vez por visita (sessionStorage); ?intro en la URL la fuerza. Se salta con un clic o una tecla. Con
   movimiento reducido, solo un fundido. Las imágenes se buscan en img/ junto a este archivo. */
(function () {
  var D = window.ACJ_INTRO_DATOS;
  if (!D) return;
  var CLAVE = "acjIntroVista";
  var forzar = /[?&]intro\b/.test(location.search);
  try {
    if (!forzar && sessionStorage.getItem(CLAVE)) return;
    sessionStorage.setItem(CLAVE, "1");
  } catch (e) { /* sin sessionStorage: la intro sale siempre */ }

  var src = document.currentScript && document.currentScript.src;
  var base = src ? src.replace(/[^\/]*$/, "") + "img/" : "img/";
  var html = document.documentElement;
  var reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  html.classList.add("acj-intro-activa");

  // tiempos en ms
  var T = {
    ojos: 200, parpadeo: 800, arena: 1000, arenaEscalon: 550, arenaVuelo: 1050, franja: 2250, destello: 2500,
    acj: 2600, golpe: 3000, studios: 2950, studiosDur: 650, salida: 4350, salidaDur: 750
  };
  // ?intro&lento=6: toda la secuencia 6 veces más despacio, para revisarla
  // (lo aplican anima() y la arena; T se queda en tiempos reales)
  var LENTO = parseFloat((location.search.match(/[?&]lento=([\d.]+)/) || [])[1]) || 1;

  function caja(el, c) {
    el.style.left = c.left + "%"; el.style.top = c.top + "%"; el.style.width = c.width + "%"; el.style.height = c.height + "%";
  }

  function montar() {
    var capa = document.createElement("div");
    capa.className = "acj-intro";
    capa.setAttribute("aria-hidden", "true");
    capa.innerHTML =
      '<canvas class="acj-polvo"></canvas>' +
      '<div class="acj-logo"><div class="acj-escala">' +
        '<div class="acj-franja"><img alt="" src="' + base + 'franja.webp">' +
          '<span class="acj-ojo"></span><span class="acj-ojo"></span><span class="acj-destello"></span></div>' +
        '<img class="acj-acj" alt="" src="' + base + 'acj.webp">' +
        '<div class="acj-studios-caja"><img alt="" src="' + base + 'studios.webp"><span class="acj-linea"></span></div>' +
      '</div></div>' +
      '<div class="acj-grano"></div><div class="acj-vineta"></div>';
    document.body.appendChild(capa);

    var q = function (s) { return capa.querySelector(s); };
    var logo = q(".acj-logo"), escala = q(".acj-escala"), franja = q(".acj-franja"), franjaImg = q(".acj-franja img");
    var acj = q(".acj-acj"), stCaja = q(".acj-studios-caja"), linea = q(".acj-linea"), destello = q(".acj-destello");
    var ojos = capa.querySelectorAll(".acj-ojo");
    logo.style.aspectRatio = D.aspecto;
    caja(franja, D.capas.franja); caja(acj, D.capas.acj); caja(stCaja, D.capas.studios);
    D.ojos.forEach(function (o, i) { ojos[i].style.left = o.x + "%"; ojos[i].style.top = o.y + "%"; });
    // la cámara entra entre los dos ojos
    var cx = (D.ojos[0].x + D.ojos[1].x) / 2;
    var cy = D.capas.franja.top + (D.ojos[0].y + D.ojos[1].y) / 2 * D.capas.franja.height / 100;
    logo.style.transformOrigin = cx + "% " + cy + "%";

    var terminado = false, avisado = false, animaciones = [], rafId = 0;
    // la web aparece: se quita la clase y se avisa con «acj-intro-fin» (la web puede esperar a este evento para
    // lanzar sus propias animaciones de entrada, que si no corren por debajo de la intro)
    function mostrarWeb() {
      if (avisado) return;
      avisado = true;
      html.classList.remove("acj-intro-activa");
      window.dispatchEvent(new Event("acj-intro-fin"));
    }
    function quitar() {
      if (terminado) return;
      terminado = true;
      cancelAnimationFrame(rafId);
      mostrarWeb();
      capa.remove();
      document.removeEventListener("keydown", saltar);
    }
    function saltar() {
      if (terminado) return;
      mostrarWeb();
      animaciones.forEach(function (a) { a.pause(); });
      capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "ease-in", fill: "forwards" })
        .onfinish = quitar;
    }
    capa.addEventListener("click", saltar);
    document.addEventListener("keydown", saltar);
    setTimeout(quitar, 9000 * LENTO);                // red de seguridad: la web nunca se queda tapada

    // fill «forwards»: el estado inicial lo pone el CSS. Con «both», una animación que espera aplicaría su primer
    // fotograma desde el principio y pisaría a las anteriores del mismo elemento (el brillo final de los ojos los
    // encendía desde el segundo 0, la salida anulaba el acercamiento)
    function anima(el, kf, ms, retraso, curva, relleno) {
      var a = el.animate(kf, { duration: ms * LENTO, delay: (retraso || 0) * LENTO, easing: curva || "ease",
                               fill: relleno || "forwards" });
      animaciones.push(a);
      return a;
    }

    if (reducido) {
      franjaImg.style.opacity = 1; acj.style.opacity = 1; stCaja.style.clipPath = "none";
      anima(capa, [{ opacity: 1 }, { opacity: 0 }], 500, 1200, "ease-in").onfinish = quitar;
      return;
    }

    // ---------------- 1. los ojos en la oscuridad, con un parpadeo ----------------
    ojos.forEach(function (o) {
      anima(o, [{ opacity: 0, transform: "scale(0.6)" }, { opacity: 1, transform: "scale(1)" }], 500, T.ojos, "ease-out");
      anima(o, [{ transform: "scaleY(1)" }, { transform: "scaleY(0.08)", offset: 0.45 }, { transform: "scaleY(1)" }],
            220, T.parpadeo, "ease-in-out");
      anima(o, [{ opacity: 1 }, { opacity: 0.9, offset: 0.3 }, { opacity: 0.35 }], 900, T.franja, "ease-out");
    });

    // ---------------- 2. la franja se forma con arena ----------------
    arena(capa.querySelector(".acj-polvo"), franja, function () {});
    anima(franjaImg, [{ opacity: 0, filter: "brightness(1.6)" }, { opacity: 1, filter: "brightness(1)" }], 450, T.franja, "ease-out");
    anima(escala, [{ transform: "scale(0.97)" }, { transform: "scale(1)" }], 1800, T.arena, "cubic-bezier(.2,.7,.2,1)", "both");

    // ---------------- 3. destello ----------------
    anima(destello, [{ transform: "translateX(-110%)" }, { transform: "translateX(110%)" }], 700, T.destello, "ease-in-out");

    // ---------------- 4. ACJ cae con un golpe ----------------
    anima(acj, [
      { opacity: 0, transform: "translateY(-45%) scale(1.35)", filter: "blur(10px)" },
      { opacity: 1, transform: "translateY(4%) scale(0.98)", filter: "blur(0)", offset: 0.75 },
      { opacity: 1, transform: "none", filter: "blur(0)" }
    ], 460, T.acj, "cubic-bezier(.5,0,.75,0)");
    anima(logo, [
      { translate: "0 0" }, { translate: "0 0.9%" }, { translate: "0 -0.5%" }, { translate: "0 0.25%" }, { translate: "0 0" }
    ], 260, T.golpe, "ease-out");

    // ---------------- 5. una línea de luz descubre STUDIOS ----------------
    anima(stCaja, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)" }], T.studiosDur, T.studios,
          "cubic-bezier(.6,0,.3,1)");
    anima(linea, [
      { left: "0%", opacity: 0 }, { left: "8%", opacity: 1, offset: 0.1 }, { left: "92%", opacity: 1, offset: 0.9 },
      { left: "100%", opacity: 0 }
    ], T.studiosDur, T.studios, "cubic-bezier(.6,0,.3,1)");

    // ---------------- 6. acercamiento lento y la cámara atraviesa los ojos ----------------
    anima(logo, [{ transform: "scale(1)" }, { transform: "scale(1.035)" }], T.salida - T.golpe, T.golpe, "linear");
    anima(logo, [{ transform: "scale(1.035)" }, { transform: "scale(9)" }], T.salidaDur, T.salida, "cubic-bezier(.7,0,.95,.5)");
    anima(capa, [{ opacity: 1 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], T.salidaDur, T.salida, "ease-in")
      .onfinish = quitar;
    // la web se muestra debajo a mitad de la salida, con el mismo reloj que las animaciones (con setTimeout se
    // desfasaba: la web aparecía con el logo aún sin acercar)
    anima(capa, [{}, {}], T.salida + T.salidaDur * 0.4, 0, "linear").onfinish = mostrarWeb;

    // ---------------- arena: un grano por píxel de la franja pequeña ----------------
    function arena(canvas, destino, hecho) {
      var im = new Image();
      im.onload = function () {
        var w = im.width, h = im.height;
        var c0 = document.createElement("canvas");
        c0.width = w; c0.height = h;
        var x0 = c0.getContext("2d");
        x0.drawImage(im, 0, 0);
        var px = x0.getImageData(0, 0, w, h).data;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W = canvas.width = Math.round(innerWidth * dpr), H = canvas.height = Math.round(innerHeight * dpr);
        var ctx = canvas.getContext("2d");
        var buf = ctx.createImageData(W, H), u32 = new Uint32Array(buf.data.buffer);
        var r = destino.getBoundingClientRect();
        var granos = [];
        var aclara = function (v) { return Math.min(255, 70 + v * 0.85) | 0; };   // tono arena claro
        for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) {
          var k = (j * w + i) * 4;
          if (px[k + 3] < 40 || px[k] + px[k + 1] + px[k + 2] < 45) continue;   // transparente o negro sobre negro
          var tx = (r.left + (i + 0.5) / w * r.width) * dpr, ty = (r.top + (j + 0.5) / h * r.height) * dpr;
          // llegan desde la derecha con el viento, en abanico, y se curvan al posarse
          var sx = tx + (0.35 + Math.random() * 0.9) * W * (Math.random() < 0.85 ? 1 : -1);
          var sy = ty + (Math.random() - 0.5) * H * 0.9;
          granos.push({
            tx: tx, ty: ty, sx: sx, sy: sy,
            cx: (sx + tx) / 2 + (Math.random() - 0.5) * W * 0.25, cy: Math.min(sy, ty) - Math.random() * H * 0.35,
            t0: T.arena + (i / w) * T.arenaEscalon + Math.random() * 180,
            col: (255 << 24) | (px[k + 2] << 16) | (px[k + 1] << 8) | px[k],
            vuelo: (255 << 24) | (aclara(px[k + 2]) << 16) | (aclara(px[k + 1]) << 8) | aclara(px[k])
          });
        }
        var tam = Math.max(1, Math.round(r.width * dpr / w * 0.9));
        function cuadro(ahora) {
          var t = (ahora - t0Intro) / LENTO;
          u32.fill(0);
          var quedan = false;
          for (var n = 0; n < granos.length; n++) {
            var g = granos[n], f = (t - g.t0) / T.arenaVuelo;
            if (f < 0) { quedan = true; continue; }
            if (f > 1) f = 1; else quedan = true;
            var e = 1 - Math.pow(1 - f, 3), a = 1 - e;
            var x = a * a * g.sx + 2 * a * e * g.cx + e * e * g.tx, y = a * a * g.sy + 2 * a * e * g.cy + e * e * g.ty;
            // en vuelo, granos algo más gordos y claros (si no, sobre negro apenas se ven); al posarse, su color
            var xi = x | 0, yi = y | 0, s = f < 1 ? tam + 1 : tam, col = f < 0.92 ? g.vuelo : g.col;
            if (xi < 0 || yi < 0 || xi + s >= W || yi + s >= H) continue;
            for (var yy = 0; yy < s; yy++) { var o = (yi + yy) * W + xi; for (var xx = 0; xx < s; xx++) u32[o + xx] = col; }
          }
          ctx.putImageData(buf, 0, 0);
          if (quedan && !terminado) rafId = requestAnimationFrame(cuadro);
          else hecho();
        }
        // el bucle arranca cuando sale el primer grano: antes no hay nada que pintar
        setTimeout(function () {
          if (!terminado) rafId = requestAnimationFrame(cuadro);
        }, Math.max(0, T.arena * LENTO - (performance.now() - t0Intro)));
        // la arena se funde con la imagen nítida
        anima(canvas, [{ opacity: 1 }, { opacity: 0 }], 400, T.franja + 150, "ease-in");
      };
      im.src = D.puntos;
    }
  }

  var t0Intro = 0;
  function empezar() {
    t0Intro = performance.now();
    montar();
  }
  if (document.body) empezar();
  else document.addEventListener("DOMContentLoaded", empezar);
})();
