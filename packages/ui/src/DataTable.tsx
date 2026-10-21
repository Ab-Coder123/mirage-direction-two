'use client';

import * as React from 'react';
import { cn } from '@mirage/utils';
import { Table as TableIcon, LayoutGrid, SlidersHorizontal, Download } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  defaultHidden?: boolean;
  render?: (row: T) => React.ReactNode;
  csvValue?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: string;
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  searchPlaceholder?: string;
  searchableKeys?: (keyof T)[];
  defaultPageSize?: number;
  exportFileName?: string;
  onRowClick?: (row: T) => void;
  headerActions?: React.ReactNode;
  className?: string;
  defaultViewMode?: 'table' | 'cards';
  enableViewToggle?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  rowKey,
  searchPlaceholder = 'Filter clinical records...',
  searchableKeys,
  defaultPageSize = 5,
  exportFileName = 'mirage-clinical-export.csv',
  onRowClick,
  headerActions,
  className,
  defaultViewMode = 'table',
  enableViewToggle = true,
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>(defaultViewMode);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortKey, setSortKey] = React.useState<string | null>(null);
  const [sortDir, setSortDir] = React.useState<'asc' | 'desc'>('asc');
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [colMenuOpen, setColMenuOpen] = React.useState(false);

  const [hiddenCols, setHiddenCols] = React.useState<Record<string, boolean>>(
    () => {
      const init: Record<string, boolean> = {};
      columns.forEach((c) => {
        if (c.defaultHidden) init[c.key] = true;
      });
      return init;
    }
  );

  const visibleColumns = React.useMemo(
    () => columns.filter((c) => !hiddenCols[c.key]),
    [columns, hiddenCols]
  );

  const filteredData = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) => {
      const keysToCheck =
        searchableKeys && searchableKeys.length > 0
          ? searchableKeys
          : (Object.keys(row) as (keyof T)[]);

      return keysToCheck.some((k) => {
        const val = row[k];
        if (val == null) return false;
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, searchableKeys]);

  const sortedData = React.useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const cmp =
        typeof valA === 'number' && typeof valB === 'number'
          ? valA - valB
          : String(valA).localeCompare(String(valB));

      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleColumnVisibility = (key: string) => {
    setHiddenCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportCSV = () => {
    const headers = visibleColumns.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((row) =>
      visibleColumns
        .map((col) => {
          const raw = col.csvValue
            ? col.csvValue(row)
            : row[col.key] ?? '';
          const str = String(raw);
          // Mitigate CSV / formula injection (=, +, -, @) unless genuine number
          if (/^[=+\-@]/.test(str) && isNaN(Number(str))) {
            return `"'${str.replace(/"/g, '""')}"`;
          }
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        'rounded-3xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Top Toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {title ? (
            <h2 className="font-heading font-bold text-base sm:text-lg text-[#023368]">
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-60 md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#023368] placeholder:text-slate-400 focus:outline-none focus:border-[#2878BC]"
            />
          </div>

          {/* View Mode Switch (Table vs Cards) */}
          {enableViewToggle ? (
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5',
                  viewMode === 'table'
                    ? 'bg-white text-[#023368] shadow-sm'
                    : 'text-slate-500 hover:text-[#023368]'
                )}
                aria-label="Table view"
                title="Table view"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5',
                  viewMode === 'cards'
                    ? 'bg-white text-[#023368] shadow-sm'
                    : 'text-slate-500 hover:text-[#023368]'
                )}
                aria-label="Cards view"
                title="Card view (mobile-optimized)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          ) : null}

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColMenuOpen((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-mono font-bold text-[#023368] transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Columns ({visibleColumns.length}/{columns.length})</span>
            </button>

            {colMenuOpen ? (
              <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-slate-200 shadow-xl p-2.5 z-30 space-y-1 max-h-72 overflow-y-auto">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold sticky top-0 bg-white">
                  Toggle Visible Columns
                </div>
                {columns.map((col) => {
                  const isVisible = !hiddenCols[col.key];
                  return (
                    <label
                      key={col.key}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-[#023368] cursor-pointer"
                    >
                      <span className="truncate pr-2">{col.header}</span>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumnVisibility(col.key)}
                        className="rounded border-slate-300 text-[#2878BC]"
                      />
                    </label>
                  );
                })}
              </div>
            ) : null}
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#023368] hover:bg-[#2878BC] text-white font-mono text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {headerActions}
        </div>
      </div>

      {/* Main Content: Table View vs Responsive Cards View */}
      {viewMode === 'table' ? (
        <>
          {/* Mobile horizontal scroll hint */}
          <div className="lg:hidden px-4 py-2 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2878BC] animate-pulse" />
              <span>Swipe horizontally to view all {visibleColumns.length} columns</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              Scroll ↔
            </span>
          </div>

          <div className="overflow-x-auto -webkit-overflow-scrolling-touch scrollbar-thin scrollbar-thumb-slate-200">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-slate-50/90 text-slate-500 font-mono uppercase border-b border-slate-100 select-none">
                <tr>
                  {visibleColumns.map((col) => {
                    const isSorted = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        onClick={() => col.sortable && handleSort(col.key)}
                        className={cn(
                          'p-3.5 font-bold tracking-wider whitespace-nowrap',
                          col.sortable &&
                            'cursor-pointer hover:text-[#023368] transition-colors',
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          <span>{col.header}</span>
                          {col.sortable ? (
                            <span className="text-[10px] text-[#2878BC]">
                              {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                            </span>
                          ) : null}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumns.length}
                      className="p-8 text-center text-xs text-slate-400 font-mono"
                    >
                      No matching clinical or operational records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row) => (
                    <tr
                      key={rowKey(row)}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={cn(
                        'transition-colors',
                        onRowClick
                          ? 'cursor-pointer hover:bg-sky-50/60'
                          : 'hover:bg-slate-50/70'
                      )}
                    >
                      {visibleColumns.map((col) => (
                        <td
                          key={col.key}
                          className={cn(
                            'p-3.5 whitespace-nowrap',
                            col.align === 'right'
                              ? 'text-right'
                              : col.align === 'center'
                              ? 'text-center'
                              : 'text-left'
                          )}
                        >
                          {col.render
                            ? col.render(row)
                            : String(row[col.key] ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Card View for Mobile & Tablet */
        <div className="p-4 sm:p-6 bg-slate-50/40 grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedData.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400 font-mono bg-white rounded-2xl border border-slate-200">
              No matching clinical or operational records found.
            </div>
          ) : (
            paginatedData.map((row) => {
              const firstCol = visibleColumns[0];
              const otherCols = visibleColumns.slice(1);
              return (
                <div
                  key={rowKey(row)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={cn(
                    'p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm transition-all space-y-3 flex flex-col justify-between',
                    onRowClick
                      ? 'cursor-pointer hover:border-[#2878BC]/60 hover:shadow-md'
                      : 'hover:border-slate-300'
                  )}
                >
                  <div className="space-y-3">
                    {/* Card Primary Header */}
                    {firstCol ? (
                      <div className="pb-3 border-b border-slate-100">
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                          {firstCol.header}
                        </span>
                        <div className="font-heading font-bold text-sm text-[#023368]">
                          {firstCol.render ? firstCol.render(row) : String(row[firstCol.key] ?? '—')}
                        </div>
                      </div>
                    ) : null}

                    {/* Remaining Columns as Adaptive Key-Value Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      {otherCols.map((col) => (
                        <div
                          key={col.key}
                          className="space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 min-w-0"
                        >
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block truncate">
                            {col.header}
                          </span>
                          <div className="text-slate-700 font-medium">
                            {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {onRowClick ? (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end text-[11px] font-mono font-bold text-[#2878BC]">
                      <span>View Details →</span>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono tabular-numbers">
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <span data-testid="pagination-summary" className="text-slate-600">
            Showing{' '}
            <strong className="text-[#023368]">
              {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            –{' '}
            <strong className="text-[#023368]">
              {Math.min(currentPage * pageSize, sortedData.length)}
            </strong>{' '}
            of <strong className="text-[#023368]">{sortedData.length}</strong>{' '}
            records
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-[#023368] focus:outline-none focus:border-[#2878BC]"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-[#023368] font-bold transition-colors"
            >
              ← Prev
            </button>
            <span className="px-2 font-bold text-[#023368] whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-[#023368] font-bold transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
