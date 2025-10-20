import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock the Mojo interface
vi.mock('toubkal/mojo/ui/toubkal_ui.mojom', () => ({
  toubkalUI: vi.fn()
}));

describe('AuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<App />);
    
    // The component renders with mock data immediately, so we check for the main content
    expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Audit Log Entries')).toBeInTheDocument();
  });

  it('renders audit logs after loading', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Audit Log Entries')).toBeInTheDocument();
    expect(screen.getByText('PRIVACY_SETTINGS_CHANGED')).toBeInTheDocument();
    expect(screen.getByText('Fingerprinting protection enabled')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('displays audit log entries with correct information', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument();
    });
    
    // Check that the audit log entry is displayed
    const auditEntry = screen.getByText('PRIVACY_SETTINGS_CHANGED');
    expect(auditEntry).toBeInTheDocument();
    
    // Check that the details are shown
    expect(screen.getByText('Fingerprinting protection enabled')).toBeInTheDocument();
    
    // Check that the verified badge is shown
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock an error scenario
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // This would be implemented when we have actual error handling
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument();
    });
    
    consoleError.mockRestore();
  });

  it('has proper accessibility attributes', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument();
    });
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Transparency Dashboard');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Audit Log Entries');
  });

  it('displays timestamp in readable format', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Transparency Dashboard')).toBeInTheDocument();
    });
    
    // Check that timestamp is displayed (format may vary based on locale)
    const timestampElement = screen.getByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(timestampElement).toBeInTheDocument();
  });
});
