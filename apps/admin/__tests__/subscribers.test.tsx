import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewsletterDispatchPage from '../app/subscribers/page';
import { MOCK_SUBSCRIBERS } from '@mirage/types';

describe('NewsletterDispatchPage (Audience & Scientific Broadcasts)', () => {
  it('renders the audience intelligence hub with metrics, filters, and subscribers', () => {
    render(<NewsletterDispatchPage />);

    expect(
      screen.getByRole('heading', {
        name: /Audience Intelligence & Scientific Broadcast Center/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Segment medical practitioners and patients to dispatch clinical monographs/i)
    ).toBeInTheDocument();

    // Key action buttons
    expect(
      screen.getByRole('button', { name: /Compose Clinical Bulletin/i })
    ).toBeInTheDocument();

    // Verify initial subscribers are rendered in the table
    for (const sub of MOCK_SUBSCRIBERS.slice(0, 3)) {
      expect(screen.getAllByText(sub.fullName).length).toBeGreaterThan(0);
      expect(screen.getAllByText(sub.email).length).toBeGreaterThan(0);
    }
  });

  it('filters subscribers by professional role', async () => {
    const user = userEvent.setup({ delay: null });
    render(<NewsletterDispatchPage />);

    // Click "Physician" role filter chip
    const physChip = screen.getByRole('button', { name: 'Physician' });
    await user.click(physChip);

    const physicians = MOCK_SUBSCRIBERS.filter((s) => s.role === 'Physician');
    if (physicians.length > 0) {
      expect(screen.getAllByText(physicians[0].fullName).length).toBeGreaterThan(0);
    }

    // Reset to "All"
    const allButtons = screen.getAllByRole('button', { name: 'All' });
    await user.click(allButtons[0]);
  });

  it('opens clinical broadcast composer modal and dispatches campaign', async () => {
    const user = userEvent.setup({ delay: null });
    render(<NewsletterDispatchPage />);

    // Open composer modal
    const composeBtn = screen.getByRole('button', { name: /Compose Clinical Bulletin/i });
    await user.click(composeBtn);

    // Verify modal is visible
    expect(
      screen.getByText(/Compose Scientific Clinical Broadcast/i)
    ).toBeInTheDocument();

    // Submit broadcast dispatch
    const dispatchBtn = screen.getByRole('button', { name: /Dispatch Broadcast Now/i });
    await user.click(dispatchBtn);

    // Modal should close
    expect(
      screen.queryByText(/Compose Scientific Clinical Broadcast/i)
    ).not.toBeInTheDocument();

    // Success banner should appear
    expect(
      screen.getByText(/successfully dispatched/i)
    ).toBeInTheDocument();
  });

  it('opens subscriber profile slide-over sheet', async () => {
    const user = userEvent.setup({ delay: null });
    render(<NewsletterDispatchPage />);

    const profileButtons = screen.getAllByRole('button', { name: /Profile/i });
    expect(profileButtons.length).toBeGreaterThan(0);

    await user.click(profileButtons[0]);

    // Subscriber dossier sheet should open
    expect(
      screen.getByText(/Subscriber Dossier/i)
    ).toBeInTheDocument();
  });
});
