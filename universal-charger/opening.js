"use strict";

// A small four-choice opening. The original page lives in #charger-page.
// The game changes classes; CSS handles the comic and feedback animations.
(() => {
  const opening = document.getElementById("opening");
  const page = document.getElementById("charger-page");
  const comic = document.getElementById("opening-comic");
  const answers = [...document.querySelectorAll(".answer[data-answer]")];
  const feedback = document.getElementById("opening-feedback");
  const skip = document.getElementById("skip-opening");
  const rescue = document.createElement("div");
  rescue.id = "opening-charge";
  rescue.hidden = false;
  rescue.dataset.item = "flat";
  rescue.innerHTML = document.querySelector("#charging-stage .charging-rig").outerHTML + '<span class="opening-level">20%</span>';
  rescue.querySelectorAll("[id]").forEach(el => {
    el.id = el.id.replace("charging-bolt", "opening-bolt").replace("charge-", "opening-");
  });
  document.querySelector(".drawer-scene").append(rescue);
  const caption = document.querySelector(".last-panel figcaption");
  const originalCaption = caption.textContent;
  let solved = false;

  function resetRescue() {
    rescue.hidden = false;
    rescue.dataset.phase = "idle";
    rescue.dataset.seated = "false";
    rescue.dataset.state = "unplugged";
    rescue.querySelector(".opening-level").textContent = "20%";
    document.getElementById("opening-bolt").hidden = true;
  }

  function playCombined() {
    rescue.dataset.phase = "discover";
    const frames = [
      [900, () => { rescue.dataset.phase = "insert"; caption.textContent = "Flat battery · open clip"; }],
      [950, () => { rescue.dataset.seated = "true"; caption.textContent = "Flat battery · clipped in"; }],
      [800, () => { rescue.dataset.state = "charging"; document.getElementById("opening-bolt").hidden = false; caption.textContent = "Flat battery · charging"; }],
      ...[40,60,80].map(charge => [400, () => { rescue.querySelector(".opening-level").textContent = charge + "%"; }]),
      [400, () => {
        rescue.dataset.state = "full";
        rescue.querySelector(".opening-level").textContent = "100%";
        document.getElementById("opening-bolt").hidden = true;
        caption.textContent = "Flat battery · full";
      }],
      [650, () => {
        comic.classList.add("recharged");
        document.getElementById("last-speech").textContent = "Still got a little life!";
        document.getElementById("phone-percent").textContent = "+";
      }],
      [1600, enterCharger]
    ];
    let index = 0;
    function next() {
      if (index === frames.length || opening.hidden || !solved) return;
      const [delay, action] = frames[index++];
      arrivalTimer = setTimeout(() => { action(); next(); }, delay);
    }
    next();
  }
  let arrivalTimer = null;

  const wrongAnswers = {
    bank: "Empty means empty. It needs a little charge of its own. Try another object.",
    cable: "A cable can carry power, but cannot make it. On its own, it won't help. Try again.",
    shake: "Lots of enthusiasm. Still one percent. What else is in the drawer?"
  };

  function enterCharger() {
    clearTimeout(arrivalTimer);
    arrivalTimer = null;
    resetRescue();
    opening.hidden = true;
    page.hidden = false;
    document.getElementById("replay-opening").hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("charger-title").focus({ preventScroll: true });
  }

  function showOpening() {
    clearTimeout(arrivalTimer);
    arrivalTimer = null;
    solved = false;
    resetRescue();
    caption.textContent = originalCaption;
    // When replaying, unplug a charging object before hiding that experiment.
    const stage = document.getElementById("charging-stage");
    if (["charging", "full"].includes(stage.dataset.state)) {
      document.getElementById("charge-button").click();
    }
    answers.forEach(button => {
      button.disabled = false;
      button.classList.remove("is-wrong", "is-correct");
    });
    comic.classList.remove("wrong", "rescued", "recharged", "charging-scene");
    feedback.classList.remove("wrong", "right");
    document.getElementById("opening-result").textContent = "";
    document.getElementById("opening-explanation").textContent = "";
    document.getElementById("last-speech").textContent = "Something in the drawer?";
    document.getElementById("phone-percent").textContent = "1%";
    skip.innerHTML = 'Skip to the charger <span aria-hidden="true">→</span>';
    page.hidden = true;
    opening.hidden = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("opening-title").focus({ preventScroll: true });
  }

  answers.forEach(button => {
    button.addEventListener("click", () => {
      if (solved || opening.hidden) return;
      answers.forEach(answer => answer.classList.remove("is-wrong"));
      comic.classList.remove("wrong");
      feedback.classList.remove("wrong", "right");
      // Restart a short shake even when the same wrong choice is clicked twice.
      void comic.offsetWidth;

      if (button.dataset.answer !== "charger") {
        button.classList.add("is-wrong");
        comic.classList.add("wrong");
        feedback.classList.add("wrong");
        document.getElementById("opening-result").textContent = "Not this time.";
        document.getElementById("opening-explanation").textContent = wrongAnswers[button.dataset.answer];
        document.getElementById("last-speech").textContent = "Hmm. Another idea?";
        return;
      }

      solved = true;
      button.classList.add("is-correct");
      answers.forEach(answer => { answer.disabled = true; });
      comic.classList.add("rescued");
      feedback.classList.add("right");
      document.getElementById("opening-result").textContent = "A little more life.";
      document.getElementById("opening-explanation").textContent = "Yes — for a compatible removable battery. Let's look inside.";
      document.getElementById("last-speech").textContent = "One more turn?";
      skip.innerHTML = 'Look inside now <span aria-hidden="true">→</span>';
      // A short pause shows the rescue. Skip can enter immediately.
      playCombined();
    });
  });

  skip.addEventListener("click", enterCharger);
  document.getElementById("replay-opening").addEventListener("click", showOpening);
  showOpening();
})();
