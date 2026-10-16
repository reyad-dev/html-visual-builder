/**
 * Font Detection and Management Engine
 *
 * Detects, validates, and dynamically registers web and local fonts from HTML/CSS
 * with first-class support for Arabic typography.
 */

export interface DetectedFont {
  name: string;
  isArabic: boolean;
  isAvailableOnGoogleFonts: boolean;
  isLoaded: boolean;
  googleFontsUrl?: string | undefined;
  source: 'google-fonts' | 'font-face' | 'css-rule' | 'local';
}

export const KNOWN_ARABIC_GOOGLE_FONTS = new Set([
  'alexandria',
  'cairo',
  'tajawal',
  'almarai',
  'amiri',
  'changa',
  'noto sans arabic',
  'noto kufi arabic',
  'rubik',
  'el messiri',
  'readex pro',
  'ibm plex sans arabic',
  'lalezar',
  'mada',
  'harmattan',
  'reem kufi',
  'scheherazade new',
  'marhey',
  'katibeh',
  'lemonada',
  'aref ruqaa',
  'kufam',
]);

export const GENERIC_CSS_FONT_FALLBACKS = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  '-apple-system',
  'blinkmacsystemfont',
  'segoe ui',
  'roboto',
  'helvetica',
  'helvetica neue',
  'arial',
  'times new roman',
  'times',
  'courier new',
  'courier',
  'inherit',
  'initial',
  'unset',
  'revert',
]);

/**
 * Builds a Google Fonts CSS URL for a given font family.
 */
export function buildGoogleFontsUrl(fontFamily: string): string {
  const encoded = encodeURIComponent(fontFamily.trim());
  return `https://fonts.googleapis.com/css2?family=${encoded}:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,700&display=swap`;
}

/**
 * Parses font-family string and extracts clean font family names.
 */
