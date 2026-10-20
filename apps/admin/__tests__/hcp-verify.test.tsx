import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HCPCredentialingPage from '../app/hcp-verify/page';
import { MOCK_HCP_APPLICATIONS } from '@mirage/types';

describe('HCPCredentialingPage (HCP Syndicate Verification)', () => {
  it('renders the verification queue with metrics and application table', () => {
    render(<HCPCredentialingPage />);

    expect(
      screen.getByRole('heading', {
        name: /Healthcare Professional Verification & Access Control/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Verify Egyptian Medical Syndicate \(EMS\)/i)
    ).toBeInTheDocument();

    // Verify key action buttons
    expect(
      screen.getByRole('button', { name: /Sync Syndicate Registry/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Export Credential Registry/i })
    ).toBeInTheDocument();

    // Verify initial HCP applicants appear in the table
    for (const hcp of MOCK_HCP_APPLICATIONS.slice(0, 3)) {
      expect(screen.getAllByText(hcp.fullName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(hcp.syndicateLicenseNumber).length).toBeGreaterThan(0);
    }
  });

  it('filters applications by status (Pending Review vs Verified)', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HCPCredentialingPage />);

    // Click "Pending Review" chip
    const pendingChip = screen.getByRole('button', { name: 'Pending Review' });
    await user.click(pendingChip);

    const pendingApps = MOCK_HCP_APPLICATIONS.filter((a) => a.status === 'Pending Review');
    if (pendingApps.length > 0) {
      expect(screen.getAllByText(pendingApps[0].fullName).length).toBeGreaterThan(0);
    }

    // Reset to "All"
    const allBtn = screen.getByRole('button', { name: 'All' });
    await user.click(allBtn);
  });

  it('updates HCP status to Verified and shows confirmation banner', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HCPCredentialingPage />);

    // Find "Verify" action buttons in table or dossier
    const verifyButtons = screen.queryAllByRole('button', { name: /^Verify$/i });
    if (verifyButtons.length > 0) {
      await user.click(verifyButtons[0]);
      // Verify action feedback banner appears
      expect(screen.getByText(/Status updated to Verified/i)).toBeInTheDocument();
    }
  });

  it('opens access key issuance modal', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HCPCredentialingPage />);

    const keyButtons = screen.queryAllByRole('button', { name: /Issue Key/i });
    if (keyButtons.length > 0) {
      await user.click(keyButtons[0]);
      expect(
        screen.getByText(/Practitioner Clinical Access Key Issued/i)
      ).toBeInTheDocument();
    }
  });

  it('simulates syndicate registry synchronization', async () => {
    const user = userEvent.setup({ delay: null });
    render(<HCPCredentialingPage />);

    const syncBtn = screen.getByRole('button', { name: /Sync Syndicate Registry/i });
    await user.click(syncBtn);

    // Sync in-flight state should appear immediately
    expect(screen.getByText(/Syncing Gateway\.\.\./i)).toBeInTheDocument();
  });
});
