/**
 * Custom CSS Parser for GrapesJS
 *
 * Solves the critical issue where browser CSSOM (BrowserParserCss) drops shorthand
 * CSS properties containing CSS Variables (var(...)), such as:
 * - background: var(--ink)
 * - border: 1.5px solid var(--rule)
 * - font: 500 14px/1.4 var(--sans)
 *
 * It extracts property declarations directly from rule.cssText while preserving
 * all selectors, at-rules (@media, @keyframes), and CSS custom properties (:root).
 */

export interface ParsedCssNode {
  selectors?: string | undefined;
  style: Record<string, string>;
  atRule?: string | undefined;
  params?: string | undefined;
}

/**
 * Extracts key-value declarations from a CSS rule body or cssText string.
 * Correctly respects quotes and parentheses so functions like var(), calc(),
 * linear-gradient(), or url() containing semicolons or colons are not broken.
 */
export function parseDeclarationsFromCss(cssText: string): Record<string, string> {
  const style: Record<string, string> = {};
  if (!cssText || typeof cssText !== 'string') {
    return style;
  }

  // Extract body between { and } if present
  const start = cssText.indexOf('{');
  const end = cssText.lastIndexOf('}');
  const body = start >= 0 && end > start ? cssText.slice(start + 1, end) : cssText;

  let inString: string | null = null;
  let inParen = 0;
  let current = '';
  const declarations: string[] = [];

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inString) {
      current += ch;
      if (ch === inString && body[i - 1] !== '\\') {
        inString = null;
      }
    } else if (ch === '"' || ch === "'") {
      inString = ch;
      current += ch;
    } else if (ch === '(') {
      inParen++;
      current += ch;
    } else if (ch === ')') {
      if (inParen > 0) inParen--;
      current += ch;
    } else if (ch === ';' && inParen === 0) {
      if (current.trim()) declarations.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    declarations.push(current.trim());
  }

  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':');
    if (colonIdx > 0) {
      const prop = decl.slice(0, colonIdx).trim().toLowerCase();
      const val = decl.slice(colonIdx + 1).trim();
      if (prop && val) {
        style[prop] = val;
      }
    }
  }

  return style;
}

/**
 * Custom parser for GrapesJS Parser.parserCss
 */
export function createCustomCssParser(): (input: string) => ParsedCssNode[] {
  return function customCssParser(input: string): ParsedCssNode[] {
    if (!input || !input.trim() || typeof document === 'undefined') {
      return [];
    }

    const el = document.createElement('style');
    el.innerHTML = input;
    document.head.appendChild(el);
    const sheet = el.sheet;
    const result: ParsedCssNode[] = [];

    function processRule(rule: CSSRule, atRule?: string, params?: string): void {
      if (rule instanceof CSSStyleRule || ('selectorText' in rule && 'style' in rule)) {
        const styleRule = rule as CSSStyleRule;
        const selectors = styleRule.selectorText || '';
        if (selectors) {
          const style = parseDeclarationsFromCss(styleRule.cssText);
          result.push({
            selectors,
            style,
            atRule,
            params
          });
        }
      } else if (rule instanceof CSSMediaRule || ('media' in rule && 'cssRules' in rule)) {
        const mediaRule = rule as CSSMediaRule;
        const condition = mediaRule.conditionText || mediaRule.media?.mediaText || '';
        for (let j = 0; j < mediaRule.cssRules.length; j++) {
          const subRule = mediaRule.cssRules[j];
          if (subRule) {
            processRule(subRule, 'media', condition);
          }
        }
      } else if (
        rule instanceof CSSSupportsRule ||
        ('conditionText' in rule && 'cssRules' in rule)
      ) {
        const supportsRule = rule as CSSSupportsRule;
        const condition = supportsRule.conditionText || '';
        for (let j = 0; j < supportsRule.cssRules.length; j++) {
          const subRule = supportsRule.cssRules[j];
          if (subRule) {
            processRule(subRule, 'supports', condition);
          }
        }
      } else if (rule instanceof CSSKeyframesRule || ('name' in rule && 'cssRules' in rule)) {
        const keyframesRule = rule as CSSKeyframesRule;
        const name = keyframesRule.name || '';
        for (let j = 0; j < keyframesRule.cssRules.length; j++) {
          const kf = keyframesRule.cssRules[j] as CSSKeyframeRule;
          if (kf?.keyText) {
            result.push({
              selectors: kf.keyText,
              style: parseDeclarationsFromCss(kf.cssText),
              atRule: 'keyframes',
              params: name
            });
          }
        }
      } else if (rule.cssText) {
        // Fallback for single at-rules (@font-face, @page, etc.)
        const match = rule.cssText.match(/^@([a-zA-Z-]+)\s*(.*?)\s*\{/);
        if (match) {
          const atRuleName = match[1];
          const atRuleParams = match[2] || '';
          result.push({
            style: parseDeclarationsFromCss(rule.cssText),
            atRule: atRuleName,
            params: atRuleParams
          });
        }
      }
    }

    if (sheet) {
      try {
        const rules = sheet.cssRules || [];
        for (let i = 0; i < rules.length; i++) {
          const r = rules[i];
          if (r) {
            processRule(r);
          }
        }
      } catch {
        // safe fallback
      }
    }

    document.head.removeChild(el);
    return result;
  };
}