export function parseFontFamilyNames(fontFamilyStr: string): string[] {
  if (!fontFamilyStr || typeof fontFamilyStr !== 'string') {
    return [];
  }

  return fontFamilyStr
    .split(',')
    .map((name) => name.trim().replace(/^['"]|['"]$/g, '').trim())
    .filter((name) => {
      if (!name) return false;
      const lower = name.toLowerCase();
      if (GENERIC_CSS_FONT_FALLBACKS.has(lower)) return false;
      if (lower.startsWith('var(')) return false;
      return true;
    });
}

/**
 * Detects all declared fonts in an HTML string and associated CSS.
 */
export function detectDocumentFonts(
  rawHtml: string,
  css = '',
  externalStylesheets: string[] = []
): DetectedFont[] {
  const detectedMap = new Map<string, DetectedFont>();

  const registerFont = (
    name: string,
    source: DetectedFont['source'],
    customGoogleUrl?: string
  ): void => {
    const cleanName = name.trim().replace(/^['"]|['"]$/g, '');
    if (!cleanName) return;

    const lower = cleanName.toLowerCase();
    if (GENERIC_CSS_FONT_FALLBACKS.has(lower) || lower.startsWith('var(')) {
      return;
    }

    if (detectedMap.has(lower)) {
      return;
    }

    const isArabic =
      KNOWN_ARABIC_GOOGLE_FONTS.has(lower) ||
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(cleanName);

    const isAvailableOnGoogleFonts =
      KNOWN_ARABIC_GOOGLE_FONTS.has(lower) || Boolean(customGoogleUrl);

    const googleFontsUrl =
      customGoogleUrl || (isAvailableOnGoogleFonts ? buildGoogleFontsUrl(cleanName) : undefined);

    detectedMap.set(lower, {
      name: cleanName,
      isArabic,
      isAvailableOnGoogleFonts,
      isLoaded: false,
      googleFontsUrl,
      source,
    });
  };

  // 1. Check external stylesheet links for Google Fonts queries
  for (const url of externalStylesheets) {
    if (url.includes('fonts.googleapis.com/css')) {
      try {
        const parsed = new URL(url, 'https://fonts.googleapis.com');
        const families = parsed.searchParams.getAll('family');
        for (const fam of families) {
          const fontName = fam.split(':')[0]?.replace(/\+/g, ' ');
          if (fontName) {
            registerFont(fontName, 'google-fonts', url);
          }
        }
      } catch {
        // Fallback regex if URL parsing fails
        const match = url.match(/family=([^&:]+)/g);
        if (match) {
          for (const m of match) {
            const fontName = decodeURIComponent(m.replace('family=', '')).replace(/\+/g, ' ');
            registerFont(fontName, 'google-fonts', url);
          }
        }
      }
    }
  }

  // 2. Check @import in CSS
  const importMatches = (css + '\n' + rawHtml).matchAll(/@import\s+(?:url\(['"]?([^'"\)]+)['"]?\)|['"]([^'"]+)['"])/gi);
  for (const match of importMatches) {
    const importUrl = match[1] || match[2] || '';
    if (importUrl.includes('fonts.googleapis.com/css')) {
      const famMatches = importUrl.matchAll(/family=([^&:]+)/g);
      for (const fm of famMatches) {
        if (fm[1]) {
          const fontName = decodeURIComponent(fm[1]).replace(/\+/g, ' ');
          registerFont(fontName, 'google-fonts', importUrl);
        }
      }
    }
  }

  // 3. Check @font-face rules
  const fontFaceMatches = (css + '\n' + rawHtml).matchAll(/@font-face\s*\{[^}]*font-family:\s*['"]?([^'";}]+)['"]?/gi);
  for (const match of fontFaceMatches) {
    if (match[1]) {
      registerFont(match[1].trim(), 'font-face');
    }
  }

  // 4. Check font-family in CSS blocks and inline styles
  const combinedText = css + '\n' + rawHtml;
  const fontFamilyMatches = combinedText.matchAll(/font-family\s*:\s*([^;!}]+)/gi);
  for (const match of fontFamilyMatches) {
    if (match[1]) {
      const names = parseFontFamilyNames(match[1]);
      for (const name of names) {
        registerFont(name, 'css-rule');
      }
    }
  }

  return Array.from(detectedMap.values());
}

/**
 * Injects a web font link into both the main document head and the editor canvas iframe.
 */
export function injectFontStylesheet(url: string, canvasDoc?: Document | null): void {
  if (!url || typeof document === 'undefined') {
    return;
  }

  // Inject into main document if not already present
  const existingInMain = document.querySelector(`link[href="${url}"]`);
  if (!existingInMain) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  // Inject into canvas iframe if available
  if (canvasDoc && canvasDoc.head) {
    const existingInCanvas = canvasDoc.querySelector(`link[href="${url}"]`);
    if (!existingInCanvas) {
      const link = canvasDoc.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      canvasDoc.head.appendChild(link);
    }
  }
}

/**
 * Registers a locally uploaded font file as a @font-face rule.
 */
export function createLocalFontFaceCss(
  fontName: string,
  dataUrl: string,
  format = 'woff2'
): string {
  return `@font-face {
  font-family: '${fontName}';
  src: url('${dataUrl}') format('${format}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}\n`;
}

/**
 * Injects a @font-face CSS snippet into both the main document head and the editor canvas iframe.
 */
export function injectFontFaceCss(
  cssSnippet: string,
  identifier: string,
  canvasDoc?: Document | null
): void {
  if (!cssSnippet || typeof document === 'undefined') {
    return;
  }

  const styleId = `custom-font-${identifier.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  // Main document
  let mainStyle = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!mainStyle) {
    mainStyle = document.createElement('style');
    mainStyle.id = styleId;
    document.head.appendChild(mainStyle);
  }
  mainStyle.textContent = cssSnippet;

  // Canvas document
  if (canvasDoc && canvasDoc.head) {
    let canvasStyle = canvasDoc.getElementById(styleId) as HTMLStyleElement | null;
    if (!canvasStyle) {
      canvasStyle = canvasDoc.createElement('style');
      canvasStyle.id = styleId;
      canvasDoc.head.appendChild(canvasStyle);
    }
    canvasStyle.textContent = cssSnippet;
  }
}
