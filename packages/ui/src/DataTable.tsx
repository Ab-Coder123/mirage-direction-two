'use client';

import * as React from 'react';
import { cn } from '@mirage/utils';

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
}: DataTableProps<T>) {
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
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
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

          {/* Column Visibility Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColMenuOpen((prev) => !prev)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-mono font-bold text-[#023368] transition-colors"
            >
              Columns ({visibleColumns.length}/{columns.length})
            </button>

            {colMenuOpen ? (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-2.5 z-30 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Toggle Visible Columns
                </div>
                {columns.map((col) => {
                  const isVisible = !hiddenCols[col.key];
                  return (
                    <label
                      key={col.key}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-medium text-[#023368] cursor-pointer"
                    >
                      <span>{col.header}</span>
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
            className="px-3.5 py-2 rounded-xl bg-[#023368] hover:bg-[#2878BC] text-white font-mono text-xs font-bold transition-colors"
          >
            Export CSV ↓
          </button>

          {headerActions}
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 text-slate-500 font-mono uppercase border-b border-slate-100 select-none">
            <tr>
              {visibleColumns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={cn(
                      'p-3.5 font-bold tracking-wider',
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
                        'p-3.5',
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

      {/* Pagination Footer */}
      <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono tabular-numbers">
        <div className="flex items-center gap-2">
          <span data-testid="pagination-summary">
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

        <div className="flex items-center gap-2">
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-[#023368]"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-[#023368] font-bold"
          >
            ← Prev
          </button>
          <span className="px-2 font-bold text-[#023368]">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-[#023368] font-bold"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
