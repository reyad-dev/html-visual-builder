import { migrateSavedProject } from './migrations';
import type { ProjectRepository } from './ProjectRepository';
import type { ProjectSummary, SavedProject } from './schema';

export class StorageQuotaError extends Error {
  constructor(message = 'Browser storage quota exceeded. Unable to save project.') {
    super(message);
    this.name = 'StorageQuotaError';
  }
}

export class StorageAccessError extends Error {
  constructor(message = 'Browser storage access error.') {
    super(message);
    this.name = 'StorageAccessError';
  }
}

export interface BrowserProjectRepositoryOptions {
  dbName?: string;
  storeName?: string;
  forceLocalStorage?: boolean;
}

const DB_NAME_DEFAULT = 'hvb_projects_db';
const STORE_NAME_DEFAULT = 'projects';
const LOCALSTORAGE_INDEX_KEY = 'hvb_projects_index';
const LOCALSTORAGE_PROJECT_PREFIX = 'hvb_project_';

function isQuotaError(err: unknown): boolean {
  if (err instanceof StorageQuotaError) return true;
  if (err && typeof err === 'object') {
    const errorObj = err as { name?: string; code?: number };
    return (
      errorObj.name === 'QuotaExceededError' ||
      errorObj.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      errorObj.code === 22 ||
      errorObj.code === 1014
    );
  }
  return false;
}

export class BrowserProjectRepository implements ProjectRepository {
  private dbName: string;
  private storeName: string;
  private forceLocalStorage: boolean;
  private idbInstance: IDBDatabase | null = null;
  private isIdbFailed = false;

  constructor(options: BrowserProjectRepositoryOptions = {}) {
    this.dbName = options.dbName || DB_NAME_DEFAULT;
    this.storeName = options.storeName || STORE_NAME_DEFAULT;
    this.forceLocalStorage = Boolean(options.forceLocalStorage);
  }

  private hasIndexedDb(): boolean {
    if (this.forceLocalStorage || this.isIdbFailed) {
      return false;
    }
    return (
      typeof window !== 'undefined' &&
      typeof window.indexedDB !== 'undefined' &&
      window.indexedDB !== null
    );
  }

  private async getDb(): Promise<IDBDatabase> {
    if (this.idbInstance) {
      return this.idbInstance;
    }

    return new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        };

        request.onsuccess = () => {
          this.idbInstance = request.result;
          this.idbInstance.onversionchange = () => {
            this.idbInstance?.close();
            this.idbInstance = null;
          };
          resolve(this.idbInstance);
        };

