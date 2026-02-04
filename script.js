// ✅ petit test visuel : si JS marche, tu verras "JS OK" dans la console
console.log("JS OK ✅");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const btnRow = document.getElementById("btnRow");
const success = document.getElementById("success");
const resetBtn = document.getElementById("resetBtn");
const bgMusic = document.getElementById("bgMusic");

// Si un élément manque, on n'explose pas : on affiche l'erreur
if (!yesBtn || !noBtn || !btnRow || !success || !resetBtn) {
  console.error("Un ou plusieurs éléments HTML sont introuvables. Vérifie les IDs dans index.html");
}

// Réglages "hard mode"
let dodgeCount = 0;
let lastMove = 0;

const SETTINGS = {
  dangerRadius: 110,
  minDelayMs: 18,
  jumpMin: 0.30,
  jumpMax: 1.00
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function now() {
  return performance.now();
}
function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function growYes() {
  dodgeCount += 1;
  const yesScale = 1 + dodgeCount * 0.12;
  yesBtn.style.transform = `scale(${yesScale})`;
}

function moveNoButton(force = false) {
  const t = now();
  if (!force && t - lastMove < SETTINGS.minDelayMs) return;
  lastMove = t;

  const rowRect = btnRow.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const padding = 8;
  const maxX = rowRect.width - btnRect.width - padding * 2;
  const maxY = rowRect.height - btnRect.height - padding * 2;

  const x = padding + randomInRange(SETTINGS.jumpMin, SETTINGS.jumpMax) * clamp(maxX, 0, 99999);
  const y = padding + randomInRange(SETTINGS.jumpMin, SETTINGS.jumpMax) * clamp(maxY, 0, 99999);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = `translate(0, 0)`;

  growYes();
}

function distanceToNo(clientX, clientY) {
  const r = noBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  return Math.hypot(clientX - cx, clientY - cy);
}

/* ===== Musique (démarre au premier tap/clic) ===== */
let musicStarted = false;

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;

  // Si l'audio n'existe pas (ou a un ID différent), on ne casse pas le reste
  if (!bgMusic) {
    console.warn("bgMusic introuvable (audio). Vérifie <audio id='bgMusic' ...> dans index.html");
    return;
  }

  bgMusic.volume = 0.7;
  bgMusic.play().catch((err) => {
    // si bloqué, on retentera au prochain tap
    musicStarted = false;
    console.warn("Lecture audio bloquée (normal sur mobile si pas d'interaction).", err);
  });
}

document.addEventListener("click", startMusic);
document.addEventListener("touchstart", startMusic, { passive: true });

/* ===== ORDI ===== */
noBtn.addEventListener("mouseenter", () => moveNoButton(true));
btnRow.addEventListener("mousemove", (e) => {
  if (distanceToNo(e.clientX, e.clientY) < SETTINGS.dangerRadius) moveNoButton();
});

/* ===== MOBILE ===== */
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  moveNoButton(true);
}, { passive: false });

btnRow.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  if (!touch) return;
  if (distanceToNo(touch.clientX, touch.clientY) < SETTINGS.dangerRadius) moveNoButton();
}, { passive: false });

btnRow.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  if (!touch) return;
  if (distanceToNo(touch.clientX, touch.clientY) < SETTINGS.dangerRadius) {
    e.preventDefault();
    moveNoButton(true);
  }
}, { passive: false });

/* ===== YES / RESET ===== */
yesBtn.addEventListener("click", () => {
  startMusic();
  success.classList.remove("hidden");
  success.setAttribute("aria-hidden", "false");
});

resetBtn.addEventListener("click", () => {
  success.classList.add("hidden");
  success.setAttribute("aria-hidden", "true");

  dodgeCount = 0;
  yesBtn.style.transform = "scale(1)";

  noBtn.style.left = "50%";
  noBtn.style.top = "50%";
  noBtn.style.transform = "translate(40px, -50%)";
});