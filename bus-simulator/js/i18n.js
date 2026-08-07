/* =====================================================================
   IDIOMA DO TOUR — lê a mesma preferência salva pelo seletor de idioma
   do site principal (assets/js/modules/i18n.js, chave "gl-lang" no
   localStorage) e aplica ela aqui. Mesma origem => mesmo localStorage,
   então funciona automaticamente quando o tour é aberto a partir do
   botão "Embarcar no tour" do portfólio, sem precisar de query string.
   Só resolve o idioma UMA VEZ, no carregamento — o tour não tem (e não
   precisa) de seletor de idioma próprio, ele só herda o do site.
   ===================================================================== */
(function () {
"use strict";

var STORAGE_KEY = "gl-lang"; // mesma chave usada em assets/js/modules/i18n.js

var saved = null;
try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage indisponível (file://, modo privado) */ }
window.TOUR_LANG = saved === "en" ? "en" : "pt";

/* Textos de UI do jogo (HUD, telas, mensagens). Conteúdo específico dos
   projetos (descrições, cargo do contato, nomes dos totens) vive em
   js/data.js, como objetos {pt, en} — ver pick() em game.js. */
var STRINGS = {
  pt: {
    "meta.title": "Rota do Portfólio — o tour de ônibus pelo meu portfólio",
    "hud.nextStop": "Próxima exibição",
    "hud.aboard": "A bordo",
    "hud.time": "Tempo",
    "hud.smoothness": "Suavidade de condução",
    "hud.smoothCaption": "Dirija com calma e precisão",
    "hud.approaching": "Se aproximando",
    "hud.revealEyebrowDefault": "Projeto",
    "hud.cameraAria": "Alternar câmera",
    "hud.cameraThirdPerson": "3ª pessoa",
    "hud.cameraFirstPerson": "1ª pessoa",
    "stop.garage": "Garagem",
    "stop.terminal": "Terminal",
    "touch.left": "Virar à esquerda",
    "touch.right": "Virar à direita",
    "touch.brake": "Frear ou dar ré",
    "touch.gas": "Acelerar",
    "reveal.close": "Fechar",
    "reveal.featuredTag": "Projeto em destaque",
    "reveal.endOfLine": "Fim de linha",
    "reveal.terminalTitle": "Chegamos! Bora conversar?",
    "reveal.terminalDesc": "{name} — {role}. Se alguma dessas paradas despertou seu interesse, essas são as portas certas.",
    "reveal.linkCode": "Código",
    "reveal.linkLive": "Ver ao vivo",
    "reveal.linkEmail": "E-mail",
    "reveal.scoreAlign": "Alinhamento",
    "reveal.scoreSmooth": "Suavidade",
    "reveal.scorePrompt": "Agilidade",
    "hud.waitingAtStop": "Aguardando na parada: {n}",
    "msg.missedStop": "🚌 Passou direto por {name}",
    "msg.servedStopScore": "🚏 {name} — nota {score}",
    "msg.boardAlight": "  •  +{boarding} embarcaram, -{alighting} desceram",
    "smooth.flawless": "Condução impecável",
    "smooth.good": "Boa condução",
    "smooth.harsh": "Freadas/curvas bruscas!",
    "smooth.veryHarsh": "Muito brusco — vá com calma",
    "routeAbbrev": "RP",
    "gears": ["1ª", "2ª", "3ª", "4ª"],
    "start.title": "🚌 Rota do Portfólio",
    "start.subtitle": "O tour de ônibus pelo meu portfólio",
    "start.desc": "Assuma a garagem, pegue a estrada e pare com precisão em cada cruzamento — cada um deles guarda um projeto meu de verdade, do primeiro commit ao deploy. No fim da linha, um jeito de falar comigo.",
    "start.accelerate": "Acelerar",
    "start.brakeReverse": "Frear / Ré",
    "start.turnLeft": "Virar à esquerda",
    "start.turnRight": "Virar à direita",
    "start.switchCamera": "Trocar câmera",
    "start.touchHint": "🕹️ Use os botões que aparecem na tela — ▲ acelera, ▼ freia/dá ré, ◀▶ vira. O botão 🎥 no rodapé troca a câmera.",
    "start.startBtn": "Iniciar tour",
    "result.title": "Tour concluído!",
    "result.overallLabel": "Nota geral",
    "result.retryBtn": "Rodar de novo",
    "result.punctuality": "Pontualidade",
    "result.stopAccuracy": "Precisão nas paradas",
    "result.coins": "🪙 +{coins} moedas (total: {total})",
  },
  en: {
    "meta.title": "Portfolio Route — the bus tour through my portfolio",
    "hud.nextStop": "Next stop",
    "hud.aboard": "On board",
    "hud.time": "Time",
    "hud.smoothness": "Smooth driving",
    "hud.smoothCaption": "Drive calm and precise",
    "hud.approaching": "Approaching",
    "hud.revealEyebrowDefault": "Project",
    "hud.cameraAria": "Toggle camera",
    "hud.cameraThirdPerson": "3rd person",
    "hud.cameraFirstPerson": "1st person",
    "stop.garage": "Garage",
    "stop.terminal": "Terminal",
    "touch.left": "Turn left",
    "touch.right": "Turn right",
    "touch.brake": "Brake or reverse",
    "touch.gas": "Accelerate",
    "reveal.close": "Close",
    "reveal.featuredTag": "Featured project",
    "reveal.endOfLine": "End of the line",
    "reveal.terminalTitle": "We made it! Let's talk?",
    "reveal.terminalDesc": "{name} — {role}. If any of these stops caught your interest, these are the right doors.",
    "reveal.linkCode": "Code",
    "reveal.linkLive": "See it live",
    "reveal.linkEmail": "Email",
    "reveal.scoreAlign": "Alignment",
    "reveal.scoreSmooth": "Smoothness",
    "reveal.scorePrompt": "Promptness",
    "hud.waitingAtStop": "Waiting at the stop: {n}",
    "msg.missedStop": "🚌 Drove right past {name}",
    "msg.servedStopScore": "🚏 {name} — score {score}",
    "msg.boardAlight": "  •  +{boarding} boarded, -{alighting} got off",
    "smooth.flawless": "Flawless driving",
    "smooth.good": "Good driving",
    "smooth.harsh": "Harsh braking/turns!",
    "smooth.veryHarsh": "Too harsh — take it easy",
    "routeAbbrev": "PR",
    "gears": ["1st", "2nd", "3rd", "4th"],
    "start.title": "🚌 Portfolio Route",
    "start.subtitle": "The bus tour through my portfolio",
    "start.desc": "Take the garage, hit the road and park with precision at every intersection — each one holds a real project of mine, from the first commit to deploy. At the end of the line, a way to get in touch.",
    "start.accelerate": "Accelerate",
    "start.brakeReverse": "Brake / Reverse",
    "start.turnLeft": "Turn left",
    "start.turnRight": "Turn right",
    "start.switchCamera": "Switch camera",
    "start.touchHint": "🕹️ Use the on-screen buttons — ▲ speeds up, ▼ brakes/reverses, ◀▶ steers. The 🎥 button at the bottom switches the camera.",
    "start.startBtn": "Start tour",
    "result.title": "Tour complete!",
    "result.overallLabel": "Overall score",
    "result.retryBtn": "Drive again",
    "result.punctuality": "Punctuality",
    "result.stopAccuracy": "Stop accuracy",
    "result.coins": "🪙 +{coins} coins (total: {total})",
  },
};

/** Traduz uma chave no idioma atual e, opcionalmente, substitui
 *  placeholders "{nome}" pelos valores em `vars`. Cai pra PT (e por fim
 *  pra própria chave) se algo estiver faltando — nunca fica em branco. */
function T(key, vars) {
  var dict = STRINGS[window.TOUR_LANG] || STRINGS.pt;
  var value = key in dict ? dict[key] : STRINGS.pt[key];
  if (value === undefined) return key;
  if (vars) {
    Object.keys(vars).forEach(function (k) {
      value = value.replace("{" + k + "}", vars[k]);
    });
  }
  return value;
}
window.T = T;

/** Resolve um campo de conteúdo (js/data.js) que tanto pode ser uma string
 *  simples (mesmo texto nos dois idiomas — nomes de marca, tech etc.)
 *  quanto um objeto {pt, en} (texto que muda de idioma — descrições e os
 *  títulos dos dois jogos que ganharam nome em inglês). */
window.L = function (value) {
  if (value && typeof value === "object") return value[window.TOUR_LANG] || value.pt || "";
  return value;
};

document.documentElement.setAttribute("lang", window.TOUR_LANG === "en" ? "en" : "pt-BR");

/* Aplica [data-i18n] (texto) e [data-i18n-attr="attr:chave,attr2:chave2"]
   (atributos, ex.: aria-label) já presentes no HTML estático — mesmo
   mecanismo (bem mais simples) do seletor de idioma do site principal. */
function applyStaticI18n() {
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = T(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
    el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
      var parts = pair.split(":");
      var attr = parts[0] && parts[0].trim();
      var key = parts[1] && parts[1].trim();
      if (!attr || !key) return;
      el.setAttribute(attr, T(key));
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyStaticI18n);
} else {
  applyStaticI18n();
}
})();
