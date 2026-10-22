import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import B2BAlliancesHubPage from '../app/b2b-leads/page';
import { MOCK_B2B_INQUIRIES } from '@mirage/types';
import { issueSessionToken, setTestSessionCookieForTesting } from '@mirage/db/server';

const TEST_SECRET = 'mirage-admin-test-session-secret-key-at-least-32-chars-long';

describe('B2BAlliancesHubPage (B2B Partnerships & Tenders)', () => {
  beforeEach(() => {
    process.env.MIRAGE_SESSION_SECRET = TEST_SECRET;
    setTestSessionCookieForTesting(
      issueSessionToken(
        {
          sub: 'USR-TEST-OPERATOR',
          email: 'qa.lead@miragepharma.com',
          name: 'QA Lead',
          role: 'super_admin',
        },
        TEST_SECRET
      )
    );
  });
  it('renders the B2B pipeline hub with metrics, archetype filters, and lead table', () => {
    render(<B2BAlliancesHubPage />);

    expect(
      screen.getByRole('heading', {
        name: /Global Licensing, Tenders & Partner Dossier Hub/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Manage regional distribution agreements, hospital formulary tenders/i)
    ).toBeInTheDocument();

    // Verify key action buttons
    expect(
      screen.getByRole('button', { name: /Register Partner Lead/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Export Pipeline CSV/i })
    ).toBeInTheDocument();

    // Verify initial leads are listed in the table
    for (const lead of MOCK_B2B_INQUIRIES.slice(0, 3)) {
      expect(screen.getAllByText(lead.companyName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(new RegExp(lead.referenceCode)).length).toBeGreaterThan(0);
    }
  });

  it('filters alliance leads by partnership archetype', async () => {
    const user = userEvent.setup({ delay: null });
    render(<B2BAlliancesHubPage />);

    // Click "Commercial Distribution" chip
    const commChip = screen.getByRole('button', { name: 'Commercial Distribution' });
    await user.click(commChip);

    const commLeads = MOCK_B2B_INQUIRIES.filter(
      (l) => l.archetype === 'Commercial Distribution'
    );
    if (commLeads.length > 0) {
      expect(screen.getAllByText(commLeads[0].companyName).length).toBeGreaterThan(0);
    }

    // Reset by clicking first "All" button
    const allButtons = screen.getAllByRole('button', { name: 'All' });
    await user.click(allButtons[0]);
  });

  it('opens new partner lead registration modal', async () => {
    const user = userEvent.setup({ delay: null });
    render(<B2BAlliancesHubPage />);

    const newLeadBtn = screen.getByRole('button', { name: /Register Partner Lead/i });
    await user.click(newLeadBtn);

    // Modal should be visible
    expect(
      screen.getByText(/Register New Institutional Alliance \/ Tender Lead/i)
    ).toBeInTheDocument();
  });

  it('opens B2B strategic dossier when clicking Dossier button', async () => {
    const user = userEvent.setup({ delay: null });
    render(<B2BAlliancesHubPage />);

    const dossierButtons = screen.getAllByRole('button', { name: /Dossier/i });
    expect(dossierButtons.length).toBeGreaterThan(0);

    await user.click(dossierButtons[0]);

    // Dossier modal should open
    expect(
      screen.getByText(/B2B Strategic Dossier/i)
    ).toBeInTheDocument();
  });
});
