import { type IEditorAdapter } from '../../editor/types';
import { validateUrl, isDangerousAttribute } from '../../domain/security/urlPolicy';

interface GrapesComponent {
  get?: (prop: string) => unknown;
  getId?: () => string;
  getName?: () => string;
  getClasses?: () => Array<string | { name?: string }>;
  getStyle?: () => Record<string, unknown>;
  setStyle?: (style: Record<string, unknown>) => void;
  addStyle?: (style: Record<string, unknown>) => void;
  getAttributes?: () => Record<string, unknown>;
  setAttributes?: (attrs: Record<string, unknown>) => void;
  addAttributes?: (attrs: Record<string, unknown>) => void;
  removeAttributes?: (names: string[]) => void;
  addClass?: (className: string) => void;
  removeClass?: (className: string) => void;
  parent?: () => GrapesComponent | null;
}

interface GrapesEditor {
  getSelected?: () => GrapesComponent | undefined;
  getWrapper?: () => GrapesComponent | undefined;
  trigger?: (event: string) => void;
}

function getRawEditor(adapter: IEditorAdapter): GrapesEditor | null {
  return (adapter as unknown as { editor: GrapesEditor | null }).editor || null;
}

function getSelectedComponent(adapter: IEditorAdapter): GrapesComponent | null {
  const editor = getRawEditor(adapter);
  if (!editor) return null;
  const selected = editor.getSelected?.();
  if (!selected) return null;
  const wrapper = editor.getWrapper?.();
  if (selected === wrapper) return null;
  return selected;
}

export function getSelectedStyles(adapter: IEditorAdapter): Record<string, string> {
  const selected = getSelectedComponent(adapter);
  if (!selected) return {};

  const style = selected.getStyle?.() || {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value !== undefined && value !== null) {
      result[key] = String(value);
    }
  }
  return result;
}

export function setSelectedStyles(
  adapter: IEditorAdapter,
  styles: Record<string, string>
): void {
  const selected = getSelectedComponent(adapter);
  if (!selected) return;

  if (typeof selected.addStyle === 'function') {
    selected.addStyle(styles);
  } else if (typeof selected.setStyle === 'function') {
    const current = selected.getStyle?.() || {};
    selected.setStyle({ ...current, ...styles });
  }

  const editor = getRawEditor(adapter);
  editor?.trigger?.('update');
  editor?.trigger?.('history:change');
}

export function removeSelectedStyles(
  adapter: IEditorAdapter,
  properties: string[]
): void {
  const selected = getSelectedComponent(adapter);
  if (!selected || typeof selected.setStyle !== 'function') return;

  const current = { ...(selected.getStyle?.() || {}) };
  for (const prop of properties) {
    delete current[prop];
  }
  selected.setStyle(current);

  const editor = getRawEditor(adapter);
  editor?.trigger?.('update');
  editor?.trigger?.('history:change');
}

export function getSelectedAttributes(adapter: IEditorAdapter): Record<string, string> {
  const selected = getSelectedComponent(adapter);
  if (!selected) return {};

  const raw = selected.getAttributes?.() || {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!isDangerousAttribute(key) && value !== undefined && value !== null) {
      result[key] = String(value);
    }
  }
  return result;
}

export function setSelectedAttribute(
  adapter: IEditorAdapter,
  name: string,
  value: string
): boolean {
  const selected = getSelectedComponent(adapter);
  if (!selected) return false;

  // Security check: strictly reject any dangerous or event-handler attribute (AC-ATTR-004)
  if (isDangerousAttribute(name)) {
    return false;
  }

  // URL validation for href and src (AC-ATTR-003, T-0210)
  const lowerName = name.toLowerCase();
  if (lowerName === 'href') {
    const result = validateUrl(value);
    if (!result.isValid) {
      return false;
    }
  } else if (lowerName === 'src') {
    const result = validateUrl(value, { allowDataImage: true });
    if (!result.isValid) {
      return false;
    }
  }

  if (typeof selected.addAttributes === 'function') {
    selected.addAttributes({ [name]: value });
  } else if (typeof selected.setAttributes === 'function') {
    const current = selected.getAttributes?.() || {};
    selected.setAttributes({ ...current, [name]: value });
  }

  const editor = getRawEditor(adapter);
  editor?.trigger?.('update');
  editor?.trigger?.('history:change');
  editor?.trigger?.('component:update:attributes');
  return true;
}

export function removeSelectedAttribute(
  adapter: IEditorAdapter,
  name: string
): boolean {
  const selected = getSelectedComponent(adapter);
  if (!selected) return false;

  try {
    if (typeof selected.removeAttributes === 'function') {
      selected.removeAttributes([name]);
    } else if (typeof selected.setAttributes === 'function') {
      const attrs = { ...(selected.getAttributes?.() || {}) };
      delete attrs[name];
      selected.setAttributes(attrs);
    }
  } catch {
    return false;
  }

  const editor = getRawEditor(adapter);
  editor?.trigger?.('update');
  editor?.trigger?.('history:change');
  editor?.trigger?.('component:update:attributes');
  return true;
}

export function addClassToSelected(
  adapter: IEditorAdapter,
  className: string
): boolean {
  const clean = className.trim();
  if (!clean) return false;
  const selected = getSelectedComponent(adapter);
  if (!selected || typeof selected.addClass !== 'function') return false;

  selected.addClass(clean);

  const editor = getRawEditor(adapter);
  editor?.trigger?.('update');
  editor?.trigger?.('history:change');
  editor?.trigger?.('component:update:classes');
  return true;
}

export function removeClassFromSelected(
  adapter: IEditorAdapter,
  className: string
): boolean {
  const clean = className.trim();
  if (!clean) return false;
  const selected = getSelectedComponent(adapter);
  if (!selected || typeof selected.removeClass !== 'function') return false;

  selected.removeClass(clean);

  const editor = getRawEditor(adapter);
  editor?.trigger?.('update');
  editor?.trigger?.('history:change');
  editor?.trigger?.('component:update:classes');
  return true;
}

export function getSelectedBreadcrumbs(adapter: IEditorAdapter): string[] {
  const editor = getRawEditor(adapter);
  if (!editor) return [];
  const selected = editor.getSelected?.();
  if (!selected) return [];
  const wrapper = editor.getWrapper?.();
  if (selected === wrapper) return ['body'];

  const breadcrumbs: string[] = [];
  let curr: GrapesComponent | null | undefined = selected;

  while (curr && curr !== wrapper) {
    const tag = String(curr.get?.('tagName') || 'div').toLowerCase();
    const id = curr.getId?.() || '';
    const classes = curr.getClasses?.() || [];

    let label = tag;
    if (id) {
      label += `#${id}`;
    } else if (classes.length > 0) {
      const first = classes[0];
      const className = typeof first === 'string' ? first : first?.name || '';
      if (className) {
        label += `.${className}`;
      }
    }

    breadcrumbs.unshift(label);
    curr = curr.parent?.();
  }

  breadcrumbs.unshift('body');
  return breadcrumbs;
}
