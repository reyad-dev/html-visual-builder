import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectListModal } from './ProjectListModal';
import { useUiStore } from '../../state/uiStore';
import { EditorContext } from '../../editor/EditorContext';
import { defaultProjectRepository } from '../../data/projects/BrowserProjectRepository';
import { createDefaultSavedProject } from '../../data/projects/schema';
import type { IEditorAdapter } from '../../editor/types';

describe('ProjectListModal Component (T-0406)', () => {
  const mockAdapter: Partial<IEditorAdapter> = {
    loadProjectData: vi.fn(),
    resetToBlank: vi.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    useUiStore.setState({
      isProjectsModalOpen: true,
      currentProjectId: 'curr-1',
      currentProjectName: 'Current Active Project',
      isDirty: false,
    });
  });

  it('renders project list dialog and shows empty state when no projects exist', async () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Saved Projects')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('projects-empty-state')).toBeInTheDocument();
    });
  });

  it('displays saved projects and identifies the current active project', async () => {
    const p1 = createDefaultSavedProject('First Project');
    p1.id = 'curr-1'; // matches currentProjectId
    const p2 = createDefaultSavedProject('Second Project');
    p2.id = 'proj-2';

    await defaultProjectRepository.save(p1);
    await defaultProjectRepository.save(p2);

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('First Project')).toBeInTheDocument();
      expect(screen.getByText('Second Project')).toBeInTheDocument();
    });

    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('opens project directly when canvas is not dirty', async () => {
    const p2 = createDefaultSavedProject('Second Project', { custom: 'data' });
    p2.id = 'proj-2';
    await defaultProjectRepository.save(p2);

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('btn-open-project-proj-2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-open-project-proj-2'));

    await waitFor(() => {
      expect(mockAdapter.loadProjectData).toHaveBeenCalledWith({ custom: 'data' });
      expect(useUiStore.getState().currentProjectId).toBe('proj-2');
      expect(useUiStore.getState().currentProjectName).toBe('Second Project');
      expect(useUiStore.getState().isProjectsModalOpen).toBe(false);
    });
  });

  it('shows dirty warning confirmation when attempting to open another project while dirty', async () => {
    useUiStore.setState({ isDirty: true });

    const p2 = createDefaultSavedProject('Second Project', { custom: 'data' });
    p2.id = 'proj-2';
    await defaultProjectRepository.save(p2);

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('btn-open-project-proj-2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-open-project-proj-2'));

    // Should prompt for confirmation
    expect(screen.getByTestId('btn-confirm-discard-open')).toBeInTheDocument();
    expect(mockAdapter.loadProjectData).not.toHaveBeenCalled();

    // Confirm discard & open
    fireEvent.click(screen.getByTestId('btn-confirm-discard-open'));

    await waitFor(() => {
      expect(mockAdapter.loadProjectData).toHaveBeenCalledWith({ custom: 'data' });
      expect(useUiStore.getState().currentProjectId).toBe('proj-2');
    });
  });

  it('creates new blank project and resets canvas adapter', async () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('projects-empty-state')).toBeInTheDocument();
    });

    const newBtn = screen.getByTestId('btn-new-project');
    fireEvent.click(newBtn);

    expect(mockAdapter.resetToBlank).toHaveBeenCalled();
    expect(useUiStore.getState().currentProjectName).toBe('Untitled Project');
    expect(useUiStore.getState().isProjectsModalOpen).toBe(false);
  });

  it('deletes project with confirmation', async () => {
    const p3 = createDefaultSavedProject('Project To Delete');
    p3.id = 'proj-3';
    await defaultProjectRepository.save(p3);

    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('btn-delete-project-proj-3')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-delete-project-proj-3'));
    expect(screen.getByTestId('btn-confirm-delete')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('btn-confirm-delete'));

    await waitFor(() => {
      expect(screen.queryByText('Project To Delete')).not.toBeInTheDocument();
    });
  });

  it('closes modal on Escape key press or close button click', async () => {
    render(
      <EditorContext.Provider
        value={{ adapter: mockAdapter as IEditorAdapter, setAdapter: vi.fn() }}
      >
        <ProjectListModal />
      </EditorContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('projects-empty-state')).toBeInTheDocument();
    });

    const closeBtn = screen.getByTestId('btn-close-projects-modal');
    fireEvent.click(closeBtn);
    expect(useUiStore.getState().isProjectsModalOpen).toBe(false);
  });
});
