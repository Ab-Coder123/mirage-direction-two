import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductsPage from '../app/products/page';
import ProductDetailPage, { generateStaticParams } from '../app/products/[slug]/page';
import { ProductHeroSlider } from '../components/products/ProductHeroSlider';
import { MOCK_PRODUCTS } from '@mirage/types';

describe('Public Website Products Catalog & Details (apps/web)', () => {
  describe('ProductsPage (Catalog Listing)', () => {
    it('renders the public product catalog with header banner and product cards', () => {
      render(<ProductsPage />);

      expect(
        screen.getByRole('heading', { name: /^PRODUCTS$/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We help you to live a healthy life through clinical formulation purity/i)
      ).toBeInTheDocument();

      // Formulations count pill
      expect(
        screen.getByText(new RegExp(`${MOCK_PRODUCTS.length} Registered Formulations`, 'i'))
      ).toBeInTheDocument();

      // Both products rendered
      for (const prod of MOCK_PRODUCTS) {
        expect(screen.getAllByText(prod.name).length).toBeGreaterThan(0);
      }
    });

    it('filters formulations by category tabs', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProductsPage />);

      // Filter by 'Gastrointestinal & Immunity'
      const giBtn = screen.getByRole('button', { name: /Gastrointestinal & Immunity/i });
      await user.click(giBtn);

      // SymPDCA is shown
      expect(screen.getAllByText('SymPDCA').length).toBeGreaterThan(0);

      // NovaMirage is in Acid Suppression, so should not be in the product grid
      const headings = screen.getAllByRole('heading');
      const novaInGrid = headings.find(
        (h) => h.textContent?.includes('NOVAMIRAGE 20MG') && h.tagName === 'H3'
      );
      expect(novaInGrid).toBeUndefined();
    });

    it('filters formulations by search query', async () => {
      const user = userEvent.setup({ delay: null });
      render(<ProductsPage />);

      const searchInput = screen.getByPlaceholderText(/Filter by name or active compound/i);
      await user.type(searchInput, 'Vonoprazan');

      // NOVAMIRAGE matches description/title containing Vonoprazan
      expect(screen.getAllByText('NOVAMIRAGE 20MG').length).toBeGreaterThan(0);
    });
  });

  describe('ProductDetailPage (Monograph View)', () => {
    it('renders static params matching all mock products', async () => {
      const params = await generateStaticParams();
      expect(params).toEqual([
        { slug: 'sympdca' },
        { slug: 'novamirage' },
      ]);
    });

    it('renders product details for SymPDCA including indications and packaging', async () => {
      const page = await ProductDetailPage({
        params: Promise.resolve({ slug: 'sympdca' }),
      });
      render(page);

      expect(screen.getAllByText('SymPDCA').length).toBeGreaterThan(0);
      expect(
        screen.getByText(/Supports digestion & helps maintain a normal intestinal microflora/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Price per Strip 200 EGP/i)
      ).toBeInTheDocument();
    });

    it('renders product details for NovaMirage including P-CAB mode of action', async () => {
      const page = await ProductDetailPage({
        params: Promise.resolve({ slug: 'novamirage' }),
      });
      render(page);

      expect(screen.getAllByText('NOVAMIRAGE 20MG').length).toBeGreaterThan(0);
      expect(
        screen.getAllByText(/THE NEXT GENERATION IN ACID SUPPRESSION/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe('ProductHeroSlider Component', () => {
    it('renders featured product slide with brand badges and navigation indicators', () => {
      render(<ProductHeroSlider products={MOCK_PRODUCTS} />);

      expect(screen.getAllByText(/Featured Molecule/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(MOCK_PRODUCTS[0].name).length).toBeGreaterThan(0);
    });

    it('renders Arabic slide badges when isArabic=true', () => {
      render(<ProductHeroSlider products={MOCK_PRODUCTS} isArabic />);

      expect(screen.getAllByText('تركيبة مميزة').length).toBeGreaterThan(0);
    });
  });
});
