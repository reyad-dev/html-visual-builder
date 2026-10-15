import { useState, useEffect, type ChangeEvent, type ReactElement } from 'react';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';
import { importDocument } from '../../domain/document/importDocument';
import { loadSanitizedDocumentIntoAdapter } from '../../domain/document/loadDocument';
import type { SanitizedDocument } from '../../domain/document/types';
import './import.css';

export function ImportModal(): ReactElement | null {
  const { isImportModalOpen, setImportModalOpen, isDirty, setIsDirty } = useUiStore();
  const { adapter } = useEditor();

  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [pastedHtml, setPastedHtml] = useState('');
  const [uploadedHtml, setUploadedHtml] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stagedDoc, setStagedDoc] = useState<SanitizedDocument | null>(null);
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  const handleClose = (): void => {
    setImportModalOpen(false);
    setErrorMessage(null);
    setStagedDoc(null);
    setShowDirtyConfirm(false);
  };

  useEffect(() => {
    if (!isImportModalOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImportModalOpen]);

  if (!isImportModalOpen) {
    return null;
  }

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    setErrorMessage(null);
    setStagedDoc(null);
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.html') && !lowerName.endsWith('.htm')) {
      setErrorMessage('Unsupported file format. Please upload an HTML file (.html or .htm).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setUploadedHtml(content);
        setUploadedFileName(file.name);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  const executeImport = (doc: SanitizedDocument): void => {
    if (!adapter) {
      setErrorMessage('Visual editor is not initialized.');
      return;
    }

    try {
      loadSanitizedDocumentIntoAdapter(adapter, doc);
      setIsDirty(false);
      handleClose();
    } catch (err) {
      setErrorMessage(
        `Failed to load document into canvas: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const handleImportSubmit = (): void => {
    setErrorMessage(null);
    const rawHtml = activeTab === 'paste' ? pastedHtml : uploadedHtml;

    if (!rawHtml || !rawHtml.trim()) {
      setErrorMessage('Please provide HTML content to import.');
      return;
    }

    try {
      // Transactional parsing: failures throw and leave current project untouched (AC-IMPORT-008)
      const doc = importDocument(rawHtml);
      setStagedDoc(doc);

      // Check dirty confirmation guard (AC-IMPORT-009 / T-0314)
      if (isDirty) {
        setShowDirtyConfirm(true);
        return;
      }

      executeImport(doc);
    } catch (err) {
      setErrorMessage(
        `Import failed: ${err instanceof Error ? err.message : String(err)}. Your current project was left untouched.`
      );
    }
  };

  const handleConfirmReplace = (): void => {
    if (stagedDoc) {
      executeImport(stagedDoc);
    }
  };

  const handleCancelReplace = (): void => {
    setShowDirtyConfirm(false);
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
      data-testid="import-modal"
    >
      <div className="import-modal">
        {/* Header */}
        <div className="modal-header">
          <h2 id="import-modal-title" className="modal-title">
            Import HTML Document
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            aria-label="Close dialog"
            data-testid="btn-close-import"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="modal-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'paste'}
            className={`modal-tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
              setShowDirtyConfirm(false);
            }}
            data-testid="tab-paste"
          >
            Paste HTML
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'upload'}
            className={`modal-tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
              setShowDirtyConfirm(false);
            }}
            data-testid="tab-upload"
          >
            Upload File
          </button>
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {errorMessage && (
            <div className="import-banner error" role="alert" data-testid="import-error-banner">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {/* Dirty Project Overwrite Confirmation (AC-IMPORT-009 / T-0314) */}
          {showDirtyConfirm && (
            <div
              className="import-banner dirty-confirm"
              role="alert"
              data-testid="import-dirty-confirm"
            >
              <div>
                <strong>Unsaved Changes Warning:</strong> You have unsaved changes in your current
                project. Importing new HTML will replace your existing canvas.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="modal-btn danger"
                  onClick={handleConfirmReplace}
                  data-testid="btn-confirm-replace"
                >
                  Replace Canvas & Import
                </button>
                <button
                  type="button"
                  className="modal-btn secondary"
                  onClick={handleCancelReplace}
                  data-testid="btn-cancel-replace"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Staged Warnings Banner (AC-IMPORT-007, T-0313) */}
          {stagedDoc && stagedDoc.warnings.length > 0 && (
            <div className="import-banner warnings" data-testid="import-warnings-banner">
              <div className="warnings-header">
                <span>⚠️ Security & Compatibility Notes ({stagedDoc.warnings.length})</span>
              </div>
              <ul className="warnings-list">
                {stagedDoc.warnings.map((w, index) => (
                  <li key={`${w.code}-${index}`}>
                    <span className="warning-code-tag">{w.code}</span>
                    <span>{w.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab 1: Paste HTML Flow (T-0311) */}
          {activeTab === 'paste' && (
            <div>
              <label
                htmlFor="import-paste-input"
                style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: '#94a3b8' }}
              >
                Paste HTML source markup or document fragment:
              </label>
              <textarea
                id="import-paste-input"
                className="import-textarea"
                placeholder="<!DOCTYPE html><html><head><title>My Page</title></head><body><h1>Hello</h1></body></html>"
                value={pastedHtml}
                onChange={(e) => {
                  setPastedHtml(e.target.value);
                  setErrorMessage(null);
                  setStagedDoc(null);
                  setShowDirtyConfirm(false);
                }}
                data-testid="import-paste-textarea"
              />
            </div>
          )}

          {/* Tab 2: Upload File Flow (T-0312) */}
          {activeTab === 'upload' && (
            <div>
              <div className="file-dropzone">
                <label className="dropzone-label" htmlFor="file-upload-input">
                  <span className="dropzone-icon">📄</span>
                  <span>Click to select an HTML file (.html, .htm) up to 5 MB</span>
                </label>
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".html,.htm"
                  onChange={handleFileUpload}
                  data-testid="import-file-input"
                />
              </div>

              {uploadedFileName && (
                <div style={{ marginTop: '12px' }}>
                  <span className="file-selected-badge" data-testid="selected-file-badge">
                    ✓ {uploadedFileName}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn secondary"
            onClick={handleClose}
            data-testid="btn-cancel-import"
          >
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn primary"
            onClick={handleImportSubmit}
            disabled={activeTab === 'paste' ? !pastedHtml.trim() : !uploadedHtml.trim()}
            data-testid="btn-import-submit"
          >
            Import HTML
          </button>
        </div>
      </div>
    </div>
  );
}
