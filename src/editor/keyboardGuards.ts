/**
 * Keyboard focus guard utility.
 * Prevents global editor shortcuts (such as Delete, Backspace, Ctrl+Z, Ctrl+D)
 * from triggering while the user is actively typing in text inputs, textareas,
 * contenteditable elements, or rich text editing fields (including inside canvas iframes).
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

  // 1. Direct check on target or activeElement
  if (isElementEditable(element)) {
    return true;
  }

  // 2. If target or activeElement is an IFRAME (e.g. GrapesJS canvas frame),
  // inspect the active element inside that iframe's contentDocument
  if (element.tagName === 'IFRAME') {
    try {
      const iframeEl = element as HTMLIFrameElement;
      const idoc = iframeEl.contentDocument || iframeEl.contentWindow?.document;
      if (idoc) {
        if (idoc.activeElement && idoc.activeElement !== idoc.body) {
          if (isElementEditable(idoc.activeElement)) {
            return true;
          }
        }
        if (idoc.querySelector('[contenteditable="true"], [contenteditable=""]')) {
          return true;
        }
      }
    } catch {
      // Cross-origin access guard
    }
  }

  // 3. Check across all iframe canvases on the page for active inline text editing (RTE)
  if (typeof document !== 'undefined') {
    if (document.querySelector('.gjs-rte-toolbar') !== null) {
      return true;
    }

    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (const iframe of iframes) {
      try {
        const idoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!idoc) continue;

        if (idoc.activeElement && idoc.activeElement !== idoc.body) {
          if (isElementEditable(idoc.activeElement)) {
            return true;
          }
        }

        if (idoc.querySelector('.gjs-rte-toolbar') !== null) {
          return true;
        }

        if (idoc.querySelector('[contenteditable="true"], [contenteditable=""]')) {
          return true;
        }
      } catch {
        // Cross-origin access guard
      }
    }
  }

  return false;
}

export function isElementEditable(element: Element): boolean {
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
    if (element.closest('[contenteditable="true"], [contenteditable=""], [contenteditable]')) {
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
