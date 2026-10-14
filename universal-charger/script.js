"use strict";

// 1. The researched facts live in data/facts.json, loaded with fetch().
let facts = {};
let factsError = "";

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
let currentPart = null;
let modelRequest = null;
let modelReady = false;
let modelChecking = false;
const openParts = new Set();
const partButtons = [...document.querySelectorAll("[data-part]")];
const localPage = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);

function showFact(id) {
  if (modelRequest) {
    modelRequest.abort();
    modelRequest = null;
  }
  currentPart = id;
  currentFact = facts[id] || null;
  document.getElementById("model-output").textContent = "";
  document.getElementById("model-meta").hidden = true;
  updateModelControls();
  if (!currentFact) {
    document.getElementById("card-title").textContent = "This part has a story.";
    document.getElementById("card-fact").textContent = factsError || "Loading the researched fact…";
    return;
  }
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
}

async function loadFacts() {
  try {
    const response = await fetch("data/facts.json");
    if (!response.ok) throw new Error("Fact file missing");
    const data = await response.json();
    for (const layer of layers.filter(layer => layer.id)) {
      const fact = data[layer.id];
      if (!fact || !["title", "fact", "source", "url", "image", "note"].every(key => typeof fact[key] === "string" && fact[key].trim())) {
        throw new Error("Fact fields missing");
      }
    }
    facts = data;
    if (currentPart) showFact(currentPart);
  } catch (error) {
    factsError = "The facts could not load. Run node server.js in this folder, then open http://127.0.0.1:8000/charger.html. On the published site, check that data/facts.json was uploaded.";
    document.getElementById("card-fact").textContent = factsError;
  }
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

// 6. Ask a real local model through the small helper in server.js.
// The public page keeps its object and facts; Ollama runs on your own laptop.
function updateModelControls() {
  document.getElementById("model-tools").hidden = !localPage;
  document.getElementById("ask-button").hidden = !localPage;
  document.getElementById("ask-button").disabled = !currentFact || !modelReady || !!modelRequest;
  document.getElementById("check-model").disabled = modelChecking || !!modelRequest;
}

async function checkModel() {
  if (!localPage || modelChecking) return;
  modelChecking = true;
  modelReady = false;
  updateModelControls();
  const status = document.getElementById("model-status");
  status.textContent = "Checking Ollama…";
  try {
    const response = await fetch("/api/model-status", { signal: AbortSignal.timeout(10000) });
    if (!response.headers.get("content-type")?.includes("application/json")) {
      throw new Error("Run node server.js, then open http://127.0.0.1:8000/charger.html.");
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The local server could not check Ollama.");
    modelReady = data.ready === true;
    status.textContent = data.message;
  } catch (error) {
    status.textContent = error.name === "TimeoutError"
      ? "The connection check took too long. Open Ollama and try again."
      : error.message + " Check that the page was started with node server.js and Ollama is open.";
  } finally {
    modelChecking = false;
    updateModelControls();
  }
}

document.getElementById("check-model").addEventListener("click", checkModel);
document.getElementById("ask-button").addEventListener("click", async () => {
  if (!currentFact || !localPage || !modelReady || modelRequest) return;
  const partAtStart = currentPart;
  const request = new AbortController();
  modelRequest = request;
  const timeout = setTimeout(() => request.abort(), 135000);
  const output = document.getElementById("model-output");
  const meta = document.getElementById("model-meta");
  meta.hidden = true;
  output.textContent = "Thinking… The first reply may take a minute while the model loads.";
  updateModelControls();
  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ part: partAtStart }),
      signal: request.signal
    });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || "Ollama could not answer.");
    if (typeof data.response !== "string" || !data.response.trim()) throw new Error("Ollama returned an empty answer. Please try again.");
    if (modelRequest !== request || currentPart !== partAtStart) return;
    output.textContent = data.response;
    meta.textContent = "AI-generated reflection · Ollama / " + data.model;
    meta.hidden = false;
  } catch (error) {
    if (modelRequest !== request || currentPart !== partAtStart) return;
    output.textContent = request.signal.aborted
      ? "The reply took too long. Check Ollama and try again."
      : "No model reply: " + error.message;
    modelReady = false;
    document.getElementById("model-status").textContent = "Check the connection before asking again.";
  } finally {
    clearTimeout(timeout);
    if (modelRequest === request) {
      modelRequest = null;
      updateModelControls();
    }
  }
});
updateModelControls();
if (localPage) checkModel();

// 7. A broken image should not stop the object buttons or the facts.
document.querySelectorAll("img").forEach(image => {
  image.addEventListener("error", () => {
    document.getElementById("asset-warning").hidden = false;
  });
});

const factsReady = loadFacts();
