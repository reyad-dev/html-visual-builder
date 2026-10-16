import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportModal } from './ExportModal';
import { useUiStore } from '../../state/uiStore';
import { EditorContext } from '../../editor/EditorContext';
import * as exportDomain from '../../domain/document/exportDocument';
import type { IEditorAdapter } from '../../editor/types';

describe('ExportModal Component (Epic 5: T-0503 to T-0507)', () => {
  const mockAdapter: Partial<IEditorAdapter> = {
    getExportSnapshot: vi.fn().mockReturnValue({
      bodyHtml: '<section class="hero"><h1>Welcome</h1></section>',
      css: '.hero { background: #000; }',
    }),
    getHtml: vi.fn().mockReturnValue('<section class="hero"><h1>Welcome</h1></section>'),
    getCss: vi.fn().mockReturnValue('.hero { background: #000; }'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useUiStore.setState({
      isExportModalOpen: true,
      currentProjectId: 'test-proj-1',
      currentProjectName: 'Landing Page',
      currentSourceMeta: {
        sourceType: 'blank',
        importedTitle: 'Landing Page',
        importedLang: 'en',
        externalStylesheets: [],
        importWarnings: [],
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders modal dialog with title, inputs, and preview when isExportModalOpen is true', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Export Project HTML & CSS')).toBeInTheDocument();
    expect(screen.getByTestId('input-export-title')).toHaveValue('Landing Page');
    expect(screen.getByTestId('input-export-filename')).toHaveValue('landing_page.html');
    expect(screen.getByTestId('export-code-preview')).toBeInTheDocument();
  });

  it('does not render when isExportModalOpen is false', () => {
    useUiStore.setState({ isExportModalOpen: false });

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('switches between Full HTML, Body HTML, and CSS tabs (T-0505, T-0506)', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    const preview = screen.getByTestId('export-code-preview');

    // Default full standalone HTML
    expect(preview.textContent).toContain('<!doctype html>');
    expect(preview.textContent).toContain('<title>Landing Page</title>');
    expect(preview.textContent).toContain('<section class="hero"><h1>Welcome</h1></section>');

    // Switch to Body HTML tab
    fireEvent.click(screen.getByTestId('tab-export-body'));
    expect(preview.textContent).toBe('<section class="hero"><h1>Welcome</h1></section>');
    expect(preview.textContent).not.toContain('<!doctype html>');

    // Switch to CSS tab
    fireEvent.click(screen.getByTestId('tab-export-css'));
    expect(preview.textContent).toBe('.hero { background: #000; }');
  });

  it('triggers download when Download .html button is clicked (T-0504, AC-EXPORT-001)', () => {
    const downloadSpy = vi.spyOn(exportDomain, 'downloadHtmlFile').mockImplementation(() => {});

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    fireEvent.click(screen.getByTestId('btn-download-export'));

    expect(downloadSpy).toHaveBeenCalledTimes(1);
    expect(downloadSpy).toHaveBeenCalledWith(
      expect.stringContaining('<!doctype html>'),
      'landing_page.html'
    );
  });

  it('copies full standalone HTML to clipboard with visual feedback (AC-EXPORT-007)', async () => {
    const copySpy = vi.spyOn(exportDomain, 'copyToClipboard').mockResolvedValue(true);

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    fireEvent.click(screen.getByTestId('btn-copy-full-html'));

    expect(copySpy).toHaveBeenCalledWith(expect.stringContaining('<!doctype html>'));

    await waitFor(() => {
      expect(screen.getByTestId('copy-feedback')).toHaveTextContent(
        'Full standalone HTML copied to clipboard!'
      );
    });
  });

  it('copies body HTML and CSS with clipboard feedback (T-0505, T-0506, AC-EXPORT-007, AC-EXPORT-008)', async () => {
    const copySpy = vi.spyOn(exportDomain, 'copyToClipboard').mockResolvedValue(true);

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    // Copy body
    fireEvent.click(screen.getByTestId('btn-copy-body-html'));
    expect(copySpy).toHaveBeenCalledWith('<section class="hero"><h1>Welcome</h1></section>');

    await waitFor(() => {
      expect(screen.getByTestId('copy-feedback')).toHaveTextContent(
        'Body HTML copied to clipboard!'
      );
    });

    // Copy CSS
    fireEvent.click(screen.getByTestId('btn-copy-css'));
    expect(copySpy).toHaveBeenCalledWith('.hero { background: #000; }');

    await waitFor(() => {
      expect(screen.getByTestId('copy-feedback')).toHaveTextContent(
        'CSS styles copied to clipboard!'
      );
    });
  });

  it('displays warning banner when remote assets are detected (T-0507, AC-EXPORT)', () => {
    const adapterWithRemoteAssets: Partial<IEditorAdapter> = {
      getExportSnapshot: vi.fn().mockReturnValue({
        bodyHtml: '<img src="https://images.unsplash.com/photo-test.jpg" alt="Remote photo">',
        css: '',
      }),
      getHtml: vi.fn(),
      getCss: vi.fn(),
    };

    render(
      <EditorContext.Provider
        value={{ adapter: adapterWithRemoteAssets as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    const warningBanner = screen.getByTestId('remote-asset-warning');
    expect(warningBanner).toBeInTheDocument();
    expect(warningBanner).toHaveTextContent('Notice: Document Contains External Remote Resources');
    expect(warningBanner).toHaveTextContent('https://images.unsplash.com/photo-test.jpg');
  });

  it('does not display warning banner when no remote assets exist', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    expect(screen.queryByTestId('remote-asset-warning')).not.toBeInTheDocument();
  });

  it('closes when close button is clicked', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    fireEvent.click(screen.getByTestId('btn-close-export'));
    expect(useUiStore.getState().isExportModalOpen).toBe(false);
  });

  it('closes when backdrop is clicked', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    fireEvent.click(screen.getByTestId('export-modal-backdrop'));
    expect(useUiStore.getState().isExportModalOpen).toBe(false);
  });

  it('closes when Escape key is pressed (AC-A11Y-004)', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useUiStore.getState().isExportModalOpen).toBe(false);
  });

  it('renders Export PDF / Print button and triggers printDocument on click', () => {
    const printSpy = vi.spyOn(exportDomain, 'printDocument').mockImplementation(() => {});

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    const pdfBtn = screen.getByTestId('btn-export-pdf');
    expect(pdfBtn).toBeInTheDocument();
    expect(pdfBtn).toHaveTextContent(/export pdf \/ print/i);

    fireEvent.click(pdfBtn);
    expect(printSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Landing Page',
        bodyHtml: '<section class="hero"><h1>Welcome</h1></section>',
        css: '.hero { background: #000; }',
      })
    );
  });

  it('renders A4 simulation sheet preview with orientation and anti-cutoff badge', () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    // Default tab is PDF simulation
    expect(screen.getByTestId('a4-simulator-section')).toBeInTheDocument();
    expect(screen.getByTestId('a4-sheet-preview')).toBeInTheDocument();
    expect(screen.getByText(/anti-cutoff & table fit active/i)).toBeInTheDocument();

    // Toggle orientation to landscape
    fireEvent.click(screen.getByRole('button', { name: /landscape/i }));
    const sheet = screen.getByTestId('a4-sheet-preview');
    expect(sheet.className).toContain('landscape');
  });

  it('passes selected landscape orientation and margin to printDocument', () => {
    const printSpy = vi.spyOn(exportDomain, 'printDocument').mockImplementation(() => {});

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ExportModal />
      </EditorContext.Provider>
    );

    // Switch to landscape
    fireEvent.click(screen.getByRole('button', { name: /landscape/i }));

    // Change margin
    const select = screen.getByLabelText(/A4 Page Margins/i);
    fireEvent.change(select, { target: { value: '8mm 10mm' } });

    // Click print
    fireEvent.click(screen.getByTestId('btn-export-pdf'));

    expect(printSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        orientation: 'landscape',
        pageMargin: '8mm 10mm',
      })
    );
  });
});
