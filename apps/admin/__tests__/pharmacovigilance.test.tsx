import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PharmacovigilancePage from '../app/pharmacovigilance/page';
import { MOCK_ADVERSE_EVENTS } from '@mirage/types';

describe('PharmacovigilancePage (ADR Triage & CIOMS-I)', () => {
  it('renders the safety triage desk, telemetry metrics, and adverse event table', () => {
    render(<PharmacovigilancePage />);

    expect(
      screen.getByRole('heading', {
        name: /Adverse Drug Reaction \(ADR\) & Safety Triage Hub/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Evaluate post-marketing safety reports, assign MedDRA Preferred Terms/i)
    ).toBeInTheDocument();

    // Verify key action button
    expect(
      screen.getByRole('button', { name: /Official CIOMS-I Form/i })
    ).toBeInTheDocument();

    // Verify initial mock adverse event reports appear in table
    for (const report of MOCK_ADVERSE_EVENTS.slice(0, 3)) {
      expect(screen.getAllByText(report.caseNumber).length).toBeGreaterThan(0);
      expect(screen.getAllByText(report.productName).length).toBeGreaterThan(0);
    }
  });

  it('filters adverse event cases by seriousness classification', async () => {
    const user = userEvent.setup({ delay: null });
    render(<PharmacovigilancePage />);

    // Click "Critical - Expedited 15-Day" chip
    const critChip = screen.getByRole('button', { name: 'Critical - Expedited 15-Day' });
    await user.click(critChip);

    const criticalCases = MOCK_ADVERSE_EVENTS.filter(
      (c) => c.seriousness === 'Critical - Expedited 15-Day'
    );
    if (criticalCases.length > 0) {
      expect(screen.getAllByText(criticalCases[0].caseNumber).length).toBeGreaterThan(0);
    }
  });

  it('opens WHO CIOMS-I standard adverse reaction form modal', async () => {
    const user = userEvent.setup({ delay: null });
    render(<PharmacovigilancePage />);

    const ciomsBtn = screen.getByRole('button', { name: /Official CIOMS-I Form/i });
    await user.click(ciomsBtn);

    // Modal should be visible
    expect(
      screen.getByText(/WHO CIOMS-I Standard Adverse Reaction Reporting Form/i)
    ).toBeInTheDocument();
  });

  it('opens safety incident dossier when clicking Triage button', async () => {
    const user = userEvent.setup({ delay: null });
    render(<PharmacovigilancePage />);

    // Click the exact row action button "Triage" (not "Open Triage" filter button)
    const triageButtons = screen.getAllByRole('button', { name: /^Triage$/i });
    expect(triageButtons.length).toBeGreaterThan(0);

    await user.click(triageButtons[0]);

    // Safety incident dossier modal should open
    expect(
      screen.getByText(/Safety Incident Dossier/i)
    ).toBeInTheDocument();
  });
});
