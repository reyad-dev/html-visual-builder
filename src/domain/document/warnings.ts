import type { ImportWarning } from './types';

export function createScriptWarning(count = 1): ImportWarning {
  return {
    code: 'SCRIPT_REMOVED',
    message: 'Interactive JavaScript behavior is disabled in the visual editor and is not included in safe export.',
    count,
    severity: 'warning',
  };
}

export function createEventHandlerWarning(count = 1): ImportWarning {
  return {
    code: 'EVENT_HANDLER_REMOVED',
    message: `${count} inline event handler${count === 1 ? '' : 's'} (e.g. onclick, onerror) were stripped for security.`,
    count,
    severity: 'warning',
  };
}

export function createUnsafeUrlWarning(count = 1, details?: string): ImportWarning {
  return {
    code: 'UNSAFE_URL_REMOVED',
    message: `${count} unsafe URL scheme${count === 1 ? '' : 's'} (e.g. javascript: or non-image data URLs) were removed or neutralized.`,
    count,
    details,
    severity: 'warning',
  };
}

export function createExternalStylesheetWarning(url: string): ImportWarning {
  return {
    code: 'EXTERNAL_STYLESHEET_NOT_LOADED',
    message: `External stylesheet "${url}" was detected but not loaded into the canvas.`,
    details: url,
    severity: 'info',
  };
}

export function createEmbedWarning(count = 1): ImportWarning {
  return {
    code: 'EMBED_REMOVED',
    message: `${count} embedded executable object${count === 1 ? '' : 's'} (iframe, embed, or object) were removed for security.`,
    count,
    severity: 'warning',
  };
}

export function createMalformedHtmlWarning(): ImportWarning {
  return {
    code: 'MALFORMED_HTML_NORMALIZED',
    message: 'The imported HTML was malformed and was automatically normalized by the parser.',
    severity: 'info',
  };
}

export function createRemoteAssetWarning(count = 1): ImportWarning {
  return {
    code: 'REMOTE_ASSET_MAY_FAIL',
    message: `${count} remote asset reference${count === 1 ? '' : 's'} detected. They require network connectivity to render and will not be bundled offline.`,
    count,
    severity: 'info',
  };
}

/**
 * Deduplicates and groups warnings by code, aggregating counts where applicable.
 */
export function consolidateWarnings(warnings: ImportWarning[]): ImportWarning[] {
  const map = new Map<string, ImportWarning>();

  for (const warning of warnings) {
    const key =
      warning.code === 'EXTERNAL_STYLESHEET_NOT_LOADED'
        ? `${warning.code}:${warning.details || warning.message}`
        : warning.code;

    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...warning });
    } else {
      if (typeof existing.count === 'number' && typeof warning.count === 'number') {
        existing.count += warning.count;
      }
      if (warning.details && !existing.details?.includes(warning.details)) {
        existing.details = existing.details ? `${existing.details}, ${warning.details}` : warning.details;
      }
    }
  }

  return Array.from(map.values());
}
