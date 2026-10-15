import type { Editor } from 'grapesjs';
import type { IEditorAdapter } from '../../editor/types';
import type { SanitizedDocument } from './types';
import { DEFAULT_CANVAS_CSS } from '../../editor/editorConfig';

/**
 * Loads a SanitizedDocument into the editor canvas:
 * 1. Clears current selection.
 * 2. Replaces components with sanitized body markup.
 * 3. Applies canvas reset styling and extracted CSS.
 * 4. Locks the root wrapper.
 * 5. Clears history stack to establish a clean baseline.
 * (T-0315 / 06_IMPORT_EXPORT Section 9)
 */
export function loadSanitizedDocumentIntoAdapter(
  adapter: IEditorAdapter,
  doc: SanitizedDocument
): void {
  if (typeof adapter.loadSanitizedDocument === 'function') {
    adapter.loadSanitizedDocument(doc);
    return;
  }

  const rawAdapter = adapter as unknown as {
    editor: Editor | null;
    emit?: (event: string) => void;
  };

  const ed = rawAdapter.editor;
  if (!ed) {
    return;
  }

  adapter.clearSelection();
  ed.setComponents(doc.bodyHtml || '');

  // Reset and load styles
  ed.addComponents(`<style>${DEFAULT_CANVAS_CSS}</style>`);
  if (doc.css && doc.css.trim()) {
    ed.addComponents(`<style>${doc.css}</style>`);
  }

  const wrapper = ed.getWrapper();
  if (wrapper) {
    wrapper.set({
      removable: false,
      copyable: false,
      draggable: false,
      badgable: false,
    });
  }

  if (ed.UndoManager) {
    ed.UndoManager.clear();
  }

  rawAdapter.emit?.('update');
  rawAdapter.emit?.('history:change');
  rawAdapter.emit?.('selection:change');
}
