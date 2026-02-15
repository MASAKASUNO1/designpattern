import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { HISTORY_DIR, HISTORY_FILE } from './config.js';

function historyPath() {
  return join(HISTORY_DIR, HISTORY_FILE);
}

export function loadHistory() {
  try {
    return JSON.parse(readFileSync(historyPath(), 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(history) {
  mkdirSync(HISTORY_DIR, { recursive: true });
  writeFileSync(historyPath(), JSON.stringify(history, null, 2));
}

export function addEntry(prompt, html, provider, model, outputPath) {
  const history = loadHistory();
  const maxId = history.reduce((m, e) => Math.max(m, e.id), 0);
  const id = maxId + 1;
  const finalPath = outputPath || join(HISTORY_DIR, `${id}.html`);

  mkdirSync(HISTORY_DIR, { recursive: true });
  writeFileSync(finalPath, html);

  const entry = {
    id,
    prompt,
    outputPath: finalPath,
    provider,
    model,
    createdAt: new Date().toISOString(),
  };

  history.push(entry);
  saveHistory(history);
  return entry;
}

export function getEntry(id) {
  const history = loadHistory();
  return history.find((e) => e.id === id) || null;
}

export function readEntryHtml(entry) {
  return readFileSync(entry.outputPath, 'utf8');
}
