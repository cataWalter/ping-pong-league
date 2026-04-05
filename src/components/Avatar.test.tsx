import { render, screen } from '@testing-library/react';
import React from 'react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('should render with initials when no src', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render with image when src provided', () => {
    render(<Avatar name="John Doe" src="https://example.com/avatar.jpg" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    expect(img).toHaveAttribute('alt', 'John Doe');
  });

  it('should render with small size', () => {
    render(<Avatar name="Test" size="sm" />);
    expect(screen.getByText('T')).toHaveClass('w-8', 'h-8', 'text-sm');
  });

  it('should render with medium size (default)', () => {
    render(<Avatar name="Test" />);
    expect(screen.getByText('T')).toHaveClass('w-10', 'h-10', 'text-base');
  });

  it('should render with large size', () => {
    render(<Avatar name="Test" size="lg" />);
    expect(screen.getByText('T')).toHaveClass('w-12', 'h-12', 'text-lg');
  });

  it('should render with extra large size', () => {
    render(<Avatar name="Test" size="xl" />);
    expect(screen.getByText('T')).toHaveClass('w-16', 'h-16', 'text-2xl');
  });

  it('should apply custom className', () => {
    render(<Avatar name="Test" className="custom-class" />);
    expect(screen.getByText('T').parentElement).toHaveClass('custom-class');
  });

  it('should not show rank when showRank is false', () => {
    render(<Avatar name="Test" rank={1} showRank={false} />);
    expect(screen.queryByText('1')).not.toBeInTheDocument();
  });

  it('should show rank badge when rank is 1', () => {
    render(<Avatar name="Test" rank={1} showRank={true} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('1')).toHaveClass('bg-yellow-100', 'text-yellow-800', 'ring-yellow-400');
  });

  it('should show rank badge when rank is 2', () => {
    render(<Avatar name="Test" rank={2} showRank={true} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('2')).toHaveClass('bg-gray-100', 'text-gray-800', 'ring-gray-400');
  });

  it('should show rank badge when rank is 3', () => {
    render(<Avatar name="Test" rank={3} showRank={true} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('bg-orange-100', 'text-orange-800', 'ring-orange-400');
  });

  it('should not show rank badge when rank is greater than 3', () => {
    render(<Avatar name="Test" rank={4} showRank={true} />);
    expect(screen.queryByText('4')).not.toBeInTheDocument();
  });

  it('should extract first letter from single name', () => {
    render(<Avatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should extract first two initials from multiple names', () => {
    render(<Avatar name="John Michael Doe" />);
    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('should convert initials to uppercase', () => {
    render(<Avatar name="john doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should have rounded-full class', () => {
    render(<Avatar name="Test" />);
    // The inner div (the avatar circle) has rounded-full
    expect(screen.getByText('T')).toHaveClass('rounded-full');
  });

  it('should have primary colors for initials avatar', () => {
    render(<Avatar name="Test" />);
    expect(screen.getByText('T')).toHaveClass('bg-primary-100', 'text-primary-700');
  });

  it('should have relative positioning', () => {
    render(<Avatar name="Test" />);
    // The outer wrapper has relative positioning
    expect(screen.getByText('T').parentElement).toHaveClass('relative');
  });
});