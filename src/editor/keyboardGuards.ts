/**
 * Keyboard focus guard utility.
 * Prevents global editor shortcuts (such as Delete, Backspace, Ctrl+Z, Ctrl+D)
 * from triggering while the user is actively typing in text inputs, textareas,
 * contenteditable elements, or rich text editing fields.
 */
export function isTypingInInput(target: EventTarget | null): boolean {
  let element: Element | null = null;

  if (target instanceof Element) {
    element = target;
  } else if (typeof document !== 'undefined' && document.activeElement instanceof Element) {
    element = document.activeElement;
  }

  if (!element) {
    return false;
  }

  const tagName = element.tagName.toUpperCase();

  // Standard form inputs and selects
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  // HTML5 contenteditable elements or elements inside a contenteditable parent
  if (element instanceof HTMLElement) {
    if (
      element.isContentEditable ||
      element.contentEditable === 'true' ||
      element.getAttribute('contenteditable') === 'true' ||
      element.getAttribute('contenteditable') === ''
    ) {
      return true;
    }
    if (element.closest('[contenteditable="true"], [contenteditable=""]')) {
      return true;
    }
  }

  // GrapesJS inline rich-text editor components or toolbars
  if (
    element.classList.contains('gjs-rte-action') ||
    element.closest('.gjs-rte-toolbar') !== null ||
    element.closest('.gjs-field') !== null
  ) {
    return true;
  }

  return false;
}
