import React from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const items = [];
    const ellipsis = (
      <span key="ellipsis" className="px-2">
        ...
      </span>
    );

    // Previous button
    items.push(
      <button
        key="prev"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 text-gray-600 cursor-pointer disabled:opacity-50 hover:text-black"
      >
        <HiChevronLeft className="w-5 h-5" />
      </button>
    );

    // First page
    items.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`px-3 py-1 rounded cursor-pointer ${currentPage === 1 ? "bg-yellow" : "hover:bg-gray-100"}`}
      >
        1
      </button>
    );

    let start = Math.max(2, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    if (currentPage > 4) {
      items.push(ellipsis);
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded cursor-pointer ${currentPage === i ? "bg-yellow" : "hover:bg-gray-100"}`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages - 3) {
      items.push(ellipsis);
    }

    // Last page
    if (totalPages > 1) {
      items.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1 rounded cursor-pointer ${currentPage === totalPages ? "bg-yellow" : "hover:bg-gray-100"}`}
        >
          {totalPages}
        </button>
      );
    }

    // Next button
    items.push(
      <button
        key="next"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-gray-600 disabled:opacity-50 hover:text-black cursor-pointer"
      >
        <HiChevronRight className="w-5 h-5" />
      </button>
    );

    return items;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {renderPageNumbers()}
    </div>
  );
};

export default Pagination;
