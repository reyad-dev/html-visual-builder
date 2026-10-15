import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InspectorPanel } from './InspectorPanel';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';
import { type IEditorAdapter } from '../../editor/types';

// Mock the EditorContext hook
vi.mock('../../editor/EditorContext', () => ({
  useEditor: vi.fn(),
}));

interface MockInspectorBridgeTarget {
  getSelectedStyle?: () => Record<string, string>;
  setSelectedStyle?: (styles: Record<string, string>) => void;
  removeSelectedStyle?: (props: string[]) => void;
  getSelectedAttributes?: () => Record<string, string>;
  setSelectedAttribute?: (name: string, val: string) => boolean;
  removeSelectedAttribute?: (name: string) => boolean;
  addClassToSelected?: (cls: string) => boolean;
  removeClassFromSelected?: (cls: string) => boolean;
  getSelectedBreadcrumbs?: () => string[];
}

// Mock the inspectorBridge to forward to mockAdapter
vi.mock('./inspectorBridge', () => ({
  getSelectedStyles: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget) => adapter.getSelectedStyle?.() || {}),
  setSelectedStyles: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget, styles: Record<string, string>) => adapter.setSelectedStyle?.(styles)),
  removeSelectedStyles: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget, props: string[]) => adapter.removeSelectedStyle?.(props)),
  getSelectedAttributes: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget) => adapter.getSelectedAttributes?.() || {}),
  setSelectedAttribute: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget, name: string, val: string) => adapter.setSelectedAttribute?.(name, val)),
  removeSelectedAttribute: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget, name: string) => adapter.removeSelectedAttribute?.(name)),
  addClassToSelected: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget, cls: string) => adapter.addClassToSelected?.(cls)),
  removeClassFromSelected: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget, cls: string) => adapter.removeClassFromSelected?.(cls)),
  getSelectedBreadcrumbs: vi.fn().mockImplementation((adapter: MockInspectorBridgeTarget) => adapter.getSelectedBreadcrumbs?.() || []),
}));

