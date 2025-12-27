
// ui.js
// ============================================================
// UI-Panel/Icons/Video-Panel, Modell-Toggles,
// Typing/Text-Lernschritte (Typewriter + Pagination + Triggers)
// ============================================================

import { models } from './models.js';

// Dispatcher für Icon-Buttons
function handleIconAction(action, event) {
  switch(action) {
    case 'showNiet':
      // item2_2 Container sichtbar machen und Video starten
      const nietVideo = document.getElementById('nietVideo');
      const nietSource = nietVideo ? nietVideo.querySelector("source") : null;
      const nietOriginalSrc = nietSource ? nietSource.src : null;

      if (document.querySelector('.item2_2') && nietVideo) {
        document.querySelector('.item2_2').style.display = 'block';
        
        // Video-Quelle wiederherstellen, falls sie entfernt wurde
        if (!nietVideo.getAttribute("src") && nietOriginalSrc) {
          nietVideo.setAttribute("src", nietOriginalSrc);
          nietVideo.load();
        }

        nietVideo.currentTime = 0; // Video von Anfang starten

        // Pause/Play beim Klick auf Video
        nietVideo.onclick = () => {
          if (nietVideo.paused) { 
            nietVideo.play();
          } else nietVideo.pause();
        };
      }
      break;

    case 'showShip':
      //Funktion einfügen, um beim Klick was auszulösen
      break;

    case 'showFeuerstahl':
      // beliebige Aktion, z. B. Panel öffnen
      document.querySelector('.item2_1').style.display = 'block';
      break;
  }
}

// 📌 Buttons für Modelle
function toggleModel(name) {
  if (models[name]) {
    models[name].visible = !models[name].visible;
    console.log(`${name} ist jetzt ${models[name].visible ? "sichtbar" : "unsichtbar"}`);
    
    // 📌 Greif-Button nur für Nietplatte sichtbar machen
    if (name === "Nietplatte") {
      document.getElementById("grab-nietplatte").style.display = models[name].visible ? "block" : "none";
    }
  }
}

// ============================================================
// Typing/Text-Lernschritte
// ============================================================

const fullTexts = [
  'Hallo angehender Archäologe!',
  'Genau hier haben mein Archäologen-Team und ich dieses Metallstück tief in der Erde gefunden. Hilf mir und befreie es über drag&drop von der Korrosion!',
  'Schaue dir das Metallstück genauer, indem du es über den Touchscreen rotierst.',
  'Was glaubst du, wozu dieses Metallstück gehören könnte?',
  'Genau! Dieses alte Metallstück ist Teil von einem Schiff! Es handelt sich um einen Nagel und eine Platte, die typischerweise von den Wikingern genutzt wurden, um Schiffsplanken miteinander zu verbinden.',
  'Vor dir siehst du einen Teil eines Wikingerschiffs aus dem 9. Jahrundert.',
  'Greife den Schiffsniet und bringe ihn an die richtige Stelle zu den Brettern!',
  'Super! Du hast dein erstes Wikingerschiff gebaut!',
  'Laut Regino von Prüm sollen die Normannen im Jahr 883 Duisburg überfallen haben! Die Erdschicht, in dem der Schiffsniet gefunden wurde, ist genau dieser Zeit (dem 9. Jahrhundert) zuzuordnen. Es wurden nämlich Keramikgefäße gefunden, die genau aus dieser Zeit stammen.',
  'Erkunde nun das Schiff und sprich mit Björn über friedliches Handeln in Duisburg oder mit Bjarne über einen kämpferischen Überfall auf Duisburg'
];

const charsPerPage = 100; // Anzahl Zeichen pro "Seite" (kannst du anpassen)
let currentStep = 0;   // startet bei Lernschritt 0
let currentPage = 0;   // Seite im aktuellen Schritt

let textBox, nextButton, nextStepButton;

function typeWriterEffect(text, callback) {
  let i = 0;
  textBox.textContent = "";
  const interval = setInterval(() => {
    textBox.textContent += text[i];
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      callback();
    }
  }, 30); // Geschwindigkeit (ms pro Buchstabe)
}

function showPage(pageIndex) {
  const fullText = fullTexts[currentStep]; // Text vom aktuellen Lernschritt
  const start = pageIndex * charsPerPage;
  const end = start + charsPerPage;
  let pageText = fullText.slice(start, end);

  if (end < fullText.length) {
    pageText += "...";
  }

  typeWriterEffect(pageText, () => {
    if (end < fullText.length) {
      nextButton.style.display = "block";  // normale Weiter-Page
    } else {     // wir sind am Ende eines Textes
      //Wenn am Ende des ersten Textes, dann...
      if (currentStep === 1){
        models["Nietplatte_mit_Rost"].visible = true;
        models["Schiffsniet"].visible = true;
        nextStepButton.style.display = "block";
      } else if (currentStep === 3) {
        document.querySelector('.item2_1').style.display = 'block';
      } else if (currentStep === 6) {
        models["boatPart"].visible = true;
        nextStepButton.style.display = "block";
      } else if (currentStep < fullTexts.length - 1) {//Wenn am Ende aller weiteren Texte, dann...
        nextStepButton.style.display = "block"; // neuen Button für Lernschritt zeigen
      }
    }
  });
}

export function startTextEngine() {
  // DOM-Refs
  textBox = document.getElementById('textBox');
  nextButton = document.getElementById('nextButton');
  nextStepButton = document.getElementById('nextStepButton');

  // Auswahl der Buttons und definieren, was sie auslesen sollen
  nextStepButton.addEventListener('click', () => {
    currentStep++;       // nächster Lernschritt
    currentPage = 0;     // wieder von Seite 0 starten
    nextStepButton.style.display = "none";
    showPage(currentPage);
  });

  nextButton.addEventListener('click', () => {
    currentPage++;
    nextButton.style.display = "none";
    showPage(currentPage);
  });

  document.getElementById('schiff').addEventListener('click', () => {
    currentStep++;
    currentPage = 0;
    document.querySelector('.item2_1').style.display = 'none';
    showPage(currentPage);
    //models["boatPart"].visible = true;
  });

  // Start bei Seite 0
  showPage(0);
}

// ============================================================
// Öffentliche Initialisierung für UI (Buttons/Icons/Toggles)
// ============================================================
export function initUI(modelsRef, renderer) {
  // toggle-panel (zusätzlich zu xr.js, falls hier genutzt)
  document.getElementById('toggle-panel').addEventListener('click', () => {
    document.querySelector('.grid-container').classList.toggle('hide');
  });

  // Start: Icon-Buttons
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      handleIconAction(action, e);
    });
  });
  // End: Icon-Buttons

  // 📌 Buttons für Modelle
  document.getElementById("toggle-nietplatte").addEventListener("click", () => toggleModel("Nietplatte"));
  document.getElementById("toggle-schiff").addEventListener("click", () => toggleModel("Schiff"));
  document.getElementById("toggle-nietplatte-rost").addEventListener("click", () => toggleModel("Nietplatte_mit_Rost"));
  document.getElementById("toggle-schiffsniet").addEventListener("click", () => toggleModel("Schiffsniet"));
  document.getElementById("toggle-schiff-wRivets").addEventListener("click", () => toggleModel("boatPart_wRivets"));
}

// Optional: pro Frame UI-Updates
export function updatePerFrameUI() {
  // z. B. Blur-Overlay-Handling auskommentiert in deinem Code (hier leer)
}
