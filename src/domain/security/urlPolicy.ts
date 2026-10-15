/**
 * Security policy for user-edited URLs and HTML attributes.
 * Implements strict defense against XSS, javascript: URI execution, and event handler injection.
 * (T-0209, T-0210, AC-ATTR-003, AC-ATTR-004)
 */

export interface UrlValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

const SAFE_IMAGE_DATA_REGEX = /^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i;

/**
 * Validates a user-supplied URL (for href, src, background-image, etc.).
 *
 * @param rawUrl The URL input from the user.
 * @param options.allowDataImage Whether to allow safe base64 image data URLs (e.g. for img src).
 */
export function validateUrl(
  rawUrl: string,
  options: { allowDataImage?: boolean } = {}
): UrlValidationResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL cannot be empty' };
  }

  // Strip leading/trailing control chars and whitespace
  // Remove ASCII control characters (0-31, 127-159) and whitespace that attackers use to bypass checks
  const cleaned = rawUrl
    .split('')
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code > 31 && (code < 127 || code > 159) && !/\s/.test(char);
    })
    .join('');

  if (!cleaned) {
    return { isValid: false, error: 'URL cannot be empty or purely whitespace' };
  }

  // Check for javascript: or vbscript: or other script protocols (case-insensitive)
  const lower = cleaned.toLowerCase();
  if (lower.startsWith('javascript:') || lower.startsWith('vbscript:')) {
    return {
      isValid: false,
      error: 'Unsafe URL scheme detected. JavaScript and VBScript URLs are forbidden.',
    };
  }

  // If data: URL
  if (lower.startsWith('data:')) {
    if (options.allowDataImage && SAFE_IMAGE_DATA_REGEX.test(cleaned)) {
      return { isValid: true, sanitizedUrl: cleaned };
    }
    return {
      isValid: false,
      error: 'data: URLs are prohibited except for verified safe image formats on images.',
    };
  }

  // Anchors, relative paths, queries
  if (
    cleaned.startsWith('#') ||
    cleaned.startsWith('/') ||
    cleaned.startsWith('./') ||
    cleaned.startsWith('../') ||
    cleaned.startsWith('?')
  ) {
    return { isValid: true, sanitizedUrl: cleaned };
  }

  // Check for absolute protocol
  try {
    new URL(cleaned, 'https://example.com');
    
    // If the raw URL contained a protocol
    const colonIndex = cleaned.indexOf(':');
    if (colonIndex !== -1) {
      const scheme = cleaned.slice(0, colonIndex + 1).toLowerCase();
      if (!ALLOWED_PROTOCOLS.has(scheme)) {
        return {
          isValid: false,
          error: `URL scheme "${scheme}" is not allowed. Supported schemes: http, https, mailto, tel, or relative URLs.`,
        };
      }
    }

    return { isValid: true, sanitizedUrl: cleaned };
  } catch {
    // If URL parsing failed and it didn't start with a relative prefix or anchor
    return {
      isValid: false,
      error: 'Malformed URL. Please enter a valid URL or relative path.',
    };
  }
}

/**
 * Checks if an attribute name is dangerous (e.g. event handlers like `onclick`, `onerror`).
 */
export function isDangerousAttribute(attributeName: string): boolean {
  if (!attributeName || typeof attributeName !== 'string') {
    return true;
  }

  const normalized = attributeName.trim().toLowerCase();

  // Forbid any attribute starting with 'on' (onclick, onload, onerror, etc.)
  if (normalized.startsWith('on')) {
    return true;
  }

  // Forbid form action hijacking or srcdoc injection
  if (normalized === 'srcdoc' || normalized === 'formaction') {
    return true;
  }

  // Attribute name must be a valid XML/HTML name (letters, digits, hyphens, underscores)
  const validNameRegex = /^[a-z_][a-z0-9_\-.:]*$/i;
  if (!validNameRegex.test(normalized)) {
    return true;
  }

  return false;
}
