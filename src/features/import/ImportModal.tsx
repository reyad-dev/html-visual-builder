import { useState, useEffect, type ChangeEvent, type ReactElement } from 'react';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';
import { importDocument } from '../../domain/document/importDocument';
import { loadSanitizedDocumentIntoAdapter } from '../../domain/document/loadDocument';
import type { SanitizedDocument } from '../../domain/document/types';
import { generateProjectId } from '../../data/projects/schema';
import {
  detectDocumentFonts,
  createLocalFontFaceCss,
  injectFontFaceCss,
  type DetectedFont,
} from '../../domain/document/fontDetector';
import './import.css';

export function ImportModal(): ReactElement | null {
  const { isImportModalOpen, setImportModalOpen, isDirty, setIsDirty, setCurrentProject, setCurrentDirection } =
    useUiStore();
  const { adapter } = useEditor();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedHtml, setPastedHtml] = useState('');
  const [uploadedHtml, setUploadedHtml] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stagedDoc, setStagedDoc] = useState<SanitizedDocument | null>(null);
  const [showDirtyConfirm, setShowDirtyConfirm] = useState(false);

  // Direction and Font Detection State (First-Class Arabic RTL & Custom Fonts)
  const [selectedDirection, setSelectedDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [detectedFonts, setDetectedFonts] = useState<DetectedFont[]>([]);
  const [localFontCss, setLocalFontCss] = useState<string>('');
  const [loadedLocalFonts, setLoadedLocalFonts] = useState<Record<string, string>>({});
  const [fontUploadMessage, setFontUploadMessage] = useState<string | null>(null);

  const handleClose = (): void => {
    setImportModalOpen(false);
    setErrorMessage(null);
    setStagedDoc(null);
    setShowDirtyConfirm(false);
    setFontUploadMessage(null);
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

  // Real-time font detection and direction detection on input change
  useEffect(() => {
    const rawHtml = activeTab === 'upload' ? uploadedHtml : pastedHtml;
    if (!rawHtml || !rawHtml.trim()) {
      setDetectedFonts([]);
      return;
    }

    try {
      const fonts = detectDocumentFonts(rawHtml);
      setDetectedFonts(fonts);

      // Priority for Arabic RTL: if Arabic chars or dir="rtl", select RTL
      const hasArabic =
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(rawHtml) ||
        /dir=["']rtl["']/i.test(rawHtml) ||
        /lang=["']ar/i.test(rawHtml);

      // If document explicitly sets LTR and has no Arabic, use LTR; otherwise default to RTL
      if (/dir=["']ltr["']/i.test(rawHtml) && !hasArabic) {
        setSelectedDirection('ltr');
      } else {
        setSelectedDirection('rtl');
      }
    } catch {
      // Safe fallback for detection errors
    }
  }, [uploadedHtml, pastedHtml, activeTab]);

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

  const handleLocalFontUpload = (fontName: string, e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    let format = 'woff2';
    if (lowerName.endsWith('.ttf')) format = 'truetype';
    else if (lowerName.endsWith('.otf')) format = 'opentype';
    else if (lowerName.endsWith('.woff')) format = 'woff';
    else if (lowerName.endsWith('.woff2')) format = 'woff2';

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        const cssSnippet = createLocalFontFaceCss(fontName, dataUrl, format);
        setLocalFontCss((prev) => `${prev}\n${cssSnippet}`);
        setLoadedLocalFonts((prev) => ({ ...prev, [fontName]: file.name }));

        // Inject into canvas iframe if available
        const canvasDoc =
          (adapter as unknown as { Canvas?: { getDocument?: () => Document } })?.Canvas?.getDocument?.() || null;
        injectFontFaceCss(cssSnippet, fontName, canvasDoc);
        setFontUploadMessage(`✓ تم تفعيل الخط "${fontName}" بنجاح من الملف المحلي!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const executeImport = (doc: SanitizedDocument): void => {
    if (!adapter) {
      setErrorMessage('Visual editor is not initialized.');
      return;
    }

    try {
      const finalDir = selectedDirection;
      const combinedCss = localFontCss
        ? (doc.css ? `${doc.css}\n${localFontCss}` : localFontCss)
        : doc.css;

      const docToLoad: SanitizedDocument = {
        ...doc,
        dir: finalDir,
        css: combinedCss,
      };

      loadSanitizedDocumentIntoAdapter(adapter, docToLoad);
      adapter.setDirection?.(finalDir);
      setCurrentDirection(finalDir);

      setCurrentProject({
        id: generateProjectId(),
        name:
          doc.title && doc.title !== 'Untitled Document'
            ? doc.title
            : uploadedFileName || 'Imported Document',
        sourceMeta: {
          sourceType: activeTab === 'upload' ? 'file' : 'paste',
          originalFileName: activeTab === 'upload' ? uploadedFileName || undefined : undefined,
          importedTitle: doc.title,
          importedLang: doc.lang || (finalDir === 'rtl' ? 'ar' : undefined),
          importedDir: finalDir,
          externalStylesheets: doc.externalStylesheets || [],
          importWarnings: doc.warnings || [],
        },
      });
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
    const rawHtml =
      activeTab === 'upload'
        ? (uploadedHtml && uploadedHtml.trim() ? uploadedHtml : pastedHtml)
        : (pastedHtml && pastedHtml.trim() ? pastedHtml : uploadedHtml);

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

  const currentContent = activeTab === 'upload' ? uploadedHtml : pastedHtml;
  const hasContent = Boolean(currentContent && currentContent.trim());

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

        {/* Tab Selection: Upload File first, then Paste HTML */}
        <div className="modal-tabs" role="tablist">
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
        </div>

        {/* Content Body */}
        <div className="modal-body">
          {errorMessage && (
            <div className="import-banner error" role="alert" data-testid="import-error-banner">
              <strong>Error:</strong> {errorMessage}
            </div>
          )}

          {/* Dirty State Warning Banner (AC-IMPORT-009) */}
          {showDirtyConfirm && (
            <div
              className="import-banner dirty-confirm"
              role="alert"
              data-testid="import-dirty-confirm"
            >
              <div>
                <strong>Unsaved Changes Warning:</strong> You have unsaved changes in your current
                project. Importing this document will replace your entire visual canvas.
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  className="modal-btn danger"
                  onClick={handleConfirmReplace}
                  data-testid="btn-confirm-replace"
                >
                  Overwrite and Import
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

          {/* Tab 1: Upload File Flow (T-0312) - Primary First Tab */}
          <div style={{ display: activeTab === 'upload' ? 'block' : 'none' }}>
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

          {/* Tab 2: Paste HTML Flow (T-0311) */}
          <div style={{ display: activeTab === 'paste' ? 'block' : 'none' }}>
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
                setActiveTab('paste');
                setErrorMessage(null);
                setStagedDoc(null);
                setShowDirtyConfirm(false);
              }}
              data-testid="import-paste-textarea"
            />
          </div>

          {/* Direction Configuration (Priority to Arabic RTL) */}
          {hasContent && (
            <div className="import-direction-section" data-testid="import-direction-section">
              <span className="import-section-title">اتجاه التصميم (Document Direction):</span>
              <div className="import-direction-radios">
                <label className={`direction-option ${selectedDirection === 'rtl' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="import-direction"
                    value="rtl"
                    checked={selectedDirection === 'rtl'}
                    onChange={() => setSelectedDirection('rtl')}
                  />
                  <span>عربي / من اليمين لليسار (RTL) - الأولوية الافتراضية</span>
                </label>
                <label className={`direction-option ${selectedDirection === 'ltr' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="import-direction"
                    value="ltr"
                    checked={selectedDirection === 'ltr'}
                    onChange={() => setSelectedDirection('ltr')}
                  />
                  <span>من اليسار لليمين (LTR)</span>
                </label>
              </div>
            </div>
          )}

          {/* Detected Fonts & Local Font Upload Section */}
          {hasContent && detectedFonts.length > 0 && (
            <div className="detected-fonts-section" data-testid="detected-fonts-section">
              <div className="detected-fonts-header">
                <span className="import-section-title">
                  🔤 الخطوط المكتشفة في الملف ({detectedFonts.length})
                </span>
                <span className="detected-fonts-hint">
                  التعرف التلقائي على الخطوط العربية مع إمكانية تحميل ملفات الخطوط محلياً
                </span>
              </div>

              {fontUploadMessage && (
                <div className="font-success-banner" role="status">
                  {fontUploadMessage}
                </div>
              )}

              <div className="detected-fonts-list">
                {detectedFonts.map((font) => {
                  const isLocalLoaded = Boolean(loadedLocalFonts[font.name]);
                  return (
                    <div key={font.name} className="detected-font-card">
                      <div className="detected-font-info">
                        <strong className="detected-font-name">{font.name}</strong>
                        <span className="detected-font-type">
                          {font.isArabic ? 'خط عربي' : 'Web Font'}
                        </span>
                      </div>
                      <div className="detected-font-actions">
                        {isLocalLoaded ? (
                          <span className="font-badge success">
                            ✓ مفعل محلياً ({loadedLocalFonts[font.name]})
                          </span>
                        ) : font.isAvailableOnGoogleFonts ? (
                          <span className="font-badge google">
                            ✓ متاح على Google Fonts (تفعيل تلقائي)
                          </span>
                        ) : (
                          <label
                            className="font-upload-label"
                            title="تحميل ملف الخط محلياً (.woff2, .woff, .ttf, .otf)"
                          >
                            <span>📁 تحميل الخط محلياً</span>
                            <input
                              type="file"
                              accept=".woff2,.woff,.ttf,.otf"
                              onChange={(e) => handleLocalFontUpload(font.name, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
            disabled={
              activeTab === 'upload'
                ? (!uploadedHtml.trim() && !pastedHtml.trim())
                : !pastedHtml.trim()
            }
            data-testid="btn-import-submit"
          >
            Import HTML
          </button>
        </div>
      </div>
    </div>
  );
}
