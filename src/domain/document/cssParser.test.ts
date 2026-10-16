import { describe, it, expect } from 'vitest';
import { parseDeclarationsFromCss, createCustomCssParser } from './cssParser';

describe('cssParser', () => {
  it('parses declarations preserving shorthands with var()', () => {
    const css = `
      background: var(--ink);
      border-color: var(--ink);
      border: 1.5px solid var(--rule);
      font: 500 14px/1.4 var(--sans);
      color: #fff;
    `;
    const style = parseDeclarationsFromCss(css);
    expect(style['background']).toBe('var(--ink)');
    expect(style['border-color']).toBe('var(--ink)');
    expect(style['border']).toBe('1.5px solid var(--rule)');
    expect(style['font']).toBe('500 14px/1.4 var(--sans)');
    expect(style['color']).toBe('#fff');
  });

  it('handles strings with colons and semicolons and url with parentheses', () => {
    const css = `
      content: ";:hello;";
      background-image: linear-gradient(var(--grid) 1px, transparent 1px);
      cursor: pointer;
    `;
    const style = parseDeclarationsFromCss(css);
    expect(style['content']).toBe('";:hello;"');
    expect(style['background-image']).toBe('linear-gradient(var(--grid) 1px, transparent 1px)');
    expect(style['cursor']).toBe('pointer');
  });

  it('parses complex stylesheets via createCustomCssParser', () => {
    const parser = createCustomCssParser();
    const css = `
      :root {
        --paper: #F6F8FB;
        --ink: #102C32;
      }
      .seg button {
        background: #fff;
      }
      .seg button[aria-pressed="true"] {
        background: var(--ink);
        color: #fff;
      }
      @media (max-width: 768px) {
        .seg button {
          font-size: 12px;
        }
      }
    `;

    const nodes = parser(css);
    expect(nodes.length).toBeGreaterThan(0);

    const pressedNode = nodes.find((n) => n.selectors?.includes('aria-pressed'));
    expect(pressedNode).toBeDefined();
    expect(pressedNode?.style['background']).toBe('var(--ink)');
    expect(pressedNode?.style['color']).toMatch(/(?:#fff|rgb\(255,\s*255,\s*255\))/);

    const mediaNode = nodes.find((n) => n.atRule === 'media');
    expect(mediaNode).toBeDefined();
    expect(mediaNode?.params).toContain('768px');
  });
});
