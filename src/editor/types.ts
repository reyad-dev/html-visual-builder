export type EditorDevice = 'desktop' | 'tablet' | 'mobile';

export interface EditorAdapterOptions {
  container: HTMLElement;
  blocksContainer?: HTMLElement | undefined;
  layersContainer?: HTMLElement | undefined;
  headless?: boolean | undefined;
}

export interface CanvasDimensions {
  width: string;
  height: string;
}

export interface SelectedComponentInfo {
  id: string;
  tagName: string;
  name: string;
  classes: string[];
  isRemovable: boolean;
  isCopyable: boolean;
}

export type EditorEventType = 'selection:change' | 'history:change' | 'update';

export interface ExportSnapshot {
  bodyHtml: string;
  css: string;
}

import type { SanitizedDocument } from '../domain/document/types';

export interface IEditorAdapter {
  readonly isInitialized: boolean;
  init(options: EditorAdapterOptions): Promise<void>;
  destroy(): void;
  setDevice(device: EditorDevice): void;
  getDevice(): EditorDevice;
  getHtml(): string;
  getCss(): string;
  getProjectData(): unknown;
  loadProjectData(data: unknown): void;
  loadSanitizedDocument?(doc: SanitizedDocument): void;
  resetToBlank?(): void;
  loadTemplate?(html: string, css?: string): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  duplicateSelected(): boolean;
  deleteSelected(): boolean;
  getSelectedComponent(): SelectedComponentInfo | null;
  select(component: unknown): void;
  clearSelection(): void;
  on(event: EditorEventType, callback: () => void): () => void;
  getExportSnapshot(): ExportSnapshot;
}

