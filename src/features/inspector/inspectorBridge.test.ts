import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorAdapter } from '../../editor/EditorAdapter';
import {
  getSelectedStyles,
  setSelectedStyles,
  removeSelectedStyles,
  getSelectedAttributes,
  setSelectedAttribute,
  removeSelectedAttribute,
  addClassToSelected,
  removeClassFromSelected,
  getSelectedBreadcrumbs,
} from './inspectorBridge';

describe('inspectorBridge (Epic 2: T-0201 to T-0210)', () => {
  let adapter: EditorAdapter;
  let canvasMount: HTMLDivElement;
  let blocksMount: HTMLDivElement;
  let layersMount: HTMLDivElement;

  beforeEach(async () => {
    canvasMount = document.createElement('div');
    canvasMount.id = 'gjs-canvas-root';
    blocksMount = document.createElement('div');
    blocksMount.id = 'blocks-panel-mount';
    layersMount = document.createElement('div');
    layersMount.id = 'layers-panel-mount';

    document.body.appendChild(canvasMount);
    document.body.appendChild(blocksMount);
    document.body.appendChild(layersMount);

    adapter = new EditorAdapter();
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });
  });

  afterEach(() => {
    adapter.destroy();
    canvasMount.remove();
    blocksMount.remove();
    layersMount.remove();
  });

  const getStarterComponents = () => {
    const rawEditor = (adapter as unknown as { editor: { getWrapper: () => { components: () => { at: (i: number) => { components: () => { at: (j: number) => unknown } } } } } }).editor;
    const section = rawEditor.getWrapper().components().at(0);
    const container = (section as { components: () => { at: (i: number) => unknown } }).components().at(0);
    const heading = (container as { components: () => { at: (i: number) => unknown } }).components().at(0);
    const button = (container as { components: () => { at: (i: number) => unknown } }).components().at(2);
    return { section, container, heading, button };
  };

  it('handles empty/null selection gracefully', () => {
    adapter.clearSelection();
    expect(getSelectedStyles(adapter)).toEqual({});
    expect(getSelectedAttributes(adapter)).toEqual({});
    expect(getSelectedBreadcrumbs(adapter)).toEqual([]);
    expect(setSelectedAttribute(adapter, 'title', 'test')).toBe(false);
    expect(addClassToSelected(adapter, 'test-class')).toBe(false);
  });

  it('manages styles on selected component (AC-STYLE-001..006)', () => {
    const { heading } = getStarterComponents();
    adapter.select(heading);

    // Set styles
    setSelectedStyles(adapter, {
      color: '#ff5500',
      'font-size': '28px',
      margin: '12px',
      'border-radius': '6px',
    });

    const styles = getSelectedStyles(adapter);
    expect(styles.color).toBe('#ff5500');
    expect(styles['font-size']).toBe('28px');
    expect(styles.margin).toBe('12px');
    expect(styles['border-radius']).toBe('6px');

    // Remove specific style
    removeSelectedStyles(adapter, ['margin']);
    expect(getSelectedStyles(adapter).margin).toBeUndefined();
  });

  it('manages attributes with strict security and URL validation (AC-ATTR-001..004, T-0209, T-0210)', () => {
    const { button } = getStarterComponents();
    adapter.select(button);

    // 1. Safe attribute addition
    expect(setSelectedAttribute(adapter, 'title', 'Learn more')).toBe(true);
    expect(getSelectedAttributes(adapter).title).toBe('Learn more');

    // 2. Safe href edit (AC-ATTR-001)
    expect(setSelectedAttribute(adapter, 'href', 'https://example.com/pricing')).toBe(true);
    expect(getSelectedAttributes(adapter).href).toBe('https://example.com/pricing');

    // 3. Strict rejection of javascript: URLs (AC-ATTR-003)
    expect(setSelectedAttribute(adapter, 'href', 'javascript:alert(1)')).toBe(false);
    expect(getSelectedAttributes(adapter).href).toBe('https://example.com/pricing');

    // 4. Strict rejection of event handlers like onclick (AC-ATTR-004)
    expect(setSelectedAttribute(adapter, 'onclick', 'alert(1)')).toBe(false);
    expect(getSelectedAttributes(adapter).onclick).toBeUndefined();

    // 5. Remove attribute
    expect(removeSelectedAttribute(adapter, 'title')).toBe(true);
    expect(getSelectedAttributes(adapter).title).toBeUndefined();
  });

  it('adds and removes classes on selected component', () => {
    const { heading } = getStarterComponents();
    adapter.select(heading);

    expect(addClassToSelected(adapter, 'my-heading-class')).toBe(true);
    expect(adapter.getSelectedComponent()?.classes).toContain('my-heading-class');

    expect(removeClassFromSelected(adapter, 'my-heading-class')).toBe(true);
    expect(adapter.getSelectedComponent()?.classes).not.toContain('my-heading-class');
  });

  it('generates breadcrumbs hierarchy for selected element', () => {
    const { heading } = getStarterComponents();
    adapter.select(heading);

    const breadcrumbs = getSelectedBreadcrumbs(adapter);
    expect(breadcrumbs.length).toBeGreaterThan(1);
    expect(breadcrumbs[0]).toBe('body');
    expect(breadcrumbs[breadcrumbs.length - 1]).toContain('h1');
  });
});
