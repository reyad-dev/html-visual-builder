import { EditorAdapter } from './EditorAdapter';
import { type EditorAdapterOptions, type IEditorAdapter } from './types';

/**
 * Creates and initializes a new visual editor adapter instance.
 */
export async function createEditor(options: EditorAdapterOptions): Promise<IEditorAdapter> {
  const adapter = new EditorAdapter();
  await adapter.init(options);
  return adapter;
}
