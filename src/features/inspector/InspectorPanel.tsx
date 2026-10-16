import { type ReactElement } from 'react';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';
import { StyleSectors } from './StyleSectors';
import { AttributesPanel } from './AttributesPanel';
import { getSelectedBreadcrumbs } from './inspectorBridge';
import './inspector.css';

export function InspectorPanel(): ReactElement {
  const { selectedComponent, activeRightPanel, setActiveRightPanel } = useUiStore();
  const { adapter } = useEditor();

  if (!selectedComponent || !adapter) {
    return (
      <div className="inspector-root" data-testid="inspector-panel-empty">
        <div className="inspector-empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="inspector-empty-icon"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="M14 9l3 3-3 3" />
          </svg>
          <p className="inspector-empty-text">
            Select an element on the canvas to inspect and edit its styles, layout, and attributes.
          </p>
        </div>
      </div>
    );
  }

  const breadcrumbs = getSelectedBreadcrumbs(adapter);

  return (
    <aside
      className="inspector-root"
      aria-label="Styles and Attributes Inspector"
      data-testid="inspector-panel"
    >
      {/* Top Inspector Header with Selection Info & Breadcrumbs */}
      <div className="inspector-header-container">
        <div className="inspector-title-row">
          <span className="inspector-title">Inspector</span>
          <span className="inspector-tag-badge">&lt;{selectedComponent.tagName}&gt;</span>
        </div>

        {/* Informational Selection Breadcrumbs (08_UI_UX_SPEC.md §10) */}
        {breadcrumbs.length > 0 && (
          <nav className="inspector-breadcrumbs" aria-label="Element hierarchy breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <span key={`${crumb}-${idx}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span className={`breadcrumb-crumb ${idx === breadcrumbs.length - 1 ? 'active' : ''}`}>
                  {crumb}
                </span>
                {idx < breadcrumbs.length - 1 && <span className="breadcrumb-sep">&gt;</span>}
              </span>
            ))}
          </nav>
        )}

        {/* Tabs: Styles / Attributes */}
        <div className="inspector-tabs" role="tablist" aria-label="Inspector Panels">
          <button
            type="button"
            role="tab"
            aria-selected={activeRightPanel === 'styles'}
            className={`inspector-tab-btn ${activeRightPanel === 'styles' ? 'active' : ''}`}
            onClick={() => setActiveRightPanel('styles')}
            data-testid="tab-styles"
          >
            Styles
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeRightPanel === 'attributes'}
            className={`inspector-tab-btn ${activeRightPanel === 'attributes' ? 'active' : ''}`}
            onClick={() => setActiveRightPanel('attributes')}
            data-testid="tab-attributes"
          >
            Attributes
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeRightPanel === 'styles' ? (
        <StyleSectors adapter={adapter} selectedComponentId={selectedComponent.id} />
      ) : (
        <AttributesPanel adapter={adapter} selectedComponent={selectedComponent} />
      )}
    </aside>
  );
}
