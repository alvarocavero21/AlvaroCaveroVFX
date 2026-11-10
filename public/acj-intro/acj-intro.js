/* ACJ STUDIOS intro v2 (~1.6 s). Loaded in <head>, no defer, after acj-intro.css.
   Sequence (same language as the Hero's GPU embers):
     green embers rise from the bottom of a black screen → they gather into the ACJ STUDIOS logo → the logo lights
     up with a sweep → the black backdrop burns away from the bottom up (an ember edge) revealing the Hero, while the
     logo flies to the Hero logo's exact spot and hands over to it (no fade to black, no cut).
   The Hero logo skips its own entrance when the intro hands over: window.__acjRelevo = true (lib/intro.ts).
   Once per visit (sessionStorage); ?intro forces it, &lento=4 plays it 4× slower. Click or any key skips it.
   Reduced motion: short fade only. */
(function () {
  var CLAVE = "acjIntroVista";
  var forzar = /[?&]intro\b/.test(location.search);
  try {
    if (!forzar && sessionStorage.getItem(CLAVE)) return;
    sessionStorage.setItem(CLAVE, "1");
  } catch (e) { /* no sessionStorage: the intro always plays */ }

  var html = document.documentElement;
  var reducido = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LENTO = parseFloat((location.search.match(/[?&]lento=([\d.]+)/) || [])[1]) || 1;
  var LOGO = "/brand/logo_hero_oscuro.webp";
  html.classList.add("acj-intro-activa");
  window.__acjRelevo = false;

  // times in ms
  var T = { subida: 0, llegada: 520, llegadaVar: 260, logo: 640, destello: 760, web: 900, revela: 940, revelaDur: 620 };
  T.fin = T.revela + T.revelaDur;

  var capa, fondo, canvas, ctx, logoEl, W, H, dpr, terminado = false, avisado = false, raf = 0, t0 = 0;
  var granos = [], chispas = [], rectIntro = null, borde = -1;

  function mostrarWeb() {
    if (avisado) return;
    avisado = true;
    html.classList.remove("acj-intro-activa");
    window.dispatchEvent(new Event("acj-intro-fin"));
  }
  function quitar() {
    if (terminado) return;
    terminado = true;
    cancelAnimationFrame(raf);
    mostrarWeb();
    if (capa) capa.remove();
    document.removeEventListener("keydown", saltar);
  }
  function saltar() {
    if (terminado) return;
    window.__acjRelevo = false;
    mostrarWeb();
    capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: "ease-in", fill: "forwards" }).onfinish = quitar;
  }

  function montar() {
    capa = document.createElement("div");
    capa.className = "acj-intro";
    capa.setAttribute("aria-hidden", "true");
    capa.innerHTML = '<div class="acj-fondo"></div><canvas class="acj-polvo"></canvas>' +
      '<img class="acj-logo" alt="" src="' + LOGO + '"><span class="acj-destello"></span>';
    document.body.appendChild(capa);
    fondo = capa.querySelector(".acj-fondo");
    canvas = capa.querySelector(".acj-polvo");
    logoEl = capa.querySelector(".acj-logo");
    capa.addEventListener("click", saltar);
    document.addEventListener("keydown", saltar);
    setTimeout(quitar, 6000 * LENTO);        // safety net: the page is never left covered

    if (reducido) {
      logoEl.style.opacity = 1;
      mostrarWeb();
      capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, delay: 500, fill: "forwards" }).onfinish = quitar;
      return;
    }
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = Math.round(innerWidth * dpr);
    H = canvas.height = Math.round(innerHeight * dpr);
    ctx = canvas.getContext("2d");

    var im = new Image();
    var listo = false;
    im.onload = function () { if (!listo) { listo = true; preparar(im); } };
    im.onerror = function () { mostrarWeb(); quitar(); };
    im.src = LOGO;
    if (im.complete && im.naturalWidth) im.onload();
    setTimeout(function () { if (!listo) { listo = true; mostrarWeb(); saltar(); } }, 1500);
  }

  // one grain per logo pixel of a small copy of the logo, aimed at the logo's on-screen spot
  function preparar(im) {
    rectIntro = logoEl.getBoundingClientRect();
    var pequeno = innerWidth < 768;
    var cw = pequeno ? 110 : 170, ch = Math.round(cw * im.height / im.width);
    var c0 = document.createElement("canvas");
    c0.width = cw; c0.height = ch;
    var x0 = c0.getContext("2d");
    x0.drawImage(im, 0, 0, cw, ch);
    var px = x0.getImageData(0, 0, cw, ch).data;
    var max = pequeno ? 1300 : 2600, cand = [];
    for (var j = 0; j < ch; j++) for (var i = 0; i < cw; i++) {
      var k = (j * cw + i) * 4;
      if (px[k + 3] > 120 && px[k] + px[k + 1] + px[k + 2] > 60) cand.push(k);
    }
    var paso = Math.max(1, cand.length / max);
    for (var n = 0; n < cand.length; n += paso) {
      var k2 = cand[Math.floor(n)], p = k2 / 4, ii = p % cw, jj = (p - ii) / cw;
      var tx = (rectIntro.left + (ii + 0.5) / cw * rectIntro.width) * dpr;
      var ty = (rectIntro.top + (jj + 0.5) / ch * rectIntro.height) * dpr;
      var sx = tx + (Math.random() - 0.5) * W * 0.55;
      var sy = H + Math.random() * H * 0.35;
      granos.push({
        tx: tx, ty: ty, sx: sx, sy: sy,
        cx: sx + (tx - sx) * 0.3 + (Math.random() - 0.5) * W * 0.2, cy: ty + (sy - ty) * 0.35,
        t1: T.llegada + Math.random() * T.llegadaVar - (1 - jj / ch) * 80,   // the lower rows land first
        fase: Math.random() * 6.28,
        r: px[k2], g: px[k2 + 1], b: px[k2 + 2]
      });
    }
    t0 = performance.now();
    raf = requestAnimationFrame(cuadro);
    // logo lights up as the grains land, with a green sweep
    logoEl.animate([{ opacity: 0, filter: "brightness(2.2) blur(6px)" }, { opacity: 1, filter: "brightness(1) blur(0)" }],
                   { duration: 320 * LENTO, delay: T.logo * LENTO, easing: "ease-out", fill: "forwards" });
    var d = capa.querySelector(".acj-destello");
    d.style.left = rectIntro.left + "px"; d.style.top = rectIntro.top + "px";
    d.style.width = rectIntro.width + "px"; d.style.height = rectIntro.height + "px";
    d.animate([{ transform: "translateX(-60%)", opacity: 0 }, { opacity: 1, offset: 0.3 },
               { transform: "translateX(60%)", opacity: 0 }],
              { duration: 420 * LENTO, delay: T.destello * LENTO, easing: "ease-in-out", fill: "forwards" });
    setTimeout(salida, T.web * LENTO);
  }

  // the page shows up underneath (React mounts the Hero), then the logo flies onto the Hero logo
  function salida() {
    if (terminado) return;
    window.__acjRelevo = true;
    mostrarWeb();
    // two frames so React has mounted and laid out the Hero
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      if (terminado) return;
      var destino = document.querySelector("#coque-title img");
      var dr = destino && destino.getBoundingClientRect();
      if (dr && dr.width > 10) {
        if (destino.currentSrc && destino.currentSrc.indexOf(LOGO) < 0) logoEl.src = destino.currentSrc;   // light theme
        var s = dr.width / rectIntro.width;
        logoEl.animate([{ transform: "translate(0,0) scale(1)" },
                        { transform: "translate(" + (dr.left - rectIntro.left) + "px," + (dr.top - rectIntro.top) + "px) scale(" + s + ")" }],
                       { duration: T.revelaDur * 0.9 * LENTO, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" });
      }
    }); });
  }

  function cuadro(ahora) {
    if (terminado) return;
    var t = (ahora - t0) / LENTO;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    var tam = Math.max(1.5, 1.8 * dpr);

    // 1-2. embers rising and gathering into the logo
    if (t < T.logo + 420) {
      var apaga = 1 - Math.min(1, Math.max(0, (t - T.logo) / 420));
      for (var n = 0; n < granos.length; n++) {
        var g = granos[n], f = Math.min(1, Math.max(0, t / g.t1));
        var e = 1 - Math.pow(1 - f, 3), a = 1 - e;
        var x = a * a * g.sx + 2 * a * e * g.cx + e * e * g.tx + Math.sin(t * 0.012 + g.fase) * 6 * dpr * (1 - e);
        var y = a * a * g.sy + 2 * a * e * g.cy + e * e * g.ty;
        // hot white-green while flying, the logo's own colour once landed
        var cal = 1 - e;
        var r = (g.r * e + 150 * cal) | 0, gg = (g.g * e + 255 * cal) | 0, b = (g.b * e + 195 * cal) | 0;
        ctx.fillStyle = "rgba(" + r + "," + gg + "," + b + "," + (0.9 * apaga) + ")";
        var s = f < 1 ? tam * 1.4 : tam;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }

    // 3. the black backdrop burns away bottom → top; embers break off the burning edge
    if (t >= T.revela) {
      var p = Math.min(1, (t - T.revela) / T.revelaDur);
      p = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var bordeY = (1 - p) * 118 - 9;             // % from the top: below the screen → above it
      var mascara = "linear-gradient(to top, transparent " + (100 - bordeY - 6) + "%, black " + (100 - bordeY + 6) + "%)";
      fondo.style.webkitMaskImage = mascara;
      fondo.style.maskImage = mascara;
      borde = bordeY / 100 * H;
      for (var k = 0; k < (innerWidth < 768 ? 10 : 22); k++) {
        chispas.push({ x: Math.random() * W, y: borde + (Math.random() - 0.5) * 30 * dpr,
                       vx: (Math.random() - 0.5) * 60 * dpr, vy: -(120 + Math.random() * 380) * dpr,
                       vida: 0, dura: 450 + Math.random() * 600, s: (1 + Math.random() * 2) * dpr });
      }
      // glowing edge
      if (borde > -20 * dpr && borde < H + 20 * dpr) {
        var gr = ctx.createLinearGradient(0, borde - 14 * dpr, 0, borde + 14 * dpr);
        gr.addColorStop(0, "rgba(90,202,134,0)");
        gr.addColorStop(0.5, "rgba(170,255,205,0.55)");
        gr.addColorStop(1, "rgba(90,202,134,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(0, borde - 14 * dpr, W, 28 * dpr);
      }
    }
    var dt = 16;
    for (var c = chispas.length - 1; c >= 0; c--) {
      var ch = chispas[c];
      ch.vida += dt;
      if (ch.vida > ch.dura) { chispas.splice(c, 1); continue; }
      ch.x += ch.vx * dt / 1000; ch.y += ch.vy * dt / 1000; ch.vy *= 0.985;
      var v = 1 - ch.vida / ch.dura;
      ctx.fillStyle = "rgba(" + (90 + 140 * v | 0) + ",255," + (134 + 80 * v | 0) + "," + (0.85 * v) + ")";
      ctx.fillRect(ch.x, ch.y, ch.s, ch.s);
    }

    if (t >= T.fin) {
      // hand over: the logo now sits on the Hero logo; the capa goes in a blink
      capa.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).onfinish = quitar;
      return;
    }
    raf = requestAnimationFrame(cuadro);
  }

  if (document.body) montar();
  else document.addEventListener("DOMContentLoaded", montar);
})();
