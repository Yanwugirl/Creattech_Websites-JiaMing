"use strict";

// 1. Seven facts. Keep these short and keep the evidence visible.
const study = "https://www.kci.go.kr/kciportal/ci/sereArticleSearch/ciSereArtiView.kci?sereArticleSearchBean.artiId=ART002300013";
const manual = "https://support.hama.com/webresources/article-documents/00081/man/00081380man_cs_de_en_es_fi_fr_it_nl_pl_pt_ru_sv.pdf";
const ewaste = "https://www.itu.int/en/ITU-D/Environment/Pages/Publications/The-Global-E-waste-Monitor-2024.aspx";
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
    url: ewaste,
    image: "assets/contact-photo.webp",
    note: "This is a global e-waste figure, not a charger-specific recycling rate. The future disposal route of this object is unknown."
  },
  wires: {
    title: "A short connection. A longer material story.",
    fact: "Electronics contain metals that take energy to extract and manufacture. Recovering these materials through proper collection can keep them in circulation.",
    source: "US EPA, Electronics Donation and Recycling, 2025.",
    url: "https://www.epa.gov/recycle/electronics-donation-and-recycling",
    image: "assets/wires-photo.webp",
    imageAlt: "The wires connected to the disassembled circuit board",
    note: "The wire metal in this object has not been identified. The source describes electronics generally."
  },
  lights: {
    title: "Full does not mean switched off.",
    fact: "A light can show that charging has finished while the charger stays connected. Hama lists 0.0582 W of no-load power for one charger's adapter.",
    source: "Hama Delta Ovum LCD operating instructions, p. 5.",
    url: manual,
    image: "assets/indicator-photo.webp",
    imageAlt: "Three indicator lights on the reference universal charger",
    note: "A published figure for Hama's adapter, not a reading from this older charger. Its exact LED codes are unverified."
  },
  back: {
    title: "There is no invisible bin.",
    fact: "The world generated 62 million tonnes of electronic waste in 2022. A casing is one small part of a much larger waste stream.",
    source: "ITU / UNITAR, The Global E-waste Monitor 2024.",
    url: ewaste,
    image: "assets/back-photo.webp",
    note: "A global total, not this object's footprint. Taking the casing off does not guarantee it will be recycled."
  }
};

// 2. Build the object from the user's original pixel layers.
// All layer images share the same 32 × 32 canvas, so they line up.
const object = document.getElementById("object");
const layers = [
  { image: 0 },
  { id: "back", image: 4, x: 48, y: 256, number: 7 },
  { id: "lights", image: 7, x: 144, y: 30, number: 6 },
  { id: "wires", image: 6, x: 120, y: 60, number: 5 },
  { id: "board", image: 2, x: 225, y: 75, number: 2 },
  { id: "contacts", image: 3, x: 209, y: 254, number: 4 },
  { id: "plug", image: 1, x: 230, y: 190, number: 3 },
  { id: "shell", image: 5, x: 50, y: 180, number: 1 }
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
  photo.alt = currentFact.imageAlt || "The real " + id + " from the user's disassembled charger";
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

// 5. Change the object, close the clip, then connect the power.
// These charge levels are playful values, not measured charging behaviour.
const chargeItems = {
  flat: { name: "Flat battery", image: "assets/flat-battery.png", start: 20, charge: 20 },
  small: { name: "Small battery", image: "assets/flat-battery.png", start: 40, charge: 40 },
  earphones: { name: "Rechargeable earphone", image: "assets/earphone.png", start: 30, charge: 30 }
};
let selectedItem = "flat";
let seated = true;
let pluggedIn = false;
let idleSteps = 0;
const STEP = 10;
const TICK_MS = 900;
const stage = document.getElementById("charging-stage");

function updateCharge() {
  const item = chargeItems[selectedItem];
  const state = pluggedIn ? (item.charge === 100 ? "full" : "charging") : "unplugged";
  stage.dataset.state = state;
  document.getElementById("charging-bolt").hidden = state !== "charging";
  stage.dataset.item = selectedItem;
  stage.dataset.seated = String(seated);
  const meter = document.getElementById("battery-level");
  meter.value = item.charge;
  document.getElementById("battery-number").textContent = item.charge + "%";
  document.getElementById("fit-button").textContent = seated ? "Open clip" : selectedItem === "earphones" ? "Clip earphone" : "Clip battery";
  document.getElementById("fit-button").disabled = pluggedIn;
  document.getElementById("charge-button").textContent = pluggedIn ? "Unplug" : "Plug in";
  document.getElementById("charge-button").disabled = !seated;
  document.getElementById("use-button").disabled = pluggedIn || item.charge === 0;
  document.getElementById("charge-status").textContent = item.charge + "% · " + (state === "charging" ? "Charging · red lights" : state === "full" ? "Full · green lights" : "Unplugged · lights off");
  document.getElementById("item-label").textContent = item.name + " · " + (seated ? "clipped in" : "clip open");
  stage.setAttribute("aria-label", item.name + (seated ? " held under the charger's clip" : " next to the open clip"));
  document.querySelector(".indicator-lights").setAttribute("aria-label", "Three indicator lights: " + (state === "charging" ? "red, charging" : state === "full" ? "green, full" : "off"));
  let thought;
  if (state === "full") thought = "Full: active charging has stopped. Still plugged in for " + idleSteps + " idle step(s). When will you unplug?";
  else if (state === "charging") thought = "The red lights are on. The " + (selectedItem === "earphones" ? "earphone" : "battery") + " stays under the clip while its simulated charge rises.";
  else if (!seated) thought = "The clip is open. Close it to hold the object against the contacts.";
  else thought = "Clipped in. Plug in to charge, or open the clip to try another object.";
  document.getElementById("charge-thought").textContent = thought;
}

function chargingTick() {
  const item = chargeItems[selectedItem];
  if (!pluggedIn || !seated) return;
  if (item.charge < 100) item.charge = Math.min(100, item.charge + STEP);
  else idleSteps++;
  updateCharge();
}
setInterval(chargingTick, TICK_MS);
const itemButtons = [...document.querySelectorAll(".item-buttons [data-item]")];
function chooseItem(id) {
  if (id === selectedItem) return;
  selectedItem = id;
  pluggedIn = false; // Switching objects also disconnects simulated power.
  seated = false;
  idleSteps = 0;
  const item = chargeItems[id];
  const image = document.getElementById("charge-item");
  image.src = item.image;
  image.alt = item.name;
  itemButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.item === id)));
  updateCharge();
}
itemButtons.forEach(button => button.addEventListener("click", () => chooseItem(button.dataset.item)));
document.getElementById("fit-button").addEventListener("click", () => {
  if (pluggedIn) return;
  seated = !seated;
  updateCharge();
});
document.getElementById("charge-button").addEventListener("click", () => {
  if (!seated) return;
  pluggedIn = !pluggedIn;
  updateCharge();
});
document.getElementById("use-button").addEventListener("click", () => {
  const item = chargeItems[selectedItem];
  if (pluggedIn) return;
  item.charge = Math.max(0, item.charge - 20);
  seated = false; // Using the object elsewhere removes it from the clip.
  idleSteps = 0;
  updateCharge();
});
document.getElementById("reset-charge").addEventListener("click", () => {
  Object.values(chargeItems).forEach(item => { item.charge = item.start; });
  pluggedIn = false;
  idleSteps = 0;
  chooseItem("flat");
  seated = true;
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
