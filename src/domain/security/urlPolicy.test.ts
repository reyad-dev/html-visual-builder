import { describe, it, expect } from 'vitest';
import { validateUrl, isDangerousAttribute } from './urlPolicy';

describe('Security: URL Policy & Attribute Validation (T-0209, T-0210)', () => {
  describe('validateUrl', () => {
    it('accepts safe http and https URLs', () => {
      expect(validateUrl('https://example.com').isValid).toBe(true);
      expect(validateUrl('http://example.com/page?id=123').isValid).toBe(true);
      expect(validateUrl('https://sub.domain.co.uk/path#anchor').isValid).toBe(true);
    });

    it('accepts relative paths, root-relative paths, and hash anchors', () => {
      expect(validateUrl('/about').isValid).toBe(true);
      expect(validateUrl('./assets/logo.png').isValid).toBe(true);
      expect(validateUrl('../styles/main.css').isValid).toBe(true);
      expect(validateUrl('#pricing-section').isValid).toBe(true);
      expect(validateUrl('?filter=active').isValid).toBe(true);
    });

    it('accepts mailto: and tel: links', () => {
      expect(validateUrl('mailto:support@example.com').isValid).toBe(true);
      expect(validateUrl('tel:+1234567890').isValid).toBe(true);
    });

    it('strictly rejects javascript: URLs with various casings and obfuscations (AC-ATTR-003)', () => {
      expect(validateUrl('javascript:alert(1)').isValid).toBe(false);
      expect(validateUrl('JavaScript:alert(1)').isValid).toBe(false);
      expect(validateUrl('  javascript:void(0)  ').isValid).toBe(false);
      expect(validateUrl('java\u0000script:alert(document.cookie)').isValid).toBe(false);
      expect(validateUrl('JAVASCRIPT:prompt(1)').isValid).toBe(false);
    });

    it('strictly rejects vbscript: URLs', () => {
      expect(validateUrl('vbscript:msgbox(1)').isValid).toBe(false);
      expect(validateUrl('VBScript:Run()').isValid).toBe(false);
    });

    it('rejects data: URLs by default for links', () => {
      const res = validateUrl('data:text/html,<script>alert(1)</script>');
      expect(res.isValid).toBe(false);
    });

    it('allows valid base64 image data URLs only when allowDataImage is enabled', () => {
      const pngData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(validateUrl(pngData, { allowDataImage: true }).isValid).toBe(true);
      expect(validateUrl(pngData, { allowDataImage: false }).isValid).toBe(false);
    });

    it('rejects file: and custom unknown schemes', () => {
      expect(validateUrl('file:///etc/passwd').isValid).toBe(false);
      expect(validateUrl('ftp://ftp.example.com').isValid).toBe(false);
      expect(validateUrl('gopher://old.net').isValid).toBe(false);
    });

    it('rejects empty and whitespace-only URLs', () => {
      expect(validateUrl('').isValid).toBe(false);
      expect(validateUrl('   ').isValid).toBe(false);
    });
  });

  describe('isDangerousAttribute', () => {
    it('detects and forbids any attribute starting with on (AC-ATTR-004)', () => {
      expect(isDangerousAttribute('onclick')).toBe(true);
      expect(isDangerousAttribute('onClick')).toBe(true);
      expect(isDangerousAttribute('ONERROR')).toBe(true);
      expect(isDangerousAttribute('onload')).toBe(true);
      expect(isDangerousAttribute('onmouseover')).toBe(true);
      expect(isDangerousAttribute('onfocus')).toBe(true);
      expect(isDangerousAttribute('onkeydown')).toBe(true);
    });

    it('forbids srcdoc and formaction', () => {
      expect(isDangerousAttribute('srcdoc')).toBe(true);
      expect(isDangerousAttribute('formaction')).toBe(true);
    });

    it('allows safe standard HTML attributes', () => {
      expect(isDangerousAttribute('id')).toBe(false);
      expect(isDangerousAttribute('class')).toBe(false);
      expect(isDangerousAttribute('title')).toBe(false);
      expect(isDangerousAttribute('alt')).toBe(false);
      expect(isDangerousAttribute('href')).toBe(false);
      expect(isDangerousAttribute('src')).toBe(false);
      expect(isDangerousAttribute('target')).toBe(false);
      expect(isDangerousAttribute('rel')).toBe(false);
      expect(isDangerousAttribute('data-testid')).toBe(false);
      expect(isDangerousAttribute('aria-label')).toBe(false);
    });

    it('rejects malformed attribute names with special characters or whitespace', () => {
      expect(isDangerousAttribute('attr with spaces')).toBe(true);
      expect(isDangerousAttribute('attr<script>')).toBe(true);
      expect(isDangerousAttribute('attr"quote')).toBe(true);
    });
  });
});
