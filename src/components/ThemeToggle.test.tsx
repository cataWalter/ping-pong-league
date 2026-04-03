import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from './ThemeProvider';

const renderWithThemeProvider = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemeToggle', () => {
  it('should render toggle button', () => {
    renderWithThemeProvider(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should have a title attribute', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title');
  });

  it('should render sun icon for light mode', () => {
    renderWithThemeProvider(<ThemeToggle />);
    // The sun icon should be present (it's shown in light mode by default)
    const button = screen.getByRole('button');
    expect(button.innerHTML).toContain('M12 3v1m0 16v1m9-9h-1');
  });

  it('should render moon icon for dark mode', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button.innerHTML).toContain('M20.354 15.354A9 9 0 018.646 3.646');
  });

  it('should have sr-only text', () => {
    renderWithThemeProvider(<ThemeToggle />);
    expect(screen.getByText('Toggle theme')).toHaveClass('sr-only');
  });

  it('should have hover styles', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-gray-100');
  });

  it('should have transition styles', () => {
    renderWithThemeProvider(<ThemeToggle />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('transition-colors');
  });
});