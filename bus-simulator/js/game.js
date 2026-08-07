/* =====================================================================
   ROTA DO PORTFÓLIO — o tour de ônibus pelo meu portfólio
   Three.js (js/three.min.js) + dados do portfólio (js/data.js) + esta
   lógica de jogo. Projeto local, sem build step — abra index.html.
   ===================================================================== */
(function () {
"use strict";

/* --------------------------------------------------------------------
   CONFIGURAÇÃO GERAL
   -------------------------------------------------------------------- */
var CONFIG = {
  roadWidth: 10,
  roadHalfWidth: 5,
  busLength: 8.4,
  busWidth: 2.4,
  busHalfWidth: 1.2,
  collisionRadius: 1.7,        // raio aproximado do ônibus p/ colisão com obstáculos

  /* ---- modelo de veículo (bicicleta) — dá o raio de giro real do ônibus,
     não um "fator de peso" arbitrário ---- */
  wheelbase: 5.6,               // m entre eixos — quanto maior, mais largo o raio de giro
  maxSteerAngle: 0.62,          // rad (~35°) — esterço máximo das rodas dianteiras
  steerRate: 2.6,               // rad/s — velocidade da direção (não vira o volante instantaneamente)
  gripLateralAccelLimit: 5.4,   // m/s² — acima disso os pneus "lavam" (sub-esterçamento)

  /* ---- motor + câmbio automático (curva de torque simplificada) ----
     cada marcha precisa entregar, na sua própria velocidade de troca, mais
     força que o arrasto naquele ponto — senão o ônibus fica "preso" bem
     abaixo da velocidade máxima, sem nunca conseguir trocar pra próxima. */
  gearUpshiftSpeed: [3.0, 6.0, 9.0],      // m/s — sobe de marcha acima disso
  gearDownshiftSpeed: [2.0, 4.3, 6.8],    // m/s — desce de marcha abaixo disso (histerese)
  gearTopSpeed: [3.0, 6.0, 9.0, 11.5],    // m/s — usado só p/ mapear a faixa de giro (RPM) de cada marcha
  gearBaseAccel: [3.4, 2.5, 2.15, 2.6],   // m/s² de força disponível em cada marcha
  shiftDuration: 0.35,
  shiftTorqueCut: 0.18,

  maxForwardSpeed: 11.5,        // m/s (~41 km/h) — teto real dado pelo equilíbrio força x arrasto
  maxReverseSpeed: -3.0,
  reverseAccel: 1.6,
  reverseBrakeDecel: 3.0,

  dragCoeff: 0.006,
  rollingResistance: 0.45,

  brakeBuildupTime: 0.22,
  brakeReleaseTime: 0.12,
  serviceBrakeDecel: 4.4,

  offRoadDrag: 3.2,
  offRoadPenaltyStrength: 0.16,

  suspPitchSpring: 55, suspPitchDamping: 9,  suspPitchGain: 0.026, maxPitch: 0.10,
  suspRollSpring: 50,  suspRollDamping: 8.5, suspRollGain: 0.034, maxRoll: 0.12,

  cameraKickGain: 0.22, cameraKickSpring: 40, cameraKickDamping: 9, cameraKickMax: 1.6,
  cameraFovBase: 62, cameraFovKmhFactor: 0.09, cameraFovMaxKick: 7,
  mouseLookMaxYaw: Math.PI,     // rad — mouse na borda da tela = 180°, dá pra ver o carro dos 360°
  mouseLookHeightRange: 4.2,    // m — quanto a câmera sobe/desce com o mouse pra cima/baixo
  mouseLookSmoothing: 0.0006,   // quanto menor, mais suave (mais "atraso") o olhar livre responde

  /* ---- câmera do motorista (1ª pessoa) ---- */
  driverEyeHeight: 1.78,          // m — altura absoluta dos olhos do motorista, sentado
  driverEyeInset: 0.32,           // m — o quanto o banco fica pra dentro da lateral do ônibus
  driverEyeSetback: 1.1,          // m — o quanto o banco fica atrás do para-brisa
  driverLookMaxYaw: Math.PI / 2.3, // rad (~78°) — olhar de dentro é mais contido, não uma órbita de 360°

  comfortAccelLimit: 3.4,
  comfortLatAccelLimit: 2.6,
  smoothRegenRate: 9,
  accelDrainRate: 5,
  lateralDrainRate: 5,
  offRoadDrainRate: 10,
  obstacleImpactPenalty: 12,
  incidentCooldownTime: 0.6,

  stopZoneHalfLength: 4.2,
  stopLateralTolerance: 1.6,
  stopMaxSpeed: 0.35,
  stopHoldTime: 0.45,
  stopVicinityRange: 24,
  stopMissDistance: 20,          // m — passou disso sem parar: parada é dada como perdida, HUD mira na próxima
  approachPreviewRange: 50,     // m — distância em que a prévia (só o nome) aparece no HUD
  proximityRevealRange: 26,     // m — distância em que o card completo do projeto já aparece, mesmo em movimento
  busCapacity: 30,

  targetTripTime: 159,          // s — tempo alvo do tour inteiro (rota mais curta, 9 paradas)
};

/* Trajeto: 9 pontos, 8 trechos retos, 7 cruzamentos — um por projeto em
   destaque do portfólio. Garagem no início, Terminal no fim.
   Trechos curtos de propósito: o objetivo é ir de um projeto a outro
   rápido, não fazer uma volta pela cidade inteira. */
var PATH_POINTS = [
  { x: 0,   z: 22 },    // P0 — Garagem
  { x: 0,   z: -20 },   // P1 — cruzamento: Gabriel Airlines
  { x: 38,  z: -20 },   // P2 — cruzamento: GabJets
  { x: 38,  z: -58 },   // P3 — cruzamento: HALPTEC
  { x: -4,  z: -58 },   // P4 — cruzamento: Cléo Móveis
  { x: -4,  z: -96 },   // P5 — cruzamento: Secret Word
  { x: 40,  z: -96 },   // P6 — cruzamento: Você é o bug
  { x: 40,  z: -134 },  // P7 — cruzamento: Número Proibido
  { x: 2,   z: -134 },  // P8 — Terminal
];

/* Distância (m) do início da rota até a vaga de estacionamento de cada
   parada — sempre um pouco ANTES do vértice do cruzamento, com folga
   suficiente pra não sobrepor a colisão do monumento ali plantado. */
var STOP_DISTANCES = [6, 33, 71, 109, 151, 189, 233, 271, 309];

/* --------------------------------------------------------------------
   UTILITÁRIOS DE MATEMÁTICA
   -------------------------------------------------------------------- */
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function vSub(a, b) { return { x: a.x - b.x, z: a.z - b.z }; }
function vLen(a) { return Math.sqrt(a.x * a.x + a.z * a.z); }
function randRange(a, b) { return a + Math.random() * (b - a); }

/* Retângulo com cantos arredondados — usado tanto na carroceria do ônibus
   (extrudada) quanto nas janelas (plana), pra fugir da caixa "de sapato". */
function roundedRectShape(w, h, r) {
  var shape = new THREE.Shape();
  var x = -w / 2, y = -h / 2;
  r = Math.min(r, w / 2, h / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

function pointSegmentInfo(p, a, b) {
  var ab = vSub(b, a);
  var abLen2 = ab.x * ab.x + ab.z * ab.z;
  var t = abLen2 > 1e-6 ? ((p.x - a.x) * ab.x + (p.z - a.z) * ab.z) / abLen2 : 0;
  var tc = clamp(t, 0, 1);
  var closest = { x: a.x + ab.x * tc, z: a.z + ab.z * tc };
  var d = vSub(p, closest);
  var dist = vLen(d);
  var segLen = Math.sqrt(abLen2) || 1;
  var dir = { x: ab.x / segLen, z: ab.z / segLen };
  var right = { x: -dir.z, z: dir.x };
  var lateralSigned = d.x * right.x + d.z * right.z;
  return { dist: dist, t: t, tc: tc, closest: closest, dir: dir, right: right, lateralSigned: lateralSigned };
}

/* --------------------------------------------------------------------
   CONSTRUÇÃO DA ROTA
   -------------------------------------------------------------------- */
var segments = [];
var totalPathLength = 0;
(function buildSegments() {
  for (var i = 0; i < PATH_POINTS.length - 1; i++) {
    var a = PATH_POINTS[i], b = PATH_POINTS[i + 1];
    var d = vSub(b, a);
    var len = vLen(d);
    var dir = { x: d.x / len, z: d.z / len };
    var right = { x: -dir.z, z: dir.x };
    segments.push({ a: a, b: b, dir: dir, right: right, length: len, cumStart: totalPathLength });
    totalPathLength += len;
  }
})();

function pointAtDistance(dist) {
  dist = clamp(dist, 0, totalPathLength);
  for (var i = 0; i < segments.length; i++) {
    var s = segments[i];
    if (dist <= s.cumStart + s.length || i === segments.length - 1) {
      var t = s.length > 0 ? (dist - s.cumStart) / s.length : 0;
      t = clamp(t, 0, 1);
      return {
        x: s.a.x + s.dir.x * s.length * t,
        z: s.a.z + s.dir.z * s.length * t,
        dir: s.dir, right: s.right, segIndex: i,
      };
    }
  }
  var last = segments[segments.length - 1];
  return { x: last.b.x, z: last.b.z, dir: last.dir, right: last.right, segIndex: segments.length - 1 };
}

function distanceToPath(p) {
  var best = Infinity, bestInfo = null;
  for (var i = 0; i < segments.length; i++) {
    var info = pointSegmentInfo(p, segments[i].a, segments[i].b);
    if (info.dist < best) { best = info.dist; bestInfo = info; bestInfo.segIndex = i; }
  }
  return { dist: best, info: bestInfo };
}

/* Ponto de "canto externo" de um vértice de curva — onde plantamos o
   monumento de cada projeto, fora do corredor da pista. */
function outerCorner(vertexIndex, offset) {
  var segIn = segments[vertexIndex - 1], segOut = segments[vertexIndex];
  var v = PATH_POINTS[vertexIndex];
  var rx = segIn.right.x + segOut.right.x, rz = segIn.right.z + segOut.right.z;
  var rl = Math.sqrt(rx * rx + rz * rz) || 1;
  rx /= rl; rz /= rl;
  return { x: v.x + rx * offset, z: v.z + rz * offset, dir: segIn.dir };
}

/* --------------------------------------------------------------------
   PARADAS — Garagem, os 7 projetos (um por cruzamento) e o Terminal
   -------------------------------------------------------------------- */
var STOPS = STOP_DISTANCES.map(function (dist, i) {
  var pt = pointAtDistance(dist);
  var idealLateral = CONFIG.roadHalfWidth - CONFIG.busHalfWidth - 0.4;
  var center = { x: pt.x + pt.right.x * idealLateral, z: pt.z + pt.right.z * idealLateral };

  var kind = "project", project = null, name = "", theme = "purple";
  if (i === 0) { kind = "garage"; name = T("stop.garage"); }
  else if (i === STOP_DISTANCES.length - 1) { kind = "terminal"; name = T("stop.terminal"); theme = "purple"; }
  else {
    project = FEATURED_PROJECTS[i - 1];
    name = L(project.name); // nomes normalmente ficam iguais nos dois idiomas
    theme = project.theme;  // (marca), mas "Você é o bug"/"Número Proibido" têm
  }                          // título traduzido — ver L() em js/i18n.js

  return {
    index: i, kind: kind, name: name, project: project, theme: theme,
    distAlong: dist, roadPoint: { x: pt.x, z: pt.z }, dir: pt.dir, right: pt.right,
    idealLateral: idealLateral, center: center,
    waitingCount: kind === "garage" ? 4 : (kind === "terminal" ? 6 : Math.round(randRange(2, 6))),
    served: false, score: null, vicinityEnteredAt: null, holdTimer: 0,
  };
});

/* Monumentos: um por cruzamento (vértices 1..7 de PATH_POINTS), plantados
   no canto externo da curva. Servem de obstáculo (colisão suave) e de
   "outdoor" 3D do projeto correspondente. */
var MONUMENT_OFFSET = CONFIG.roadHalfWidth + 3.4;
var MONUMENT_RADIUS = 1.6;
var MONUMENTS = [];
for (var mi = 1; mi < PATH_POINTS.length - 1; mi++) {
  var corner = outerCorner(mi, MONUMENT_OFFSET);
  MONUMENTS.push({
    x: corner.x, z: corner.z, dir: corner.dir, radius: MONUMENT_RADIUS,
    stop: STOPS[mi], // paradas 1..7 == projetos 0..6
  });
}
var OBSTACLES = MONUMENTS; // mesma lista serve pra colisão (raio maior, mesmo tratamento suave)

/* --------------------------------------------------------------------
   TEXTURAS GERADAS EM CANVAS (texto, janelas, chips) — sem depender de
   nenhuma fonte de ícone externa.
   -------------------------------------------------------------------- */
function hexToCss(hex) { return "#" + hex.toString(16).padStart(6, "0"); }

function makeTextTexture(text, opts) {
  opts = opts || {};
  var w = opts.w || 512, h = opts.h || 128;
  var canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext("2d");
  if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, w, h); }
  ctx.font = (opts.weight || 800) + " " + (opts.size || 64) + "px " + (opts.font || "Arial, sans-serif");
  ctx.fillStyle = opts.color || "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (opts.stroke) { ctx.lineWidth = opts.strokeWidth || 6; ctx.strokeStyle = opts.stroke; ctx.strokeText(text, w / 2, h / 2); }
  ctx.fillText(text, w / 2, h / 2);
  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function makeChipTexture(text, colorHex) {
  var w = 256, h = 72;
  var canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext("2d");
  var r = h / 2;
  ctx.fillStyle = "rgba(15,12,24,0.92)";
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = hexToCss(colorHex); ctx.lineWidth = 4; ctx.stroke();
  ctx.font = "700 34px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#ffffff"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 2);
  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* Aviso "clique aqui" — pílula chamativa na cor do tema, com o ícone de
   dedo, pra deixar óbvio que o outdoor responde a clique mesmo de longe. */
function makeClickHintTexture(colorHex) {
  var w = 320, h = 80;
  var canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  var ctx = canvas.getContext("2d");
  var r = h / 2;
  ctx.fillStyle = hexToCss(colorHex);
  ctx.beginPath();
  ctx.moveTo(r, 0); ctx.arcTo(w, 0, w, h, r); ctx.arcTo(w, h, 0, h, r); ctx.arcTo(0, h, 0, 0, r); ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.stroke();
  ctx.font = "800 30px 'Segoe UI', Arial, sans-serif";
  ctx.fillStyle = "#0b0716"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("👆 Clique e veja", w / 2, h / 2 + 2);
  var tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/* Textura de janelas para prédios noturnos — uma grade de quadrados, a
   maioria escuros, alguns "aceso" em tom quente/frio aleatório. Gerada
   uma vez e reaproveitada (com tint/repeat variando) em todos os prédios. */
function makeWindowsTexture(cols, rows) {
  var cell = 24;
  var canvas = document.createElement("canvas");
  canvas.width = cols * cell; canvas.height = rows * cell;
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#00000000";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  var warmTones = ["#ffd98a", "#ffe9b0", "#ffc46b"];
  var coolTones = ["#bfe6ff", "#9fd8e6"];
  for (var r = 0; r < rows; r++) {
    for (var c = 0; c < cols; c++) {
      var lit = Math.random() < 0.32;
      var x = c * cell + 3, y = r * cell + 3, s = cell - 6;
      if (lit) {
        var tone = Math.random() < 0.75 ? warmTones[Math.floor(Math.random() * warmTones.length)] : coolTones[Math.floor(Math.random() * coolTones.length)];
        ctx.fillStyle = tone;
        ctx.globalAlpha = randRange(0.55, 1);
      } else {
        ctx.fillStyle = "#0b0b14";
        ctx.globalAlpha = 0.55;
      }
      ctx.fillRect(x, y, s, s);
      ctx.globalAlpha = 1;
    }
  }
  var tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

/* Céu em gradiente (crepúsculo violeta) — muito mais barato que um shader
   customizado e já dá o clima certo pro tema do portfólio. */
function makeSkyTexture() {
  var canvas = document.createElement("canvas");
  canvas.width = 32; canvas.height = 256;
  var ctx = canvas.getContext("2d");
  var g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#05040c");
  g.addColorStop(0.35, "#160f2e");
  g.addColorStop(0.62, "#3b2160");
  g.addColorStop(0.82, "#7a3d8f");
  g.addColorStop(1, "#c8698f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 256);
  var tex = new THREE.CanvasTexture(canvas);
  return tex;
}

/* --------------------------------------------------------------------
   THREE.JS — CENA, CÂMERA, LUZ (crepúsculo/noite sobre a cidade)
   -------------------------------------------------------------------- */
var host = document.getElementById("canvasHost");
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
host.appendChild(renderer.domElement);

var scene = new THREE.Scene();
var skyTex = makeSkyTexture();
scene.background = skyTex;
scene.fog = new THREE.Fog(0x2a1c42, 70, 250);

var camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 12, 30);

var hemiLight = new THREE.HemisphereLight(0x8fa3ff, 0x120a1e, 0.55);
scene.add(hemiLight);
var moonLight = new THREE.DirectionalLight(0xbfd0ff, 0.5);
moonLight.position.set(-60, 90, -30);
scene.add(moonLight);
var ambient = new THREE.AmbientLight(0x4b3570, 0.35);
scene.add(ambient);

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ---- Lua + estrelas ---- */
(function buildSky() {
  var moon = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfef6e0 }));
  moon.position.set(-160, 120, -260);
  scene.add(moon);
  var halo = new THREE.Mesh(new THREE.SphereGeometry(13, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfef6e0, transparent: true, opacity: 0.12 }));
  halo.position.copy(moon.position);
  scene.add(halo);

  var starCount = 500;
  var starGeo = new THREE.BufferGeometry();
  var starPos = new Float32Array(starCount * 3);
  for (var i = 0; i < starCount; i++) {
    var ang = Math.random() * Math.PI * 2;
    var rad = randRange(150, 420);
    starPos[i * 3] = Math.cos(ang) * rad + 40;
    starPos[i * 3 + 1] = randRange(60, 260);
    starPos[i * 3 + 2] = Math.sin(ang) * rad - 150;
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: true, transparent: true, opacity: 0.85 });
  scene.add(new THREE.Points(starGeo, starMat));
})();

