#!/usr/bin/env node
/**
 * Pretvori .ttf font datoteko v .js datoteko z base64 zakodirano pisavo,
 * uporabno za vgrajevanje fontov v jsPDF (window.jspdf.vFS).
 *
 * Uporaba:
 *   node fontconverter.js [ime-fonta-brez-pripone]
 *
 *   ime-fonta-brez-pripone - privzeto "DejaVuSans". Skripta pričakuje, da
 *   je <ime>.ttf v isti mapi kot ta skripta, izhod pa zapiše kot <ime>.js.
 *
 * OPOMBA O DASHBOARDU: skripta bere/piše lokalne datoteke poleg same sebe.
 * Na Vercelu/serverless okolju te datoteke niso na voljo na pričakovani
 * poti (in pisanje v projekt sploh ni mogoče) - smiselna je za lokalni
 * zagon, ne za produkcijski deploy.
 */

const fs = require("fs");
const path = require("path");

const fontName = process.argv[2] || "DejaVuSans";

const fontPath = path.join(__dirname, `${fontName}.ttf`);
const outputPath = path.join(__dirname, `${fontName}.js`);

if (!fs.existsSync(fontPath)) {
  console.error(`Napaka: ${fontPath} ne obstaja.`);
  process.exit(1);
}

const ttfBuffer = fs.readFileSync(fontPath);
const base64 = ttfBuffer.toString("base64");

const jsContent = `
window.jspdf = window.jspdf || {};
window.jspdf.jsPDF = window.jspdf.jsPDF || {};
window.jspdf.jsPDF.API = window.jspdf.jsPDF.API || {};
window.jspdf.jsPDF.API.addFileToVFS = window.jspdf.jsPDF.API.addFileToVFS || function(name, data) {
  (window.jspdf.vFS = window.jspdf.vFS || {})[name] = data;
};
window.jspdf.jsPDF.API.addFont = window.jspdf.jsPDF.API.addFont || function(fontName, fontStyle, fontType, encoding) {
  // Dummy placeholder
};
window.jspdf.jsPDF.API.addFileToVFS("${fontName}.ttf", "${base64}");
`;

fs.writeFileSync(outputPath, jsContent);
console.log("Font JS file created:", outputPath);
