import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import HomePage from '../src/app/page';

/**
 * Proves the harness end to end: vitest runs, the React plugin compiles TSX,
 * jsdom provides a DOM, and Testing Library can query it.
 */
describe('harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a server component that returns plain JSX', () => {
    render(<HomePage />);
    // The home page's h1 is the hero headline, index.html:3668. It used to be
    // "Topcat Worktops" here because the page was a scaffold stub; the real
    // composition renders the client's own headline instead.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Surfaces worth\s*building around/,
    );
  });
});
