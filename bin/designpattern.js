#!/usr/bin/env node

import { Command } from 'commander';
import { spawn } from 'node:child_process';
import { login, requireCredentials } from '../src/auth.js';
import {
  LOGO,
  DEFAULT_N,
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GLM_MODEL,
} from '../src/config.js';
import { generateAll } from '../src/generate.js';
import { loadHistory, addEntry, getEntry, readEntryHtml } from '../src/history.js';

const program = new Command();

program
  .name('designpattern')
  .description('Multi-AI HTML design generator — Gemini 3 Pro & GLM-5')
  .version('1.0.0')
  .hook('preAction', () => {
    console.error(LOGO);
  });

/* ---------- login ---------- */
program
  .command('login')
  .description('Set API keys for Gemini and Z.AI')
  .argument('[service]', 'Service to configure: gemini | zai (default: both)')
  .action(async (service) => {
    if (service && !['gemini', 'zai'].includes(service)) {
      console.error('Unknown service. Use "gemini", "zai", or omit for both.');
      process.exit(1);
    }
    await login(service);
  });

/* ---------- gen ---------- */
program
  .command('gen')
  .description('Generate HTML designs from a prompt')
  .argument('<prompt>', 'Design description')
  .option('-n, --count <number>', 'Number of designs to generate', String(DEFAULT_N))
  .action(async (prompt, opts) => {
    const creds = requireCredentials();
    const n = parseInt(opts.count, 10);

    if (isNaN(n) || n < 1) {
      console.error('Error: --count must be a positive integer.');
      process.exit(1);
    }

    const glmCount = Math.ceil(n / 2);
    const geminiCount = n - glmCount;

    console.error(`Generating ${n} designs (Gemini x${geminiCount}, GLM-5 x${glmCount}) ...`);

    const { results, failures } = await generateAll(
      prompt,
      creds.geminiApiKey,
      creds.zaiApiKey,
      n,
      DEFAULT_GEMINI_MODEL,
      DEFAULT_GLM_MODEL,
    );

    if (failures.length > 0) {
      for (const f of failures) {
        console.error(`Warning: generation failed — ${f.message || f}`);
      }
    }

    if (results.length === 0) {
      console.error('Error: all generations failed.');
      process.exit(1);
    }

    console.error('');

    const entries = [];
    for (const r of results) {
      const entry = addEntry(prompt, r.html, r.provider, r.model);
      entries.push(entry);
    }

    console.error('Saved:');
    for (const e of entries) {
      console.error(`  #${e.id} -> ${e.outputPath}`);
    }
  });

/* ---------- list ---------- */
program
  .command('list')
  .description('Show generation history')
  .option('-n, --limit <number>', 'Max entries to show', '30')
  .action((opts) => {
    const history = loadHistory();
    const limit = parseInt(opts.limit, 10) || 30;
    const items = history.slice(-limit);

    if (items.length === 0) {
      console.error('No history found.');
      return;
    }

    const lines = items.map((e) => formatEntry(e));
    const text = lines.join('\n');

    if (process.stderr.isTTY && lines.length > process.stdout.rows) {
      pager(text);
    } else {
      console.error(text);
    }
  });

/* ---------- show ---------- */
program
  .command('show')
  .description('Display a saved design by ID')
  .argument('<id>', 'Entry ID')
  .action((idStr) => {
    const id = parseInt(idStr, 10);
    const entry = getEntry(id);
    if (!entry) {
      console.error(`Entry #${id} not found.`);
      process.exit(1);
    }
    console.error(formatEntry(entry));
    const html = readEntryHtml(entry);
    process.stdout.write(html);
  });

/* ---------- regen ---------- */
program
  .command('regen')
  .description('Regenerate designs using the same prompt as an existing entry')
  .argument('<id>', 'Entry ID to use prompt from')
  .option('-n, --count <number>', 'Number of designs to generate', String(DEFAULT_N))
  .action(async (idStr, opts) => {
    const id = parseInt(idStr, 10);
    const entry = getEntry(id);
    if (!entry) {
      console.error(`Entry #${id} not found.`);
      process.exit(1);
    }

    const creds = requireCredentials();
    const n = parseInt(opts.count, 10);

    if (isNaN(n) || n < 1) {
      console.error('Error: --count must be a positive integer.');
      process.exit(1);
    }

    const glmCount = Math.ceil(n / 2);
    const geminiCount = n - glmCount;

    console.error(`Prompt: "${entry.prompt}"`);
    console.error(`Regenerating ${n} designs (Gemini x${geminiCount}, GLM-5 x${glmCount}) ...`);

    const { results, failures } = await generateAll(
      entry.prompt,
      creds.geminiApiKey,
      creds.zaiApiKey,
      n,
      DEFAULT_GEMINI_MODEL,
      DEFAULT_GLM_MODEL,
    );

    if (failures.length > 0) {
      for (const f of failures) {
        console.error(`Warning: generation failed — ${f.message || f}`);
      }
    }

    if (results.length === 0) {
      console.error('Error: all generations failed.');
      process.exit(1);
    }

    console.error('');

    const entries = [];
    for (const r of results) {
      const newEntry = addEntry(entry.prompt, r.html, r.provider, r.model);
      entries.push(newEntry);
    }

    console.error('Saved:');
    for (const e of entries) {
      console.error(`  #${e.id} -> ${e.outputPath}`);
    }
  });

/* ---------- helpers ---------- */

function formatEntry(e) {
  const prompt = e.prompt.length > 50 ? e.prompt.slice(0, 47) + '...' : e.prompt;
  const date = e.createdAt.replace('T', ' ').slice(0, 19);
  return `[${e.id}] ${prompt}  ->  ${e.outputPath}  (${date})`;
}

function pager(text) {
  const cmd = process.env.PAGER || 'less';
  const child = spawn(cmd, { stdio: ['pipe', 'inherit', 'inherit'] });
  child.stdin.write(text);
  child.stdin.end();
}

program.parse();
