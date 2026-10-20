import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClinicalModal, StatusBadge, TelemetryCard } from '@mirage/ui';

describe('ClinicalModal', () => {
  const base = { title: 'Register SKU', onClose: () => undefined };

  it('renders nothing while closed', () => {
    render(
      <ClinicalModal {...base} open={false}>
        body
      </ClinicalModal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders an accessible modal dialog labelled by its title', () => {
    render(
      <ClinicalModal {...base} open subtitle="sub" footer={<button>Save</button>}>
        <p>content</p>
      </ClinicalModal>
    );
    const dialog = screen.getByRole('dialog', { name: 'Register SKU' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByText('sub')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('shows the default 21 CFR badge and allows overriding it', () => {
    const { rerender } = render(
      <ClinicalModal {...base} open>
        x
      </ClinicalModal>
    );
    expect(screen.getByText('21 CFR PART 11 VERIFIED')).toBeInTheDocument();
    rerender(
      <ClinicalModal {...base} open gxpBadge="CUSTOM BADGE">
        x
      </ClinicalModal>
    );
    expect(screen.getByText('CUSTOM BADGE')).toBeInTheDocument();
    expect(screen.queryByText('21 CFR PART 11 VERIFIED')).not.toBeInTheDocument();
  });

  it('calls onClose on Escape, on the close button and on backdrop click', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ClinicalModal title="T" open onClose={onClose}>
        x
      </ClinicalModal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: /close modal/i }));
    expect(onClose).toHaveBeenCalledTimes(2);
    await user.click(document.querySelector('[aria-hidden="true"].fixed')!);
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('does not react to Escape while closed and stops listening after unmount', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender, unmount } = render(
      <ClinicalModal title="T" open={false} onClose={onClose}>
        x
      </ClinicalModal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
    rerender(
      <ClinicalModal title="T" open onClose={onClose}>
        x
      </ClinicalModal>
    );
    unmount();
    await user.keyboard('{Escape}');
    expect(onClose).not.toHaveBeenCalled();
  });

  it('uses slide-over layout in sheet mode and centred layout in dialog mode', () => {
    const { rerender } = render(
      <ClinicalModal {...base} open mode="sheet">
        x
      </ClinicalModal>
    );
    expect(screen.getByRole('dialog').className).toContain('justify-end');
    rerender(
      <ClinicalModal {...base} open mode="dialog">
        x
      </ClinicalModal>
    );
    expect(screen.getByRole('dialog').className).toContain('items-center');
  });
});

describe('StatusBadge', () => {
  it('renders its children as the visible text label', () => {
    render(<StatusBadge variant="excursion">Quarantine Lock</StatusBadge>);
    expect(screen.getByText('Quarantine Lock')).toBeInTheDocument();
  });

  it.each([
    ['in-spec', '#237A26'],
    ['caution', '#B45309'],
    ['excursion', '#D32F2F'],
    ['bioglass', '#2878BC'],
    ['regulatory', 'bg-[#023368]'],
    ['neutral', 'bg-slate-100'],
  ] as const)('applies the %s palette', (variant, token) => {
    render(<StatusBadge variant={variant}>x</StatusBadge>);
    expect(screen.getByText('x').parentElement!.className).toContain(token);
  });

  it('shows an animated ping dot only when pulse is set', () => {
    const { rerender, container } = render(<StatusBadge>x</StatusBadge>);
    expect(container.querySelector('.animate-ping')).toBeNull();
    rerender(<StatusBadge pulse>x</StatusBadge>);
    expect(container.querySelector('.animate-ping')).not.toBeNull();
  });

  it('renders an optional code prefix and forwards extra attributes', () => {
    render(
      <StatusBadge code="gxp" data-testid="badge">
        ok
      </StatusBadge>
    );
    expect(screen.getByText('gxp')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });
});

describe('TelemetryCard', () => {
  it('renders label, value, subtitle, delta and target spec', () => {
    render(
      <TelemetryCard
        label="Depot Temp"
        value="+4.4°C"
        subtitle="Cairo"
        delta="+0.2°C"
        targetSpec="+2°C to +8°C"
      />
    );
    expect(screen.getByText('Depot Temp')).toBeInTheDocument();
    expect(screen.getByText('+4.4°C')).toBeInTheDocument();
    expect(screen.getByText('Cairo')).toBeInTheDocument();
    expect(screen.getByText('+0.2°C')).toBeInTheDocument();
    expect(screen.getByText('+2°C to +8°C')).toBeInTheDocument();
  });

  it('omits optional sections when their props are absent', () => {
    render(<TelemetryCard label="L" value={1} />);
    expect(screen.queryByText('GxP Target Spec')).not.toBeInTheDocument();
    expect(document.querySelector('svg')).toBeNull();
  });

  it('draws a sparkline only when at least two points are provided', () => {
    const { rerender } = render(<TelemetryCard label="L" value={1} sparkline={[3]} />);
    expect(document.querySelector('polyline')).toBeNull();
    rerender(<TelemetryCard label="L" value={1} sparkline={[3, 5, 4]} />);
    const points = document.querySelector('polyline')!.getAttribute('points')!.split(' ');
    expect(points).toHaveLength(3);
  });

  it('does not produce NaN coordinates for a flat series (zero range)', () => {
    render(<TelemetryCard label="L" value={1} sparkline={[5, 5, 5, 5]} />);
    expect(document.querySelector('polyline')!.getAttribute('points')).not.toContain('NaN');
  });

  it('colours the sparkline according to status', () => {
    render(<TelemetryCard label="L" value={1} status="critical" sparkline={[1, 2]} />);
    expect(document.querySelector('polyline')!.getAttribute('stroke')).toBe('#D32F2F');
  });
});
