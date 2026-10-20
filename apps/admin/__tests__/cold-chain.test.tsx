import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColdChainTelemetryPage from '../app/cold-chain/page';
import { MOCK_COLD_CHAIN_DEPOTS } from '@mirage/types';

describe('ColdChainTelemetryPage (IoT Cryo-Depot Telemetry & Excursions)', () => {
  it('renders the cold-chain telemetry dashboard and depot status cards', () => {
    render(<ColdChainTelemetryPage />);

    expect(
      screen.getByRole('heading', {
        name: /Cryo-Depot IoT Telemetry & Thermal Excursion Hub/i,
      })
    ).toBeInTheDocument();

    // Verify all depots are rendered in the depot selection strip
    for (const depot of MOCK_COLD_CHAIN_DEPOTS) {
      expect(screen.getAllByText(depot.location).length).toBeGreaterThan(0);
      expect(screen.getAllByText(depot.code).length).toBeGreaterThan(0);
    }

    // Default stream state is LIVE
    expect(screen.getByText(/IoT Stream: LIVE \(4\.5s\)/i)).toBeInTheDocument();
  });

  it('switches between regional depots when clicking a depot selector card', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ColdChainTelemetryPage />);

    // Click the Alexandria depot button
    const alexBtn = screen.getByRole('button', { name: /ALX-PORT-02/i });
    await user.click(alexBtn);

    // Selected depot details should reflect Alexandria
    expect(screen.getAllByText('ALX-PORT-02').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Alexandria Coastal Distribution Center/i).length).toBeGreaterThan(0);
  });

  it('toggles the live telemetry stream paused and resumed', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ColdChainTelemetryPage />);

    const streamBtn = screen.getByText(/IoT Stream: LIVE \(4\.5s\)/i);
    await user.click(streamBtn);

    // Should pause
    expect(screen.getByText(/IoT Stream: PAUSED/i)).toBeInTheDocument();

    // Click again to resume
    await user.click(screen.getByText(/IoT Stream: PAUSED/i));
    expect(screen.getByText(/IoT Stream: LIVE \(4\.5s\)/i)).toBeInTheDocument();
  });

  it('simulates a thermal excursion (+9.4°C), flags critical alert, and locks batches in quarantine', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ColdChainTelemetryPage />);

    // Click "Simulate Thermal Excursion (+9.4°C)"
    const simBtn = screen.getByRole('button', {
      name: /Simulate Thermal Excursion \(\+9\.4°C\)/i,
    });
    await user.click(simBtn);

    // Verify critical alert banner appeared
    expect(
      screen.getByText(/CRITICAL GxP THERMAL EXCURSION DETECTED/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/breached \+8\.0°C Upper Limit/i)
    ).toBeInTheDocument();

    // Verify batches inside the breached depot are quarantined
    expect(screen.getAllByText('Quarantine Lock').length).toBeGreaterThan(0);
  });

  it('executes a 21 CFR Part 11 electronic CAPA sign-off and restores depot temperature to +4.4°C', async () => {
    const user = userEvent.setup({ delay: null });
    render(<ColdChainTelemetryPage />);

    // First trigger an excursion so the depot is in critical state
    await user.click(
      screen.getByRole('button', {
        name: /Simulate Thermal Excursion \(\+9\.4°C\)/i,
      })
    );
    expect(screen.getAllByText('Quarantine Lock').length).toBeGreaterThan(0);

    // Open CAPA Sign-Off modal
    const capaBtn = screen.getByRole('button', {
      name: /Sign 21 CFR Part 11 CAPA/i,
    });
    await user.click(capaBtn);

    // Verify modal is open
    expect(
      screen.getByText(/21 CFR Part 11 Electronic Investigator CAPA Sign-Off/i)
    ).toBeInTheDocument();

    // Verify prefilled investigator name or type new
    const investigatorInput = screen.getByDisplayValue('Eng. Karim Hassan');
    expect(investigatorInput).toBeInTheDocument();

    // Submit electronic sign-off
    const submitBtn = screen.getByRole('button', {
      name: /Execute Electronic Sign-Off & Restore \+4\.4°C/i,
    });
    await user.click(submitBtn);

    // Modal should close
    expect(
      screen.queryByText(/21 CFR Part 11 Electronic Investigator CAPA Sign-Off/i)
    ).not.toBeInTheDocument();

    // Excursion banner should disappear
    expect(
      screen.queryByText(/CRITICAL GxP THERMAL EXCURSION DETECTED/i)
    ).not.toBeInTheDocument();

    // Resolution banner should appear
    expect(
      screen.getByText(/Signed 21 CFR Part 11 CAPA by Eng\. Karim Hassan/i)
    ).toBeInTheDocument();

    // Quarantined batches should be released
    expect(screen.queryByText('Quarantine Lock')).not.toBeInTheDocument();
    expect(screen.getAllByText('Released').length).toBeGreaterThan(0);
  });
});
