import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormulationStudioPage from '../app/products/page';
import { MOCK_PRODUCTS } from '@mirage/types';

describe('FormulationStudioPage (Admin Products Management)', () => {
  it('renders the formulation studio with initial products and active monograph', () => {
    render(<FormulationStudioPage />);

    expect(
      screen.getByRole('heading', {
        name: /Product Catalog & Formulation Lifecycle Studio/i,
      })
    ).toBeInTheDocument();

    // Verify initial mock products are listed in sidebar / table
    for (const prod of MOCK_PRODUCTS) {
      expect(screen.getAllByText(prod.name).length).toBeGreaterThan(0);
    }

    // Default active product monograph is first product
    expect(screen.getAllByText(MOCK_PRODUCTS[0].subtitle).length).toBeGreaterThan(0);
  });

  it('switches between studio tabs (general, supplement, materials, evidence, serialization)', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    // Click '2. Supplement Facts' tab
    const suppTab = screen.getByRole('button', { name: /2\.\s*Supplement Facts/i });
    await user.click(suppTab);
    expect(screen.getByText(/New Active Compound Name/i)).toBeInTheDocument();

    // Click '3. Raw Materials' tab
    const materialsTab = screen.getByRole('button', { name: /3\.\s*Raw Materials/i });
    await user.click(materialsTab);
    expect(screen.getAllByText(/Lactobacillus rhamnosus GG/i).length).toBeGreaterThan(0);

    // Click '4. Clinical Studies' tab
    const evidenceTab = screen.getByRole('button', { name: /4\.\s*Clinical Studies/i });
    await user.click(evidenceTab);
    expect(
      screen.getByText(/PubMed \/ National Library of Medicine/i)
    ).toBeInTheDocument();

    // Click '5. GS1 2D DataMatrix' tab
    const serialTab = screen.getByRole('button', { name: /5\.\s*GS1 2D DataMatrix/i });
    await user.click(serialTab);
    expect(
      screen.getByText(/GS1 Healthcare 2D DataMatrix Serialization Simulator/i)
    ).toBeInTheDocument();
  });

  it('filters product list by category chips', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    // Select category 'Gastrointestinal & Immunity'
    const giChip = screen.getByRole('button', { name: 'Gastrointestinal & Immunity' });
    await user.click(giChip);

    // SymPDCA is in Gastrointestinal & Immunity
    expect(screen.getAllByText('SymPDCA').length).toBeGreaterThan(0);

    // NovaMirage is in Acid Suppression (P-CAB), not GI
    const filterButtons = screen.getAllByRole('button');
    const novaButton = filterButtons.find(
      (b) => b.textContent?.includes('NOVAMIRAGE 20MG') && b.className.includes('w-full')
    );
    expect(novaButton).toBeUndefined();
  });

  it('toggles pack size stock availability and triggers GxP notification', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    // Look for pack stock indicator
    expect(screen.getByText(/● In Stock \(Cryo-Cleared\)/i)).toBeInTheDocument();

    // Find the toggle button
    const toggleBtn = screen.getByRole('button', { name: /^Toggle$/i });
    await user.click(toggleBtn);

    // Verify stock switched to Out of Stock
    expect(screen.getByText(/○ Out of Stock/i)).toBeInTheDocument();

    // Verify toast notification appears
    expect(
      screen.getByText(/Updated pack size inventory state & logged to GxP Ledger/i)
    ).toBeInTheDocument();

    // Click toggle again to restore
    await user.click(toggleBtn);
    expect(screen.getByText(/● In Stock \(Cryo-Cleared\)/i)).toBeInTheDocument();
  });

  it('adds an active compound in the Supplement Facts tab', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    // Switch to Supplement Facts tab
    await user.click(screen.getByRole('button', { name: /2\.\s*Supplement Facts/i }));

    // Form inputs
    const compoundNameInput = screen.getByPlaceholderText(/e\.g\., Chelated Zinc Bisglycinate/i);
    const amountInput = screen.getByPlaceholderText(/e\.g\., 25 mg/i);
    const dvInput = screen.getByPlaceholderText(/227%/i);
    const submitBtn = screen.getByRole('button', { name: /\+ Add Compound/i });

    await user.type(compoundNameInput, 'Coenzyme Q10');
    await user.type(amountInput, '100 mg');
    await user.type(dvInput, '†');

    await user.click(submitBtn);

    // Verify new ingredient is in the table
    expect(screen.getByText('Coenzyme Q10')).toBeInTheDocument();
    expect(screen.getByText('100 mg')).toBeInTheDocument();

    // Verify toast notification
    expect(screen.getByText(/Added compound "Coenzyme Q10"/i)).toBeInTheDocument();

    // Form should be reset
    expect(compoundNameInput).toHaveValue('');
    expect(amountInput).toHaveValue('');
  });

  it('creates a new formulation via the registration modal', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    // Click "+ Register New Formulation" header button
    const newSkuBtn = screen.getByRole('button', { name: /\+ Register New Formulation/i });
    await user.click(newSkuBtn);

    // Modal should be visible
    expect(
      screen.getByText(/Register New Commercial Formulation SKU/i)
    ).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText(/e\.g\., Osteo-Guard D3 \+ K2/i);
    const subtitleInput = screen.getByPlaceholderText(
      /e\.g\., Synergistic Bone Matrix & Arterial Calcium Transport/i
    );
    const arabicInput = screen.getByDisplayValue(/مكمل غذائي معتمد/i);

    await user.type(nameInput, 'Curcumin Bio-Curc 500');
    await user.type(subtitleInput, 'Standardized 95% Curcuminoids with Piperine');
    await user.clear(arabicInput);
    await user.type(arabicInput, 'كركمين فائق الامتصاص');

    // Submit modal form
    const registerBtn = screen.getByRole('button', { name: /Sign & Register SKU/i });
    await user.click(registerBtn);

    // Modal should close
    expect(
      screen.queryByText(/Register New Commercial Formulation SKU/i)
    ).not.toBeInTheDocument();

    // New SKU should be active and displayed in monograph
    expect(screen.getAllByText('Curcumin Bio-Curc 500').length).toBeGreaterThan(0);
    expect(
      screen.getByText('Standardized 95% Curcuminoids with Piperine')
    ).toBeInTheDocument();
    expect(screen.getAllByText('كركمين فائق الامتصاص').length).toBeGreaterThan(0);
  });

  it('rejects formulation creation when required SKU name is empty', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    // Open modal
    await user.click(screen.getByRole('button', { name: /\+ Register New Formulation/i }));

    const registerBtn = screen.getByRole('button', { name: /Sign & Register SKU/i });
    // Click with empty name
    await user.click(registerBtn);

    // Modal remains open because required validation prevented submit
    expect(
      screen.getByText(/Register New Commercial Formulation SKU/i)
    ).toBeInTheDocument();
  });

  it('renders serialization GS1 2D DataMatrix parameters', async () => {
    const user = userEvent.setup({ delay: null });
    render(<FormulationStudioPage />);

    await user.click(screen.getByRole('button', { name: /5\.\s*GS1 2D DataMatrix/i }));

    expect(screen.getByDisplayValue('BATCH-N4B-2026-108')).toBeInTheDocument();
    expect(screen.getByDisplayValue('06224009184012')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SN-994028174')).toBeInTheDocument();
    expect(
      screen.getByText(/GS1 Healthcare 2D DataMatrix Serialization Simulator/i)
    ).toBeInTheDocument();
  });
});
