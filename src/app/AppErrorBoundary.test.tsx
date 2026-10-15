import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppErrorBoundary } from './AppErrorBoundary';

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test crash simulation');
  }
  return <div>Normal Content</div>;
}

describe('AppErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <AppErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('renders error UI when child throws an exception', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AppErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByTestId('app-error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Test crash simulation')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('supports custom fallback node', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AppErrorBoundary fallback={<div>Custom Error View</div>}>
        <ProblemChild shouldThrow={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText('Custom Error View')).toBeInTheDocument();

    spy.mockRestore();
  });

  it('allows resetting error state with Try Again', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function TestHost() {
      const [shouldThrow, setShouldThrow] = useState(true);
      return (
        <div>
          <button type="button" onClick={() => setShouldThrow(false)}>
            Fix Problem
          </button>
          <AppErrorBoundary>
            <ProblemChild shouldThrow={shouldThrow} />
          </AppErrorBoundary>
        </div>
      );
    }

    render(<TestHost />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /fix problem/i }));
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('Normal Content')).toBeInTheDocument();

    spy.mockRestore();
  });
});
