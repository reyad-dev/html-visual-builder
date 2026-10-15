import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type ReactElement,
} from 'react';
import { type IEditorAdapter } from './types';

export interface EditorContextValue {
  adapter: IEditorAdapter | null;
  setAdapter: (adapter: IEditorAdapter | null) => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);


export function EditorProvider({ children }: { children: ReactNode }): ReactElement {
  const [adapter, setAdapter] = useState<IEditorAdapter | null>(null);

  return (
    <EditorContext.Provider value={{ adapter, setAdapter }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