describe('InspectorPanel Component (Epic 2: T-0201 to T-0210)', () => {
  let mockAdapter: IEditorAdapter & {
    getSelectedStyle: ReturnType<typeof vi.fn>;
    setSelectedStyle: ReturnType<typeof vi.fn>;
    removeSelectedStyle: ReturnType<typeof vi.fn>;
    getSelectedAttributes: ReturnType<typeof vi.fn>;
    setSelectedAttribute: ReturnType<typeof vi.fn>;
    removeSelectedAttribute: ReturnType<typeof vi.fn>;
    addClassToSelected: ReturnType<typeof vi.fn>;
    removeClassFromSelected: ReturnType<typeof vi.fn>;
    getSelectedBreadcrumbs: ReturnType<typeof vi.fn>;
  };
  let currentStyles: Record<string, string>;
  let currentAttrs: Record<string, string>;

  beforeEach(() => {
    currentStyles = {
      color: '#ffffff',
      'font-size': '16px',
      margin: '0px',
      'background-color': '#111827',
      width: '100%',
      'border-radius': '4px',
      'box-shadow': 'none',
    };
    currentAttrs = {
      id: 'test-elem',
      title: 'Test Element',
      href: 'https://example.com',
      src: 'https://example.com/logo.png',
      alt: 'Logo',
    };

    mockAdapter = {
      isInitialized: true,
      init: vi.fn(),
      destroy: vi.fn(),
      setDevice: vi.fn(),
      getDevice: vi.fn().mockReturnValue('desktop'),
      getHtml: vi.fn().mockReturnValue(''),
      getCss: vi.fn().mockReturnValue(''),
      getProjectData: vi.fn(),
      loadProjectData: vi.fn(),
      loadSanitizedDocument: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn().mockReturnValue(false),
      canRedo: vi.fn().mockReturnValue(false),
      duplicateSelected: vi.fn().mockReturnValue(true),
      deleteSelected: vi.fn().mockReturnValue(true),
      getSelectedComponent: vi.fn(),
      select: vi.fn(),
      clearSelection: vi.fn(),
      on: vi.fn().mockReturnValue(() => {}),
      getExportSnapshot: vi.fn(),

      getSelectedStyle: vi.fn().mockImplementation(() => currentStyles),
      setSelectedStyle: vi.fn().mockImplementation((styles) => {
        Object.assign(currentStyles, styles);
      }),
      removeSelectedStyle: vi.fn().mockImplementation((props) => {
        props.forEach((p: string) => delete currentStyles[p]);
      }),
      getSelectedAttributes: vi.fn().mockImplementation(() => currentAttrs),
      setSelectedAttribute: vi.fn().mockImplementation((name, val) => {
        if (name.startsWith('on') || val.startsWith('javascript:')) return false;
        currentAttrs[name] = val;
        return true;
      }),
      removeSelectedAttribute: vi.fn().mockImplementation((name) => {
        delete currentAttrs[name];
        return true;
      }),
      addClassToSelected: vi.fn().mockReturnValue(true),
      removeClassFromSelected: vi.fn().mockReturnValue(true),
      getSelectedBreadcrumbs: vi
        .fn()
        .mockReturnValue(['body', 'section.hero', 'div.container', 'a.btn']),
    };

    vi.mocked(useEditor).mockReturnValue({
      adapter: mockAdapter,
      setAdapter: vi.fn(),
    });

    useUiStore.setState({
      activeRightPanel: 'styles',
      selectedComponent: null,
    });
  });

  it('renders friendly empty state when no component is selected', () => {
    render(<InspectorPanel />);
    expect(screen.getByTestId('inspector-panel-empty')).toBeInTheDocument();
    expect(
      screen.getByText(/select an element on the canvas to inspect/i)
    ).toBeInTheDocument();
  });

  it('renders header, breadcrumbs, and 7 style sectors when component is selected (T-0201)', () => {
    useUiStore.setState({
      selectedComponent: {
        id: 'btn1',
        tagName: 'a',
        name: 'Button Link',
        classes: ['btn', 'btn-primary'],
        isRemovable: true,
        isCopyable: true,
      },
    });

    render(<InspectorPanel />);

    // Header & Badge
    expect(screen.getByTestId('inspector-panel')).toBeInTheDocument();
    expect(screen.getByText('<a>')).toBeInTheDocument();

    // Breadcrumbs hierarchy (08_UI_UX_SPEC.md §10)
    expect(screen.getByText('body')).toBeInTheDocument();
    expect(screen.getByText('section.hero')).toBeInTheDocument();
    expect(screen.getByText('div.container')).toBeInTheDocument();
    expect(screen.getByText('a.btn')).toBeInTheDocument();

    // 7 Style sectors
    expect(screen.getByText('Layout')).toBeInTheDocument();
    expect(screen.getByText('Spacing')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Background')).toBeInTheDocument();
    expect(screen.getByText('Border')).toBeInTheDocument();
    expect(screen.getByText('Effects')).toBeInTheDocument();
  });

  it('collapses and expands sectors on header click', () => {
    useUiStore.setState({
      selectedComponent: {
        id: 'btn1',
        tagName: 'a',
        name: 'Button Link',
        classes: [],
        isRemovable: true,
        isCopyable: true,
      },
    });

    render(<InspectorPanel />);

    // Layout sector is open by default
    const layoutHeader = screen.getByTestId('sector-header-layout');
    expect(screen.getByTestId('sector-body-layout')).toBeInTheDocument();

    // Click to collapse
    fireEvent.click(layoutHeader);
    expect(screen.queryByTestId('sector-body-layout')).not.toBeInTheDocument();

    // Click to expand again
    fireEvent.click(layoutHeader);
    expect(screen.getByTestId('sector-body-layout')).toBeInTheDocument();
  });

  it('verifies AC-STYLE-001..007: edits color, typography, spacing, background, size, border, effects', () => {
    useUiStore.setState({
      selectedComponent: {
        id: 'btn1',
        tagName: 'a',
        name: 'Button Link',
        classes: [],
        isRemovable: true,
        isCopyable: true,
      },
    });

    render(<InspectorPanel />);

    // Open Typography sector
    fireEvent.click(screen.getByTestId('sector-header-typography'));
    // AC-STYLE-001 P0: text color
    const colorInput = screen.getByTestId('style-input-color');
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({ color: '#ff0000' });

    // AC-STYLE-002 P0: font size
    const fontSizeInput = screen.getByTestId('style-input-font-size');
    fireEvent.change(fontSizeInput, { target: { value: '24' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({ 'font-size': '24px' });

    // AC-STYLE-003 P0: margin / padding (Spacing is open by default)
    const marginTopInput = screen.getByTestId('style-input-margin-top');
    fireEvent.change(marginTopInput, { target: { value: '16' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({ 'margin-top': '16px' });

    // Open Background sector
    fireEvent.click(screen.getByTestId('sector-header-background'));
    // AC-STYLE-004 P0: background color
    const bgColorInput = screen.getByTestId('style-input-background-color');
    fireEvent.change(bgColorInput, { target: { value: '#2563eb' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({ 'background-color': '#2563eb' });

    // Open Size sector
    fireEvent.click(screen.getByTestId('sector-header-size'));
    // AC-STYLE-005 P0: width (existing unit was %)
    const widthInput = screen.getByTestId('style-input-width');
    fireEvent.change(widthInput, { target: { value: '300' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({ width: '300%' });

    // Open Border sector
    fireEvent.click(screen.getByTestId('sector-header-border'));
    // AC-STYLE-006 P0: border radius
    const borderRadiusInput = screen.getByTestId('style-input-border-radius');
    fireEvent.change(borderRadiusInput, { target: { value: '8' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({ 'border-radius': '8px' });

    // Open Effects sector
    fireEvent.click(screen.getByTestId('sector-header-effects'));
    // AC-STYLE-007 P1: box-shadow
    const shadowInput = screen.getByTestId('style-input-box-shadow');
    fireEvent.change(shadowInput, { target: { value: '0 4px 12px rgba(0,0,0,0.2)' } });
    expect(mockAdapter.setSelectedStyle).toHaveBeenCalledWith({
      'box-shadow': '0 4px 12px rgba(0,0,0,0.2)',
    });
  });

  it('switches to Attributes tab and manages attributes and security (T-0209, T-0210, AC-ATTR-001..004)', () => {
    useUiStore.setState({
      selectedComponent: {
        id: 'btn1',
        tagName: 'a',
        name: 'Button Link',
        classes: ['btn', 'btn-primary'],
        isRemovable: true,
        isCopyable: true,
      },
    });

    render(<InspectorPanel />);

    // Switch to Attributes tab
    const tabAttrs = screen.getByTestId('tab-attributes');
    fireEvent.click(tabAttrs);

    expect(screen.getByTestId('attributes-panel')).toBeInTheDocument();

    // Classes chips
    expect(screen.getByTestId('class-chip-btn')).toBeInTheDocument();
    expect(screen.getByTestId('class-chip-btn-primary')).toBeInTheDocument();

    // Add new class
    const newClassInput = screen.getByTestId('input-new-class');
    fireEvent.change(newClassInput, { target: { value: 'custom-link' } });
    fireEvent.click(screen.getByTestId('btn-add-class'));
    expect(mockAdapter.addClassToSelected).toHaveBeenCalledWith('custom-link');

    // AC-ATTR-001 P0: Link href can be edited
    const hrefInput = screen.getByTestId('attr-input-href');
    fireEvent.change(hrefInput, { target: { value: 'https://mysite.com/pricing' } });
    expect(mockAdapter.setSelectedAttribute).toHaveBeenCalledWith(
      'href',
      'https://mysite.com/pricing'
    );

    // AC-ATTR-003 P0: javascript: href is rejected with error
    fireEvent.change(hrefInput, { target: { value: 'javascript:alert(1)' } });
    expect(screen.getByTestId('error-href')).toBeInTheDocument();
    expect(screen.getByText(/JavaScript and VBScript URLs are forbidden/i)).toBeInTheDocument();

    // AC-ATTR-004 P0: Arbitrary on* handler is not exposed / rejected
    const attrNameInput = screen.getByTestId('input-new-attr-name');
    const attrValInput = screen.getByTestId('input-new-attr-value');
    fireEvent.change(attrNameInput, { target: { value: 'onclick' } });
    fireEvent.change(attrValInput, { target: { value: 'alert(1)' } });
    fireEvent.click(screen.getByTestId('btn-add-attr'));

    expect(screen.getByTestId('custom-attr-error')).toBeInTheDocument();
    expect(screen.getByText(/attributes starting with "on".*are prohibited/i)).toBeInTheDocument();

    // Adding safe custom data attribute works
    fireEvent.change(attrNameInput, { target: { value: 'data-tracking' } });
    fireEvent.change(attrValInput, { target: { value: 'hero-banner' } });
    fireEvent.click(screen.getByTestId('btn-add-attr'));
    expect(mockAdapter.setSelectedAttribute).toHaveBeenCalledWith('data-tracking', 'hero-banner');
  });

  it('renders image-specific attributes (src, alt) when tagName is img (AC-ATTR-002)', () => {
    useUiStore.setState({
      activeRightPanel: 'attributes',
      selectedComponent: {
        id: 'img1',
        tagName: 'img',
        name: 'Hero Image',
        classes: ['hero-img'],
        isRemovable: true,
        isCopyable: true,
      },
    });

    render(<InspectorPanel />);

    const srcInput = screen.getByTestId('attr-input-src');
    const altInput = screen.getByTestId('attr-input-alt');

    expect(srcInput).toBeInTheDocument();
    expect(altInput).toBeInTheDocument();

    // Edit src
    fireEvent.change(srcInput, { target: { value: 'https://example.com/photo.jpg' } });
    expect(mockAdapter.setSelectedAttribute).toHaveBeenCalledWith(
      'src',
      'https://example.com/photo.jpg'
    );

    // Edit alt
    fireEvent.change(altInput, { target: { value: 'Company Header Banner' } });
    expect(mockAdapter.setSelectedAttribute).toHaveBeenCalledWith('alt', 'Company Header Banner');
  });
});
