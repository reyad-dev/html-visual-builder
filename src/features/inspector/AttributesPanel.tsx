import { useState, useEffect, type ReactElement, type ChangeEvent, type FormEvent } from 'react';
import { type IEditorAdapter, type SelectedComponentInfo } from '../../editor/types';
import { validateUrl, isDangerousAttribute } from '../../domain/security/urlPolicy';
import {
  getSelectedAttributes,
  setSelectedAttribute,
  removeSelectedAttribute,
  addClassToSelected,
  removeClassFromSelected,
} from './inspectorBridge';

interface AttributesPanelProps {
  adapter: IEditorAdapter;
  selectedComponent: SelectedComponentInfo;
}

export function AttributesPanel({
  adapter,
  selectedComponent,
}: AttributesPanelProps): ReactElement {
  const [currentAttributes, setCurrentAttributes] = useState<Record<string, string>>(() =>
    getSelectedAttributes(adapter)
  );

  useEffect(() => {
    const syncAttrs = (): void => {
      setCurrentAttributes(getSelectedAttributes(adapter));
    };

    syncAttrs();

    const unsubUpdate = adapter.on?.('update', syncAttrs);
    const unsubSelection = adapter.on?.('selection:change', syncAttrs);
    const unsubHistory = adapter.on?.('history:change', syncAttrs);

    return () => {
      unsubUpdate?.();
      unsubSelection?.();
      unsubHistory?.();
    };
  }, [adapter, selectedComponent.id]);

  // Local state for URL validation errors
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});

  // Local state for adding custom attribute
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [customAttrError, setCustomAttrError] = useState<string | null>(null);

  // Local state for adding new class
  const [newClassName, setNewClassName] = useState('');

  const tagName = selectedComponent.tagName.toLowerCase();

  const handleAttrChange = (name: string, value: string): void => {
    // Clear existing error for this attribute
    setUrlErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    // Check dangerous attributes (AC-ATTR-004)
    if (isDangerousAttribute(name)) {
      setUrlErrors((prev) => ({
        ...prev,
        [name]: 'Event handlers and dangerous attributes are strictly prohibited.',
      }));
      return;
    }

    // URL validation for href/src (T-0210, AC-ATTR-003)
    if (name === 'href') {
      const result = validateUrl(value);
      if (!result.isValid) {
        setUrlErrors((prev) => ({
          ...prev,
          href: result.error || 'Invalid or forbidden URL scheme.',
        }));
        return;
      }
    } else if (name === 'src') {
      const result = validateUrl(value, { allowDataImage: true });
      if (!result.isValid) {
        setUrlErrors((prev) => ({
          ...prev,
          src: result.error || 'Invalid or forbidden image URL.',
        }));
        return;
      }
    }

    const ok = setSelectedAttribute(adapter, name, value);
    if (ok) {
      setCurrentAttributes((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCustomAttribute = (e: FormEvent): void => {
    e.preventDefault();
    setCustomAttrError(null);

    const name = newAttrName.trim();
    const val = newAttrValue.trim();

    if (!name) {
      setCustomAttrError('Attribute name cannot be empty.');
      return;
    }

    if (isDangerousAttribute(name)) {
      setCustomAttrError(
        'Event handlers (attributes starting with "on") and script injections are prohibited.'
      );
      return;
    }

    const ok = setSelectedAttribute(adapter, name, val);
    if (ok) {
      setCurrentAttributes((prev) => ({ ...prev, [name]: val }));
      setNewAttrName('');
      setNewAttrValue('');
    } else {
      setCustomAttrError('Failed to set attribute due to security policy or invalid value.');
    }
  };

  const handleRemoveAttribute = (name: string): void => {
    const ok = removeSelectedAttribute(adapter, name);
    if (ok) {
      setCurrentAttributes((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddClass = (e: FormEvent): void => {
    e.preventDefault();
    const cls = newClassName.trim();
    if (!cls) return;

    addClassToSelected(adapter, cls);
    setNewClassName('');
  };

  const handleRemoveClass = (cls: string): void => {
    removeClassFromSelected(adapter, cls);
  };

  // Filter out standard/managed keys to isolate custom attributes
  const standardKeys = new Set([
    'id',
    'class',
    'style',
    'title',
    'href',
    'target',
    'rel',
    'src',
    'alt',
    'type',
    'placeholder',
    'name',
    'value',
  ]);

  const customAttributes = Object.entries(currentAttributes).filter(
    ([key]) => !standardKeys.has(key.toLowerCase())
  );

  return (
    <div className="inspector-content-scroll attributes-section" data-testid="attributes-panel">
      {/* 1. Classes Section */}
      <div className="attributes-group">
        <h4 className="attributes-group-title">CSS Classes</h4>
        <div className="classes-chips-container" data-testid="classes-list">
          {selectedComponent.classes.length > 0 ? (
            selectedComponent.classes.map((cls) => (
              <span key={cls} className="class-chip" data-testid={`class-chip-${cls}`}>
                <span>.{cls}</span>
                <button
                  type="button"
                  className="class-chip-remove"
                  onClick={() => handleRemoveClass(cls)}
                  aria-label={`Remove class ${cls}`}
                >
                  &times;
                </button>
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              No custom classes assigned.
            </span>
          )}
        </div>
        <form onSubmit={handleAddClass} className="add-attr-form">
          <input
            type="text"
            className="inspector-input"
            placeholder="new-class-name"
            value={newClassName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewClassName(e.target.value)}
            aria-label="New class name"
            data-testid="input-new-class"
          />
          <button type="submit" className="add-attr-btn" data-testid="btn-add-class">
            Add
          </button>
        </form>
      </div>

      {/* 2. Common Attributes */}
      <div className="attributes-group">
        <h4 className="attributes-group-title">Standard Attributes</h4>
        <div className="attribute-field">
          <label htmlFor="attr-id">ID</label>
          <input
            type="text"
            id="attr-id"
            className="inspector-input"
            value={currentAttributes.id || selectedComponent.id || ''}
            placeholder="element-id"
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleAttrChange('id', e.target.value)}
            data-testid="attr-input-id"
          />
        </div>

        <div className="attribute-field">
          <label htmlFor="attr-title">Title (Tooltip)</label>
          <input
            type="text"
            id="attr-title"
            className="inspector-input"
            value={currentAttributes.title || ''}
            placeholder="Tooltip description"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleAttrChange('title', e.target.value)
            }
            data-testid="attr-input-title"
          />
        </div>
      </div>

      {/* 3. Tag-Specific Attributes */}
      {(tagName === 'a' || tagName === 'img' || tagName === 'button' || tagName === 'input') && (
        <div className="attributes-group" data-testid="tag-specific-attributes">
          <h4 className="attributes-group-title">&lt;{tagName}&gt; Attributes</h4>

          {/* Link Attributes */}
          {tagName === 'a' && (
            <>
              <div className="attribute-field">
                <label htmlFor="attr-href">Href (URL)</label>
                <input
                  type="text"
                  id="attr-href"
                  className="inspector-input"
                  value={currentAttributes.href || ''}
                  placeholder="https://... or /path or #anchor"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAttrChange('href', e.target.value)
                  }
                  data-testid="attr-input-href"
                />
                {urlErrors.href && (
                  <span className="attribute-error-text" role="alert" data-testid="error-href">
                    {urlErrors.href}
                  </span>
                )}
              </div>

              <div className="attribute-field">
                <label htmlFor="attr-target">Target</label>
                <select
                  id="attr-target"
                  className="inspector-select"
                  value={currentAttributes.target || '_self'}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    handleAttrChange('target', e.target.value)
                  }
                  data-testid="attr-select-target"
                >
                  <option value="_self">_self (Same window)</option>
                  <option value="_blank">_blank (New tab)</option>
                  <option value="_parent">_parent (Parent frame)</option>
                  <option value="_top">_top (Top frame)</option>
                </select>
              </div>

              <div className="attribute-field">
                <label htmlFor="attr-rel">Rel</label>
                <input
                  type="text"
                  id="attr-rel"
                  className="inspector-input"
                  value={currentAttributes.rel || ''}
                  placeholder="noopener noreferrer"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAttrChange('rel', e.target.value)
                  }
                  data-testid="attr-input-rel"
                />
              </div>
            </>
          )}

          {/* Image Attributes */}
          {tagName === 'img' && (
            <>
              <div className="attribute-field">
                <label htmlFor="attr-src">Image Source (Src)</label>
                <input
                  type="text"
                  id="attr-src"
                  className="inspector-input"
                  value={currentAttributes.src || ''}
                  placeholder="https://... or /image.png"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAttrChange('src', e.target.value)
                  }
                  data-testid="attr-input-src"
                />
                {urlErrors.src && (
                  <span className="attribute-error-text" role="alert" data-testid="error-src">
                    {urlErrors.src}
                  </span>
                )}
              </div>

              <div className="attribute-field">
                <label htmlFor="attr-alt">Alt Text</label>
                <input
                  type="text"
                  id="attr-alt"
                  className="inspector-input"
                  value={currentAttributes.alt || ''}
                  placeholder="Image description"
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAttrChange('alt', e.target.value)
                  }
                  data-testid="attr-input-alt"
                />
              </div>
            </>
          )}

          {/* Button Attributes */}
          {tagName === 'button' && (
            <div className="attribute-field">
              <label htmlFor="attr-button-type">Button Type</label>
              <select
                id="attr-button-type"
                className="inspector-select"
                value={currentAttributes.type || 'button'}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  handleAttrChange('type', e.target.value)
                }
                data-testid="attr-select-type"
              >
                <option value="button">button</option>
                <option value="submit">submit</option>
                <option value="reset">reset</option>
              </select>
            </div>
          )}

          {/* Input Attributes */}
          {tagName === 'input' && (
            <>
              <div className="attribute-field">
                <label htmlFor="attr-input-type">Input Type</label>
                <select
                  id="attr-input-type"
                  className="inspector-select"
                  value={currentAttributes.type || 'text'}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                    handleAttrChange('type', e.target.value)
                  }
                  data-testid="attr-select-input-type"
                >
                  <option value="text">text</option>
                  <option value="email">email</option>
                  <option value="password">password</option>
                  <option value="number">number</option>
                  <option value="checkbox">checkbox</option>
                  <option value="radio">radio</option>
                </select>
              </div>

              <div className="attribute-field">
                <label htmlFor="attr-placeholder">Placeholder</label>
                <input
                  type="text"
                  id="attr-placeholder"
                  className="inspector-input"
                  value={currentAttributes.placeholder || ''}
                  placeholder="Enter text..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleAttrChange('placeholder', e.target.value)
                  }
                  data-testid="attr-input-placeholder"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. Custom Attributes Section */}
      <div className="attributes-group">
        <h4 className="attributes-group-title">Custom Attributes</h4>
        {customAttributes.length > 0 ? (
          <div className="custom-attr-list" data-testid="custom-attributes-list">
            {customAttributes.map(([key, val]) => (
              <div key={key} className="custom-attr-row" data-testid={`custom-attr-${key}`}>
                <span className="custom-attr-key">{key}</span>
                <span className="custom-attr-val" title={val}>
                  {val}
                </span>
                <button
                  type="button"
                  className="custom-attr-del-btn"
                  onClick={() => handleRemoveAttribute(key)}
                  aria-label={`Remove attribute ${key}`}
                  title="Remove attribute"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            No custom attributes defined.
          </span>
        )}

        <form onSubmit={handleAddCustomAttribute} className="add-attr-form">
          <input
            type="text"
            className="inspector-input"
            placeholder="attr-name"
            value={newAttrName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAttrName(e.target.value)}
            aria-label="Attribute name"
            data-testid="input-new-attr-name"
          />
          <input
            type="text"
            className="inspector-input"
            placeholder="value"
            value={newAttrValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewAttrValue(e.target.value)}
            aria-label="Attribute value"
            data-testid="input-new-attr-value"
          />
          <button type="submit" className="add-attr-btn" data-testid="btn-add-attr">
            Add
          </button>
        </form>

        {customAttrError && (
          <span className="attribute-error-text" role="alert" data-testid="custom-attr-error">
            {customAttrError}
          </span>
        )}
      </div>
    </div>
  );
}
