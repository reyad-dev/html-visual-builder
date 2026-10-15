import { useEffect, useState, type ReactElement } from 'react';
import { useUiStore } from '../../state/uiStore';
import { useEditor } from '../../editor/EditorContext';
import { defaultProjectRepository } from '../../data/projects/BrowserProjectRepository';
import type { ProjectSummary } from '../../data/projects/schema';
import './projects.css';

export function ProjectListModal(): ReactElement | null {
  const {
    isProjectsModalOpen,
    setProjectsModalOpen,
    currentProjectId,
    isDirty,
    setCurrentProject,
    resetProjectState,
    setIsDirty,
    setTemplatesModalOpen,
  } = useUiStore();

  const { adapter } = useEditor();

  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation states
  const [pendingOpenId, setPendingOpenId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [showNewConfirm, setShowNewConfirm] = useState(false);

  const loadProjects = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const list = await defaultProjectRepository.list();
      setProjects(list);
    } catch (err) {
      setErrorMessage(
        `Failed to load projects: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isProjectsModalOpen) {
      void loadProjects();
    } else {
      setPendingOpenId(null);
      setPendingDeleteId(null);
      setShowNewConfirm(false);
      setErrorMessage(null);
    }
  }, [isProjectsModalOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isProjectsModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        setProjectsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProjectsModalOpen, setProjectsModalOpen]);

  if (!isProjectsModalOpen) {
    return null;
  }

  const handleClose = (): void => {
    setProjectsModalOpen(false);
  };

  const executeOpenProject = async (id: string): Promise<void> => {
    if (!adapter) {
      setErrorMessage('Visual editor is not initialized.');
      return;
    }

    try {
      const project = await defaultProjectRepository.get(id);
      if (!project) {
        setErrorMessage('Project not found.');
        return;
      }

      adapter.loadProjectData(project.editorProjectData);
      localStorage.setItem('hvb_last_active_project_id', project.id);
      setCurrentProject({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        sourceMeta: project.sourceMeta,
      });
      setIsDirty(false);
      handleClose();
    } catch (err) {
      setErrorMessage(
        `Failed to open project: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const handleOpenClick = (id: string): void => {
    if (isDirty) {
      setPendingOpenId(id);
    } else {
      void executeOpenProject(id);
    }
  };

  const executeDeleteProject = async (id: string): Promise<void> => {
    try {
      await defaultProjectRepository.delete(id);
      setPendingDeleteId(null);
      await loadProjects();
    } catch (err) {
      setErrorMessage(
        `Failed to delete project: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const executeNewProject = (): void => {
    localStorage.removeItem('hvb_last_active_project_id');
    if (adapter && typeof adapter.resetToBlank === 'function') {
      adapter.resetToBlank();
    }
    resetProjectState('Untitled Project');
    setIsDirty(false);
    handleClose();
  };

  const handleNewProjectClick = (): void => {
    if (isDirty) {
      setShowNewConfirm(true);
    } else {
      executeNewProject();
    }
  };

  const formatTimestamp = (iso: string): string => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div
      className="projects-modal-overlay"
      role="presentation"
      data-testid="projects-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="projects-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="projects-dialog-title"
        data-testid="projects-modal-dialog"
      >
        <header className="projects-modal-header">
          <div className="projects-header-left">
            <h2 id="projects-dialog-title" className="projects-modal-title">
              Saved Projects
            </h2>
            <span className="projects-badge">{projects.length} Saved</span>
          </div>
          <button
            type="button"
            className="projects-modal-close-btn"
            onClick={handleClose}
            aria-label="Close projects modal"
            data-testid="btn-close-projects-modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="projects-modal-body">
          {errorMessage && (
            <div className="projects-error-banner" role="alert">
              {errorMessage}
            </div>
          )}

          {/* New Project Confirmation if dirty */}
          {showNewConfirm && (
            <div className="projects-confirm-overlay" role="region" aria-label="Confirm new project">
              <p>
                <strong>Unsaved Changes:</strong> Creating a new project will discard all unsaved changes on the canvas.
              </p>
              <div className="projects-confirm-actions">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setShowNewConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-confirm-danger"
                  onClick={executeNewProject}
                  data-testid="btn-confirm-discard-new"
                >
                  Discard & Create New
                </button>
              </div>
            </div>
          )}

          {/* Open Confirmation if dirty */}
          {pendingOpenId && (
            <div className="projects-confirm-overlay" role="region" aria-label="Confirm open project">
              <p>
                <strong>Unsaved Changes:</strong> Opening this project will discard all unsaved changes on the canvas.
              </p>
              <div className="projects-confirm-actions">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setPendingOpenId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-confirm-danger"
                  onClick={() => void executeOpenProject(pendingOpenId)}
                  data-testid="btn-confirm-discard-open"
                >
                  Discard & Open
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation */}
          {pendingDeleteId && (
            <div className="projects-confirm-overlay" role="region" aria-label="Confirm delete project">
              <p>
                Are you sure you want to permanently delete this project? This action cannot be undone.
              </p>
              <div className="projects-confirm-actions">
                <button
                  type="button"
                  className="btn-confirm-cancel"
                  onClick={() => setPendingDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-confirm-danger"
                  onClick={() => void executeDeleteProject(pendingDeleteId)}
                  data-testid="btn-confirm-delete"
                >
                  Delete Project
                </button>
              </div>
            </div>
          )}

          <div className="projects-actions-bar">
            <button
              type="button"
              className="projects-new-btn"
              onClick={handleNewProjectClick}
              data-testid="btn-new-project"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Blank Project</span>
            </button>
            <span className="projects-count-label">
              {isLoading ? 'Loading projects...' : `${projects.length} project(s) in local storage`}
            </span>
          </div>

          {projects.length === 0 && !isLoading ? (
            <div className="projects-empty-state" data-testid="projects-empty-state">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ opacity: 0.5, marginBottom: '0.5rem' }}
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <p>No saved projects found in browser storage.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Use the &quot;Save&quot; button in the top toolbar or press Ctrl+S to save your work.
              </p>
              <button
                type="button"
                className="action-btn"
                style={{ marginTop: '0.85rem', fontSize: '0.8rem', gap: '0.4rem', background: 'var(--accent-gradient)', color: '#fff', border: 'none' }}
                onClick={() => {
                  setProjectsModalOpen(false);
                  setTemplatesModalOpen(true);
                }}
                data-testid="btn-empty-open-templates"
              >
                <span>✨</span> Explore Starter Examples (استكشف القوالب والأمثلة)
              </button>
            </div>
          ) : (
            <ul className="projects-list" aria-label="Saved projects list">
              {projects.map((project) => {
                const isCurrent = project.id === currentProjectId;
                return (
                  <li
                    key={project.id}
                    className={`project-item ${isCurrent ? 'active' : ''}`}
                    data-testid={`project-item-${project.id}`}
                  >
                    <div className="project-info">
                      <div className="project-name-row">
                        <span className="project-item-name" title={project.name}>
                          {project.name}
                        </span>
                        {isCurrent && <span className="project-current-tag">Current</span>}
                      </div>
                      <div className="project-meta-row">
                        <span>Updated: {formatTimestamp(project.updatedAt)}</span>
                        <span>Created: {formatTimestamp(project.createdAt)}</span>
                      </div>
                    </div>

                    <div className="project-actions">
                      <button
                        type="button"
                        className="project-open-btn"
                        onClick={() => handleOpenClick(project.id)}
                        disabled={isCurrent}
                        aria-label={`Open project ${project.name}`}
                        data-testid={`btn-open-project-${project.id}`}
                      >
                        {isCurrent ? 'Opened' : 'Open'}
                      </button>
                      <button
                        type="button"
                        className="project-delete-btn"
                        onClick={() => setPendingDeleteId(project.id)}
                        aria-label={`Delete project ${project.name}`}
                        data-testid={`btn-delete-project-${project.id}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
