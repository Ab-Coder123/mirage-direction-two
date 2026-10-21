import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable, type DataTableColumn } from '@mirage/ui';

interface Row {
  id: string;
  name: string;
  qty: number;
  note?: string | null;
}

const ROWS: Row[] = [
  { id: 'a', name: 'Inositol', qty: 30, note: 'PCOS' },
  { id: 'b', name: 'Folate B12', qty: 5, note: null },
  { id: 'c', name: 'Man Edge', qty: 120, note: 'Andrology' },
  { id: 'd', name: 'VitaKids', qty: 60 },
  { id: 'e', name: 'Galacto-Pure', qty: 10, note: 'Lactation' },
  { id: 'f', name: 'SymPDCA', qty: 90, note: 'GI' },
  { id: 'g', name: 'NovaMirage', qty: 15, note: 'P-CAB' },
];

const COLUMNS: DataTableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'qty', header: 'Qty', sortable: true },
  { key: 'note', header: 'Note' },
];

function renderTable(extra: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
  return render(
    <DataTable<Row>
      title="Registry"
      data={ROWS}
      columns={COLUMNS}
      rowKey={(r) => r.id}
      searchableKeys={['name', 'note']}
      defaultPageSize={5}
      {...extra}
    />
  );
}

/** Names of the rows currently rendered in tbody, in order (excluding empty-state row). */
function visibleNames(): string[] {
  const body = document.querySelector('tbody');
  if (!body) return [];
  return within(body)
    .queryAllByRole('row')
    .filter((tr) => !tr.querySelector('td[colspan]'))
    .map((tr) => tr.querySelectorAll('td')[0]?.textContent?.trim() ?? '');
}

