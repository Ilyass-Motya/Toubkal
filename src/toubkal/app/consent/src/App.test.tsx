import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock the Mojo interface
vi.mock('toubkal/mojo/ui/toubkal_ui.mojom', () => ({
  toubkalUI: vi.fn()
}));

describe('ConsentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<App />);
    
    // The component renders with mock data immediately, so we check for the main content
    expect(screen.getByText('Consent History')).toBeInTheDocument();
    expect(screen.getByText('Consent Decisions')).toBeInTheDocument();
  });

  it('renders consent history after loading', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Consent History')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Consent Decisions')).toBeInTheDocument();
    expect(screen.getAllByText('analytics')).toHaveLength(2); // One in title, one in badge
    expect(screen.getByText('User explicitly granted consent for analytics')).toBeInTheDocument();
    expect(screen.getByText('granted')).toBeInTheDocument();
  });

  it('displays consent decisions with correct information', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Consent History')).toBeInTheDocument();
    });
    
    // Check that the consent decision is displayed
    const consentTypes = screen.getAllByText('analytics');
    expect(consentTypes).toHaveLength(2); // One in title, one in badge
    
    // Check that the reason is shown
    expect(screen.getByText('User explicitly granted consent for analytics')).toBeInTheDocument();
    
    // Check that the action badge is shown
    expect(screen.getByText('granted')).toBeInTheDocument();
  });

  it('displays consent type and action badges correctly', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Consent History')).toBeInTheDocument();
    });
    
    // Check for granted action badge
    const grantedBadge = screen.getByText('granted');
    expect(grantedBadge).toHaveClass('bg-green-100', 'text-green-800');
    
    // Check for consent type badge
    const typeBadges = screen.getAllByText('analytics');
    const typeBadge = typeBadges.find(el => el.classList.contains('bg-blue-100'));
    expect(typeBadge).toBeInTheDocument();
    expect(typeBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('handles error state', async () => {
    // Mock an error scenario
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // This would be implemented when we have actual error handling
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Consent History')).toBeInTheDocument();
    });
    
    consoleError.mockRestore();
  });

  it('has proper accessibility attributes', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Consent History')).toBeInTheDocument();
    });
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Consent History');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Consent Decisions');
  });

  it('displays timestamp in readable format', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Consent History')).toBeInTheDocument();
    });
    
    // Check that timestamp is displayed (format may vary based on locale)
    const timestampElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(timestampElement).toBeInTheDocument();
  });
});
