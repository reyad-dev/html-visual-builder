import { useState, type ReactElement, type ChangeEvent } from 'react';
import { STYLE_SECTORS, type SectorPropertyConfig } from '../../editor/styleSectors';
import { type IEditorAdapter } from '../../editor/types';
import { getSelectedStyles, setSelectedStyles } from './inspectorBridge';

interface StyleSectorsProps {
  adapter: IEditorAdapter;
}

export function StyleSectors({ adapter }: StyleSectorsProps): ReactElement {
  // Track open/collapsed state of each sector
  const [openSectors, setOpenSectors] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const sector of STYLE_SECTORS) {
      initial[sector.id] = sector.defaultOpen;
    }
    return initial;
  });

  const toggleSector = (id: string): void => {
    setOpenSectors((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentStyles = getSelectedStyles(adapter);

  const handleStyleChange = (cssProp: string, value: string): void => {
    setSelectedStyles(adapter, { [cssProp]: value });
  };

  const renderPropertyControl = (prop: SectorPropertyConfig): ReactElement => {
    const val = currentStyles[prop.cssProp] || '';

    // Numeric/unit parsing: e.g. "16px" -> num="16", unit="px"
    const parseUnitValue = (raw: string, defaultUnit = 'px') => {
      const match = raw.match(/^([+-]?(?:\d*\.)?\d+)([a-z%]*)$/i);
      if (match && match[1]) {
        return { num: match[1], unit: match[2] || defaultUnit };
      }
      return { num: raw, unit: defaultUnit };
    };

    if (prop.type === 'select') {
      return (
        <select
          id={`style-${prop.id}`}
          className="inspector-select"
          value={val}
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
      const colorVal = val || '#000000';
      return (
        <div className="inspector-color-wrapper">
          <input
            type="color"
            id={`style-${prop.id}-picker`}
            className="inspector-color-picker"
            value={colorVal.startsWith('#') && colorVal.length === 7 ? colorVal : '#000000'}
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
                {sector.properties.map((prop) => (
                  <div key={prop.id} className="inspector-control-row">
                    <label htmlFor={`style-${prop.id}`} className="inspector-control-label">
                      {prop.label}
                    </label>
                    <div className="inspector-control-input-wrapper">
                      {renderPropertyControl(prop)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
