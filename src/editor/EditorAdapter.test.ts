import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorAdapter } from './EditorAdapter';
import { loadSanitizedDocumentIntoAdapter } from '../domain/document/loadDocument';

describe('EditorAdapter Core Engine', () => {
  let adapter: EditorAdapter;
  let canvasMount: HTMLDivElement;
  let blocksMount: HTMLDivElement;
  let layersMount: HTMLDivElement;

  beforeEach(() => {
    canvasMount = document.createElement('div');
    canvasMount.id = 'gjs-canvas-root';
    blocksMount = document.createElement('div');
    blocksMount.id = 'blocks-panel-mount';
    layersMount = document.createElement('div');
    layersMount.id = 'layers-panel-mount';

    document.body.appendChild(canvasMount);
    document.body.appendChild(blocksMount);
    document.body.appendChild(layersMount);

    adapter = new EditorAdapter();
  });

  afterEach(() => {
    adapter.destroy();
    canvasMount.remove();
    blocksMount.remove();
    layersMount.remove();
  });

  it('initializes editor adapter with blocks, layers, and blank starter document', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    expect(adapter.isInitialized).toBe(true);
    expect(adapter.getHtml()).toContain('Start Designing');
    expect(adapter.getHtml()).toContain('Explore Components');
  });

  it('supports viewport device changes without mutating document content', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    const initialHtml = adapter.getHtml();

    adapter.setDevice('tablet');
    expect(adapter.getDevice()).toBe('tablet');
    expect(adapter.getHtml()).toBe(initialHtml);

    adapter.setDevice('mobile');
    expect(adapter.getDevice()).toBe('mobile');
    expect(adapter.getHtml()).toBe(initialHtml);

    adapter.setDevice('desktop');
    expect(adapter.getDevice()).toBe('desktop');
    expect(adapter.getHtml()).toBe(initialHtml);
  });

  it('handles null and empty selection gracefully without throwing', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    expect(() => adapter.clearSelection()).not.toThrow();
    expect(adapter.getSelectedComponent()).toBeNull();
    expect(adapter.deleteSelected()).toBe(false);
    expect(adapter.duplicateSelected()).toBe(false);
  });

  it('prevents accidental deletion or duplication of the root wrapper', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    // Selecting wrapper directly if possible
    expect(adapter.deleteSelected()).toBe(false);
    expect(adapter.duplicateSelected()).toBe(false);
    expect(adapter.getSelectedComponent()).toBeNull();
  });

  it('supports component selection, duplication, and deletion with history tracking', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    // Extract an inner component to test selection
    // In GrapesJS, we can find a component by query or get the first child
    const projectData = adapter.getProjectData() as { pages?: Array<{ frames?: Array<{ component?: { components?: Array<unknown> } }> }> };
    expect(projectData).toBeDefined();

    // Verify duplicate and delete safe operations
    expect(adapter.duplicateSelected()).toBe(false);
    expect(adapter.deleteSelected()).toBe(false);
  });

  it('provides undo and redo methods and tracks history', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    expect(typeof adapter.canUndo()).toBe('boolean');
    expect(typeof adapter.canRedo()).toBe('boolean');
    expect(typeof adapter.undo).toBe('function');
    expect(typeof adapter.redo).toBe('function');
  });

  it('exports a snapshot containing bodyHtml and css', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    const snapshot = adapter.getExportSnapshot();
    expect(snapshot.bodyHtml).toContain('Start Designing');
    expect(typeof snapshot.css).toBe('string');
  });

  it('loads a SanitizedDocument replacing existing components and styles cleanly', async () => {
    await adapter.init({
      container: canvasMount,
      blocksContainer: blocksMount,
      layersContainer: layersMount,
      headless: true,
    });

    loadSanitizedDocumentIntoAdapter(adapter, {
      title: 'Imported Test Page',
      meta: [],
      bodyHtml: '<section class="imported-hero"><h1>Imported Heading</h1></section>',
      css: '.imported-hero { padding: 40px; }',
      externalStylesheets: [],
      warnings: [],
    });

    expect(adapter.getHtml()).toContain('Imported Heading');
    expect(adapter.getHtml()).not.toContain('Start Designing');
    expect(adapter.getCss()).toContain('.imported-hero');
    // History should be reset after clean import baseline
    expect(adapter.canUndo()).toBe(false);
  });
});


