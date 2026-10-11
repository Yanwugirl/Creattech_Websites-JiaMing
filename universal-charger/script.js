"use strict";

// 1. Four facts. Keep these short and keep the evidence visible.
const study = "https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002300013";
const facts = {
  shell: {
    title: "The shell begins before the charger.",
    fact: "A 2017 charger study found that making 1 kg of recycled PC plastic caused about 30% of the resource-depletion impact of virgin PC.",
    source: "Mobile-phone charger LCA, KSEE, 2017.",
    url: study,
    image: "assets/shell-photo.webp",
    note: "A material comparison, not a measurement of this charger. Its exact plastic has not been identified."
  },
  board: {
    title: "A small board carries a long history.",
    fact: "Making the circuit board and casing drove pre-manufacturing impacts in that study. This stage contributed over 98% in four impact categories.",
    source: "Mobile-phone charger LCA, KSEE, 2017.",
    url: study,
    image: "assets/board-photo.webp",
    note: "The four categories were acidification, eutrophication, ozone depletion and photochemical oxidant formation. This is not 98% of all impacts."
  },
  plug: {
    title: "The cost keeps flowing during use.",
    fact: "In the same study, use caused 70% of global-warming impact and 94.4% of resource-depletion impact, mostly from electricity consumption.",
    source: "Mobile-phone charger LCA, KSEE, 2017.",
    url: study,
    image: "assets/plug-photo.webp",
    note: "These figures describe a different charger under that study's assumptions. They are not readings from this charging experiment."
  },
  contacts: {
    title: "Taking it apart is not the end.",
    fact: "Only 22.3% of global electronic waste was documented as formally collected and recycled in 2022. Separating a few parts does not mean they will all be recovered.",
    source: "ITU / UNITAR, The Global E-waste Monitor 2024.",
    url: "https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx",
    image: "assets/contact-photo.webp",
    note: "This is a global e-waste figure, not a charger-specific recycling rate. The future disposal route of this object is unknown."
  }
};

// 2. Build the object from the user's original pixel layers.
// All layer images share the same 32 × 32 canvas, so they line up.
const object = document.getElementById("object");
const layers = [
  { image: 0 }, { image: 4 }, { image: 7 }, { image: 6 },
  { id: "board", image: 2, x: 216, y: 95, number: 2 },
  { id: "contacts", image: 3, x: 209, y: 244, number: 4 },
  { id: "plug", image: 1, x: 218, y: 182, number: 3 },
  { id: "shell", image: 5, x: 55, y: 176, number: 1 }
];
layers.forEach(layer => {
  const element = document.createElement("div");
  element.className = "part " + (layer.id || "static");
  const image = document.createElement("img");
  image.src = "assets/part-" + layer.image + ".png";
  image.alt = "";
  image.draggable = false;
  element.appendChild(image);
  if (layer.id) {
    element.id = "part-" + layer.id;
    const hit = document.createElement("button");
    hit.className = "hit";
    hit.dataset.part = layer.id;
    hit.style.left = layer.x + "px";
    hit.style.top = layer.y + "px";
    hit.textContent = layer.number;
    hit.setAttribute("aria-label", "Move " + layer.id + " and read its hidden cost");
    hit.setAttribute("aria-controls", "card");
    hit.setAttribute("aria-pressed", "false");
    element.appendChild(hit);
  }
  object.appendChild(element);
});

// 3. A click toggles the part, and changes the right-hand fact card.
let currentFact = null;
let modelRequest = null;
const openParts = new Set();
const partButtons = [...document.querySelectorAll("[data-part]")];
const localPage = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

function showFact(id) {
  if (modelRequest) modelRequest.abort();
  currentFact = facts[id];
  document.getElementById("card-title").textContent = currentFact.title;
  document.getElementById("card-fact").textContent = currentFact.fact;
  const photo = document.getElementById("card-image");
  photo.src = currentFact.image;
  photo.alt = "The real " + id + " from the user's disassembled charger";
  photo.hidden = false;
  document.getElementById("card-source").textContent = currentFact.source;
  document.getElementById("card-source").hidden = false;
  document.getElementById("source-link").href = currentFact.url;
  document.getElementById("source-link").hidden = false;
  document.getElementById("card-note").textContent = currentFact.note;
  document.getElementById("card-note").hidden = false;
  document.getElementById("model-output").textContent = "";
  document.getElementById("ask-button").hidden = !localPage;
  document.getElementById("ask-button").disabled = false;
}

