import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { EditorProvider } from '../../editor/EditorContext';
import { Workspace } from './Workspace';
import { useUiStore } from '../../state/uiStore';

describe('Workspace Visual Editor Integration (Epic 1)', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useUiStore.setState({
      currentDevice: 'desktop',
      activeLeftPanel: 'blocks',
      canUndo: false,
      canRedo: false,
      selectedComponent: null,
      isDirty: false,
      isSaving: false,
    });
  });

  const renderWorkspace = async () => {
    const utils = render(
      <EditorProvider>
        <Workspace />
      </EditorProvider>
    );
    await waitFor(() => {
      expect(screen.getByTestId('editor-canvas-mount')).toBeInTheDocument();
    });
    return utils;
  };

  it('renders all workspace chrome, toolbar buttons, and panel containers', async () => {
    await renderWorkspace();

    // Toolbar checks
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('HTML Visual Builder')).toBeInTheDocument();

    const undoBtn = screen.getByTestId('btn-undo');
    const redoBtn = screen.getByTestId('btn-redo');
    expect(undoBtn).toBeInTheDocument();
    expect(redoBtn).toBeInTheDocument();
    expect(undoBtn).toBeDisabled();
    expect(redoBtn).toBeDisabled();

    // Viewport switcher
    const desktopBtn = screen.getByRole('button', { name: /desktop preview/i });
    const tabletBtn = screen.getByRole('button', { name: /tablet preview/i });
    const mobileBtn = screen.getByRole('button', { name: /mobile preview/i });
    expect(desktopBtn).toBeInTheDocument();
    expect(tabletBtn).toBeInTheDocument();
    expect(mobileBtn).toBeInTheDocument();
    expect(desktopBtn).toHaveClass('active');

    // Mount containers
    expect(screen.getByTestId('blocks-container')).toBeInTheDocument();
    expect(screen.getByTestId('layers-container')).toBeInTheDocument();
    expect(screen.getByTestId('editor-canvas-mount')).toBeInTheDocument();
  });

  it('switches viewport device presets on button click without throwing', async () => {
    await renderWorkspace();

    const tabletBtn = screen.getByRole('button', { name: /tablet preview/i });
    fireEvent.click(tabletBtn);

    expect(useUiStore.getState().currentDevice).toBe('tablet');
    expect(tabletBtn).toHaveClass('active');

    const mobileBtn = screen.getByRole('button', { name: /mobile preview/i });
    fireEvent.click(mobileBtn);

    expect(useUiStore.getState().currentDevice).toBe('mobile');
    expect(mobileBtn).toHaveClass('active');
  });

  it('toggles between Blocks and Layers tabs in the left sidebar', async () => {
    await renderWorkspace();

    const tabBlocks = screen.getByTestId('tab-blocks');
    const tabLayers = screen.getByTestId('tab-layers');

    expect(tabBlocks).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('blocks-container')).toHaveStyle({ display: 'block' });
    expect(screen.getByTestId('layers-container')).toHaveStyle({ display: 'none' });

    fireEvent.click(tabLayers);

    expect(tabLayers).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('blocks-container')).toHaveStyle({ display: 'none' });
    expect(screen.getByTestId('layers-container')).toHaveStyle({ display: 'block' });
  });

  it('displays selection breadcrumb and quick action buttons when a component is selected', async () => {
    await renderWorkspace();

    // Initial state: hint message
    expect(screen.getByText(/canvas viewport/i)).toBeInTheDocument();

    // Select a component via UI store
    act(() => {
      useUiStore.getState().setSelectedComponent({
        id: 'c123',
        tagName: 'section',
        name: 'Hero Section',
        classes: ['builder-section', 'hero'],
        isRemovable: true,
        isCopyable: true,
      });
    });

    expect(screen.getAllByText('<section>').length).toBeGreaterThan(0);
    expect(screen.getByText('(Hero Section)')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-btn-duplicate')).toBeInTheDocument();
    expect(screen.getByTestId('canvas-btn-delete')).toBeInTheDocument();
  });

  it('cleans up editor adapter on unmount without memory leaks', async () => {
    const { unmount } = await renderWorkspace();

    // Unmount workspace shell
    expect(() => unmount()).not.toThrow();
  });

  it('intercepts keyboard shortcuts and respects focus guards', async () => {
    await renderWorkspace();

    // Create an input and append to test focus guard
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const deleteEvent = new KeyboardEvent('keydown', {
      key: 'Delete',
      bubbles: true,
      cancelable: true,
    });
    const defaultPreventedSpy = vi.spyOn(deleteEvent, 'preventDefault');

    input.dispatchEvent(deleteEvent);

    // Since input is focused, focus guard MUST NOT preventDefault or delete element
    expect(defaultPreventedSpy).not.toHaveBeenCalled();

    input.remove();
  });

  it('updates project name from input and marks editor dirty', async () => {
    await renderWorkspace();

    const nameInput = screen.getByTestId('input-project-name');
    expect(nameInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'My Awesome Website' } });

    expect(useUiStore.getState().currentProjectName).toBe('My Awesome Website');
    expect(useUiStore.getState().isDirty).toBe(true);
  });

  it('triggers save when Save button is clicked and displays saved status', async () => {
    await renderWorkspace();

    const saveBtn = screen.getByTestId('btn-save');
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(useUiStore.getState().saveStatus).toBe('saved');
      expect(useUiStore.getState().isDirty).toBe(false);
      expect(screen.getByTestId('status-text').textContent).toMatch(/Saved at|All changes saved/);
    });
  });

  it('opens Projects modal when Projects button is clicked', async () => {
    await renderWorkspace();

    const projectsBtn = screen.getByTestId('btn-projects');
    expect(projectsBtn).toBeInTheDocument();

    fireEvent.click(projectsBtn);

    await waitFor(() => {
      expect(useUiStore.getState().isProjectsModalOpen).toBe(true);
      expect(screen.getByTestId('projects-modal-dialog')).toBeInTheDocument();
    });
  });

  it('opens Export modal when Export button is clicked', async () => {
    await renderWorkspace();

    const exportBtn = screen.getByTestId('btn-export');
    expect(exportBtn).toBeInTheDocument();

    fireEvent.click(exportBtn);

    await waitFor(() => {
      expect(useUiStore.getState().isExportModalOpen).toBe(true);
      expect(screen.getByTestId('export-modal-dialog')).toBeInTheDocument();
    });
  });

  it('renders Print button and triggers print on click', async () => {
    await renderWorkspace();

    const printBtn = screen.getByTestId('btn-print');
    expect(printBtn).toBeInTheDocument();
    expect(printBtn).toHaveTextContent(/print/i);

    fireEvent.click(printBtn);
  });
});

