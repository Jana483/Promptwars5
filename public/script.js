const EVENT_DATE = new Date("2026-11-15T10:00:00+05:30");

// Countdown
function tick() {
  const diff = EVENT_DATE - new Date();
  if (diff <= 0) { document.getElementById("countdown").innerHTML = "<h3>🎉 We're LIVE!</h3>"; return; }
  const pad = n => String(n).padStart(2, "0");
  document.getElementById("d").textContent = pad(Math.floor(diff / 864e5));
  document.getElementById("h").textContent = pad(Math.floor(diff / 36e5) % 24);
  document.getElementById("m").textContent = pad(Math.floor(diff / 6e4) % 60);
  document.getElementById("s").textContent = pad(Math.floor(diff / 1e3) % 60);
}
tick(); setInterval(tick, 1000);

// Reveal cards + count-up numbers
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("show");
    if (e.target.dataset.count) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.2 });
document.querySelectorAll(".card, [data-count]").forEach(el => io.observe(el));
function countUp(el) {
  const target = +el.dataset.count; let cur = 0;
  const step = Math.max(1, Math.ceil(target / 60));
  const t = setInterval(() => { cur = Math.min(target, cur + step); el.textContent = cur; if (cur === target) clearInterval(t); }, 25);
}

// Media organization field
const type = document.getElementById("type"), org = document.getElementById("org");
type.addEventListener("change", () => {
  const media = type.value === "media";
  org.classList.toggle("hidden", !media); org.required = media;
});

// Registration -> Firestore
document.getElementById("regForm").addEventListener("submit", async e => {
  e.preventDefault();
  const msg = document.getElementById("msg");
  const data = Object.fromEntries(new FormData(e.target));
  data.testRide = !!data.testRide;
  try {
    const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (!r.ok) throw new Error();
    msg.style.color = ""; msg.textContent = `Thanks ${data.name}! Your ${data.type} pass is confirmed. See you at the launch ⚡`;
    e.target.reset(); org.classList.add("hidden");
  } catch {
    msg.style.color = "#ff6b6b"; msg.textContent = "Something went wrong. Please try again.";
  }
});

// Ask VoltRide (Gemini)
const chatBox = document.getElementById("chatBox");
document.getElementById("chatToggle").onclick = () => chatBox.classList.toggle("hidden");
document.getElementById("chatForm").addEventListener("submit", async e => {
  e.preventDefault();
  const input = document.getElementById("chatInput");
  const q = input.value.trim(); if (!q) return;
  const log = document.getElementById("chatLog");
  const me = document.createElement("div"); me.className = "me"; me.textContent = q; log.appendChild(me);
  input.value = "";
  const bot = document.createElement("div"); bot.className = "bot"; bot.textContent = "…"; log.appendChild(bot);
  log.scrollTop = log.scrollHeight;
  try {
    const r = await fetch("/api/ask", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: q }) });
    const d = await r.json(); bot.textContent = d.answer || d.error;
  } catch { bot.textContent = "Sorry, try again."; }
  log.scrollTop = log.scrollHeight;
});
