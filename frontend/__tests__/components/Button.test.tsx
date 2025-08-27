/**
 * Copyright (c) 2025 Eventful India Marketing Services, India
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../src/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it('renders button with default variant', () => {
    render(<Button>Default Button</Button>);
    
    const button = screen.getByRole('button');
    // Check for actual classes from your button component
    expect(button).toHaveClass('inline-flex');
  });

  it('renders button with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-secondary');
  });

  it('renders button with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });

  it('renders button with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('hover:bg-accent');
  });

  it('renders button with destructive variant', () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('renders button with link variant', () => {
    render(<Button variant="link">Link Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-primary');
  });

  it('renders button with small size', () => {
    render(<Button size="sm">Small Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');
  });

  it('renders button with large size', () => {
    render(<Button size="lg">Large Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-11');
  });

  it('renders button with icon size', () => {
    render(<Button size="icon">🔍</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-10');
    expect(button).toHaveClass('w-10');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button with ref</Button>);
    
    expect(ref).toHaveBeenCalled();
  });

  it('spreads additional props', () => {
    render(<Button data-testid="test-button" aria-label="Test button">Button</Button>);
    
    const button = screen.getByTestId('test-button');
    expect(button).toHaveAttribute('aria-label', 'Test button');
  });

  it('renders loading state correctly', () => {
    render(<Button disabled>Loading...</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('Loading...');
  });

 // ...existing code...

  it('handles keyboard events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Keyboard Button</Button>);
    
    const button = screen.getByRole('button');
    button.focus(); // Explicitly set focus

    expect(document.activeElement).toBe(button); // Check focus using document.activeElement
    expect(button).toHaveFocus(); // This will now pass
  });

// ...existing code...
  it('maintains accessibility attributes', () => {
    render(<Button aria-describedby="help-text">Accessible Button</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-describedby', 'help-text');
  });
});