/* ---- Chão (grama noturna) ---- */
(function () {
  var g = new THREE.PlaneGeometry(1500, 1500);
  var m = new THREE.MeshLambertMaterial({ color: 0x1c2a1a });
  var mesh = new THREE.Mesh(g, m);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(30, -0.03, -140);
  scene.add(mesh);
})();

/* --------------------------------------------------------------------
   PISTAS: segmentos + calçadas + meio-fio + faixa neon (cor do projeto
   mais próximo adiante) + faixas de pedestre em cada cruzamento.
   -------------------------------------------------------------------- */
var roadGroup = new THREE.Group();
scene.add(roadGroup);
var roadMat = new THREE.MeshPhongMaterial({ color: 0x24232c, shininess: 22, specular: 0x3a3648 });
var curbMat = new THREE.MeshLambertMaterial({ color: 0x2e2b3a });
var sidewalkMat = new THREE.MeshLambertMaterial({ color: 0x9089a3 });
var stripeMat = new THREE.MeshLambertMaterial({ color: 0xe7dfc0 });
var crosswalkMat = new THREE.MeshLambertMaterial({ color: 0xd8d2e8 });

/* cor "dona" de cada segmento = tema do próximo projeto na rota adiante */
function themeColorForSegment(segIndex) {
  var cum = segments[segIndex].cumStart + segments[segIndex].length * 0.5;
  for (var i = 0; i < STOPS.length; i++) {
    if (STOPS[i].distAlong >= cum) return PROJECT_THEMES[STOPS[i].theme].accent;
  }
  return PROJECT_THEMES.purple.accent;
}

function addRoadSegmentMesh(a, b, dir, segIndex) {
  var dx = b.x - a.x, dz = b.z - a.z;
  var len = Math.sqrt(dx * dx + dz * dz);
  var angle = Math.atan2(dx, dz);
  var mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };

  var road = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.roadWidth, 0.2, len + CONFIG.roadWidth), roadMat);
  road.position.set(mid.x, -0.1, mid.z);
  road.rotation.y = angle;
  roadGroup.add(road);

  var neonColor = themeColorForSegment(segIndex);
  var right = { x: Math.cos(angle), z: -Math.sin(angle) };
  var sideW = 3.0, curbW = 0.35, neonW = 0.12;

  [-1, 1].forEach(function (side) {
    var curbOff = CONFIG.roadHalfWidth + curbW / 2;
    var curb = new THREE.Mesh(new THREE.BoxGeometry(curbW, 0.34, len + CONFIG.roadWidth), curbMat);
    curb.position.set(mid.x + right.x * curbOff * side, -0.02, mid.z + right.z * curbOff * side);
    curb.rotation.y = angle;
    roadGroup.add(curb);

    var neonOff = CONFIG.roadHalfWidth + curbW + neonW / 2 + 0.02;
    var neon = new THREE.Mesh(new THREE.BoxGeometry(neonW, 0.06, len + CONFIG.roadWidth), new THREE.MeshBasicMaterial({ color: neonColor }));
    neon.position.set(mid.x + right.x * neonOff * side, 0.16, mid.z + right.z * neonOff * side);
    neon.rotation.y = angle;
    roadGroup.add(neon);

    var swOff = CONFIG.roadHalfWidth + curbW + sideW / 2 + 0.3;
    var sw = new THREE.Mesh(new THREE.BoxGeometry(sideW, 0.22, len + CONFIG.roadWidth), sidewalkMat);
    sw.position.set(mid.x + right.x * swOff * side, -0.08, mid.z + right.z * swOff * side);
    sw.rotation.y = angle;
    roadGroup.add(sw);
  });

  var stripeCount = Math.max(2, Math.floor(len / 6));
  for (var i = 0; i < stripeCount; i++) {
    var t = (i + 0.5) / stripeCount;
    var stripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.24, 2.2), stripeMat);
    stripe.position.set(lerp(a.x, b.x, t), -0.07, lerp(a.z, b.z, t));
    stripe.rotation.y = angle;
    roadGroup.add(stripe);
  }
}
segments.forEach(function (s, i) { addRoadSegmentMesh(s.a, s.b, s.dir, i); });

/* faixas de pedestre em cada cruzamento (vértices internos) */
for (var xi = 1; xi < PATH_POINTS.length - 1; xi++) {
  var v = PATH_POINTS[xi];
  var segRef = segments[xi - 1];
  var ang = Math.atan2(segRef.dir.x, segRef.dir.z);
  for (var s2 = -1; s2 <= 1; s2 += 0.4) {
    if (Math.abs(s2) < 0.05) continue;
    var band = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.roadWidth * 0.85, 0.05, 0.7), crosswalkMat);
    band.position.set(v.x + segRef.right.x * 0, 0.03, v.z + segRef.right.z * 0);
    band.position.x += Math.sin(ang) * s2 * 3.2;
    band.position.z += Math.cos(ang) * s2 * 3.2;
    band.rotation.y = ang;
    roadGroup.add(band);
  }
}

/* --------------------------------------------------------------------
   PRÉDIOS (com janelas iluminadas), ÁRVORES, POSTES E MOBILIÁRIO URBANO
   -------------------------------------------------------------------- */
