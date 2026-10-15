import DOMPurifyModule from 'dompurify';
import type { ImportWarning } from './types';
import {
  createScriptWarning,
  createEventHandlerWarning,
  createEmbedWarning,
} from './warnings';

// Explicitly forbidden tags and attributes according to 06_IMPORT_EXPORT and 09_SECURITY
export const FORBIDDEN_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'frame',
  'frameset',
  'noscript',
];

export const FORBIDDEN_ATTRS = ['formaction', 'srcdoc'];

/**
 * Retrieves or creates a DOMPurify instance compatible with browser and JSDOM environments.
 */
export function getPurifyInstance(): ReturnType<typeof DOMPurifyModule> {
  if (typeof DOMPurifyModule.sanitize === 'function') {
    return DOMPurifyModule;
  }
  if (typeof window !== 'undefined') {
    return (DOMPurifyModule as unknown as (win: Window) => typeof DOMPurifyModule)(window);
  }
  throw new Error('Window context is not available for DOMPurify initialization');
}

export interface SanitizeResult {
  cleanHtml: string;
  warnings: ImportWarning[];
}

/**
 * Sanitizes an HTML string using DOMPurify with strict security settings for the visual editor.
 * Guarantees zero script, event-handler, or dangerous embed execution.
 */
export function sanitizeHtml(html: string): SanitizeResult {
  if (!html || typeof html !== 'string') {
    return { cleanHtml: '', warnings: [] };
  }

  const purify = getPurifyInstance();
  const warnings: ImportWarning[] = [];

  let scriptCount = 0;
  let embedCount = 0;
  let eventHandlerCount = 0;

  // Temporary hooks to track stripped constructs
  const beforeSanitizeElementsHook = (node: Node): void => {
    if (node.nodeType === 1) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();
      if (tagName === 'script') {
        scriptCount++;
      } else if (['iframe', 'object', 'embed', 'applet', 'frame', 'frameset'].includes(tagName)) {
        embedCount++;
      }
    }
  };

  const uponSanitizeAttributeHook = (_node: Node, data: { attrName: string; attrValue: string; keepAttr: boolean }): void => {
    const attrLower = data.attrName.toLowerCase();
    if (attrLower.startsWith('on') || FORBIDDEN_ATTRS.includes(attrLower)) {
      eventHandlerCount++;
      data.keepAttr = false;
    }
  };

  try {
    purify.addHook('beforeSanitizeElements', beforeSanitizeElementsHook);
    purify.addHook('uponSanitizeAttribute', uponSanitizeAttributeHook);

    const cleanHtml = purify.sanitize(html, {
      USE_PROFILES: { html: true },
      FORBID_TAGS: FORBIDDEN_TAGS,
      FORBID_ATTR: FORBIDDEN_ATTRS,
      ALLOW_DATA_ATTR: true,
      ALLOW_ARIA_ATTR: true,
      RETURN_TRUSTED_TYPE: false,
    }) as string;

    if (scriptCount > 0) {
      warnings.push(createScriptWarning(scriptCount));
    }
    if (embedCount > 0) {
      warnings.push(createEmbedWarning(embedCount));
    }
    if (eventHandlerCount > 0) {
      warnings.push(createEventHandlerWarning(eventHandlerCount));
    }

    return { cleanHtml, warnings };
  } finally {
    purify.removeHook('beforeSanitizeElements');
    purify.removeHook('uponSanitizeAttribute');
  }
}
