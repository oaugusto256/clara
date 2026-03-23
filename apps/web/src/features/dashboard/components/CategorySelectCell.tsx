import { DEFAULT_CATEGORY_KEYS } from "@clara/schemas";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { FaExclamationCircle, FaPencilAlt } from "react-icons/fa";
import type { useUpdateTransactionCategoryMutation } from "../queries/useUpdateTransactionCategoryMutation";
import { CATEGORY_COLORS } from "../utils/categoryColors";

type UpdateMutation = ReturnType<typeof useUpdateTransactionCategoryMutation>;

interface CategorySelectCellProps {
  transactionId: string;
  currentCategoryKey: string | undefined;
  mutation: UpdateMutation;
  tableContainerRef: React.RefObject<HTMLDivElement>;
}

function CategoryBadge({ categoryKey, chevron, muted }: { categoryKey: string; chevron?: boolean; muted?: boolean }) {
  const color = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white uppercase transition-opacity"
      style={{ backgroundColor: color, opacity: muted ? 0.5 : 1 }}
    >
      {categoryKey || "Uncategorized"}
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

  const isLoading = mutation.isPending && mutation.variables?.id === transactionId;
  const isError = mutation.isError && mutation.variables?.id === transactionId;

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

  // Close on scroll inside the virtualizer container
  useEffect(() => {
    if (!isOpen) return;
    const container = tableContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", closePopover);
    return () => container.removeEventListener("scroll", closePopover);
  }, [isOpen, tableContainerRef]);

  // Close on outside mousedown
  useEffect(() => {
    if (!isOpen) return;
    function handleMouseDown(e: MouseEvent) {
      if (cellRef.current && cellRef.current.contains(e.target as Node)) return;
      closePopover();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closePopover();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const popover = isOpen && popoverPos
    ? ReactDOM.createPortal(
      <div
        className="fixed z-[9999] bg-base-100 border border-base-300 rounded shadow-lg py-1 min-w-[160px]"
        style={{ top: popoverPos.top, left: popoverPos.left }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {DEFAULT_CATEGORY_KEYS.map((key) => {
          const color = CATEGORY_COLORS[key] || CATEGORY_COLORS.default;
          const isSelected = key === currentCategoryKey;
          return (
            <button
              key={key}
              type="button"
              className={[
                "flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-base-200 transition-colors",
                isSelected ? "bg-base-200 font-semibold" : "",
              ].join(" ")}
              onClick={() => handleSelect(key)}
              onKeyDown={(e) => e.key === "Enter" && handleSelect(key)}
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{key}</span>
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
          categoryKey={currentCategoryKey || ""}
          chevron
          muted={isLoading}
        />
      </button>

      {/* Pencil icon — visible on row hover via CSS group-hover */}
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
