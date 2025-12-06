// constants/gemini.ts
import Constants from 'expo-constants';
import { MedicalRecordBase } from './types';

// 🔹 Load extra config (from app.config.js → expo.extra)
const extra =
  (Constants.expoConfig as any)?.extra ??
  (Constants.manifest as any)?.extra ??
  {};

export const GEMINI_API_KEY: string = (extra.geminiApiKey as string) ?? '';

// ✅ Backend URL for proxy (set BACKEND_URL in your Expo .env → app.config.js → extra.backendUrl)
const BACKEND_URL: string =
  (extra.backendUrl as string) ?? 'http://localhost:4000';

const FORMAT_ENDPOINT = `${BACKEND_URL}/api/format-record`;

console.log('[Gemini] extra from config:', extra);
console.log(
  '[Gemini] Using key prefix:',
  GEMINI_API_KEY ? GEMINI_API_KEY.slice(0, 8) : 'NO_KEY_FOUND',
);

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

export async function fetchWithBackoff(
  url: string,
  options: RequestInit,
  retries = 5,
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status !== 429) return res;
      const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (e) {
      if (i === retries - 1) throw e;
    }
  }
  throw new Error('API request failed after multiple retries.');
}

export function createMarkdownReport(data: MedicalRecordBase): string {
  const safeJoin = (arr: unknown): string =>
    Array.isArray(arr) && arr.length > 0
      ? (arr as string[]).join('; ')
      : 'None listed.';

  return `
# Patient Medical Record Summary
***
## Patient Information
| Field | Value |
| :--- | :--- |
| **Patient Name** | ${data.patientName || 'N/A'} |
| **Date of Birth** | ${data.dob || 'N/A'} |
| **Visit Date** | ${data.visitDate || 'N/A'} |
| **Primary Provider** | ${data.provider || 'N/A'} |

## Clinical Details
| Field | Details |
| :--- | :--- |
| **Primary Diagnosis** | ${safeJoin(data.diagnosis)} |
| **Medications** | ${safeJoin(data.medications)} |

## Summary of Visit Notes
> ${data.summary || 'No detailed summary provided by AI analysis.'}
  `.trim();
}

/**
 * Now uses your backend proxy instead of calling Gemini directly.
 * Backend endpoint: POST /api/format-record { rawInput }
 */
export async function callGeminiForRecord(
  rawInput: string,
): Promise<MedicalRecordBase> {
  const res = await fetch(FORMAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rawInput }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as any;
  const structured = json?.data as MedicalRecordBase | undefined;

  if (!structured) {
    throw new Error('Backend returned empty or malformed data.');
  }

  return structured;
}

/**
 * For now this still calls Gemini directly using GEMINI_API_KEY.
 * Later you can add a /api/sample-note route in your backend and proxy this too.
 */
export async function generateSampleRawMedicalText(): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'GEMINI_API_KEY is missing (check extra.geminiApiKey or move this to backend).',
    );
  }

  const systemPrompt =
    'You generate realistic, messy, unstructured patient medical notes for testing. ' +
    'Do NOT format anything as JSON or Markdown. Do NOT add explanations. ' +
    'Output only the raw note text, as a single block of text, with line breaks, ' +
    'shorthand, abbreviations, and inconsistent formatting like rushed clinician notes.';

  const userPrompt = `
Make up a new patient encounter note with details like:

- chief complaint
- brief history
- meds
- allergies
- physical exam
- provider name
- visit date 
- assessment / plan

But keep it VERY UNFORMATTED:
- inconsistent spacing
- weird punctuation
- shorthand
- partial sentences
- messy line breaks

Again: DO NOT wrap in code fences. DO NOT use Markdown headings. Just raw text.
`;

  const payload = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      responseMimeType: 'text/plain',
    },
  } as const;

  const res = await fetchWithBackoff(`${API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini sample generator error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as any;
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text as
    | string
    | undefined;

  if (!text) {
    throw new Error('Gemini returned an empty sample note.');
  }

  const clean = text.replace(/```[\s\S]*?```/g, '').trim();
  return clean;
}
