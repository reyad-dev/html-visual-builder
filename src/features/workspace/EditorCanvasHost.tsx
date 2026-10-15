import { type ReactElement } from 'react';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';

interface EditorCanvasHostProps {
  device: 'desktop' | 'tablet' | 'mobile';
}

export function EditorCanvasHost({ device }: EditorCanvasHostProps): ReactElement {
  const { selectedComponent } = useUiStore();
  const { adapter } = useEditor();

  const handleDuplicate = (): void => {
    adapter?.duplicateSelected();
  };

  const handleDelete = (): void => {
    adapter?.deleteSelected();
  };

  return (
    <main className="workspace-canvas-wrapper" data-testid="workspace-canvas-host">
      {/* Canvas top bar with selection breadcrumb & quick actions */}
      <div className="canvas-selection-bar" data-testid="canvas-selection-bar">
        {selectedComponent ? (
          <div className="selection-breadcrumb">
            <span className="selection-badge">Selected</span>
            <strong className="selection-tag">&lt;{selectedComponent.tagName}&gt;</strong>
            {selectedComponent.name !== selectedComponent.tagName && (
              <span className="selection-name">({selectedComponent.name})</span>
            )}
            {selectedComponent.classes.length > 0 && (
              <span className="selection-classes">
                .{selectedComponent.classes.join(' .')}
              </span>
            )}
            <div className="selection-quick-actions">
              <button
                type="button"
                className="canvas-mini-btn"
                onClick={handleDuplicate}
                disabled={!selectedComponent.isCopyable}
                title="Duplicate selected element (Ctrl+D)"
                aria-label="Duplicate selected element"
                data-testid="canvas-btn-duplicate"
              >
                Duplicate
              </button>
              <button
                type="button"
                className="canvas-mini-btn danger"
                onClick={handleDelete}
                disabled={!selectedComponent.isRemovable}
                title="Delete selected element (Del / Backspace)"
                aria-label="Delete selected element"
                data-testid="canvas-btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="selection-hint">
            <span>Canvas Viewport &bull; Click any element to select and edit</span>
          </div>
        )}
      </div>

      <div className={`canvas-device-frame ${device}`} data-testid="canvas-device-frame">
        <div
          id="gjs-canvas-root"
          className="editor-canvas-mount"
          data-testid="editor-canvas-mount"
        />
      </div>
    </main>
  );
}
