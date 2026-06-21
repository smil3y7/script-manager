#!/usr/bin/env node
/**
 * Izvozi celoten projekt (vsebino vseh tekstovnih datotek) v zaporedje
 * .txt delov v mapi project_dump/, primerno za pošiljanje LLM-jem.
 *
 * Uporaba:
 *   node export_project_dump.js [pot_do_projekta]
 *
 *   pot_do_projekta - privzeto je trenutna mapa (process.cwd()).
 *
 * OPOMBA O DASHBOARDU: skripta rekurzivno bere datotečni sistem in piše
 * izhod v podmapo project_dump/. Na Vercelu/serverless okolju nima dostopa
 * do tvojega lokalnega projekta na disku - smiselna je za lokalni zagon
 * nad mapo, ki jo dejansko želiš izvoziti.
 */

const fs = require("fs");
const path = require("path");

const PROJECT_ROOT = process.argv[2]
  ? path.resolve(process.argv[2])
  : process.cwd();

const OUTPUT_DIR = path.join(PROJECT_ROOT, "project_dump");
const MAX_CHARS_PER_PART = 150_000; // varna velikost za pošiljanje

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".cache",
  "__pycache__",
  "venv",
  ".venv",
  "coverage",
]);

const IGNORE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".mp4",
  ".mp3",
]);

function shouldIgnore(filePath) {
  const parts = filePath.split(path.sep);
  if (parts.some((part) => IGNORE_DIRS.has(part))) return true;
  const ext = path.extname(filePath).toLowerCase();
  if (IGNORE_EXTENSIONS.has(ext)) return true;
  return false;
}

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (shouldIgnore(fullPath)) continue;
    if (entry.isDirectory()) {
      walk(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }
}

function createDump() {
  ensureOutputDir();
  const files = walk(PROJECT_ROOT)
    .filter((f) => fs.statSync(f).isFile())
    .sort();

  let partIndex = 1;
  let currentSize = 0;
  let currentContent = "";

  function flushPart() {
    const filename = `part_${String(partIndex).padStart(2, "0")}.txt`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, currentContent, "utf8");
    console.log(`✔ Written ${filename}`);
    partIndex++;
    currentContent = "";
    currentSize = 0;
  }

  for (const file of files) {
    const relativePath = path.relative(PROJECT_ROOT, file);
    let content;
    try {
      content = fs.readFileSync(file, "utf8");
    } catch (err) {
      console.warn(`⚠ Skipping unreadable file: ${relativePath}`);
      continue;
    }

    const fileBlock = `\n\n===== FILE: ${relativePath} =====\n\n` + content;

    if (currentSize + fileBlock.length > MAX_CHARS_PER_PART) {
      flushPart();
    }

    currentContent += fileBlock;
    currentSize += fileBlock.length;
  }

  if (currentContent.length > 0) {
    flushPart();
  }

  console.log("✅ Project export complete.");
}

createDump();
