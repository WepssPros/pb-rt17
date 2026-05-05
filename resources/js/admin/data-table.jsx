import React, { useDeferredValue, useMemo, useState } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { cnValue, stripHtml } from "@/admin/utils";

function compareValues(left, right) {
    if (left === right) return 0;
    if (left === undefined || left === null) return 1;
    if (right === undefined || right === null) return -1;

    const leftNumber = Number(left);
    const rightNumber = Number(right);

    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return leftNumber - rightNumber;
    }

    return String(left).localeCompare(String(right), "id", { sensitivity: "base" });
}

export function AdminDataTable({
    title,
    description,
    rows,
    columns,
    searchPlaceholder = "Cari data",
    searchFields = [],
    isLoading = false,
    toolbar,
    emptyMessage = "Belum ada data.",
    defaultPageSize = 10,
}) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(String(defaultPageSize));
    const [sortState, setSortState] = useState({ key: null, direction: "asc" });
    const deferredSearch = useDeferredValue(search);

    const filteredRows = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();

        let nextRows = [...rows];

        if (query) {
            nextRows = nextRows.filter((row) =>
                searchFields.some((field) =>
                    stripHtml(row?.[field]).toLowerCase().includes(query)
                )
            );
        }

        if (sortState.key) {
            nextRows.sort((left, right) => {
                const result = compareValues(left?.[sortState.key], right?.[sortState.key]);
                return sortState.direction === "asc" ? result : -result;
            });
        }

        return nextRows;
    }, [deferredSearch, rows, searchFields, sortState]);

    const size = Number(pageSize);
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / size));
    const safePage = Math.min(page, totalPages);
    const paginatedRows = filteredRows.slice((safePage - 1) * size, safePage * size);

    const handleSort = (column) => {
        if (!column.sortKey) {
            return;
        }

        setSortState((current) => {
            if (current.key === column.sortKey) {
                return {
                    key: column.sortKey,
                    direction: current.direction === "asc" ? "desc" : "asc",
                };
            }

            return { key: column.sortKey, direction: "asc" };
        });
    };

    return (
        <div className="app-table-wrap overflow-hidden rounded-[28px]">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                        <Badge variant="secondary" className="rounded-full">{filteredRows.length} baris</Badge>
                    </div>
                    {description ? (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                <div className="flex flex-col gap-3 lg:items-end">
                    {toolbar}
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder={searchPlaceholder}
                            className="app-input w-full sm:w-64"
                        />
                        <Select
                            value={pageSize}
                            onValueChange={(value) => {
                                setPageSize(value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger className="app-input w-full sm:w-32">
                                <SelectValue placeholder="Rows" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {["10", "25", "50", "100"].map((value) => (
                                        <SelectItem key={value} value={value}>
                                            {value} rows
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border">
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.headerClassName}>
                                    <button
                                        type="button"
                                        onClick={() => handleSort(column)}
                                        className={cnValue(
                                            "inline-flex items-center gap-2 text-left font-medium text-muted-foreground",
                                            column.sortKey ? "cursor-pointer hover:text-foreground" : ""
                                        )}
                                    >
                                        <span>{column.title}</span>
                                        {sortState.key === column.sortKey ? (
                                            <span className="text-xs text-primary">
                                                {sortState.direction === "asc" ? "↑" : "↓"}
                                            </span>
                                        ) : null}
                                    </button>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array.from({ length: 6 }).map((_, index) => (
                                  <TableRow key={`loading-${index}`}>
                                      <TableCell colSpan={columns.length}>
                                          <Skeleton className="h-8 w-full rounded-lg bg-muted" />
                                      </TableCell>
                                  </TableRow>
                              ))
                            : paginatedRows.length
                            ? paginatedRows.map((row, index) => (
                                  <TableRow key={row.id ?? index} className="border-border/80">
                                      {columns.map((column) => (
                                          <TableCell
                                              key={column.key}
                                              className={cnValue(
                                                  "align-top text-sm text-foreground/88",
                                                  column.cellClassName
                                              )}
                                          >
                                              {column.render
                                                  ? column.render(row)
                                                  : stripHtml(row?.[column.key])}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))
                            : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="py-12 text-center text-sm text-muted-foreground"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span>
                    Halaman {safePage} dari {totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                        Sebelumnya
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={safePage >= totalPages}
                        onClick={() =>
                            setPage((current) => Math.min(totalPages, current + 1))
                        }
                    >
                        Berikutnya
                    </Button>
                </div>
            </div>
        </div>
    );
}
