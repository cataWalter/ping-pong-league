import { render, screen } from '@testing-library/react';
import React from 'react';
import Card from './Card';

describe('Card', () => {
  it('should render with children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should render with default padding', () => {
    render(<Card>Default Padding</Card>);
    expect(screen.getByText('Default Padding')).toHaveClass('p-6');
  });

  it('should render with no padding', () => {
    render(<Card padding="none">No Padding</Card>);
    expect(screen.getByText('No Padding')).not.toHaveClass('p-4', 'p-6', 'p-8');
  });

  it('should render with small padding', () => {
    render(<Card padding="sm">Small Padding</Card>);
    expect(screen.getByText('Small Padding')).toHaveClass('p-4');
  });

  it('should render with medium padding', () => {
    render(<Card padding="md">Medium Padding</Card>);
    expect(screen.getByText('Medium Padding')).toHaveClass('p-6');
  });

  it('should render with large padding', () => {
    render(<Card padding="lg">Large Padding</Card>);
    expect(screen.getByText('Large Padding')).toHaveClass('p-8');
  });

  it('should render with hover effect when hover is true', () => {
    render(<Card hover>Hoverable</Card>);
    expect(screen.getByText('Hoverable')).toHaveClass('hover:shadow-md', 'hover:border-primary-200', 'transition-all', 'duration-200');
  });

  it('should not render with hover effect when hover is false', () => {
    render(<Card hover={false}>Not Hoverable</Card>);
    expect(screen.getByText('Not Hoverable')).not.toHaveClass('hover:shadow-md');
  });

  it('should have default styles', () => {
    render(<Card>Styled</Card>);
    const card = screen.getByText('Styled');
    expect(card).toHaveClass('bg-white', 'rounded-xl', 'shadow-sm', 'border', 'border-gray-100');
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class">Custom</Card>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });

  it('should render with JSX children', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Paragraph</p>
      </Card>
    );
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
  });
});