var buildingColors = [0x241f3d, 0x2c2140, 0x1c2436, 0x33263f, 0x22273f, 0x3a2a3a, 0x202a3a];
var windowsTexBank = [makeWindowsTexture(6, 14), makeWindowsTexture(5, 10), makeWindowsTexture(7, 18)];

function buildingMaterial(colorSide) {
  // reaproveita uma das 3 texturas prontas (sem clonar!) — clonar por prédio
  // criava uma textura nova pra cada um dos ~100+ prédios da cidade, cada
  // uma exigindo seu próprio upload de GPU; isso inflava a memória de vídeo
  // e podia derrubar/recarregar a aba depois de alguns minutos de jogo.
  var tex = windowsTexBank[Math.floor(Math.random() * windowsTexBank.length)];
  return new THREE.MeshLambertMaterial({ color: colorSide, map: tex });
}

(function scatterBuildings() {
  var minX = -70, maxX = 130, minZ = -340, maxZ = 60;
  var cell = 17;
  for (var x = minX; x < maxX; x += cell) {
    for (var z = minZ; z < maxZ; z += cell) {
      var px = x + randRange(2, cell - 2);
      var pz = z + randRange(2, cell - 2);
      var d = distanceToPath({ x: px, z: pz }).dist;
      if (d < CONFIG.roadHalfWidth + 6.5) continue;
      var distToMonument = MONUMENTS.reduce(function (m, mo) { return Math.min(m, Math.hypot(mo.x - px, mo.z - pz)); }, Infinity);
      if (distToMonument < 9) continue; // não sobrepõe os monumentos
      if (Math.random() < 0.3) continue; // lotes vazios / praças

      var w = randRange(5, 9), depth = randRange(5, 9), h = randRange(6, 26);
      var color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, depth), buildingMaterial(color));
      mesh.position.set(px, h / 2, pz);
      mesh.rotation.y = Math.random() * 0.15 - 0.075;
      scene.add(mesh);

      if (Math.random() < 0.55) {
        var roofH = h * 0.16;
        var roof = new THREE.Mesh(new THREE.BoxGeometry(w * 0.55, roofH, depth * 0.55), new THREE.MeshLambertMaterial({ color: 0x14101f }));
        roof.position.set(px, h + roofH / 2, pz);
        scene.add(roof);
        if (Math.random() < 0.4) {
          var antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, randRange(2, 5), 5), new THREE.MeshLambertMaterial({ color: 0x0d0a16 }));
          antenna.position.set(px, h + roofH + 1.5, pz);
          scene.add(antenna);
          var beacon = new THREE.Mesh(new THREE.SphereGeometry(0.16, 6, 5), new THREE.MeshBasicMaterial({ color: 0xff5b5b }));
          beacon.position.set(px, h + roofH + 3, pz);
          scene.add(beacon);
        }
      }
    }
  }

  for (var i = 0; i < 55; i++) {
    var t = Math.random();
    var pt = pointAtDistance(t * totalPathLength);
    var side = Math.random() < 0.5 ? -1 : 1;
    var off = CONFIG.roadHalfWidth + randRange(4.5, 9);
    var tx = pt.x + pt.right.x * off * side;
    var tz = pt.z + pt.right.z * off * side;
    // a pista pode serpentear e passar perto de novo mais adiante — sem essa
    // checagem contra o trajeto INTEIRO (não só o ponto de origem), árvores
    // "deslocadas" de um trecho acabavam caindo em cima da pista em outro.
    if (distanceToPath({ x: tx, z: tz }).dist < CONFIG.roadHalfWidth + 1) continue;
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.4, 6), new THREE.MeshLambertMaterial({ color: 0x4a3222 }));
    trunk.position.set(tx, 0.7, tz);
    scene.add(trunk);
    var topColor = Math.random() < 0.5 ? 0x2f5c39 : 0x274a33;
    var top = new THREE.Mesh(new THREE.ConeGeometry(1.2, 2.4, 7), new THREE.MeshLambertMaterial({ color: topColor }));
    top.position.set(tx, 2.4, tz);
    scene.add(top);
    if (Math.random() < 0.5) {
      var bush = new THREE.Mesh(new THREE.SphereGeometry(0.55, 7, 5), new THREE.MeshLambertMaterial({ color: 0x2b4a30 }));
      bush.scale.y = 0.7;
      bush.position.set(tx + randRange(-0.6, 0.6), 0.4, tz + randRange(-0.6, 0.6));
      scene.add(bush);
    }
  }
})();

/* postes de luz decorativos ao longo das ruas (sem colisão — só ambiente) */
(function scatterLamps() {
  segments.forEach(function (seg) {
    var count = Math.max(1, Math.floor(seg.length / 22));
    for (var i = 0; i < count; i++) {
      var t = (i + 0.5) / count;
      var px = lerp(seg.a.x, seg.b.x, t), pz = lerp(seg.a.z, seg.b.z, t);
      var side = i % 2 === 0 ? 1 : -1;
      var off = CONFIG.roadHalfWidth + 3.6;
      var lx = px + seg.right.x * off * side, lz = pz + seg.right.z * off * side;

      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 4.2, 8), new THREE.MeshLambertMaterial({ color: 0x2a2635 }));
      pole.position.set(lx, 2.1, lz);
      scene.add(pole);
      var armLen = 0.9 * -side;
      var arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, Math.abs(armLen) * 1.3, 6), new THREE.MeshLambertMaterial({ color: 0x2a2635 }));
      arm.rotation.z = Math.PI / 2;
      arm.position.set(lx + armLen * 0.4, 4.1, lz);
      scene.add(arm);
      var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe6a3 }));
      lamp.position.set(lx + armLen * 0.85, 3.95, lz);
      scene.add(lamp);
      var glow = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe6a3, transparent: true, opacity: 0.15 }));
      glow.position.copy(lamp.position);
      scene.add(glow);
    }
  });
})();

/* --------------------------------------------------------------------
   ABRIGOS DE ÔNIBUS (nas paradas reais) — substitui a placa simples
   -------------------------------------------------------------------- */
function buildBusShelter(stop) {
  var group = new THREE.Group();
  var theme = PROJECT_THEMES[stop.theme];
  var ang = Math.atan2(stop.dir.x, stop.dir.z);
  var baseOffset = stop.idealLateral + 2.1;
  var bx = stop.roadPoint.x + stop.right.x * baseOffset;
  var bz = stop.roadPoint.z + stop.right.z * baseOffset;

  var postMat = new THREE.MeshLambertMaterial({ color: 0x3a3550 });
  [-1.6, 1.6].forEach(function (o) {
    var post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 8), postMat);
    post.position.set(bx + Math.sin(ang) * o, 1.3, bz + Math.cos(ang) * o);
    group.add(post);
  });
  var roof = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.12, 1.6), new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.85 }));
  roof.position.set(bx, 2.62, bz);
  roof.rotation.y = ang;
  group.add(roof);
  var glassMat = new THREE.MeshLambertMaterial({ color: 0xaee0ff, transparent: true, opacity: 0.18 });
  var glass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.5, 0.06), glassMat);
  glass.position.set(bx - Math.sin(ang) * 0, 1.5, bz - Math.cos(ang) * 0);
  glass.position.x += Math.cos(ang) * 0.75; glass.position.z -= Math.sin(ang) * 0.75;
  glass.rotation.y = ang;
  group.add(glass);
  var bench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.4, 0.5), new THREE.MeshLambertMaterial({ color: 0x2a2635 }));
  bench.position.set(bx, 0.55, bz);
  bench.rotation.y = ang;
  group.add(bench);

  scene.add(group);
}
STOPS.forEach(function (s) { if (s.kind !== "garage") buildBusShelter(s); });

/* zona pintada na pista em cada parada — feedback de alinhamento em tempo
   real (azul neutro -> âmbar quase lá -> verde, abre a porta), na cor do
   projeto daquela parada. */
function buildStopZone(stop) {
  var theme = PROJECT_THEMES[stop.theme];
  var zoneLen = CONFIG.stopZoneHalfLength * 2;
  var zoneGeo = new THREE.PlaneGeometry(CONFIG.roadWidth * 0.7, zoneLen);
  var zoneMat = new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.3, depthWrite: false });
  var zone = new THREE.Mesh(zoneGeo, zoneMat);
  zone.rotation.x = -Math.PI / 2;
  zone.rotation.z = -Math.atan2(stop.dir.x, stop.dir.z);
  zone.position.set(stop.roadPoint.x, -0.05, stop.roadPoint.z);
  scene.add(zone);
  stop.zoneMat = zoneMat;
  stop.zoneNeutralColor = theme.accent;
}
STOPS.forEach(function (s) { if (s.kind !== "garage") buildStopZone(s); });

/* --------------------------------------------------------------------
   MONUMENTOS DOS PROJETOS — outdoor com o screenshot, aro neon no chão,
   farol-guia e chips de tecnologia flutuantes.
   -------------------------------------------------------------------- */
var textureLoader = new THREE.TextureLoader();

/* Monumentos clicáveis com o mouse, mesmo de longe — cada entrada é
   { mesh: <zona de clique invisível>, stop: <parada correspondente> }. */
var clickableMonuments = [];

function addClickZone(group, stop, localY, radius) {
  var hit = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 8, 6),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  hit.position.set(0, localY, 0);
  group.add(hit);
  clickableMonuments.push({ mesh: hit, stop: stop });
}

function buildProjectMonument(m) {
  var theme = PROJECT_THEMES[m.stop.theme];
  var project = m.stop.project;
  var group = new THREE.Group();
  group.position.set(m.x, 0, m.z);
  var faceAngle = Math.atan2(-m.dir.x, -m.dir.z); // encara quem está chegando
  group.rotation.y = faceAngle;

  // pedestal
  var pedestal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.0), new THREE.MeshLambertMaterial({ color: 0x201c30 }));
  pedestal.position.y = 0.5;
  group.add(pedestal);
  var pedestalTrim = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.08, 1.1), new THREE.MeshBasicMaterial({ color: theme.accent }));
  pedestalTrim.position.y = 1.0;
  group.add(pedestalTrim);

  // coluna
  var column = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), new THREE.MeshLambertMaterial({ color: 0x2a2540 }));
  column.position.y = 1.0 + 1.3;
  group.add(column);

  // outdoor com o screenshot
  var screenW = 3.1, screenH = 1.75;
  var frame = new THREE.Mesh(new THREE.BoxGeometry(screenW + 0.16, screenH + 0.16, 0.1), new THREE.MeshBasicMaterial({ color: theme.accent }));
  frame.position.set(0, 3.55, 0);
  group.add(frame);
  var screenMat = new THREE.MeshBasicMaterial({ color: 0x111018 });
  var screen = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), screenMat);
  screen.position.set(0, 3.55, 0.09);
  group.add(screen);
  if (project) {
    textureLoader.load(project.image, function (tex) {
      tex.encoding = THREE.sRGBEncoding !== undefined ? THREE.sRGBEncoding : tex.encoding;
      screenMat.map = tex;
      screenMat.color.set(0xffffff);
      screenMat.needsUpdate = true;
    });
  }
  // verso do outdoor (pra não ficar "vazado" quando visto de trás)
  var back = new THREE.Mesh(new THREE.PlaneGeometry(screenW, screenH), new THREE.MeshLambertMaterial({ color: 0x191527 }));
  back.position.set(0, 3.55, -0.09);
  back.rotation.y = Math.PI;
  group.add(back);

  // título em canvas-texture acima do outdoor
  var titleTex = makeTextTexture(m.stop.name, { w: 640, h: 120, size: 58, color: "#ffffff", font: "Arial, sans-serif" });
  var titleMat = new THREE.MeshBasicMaterial({ map: titleTex, transparent: true });
  var title = new THREE.Mesh(new THREE.PlaneGeometry(screenW * 1.05, 0.6), titleMat);
  title.position.set(0, 4.62, 0.09);
  group.add(title);

  // aviso pulsante de "clique aqui" — deixa óbvio que o outdoor é clicável
  var hintTex = makeClickHintTexture(theme.accent);
  var hint = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7 * (80 / 320)), new THREE.MeshBasicMaterial({ map: hintTex, transparent: true }));
  hint.position.set(0, 1.7, 0.5);
  hint.userData.pulseSeed = Math.random() * Math.PI * 2;
  group.add(hint);
  clickHints.push(hint);

  // chips de tecnologia flutuando abaixo do outdoor
  var techs = project ? project.tech : [];
  var chipY = 2.35;
  techs.forEach(function (tech, idx) {
    var chipTex = makeChipTexture(tech, theme.accent);
    var chipMat = new THREE.MeshBasicMaterial({ map: chipTex, transparent: true });
    var chipW = 0.85, chipH = chipW * (72 / 256);
    var chip = new THREE.Mesh(new THREE.PlaneGeometry(chipW, chipH), chipMat);
    var spread = (techs.length - 1) * 0.55;
    chip.position.set(-spread / 2 + idx * 1.1, chipY, 0.5);
    chip.userData.floatSeed = Math.random() * Math.PI * 2;
    chip.userData.floatBaseY = chipY;
    group.add(chip);
    floatingChips.push(chip);
  });

  // farol-guia (feixe vertical, ajuda a localizar a próxima exibição de longe)
  var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 9, 6), new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.55 }));
  beam.position.set(0, 8.5, 0);
  group.add(beam);
  var beacon = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: theme.accent }));
  beacon.position.set(0, 13, 0);
  group.add(beacon);
  pulsingBeacons.push({ mesh: beacon, beam: beam, seed: Math.random() * Math.PI * 2 });

  // aro neon no chão em volta do monumento
  var ring = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.15, 24), new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);

  // zona de clique — cobre pedestal + outdoor, bem generosa pra ser fácil de
  // acertar mesmo de longe/em ângulo
  addClickZone(group, m.stop, 2.6, 2.4);

  scene.add(group);
  return group;
}

