/**
 * OCR Engine — Tesseract.js Wrapper
 *
 * All processing is ON-DEVICE. No images are uploaded anywhere.
 * Supports: Lab reports, Prescriptions, Medical documents
 */

let Tesseract = null;
let worker = null;

/**
 * Lazy-load Tesseract.js (WASM module is large)
 */
async function getTesseract() {
  if (!Tesseract) {
    try {
      Tesseract = await import('tesseract.js');
    } catch {
      // Fallback: warn if not installed
      console.warn('Tesseract.js not available. OCR features disabled.');
      return null;
    }
  }
  return Tesseract;
}

/**
 * Initialize OCR worker
 */
async function initWorker() {
  if (worker) return worker;
  const T = await getTesseract();
  if (!T) return null;
  try {
    worker = await T.createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          // Progress callback — could be used for UI updates
        }
      },
    });
    // Add medical terms to improve accuracy
    await worker.setParameters({
      tessedit_char_whitelist: '',
      user_defined_dpi: '300',
    });
  } catch (e) {
    console.warn('OCR worker init failed:', e);
    return null;
  }
  return worker;
}

/**
 * Run OCR on an image file
 * @param {File} imageFile - Image file (JPG/PNG)
 * @returns {Promise<{ text: string, confidence: number, words: Array }>}
 */
export async function performOCR(imageFile) {
  const w = await initWorker();
  if (!w) {
    return {
      text: 'OCR engine not available. Install tesseract.js: npm install tesseract.js',
      confidence: 0,
      words: [],
    };
  }

  try {
    const { data } = await w.recognize(imageFile);
    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words || [],
    };
  } catch (e) {
    return {
      text: `OCR failed: ${e.message}`,
      confidence: 0,
      words: [],
    };
  }
}

/**
 * Clean OCR text — remove artifacts, normalize spacing
 */
export function cleanOCRText(text) {
  return text
    .replace(/[|¦]/g, 'I')
    .replace(/[®©™]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n\r\s]/g, '')
    .trim();
}

/**
 * Terminate worker (free memory)
 */
export async function terminateOCR() {
  if (worker) {
    try {
      await worker.terminate();
    } catch {}
    worker = null;
  }
}

/**
 * Check if OCR is available
 */
export function isOCRAvailable() {
  try {
    require.resolve('tesseract.js');
    return true;
  } catch {
    return false;
  }
}

