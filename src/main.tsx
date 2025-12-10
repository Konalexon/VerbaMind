import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Blokada WSZYSTKICH skrótów przeglądarkowych - zachowanie jak natywna aplikacja desktop
document.addEventListener('keydown', (e) => {
  // Blokuj wszystkie klawisze funkcyjne F1-F12
  if (e.key.startsWith('F') && e.key.length <= 3 && !isNaN(Number(e.key.substring(1)))) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }

  // Blokuj Ctrl+kombinacje (refresh, dev tools, find, etc.)
  if (e.ctrlKey) {
    const blockedKeys = ['r', 'R', 'u', 'U', 'p', 'P', 's', 'S', 'g', 'G', 'f', 'F', 'h', 'H', 'j', 'J', 'o', 'O'];
    if (blockedKeys.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    // Ctrl+Shift kombinacje
    if (e.shiftKey) {
      const blockedShiftKeys = ['i', 'I', 'j', 'J', 'c', 'C', 'r', 'R'];
      if (blockedShiftKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  }

  // Blokuj Alt+kombinacje
  if (e.altKey) {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}, true);

// Blokada menu kontekstowego (prawy przycisk myszy)
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Blokada przeciągania i upuszczania plików
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
