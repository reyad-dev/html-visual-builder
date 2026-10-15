import type { ProjectSummary, SavedProject } from './schema';

export interface ProjectRepository {
  /**
   * Return summaries of all saved projects, sorted newest updated first.
   */
  list(): Promise<ProjectSummary[]>;

  /**
   * Retrieve a saved project by ID. Returns null if not found.
   * Throws if the project payload fails schema migration or is corrupted.
   */
  get(id: string): Promise<SavedProject | null>;

  /**
   * Save a project (create or replace). Preserves original createdAt if already existing,
   * updates updatedAt timestamp, and rejects invalid schema payloads.
   */
  save(project: SavedProject): Promise<void>;

  /**
   * Delete a project by ID. Must be idempotent (succeeds even if ID does not exist).
   */
  delete(id: string): Promise<void>;
}
