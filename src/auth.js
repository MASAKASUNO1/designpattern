import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { GLOBAL_CONFIG_DIR, API_KEY_FILE } from './config.js';

function loadStored() {
  try {
    return JSON.parse(readFileSync(API_KEY_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export function loadCredentials() {
  const stored = loadStored();
  return {
    geminiApiKey: process.env.GEMINI_API_KEY || stored.geminiApiKey || null,
    zaiApiKey: process.env.ZAI_API_KEY || stored.zaiApiKey || null,
  };
}

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function login(service) {
  const stored = loadStored();
  const rl = createInterface({ input: process.stdin, output: process.stderr });

  try {
    if (!service || service === 'gemini') {
      if (stored.geminiApiKey) {
        const ans = await ask(rl, 'Gemini API Key is already set. Overwrite? (y/N): ');
        if (ans.toLowerCase() === 'y') {
          stored.geminiApiKey = await ask(rl, 'Gemini API Key: ');
        } else {
          console.error('Gemini API Key: unchanged.');
        }
      } else {
        stored.geminiApiKey = await ask(rl, 'Gemini API Key: ');
      }
    }

    if (!service || service === 'zai') {
      if (stored.zaiApiKey) {
        const ans = await ask(rl, 'Z.AI API Key is already set. Overwrite? (y/N): ');
        if (ans.toLowerCase() === 'y') {
          stored.zaiApiKey = await ask(rl, 'Z.AI API Key: ');
        } else {
          console.error('Z.AI API Key: unchanged.');
        }
      } else {
        stored.zaiApiKey = await ask(rl, 'Z.AI API Key: ');
      }
    }
  } finally {
    rl.close();
  }

  mkdirSync(GLOBAL_CONFIG_DIR, { recursive: true });
  writeFileSync(API_KEY_FILE, JSON.stringify(stored, null, 2), { mode: 0o600 });
  console.error('Credentials saved.');
}

export function requireCredentials() {
  const creds = loadCredentials();
  if (!creds.geminiApiKey) {
    console.error('Error: Gemini API Key not found.');
    console.error('Run "designpattern login" or set GEMINI_API_KEY env variable.');
    process.exit(1);
  }
  if (!creds.zaiApiKey) {
    console.error('Error: Z.AI API Key not found.');
    console.error('Run "designpattern login" or set ZAI_API_KEY env variable.');
    process.exit(1);
  }
  return creds;
}