function updateObject() {
  object.classList.toggle("is-open", openParts.size > 0);
  partButtons.forEach(button => {
    const apart = openParts.has(button.dataset.part);
    button.setAttribute("aria-pressed", String(apart));
    document.getElementById("part-" + button.dataset.part).classList.toggle("apart", apart);
  });
  document.getElementById("part-status").textContent = openParts.size ? openParts.size + " part(s) moved. Click them again to bring them back." : "Everything is in place.";
}

partButtons.forEach(button => {
  button.addEventListener("click", () => {
    const id = button.dataset.part;
    if (openParts.has(id)) openParts.delete(id);
    else openParts.add(id);
    updateObject();
    showFact(id);
  });
});
document.getElementById("assemble").addEventListener("click", () => {
  openParts.clear();
  updateObject();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    openParts.clear();
    updateObject();
  }
});
updateObject();

// 4. Play the user's stop-motion sprite sheet with a CSS class.
const film = document.getElementById("film");
function playFilm() {
  film.classList.remove("play");
  void film.offsetWidth;
  film.classList.add("play");
}
document.getElementById("play-film").addEventListener("click", playFilm);
document.querySelector(".stop-motion").addEventListener("toggle", event => {
  if (event.target.open) playFilm();
});

// 5. The charging experiment has just three pieces of changing state.
// These are playful values, not a scientific model of battery charging.
let battery = 20;
let pluggedIn = false;
let idleSteps = 0;
const STEP = 10;
const TICK_MS = 900;
const stage = document.getElementById("charging-stage");

function updateCharge() {
  const state = pluggedIn ? (battery === 100 ? "full" : "charging") : "unplugged";
  stage.dataset.state = state;
  document.getElementById("battery-number").textContent = battery + "%";
  document.getElementById("battery-level").value = battery;
  document.getElementById("battery-dot").style.top = (80 - battery * 0.8) + "px";
  document.getElementById("charge-button").textContent = pluggedIn ? "Unplug" : "Plug in";
  document.getElementById("use-button").disabled = pluggedIn || battery === 0;
  document.getElementById("charge-status").textContent = battery + "% · " + (state === "charging" ? "Charging" : state === "full" ? "Full, still plugged in" : "Unplugged");
  document.getElementById("charge-thought").textContent = state === "full" ? "The battery is full. " + idleSteps + " idle step(s) have passed. When will you unplug?" : state === "charging" ? "The level rises. Every charge connects this small object to a much larger electricity system." : "The battery is resting. The charger is unplugged.";
}

function chargingTick() {
  if (!pluggedIn) return;
  if (battery < 100) battery = Math.min(100, battery + STEP);
  else idleSteps++;
  updateCharge();
}
setInterval(chargingTick, TICK_MS);
document.getElementById("charge-button").addEventListener("click", () => {
  pluggedIn = !pluggedIn;
  updateCharge();
});
document.getElementById("use-button").addEventListener("click", () => {
  if (pluggedIn) return;
  battery = Math.max(0, battery - 20);
  idleSteps = 0;
  updateCharge();
});
document.getElementById("reset-charge").addEventListener("click", () => {
  battery = 20;
  pluggedIn = false;
  idleSteps = 0;
  updateCharge();
});
updateCharge();

// 6. Optional local model call from the teacher's tutorial.
// It appears only on localhost. The public page has no API key or paid calls.
document.getElementById("ask-button").addEventListener("click", async () => {
  if (!currentFact || !localPage) return;
  const factAtStart = currentFact;
  const request = new AbortController();
  modelRequest = request;
  const timeout = setTimeout(() => request.abort(), 45000);
  const button = document.getElementById("ask-button");
  const output = document.getElementById("model-output");
  button.disabled = true;
  output.textContent = "Thinking…";
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma3:1b", prompt: "Speak as an old universal charger in simple English. In two short sentences, reflect on this fact. Do not invent numbers or pretend this study measured you: " + factAtStart.fact, stream: false }),
      signal: request.signal
    });
    if (!response.ok) throw new Error("Model request failed");
    const data = await response.json();
    if (data.error || !data.response) throw new Error("No model response");
    if (currentFact === factAtStart) output.textContent = data.response;
  } catch (error) {
    if (currentFact === factAtStart) output.textContent = "No local model response. Start Ollama with gemma3:1b, then try again from localhost. This text is an error message, not an AI answer.";
  } finally {
    clearTimeout(timeout);
    if (modelRequest === request) {
      modelRequest = null;
      button.disabled = false;
    }
  }
});

// 7. A broken image should not stop the object buttons or the facts.
document.querySelectorAll("img").forEach(image => {
  image.addEventListener("error", () => {
    document.getElementById("asset-warning").hidden = false;
  });
});
