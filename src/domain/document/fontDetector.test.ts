import { describe, it, expect } from 'vitest';
import {
  detectDocumentFonts,
  parseFontFamilyNames,
  buildGoogleFontsUrl,
  createLocalFontFaceCss,
} from './fontDetector';

describe('Font Detection & Local Font Engine', () => {
  it('parses font family names and excludes generic CSS fallbacks', () => {
    const parsed = parseFontFamilyNames("'Amiri', 'Cairo', Arial, sans-serif, var(--my-font)");
    expect(parsed).toEqual(['Amiri', 'Cairo']);
  });

  it('builds valid Google Fonts URL', () => {
    const url = buildGoogleFontsUrl('Amiri');
    expect(url).toContain('family=Amiri');
    expect(url).toContain('display=swap');
  });

  it('detects fonts from external stylesheet links', () => {
    const html = '<div>Hello</div>';
    const externalLinks = [
      'https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Amiri&display=swap',
    ];
    const fonts = detectDocumentFonts(html, '', externalLinks);
    expect(fonts.some((f) => f.name.toLowerCase() === 'almarai')).toBe(true);
    expect(fonts.some((f) => f.name.toLowerCase() === 'amiri')).toBe(true);
  });

  it('detects fonts from CSS font-family rules and recognizes Arabic Google fonts', () => {
    const css = `
      .heading { font-family: 'Changa', 'Tajawal', sans-serif; }
      .body-text { font-family: 'MyCustomArabicFont', serif; }
    `;
    const fonts = detectDocumentFonts('<div></div>', css);
    expect(fonts.length).toBeGreaterThanOrEqual(3);

    const changa = fonts.find((f) => f.name.toLowerCase() === 'changa');
    expect(changa).toBeDefined();
    expect(changa?.isArabic).toBe(true);
    expect(changa?.isAvailableOnGoogleFonts).toBe(true);

    const custom = fonts.find((f) => f.name.toLowerCase() === 'mycustomarabicfont');
    expect(custom).toBeDefined();
    expect(custom?.isAvailableOnGoogleFonts).toBe(false);
  });

  it('creates local @font-face CSS snippet', () => {
    const css = createLocalFontFaceCss('CustomKufi', 'data:font/ttf;base64,AAAA...', 'truetype');
    expect(css).toContain("@font-face");
    expect(css).toContain("font-family: 'CustomKufi'");
    expect(css).toContain("src: url('data:font/ttf;base64,AAAA...') format('truetype')");
  });
});
