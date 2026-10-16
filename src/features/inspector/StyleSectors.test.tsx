import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleSectors, toValidHexColor, resolveSelectValue } from './StyleSectors';
import { type IEditorAdapter } from '../../editor/types';
import { STYLE_SECTORS } from '../../editor/styleSectors';

describe('toValidHexColor helper', () => {
  it('handles 6-digit hex and uppercase', () => {
    expect(toValidHexColor('#ff0000')).toBe('#ff0000');
    expect(toValidHexColor('#FF5500')).toBe('#ff5500');
    expect(toValidHexColor('#111827')).toBe('#111827');
  });

  it('converts 3-digit hex to valid 6-digit hex', () => {
    expect(toValidHexColor('#fff')).toBe('#ffffff');
    expect(toValidHexColor('#F00')).toBe('#ff0000');
    expect(toValidHexColor('#123')).toBe('#112233');
  });

  it('converts 8-digit hex (#rrggbbaa) to 6-digit hex', () => {
    expect(toValidHexColor('#ff000080')).toBe('#ff0000');
  });

  it('converts rgb() and rgba() to 6-digit hex', () => {
    expect(toValidHexColor('rgb(255, 0, 0)')).toBe('#ff0000');
    expect(toValidHexColor('rgb(37, 99, 235)')).toBe('#2563eb');
    expect(toValidHexColor('rgba(15, 23, 42, 0.8)')).toBe('#0f172a');
  });

  it('handles named colors and fallbacks', () => {
    expect(toValidHexColor('white')).toBe('#ffffff');
    expect(toValidHexColor('black')).toBe('#000000');
    expect(toValidHexColor('red')).toBe('#ff0000');
    expect(toValidHexColor('')).toBeNull();
    expect(toValidHexColor(undefined)).toBeNull();
    expect(toValidHexColor('invalid-color')).toBeNull();
  });
});

describe('resolveSelectValue helper', () => {
  const fontProp = STYLE_SECTORS.find((s) => s.id === 'typography')!.properties.find(
    (p) => p.id === 'font-family'
  )!;

  it('resolves exact match', () => {
    expect(resolveSelectValue(fontProp, "'Cairo', sans-serif")).toBe("'Cairo', sans-serif");
  });

  it('resolves double quotes to single quotes option', () => {
    expect(resolveSelectValue(fontProp, '"Cairo", sans-serif')).toBe("'Cairo', sans-serif");
  });

  it('resolves unquoted font name', () => {
    expect(resolveSelectValue(fontProp, 'Cairo, sans-serif')).toBe("'Cairo', sans-serif");
    expect(resolveSelectValue(fontProp, 'Cairo')).toBe("'Cairo', sans-serif");
  });

  it('resolves font stack with Alexandria as primary font', () => {
    expect(
      resolveSelectValue(fontProp, "'Alexandria', 'Cairo', 'Tajawal', sans-serif")
    ).toBe("'Alexandria', sans-serif");
  });

  it('resolves system and standard fonts', () => {
    expect(resolveSelectValue(fontProp, 'system-ui')).toBe(
      'system-ui, -apple-system, sans-serif'
    );
    expect(resolveSelectValue(fontProp, 'Arial')).toBe('Arial, Helvetica, sans-serif');
    expect(resolveSelectValue(fontProp, 'inherit')).toBe('inherit');
  });

  it('returns empty string for empty input', () => {
    expect(resolveSelectValue(fontProp, '')).toBe('');
  });
});

describe('StyleSectors Component Reactivity & Controls', () => {
  let mockAdapter: IEditorAdapter;
  const eventListeners: Record<string, Set<() => void>> = {};

  beforeEach(() => {
    eventListeners['update'] = new Set();
    eventListeners['selection:change'] = new Set();
    eventListeners['history:change'] = new Set();

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
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: vi.fn().mockReturnValue(false),
      canRedo: vi.fn().mockReturnValue(false),
      duplicateSelected: vi.fn().mockReturnValue(true),
      deleteSelected: vi.fn().mockReturnValue(true),
      getSelectedComponent: vi.fn(),
      select: vi.fn(),
      clearSelection: vi.fn(),
      getExportSnapshot: vi.fn(),
      on: vi.fn().mockImplementation((event: string, cb: () => void) => {
        eventListeners[event]?.add(cb);
        return () => {
          eventListeners[event]?.delete(cb);
        };
      }),
    };
  });

  it('displays selected font family in side panel when changed and does not revert to Default', async () => {
    render(<StyleSectors adapter={mockAdapter} selectedComponentId="test-1" />);

    // Open typography sector
    const typoHeader = screen.getByTestId('sector-header-typography');
    fireEvent.click(typoHeader);

    const fontSelect = screen.getByTestId('style-select-font-family') as HTMLSelectElement;
    expect(fontSelect).toBeInTheDocument();

    // Select Cairo
    fireEvent.change(fontSelect, { target: { value: "'Cairo', sans-serif" } });

    // The select must visually display Cairo and NOT revert to Default!
    expect(fontSelect.value).toBe("'Cairo', sans-serif");
  });

  it('displays selected color in side panel when color picker changes and when text changes', async () => {
    render(<StyleSectors adapter={mockAdapter} selectedComponentId="test-1" />);

    // Open typography sector
    fireEvent.click(screen.getByTestId('sector-header-typography'));

    const colorPicker = screen.getByTestId('style-color-picker-color') as HTMLInputElement;
    const colorInput = screen.getByTestId('style-input-color') as HTMLInputElement;

    // Pick color from picker
    fireEvent.change(colorPicker, { target: { value: '#ff5500' } });

    // Both color picker and text input must visually show #ff5500!
    expect(colorPicker.value).toBe('#ff5500');
    expect(colorInput.value).toBe('#ff5500');

    // Type new color in text input
    fireEvent.change(colorInput, { target: { value: '#2563eb' } });
    expect(colorPicker.value).toBe('#2563eb');
    expect(colorInput.value).toBe('#2563eb');
  });

  it('converts rgb or 3-digit hex to valid hex in the color picker', () => {
    render(<StyleSectors adapter={mockAdapter} selectedComponentId="test-1" />);

    fireEvent.click(screen.getByTestId('sector-header-typography'));

    const colorPicker = screen.getByTestId('style-color-picker-color') as HTMLInputElement;
    const colorInput = screen.getByTestId('style-input-color') as HTMLInputElement;

    // Type 3-digit hex
    fireEvent.change(colorInput, { target: { value: '#fff' } });
    expect(colorPicker.value).toBe('#ffffff');

    // Type rgb
    fireEvent.change(colorInput, { target: { value: 'rgb(255, 0, 0)' } });
    expect(colorPicker.value).toBe('#ff0000');
  });
});
