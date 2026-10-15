import { type ReactElement } from 'react';
import { AppErrorBoundary } from './app/AppErrorBoundary';
import { EditorProvider } from './editor/EditorContext';
import { Workspace } from './features/workspace/Workspace';

export function App(): ReactElement {
  return (
    <AppErrorBoundary>
      <EditorProvider>
        <Workspace />
      </EditorProvider>
    </AppErrorBoundary>
  );
}

export default App;