var floatingChips = [];
var pulsingBeacons = [];
var clickHints = [];
MONUMENTS.forEach(buildProjectMonument);

/* --------------------------------------------------------------------
   TOTENS DA GARAGEM (projetos menores/acadêmicos, só ambientação)
   -------------------------------------------------------------------- */
(function buildGarageTotems() {
  var baseX = -9, baseZ = 26;
  OTHER_PROJECTS.forEach(function (p, i) {
    var gx = baseX - (i % 3) * 4.2;
    var gz = baseZ + Math.floor(i / 3) * 5.2;
    var totem = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.0, 0.5), new THREE.MeshLambertMaterial({ color: 0x252038 }));
    totem.position.set(gx, 1.0, gz);
    scene.add(totem);
    var cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.7), new THREE.MeshBasicMaterial({ color: 0x9089c9 }));
    cap.position.set(gx, 2.04, gz);
    scene.add(cap);
    var labelTex = makeTextTexture(L(p.name), { w: 420, h: 110, size: 46, color: "#e9e4ff" });
    var label = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.45), new THREE.MeshBasicMaterial({ map: labelTex, transparent: true }));
    label.position.set(gx, 2.55, gz);
    scene.add(label);
  });
})();

/* --------------------------------------------------------------------
   MONUMENTO FINAL — Terminal / contato
   -------------------------------------------------------------------- */
(function buildTerminalMonument() {
  var terminalStop = STOPS[STOPS.length - 1];
  var endPt = PATH_POINTS[PATH_POINTS.length - 1];
  var group = new THREE.Group();
  var ang = Math.atan2(-terminalStop.dir.x, -terminalStop.dir.z);
  group.position.set(endPt.x + terminalStop.dir.x * 6, 0, endPt.z + terminalStop.dir.z * 6);
  group.rotation.y = ang;

  var theme = PROJECT_THEMES.purple;
  var pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.9, 1.0, 10), new THREE.MeshLambertMaterial({ color: 0x201c30 }));
  pedestal.position.y = 0.5;
  group.add(pedestal);

  var logoDisc = new THREE.Mesh(new THREE.CircleGeometry(1.3, 24), new THREE.MeshBasicMaterial({ color: 0x0b0716 }));
  logoDisc.position.set(0, 2.6, 0.5);
  group.add(logoDisc);
  textureLoader.load(LOGO_IMAGE, function (tex) {
    logoDisc.material.map = tex;
    logoDisc.material.color.set(0xffffff);
    logoDisc.material.needsUpdate = true;
  });
  var ring2 = new THREE.Mesh(new THREE.RingGeometry(1.3, 1.42, 32), new THREE.MeshBasicMaterial({ color: theme.accent }));
  ring2.position.set(0, 2.6, 0.51);
  group.add(ring2);

  var nameTex = makeTextTexture(CONTACT_INFO.name, { w: 640, h: 120, size: 56, color: "#ffffff" });
  var nameMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.58), new THREE.MeshBasicMaterial({ map: nameTex, transparent: true }));
  nameMesh.position.set(0, 4.2, 0.5);
  group.add(nameMesh);
  var roleTex = makeTextTexture(L(CONTACT_INFO.role), { w: 640, h: 100, size: 40, color: "#c9b8ff" });
  var roleMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.4), new THREE.MeshBasicMaterial({ map: roleTex, transparent: true }));
  roleMesh.position.set(0, 3.75, 0.5);
  group.add(roleMesh);

  var hintTex = makeClickHintTexture(theme.accent);
  var hint = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7 * (80 / 320)), new THREE.MeshBasicMaterial({ map: hintTex, transparent: true }));
  hint.position.set(0, 1.7, 0.9);
  hint.userData.pulseSeed = Math.random() * Math.PI * 2;
  group.add(hint);
  clickHints.push(hint);

  var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 12, 6), new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.6 }));
  beam.position.set(0, 9.5, 0);
  group.add(beam);
  var beacon = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: theme.accent }));
  beacon.position.set(0, 16, 0);
  group.add(beacon);
  pulsingBeacons.push({ mesh: beacon, beam: beam, seed: 0 });

  var ring = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.7, 28), new THREE.MeshBasicMaterial({ color: theme.accent, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(ring);

  addClickZone(group, terminalStop, 2.6, 2.6);

  scene.add(group);
})();

/* --------------------------------------------------------------------
   ÔNIBUS — carroceria em dois tons (base amarela + capacete branco),
   janelas em painéis, espelhos, letreiro de destino dinâmico, emblema
   "G" na lataria e faróis reais.
   -------------------------------------------------------------------- */
var bus = new THREE.Group();
var chassis = new THREE.Group();
var wheelAxleY = 0.55;
var wheelRadius = 0.5;
var wheelSteerPivots = [];
var wheelSpinPivots = [];
var brakeLightMats = [];
var reverseLightMats = [];
var headlightSpots = [];
var destSignMat = null, destSignCanvas = null, destSignCtx = null, destSignTex = null;
var destSignText = "";

function buildDestinationSignTexture() {
  destSignCanvas = document.createElement("canvas");
  destSignCanvas.width = 512; destSignCanvas.height = 96;
  destSignCtx = destSignCanvas.getContext("2d");
  destSignTex = new THREE.CanvasTexture(destSignCanvas);
  return destSignTex;
}
function setDestinationSign(text) {
  if (text === destSignText) return;
  destSignText = text;
  var ctx = destSignCtx, w = destSignCanvas.width, h = destSignCanvas.height;
  ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, w, h);
  ctx.font = "800 30px Arial, sans-serif";
  ctx.fillStyle = "#ffcf4d"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(T("routeAbbrev") + " · " + text.toUpperCase(), w / 2, h / 2 + 2);
  destSignTex.needsUpdate = true;
}

