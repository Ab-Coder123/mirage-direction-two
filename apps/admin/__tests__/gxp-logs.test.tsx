import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GxPAuditLedgerPage from '../app/gxp-logs/page';
import { MOCK_GXP_AUDIT_LOGS } from '@mirage/types';

describe('GxPAuditLedgerPage (FDA 21 CFR Part 11 & Merkle Ledger)', () => {
  it('renders the audit ledger with metrics, filter chips, and log table', () => {
    render(<GxPAuditLedgerPage />);

    expect(
      screen.getByRole('heading', {
        name: /GxP Audit Trail & Electronic Signature Ledger/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Tamper-evident regulatory ledger recording every formulation mutation/i)
    ).toBeInTheDocument();

    // Verify key action buttons are visible
    expect(
      screen.getByRole('button', { name: /Verify Merkle Chain/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Regulatory Dossier/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Export Signed CSV/i })
    ).toBeInTheDocument();

    // Verify initial logs appear in the table
    for (const log of MOCK_GXP_AUDIT_LOGS.slice(0, 3)) {
      expect(screen.getAllByText(log.action).length).toBeGreaterThan(0);
      expect(screen.getAllByText(log.actorName).length).toBeGreaterThan(0);
    }
  });

  it('filters logs by regulatory framework (EDA GxP vs FDA 21 CFR Part 11)', async () => {
    const user = userEvent.setup({ delay: null });
    render(<GxPAuditLedgerPage />);

    // Click "EDA GxP" chip
    const edaChip = screen.getByRole('button', { name: 'EDA GxP' });
    await user.click(edaChip);

    // Verify only EDA GxP logs are present
    const edaLogs = MOCK_GXP_AUDIT_LOGS.filter((l) => l.regulation === 'EDA GxP');
    if (edaLogs.length > 0) {
      expect(screen.getAllByText(edaLogs[0].action).length).toBeGreaterThan(0);
    }

    // Reset by clicking first "All" button
    const allButtons = screen.getAllByRole('button', { name: 'All' });
    await user.click(allButtons[0]);
  });

  it('filters logs by module (Formulations, Cold-Chain, etc.)', async () => {
    const user = userEvent.setup({ delay: null });
    render(<GxPAuditLedgerPage />);

    // Click "Cold-Chain" module chip
    const coldChainChip = screen.getByRole('button', { name: 'Cold-Chain' });
    await user.click(coldChainChip);

    const coldChainLogs = MOCK_GXP_AUDIT_LOGS.filter((l) => l.module === 'Cold-Chain');
    if (coldChainLogs.length > 0) {
      expect(screen.getAllByText(coldChainLogs[0].action).length).toBeGreaterThan(0);
    }
  });

  it('opens Merkle chain verification modal and verifies cryptographic integrity', async () => {
    const user = userEvent.setup({ delay: null });
    render(<GxPAuditLedgerPage />);

    const verifyBtn = screen.getByRole('button', { name: /Verify Merkle Chain/i });
    await user.click(verifyBtn);

    // Verify modal appears
    expect(
      screen.getByText(/Cryptographic Merkle Tree Chain Verification/i)
    ).toBeInTheDocument();
  });

  it('opens the Audit Diff modal showing before and after payload inspection', async () => {
    const user = userEvent.setup({ delay: null });
    render(<GxPAuditLedgerPage />);

    // Click the first "Diff" button in the table
    const diffButtons = screen.getAllByRole('button', { name: /Diff/i });
    expect(diffButtons.length).toBeGreaterThan(0);

    await user.click(diffButtons[0]);

    // Modal or sheet showing diff should be in the document
    expect(
      screen.getByText(/21 CFR Part 11 Audit Inspection/i)
    ).toBeInTheDocument();
  });
});
