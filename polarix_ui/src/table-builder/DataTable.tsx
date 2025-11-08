"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { DataTablePagination } from "./DataTablePagination";
import { Input } from "../components/ui/input";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Settings2 } from "lucide-react";
import { FormBuilder } from "../form-builder";
import { type TFormDetail } from "../form-builder/type";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  // Props for server-side operations
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: React.Dispatch<React.SetStateAction<PaginationState>>;
  sorting?: SortingState;
  onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: React.Dispatch<
    React.SetStateAction<ColumnFiltersState>
  >;

  // Props for global search
  showGlobalSearch?: boolean;
  globalFilter?: string;
  onGlobalFilterChange?: React.Dispatch<React.SetStateAction<string>>;
  globalSearchPlaceholder?: string;

  // New props for filter form
  filterFormDetail?: TFormDetail;
  onFilterChange?: (filters: Record<string, any>) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  columnFilters,
  onColumnFiltersChange,
  showGlobalSearch,
  globalFilter,
  onGlobalFilterChange,
  globalSearchPlaceholder = "Search...",
  filterFormDetail,
  onFilterChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Internal state for uncontrolled mode (client-side)
  const [internalColumnFilters, setInternalColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [internalSorting, setInternalSorting] = React.useState<SortingState>(
    []
  );
  const [internalGlobalFilter, setInternalGlobalFilter] = React.useState("");
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: 10,
    });
  const [isFilterDialogOpen, setIsFilterDialogOpen] = React.useState(false);
  const [dynamicFormDetail, setDynamicFormDetail] =
    React.useState<TFormDetail | null>(filterFormDetail || null);

  React.useEffect(() => {
    if (filterFormDetail) {
      setDynamicFormDetail(filterFormDetail);
    }
  }, [filterFormDetail]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    state: {
      sorting: sorting ?? internalSorting,
      columnVisibility,
      rowSelection,
      columnFilters: columnFilters ?? internalColumnFilters,
      pagination: pagination ?? internalPagination,
      globalFilter: globalFilter ?? internalGlobalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    onGlobalFilterChange: onGlobalFilterChange ?? setInternalGlobalFilter,
    // Enable manual operations if onChange handlers are provided
    manualPagination: onPaginationChange !== undefined,
    manualFiltering:
      onColumnFiltersChange !== undefined || onGlobalFilterChange !== undefined,
    manualSorting: onSortingChange !== undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        {showGlobalSearch && (
          <Input
            placeholder={globalSearchPlaceholder}
            value={globalFilter ?? internalGlobalFilter ?? ""}
            onChange={(event) =>
              (onGlobalFilterChange ?? setInternalGlobalFilter)(
                event.target.value
              )
            }
            className="max-w-sm"
          />
        )}
        {filterFormDetail && onFilterChange && (
          <Dialog
            open={isFilterDialogOpen}
            onOpenChange={setIsFilterDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto hidden h-8 lg:flex"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle></DialogTitle>
                <DialogDescription></DialogDescription>
              </DialogHeader>
              {dynamicFormDetail && (
                <FormBuilder
                  formDetail={dynamicFormDetail}
                  onSubmit={(data) => {
                    onFilterChange(data as Record<string, any>);
                    setIsFilterDialogOpen(false);
                  }}
                  setDynamicFormDetail={setDynamicFormDetail}
                />
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : typeof header.column.columnDef.header === "string" &&
                          header.column.getCanSort()
                        ? (
                          <DataTableColumnHeader
                            column={header.column}
                            title={header.column.columnDef.header}
                          />
                        )
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {(onPaginationChange === undefined ||
        (pageCount !== undefined && pageCount >= 0)) && (
        <DataTablePagination table={table} />
      )}
    </div>
  );
}