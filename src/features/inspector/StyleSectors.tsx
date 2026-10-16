import { useState, useEffect, type ReactElement, type ChangeEvent } from 'react';
import { STYLE_SECTORS, type SectorPropertyConfig } from '../../editor/styleSectors';
import { type IEditorAdapter } from '../../editor/types';
import { getSelectedStyles, setSelectedStyles, removeSelectedStyles } from './inspectorBridge';

export function toValidHexColor(raw?: string): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();

  // 6-digit hex (#rrggbb)
  if (/^#[0-9a-f]{6}$/.test(s)) {
    return s;
  }

  // 3-digit hex (#rgb -> #rrggbb)
  if (/^#[0-9a-f]{3}$/.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }

  // 8-digit hex (#rrggbbaa -> #rrggbb)
  if (/^#[0-9a-f]{8}$/.test(s)) {
    return s.slice(0, 7);
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = s.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (
    rgbMatch &&
    rgbMatch[1] !== undefined &&
    rgbMatch[2] !== undefined &&
    rgbMatch[3] !== undefined
  ) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)))
      .toString(16)
      .padStart(2, '0');
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)))
      .toString(16)
      .padStart(2, '0');
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)))
      .toString(16)
      .padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  const namedColors: Record<string, string> = {
    white: '#ffffff',
    black: '#000000',
    red: '#ff0000',
    blue: '#0000ff',
    green: '#008000',
    yellow: '#ffff00',
    gray: '#808080',
    grey: '#808080',
    transparent: '#000000',
  };
  if (namedColors[s]) {
    return namedColors[s];
  }

  return null;
}

