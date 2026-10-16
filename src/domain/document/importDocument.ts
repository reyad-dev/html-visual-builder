import type { ImportDocumentOptions, ImportWarning, SanitizedDocument } from './types';
import { parseHtmlDocument } from './parseHtmlDocument';
import { sanitizeHtml } from './sanitizeHtml';
import { validateUrl } from './urlPolicy';
import { consolidateWarnings, createUnsafeUrlWarning } from './warnings';

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Executes the complete secure HTML import pipeline:
 * 1. Checks document size limit.
 * 2. Parses document with DOMParser, extracting metadata, styles, and external stylesheet references.
 * 3. Sanitizes body markup through DOMPurify with strict HTML profiles.
 * 4. Applies post-sanitization URL policy validation against all links, images, and resources.
 * 5. Consolidates structured security and compatibility warnings.
 *
 * @throws {Error} if file size exceeds the allowed threshold or parsing critically fails.
 */
export function importDocument(
  rawHtml: string,
  options: ImportDocumentOptions = {}
): SanitizedDocument {
  const maxFileSize = options.maxFileSize ?? DEFAULT_MAX_FILE_SIZE;

  if (typeof rawHtml !== 'string') {
    throw new TypeError('Invalid input: HTML content must be a string.');
  }

  // Size limit validation (AC-IMPORT-008 & security spec)
  const byteLength = new TextEncoder().encode(rawHtml).length;
  if (byteLength > maxFileSize) {
    throw new Error(
      `File size (${(byteLength / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed limit of ${(maxFileSize / (1024 * 1024)).toFixed(0)} MB.`
    );
  }

  // 1. DOMParser extraction of metadata, head styles, links, and initial warnings
  const parsed = parseHtmlDocument(rawHtml);
  const collectedWarnings: ImportWarning[] = [...parsed.warnings];

  // 2. DOMPurify sanitization of body markup
  const sanitized = sanitizeHtml(parsed.bodyHtml);
  collectedWarnings.push(...sanitized.warnings);

  // 3. Strict URL policy normalization and validation pass on sanitized markup
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized.cleanHtml, 'text/html');

  let unsafeUrlCount = 0;
  const elementsWithUrls = doc.body.querySelectorAll('[href], [src], [action], [poster], [xlink\\:href]');

  for (const el of elementsWithUrls) {
    const isImage = el.tagName.toLowerCase() === 'img';

    for (const attr of ['href', 'src', 'action', 'poster', 'xlink:href']) {
      const val = el.getAttribute(attr);
      if (val !== null) {
        const validation = validateUrl(val, {
          allowDataImage: isImage && attr === 'src',
        });

        if (!validation.isValid) {
          unsafeUrlCount++;
          el.removeAttribute(attr);
        } else if (validation.sanitizedUrl && validation.sanitizedUrl !== val) {
          el.setAttribute(attr, validation.sanitizedUrl);
        }
      }
    }
  }

  // Also check inline style attributes for url(javascript:...) or expression(...)
  const elementsWithStyle = doc.body.querySelectorAll('[style]');
  for (const el of elementsWithStyle) {
    const styleVal = el.getAttribute('style') || '';
    if (
      /javascript:/i.test(styleVal) ||
      /vbscript:/i.test(styleVal) ||
      /expression\s*\(/i.test(styleVal) ||
      /data:(?!image\/)/i.test(styleVal)
    ) {
      unsafeUrlCount++;
      el.removeAttribute('style');
    }
  }

  if (unsafeUrlCount > 0) {
    collectedWarnings.push(createUnsafeUrlWarning(unsafeUrlCount));
  }

  // Sanitize extracted CSS: neutralize javascript: or expression() in CSS
  let cleanCss = parsed.css;
  if (cleanCss) {
    if (
      /javascript:/i.test(cleanCss) ||
      /vbscript:/i.test(cleanCss) ||
      /expression\s*\(/i.test(cleanCss)
    ) {
      cleanCss = cleanCss
        .replace(/javascript:[^;)}\n]+/gi, 'about:blank')
        .replace(/expression\s*\([^;)}\n]+\)/gi, 'none');
      collectedWarnings.push(createUnsafeUrlWarning(1, 'Unsafe constructs in CSS neutralized'));
    }
  }

  const finalBodyHtml = doc.body ? doc.body.innerHTML : '';
  const warnings = consolidateWarnings(collectedWarnings);

  return {
    title: parsed.title,
    lang: parsed.lang,
    dir: parsed.dir,
    meta: parsed.meta,
    bodyHtml: finalBodyHtml,
    html: finalBodyHtml,
    css: cleanCss,
    externalStylesheets: parsed.externalStylesheets,
    warnings,
  };
}