        request.onerror = () => {
          this.isIdbFailed = true;
          reject(new StorageAccessError(request.error?.message || 'Failed to open IndexedDB.'));
        };
      } catch (err) {
        this.isIdbFailed = true;
        reject(err);
      }
    });
  }

  async list(): Promise<ProjectSummary[]> {
    if (this.hasIndexedDb()) {
      try {
        const db = await this.getDb();
        return await new Promise<ProjectSummary[]>((resolve, reject) => {
          const tx = db.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            const results = (request.result || []) as SavedProject[];
            const summaries: ProjectSummary[] = results.map((p) => ({
              id: p.id,
              name: p.name,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            }));
            // Sort newest updated first
            summaries.sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            resolve(summaries);
          };

          request.onerror = () => {
            reject(new StorageAccessError(request.error?.message || 'Failed to list projects.'));
          };
        });
      } catch (err) {
        // Fall back to localStorage if IndexedDB fails
        if (this.isIdbFailed) {
          return this.listFromLocalStorage();
        }
        throw err;
      }
    }

    return this.listFromLocalStorage();
  }

  async get(id: string): Promise<SavedProject | null> {
    if (!id || !id.trim()) {
      return null;
    }

    if (this.hasIndexedDb()) {
      try {
        const db = await this.getDb();
        return await new Promise<SavedProject | null>((resolve, reject) => {
          const tx = db.transaction(this.storeName, 'readonly');
          const store = tx.objectStore(this.storeName);
          const request = store.get(id);

          request.onsuccess = () => {
            const raw = request.result;
            if (!raw) {
              resolve(null);
              return;
            }
            try {
              const validated = migrateSavedProject(raw);
              resolve(validated);
            } catch (validationErr) {
              reject(validationErr);
            }
          };

          request.onerror = () => {
            reject(new StorageAccessError(request.error?.message || 'Failed to read project.'));
          };
        });
      } catch (err) {
        if (this.isIdbFailed) {
          return this.getFromLocalStorage(id);
        }
        throw err;
      }
    }

    return this.getFromLocalStorage(id);
  }

  async save(project: SavedProject): Promise<void> {
    // Validate schema
    const validated = migrateSavedProject(project);

    // Check if existing project exists to preserve createdAt
    const existing = await this.get(validated.id);
    const now = new Date().toISOString();

    const toSave: SavedProject = {
      ...validated,
      createdAt: existing ? existing.createdAt : validated.createdAt || now,
      updatedAt: now,
    };

    if (this.hasIndexedDb()) {
      try {
        const db = await this.getDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const request = store.put(toSave);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            if (isQuotaError(request.error)) {
              reject(new StorageQuotaError());
            } else {
              reject(
                new StorageAccessError(request.error?.message || 'Failed to write project.')
              );
            }
          };

          tx.onerror = () => {
            if (isQuotaError(tx.error)) {
              reject(new StorageQuotaError());
            }
          };

          tx.onabort = () => {
            if (isQuotaError(tx.error)) {
              reject(new StorageQuotaError());
            } else {
              reject(new StorageAccessError('IndexedDB transaction aborted during save.'));
            }
          };
        });
        return;
      } catch (err) {
        if (isQuotaError(err)) {
          throw new StorageQuotaError();
        }
        if (this.isIdbFailed) {
          return this.saveToLocalStorage(toSave);
        }
        throw err;
      }
    }

    return this.saveToLocalStorage(toSave);
  }

  async delete(id: string): Promise<void> {
    if (!id || !id.trim()) {
      return;
    }

    if (this.hasIndexedDb()) {
      try {
        const db = await this.getDb();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(this.storeName, 'readwrite');
          const store = tx.objectStore(this.storeName);
          const request = store.delete(id);

          request.onsuccess = () => {
            resolve();
          };

          request.onerror = () => {
            reject(new StorageAccessError(request.error?.message || 'Failed to delete project.'));
          };
        });
        return;
      } catch (err) {
        if (this.isIdbFailed) {
          return this.deleteFromLocalStorage(id);
        }
        throw err;
      }
    }

    return this.deleteFromLocalStorage(id);
  }

  // LocalStorage Fallback Methods
  private listFromLocalStorage(): ProjectSummary[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    try {
      const rawIndex = window.localStorage.getItem(LOCALSTORAGE_INDEX_KEY);
      if (!rawIndex) {
        return [];
      }
      const summaries = JSON.parse(rawIndex) as ProjectSummary[];
      if (!Array.isArray(summaries)) {
        return [];
      }
      summaries.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      return summaries;
    } catch {
      return [];
    }
  }

  private getFromLocalStorage(id: string): SavedProject | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const raw = window.localStorage.getItem(LOCALSTORAGE_PROJECT_PREFIX + id);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return migrateSavedProject(parsed);
  }

  private saveToLocalStorage(project: SavedProject): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new StorageAccessError('Browser localStorage is not available in this environment.');
    }

    try {
      const serialized = JSON.stringify(project);
      window.localStorage.setItem(LOCALSTORAGE_PROJECT_PREFIX + project.id, serialized);

      // Update index
      const summaries = this.listFromLocalStorage().filter((s) => s.id !== project.id);
      summaries.unshift({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });

      window.localStorage.setItem(LOCALSTORAGE_INDEX_KEY, JSON.stringify(summaries));
    } catch (err) {
      if (isQuotaError(err)) {
        throw new StorageQuotaError();
      }
      throw new StorageAccessError(
        `Failed to save project to localStorage: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  private deleteFromLocalStorage(id: string): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.removeItem(LOCALSTORAGE_PROJECT_PREFIX + id);
      const summaries = this.listFromLocalStorage().filter((s) => s.id !== id);
      window.localStorage.setItem(LOCALSTORAGE_INDEX_KEY, JSON.stringify(summaries));
    } catch {
      // Idempotent delete
    }
  }
}

export const defaultProjectRepository = new BrowserProjectRepository();
