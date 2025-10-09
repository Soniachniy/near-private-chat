import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { calculatePaginationRange } from "@/lib/table";

interface CardsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: CardsPaginationProps) {
  const paginationRange = totalPages ? calculatePaginationRange(currentPage, totalPages) : [];

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-6 px-1 pt-8 lg:flex-row lg:items-center">
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  handlePageChange(currentPage - 1);
                }
              }}
            />
          </PaginationItem>

          {paginationRange.map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                className="cursor-pointer transition-colors duration-150"
                isActive={pageNum === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pageNum);
                }}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  handlePageChange(currentPage + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  );
}