describe('DataTable', () => {
  it('renders the title, header cells and the first page of rows', () => {
    renderTable();
    expect(screen.getByRole('heading', { name: 'Registry' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Name/ })).toBeInTheDocument();
    expect(visibleNames()).toEqual(['Inositol', 'Folate B12', 'Man Edge', 'VitaKids', 'Galacto-Pure']);
    expect(screen.getByTestId('pagination-summary')).toHaveTextContent(/1\s*–\s*5\s*of\s*7\s*records/);
  });

  it('renders an em dash for null/undefined cells and uses custom render functions', () => {
    renderTable({
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'note', header: 'Note' },
        { key: 'qty', header: 'Qty', render: (r) => <b data-testid="qty">{r.qty} units</b> },
      ],
    });
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2); // null + undefined notes
    expect(screen.getAllByTestId('qty')[0]).toHaveTextContent('30 units');
  });

  it('filters rows by the search query only across searchableKeys, case-insensitively', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.type(screen.getByPlaceholderText(/filter clinical records/i), 'andro');
    expect(visibleNames()).toEqual(['Man Edge']);
    // qty is not a searchable key, so searching a quantity must not match
    await user.clear(screen.getByPlaceholderText(/filter clinical records/i));
    await user.type(screen.getByPlaceholderText(/filter clinical records/i), '120');
    expect(visibleNames()).toEqual([]);
  });

  it('shows the empty state when nothing matches', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.type(screen.getByPlaceholderText(/filter clinical records/i), 'zzzz');
    expect(screen.getByText(/no matching clinical or operational records/i)).toBeInTheDocument();
    expect(screen.getByTestId('pagination-summary')).toHaveTextContent(/0\s*–\s*0\s*of\s*0\s*records/);
  });

  it('sorts text ascending then descending when the header is clicked twice', async () => {
    const user = userEvent.setup();
    renderTable({ defaultPageSize: 10 as never });
    await user.selectOptions(screen.getByLabelText('Rows per page'), '10');
    await user.click(screen.getByRole('columnheader', { name: /Name/ }));
    expect(visibleNames()).toEqual([
      'Folate B12',
      'Galacto-Pure',
      'Inositol',
      'Man Edge',
      'NovaMirage',
      'SymPDCA',
      'VitaKids',
    ]);
    await user.click(screen.getByRole('columnheader', { name: /Name/ }));
    expect(visibleNames()[0]).toBe('VitaKids');
  });

  it('sorts numeric columns numerically, not lexicographically', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.selectOptions(screen.getByLabelText('Rows per page'), '10');
    await user.click(screen.getByRole('columnheader', { name: /Qty/ }));
    // lexicographic order would put "120" before "15" and "30"
    expect(visibleNames()).toEqual([
      'Folate B12', // 5
      'Galacto-Pure', // 10
      'NovaMirage', // 15
      'Inositol', // 30
      'VitaKids', // 60
      'SymPDCA', // 90
      'Man Edge', // 120
    ]);
  });

  it('does not sort when a non-sortable header is clicked', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole('columnheader', { name: /Note/ }));
    expect(visibleNames()[0]).toBe('Inositol');
  });

  it('paginates and clamps navigation buttons at the boundaries', async () => {
    const user = userEvent.setup();
    renderTable();
    const prev = screen.getByRole('button', { name: /prev/i });
    const next = screen.getByRole('button', { name: /next/i });
    expect(prev).toBeDisabled();
    await user.click(next);
    expect(visibleNames()).toEqual(['SymPDCA', 'NovaMirage']);
    expect(next).toBeDisabled();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
    await user.click(prev);
    expect(visibleNames()[0]).toBe('Inositol');
  });

  it('resets to page 1 when the search query changes', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByPlaceholderText(/filter clinical records/i), 'a');
    expect(screen.getByText(/^1 \/ /)).toBeInTheDocument();
  });

  it('hides and restores columns through the column menu', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole('button', { name: /columns \(3\/3\)/i }));
    await user.click(screen.getByRole('checkbox', { name: /^Note$/ }));
    expect(screen.queryByRole('columnheader', { name: /Note/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /columns \(2\/3\)/i })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /^Note$/ }));
    expect(screen.getByRole('columnheader', { name: /Note/ })).toBeInTheDocument();
  });

  it('honours defaultHidden columns', () => {
    renderTable({
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'note', header: 'Note', defaultHidden: true },
      ],
    });
    expect(screen.queryByRole('columnheader', { name: /Note/ })).not.toBeInTheDocument();
  });

  it('invokes onRowClick with the clicked row', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderTable({ onRowClick });
    await user.click(screen.getByText('Man Edge'));
    expect(onRowClick).toHaveBeenCalledTimes(1);
    expect(onRowClick.mock.calls[0]![0]).toMatchObject({ id: 'c', name: 'Man Edge' });
  });

  describe('CSV export', () => {
    async function exportCsv(extra: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) {
      const user = userEvent.setup();
      let captured: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((b) => {
        captured = b as Blob;
        return 'blob:test';
      });
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      const downloads: string[] = [];
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download);
      });
      renderTable(extra);
      await user.click(screen.getByRole('button', { name: /export csv/i }));
      return { csv: await captured!.text(), downloads, revoke };
    }

    it('exports ALL filtered rows (not only the current page) with the configured file name', async () => {
      const { csv, downloads, revoke } = await exportCsv({ exportFileName: 'registry.csv' });
      const lines = csv.split('\n');
      expect(lines[0]).toBe('"Name","Qty","Note"');
      expect(lines).toHaveLength(1 + ROWS.length); // header + 7 rows although page size is 5
      expect(downloads).toEqual(['registry.csv']);
      expect(revoke).toHaveBeenCalledWith('blob:test');
    });

    it('escapes double quotes and uses csvValue overrides', async () => {
      const { csv } = await exportCsv({
        data: [{ id: 'x', name: 'He said "hi"', qty: 1, note: 'n' }],
        columns: [
          { key: 'name', header: 'Name' },
          { key: 'qty', header: 'Qty', csvValue: (r) => `${r.qty} units` },
        ],
      });
      expect(csv.split('\n')[1]).toBe('"He said ""hi""","1 units"');
    });

    it('neutralises spreadsheet formula injection in exported cells', async () => {
      const { csv } = await exportCsv({
        data: [
          { id: 'x', name: '=HYPERLINK("http://evil.example","click")', qty: -5 },
          { id: 'y', name: '@SUM(A1:A9)', qty: 2 },
          { id: 'z', name: '+1+1', qty: 3 },
        ],
        columns: [
          { key: 'name', header: 'Name' },
          { key: 'qty', header: 'Qty' },
        ],
      });
      const rows = csv.split('\n').slice(1);
      expect(rows[0]).toMatch(/^"'=HYPERLINK/); // text prefixed with a single quote
      expect(rows[0]).toMatch(/,"-5"$/); // genuine negative numbers stay untouched
      expect(rows[1]).toMatch(/^"'@SUM/);
      expect(rows[2]).toMatch(/^"'\+1\+1"/);
    });

    it('omits hidden columns from the export', async () => {
      const { csv } = await exportCsv({
        columns: [
          { key: 'name', header: 'Name' },
          { key: 'note', header: 'Note', defaultHidden: true },
        ],
      });
      expect(csv.split('\n')[0]).toBe('"Name"');
    });
  });

  describe('Responsive view mode (Table vs Cards)', () => {
    it('switches to card view when the Cards toggle is clicked', async () => {
      const user = userEvent.setup();
      renderTable();
      expect(document.querySelector('table')).toBeInTheDocument();

      const cardsBtn = screen.getByRole('button', { name: /cards view/i });
      await user.click(cardsBtn);

      // In card view, table is unmounted and card elements are displayed
      expect(document.querySelector('table')).not.toBeInTheDocument();
      expect(screen.getByText('Inositol')).toBeInTheDocument();
      expect(screen.getByText('Folate B12')).toBeInTheDocument();

      // Switch back to table view
      const tableBtn = screen.getByRole('button', { name: /table view/i });
      await user.click(tableBtn);
      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('renders with defaultViewMode="cards" directly', () => {
      renderTable({ defaultViewMode: 'cards' });
      expect(document.querySelector('table')).not.toBeInTheDocument();
      expect(screen.getByText('Inositol')).toBeInTheDocument();
    });
  });
});
