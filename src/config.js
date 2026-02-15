import { homedir } from 'node:os';
import { join } from 'node:path';

export const HISTORY_DIR = '.designpattern';
export const HISTORY_FILE = 'history.json';

export const DEFAULT_N = 4;

export const DEFAULT_GEMINI_MODEL = 'gemini-3-pro-preview';
export const DEFAULT_GLM_MODEL = 'GLM-5';

export const GLM_BASE_URL = 'https://api.z.ai/api/coding/paas/v4';

export const GLOBAL_CONFIG_DIR = join(homedir(), '.config', 'designpattern');
export const API_KEY_FILE = join(GLOBAL_CONFIG_DIR, 'credentials.json');

export const LOGO = [
  '',
  '  \x1b[36m\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557\x1b[0m',
  '  \x1b[36m\u2551\x1b[0m  \x1b[1;33mDESIGN PATTERN GENERATOR\x1b[0m               \x1b[36m\u2551\x1b[0m',
  '  \x1b[36m\u2551\x1b[0m  \x1b[90mPowered by Gemini 3 Pro & GLM-5\x1b[0m     \x1b[36m\u2551\x1b[0m',
  '  \x1b[36m\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d\x1b[0m',
  '',
].join('\n');
