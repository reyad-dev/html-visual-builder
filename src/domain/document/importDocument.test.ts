import { describe, it, expect } from 'vitest';
import { importDocument } from './importDocument';
import {
  MALICIOUS_SCRIPT_FIXTURE,
  MALICIOUS_EVENT_HANDLER_FIXTURE,
  MALICIOUS_JAVASCRIPT_URL_FIXTURE,
  MALICIOUS_EMBEDS_FIXTURE,
  MALICIOUS_MALFORMED_HTML_FIXTURE,
  SAFE_HTML_FIXTURE,
} from '../../../tests/fixtures/securityFixtures';

describe('Secure HTML Import Pipeline (Epic 3)', () => {
  it('AC-IMPORT-001: imports body content from a full HTML document', () => {
    const doc = importDocument(SAFE_HTML_FIXTURE);

    expect(doc.title).toBe('Safe Landing Page');
    expect(doc.lang).toBe('en');
    expect(doc.bodyHtml).toContain('Welcome to Visual Builder');
    expect(doc.bodyHtml).toContain('Get Started');
    expect(doc.bodyHtml).not.toContain('<html');
    expect(doc.bodyHtml).not.toContain('<body');
    expect(doc.meta).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'description', content: 'A completely safe sample landing page' }),
      ])
    );
  });

  it('AC-IMPORT-002: imports valid HTML uploaded as a raw string representation', () => {
    const uploadedHtml = '<div class="banner"><h1>Hello World</h1></div>';
    const doc = importDocument(uploadedHtml);

    expect(doc.bodyHtml).toContain('Hello World');
    expect(doc.bodyHtml).toContain('class="banner"');
  });

  it('AC-IMPORT-003: extracts and loads inline <style> CSS blocks', () => {
    const htmlWithStyles = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>.head-style { font-size: 20px; }</style>
        </head>
        <body>
          <div class="head-style">Content</div>
          <style>.body-style { color: green; }</style>
        </body>
      </html>
    `;
    const doc = importDocument(htmlWithStyles);

    expect(doc.css).toContain('.head-style { font-size: 20px; }');
    expect(doc.css).toContain('.body-style { color: green; }');
    // Ensure <style> was removed from bodyHtml so it does not pollute the visual component tree
    expect(doc.bodyHtml).not.toContain('<style>');
  });

  it('AC-IMPORT-004: removes all <script> tags and generates SCRIPT_REMOVED warning', () => {
    const doc = importDocument(MALICIOUS_SCRIPT_FIXTURE);

    expect(doc.bodyHtml).not.toContain('<script');
    expect(doc.bodyHtml).not.toContain('pwned');
    expect(doc.bodyHtml).not.toContain('evil.example.com');
    expect(doc.bodyHtml).toContain('Safe Title');
    expect(doc.bodyHtml).toContain('Safe paragraph text');

    const scriptWarning = doc.warnings.find((w) => w.code === 'SCRIPT_REMOVED');
    expect(scriptWarning).toBeDefined();
    expect(scriptWarning?.severity).toBe('warning');
  });

  it('AC-IMPORT-005: removes inline event handlers and generates EVENT_HANDLER_REMOVED warning', () => {
    const doc = importDocument(MALICIOUS_EVENT_HANDLER_FIXTURE);

    expect(doc.bodyHtml).not.toContain('onerror');
    expect(doc.bodyHtml).not.toContain('onclick');
    expect(doc.bodyHtml).not.toContain('onmouseover');
    expect(doc.bodyHtml).not.toContain('onfocus');
    expect(doc.bodyHtml).not.toContain('oninput');
    expect(doc.bodyHtml).not.toContain('onload');

    const eventWarning = doc.warnings.find((w) => w.code === 'EVENT_HANDLER_REMOVED');
    expect(eventWarning).toBeDefined();
    expect(eventWarning?.count).toBeGreaterThan(0);
  });

  it('AC-IMPORT-006: removes or rejects javascript: and dangerous data: URLs', () => {
    const doc = importDocument(MALICIOUS_JAVASCRIPT_URL_FIXTURE);

    expect(doc.bodyHtml).not.toContain('javascript:');
    expect(doc.bodyHtml).not.toContain('JAVASCRIPT:');
    expect(doc.bodyHtml).not.toContain('vbscript:');
    expect(doc.bodyHtml).not.toContain('data:text/html');

    const urlWarning = doc.warnings.find((w) => w.code === 'UNSAFE_URL_REMOVED');
    expect(urlWarning).toBeDefined();
  });

  it('AC-IMPORT-007: reports external stylesheets as warnings without fetching or embedding', () => {
    const doc = importDocument(SAFE_HTML_FIXTURE);

    expect(doc.externalStylesheets).toHaveLength(1);
    expect(doc.externalStylesheets[0]).toContain('fonts.googleapis.com');

    const warning = doc.warnings.find((w) => w.code === 'EXTERNAL_STYLESHEET_NOT_LOADED');
    expect(warning).toBeDefined();
    expect(warning?.details).toContain('fonts.googleapis.com');
  });

  it('AC-IMPORT-008: strictly fails and throws on invalid inputs or files exceeding size limit', () => {
    // Exceeding 5 MB limit
    const hugeHtml = '<div>Huge content</div>' + 'a'.repeat(5 * 1024 * 1024 + 10);
    expect(() => importDocument(hugeHtml)).toThrow(/exceeds the maximum allowed limit/i);

    // Invalid non-string input
    expect(() => importDocument(null as unknown as string)).toThrow();
  });

  it('AC-IMPORT-010: neutralizes all malicious fixtures without executing code', () => {
    // Embeds
    const docEmbeds = importDocument(MALICIOUS_EMBEDS_FIXTURE);
    expect(docEmbeds.bodyHtml).not.toContain('<iframe');
    expect(docEmbeds.bodyHtml).not.toContain('<object');
    expect(docEmbeds.bodyHtml).not.toContain('<embed');
    expect(docEmbeds.bodyHtml).not.toContain('<applet');
    expect(docEmbeds.warnings.some((w) => w.code === 'EMBED_REMOVED')).toBe(true);

    // Malformed HTML attack vectors
    const docMalformed = importDocument(MALICIOUS_MALFORMED_HTML_FIXTURE);
    expect(docMalformed.bodyHtml).not.toContain('alert');
    expect(docMalformed.bodyHtml).not.toContain('javascript:');
    expect(docMalformed.css).not.toContain('javascript:');
    expect(docMalformed.css).not.toContain('expression(');
  });

  it('preserves valid safe URLs such as https, mailto, tel, anchor, and safe image data URLs', () => {
    const doc = importDocument(SAFE_HTML_FIXTURE);

    expect(doc.bodyHtml).toContain('href="https://example.com/pricing"');
    expect(doc.bodyHtml).toContain('href="mailto:support@example.com"');
    expect(doc.bodyHtml).toContain('href="tel:+1234567890"');
    expect(doc.bodyHtml).toContain('href="#features"');
    expect(doc.bodyHtml).toContain('src="https://example.com/logo.png"');
    expect(doc.bodyHtml).toContain('src="data:image/png;base64,');
  });

  it('detects RTL direction attribute and Arabic text content with RTL priority', () => {
    const arabicHtml = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head><title>صفحة عربية</title></head>
        <body>
          <section>
            <h1>أهلاً بك في المحرر المرئي</h1>
            <p>تصميم متجاوب وسهل الاستخدام باللغة العربية.</p>
          </section>
        </body>
      </html>
    `;
    const doc = importDocument(arabicHtml);
    expect(doc.dir).toBe('rtl');
    expect(doc.lang).toBe('ar');
    expect(doc.title).toBe('صفحة عربية');
    expect(doc.bodyHtml).toContain('أهلاً بك في المحرر المرئي');
  });

  it('automatically grants RTL priority when Arabic characters exist even without explicit dir="rtl"', () => {
    const autoArabicHtml = `
      <div>
        <h2>عنوان رئيسي بالعربية</h2>
        <p>نص تجريبي للتأكد من دعم الاتجاه من اليمين لليسار.</p>
      </div>
    `;
    const doc = importDocument(autoArabicHtml);
    expect(doc.dir).toBe('rtl');
    expect(doc.lang).toBe('ar');
    expect(doc.bodyHtml).toContain('عنوان رئيسي بالعربية');
  });
});
