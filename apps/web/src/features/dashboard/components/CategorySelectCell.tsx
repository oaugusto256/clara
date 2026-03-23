import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaExclamationCircle, FaPencilAlt, FaSpinner } from 'react-icons/fa';
import type { useUpdateTransactionCategoryMutation } from '../queries/useUpdateTransactionCategoryMutation';
import { useCategoriesQuery } from '../queries/useCategoriesQuery';
import { CATEGORY_COLORS } from '../utils/categoryColors';

type UpdateMutation = ReturnType<typeof useUpdateTransactionCategoryMutation>;

interface CategorySelectCellProps {
  transactionId: string;
  currentCategoryKey: string | undefined;
  mutation: UpdateMutation;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

function CategoryBadge({
  categoryKey,
  color,
  chevron,
  muted,
}: {
  categoryKey: string;
  color?: string | null;
  chevron?: boolean;
  muted?: boolean;
}) {
  const bg = color || CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase transition-opacity"
      style={{ backgroundColor: bg, opacity: muted ? 0.5 : 1 }}
    >
      {categoryKey || 'Uncategorized'}
      {chevron && <span className="ml-0.5 text-[8px]">▼</span>}
    </span>
  );
}

export function CategorySelectCell({
  transactionId,
  currentCategoryKey,
  mutation,
  tableContainerRef,
}: CategorySelectCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError } = useCategoriesQuery();

  const isLoading = mutation.isPending && mutation.variables?.id === transactionId;
  const isError = mutation.isError && mutation.variables?.id === transactionId;

  const currentCategory = categories.find((c) => c.key === currentCategoryKey);

  function openPopover() {
    if (!cellRef.current) return;
    const rect = cellRef.current.getBoundingClientRect();
    setPopoverPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX });
    setIsOpen(true);
  }

  function closePopover() {
    setIsOpen(false);
    setPopoverPos(null);
  }

  function handleSelect(key: string) {
    mutation.mutate({ id: transactionId, categoryKey: key });
    closePopover();
  }

  useEffect(() => {
    if (!isOpen) return;
    const container = tableContainerRef.current;
    if (!container) return;
    container.addEventListener('scroll', closePopover);
    return () => container.removeEventListener('scroll', closePopover);
  }, [isOpen, tableContainerRef]);

  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (cellRef.current && cellRef.current.contains(e.target as Node)) return;
      closePopover();
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePopover();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const popover =
    isOpen && popoverPos
      ? ReactDOM.createPortal(
          <div
            className="fixed z-[9999] bg-base-100 border border-base-300 rounded shadow-lg py-1 min-w-[160px]"
            style={{ top: popoverPos.top, left: popoverPos.left }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {categoriesLoading && (
              <div className="flex items-center justify-center px-3 py-2 text-base-content/50">
                <FaSpinner className="animate-spin w-3 h-3" />
              </div>
            )}
            {categoriesError && (
              <div className="px-3 py-2 text-error text-xs">Failed to load categories</div>
            )}
            {!categoriesLoading &&
              !categoriesError &&
              categories.map((cat) => {
                const isSelected = cat.key === currentCategoryKey;
                const color = cat.color || CATEGORY_COLORS[cat.key] || CATEGORY_COLORS.default;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={[
                      'flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-base-200 transition-colors',
                      isSelected ? 'bg-base-200 font-semibold' : '',
                    ].join(' ')}
                    onClick={() => handleSelect(cat.key)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSelect(cat.key)}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize">{cat.name}</span>
                  </button>
                );
              })}
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={cellRef} className="inline-flex items-center gap-1">
      <button
        type="button"
        className="cursor-pointer focus:outline-none"
        onClick={openPopover}
        disabled={isLoading}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <CategoryBadge
          categoryKey={currentCategoryKey || ''}
          color={currentCategory?.color}
          chevron
          muted={isLoading}
        />
      </button>

      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-base-content/50 cursor-pointer">
        <FaPencilAlt className="w-2.5 h-2.5" />
      </span>

      {isError && (
        <span className="text-error ml-1" title="Failed to update category">
          <FaExclamationCircle className="w-3 h-3" />
        </span>
      )}

      {popover}
    </div>
  );
}
