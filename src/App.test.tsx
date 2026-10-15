import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

describe('App Root Component', () => {
  it('renders application toolbar and workspace brand title without error', async () => {
    render(<App />);

    expect(screen.getByText('HTML Visual Builder')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-container')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-canvas-host')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /desktop preview/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('btn-undo')).toBeInTheDocument();
      expect(screen.getByTestId('btn-redo')).toBeInTheDocument();
    });
  });
});