export function resolveSelectValue(
  prop: SectorPropertyConfig,
  currentVal: string
): string {
  if (!currentVal || !prop.options || prop.options.length === 0) {
    return '';
  }

  const raw = currentVal.trim();

  // 1. Direct exact match
  if (prop.options.some((opt) => opt.value === raw)) {
    return raw;
  }

  // 2. Case-insensitive exact match
  const lower = raw.toLowerCase();
  const directMatch = prop.options.find(
    (opt) => opt.value.toLowerCase() === lower
  );
  if (directMatch) {
    return directMatch.value;
  }

  // 3. Special smart matching for font-family
  if (prop.cssProp === 'font-family') {
    const firstPart = raw.split(',')[0] ?? '';
    const primaryFont = firstPart
      .replace(/['"]/g, '')
      .trim()
      .toLowerCase();

    if (primaryFont) {
      const fontMatch = prop.options.find((opt) => {
        const optFirstPart = opt.value.split(',')[0] ?? '';
        const optPrimary = optFirstPart
          .replace(/['"]/g, '')
          .trim()
          .toLowerCase();
        if (optPrimary === primaryFont) return true;
        if (opt.value.toLowerCase().includes(primaryFont)) return true;
        if (opt.label.toLowerCase().includes(primaryFont)) return true;
        return false;
      });

      if (fontMatch) {
        return fontMatch.value;
      }
    }
  }

  // 4. Fallback for other selects: check trimmed value match without quotes
  const unquoted = raw.replace(/['"]/g, '').toLowerCase();
  const unquotedMatch = prop.options.find(
    (opt) => opt.value.replace(/['"]/g, '').toLowerCase() === unquoted
  );
  if (unquotedMatch) {
    return unquotedMatch.value;
  }

  return raw;
}

interface StyleSectorsProps {
  adapter: IEditorAdapter;
  selectedComponentId?: string;
}

export function StyleSectors({
  adapter,
  selectedComponentId,
}: StyleSectorsProps): ReactElement {
  // Track open/collapsed state of each sector
  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const sector of STYLE_SECTORS) {
      initial[sector.id] = sector.defaultOpen;
    }
    return initial;
  });

  // Reactive styles state synchronized with adapter
  const [styles, setStyles] = useState<Record<string, string>>(() =>
    getSelectedStyles(adapter)
  );

  useEffect(() => {
    const syncStyles = (): void => {
      setStyles(getSelectedStyles(adapter));
    };

    syncStyles();

    const unsubUpdate = adapter.on?.('update', syncStyles);
    const unsubSelection = adapter.on?.('selection:change', syncStyles);
    const unsubHistory = adapter.on?.('history:change', syncStyles);

    return () => {
      unsubUpdate?.();
      unsubSelection?.();
      unsubHistory?.();
    };
  }, [adapter, selectedComponentId]);

  const toggleSector = (id: string): void => {
    setOpenSectors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStyleChange = (cssProp: string, value: string): void => {
    setStyles((prev) => ({ ...prev, [cssProp]: value }));
    setSelectedStyles(adapter, { [cssProp]: value });
  };

  const handleResetProperty = (cssProp: string): void => {
    setStyles((prev) => {
      const next = { ...prev };
      delete next[cssProp];
      return next;
    });
    removeSelectedStyles(adapter, [cssProp]);
  };

  const renderPropertyControl = (prop: SectorPropertyConfig): ReactElement => {
    const val = styles[prop.cssProp] || '';

    // Numeric/unit parsing: e.g. "16px" -> num="16", unit="px"
    const parseUnitValue = (raw: string, defaultUnit = 'px') => {
      const match = raw.match(/^([+-]?(?:\d*\.)?\d+)([a-z%]*)$/i);
      if (match && match[1]) {
        return { num: match[1], unit: match[2] || defaultUnit };
      }
      return { num: raw, unit: defaultUnit };
    };

    if (prop.type === 'select') {
      const selectVal = resolveSelectValue(prop, val);
      return (
        <select
          id={`style-${prop.id}`}
          className="inspector-select"
          value={selectVal}
          onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            handleStyleChange(prop.cssProp, e.target.value)
          }
          aria-label={prop.label}
          data-testid={`style-select-${prop.id}`}
        >
          <option value="">Default</option>
          {prop.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (prop.type === 'color') {
      const hexVal =
        toValidHexColor(val) ||
        toValidHexColor(prop.placeholder) ||
        '#000000';

      return (
        <div className="inspector-color-wrapper">
          <input
            type="color"
            id={`style-${prop.id}-picker`}
            className="inspector-color-picker"
            value={hexVal}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleStyleChange(prop.cssProp, e.target.value)
            }
            aria-label={`${prop.label} picker`}
            data-testid={`style-color-picker-${prop.id}`}
          />
          <input
            type="text"
            id={`style-${prop.id}`}
            className="inspector-input"
            value={val}
            placeholder={prop.placeholder || '#ffffff'}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleStyleChange(prop.cssProp, e.target.value)
            }
            aria-label={prop.label}
            data-testid={`style-input-${prop.id}`}
          />
        </div>
      );
    }

    if (prop.type === 'slider') {
      const numVal = parseFloat(val) || (prop.max ?? 1);
      return (
        <div className="inspector-slider-wrapper">
          <input
            type="range"
            id={`style-${prop.id}`}
            className="inspector-slider"
            min={prop.min ?? 0}
            max={prop.max ?? 1}
            step={prop.step ?? 0.05}
            value={numVal}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleStyleChange(prop.cssProp, e.target.value)
            }
            aria-label={prop.label}
            data-testid={`style-slider-${prop.id}`}
          />
          <span className="inspector-slider-val">{val || '1'}</span>
        </div>
      );
    }

    // Default text/number with optional units
    if (prop.units && prop.units.length > 0) {
      const { num, unit } = parseUnitValue(val, prop.defaultUnit);
      return (
        <div className="inspector-control-input-wrapper">
          <input
            type="text"
            id={`style-${prop.id}`}
            className="inspector-input"
            value={num}
            placeholder={prop.placeholder || 'auto'}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const rawInput = e.target.value.trim();
              if (rawInput === '' || rawInput === 'auto' || rawInput === 'inherit' || rawInput === 'none') {
                handleStyleChange(prop.cssProp, rawInput);
              } else if (!isNaN(Number(rawInput))) {
                handleStyleChange(prop.cssProp, `${rawInput}${unit}`);
              } else {
                handleStyleChange(prop.cssProp, rawInput);
              }
            }}
            aria-label={prop.label}
            data-testid={`style-input-${prop.id}`}
          />
          <select
            className="inspector-unit-select"
            value={unit}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              if (num && !isNaN(Number(num))) {
                handleStyleChange(prop.cssProp, `${num}${e.target.value}`);
              }
            }}
            aria-label={`${prop.label} unit`}
          >
            {prop.units.map((u) => (
              <option key={u || 'unitless'} value={u}>
                {u || 'none'}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <input
        type="text"
        id={`style-${prop.id}`}
        className="inspector-input"
        value={val}
        placeholder={prop.placeholder || ''}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleStyleChange(prop.cssProp, e.target.value)
        }
        aria-label={prop.label}
        data-testid={`style-input-${prop.id}`}
      />
    );
  };

  return (
    <div className="inspector-content-scroll" data-testid="inspector-style-sectors">
      {STYLE_SECTORS.map((sector) => {
        const isOpen = Boolean(openSectors[sector.id]);
        return (
          <section key={sector.id} className="inspector-sector">
            <button
              type="button"
              className="inspector-sector-header"
              onClick={() => toggleSector(sector.id)}
              aria-expanded={isOpen}
              aria-controls={`sector-body-${sector.id}`}
              data-testid={`sector-header-${sector.id}`}
            >
              <span>{sector.name}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`inspector-sector-chevron ${isOpen ? 'open' : ''}`}
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {isOpen && (
              <div
                id={`sector-body-${sector.id}`}
                className="inspector-sector-body"
                data-testid={`sector-body-${sector.id}`}
              >
                {sector.properties.map((prop) => {
                  const currentPropValue = styles[prop.cssProp];
                  const hasCustomValue = Boolean(
                    currentPropValue && currentPropValue.trim() !== ''
                  );
                  return (
                    <div key={prop.id} className="inspector-control-row">
                      <label htmlFor={`style-${prop.id}`} className="inspector-control-label">
                        <span
                          className={`inspector-modified-dot ${hasCustomValue ? 'active' : ''}`}
                          aria-hidden="true"
                          title={hasCustomValue ? 'Customized property' : undefined}
                        />
                        {prop.label}
                      </label>
                      <div className="inspector-control-input-wrapper">
                        {renderPropertyControl(prop)}
                        <button
                          type="button"
                          className={`inspector-reset-btn ${hasCustomValue ? 'active' : 'disabled'}`}
                          onClick={() => handleResetProperty(prop.cssProp)}
                          disabled={!hasCustomValue}
                          aria-label={`Reset ${prop.label} to default`}
                          title={hasCustomValue ? `Reset ${prop.label} to default` : 'Default value'}
                          data-testid={`btn-reset-${prop.id}`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
