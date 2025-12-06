// constants/gemini.ts
import Constants from 'expo-constants';
import { MedicalRecordBase } from './types';

// 🔹 Try expoConfig.extra first, then fall back to manifest.extra
const extra =
  (Constants.expoConfig as any)?.extra ??
  (Constants.manifest as any)?.extra ??
  {};

// 🔑 Backend URL that holds the Gemini API key and talks to Gemini
const BACKEND_URL: string =
  (extra.backendUrl as string) ?? 'http://localhost:4000';

const FORMAT_ENDPOINT = `${BACKEND_URL}/api/format-record`;
const SAMPLE_ENDPOINT = `${BACKEND_URL}/api/sample-note`;

console.log('[Gemini] extra from config:', extra);
console.log('[Gemini] Backend URL:', BACKEND_URL);

// 🔹 No GEMINI_API_KEY or direct Gemini calls on frontend anymore

export function createMarkdownReport(data: MedicalRecordBase): string {
  const safeJoin = (arr: unknown): string =>
    Array.isArray(arr) && (arr as any[]).length > 0
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
 * Call backend to organize raw medical record text.
 * Backend uses GEMINI_API_KEY and returns structured JSON.
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
 * Call backend to generate messy sample medical note text.
 * Backend uses GEMINI_API_KEY and returns plain text.
 */
export async function generateSampleRawMedicalText(): Promise<string> {
  const res = await fetch(SAMPLE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Backend sample generator error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as any;
  const sample = json?.sample as string | undefined;

  if (!sample) {
    throw new Error('Backend returned empty sample note.');
  }

  return sample.trim();
}
