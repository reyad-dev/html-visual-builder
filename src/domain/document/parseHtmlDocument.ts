import type { DocumentMeta, ImportWarning } from './types';
import {
  createExternalStylesheetWarning,
  createMalformedHtmlWarning,
  createRemoteAssetWarning,
  createScriptWarning,
  createEmbedWarning,
  createEventHandlerWarning,
} from './warnings';

export interface ParsedDocumentData {
  title: string;
  lang?: string | undefined;
  dir?: string | undefined;
  meta: DocumentMeta[];
  bodyHtml: string;
  css: string;
  externalStylesheets: string[];
  warnings: ImportWarning[];
}

/**
 * Extracts document structure, metadata, styles, and warnings from a raw HTML string using DOMParser.
 */
export function parseHtmlDocument(rawHtml: string): ParsedDocumentData {
  if (!rawHtml || !rawHtml.trim()) {
    return {
      title: 'Untitled Document',
      meta: [],
      bodyHtml: '',
      css: '',
      externalStylesheets: [],
      warnings: [],
    };
  }

  const warnings: ImportWarning[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Check for DOMParser parse error indicator
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    warnings.push(createMalformedHtmlWarning());
    parseError.remove();
  }

  // Extract <title>
  const titleEl = doc.querySelector('title');
  const title = titleEl?.textContent?.trim() || 'Untitled Document';

  // Extract <html lang> and <html dir> / <body dir>
  const htmlEl = doc.documentElement;
  const rawLang = htmlEl?.getAttribute('lang') || undefined;
  const rawDir = htmlEl?.getAttribute('dir') || doc.body?.getAttribute('dir') || undefined;

  // First-class priority for Arabic & RTL support
  const hasArabicChars = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(rawHtml);
  const isRtl = rawDir?.toLowerCase() === 'rtl' || rawLang?.toLowerCase().startsWith('ar') || hasArabicChars;

  const dir = rawDir ? rawDir.toLowerCase() : (isRtl ? 'rtl' : undefined);
  const lang = rawLang || (isRtl ? 'ar' : undefined);

  // Extract safe <meta> tags
  const meta: DocumentMeta[] = [];
  const metaElements = doc.querySelectorAll('head > meta, body > meta');
  for (const metaEl of metaElements) {
    const name = metaEl.getAttribute('name') || undefined;
    const property = metaEl.getAttribute('property') || undefined;
    const content = metaEl.getAttribute('content');
    if (content !== null && (name || property)) {
      meta.push({ name, property, content });
    }
  }

  // Extract external stylesheets: <link rel="stylesheet"> or <link rel="preload" as="style">
  const externalStylesheets: string[] = [];
  const linkElements = doc.querySelectorAll('link[rel~="stylesheet"], link[as="style"]');
  for (const linkEl of linkElements) {
    const href = linkEl.getAttribute('href');
    if (href) {
      externalStylesheets.push(href);
      warnings.push(createExternalStylesheetWarning(href));
    }
    // Remove link from document tree
    linkEl.remove();
  }

  // Extract inline CSS from <style> tags in both head and body
  const styleElements = doc.querySelectorAll('style');
  const cssBlocks: string[] = [];
  for (const styleEl of styleElements) {
    const text = styleEl.textContent || '';
    if (text.trim()) {
      cssBlocks.push(text.trim());
    }
    styleEl.remove();
  }
  const css = cssBlocks.join('\n\n');

  // Detect remote media assets (http/https) to warn about offline rendering
  const remoteMediaElements = doc.querySelectorAll('img[src^="http"], audio[src^="http"], video[src^="http"], source[src^="http"]');
  if (remoteMediaElements.length > 0) {
    warnings.push(createRemoteAssetWarning(remoteMediaElements.length));
  }

  // Detect pre-sanitization scripts, embeds, and event handlers
  const scripts = doc.querySelectorAll('script');
  if (scripts.length > 0) {
    warnings.push(createScriptWarning(scripts.length));
    for (const s of scripts) {
      s.remove();
    }
  }

  const embeds = doc.querySelectorAll('iframe, object, embed, applet, frame, frameset');
  if (embeds.length > 0) {
    warnings.push(createEmbedWarning(embeds.length));
    for (const e of embeds) {
      e.remove();
    }
  }

  let eventHandlerCount = 0;
  const allElements = doc.querySelectorAll('*');
  for (const el of allElements) {
    for (const attr of el.getAttributeNames()) {
      if (attr.toLowerCase().startsWith('on')) {
        eventHandlerCount++;
        el.removeAttribute(attr);
      }
    }
  }
  if (eventHandlerCount > 0) {
    warnings.push(createEventHandlerWarning(eventHandlerCount));
  }

  // Extract body HTML
  const bodyHtml = doc.body ? doc.body.innerHTML : '';

  return {
    title,
    lang,
    dir,
    meta,
    bodyHtml,
    css,
    externalStylesheets,
    warnings,
  };
}
