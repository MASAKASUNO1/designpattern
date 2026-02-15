import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { GLM_BASE_URL, DEFAULT_GEMINI_MODEL, DEFAULT_GLM_MODEL } from './config.js';

const SYSTEM_PROMPT = [
  'You are a professional web designer.',
  'Generate a complete, self-contained HTML file based on the user\'s description.',
  '',
  'Rules:',
  '- Output ONLY the HTML code, no explanations',
  '- All CSS must be in <style> tags within the HTML',
  '- All JavaScript must be in <script> tags within the HTML',
  '- Do not use any external libraries or CDN links',
  '- The design must be responsive and visually polished',
  '- Use modern CSS features (grid, flexbox, custom properties, animations)',
].join('\n');

function stripCodeBlock(text) {
  let html = text.replace(/^```(?:html)?\s*/i, '').replace(/```\s*$/, '').trim();
  const endTag = html.lastIndexOf('</html>');
  if (endTag !== -1) {
    html = html.slice(0, endTag + '</html>'.length);
  }
  return html.trim();
}

export async function generateWithGemini(prompt, apiKey, model = DEFAULT_GEMINI_MODEL) {
  const ai = new GoogleGenAI({ apiKey });
  const res = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: { systemInstruction: SYSTEM_PROMPT },
  });
  return stripCodeBlock(res.text);
}

export async function generateWithGlm(prompt, apiKey, model = DEFAULT_GLM_MODEL) {
  const client = new OpenAI({
    apiKey,
    baseURL: GLM_BASE_URL,
  });
  const res = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });
  return stripCodeBlock(res.choices[0].message.content);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function generateAll(prompt, geminiKey, zaiKey, n, geminiModel, glmModel) {
  const glmCount = Math.ceil(n / 2);
  const geminiCount = n - glmCount;

  const tasks = [];

  for (let i = 0; i < geminiCount; i++) {
    tasks.push(
      generateWithGemini(prompt, geminiKey, geminiModel)
        .then((html) => ({ html, provider: 'gemini', model: geminiModel }))
    );
  }

  for (let i = 0; i < glmCount; i++) {
    tasks.push(
      generateWithGlm(prompt, zaiKey, glmModel)
        .then((html) => ({ html, provider: 'glm', model: glmModel }))
    );
  }

  const settled = await Promise.allSettled(tasks);

  const successes = [];
  const failures = [];

  for (const r of settled) {
    if (r.status === 'fulfilled') {
      successes.push(r.value);
    } else {
      failures.push(r.reason);
    }
  }

  return { results: shuffle(successes), failures };
}
