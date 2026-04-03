import { render, screen } from '@testing-library/react';
import React from 'react';
import Badge from './Badge';

describe('Badge', () => {
  it('should render with children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should render with default variant classes', () => {
    render(<Badge variant="default">Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should render with success variant', () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should render with warning variant', () => {
    render(<Badge variant="warning">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should render with error variant', () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should render with info variant', () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText('Info');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should render with rating variant', () => {
    render(<Badge variant="rating">Rating</Badge>);
    const badge = screen.getByText('Rating');
    expect(badge).toHaveClass('bg-primary-100', 'text-primary-800');
  });

  it('should render with small size', () => {
    render(<Badge size="sm">Small</Badge>);
    const badge = screen.getByText('Small');
    expect(badge).toHaveClass('px-2', 'py-0.5', 'text-xs');
  });

  it('should render with medium size', () => {
    render(<Badge size="md">Medium</Badge>);
    const badge = screen.getByText('Medium');
    expect(badge).toHaveClass('px-2.5', 'py-0.5', 'text-sm');
  });

  it('should render with large size', () => {
    render(<Badge size="lg">Large</Badge>);
    const badge = screen.getByText('Large');
    expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
  });

  it('should apply custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  it('should have rounded-full class', () => {
    render(<Badge>Round</Badge>);
    expect(screen.getByText('Round')).toHaveClass('rounded-full');
  });

  it('should have font-medium class', () => {
    render(<Badge>Bold</Badge>);
    expect(screen.getByText('Bold')).toHaveClass('font-medium');
  });

  it('should render with JSX children', () => {
    render(<Badge><strong>Bold Text</strong></Badge>);
    expect(screen.getByText('Bold Text')).toBeInTheDocument();
  });
});