(function buildBus() {
  chassis.position.y = wheelAxleY;
  bus.add(chassis);

  // carroceria com cantos de verdade arredondados (extrusão de um retângulo
  // arredondado ao longo do comprimento) — nada de caixa "de sapato"
  var bodyMat = new THREE.MeshLambertMaterial({ color: 0xf2b705 });
  var lowerH = 1.55, lowerR = 0.22;
  var lowerBodyGeo = new THREE.ExtrudeGeometry(
    roundedRectShape(CONFIG.busWidth, lowerH, lowerR),
    { depth: CONFIG.busLength, bevelEnabled: false, curveSegments: 10 }
  );
  lowerBodyGeo.translate(0, 0, -CONFIG.busLength / 2); // a extrusão sai de Z=0..depth; centraliza no meio do ônibus
  var body = new THREE.Mesh(lowerBodyGeo, bodyMat);
  body.position.y = 0.30 + lowerH / 2 - wheelAxleY;
  chassis.add(body);

  // "capacete" branco no teto — mesmo truque, um pouco mais estreito e curto,
  // sentado bem em cima da carroceria (silhueta de dois tons, como ônibus de verdade)
  var roofMat2 = new THREE.MeshLambertMaterial({ color: 0xffffff });
  var roofH = 0.65, roofR = 0.26;
  var roofGeo = new THREE.ExtrudeGeometry(
    roundedRectShape(CONFIG.busWidth * 0.95, roofH, roofR),
    { depth: CONFIG.busLength * 0.94, bevelEnabled: false, curveSegments: 10 }
  );
  roofGeo.translate(0, 0, -CONFIG.busLength * 0.47);
  var roof = new THREE.Mesh(roofGeo, roofMat2);
  roof.position.y = 0.30 + lowerH + roofH / 2 - wheelAxleY;
  chassis.add(roof);

  // faixa de pintura (livery) — acompanha o comprimento do ônibus
  var stripe = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.busWidth + 0.04, 0.22, CONFIG.busLength * 0.92), new THREE.MeshBasicMaterial({ color: 0x7c3aed }));
  stripe.position.y = 0.35 - wheelAxleY;
  chassis.add(stripe);

  // janelas em painéis arredondados (com montantes finos) em vez de uma caixa única
  var windowMat = new THREE.MeshLambertMaterial({ color: 0x9fd8e6 });
  var mullionMat = new THREE.MeshLambertMaterial({ color: 0xe4e4e4 });
  var paneCount = 6, paneLen = (CONFIG.busLength * 0.74) / paneCount;
  var paneShape = roundedRectShape(paneLen * 0.8, 0.6, 0.09);
  var paneGeo = new THREE.ShapeGeometry(paneShape);
  for (var pi = 0; pi < paneCount; pi++) {
    var pz = -CONFIG.busLength * 0.37 + paneLen * (pi + 0.5);
    [1, -1].forEach(function (sideSign) {
      var pane = new THREE.Mesh(paneGeo, windowMat);
      pane.position.set(sideSign * (CONFIG.busWidth / 2 + 0.02), 1.15 - wheelAxleY, pz);
      pane.rotation.y = sideSign > 0 ? Math.PI / 2 : -Math.PI / 2;
      chassis.add(pane);
    });
  }
  var mullion = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, CONFIG.busLength * 0.76), mullionMat);
  mullion.position.set(CONFIG.busWidth / 2 + 0.01, 1.15 - wheelAxleY, 0);
  chassis.add(mullion);
  var mullion2 = mullion.clone(); mullion2.position.x = -CONFIG.busWidth / 2 - 0.01;
  chassis.add(mullion2);

  var frontWindowShape = roundedRectShape(CONFIG.busWidth * 0.82, 0.68, 0.16);
  var frontWindow = new THREE.Mesh(new THREE.ShapeGeometry(frontWindowShape), windowMat);
  frontWindow.position.set(0, 1.15 - wheelAxleY, -CONFIG.busLength / 2 - 0.02);
  chassis.add(frontWindow);

  // letreiro de destino, acima do para-brisa
  if (!destSignTex) buildDestinationSignTexture();
  var signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.28), new THREE.MeshBasicMaterial({ map: destSignTex }));
  signMesh.position.set(0, 2.02 - wheelAxleY, -CONFIG.busLength / 2 - 0.04);
  chassis.add(signMesh);

  var frontBumper = new THREE.Mesh(new THREE.BoxGeometry(CONFIG.busWidth * 0.95, 0.4, 0.3), new THREE.MeshLambertMaterial({ color: 0x2c2c2c }));
  frontBumper.position.set(0, 0.5 - wheelAxleY, -CONFIG.busLength / 2 - 0.1);
  chassis.add(frontBumper);

  // faróis (lente visível + luz real)
  [-1, 1].forEach(function (side) {
    var lensMat = new THREE.MeshBasicMaterial({ color: 0xfff8dd });
    var lens = new THREE.Mesh(new THREE.CircleGeometry(0.15, 10), lensMat);
    lens.position.set(side * (CONFIG.busWidth / 2 - 0.35), 0.68 - wheelAxleY, -CONFIG.busLength / 2 - 0.12);
    chassis.add(lens);
    var spot = new THREE.SpotLight(0xfff3d2, 0.9, 34, Math.PI / 7, 0.55, 1.4);
    spot.position.set(side * (CONFIG.busWidth / 2 - 0.35), 0.68, -CONFIG.busLength / 2 - 0.1);
    var target = new THREE.Object3D();
    target.position.set(side * 0.4, -2, -CONFIG.busLength);
    bus.add(target);
    spot.target = target;
    bus.add(spot);
    headlightSpots.push(spot);
  });

  // espelhos retrovisores
  [-1, 1].forEach(function (side) {
    var armMirror = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), new THREE.MeshLambertMaterial({ color: 0x1a1a1a }));
    armMirror.rotation.z = Math.PI / 2;
    armMirror.position.set(side * (CONFIG.busWidth / 2 + 0.18), 1.7 - wheelAxleY, -CONFIG.busLength / 2 + 0.35);
    chassis.add(armMirror);
    var mirrorHead = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.28, 0.2), new THREE.MeshLambertMaterial({ color: 0x2c2c2c }));
    mirrorHead.position.set(side * (CONFIG.busWidth / 2 + 0.36), 1.7 - wheelAxleY, -CONFIG.busLength / 2 + 0.35);
    chassis.add(mirrorHead);
  });

  // emblema "G" na lataria (as duas laterais)
  var logoMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  [-1, 1].forEach(function (side) {
    var badge = new THREE.Mesh(new THREE.CircleGeometry(0.32, 16), logoMat);
    badge.position.set(side * (CONFIG.busWidth / 2 + 0.02), 1.1 - wheelAxleY, CONFIG.busLength * 0.37);
    badge.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    chassis.add(badge);
  });
  textureLoader.load(LOGO_IMAGE, function (tex) { logoMat.map = tex; logoMat.needsUpdate = true; });

  var doorMat = new THREE.MeshLambertMaterial({ color: 0xe8e8e8 });
  var door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 1.5), doorMat);
  door.position.set(CONFIG.busWidth / 2 + 0.03, 1.15 - wheelAxleY, CONFIG.busLength * 0.18);
  chassis.add(door);

  // luzes traseiras
  [-1, 1].forEach(function (side) {
    var brakeMat = new THREE.MeshBasicMaterial({ color: 0x661111 });
    var brake = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.06), brakeMat);
    brake.position.set(side * (CONFIG.busWidth / 2 - 0.3), 0.75 - wheelAxleY, CONFIG.busLength / 2 + 0.04);
    chassis.add(brake);
    brakeLightMats.push(brakeMat);

    var revMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
    var rev = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.06), revMat);
    rev.position.set(side * (CONFIG.busWidth / 2 - 0.3), 0.48 - wheelAxleY, CONFIG.busLength / 2 + 0.04);
    chassis.add(rev);
    reverseLightMats.push(revMat);
  });

  // rodas: pivô de esterço (só dianteiras) > pivô de rotação/rolagem (todas) > malha, com calota
  var wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, 0.4, 12);
  var wheelMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
  var hubMat = new THREE.MeshLambertMaterial({ color: 0x8a8a8a });
  [[-1, -1, true], [1, -1, true], [-1, 1, false], [1, 1, false]].forEach(function (p) {
    var sideX = p[0], sideZ = p[1], isFront = p[2];
    var steerPivot = new THREE.Group();
    steerPivot.position.set(sideX * (CONFIG.busWidth / 2 + 0.05), wheelRadius, sideZ * (CONFIG.busLength / 2 - 0.9));
    bus.add(steerPivot);

    var spinPivot = new THREE.Group();
    steerPivot.add(spinPivot);

    var wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.rotation.z = Math.PI / 2;
    spinPivot.add(wheel);
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.42, 10), hubMat);
    hub.rotation.z = Math.PI / 2;
    spinPivot.add(hub);

    wheelSpinPivots.push(spinPivot);
    if (isFront) wheelSteerPivots.push(steerPivot);
  });

  bus.position.set(PATH_POINTS[0].x, 0, PATH_POINTS[0].z);
  scene.add(bus);
})();

/* --------------------------------------------------------------------
   ENTRADA (TECLADO)
   -------------------------------------------------------------------- */
var keys = {};
window.addEventListener("keydown", function (e) {
  var code = e.code;
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyA", "KeyS", "KeyD"].indexOf(code) !== -1) {
    e.preventDefault();
  }
  keys[code] = true;
  if (code === "KeyC" && !e.repeat) toggleCameraMode(); // C — alterna câmera 3ª/1ª pessoa
});
window.addEventListener("keyup", function (e) { keys[e.code] = false; });

function inputThrottle() { return (keys["ArrowUp"] || keys["KeyW"]) ? 1 : 0; }
function inputBrakeOrReverse() { return (keys["ArrowDown"] || keys["KeyS"]) ? 1 : 0; }
function inputSteer() {
  var v = 0;
  if (keys["ArrowLeft"] || keys["KeyA"]) v += 1;
  if (keys["ArrowRight"] || keys["KeyD"]) v -= 1;
  return v;
}

/* Controles de toque (celular/tablet) — simulam as mesmas teclas do teclado
   no mesmo objeto `keys`, então a física nem sabe a diferença. */
function bindTouchButton(id, code) {
  var el = document.getElementById(id);
  if (!el) return;
  var press = function (e) { e.preventDefault(); keys[code] = true; el.classList.add("pressed"); };
  var release = function (e) { if (e) e.preventDefault(); keys[code] = false; el.classList.remove("pressed"); };
  el.addEventListener("pointerdown", press);
  el.addEventListener("pointerup", release);
  el.addEventListener("pointercancel", release);
  el.addEventListener("pointerleave", release);
  el.addEventListener("contextmenu", function (e) { e.preventDefault(); });
}
bindTouchButton("btnGas", "KeyW");
bindTouchButton("btnBrake", "KeyS");
bindTouchButton("btnLeft", "KeyA");
bindTouchButton("btnRight", "KeyD");

/* --------------------------------------------------------------------
   MOUSE — clique num monumento (mesmo de longe) abre o card do projeto;
   o cursor muda pra indicar que é clicável.
   -------------------------------------------------------------------- */
var raycaster = new THREE.Raycaster();
var mouseNDC = new THREE.Vector2();

function pickMonumentAt(evt) {
  var rect = renderer.domElement.getBoundingClientRect();
  mouseNDC.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  mouseNDC.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouseNDC, camera);
  var meshes = clickableMonuments.map(function (c) { return c.mesh; });
  var hits = raycaster.intersectObjects(meshes, false);
  if (!hits.length) return null;
  for (var i = 0; i < clickableMonuments.length; i++) {
    if (clickableMonuments[i].mesh === hits[0].object) return clickableMonuments[i].stop;
  }
  return null;
}

renderer.domElement.addEventListener("click", function (evt) {
  var stop = pickMonumentAt(evt);
  if (stop) {
    manuallyDismissedStop = null; // um clique explícito sempre vale, mesmo que tenha sido fechado antes
    currentlyRevealedStop = stop; // mantém o sistema de proximidade em sincronia — não fecha sozinho no próximo frame
    showProjectReveal(stop);
  }
});

/* olhar livre: a posição do mouse na tela orbita a câmera em volta do
   carro (360°) — mexe o mouse pra ver a frente, a traseira, os lados. */
