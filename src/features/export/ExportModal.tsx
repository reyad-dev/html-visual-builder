import { useState, useEffect, type ReactElement } from 'react';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';
import {
  exportStandaloneHtml,
  detectRemoteAssets,
  downloadHtmlFile,
  copyToClipboard,
  printDocument,
} from '../../domain/document/exportDocument';
import './export.css';

export function ExportModal(): ReactElement | null {
  const { isExportModalOpen, setExportModalOpen, currentProjectName, currentSourceMeta } =
    useUiStore();
  const { adapter } = useEditor();

  const [activeTab, setActiveTab] = useState<'full' | 'body' | 'css'>('full');
  const [docTitle, setDocTitle] = useState(currentProjectName || 'Exported Document');
  const [filename, setFilename] = useState('exported-page.html');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Sync title and default filename when modal opens
  useEffect(() => {
    if (isExportModalOpen) {
      const initialTitle =
        currentProjectName && currentProjectName !== 'Untitled Project'
          ? currentProjectName
          : currentSourceMeta.importedTitle || 'Exported Document';
      setDocTitle(initialTitle);

      const sanitizedName =
        initialTitle
          .toLowerCase()
          .replace(/[^a-z0-9_-]/gi, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '') || 'page';
      setFilename(`${sanitizedName}.html`);
      setCopyFeedback(null);
    }
  }, [isExportModalOpen, currentProjectName, currentSourceMeta.importedTitle]);

  // Handle escape key to close modal (AC-A11Y-004)
  useEffect(() => {
    if (!isExportModalOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExportModalOpen]);

  if (!isExportModalOpen) {
    return null;
  }

  const handleClose = (): void => {
    setExportModalOpen(false);
    setCopyFeedback(null);
  };

  // Retrieve current snapshot from editor adapter
  const snapshot = adapter?.getExportSnapshot() || {
    bodyHtml: adapter?.getHtml() || '',
    css: adapter?.getCss() || '',
  };

  const bodyHtml = snapshot.bodyHtml || '';
  const css = snapshot.css || '';

  // Generate full standalone HTML document (T-0501)
  const fullHtml = exportStandaloneHtml({
    title: docTitle,
    lang: currentSourceMeta.importedLang || 'en',
    bodyHtml,
    css,
    externalStylesheets: currentSourceMeta.externalStylesheets,
  });

  // Detect external assets (T-0507, 06_IMPORT_EXPORT section 12)
  const remoteImages = detectRemoteAssets(bodyHtml);
  const remoteStylesheets = (currentSourceMeta.externalStylesheets || []).filter((s) =>
    /^https?:\/\/|^\/\//i.test(s)
  );
  const allRemoteAssets = Array.from(new Set([...remoteImages, ...remoteStylesheets]));
  const hasRemoteAssets = allRemoteAssets.length > 0;

  // Determine active preview content
  const previewContent =
    activeTab === 'full' ? fullHtml : activeTab === 'body' ? bodyHtml : css;

  const showCopyToast = (message: string): void => {
    setCopyFeedback(message);
    setTimeout(() => {
      setCopyFeedback(null);
    }, 2500);
  };

  const handleDownload = (): void => {
    downloadHtmlFile(fullHtml, filename);
  };

  const handleCopyFull = async (): Promise<void> => {
    const success = await copyToClipboard(fullHtml);
    if (success) {
      showCopyToast('Full standalone HTML copied to clipboard!');
    }
  };

  const handleCopyBody = async (): Promise<void> => {
    const success = await copyToClipboard(bodyHtml);
    if (success) {
      showCopyToast('Body HTML copied to clipboard!');
    }
  };

  const handleCopyCss = async (): Promise<void> => {
    const success = await copyToClipboard(css);
    if (success) {
      showCopyToast('CSS styles copied to clipboard!');
    }
  };

  const handlePrintPdf = (): void => {
    printDocument({
      title: docTitle,
      bodyHtml,
      css,
      externalStylesheets: currentSourceMeta.externalStylesheets,
    });
  };

  return (
    <div
      className="export-modal-backdrop"
      onClick={handleClose}
      role="presentation"
      data-testid="export-modal-backdrop"
    >
      <div
        className="export-modal"
        role="dialog"
        aria-labelledby="export-dialog-title"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        data-testid="export-modal-dialog"
      >
        {/* Modal Header */}
        <div className="export-modal-header">
          <h2 id="export-dialog-title" className="export-modal-title">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Project HTML & CSS
          </h2>
          <button
            type="button"
            className="export-modal-close-btn"
            aria-label="Close export dialog"
            onClick={handleClose}
            data-testid="btn-close-export"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="export-modal-body">
          {/* Export Settings */}
          <div className="export-config-row">
            <div className="export-config-group">
              <label htmlFor="export-title-input" className="export-config-label">
                HTML Page Title
              </label>
              <input
                id="export-title-input"
                type="text"
                className="export-config-input"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. My Portfolio"
                data-testid="input-export-title"
              />
            </div>
            <div className="export-config-group">
              <label htmlFor="export-filename-input" className="export-config-label">
                Download Filename
              </label>
              <input
                id="export-filename-input"
                type="text"
                className="export-config-input"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. index.html"
                data-testid="input-export-filename"
              />
            </div>
          </div>

          {/* Remote Asset Warning (T-0507, AC-EXPORT / 06_IMPORT_EXPORT section 12) */}
          {hasRemoteAssets && (
            <div
              className="export-warning-banner"
              data-testid="remote-asset-warning"
              role="alert"
            >
              <svg
                className="export-warning-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="export-warning-content">
                <strong>Notice: Document Contains External Remote Resources</strong>
                <span>
                  This export references external remote URLs (such as images or fonts). The exported
                  standalone HTML requires an active internet connection to load these assets and is
                  not completely offline.
                </span>
                <ul className="export-warning-urls" aria-label="Detected external resources">
                  {allRemoteAssets.map((url, i) => (
                    <li key={i}>{url}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Preview Tabs */}
          <div className="export-tabs" role="tablist" aria-label="Export code view tabs">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'full'}
              className={`export-tab-btn ${activeTab === 'full' ? 'active' : ''}`}
              onClick={() => setActiveTab('full')}
              data-testid="tab-export-full"
            >
              Standalone HTML Document
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'body'}
              className={`export-tab-btn ${activeTab === 'body' ? 'active' : ''}`}
              onClick={() => setActiveTab('body')}
              data-testid="tab-export-body"
            >
              Body HTML Only
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'css'}
              className={`export-tab-btn ${activeTab === 'css' ? 'active' : ''}`}
              onClick={() => setActiveTab('css')}
              data-testid="tab-export-css"
            >
              CSS Only
            </button>
          </div>

          {/* Code Preview Section */}
          <div className="export-preview-container">
            <div className="export-preview-header">
              <span>
                {activeTab === 'full'
                  ? 'Complete HTML5 file with embedded CSS'
                  : activeTab === 'body'
                    ? 'Canvas elements content'
                    : 'Generated component and layout rules'}
              </span>
              <span>{previewContent.length.toLocaleString()} characters</span>
            </div>
            <pre
              className="export-code-box"
              tabIndex={0}
              aria-label="Exported code preview"
              data-testid="export-code-preview"
            >
              <code>{previewContent || '/* Empty content */'}</code>
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="export-modal-footer">
          <div>
            {copyFeedback && (
              <span className="export-toast-feedback" data-testid="copy-feedback">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {copyFeedback}
              </span>
            )}
          </div>
          <div className="export-footer-actions">
            <button
              type="button"
              className="export-btn export-btn-secondary"
              onClick={handleCopyBody}
              data-testid="btn-copy-body-html"
            >
              Copy Body HTML
            </button>
            <button
              type="button"
              className="export-btn export-btn-secondary"
              onClick={handleCopyCss}
              data-testid="btn-copy-css"
            >
              Copy CSS
            </button>
            <button
              type="button"
              className="export-btn export-btn-secondary"
              onClick={handleCopyFull}
              data-testid="btn-copy-full-html"
            >
              Copy Full HTML
            </button>
            <button
              type="button"
              className="export-btn export-btn-secondary"
              onClick={handlePrintPdf}
              data-testid="btn-export-pdf"
              title="Print or Save as PDF"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Export PDF / Print
            </button>
            <button
              type="button"
              className="export-btn export-btn-primary"
              onClick={handleDownload}
              data-testid="btn-download-export"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download .html
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
