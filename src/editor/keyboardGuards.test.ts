import { describe, it, expect } from 'vitest';
import { isTypingInInput } from './keyboardGuards';

describe('keyboardGuards - isTypingInInput', () => {
  it('returns true when target is an INPUT element', () => {
    const input = document.createElement('input');
    expect(isTypingInInput(input)).toBe(true);
  });

  it('returns true when target is a TEXTAREA element', () => {
    const textarea = document.createElement('textarea');
    expect(isTypingInInput(textarea)).toBe(true);
  });

  it('returns true when target is a SELECT element', () => {
    const select = document.createElement('select');
    expect(isTypingInInput(select)).toBe(true);
  });

  it('returns true when element is contenteditable', () => {
    const div = document.createElement('div');
    div.contentEditable = 'true';
    expect(isTypingInInput(div)).toBe(true);
  });

  it('returns true when an inner child is inside a contenteditable parent', () => {
    const parent = document.createElement('div');
    parent.setAttribute('contenteditable', 'true');
    const child = document.createElement('span');
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(isTypingInInput(child)).toBe(true);

    parent.remove();
  });

  it('returns true when element is part of GrapesJS rich text toolbar/action', () => {
    const rteBtn = document.createElement('button');
    rteBtn.className = 'gjs-rte-action';
    expect(isTypingInInput(rteBtn)).toBe(true);

    const toolbar = document.createElement('div');
    toolbar.className = 'gjs-rte-toolbar';
    const toolItem = document.createElement('span');
    toolbar.appendChild(toolItem);
    expect(isTypingInInput(toolItem)).toBe(true);
  });

  it('returns false for regular canvas buttons, divs, and document body', () => {
    const btn = document.createElement('button');
    expect(isTypingInInput(btn)).toBe(false);

    const div = document.createElement('div');
    expect(isTypingInInput(div)).toBe(false);

    expect(isTypingInInput(document.body)).toBe(false);
    expect(isTypingInInput(null)).toBe(false);
  });
});
