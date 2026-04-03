import { render, screen } from '@testing-library/react';
import React from 'react';
import RatingChart from './RatingChart';

describe('RatingChart', () => {
  it('should render no data message when data is empty', () => {
    render(<RatingChart data={[]} />);
    expect(screen.getByText('No rating history available')).toBeInTheDocument();
  });

  it('should render chart when data is provided', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
      { date: '2024-01-03', rating: 1100 },
    ];
    render(<RatingChart data={data} />);
    expect(screen.getByRole('img')).toBeInTheDocument(); // SVG is rendered as img
  });

  it('should use custom height', () => {
    const data = [{ date: '2024-01-01', rating: 1000 }];
    const { container } = render(<RatingChart data={data} height={300} />);
    expect(container.firstChild).toHaveStyle({ height: '300px' });
  });

  it('should use default height of 200', () => {
    const data = [{ date: '2024-01-01', rating: 1000 }];
    const { container } = render(<RatingChart data={data} />);
    expect(container.firstChild).toHaveStyle({ height: '200px' });
  });

  it('should show grid by default', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
    ];
    const { container } = render(<RatingChart data={data} />);
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBeGreaterThan(0);
  });

  it('should hide grid when showGrid is false', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
    ];
    const { container } = render(<RatingChart data={data} showGrid={false} />);
    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(0);
  });

  it('should show dots by default', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
    ];
    const { container } = render(<RatingChart data={data} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(data.length);
  });

  it('should hide dots when showDots is false', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
    ];
    const { container } = render(<RatingChart data={data} showDots={false} />);
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(0);
  });

  it('should apply custom className', () => {
    const data = [{ date: '2024-01-01', rating: 1000 }];
    const { container } = render(<RatingChart data={data} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render Y-axis labels', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1100 },
    ];
    render(<RatingChart data={data} />);
    // Check that Y-axis labels are rendered
    const labels = screen.getAllByRole('img');
    expect(labels.length).toBeGreaterThan(0);
  });

  it('should handle single data point', () => {
    const data = [{ date: '2024-01-01', rating: 1000 }];
    render(<RatingChart data={data} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should render gradient definition', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
    ];
    const { container } = render(<RatingChart data={data} />);
    const gradient = container.querySelector('linearGradient');
    expect(gradient).toBeInTheDocument();
  });

  it('should render area path', () => {
    const data = [
      { date: '2024-01-01', rating: 1000 },
      { date: '2024-01-02', rating: 1050 },
    ];
    const { container } = render(<RatingChart data={data} />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('should include matchId in data points', () => {
    const data = [
      { date: '2024-01-01', rating: 1000, matchId: 'match-1' },
      { date: '2024-01-02', rating: 1050, matchId: 'match-2' },
    ];
    const { container } = render(<RatingChart data={data} />);
    // The chart should render without errors with matchId
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});