var mouseLookNX = 0, mouseLookNY = 0;
renderer.domElement.addEventListener("mousemove", function (evt) {
  var rect = renderer.domElement.getBoundingClientRect();
  mouseLookNX = clamp(((evt.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
  mouseLookNY = clamp(((evt.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
  renderer.domElement.style.cursor = pickMonumentAt(evt) ? "pointer" : "";
});
renderer.domElement.addEventListener("mouseleave", function () {
  mouseLookNX = 0; mouseLookNY = 0; // ninguém olhando -> câmera volta pro centro, atrás do carro
});

/* --------------------------------------------------------------------
   ESTADO DO JOGO
   -------------------------------------------------------------------- */
var STATE_GARAGE = "garage", STATE_DRIVING = "driving", STATE_FINISHED = "finished";
var gameState = STATE_GARAGE;

var busState = {
  x: PATH_POINTS[0].x, z: PATH_POINTS[0].z,
  theta: 0,
  speed: 0,

  steerAngle: 0,
  gear: 1,
  rpmFrac: 0,
  shiftTimer: 0,
  brakeIntensity: 0,

  susPitch: 0, susPitchVel: 0,
  susRoll: 0, susRollVel: 0,
  wheelSpin: 0,
};

var trip = {
  timeElapsed: 0,
  paxAboard: 0,
  smoothMeter: 100,
  smoothPenaltyAccum: 0,
  incidentCount: 0,
  currentStopIdx: 0,
  finished: false,
};

var career = loadCareer();
function loadCareer() {
  try {
    var raw = localStorage.getItem("linha42_career");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { totalCoins: 0, tripsCompleted: 0, bestOverall: 0, unlockedBuses: ["classico"], unlockedRoutes: ["linha42"] };
}
function saveCareer() {
  try { localStorage.setItem("linha42_career", JSON.stringify(career)); } catch (e) {}
}

function getForward(theta) { return { x: -Math.sin(theta), z: -Math.cos(theta) }; }

function resetTrip() {
  busState.x = PATH_POINTS[0].x;
  busState.z = PATH_POINTS[0].z;
  var startDir = segments[0].dir;
  busState.theta = Math.atan2(-startDir.x, -startDir.z);
  busState.speed = 0;
  busState.steerAngle = 0;
  busState.gear = 1;
  busState.rpmFrac = 0;
  busState.shiftTimer = 0;
  busState.brakeIntensity = 0;
  busState.susPitch = 0; busState.susPitchVel = 0;
  busState.susRoll = 0; busState.susRollVel = 0;
  busState.wheelSpin = 0;

  trip.timeElapsed = 0;
  trip.paxAboard = 0;
  trip.smoothMeter = 100;
  trip.smoothPenaltyAccum = 0;
  trip.incidentCount = 0;
  trip.currentStopIdx = 0;
  trip.finished = false;

  STOPS.forEach(function (s) {
    s.served = false;
    s.score = null;
    s.vicinityEnteredAt = null;
    s.holdTimer = 0;
  });

  var garageStop = STOPS[0];
  garageStop.served = true;
  garageStop.score = { align: 100, gentle: 100, prompt: 100, total: 100 };
  trip.paxAboard = Math.min(CONFIG.busCapacity, garageStop.waitingCount);
  garageStop.waitingCount = 0;
  trip.currentStopIdx = 1;

  hideProjectReveal();
  currentlyRevealedStop = null;
  manuallyDismissedStop = null;
  document.getElementById("approachPreview").classList.remove("show");
  setDestinationSign(STOPS[1].name);
}
resetTrip();

/* --------------------------------------------------------------------
   FÍSICA DO ÔNIBUS (modelo de bicicleta + câmbio automático simulado +
   arrasto/rolamento + freio a ar com atraso — sem nenhuma physics engine)
   -------------------------------------------------------------------- */
function updateGear(dt, speedAbs) {
  var g = busState.gear;
  busState.shiftTimer = Math.max(0, busState.shiftTimer - dt);

  if (busState.shiftTimer <= 0) {
    if (g < 4 && speedAbs > CONFIG.gearUpshiftSpeed[g - 1]) {
      busState.gear = g + 1;
      busState.shiftTimer = CONFIG.shiftDuration;
    } else if (g > 1 && speedAbs < CONFIG.gearDownshiftSpeed[g - 2]) {
      busState.gear = g - 1;
      busState.shiftTimer = CONFIG.shiftDuration;
    }
  }

  var topSpeed = CONFIG.gearTopSpeed[busState.gear - 1];
  busState.rpmFrac = clamp(speedAbs / topSpeed, 0, 1);
}

function torqueCurve(rpmFrac) {
  return clamp(1.15 - Math.pow(rpmFrac - 0.5, 2) * 2.0, 0.45, 1.15);
}

function updateBusPhysics(dt) {
  var throttle = inputThrottle();
  var brakeRev = inputBrakeOrReverse();
  var steerInput = inputSteer();

  var speed = busState.speed;

  var targetSteer = steerInput * CONFIG.maxSteerAngle;
  busState.steerAngle = lerp(busState.steerAngle, targetSteer, 1 - Math.pow(0.0001, dt * CONFIG.steerRate));

  var brakingForward = brakeRev && speed > 0.05;
  if (brakingForward) {
    busState.brakeIntensity = Math.min(1, busState.brakeIntensity + dt / CONFIG.brakeBuildupTime);
  } else {
    busState.brakeIntensity = Math.max(0, busState.brakeIntensity - dt / CONFIG.brakeReleaseTime);
  }

  updateGear(dt, Math.max(speed, 0));
  var shiftCut = busState.shiftTimer > 0 ? CONFIG.shiftTorqueCut : 1;

  var netAccel = 0;

  if (throttle && speed >= 0) {
    var gearAccel = CONFIG.gearBaseAccel[busState.gear - 1];
    netAccel += gearAccel * torqueCurve(busState.rpmFrac) * shiftCut;
  } else if (throttle && speed < 0) {
    netAccel += CONFIG.reverseBrakeDecel;
  }

  if (brakingForward) {
    netAccel -= CONFIG.serviceBrakeDecel * busState.brakeIntensity;
  } else if (brakeRev && speed <= 0.05 && !throttle) {
    netAccel -= CONFIG.reverseAccel;
  }

  if (Math.abs(speed) > 0.02) {
    var dragDecel = CONFIG.dragCoeff * speed * Math.abs(speed) + CONFIG.rollingResistance * Math.sign(speed);
    netAccel -= dragDecel;
  }

  speed += netAccel * dt;
  if (!throttle && !brakeRev && Math.abs(speed) < 0.03) speed = 0;
  speed = clamp(speed, CONFIG.maxReverseSpeed, CONFIG.maxForwardSpeed);

  var yawRate = (speed / CONFIG.wheelbase) * Math.tan(busState.steerAngle);
  var maxYawRate = CONFIG.gripLateralAccelLimit / Math.max(Math.abs(speed), 1.2);
  yawRate = clamp(yawRate, -maxYawRate, maxYawRate);

  var dTheta = yawRate * dt;
  busState.theta += dTheta;

  var fwd = getForward(busState.theta);
  busState.x += fwd.x * speed * dt;
  busState.z += fwd.z * speed * dt;

  var accel = (speed - busState.speed) / Math.max(dt, 1e-4);
  var lateralAccel = speed * yawRate;
  busState.speed = speed;

  return { dTheta: dTheta, speed: speed, accel: accel, lateralAccel: lateralAccel };
}

/* --------------------------------------------------------------------
   VISUAL DO VEÍCULO: rodas, suspensão, luzes.
   -------------------------------------------------------------------- */
function updateVehicleVisuals(dt, physicsResult) {
  for (var i = 0; i < wheelSteerPivots.length; i++) wheelSteerPivots[i].rotation.y = busState.steerAngle;

  busState.wheelSpin += (busState.speed * dt) / wheelRadius;
  for (var j = 0; j < wheelSpinPivots.length; j++) wheelSpinPivots[j].rotation.x = busState.wheelSpin;

  var pitchTarget = clamp(-physicsResult.accel * CONFIG.suspPitchGain, -CONFIG.maxPitch, CONFIG.maxPitch);
  var rollTarget = clamp(-physicsResult.lateralAccel * CONFIG.suspRollGain, -CONFIG.maxRoll, CONFIG.maxRoll);

  busState.susPitchVel += (CONFIG.suspPitchSpring * (pitchTarget - busState.susPitch) - CONFIG.suspPitchDamping * busState.susPitchVel) * dt;
  busState.susPitch += busState.susPitchVel * dt;
  busState.susRollVel += (CONFIG.suspRollSpring * (rollTarget - busState.susRoll) - CONFIG.suspRollDamping * busState.susRollVel) * dt;
  busState.susRoll += busState.susRollVel * dt;

  chassis.rotation.x = busState.susPitch;
  chassis.rotation.z = busState.susRoll;

  var brakeOn = busState.brakeIntensity > 0.04;
  var brakeColor = brakeOn ? 0xff3b3b : 0x661111;
  for (var k = 0; k < brakeLightMats.length; k++) brakeLightMats[k].color.setHex(brakeColor);
  var revColor = busState.speed < -0.05 ? 0xfff2b0 : 0x555555;
  for (var m = 0; m < reverseLightMats.length; m++) reverseLightMats[m].color.setHex(revColor);
}

/* --------------------------------------------------------------------
   COLISÃO: PISTA (MEIO-FIO) E MONUMENTOS — resposta suave, sem "explosão"
   -------------------------------------------------------------------- */
var collisionFlashTimer = 0;
var incidentCooldown = 0;

function drainSmooth(amount) {
  if (amount <= 0) return;
  trip.smoothMeter = clamp(trip.smoothMeter - amount, 0, 100);
  trip.smoothPenaltyAccum += amount;
}
function maybeCountIncident() {
  if (incidentCooldown <= 0) {
    trip.incidentCount++;
    incidentCooldown = CONFIG.incidentCooldownTime;
  }
}

function updateCollisions(dt) {
  incidentCooldown = Math.max(0, incidentCooldown - dt);

  var pos = { x: busState.x, z: busState.z };
  var res = distanceToPath(pos);
  var offRoadAmount = res.dist - CONFIG.roadHalfWidth;

  var hitSomething = false;

  if (offRoadAmount > 0) {
    hitSomething = true;
    busState.speed *= Math.max(0, 1 - CONFIG.offRoadDrag * dt);
    var info = res.info;
    var pushBackFactor = clamp(offRoadAmount * CONFIG.offRoadPenaltyStrength, 0, 0.9);
    var outX = pos.x - info.closest.x, outZ = pos.z - info.closest.z;
    var outLen = Math.sqrt(outX * outX + outZ * outZ) || 1;
    outX /= outLen; outZ /= outLen;
    busState.x -= outX * pushBackFactor;
    busState.z -= outZ * pushBackFactor;

    drainSmooth(offRoadAmount * CONFIG.offRoadDrainRate * dt);
    maybeCountIncident();
  }

  for (var i = 0; i < OBSTACLES.length; i++) {
    var o = OBSTACLES[i];
    var dx = busState.x - o.x, dz = busState.z - o.z;
    var d = Math.sqrt(dx * dx + dz * dz);
    var minD = o.radius + CONFIG.collisionRadius;
    if (d < minD) {
      hitSomething = true;
      var nx = d > 0.001 ? dx / d : 1, nz = d > 0.001 ? dz / d : 0;
      var overlap = minD - d;
      busState.x += nx * overlap;
      busState.z += nz * overlap;
      busState.speed *= 0.55;

      if (incidentCooldown <= 0) drainSmooth(CONFIG.obstacleImpactPenalty);
      maybeCountIncident();
    }
  }

  if (hitSomething) collisionFlashTimer = 0.25;
  collisionFlashTimer = Math.max(0, collisionFlashTimer - dt);
  document.getElementById("collisionFlash").classList.toggle("show", collisionFlashTimer > 0);

  return hitSomething;
}

/* --------------------------------------------------------------------
   SUAVIDADE DE CONDUÇÃO
   -------------------------------------------------------------------- */
function updateSmoothness(dt, physicsResult) {
  var overAccel = Math.max(0, Math.abs(physicsResult.accel) - CONFIG.comfortAccelLimit);
  var overLat = Math.max(0, Math.abs(physicsResult.lateralAccel) - CONFIG.comfortLatAccelLimit);

  if (overAccel > 0) { drainSmooth(overAccel * CONFIG.accelDrainRate * dt); maybeCountIncident(); }
  if (overLat > 0) { drainSmooth(overLat * CONFIG.lateralDrainRate * dt); maybeCountIncident(); }

  trip.smoothMeter = clamp(trip.smoothMeter + CONFIG.smoothRegenRate * dt, 0, 100);
}

/* --------------------------------------------------------------------
   PARADAS: aproximação, alinhamento, embarque/desembarque, revelação
   -------------------------------------------------------------------- */
function showStationMessage(text, duration) {
  var el = document.getElementById("stationMsg");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(el._hideTimeout);
  el._hideTimeout = setTimeout(function () { el.classList.remove("show"); }, duration || 2200);
}

function updateStops(dt) {
  if (trip.currentStopIdx >= STOPS.length) return;

  var busPos = { x: busState.x, z: busState.z };
  var nearest = distanceToPath(busPos);
  var seg = segments[nearest.info.segIndex];
  var distAlongBus = seg.cumStart + nearest.info.tc * seg.length;

  // se o ônibus já passou muito da parada atual sem ter parado ali, ela é
  // dada como "perdida" (sem nota) e o alvo avança pra próxima — sem isso,
  // o card "Próxima exibição" ficava travado pra sempre na parada que
  // tinha sido passada direto, em vez de ir mostrando os próximos projetos
  // conforme o jogador seguia dirigindo.
  while (trip.currentStopIdx < STOPS.length &&
         !STOPS[trip.currentStopIdx].served &&
         distAlongBus - STOPS[trip.currentStopIdx].distAlong > CONFIG.stopMissDistance) {
    missStop(STOPS[trip.currentStopIdx]);
  }
  if (trip.currentStopIdx >= STOPS.length) return;

  var stop = STOPS[trip.currentStopIdx];
  var longError = distAlongBus - stop.distAlong;
  var lateralError = nearest.info.lateralSigned - stop.idealLateral;

  var withinVicinity = Math.abs(longError) < CONFIG.stopVicinityRange;
  if (withinVicinity && stop.vicinityEnteredAt === null) {
    stop.vicinityEnteredAt = trip.timeElapsed;
    stop.harshEventsAtEntry = trip.incidentCount;
  }
  if (!withinVicinity && stop.vicinityEnteredAt !== null && !stop.served) {
    stop.vicinityEnteredAt = null;
  }

  var withinPreview = longError < 0 && Math.abs(longError) < CONFIG.approachPreviewRange;
  updateApproachPreview(stop, withinPreview);
  updateProximityReveals(distAlongBus);

  var alignedLong = Math.abs(longError) <= CONFIG.stopZoneHalfLength;
  var alignedLat = Math.abs(lateralError) <= CONFIG.stopLateralTolerance;
  var stopped = Math.abs(busState.speed) <= CONFIG.stopMaxSpeed;
  var validNow = alignedLong && alignedLat && stopped;

  if (stop.zoneMat) {
    if (validNow) stop.zoneMat.color.setHex(0x4fd88a);
    else if (alignedLong && stopped) stop.zoneMat.color.setHex(0xffb648);
    else stop.zoneMat.color.setHex(stop.zoneNeutralColor);
  }

  if (validNow) stop.holdTimer += dt; else stop.holdTimer = 0;

  if (stop.holdTimer >= CONFIG.stopHoldTime && !stop.served) {
    resolveStop(stop, longError, lateralError);
  }

  updateStopHud(stop, distAlongBus);
}

/* Marca uma parada como "perdida" (dirigiu direto, sem estacionar) — sem
   nota pra ela (conta 0 no cálculo final, como já previa finishTrip()),
   mas o tour segue e o HUD passa a mirar na próxima parada na hora. */
function missStop(stop) {
  stop.served = true;
  stop.vicinityEnteredAt = null;
  if (stop.zoneMat) stop.zoneMat.color.setHex(stop.zoneNeutralColor);
  document.getElementById("approachPreview").classList.remove("show");
  showStationMessage(T("msg.missedStop", { name: stop.name }), 2000);

  trip.currentStopIdx++;
  if (trip.currentStopIdx < STOPS.length) setDestinationSign(STOPS[trip.currentStopIdx].name);
  if (trip.currentStopIdx >= STOPS.length) finishTrip();
}

function updateApproachPreview(stop, show) {
  var el = document.getElementById("approachPreview");
  if (stop.served) { el.classList.remove("show"); return; }
  if (show) {
    document.getElementById("approachName").textContent = stop.name;
    var theme = PROJECT_THEMES[stop.theme];
    document.documentElement.style.setProperty("--proj-accent", hexToCss(theme.accent));
    el.classList.add("show");
  } else {
    el.classList.remove("show");
  }
}

/* Revelação automática por proximidade — independente da sequência de
   paradas: mostra o card do projeto MAIS PRÓXIMO sempre que ele estiver
   dentro do alcance, e esconde assim que o carro se afasta. Funciona pra
   qualquer projeto, na ordem que for, não só o primeiro — e não depende
   de ter estacionado certinho em nenhum deles. */
var currentlyRevealedStop = null;
var manuallyDismissedStop = null;

function updateProximityReveals(distAlongBus) {
  var nearest = null, nearestDist = Infinity;
  for (var i = 0; i < STOPS.length; i++) {
    var s = STOPS[i];
    if (s.kind === "garage") continue;
    var d = Math.abs(distAlongBus - s.distAlong);
    if (d < nearestDist) { nearestDist = d; nearest = s; }
  }
  var shouldShow = (nearest && nearestDist < CONFIG.proximityRevealRange) ? nearest : null;

  // se afastou do que tinha sido fechado manualmente — "esquece" o fechamento,
  // pra poder abrir de novo numa próxima aproximação
  if (shouldShow !== manuallyDismissedStop) manuallyDismissedStop = null;

  var effectiveShow = (shouldShow && shouldShow !== manuallyDismissedStop) ? shouldShow : null;

  if (effectiveShow !== currentlyRevealedStop) {
    if (currentlyRevealedStop) hideProjectReveal();
    if (effectiveShow) showProjectReveal(effectiveShow);
    currentlyRevealedStop = effectiveShow;
  }
}

function resolveStop(stop, longError, lateralError) {
  stop.served = true;

  var alignScore = 100 * clamp(1 - (Math.abs(longError) / CONFIG.stopZoneHalfLength) * 0.5
                                  - (Math.abs(lateralError) / CONFIG.stopLateralTolerance) * 0.5, 0, 1);

  var maneuverTime = stop.vicinityEnteredAt !== null ? (trip.timeElapsed - stop.vicinityEnteredAt) : 6;
  var promptScore = clamp(100 - Math.max(0, maneuverTime - 5) * 8, 35, 100);

  var harshDuringApproach = trip.incidentCount - (stop.harshEventsAtEntry || 0);
  var gentleScore = clamp(100 - harshDuringApproach * 22, 10, 100);

  var stopScore = alignScore * 0.5 + gentleScore * 0.3 + promptScore * 0.2;
  stop.score = { align: alignScore, gentle: gentleScore, prompt: promptScore, total: stopScore };

  var alighting = trip.paxAboard > 0 ? Math.min(trip.paxAboard, Math.round(trip.paxAboard * randRange(0.25, 0.6))) : 0;
  trip.paxAboard -= alighting;
  var boarding = Math.min(stop.waitingCount, CONFIG.busCapacity - trip.paxAboard);
  trip.paxAboard += boarding;
  stop.waitingCount -= boarding;

  showStationMessage(T("msg.servedStopScore", { name: stop.name, score: Math.round(stopScore) }) +
    (boarding || alighting ? T("msg.boardAlight", { boarding: boarding, alighting: alighting }) : ""), 2600);

  document.getElementById("approachPreview").classList.remove("show");
  currentlyRevealedStop = stop; // sincroniza com o sistema de proximidade, pra não fechar sozinho no próximo frame
  showProjectReveal(stop);

  trip.currentStopIdx++;
  if (trip.currentStopIdx < STOPS.length) setDestinationSign(STOPS[trip.currentStopIdx].name);

  if (trip.currentStopIdx >= STOPS.length) finishTrip();
}

/* --------------------------------------------------------------------
   PAINEL DE REVELAÇÃO DO PROJETO
   -------------------------------------------------------------------- */
var revealHideTimer = null;
function showProjectReveal(stop) {
  var el = document.getElementById("projectReveal");
  var theme = PROJECT_THEMES[stop.theme];
  document.documentElement.style.setProperty("--proj-accent", hexToCss(theme.accent));

  if (stop.kind === "project") {
    var p = stop.project;
    var pname = L(p.name);
    document.getElementById("revealEyebrow").textContent = T("reveal.featuredTag");
    document.getElementById("revealImage").src = p.image;
    document.getElementById("revealImage").alt = pname;
    document.getElementById("revealTitle").textContent = pname;
    document.getElementById("revealDesc").textContent = L(p.desc);
    document.getElementById("revealTechs").innerHTML = p.tech.map(function (t) {
      return '<span class="tech-chip">' + t + '</span>';
    }).join("");
    document.getElementById("revealLinks").innerHTML =
      '<a class="secondary" target="_blank" rel="noopener" href="' + p.github + '">' + T("reveal.linkCode") + '</a>' +
      '<a class="primary" target="_blank" rel="noopener" href="' + p.live + '">' + T("reveal.linkLive") + '</a>';
  } else if (stop.kind === "terminal") {
    document.getElementById("revealEyebrow").textContent = T("reveal.endOfLine");
    document.getElementById("revealImage").src = LOGO_IMAGE;
    document.getElementById("revealImage").alt = CONTACT_INFO.name;
    document.getElementById("revealTitle").textContent = T("reveal.terminalTitle");
    document.getElementById("revealDesc").textContent = T("reveal.terminalDesc", { name: CONTACT_INFO.name, role: L(CONTACT_INFO.role) });
    document.getElementById("revealTechs").innerHTML = "";
    document.getElementById("revealLinks").innerHTML =
      '<a class="secondary" target="_blank" rel="noopener" href="' + CONTACT_INFO.github + '">GitHub</a>' +
      '<a class="secondary" href="mailto:' + CONTACT_INFO.email + '">' + T("reveal.linkEmail") + '</a>' +
      '<a class="primary" target="_blank" rel="noopener" href="' + CONTACT_INFO.linkedin + '">LinkedIn</a>';
  }

  if (stop.score) {
    document.getElementById("revealScore").innerHTML =
      "<span>" + T("reveal.scoreAlign") + " <b>" + Math.round(stop.score.align) + "</b></span>" +
      "<span>" + T("reveal.scoreSmooth") + " <b>" + Math.round(stop.score.gentle) + "</b></span>" +
      "<span>" + T("reveal.scorePrompt") + " <b>" + Math.round(stop.score.prompt) + "</b></span>";
  } else {
    document.getElementById("revealScore").innerHTML = ""; // limpa a nota de uma exibição anterior — esse aqui ainda não foi resolvido
  }

  el.classList.add("show");
}
function hideProjectReveal() {
  document.getElementById("projectReveal").classList.remove("show");
}
document.getElementById("revealClose").addEventListener("click", function () {
  hideProjectReveal();
  manuallyDismissedStop = currentlyRevealedStop;
  currentlyRevealedStop = null;
});

/* --------------------------------------------------------------------
   HUD — ATUALIZAÇÃO
   -------------------------------------------------------------------- */
var stopDotsBuilt = false;
function buildStopDots() {
  var wrap = document.getElementById("stopDots");
  wrap.innerHTML = "";
  STOPS.forEach(function () {
    var d = document.createElement("div");
    d.className = "stopDot";
    wrap.appendChild(d);
  });
  stopDotsBuilt = true;
}

function updateStopHud(stop, distAlongBus) {
  if (!stopDotsBuilt) buildStopDots();
  document.getElementById("stopName").textContent = stop.name;
  var distRemaining = Math.max(0, Math.round(stop.distAlong - distAlongBus));
  document.getElementById("stopDistance").textContent = distRemaining;

  var toStopX = stop.center.x - busState.x, toStopZ = stop.center.z - busState.z;
  var bearing = Math.atan2(toStopX, toStopZ);
  var relative = bearing - (Math.atan2(-Math.sin(busState.theta), -Math.cos(busState.theta)));
  document.getElementById("stopArrow").style.transform = "rotate(" + relative + "rad)";

  var dots = document.querySelectorAll("#stopDots .stopDot");
  STOPS.forEach(function (s, i) {
    var el = dots[i];
    if (!el) return;
    el.classList.toggle("done", s.served);
    el.classList.toggle("active", i === trip.currentStopIdx && !s.served);
  });

  document.getElementById("paxAboard").textContent = trip.paxAboard + " / " + CONFIG.busCapacity;
  document.getElementById("paxWaiting").textContent = T("hud.waitingAtStop", { n: stop.waitingCount });
}

function updateHudCommon() {
  var kmh = Math.round(Math.abs(busState.speed) * 3.6);
  document.getElementById("speedValue").textContent = kmh;

  var isReverse = busState.speed < -0.05;
  var gears = T("gears"); // ["1ª".."4ª"] ou ["1st".."4th"], ver js/i18n.js
  document.getElementById("gearLabel").textContent = isReverse ? "R" : gears[busState.gear - 1];
  var rpmPct = isReverse ? 35 : Math.round(busState.rpmFrac * 100);
  var rpmFill = document.getElementById("rpmFill");
  rpmFill.style.width = rpmPct + "%";
  rpmFill.style.background = rpmPct > 82 ? "#ffb648" : "#ffcf4d";

  var smoothPct = trip.smoothMeter;
  var fill = document.getElementById("smoothFill");
  fill.style.width = smoothPct + "%";
  var color = smoothPct > 66 ? "#4fd88a" : (smoothPct > 33 ? "#ffb648" : "#ff6b6b");
  fill.style.background = color;
  var caption = document.getElementById("smoothCaption");
  caption.textContent = smoothPct > 80 ? T("smooth.flawless") : smoothPct > 50 ? T("smooth.good") : smoothPct > 25 ? T("smooth.harsh") : T("smooth.veryHarsh");

  var t = Math.floor(trip.timeElapsed);
  var mm = Math.floor(t / 60), ss = t % 60;
  document.getElementById("timerValue").textContent = mm + ":" + (ss < 10 ? "0" : "") + ss;
}

/* --------------------------------------------------------------------
   CÂMERA
   -------------------------------------------------------------------- */
var camCurrent = { x: bus.position.x, y: 12, z: bus.position.z + 20 };
var camKick = 0, camKickVel = 0;

var debugFreezeCamera = false; // hook de depuração — trava o chase-cam pra inspecionar o modelo de perto
var camOrbitYaw = 0, camOrbitHeight = 0; // suavizados a partir da posição do mouse — olhar livre

/* Duas câmeras: "chase" (padrão, de fora, olhando o ônibus) e "driver"
   (1ª pessoa, do banco do motorista, olhando pelo para-brisa) — alternadas
   pelo botão do HUD ou pela tecla C, ver toggleCameraMode(). */
var CAMERA_CHASE = "chase", CAMERA_DRIVER = "driver";
var cameraMode = CAMERA_CHASE;

function updateCamera(dt, physicsResult) {
  if (debugFreezeCamera) return;
  if (cameraMode === CAMERA_DRIVER) updateDriverCamera(dt);
  else updateChaseCamera(dt, physicsResult);
  applyFovKick(dt);
}

function updateChaseCamera(dt, physicsResult) {
  var accel = physicsResult ? physicsResult.accel : 0;

  var kickTarget = clamp(-accel * CONFIG.cameraKickGain, -CONFIG.cameraKickMax, CONFIG.cameraKickMax);
  camKickVel += (CONFIG.cameraKickSpring * (kickTarget - camKick) - CONFIG.cameraKickDamping * camKickVel) * dt;
  camKick += camKickVel * dt;

  // olhar livre: a posição do mouse na tela define o ângulo de órbita e a
  // altura da câmera em volta do carro — solta o mouse e ela volta pra
  // atrás dele sozinha.
  var orbitSmooth = 1 - Math.pow(CONFIG.mouseLookSmoothing, dt);
  camOrbitYaw = lerp(camOrbitYaw, mouseLookNX * CONFIG.mouseLookMaxYaw, orbitSmooth);
  camOrbitHeight = lerp(camOrbitHeight, -mouseLookNY * CONFIG.mouseLookHeightRange, orbitSmooth);

  var viewTheta = busState.theta + camOrbitYaw;
  var viewFwd = getForward(viewTheta);
  var camDist = 13 + camKick, camHeight = 6.2 + camOrbitHeight;
  var desired = { x: busState.x - viewFwd.x * camDist, y: camHeight, z: busState.z - viewFwd.z * camDist };
  var followLerp = 1 - Math.pow(0.0008, dt);
  camCurrent.x = lerp(camCurrent.x, desired.x, followLerp);
  camCurrent.y = lerp(camCurrent.y, desired.y, followLerp);
  camCurrent.z = lerp(camCurrent.z, desired.z, followLerp);

  camera.position.set(camCurrent.x, camCurrent.y, camCurrent.z);

  // olhando de frente/de lado, a câmera encara o carro; olhando de trás
  // (posição padrão), continua "olhando a estrada" um pouco adiante
  var realFwd = getForward(busState.theta);
  var lookAheadAmount = 6 * Math.max(0, Math.cos(camOrbitYaw));
  var lookAt = {
    x: busState.x + realFwd.x * lookAheadAmount,
    y: 1.4,
    z: busState.z + realFwd.z * lookAheadAmount,
  };
  camera.lookAt(lookAt.x, lookAt.y, lookAt.z);
}

/* Câmera em 1ª pessoa, presa ao banco do motorista — local +x é o lado do
   meio-fio (lado da porta, onde os passageiros embarcam) e local -x é o
   lado do motorista (mesma convenção de "right" usada nas paradas/pistas);
   local -z é a frente do ônibus. Convertida pra mundo com a mesma rotação
   (busState.theta) que já posiciona a carroceria a cada quadro. */
function updateDriverCamera(dt) {
  var theta = busState.theta;
  var cosT = Math.cos(theta), sinT = Math.sin(theta);
  var lx = -(CONFIG.busWidth / 2 - CONFIG.driverEyeInset);
  var lz = -(CONFIG.busLength / 2 - CONFIG.driverEyeSetback);
  var wx = busState.x + lx * cosT + lz * sinT;
  var wz = busState.z - lx * sinT + lz * cosT;
  camera.position.set(wx, CONFIG.driverEyeHeight, wz);

  // olhar livre também funciona aqui, só que mais contido — o motorista
  // vira a cabeça pra checar os vidros laterais, não faz uma órbita de 360°
  // em volta do próprio ônibus.
  var orbitSmooth = 1 - Math.pow(CONFIG.mouseLookSmoothing, dt);
  camOrbitYaw = lerp(camOrbitYaw, mouseLookNX * CONFIG.driverLookMaxYaw, orbitSmooth);
  camOrbitHeight = lerp(camOrbitHeight, -mouseLookNY * 1.1, orbitSmooth);

  var lookFwd = getForward(theta + camOrbitYaw);
  camera.lookAt(wx + lookFwd.x * 12, CONFIG.driverEyeHeight + camOrbitHeight, wz + lookFwd.z * 12);
}

function applyFovKick(dt) {
  var kmh = Math.abs(busState.speed) * 3.6;
  var fovKick = clamp(kmh * CONFIG.cameraFovKmhFactor, 0, CONFIG.cameraFovMaxKick);
  var targetFov = CONFIG.cameraFovBase + fovKick;
  if (Math.abs(camera.fov - targetFov) > 0.05) {
    camera.fov = lerp(camera.fov, targetFov, 1 - Math.pow(0.001, dt));
    camera.updateProjectionMatrix();
  }
}

/* Alterna entre as duas câmeras — botão do HUD (#camToggleBtn) ou tecla C.
   Zera o olhar livre acumulado pra não "herdar" um ângulo de órbita de uma
   câmera que tinha um alcance de mouse-look bem diferente da outra. */
function toggleCameraMode() {
  cameraMode = cameraMode === CAMERA_CHASE ? CAMERA_DRIVER : CAMERA_CHASE;
  camOrbitYaw = 0;
  camOrbitHeight = 0;

  // não existe um interior modelado — sem esconder a carroceria, a câmera
  // fica "dentro" da casca sólida do ônibus e o teto/parede cobre a visão.
  // Escondê-la em 1ª pessoa é o mesmo truque padrão de jogos sem cockpit
  // modelado; volta a aparecer normalmente na câmera de fora. Só a
  // "chassis" (carroceria/janelas/espelhos) esconde — os faróis (SpotLight)
  // e as rodas são filhos direto de `bus`, então continuam ativos/visíveis.
  chassis.visible = cameraMode !== CAMERA_DRIVER;

  var icon = document.getElementById("camToggleIcon");
  var label = document.getElementById("camToggleLabel");
  if (cameraMode === CAMERA_DRIVER) {
    icon.textContent = "🚍";
    label.textContent = T("hud.cameraFirstPerson");
  } else {
    icon.textContent = "🎥";
    label.textContent = T("hud.cameraThirdPerson");
  }
}
document.getElementById("camToggleBtn").addEventListener("click", toggleCameraMode);

/* --------------------------------------------------------------------
   RESULTADO DA VIAGEM
   -------------------------------------------------------------------- */
function finishTrip() {
  trip.finished = true;
  gameState = STATE_FINISHED;

  var punctualityScore = clamp(100 - Math.max(0, trip.timeElapsed - CONFIG.targetTripTime) * 1.3, 0, 100);
  var smoothnessScore = clamp(100 - trip.smoothPenaltyAccum * 0.6, 0, 100);
  var stopScores = STOPS.map(function (s) { return s.score ? s.score.total : 0; });
  var avgStopScore = stopScores.reduce(function (a, b) { return a + b; }, 0) / stopScores.length;

  var overall = punctualityScore * 0.30 + smoothnessScore * 0.35 + avgStopScore * 0.35;
  var grade = overall >= 90 ? "S" : overall >= 80 ? "A" : overall >= 65 ? "B" : overall >= 45 ? "C" : "D";
  var coins = Math.round(overall * 2.2);

  career.totalCoins += coins;
  career.tripsCompleted += 1;
  career.bestOverall = Math.max(career.bestOverall, overall);
  saveCareer();

  renderResultScreen({
    punctuality: punctualityScore, smoothness: smoothnessScore, stopAccuracy: avgStopScore,
    overall: overall, grade: grade, coins: coins, tripTime: trip.timeElapsed,
  });
}

function scoreColor(v) { return v >= 80 ? "#4fd88a" : v >= 55 ? "#ffb648" : "#ff6b6b"; }

function renderResultScreen(r) {
  document.getElementById("overallGrade").textContent = r.grade;
  document.getElementById("overallGrade").style.color = scoreColor(r.overall);

  var rows = [
    { name: T("result.punctuality"), val: r.punctuality },
    { name: T("hud.smoothness"), val: r.smoothness },
    { name: T("result.stopAccuracy"), val: r.stopAccuracy },
  ];
  document.getElementById("scoreRows").innerHTML = rows.map(function (row) {
    return '<div class="score-row"><div class="name">' + row.name + '</div>' +
      '<div class="bar-wrap"><div class="bar" style="width:' + Math.round(row.val) + '%;background:' + scoreColor(row.val) + '"></div></div>' +
      '<div class="val">' + Math.round(row.val) + '</div></div>';
  }).join("");
  document.getElementById("coinsEarned").textContent = T("result.coins", { coins: r.coins, total: career.totalCoins });

  document.getElementById("resultScreen").classList.remove("hidden");
  document.getElementById("hud").classList.add("hidden");
  hideProjectReveal();
}

/* --------------------------------------------------------------------
   BOTÕES / TELAS
   -------------------------------------------------------------------- */
(function buildRoutePreview() {
  var wrap = document.getElementById("routePreview");
  FEATURED_PROJECTS.forEach(function (p) {
    var theme = PROJECT_THEMES[p.theme];
    var name = L(p.name);
    var chip = document.createElement("div");
    chip.className = "chip";
    chip.style.background = hexToCss(theme.accent);
    chip.title = name;
    chip.textContent = name.charAt(0);
    wrap.appendChild(chip);
  });
})();

document.getElementById("startBtn").addEventListener("click", function () {
  document.getElementById("startScreen").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
  gameState = STATE_DRIVING;
});
document.getElementById("retryBtn").addEventListener("click", function () {
  resetTrip();
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
  gameState = STATE_DRIVING;
});

/* --------------------------------------------------------------------
   LOOP PRINCIPAL
   -------------------------------------------------------------------- */
var clock = new THREE.Clock();

function syncBusMesh() {
  bus.position.set(busState.x, 0, busState.z);
  bus.rotation.y = busState.theta;
}

function animateAmbient(elapsed) {
  pulsingBeacons.forEach(function (b) {
    var s = 0.65 + Math.sin(elapsed * 2.2 + b.seed) * 0.35;
    b.mesh.scale.setScalar(0.85 + s * 0.3);
    b.beam.material.opacity = 0.35 + s * 0.35;
  });
  floatingChips.forEach(function (c) {
    c.position.y = c.userData.floatBaseY + Math.sin(elapsed * 1.6 + c.userData.floatSeed) * 0.08;
  });
  clickHints.forEach(function (h) {
    var pulse = 1 + Math.sin(elapsed * 3.2 + h.userData.pulseSeed) * 0.09;
    h.scale.set(pulse, pulse, 1);
  });
}

var elapsedTotal = 0;
function animate() {
  requestAnimationFrame(animate);
  var dt = Math.min(clock.getDelta(), 0.05);
  elapsedTotal += dt;

  if (gameState === STATE_DRIVING) {
    trip.timeElapsed += dt;
    var physicsResult = updateBusPhysics(dt);
    updateCollisions(dt);
    updateSmoothness(dt, physicsResult);
    updateVehicleVisuals(dt, physicsResult);
    syncBusMesh();
    updateStops(dt);
    updateHudCommon();
  }

  animateAmbient(elapsedTotal);
  updateCamera(dt, physicsResult);
  renderer.render(scene, camera);
}

syncBusMesh();
animate();

/* Hook de depuração — inspecionar/forçar estado a partir do devtools. */
window.__debug = {
  busState: busState, trip: trip, STOPS: STOPS, CONFIG: CONFIG, career: career,
  FEATURED_PROJECTS: FEATURED_PROJECTS, MONUMENTS: MONUMENTS,
  camera: camera, bus: bus, scene: scene, renderer: renderer,
  freezeCamera: function (v) { debugFreezeCamera = v; },
};

})();
