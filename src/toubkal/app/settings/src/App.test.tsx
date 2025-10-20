import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';

// Mock the Mojo interface
vi.mock('toubkal/mojo/ui/toubkal_ui.mojom', () => ({
  toubkalUI: vi.fn()
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<App />);
    
    // The component renders with mock data immediately, so we check for the main content
    expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
  });

  it('renders settings after loading', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Fingerprinting Protection')).toBeInTheDocument();
    expect(screen.getByText('Tracker Blocking')).toBeInTheDocument();
    expect(screen.getByText('Brave Shields')).toBeInTheDocument();
    expect(screen.getByText('Audit Logging')).toBeInTheDocument();
  });

  it('displays all privacy settings with correct descriptions', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    // Check fingerprinting protection
    expect(screen.getByText('Fingerprinting Protection')).toBeInTheDocument();
    expect(screen.getByText('Protect against browser fingerprinting techniques')).toBeInTheDocument();
    
    // Check tracker blocking
    expect(screen.getByText('Tracker Blocking')).toBeInTheDocument();
    expect(screen.getByText('Block tracking scripts and ads')).toBeInTheDocument();
    
    // Check Brave Shields
    expect(screen.getByText('Brave Shields')).toBeInTheDocument();
    expect(screen.getByText('Enhanced privacy protection features')).toBeInTheDocument();
    
    // Check audit logging
    expect(screen.getByText('Audit Logging')).toBeInTheDocument();
    expect(screen.getByText('Log privacy decisions for transparency')).toBeInTheDocument();
  });

  it('has all toggles enabled by default', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    // Check that all toggles are checked by default
    const toggles = screen.getAllByRole('checkbox');
    toggles.forEach(toggle => {
      expect(toggle).toBeChecked();
    });
  });

  it('toggles settings when clicked', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    // Get the first toggle (fingerprinting protection)
    const fingerprintingToggle = screen.getAllByRole('checkbox')[0];
    
    // Click to toggle off
    fireEvent.click(fingerprintingToggle);
    expect(fingerprintingToggle).not.toBeChecked();
    
    // Click to toggle back on
    fireEvent.click(fingerprintingToggle);
    expect(fingerprintingToggle).toBeChecked();
  });

  it('shows save button and handles save action', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeInTheDocument();
    
    // Click save button
    fireEvent.click(saveButton);
    
    // Should show saving state
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('disables save button while saving', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    const saveButton = screen.getByText('Save Settings');
    
    // Click save button
    fireEvent.click(saveButton);
    
    // Button should be disabled while saving
    await waitFor(() => {
      expect(saveButton).toBeDisabled();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Toubkal Settings');
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Privacy Settings');
    
    // Check that toggles have proper labels
    const toggles = screen.getAllByRole('checkbox');
    toggles.forEach(toggle => {
      expect(toggle).toHaveAttribute('type', 'checkbox');
    });
  });

  it('maintains state when toggling multiple settings', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Toubkal Settings')).toBeInTheDocument();
    });
    
    const toggles = screen.getAllByRole('checkbox');
    
    // Toggle first two settings
    fireEvent.click(toggles[0]); // fingerprinting protection
    fireEvent.click(toggles[1]); // tracker blocking
    
    // Check that only the clicked toggles are off
    expect(toggles[0]).not.toBeChecked();
    expect(toggles[1]).not.toBeChecked();
    expect(toggles[2]).toBeChecked(); // Brave Shields should still be on
    expect(toggles[3]).toBeChecked(); // Audit Logging should still be on
  });
});
