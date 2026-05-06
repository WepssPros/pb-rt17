import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
    ArrowDownIcon,
    ArrowUpDownIcon,
    ArrowUpIcon,
    CheckIcon,
    Columns3Icon,
    ExternalLinkIcon,
    PlusIcon,
    SearchIcon,
    SlidersHorizontalIcon,
    XIcon,
} from "lucide-react";

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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useInfiniteScroll } from "@/admin/use-infinite-scroll";
import { cnValue, stripHtml } from "@/admin/utils";

const DEFAULT_TABLE_HEIGHT = "app-table-scroll";
const DEFAULT_BATCH_SIZE = 20;

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

function normalizeValue(value) {
    if (Array.isArray(value)) {
        return value
            .map((entry) => normalizeValue(entry))
            .filter(Boolean)
            .join(", ");
    }

    if (value === undefined || value === null) {
        return "";
    }

    return stripHtml(value);
}

function getColumnValue(row, column) {
    if (typeof column.filterAccessor === "function") {
        return normalizeValue(column.filterAccessor(row));
    }

    if (typeof column.accessor === "function") {
        return normalizeValue(column.accessor(row));
    }

    if (column.filterAccessor) {
        return normalizeValue(row?.[column.filterAccessor]);
    }

    return normalizeValue(row?.[column.key]);
}

function useColumnVisibility(columns) {
    const columnSignature = useMemo(
        () =>
            columns
                .map(
                    (column) =>
                        `${column.key}:${column.required ? "1" : "0"}:${column.defaultVisible === false ? "0" : "1"}`
                )
                .join("|"),
        [columns]
    );

    const [visibility, setVisibility] = useState(() =>
        Object.fromEntries(
            columns.map((column) => [
                column.key,
                column.required ? true : column.defaultVisible !== false,
            ])
        )
    );

    useEffect(() => {
        setVisibility((current) => {
            const next = {};

            columns.forEach((column) => {
                const fallback = column.required ? true : column.defaultVisible !== false;
                next[column.key] =
                    column.required || current[column.key] === undefined
                        ? fallback
                        : current[column.key];
            });

            return next;
        });
    }, [columnSignature, columns]);

    return [visibility, setVisibility];
}

function SortIndicator({ active, direction }) {
    if (!active) {
        return <ArrowUpDownIcon className="size-3 opacity-60" />;
    }

    return direction === "asc" ? (
        <ArrowUpIcon className="size-3 text-primary" />
    ) : (
        <ArrowDownIcon className="size-3 text-primary" />
    );
}

function TableToolbarIconButton({ icon: Icon, label, active = false, onClick, disabled = false }) {
    return (
        <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={cnValue("app-table-icon-button rounded-full", active ? "border-primary/30 text-primary" : "")}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
        >
            <Icon className="size-3.5" />
        </Button>
    );
}

function SummaryGrid({ items = [] }) {
    if (!items.length) {
        return (
            <div className="rounded-[20px] border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                Tidak ada detail tambahan untuk baris ini.
            </div>
        );
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item, index) => {
                const Icon = item.icon;

                return (
                    <div
                        key={item.key || `${item.label}-${index}`}
                        className={cnValue(
                            "rounded-[18px] border border-border bg-[color-mix(in_oklab,var(--surface)_96%,transparent)] px-4 py-3",
                            item.tone ? `app-cell-${item.tone}` : ""
                        )}
                    >
                        <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            {Icon ? <Icon className="size-3.5" /> : null}
                            <span>{item.label}</span>
                        </div>
                        <div
                            className={cnValue(
                                "text-sm font-medium leading-6 text-foreground",
                                item.truncate ? "app-cell-truncate" : ""
                            )}
                        >
                            {item.value || "-"}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function FilterModal({ open, onOpenChange, columns, rows, value, onApply }) {
    const [draftFilters, setDraftFilters] = useState(value);

    useEffect(() => {
        setDraftFilters(value);
    }, [value, open]);

    const availableValues = useMemo(
        () =>
            Object.fromEntries(
                columns.map((column) => [
                    column.key,
                    Array.from(
                        new Set(
                            rows
                                .map((row) => getColumnValue(row, column))
                                .map((entry) => entry.trim())
                                .filter(Boolean)
                        )
                    ).sort((left, right) => left.localeCompare(right, "id", { sensitivity: "base" })),
                ])
            ),
        [columns, rows]
    );

    const addFilter = () => {
        const nextId =
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;

        setDraftFilters((current) => [...current, { id: nextId, columnKey: "", values: [] }]);
    };

    const updateFilter = (filterId, nextValues) => {
        setDraftFilters((current) =>
            current.map((entry) => (entry.id === filterId ? { ...entry, ...nextValues } : entry))
        );
    };

    const removeFilter = (filterId) => {
        setDraftFilters((current) => current.filter((entry) => entry.id !== filterId));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader className="border-b border-border px-5 py-4">
                    <DialogTitle>Filter data</DialogTitle>
                    <DialogDescription>Gabungkan beberapa filter tanpa meninggalkan tabel utama.</DialogDescription>
                </DialogHeader>
                <div className="flex max-h-[58vh] flex-col gap-3 overflow-y-auto px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">Filter aktif</p>
                        <Button type="button" variant="outline" size="sm" onClick={addFilter}>
                            <PlusIcon data-icon="inline-start" />
                            Tambah
                        </Button>
                    </div>

                    {draftFilters.length ? (
                        draftFilters.map((filter) => {
                            const selectedElsewhere = new Set(
                                draftFilters
                                    .filter((entry) => entry.id !== filter.id)
                                    .map((entry) => entry.columnKey)
                                    .filter(Boolean)
                            );

                            const activeColumn = columns.find((column) => column.key === filter.columnKey);
                            const values = activeColumn ? availableValues[activeColumn.key] || [] : [];

                            return (
                                <div key={filter.id} className="app-subpanel rounded-[20px] p-3.5">
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,220px)_1fr_auto]">
                                        <div className="space-y-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Kolom
                                            </p>
                                            <Select
                                                value={filter.columnKey}
                                                onValueChange={(columnKey) =>
                                                    updateFilter(filter.id, { columnKey, values: [] })
                                                }
                                            >
                                                <SelectTrigger className="app-input rounded-2xl">
                                                    <SelectValue placeholder="Pilih kolom" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {columns.map((column) => (
                                                            <SelectItem
                                                                key={column.key}
                                                                value={column.key}
                                                                disabled={selectedElsewhere.has(column.key)}
                                                            >
                                                                {column.title}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                                Nilai
                                            </p>
                                            {activeColumn ? (
                                                values.length ? (
                                                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto rounded-[18px] border border-border bg-[color-mix(in_oklab,var(--surface)_94%,transparent)] p-2">
                                                        {values.map((entry) => {
                                                            const selected = filter.values.includes(entry);

                                                            return (
                                                                <button
                                                                    key={entry}
                                                                    type="button"
                                                                    className={cnValue(
                                                                        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                                                                        selected
                                                                            ? "border-primary/24 bg-[color-mix(in_oklab,var(--primary)_14%,transparent)] text-primary"
                                                                            : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                                                                    )}
                                                                    onClick={() =>
                                                                        updateFilter(filter.id, {
                                                                            values: selected
                                                                                ? filter.values.filter((valueItem) => valueItem !== entry)
                                                                                : [...filter.values, entry],
                                                                        })
                                                                    }
                                                                >
                                                                    <span
                                                                        className={cnValue(
                                                                            "flex size-3.5 items-center justify-center rounded-full border",
                                                                            selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                                                                        )}
                                                                    >
                                                                        {selected ? <CheckIcon className="size-2.5" /> : null}
                                                                    </span>
                                                                    <span>{entry}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-[18px] border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
                                                        Tidak ada nilai untuk kolom ini.
                                                    </div>
                                                )
                                            ) : (
                                                <div className="rounded-[18px] border border-dashed border-border px-3 py-3 text-sm text-muted-foreground">
                                                    Pilih kolom terlebih dulu.
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start justify-end">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                className="rounded-full"
                                                onClick={() => removeFilter(filter.id)}
                                                aria-label="Hapus filter"
                                            >
                                                <XIcon className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="rounded-[20px] border border-dashed border-border px-4 py-7 text-center text-sm text-muted-foreground">
                            Belum ada filter. Tambahkan filter untuk mempersempit hasil.
                        </div>
                    )}
                </div>
                <DialogFooter className="bg-transparent px-5 py-4">
                    <Button type="button" variant="ghost" onClick={() => setDraftFilters([])}>
                        Reset
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onApply(draftFilters);
                            onOpenChange(false);
                        }}
                    >
                        Terapkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ColumnVisibilityDialog({ open, onOpenChange, columns, value, onApply }) {
    const [draftVisibility, setDraftVisibility] = useState(value);

    useEffect(() => {
        setDraftVisibility(value);
    }, [value, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="border-b border-border px-5 py-4">
                    <DialogTitle>Tampilan kolom</DialogTitle>
                    <DialogDescription>Pilih kolom yang ingin tetap terlihat pada tabel.</DialogDescription>
                </DialogHeader>
                <div className="flex max-h-[54vh] flex-col gap-2 overflow-y-auto px-5 py-4">
                    {columns.map((column) => {
                        const Icon = column.icon;
                        const enabled = Boolean(draftVisibility[column.key]);

                        return (
                            <button
                                key={column.key}
                                type="button"
                                className={cnValue(
                                    "flex items-center justify-between gap-3 rounded-[18px] border px-3.5 py-3 text-left transition",
                                    column.required
                                        ? "border-border bg-[color-mix(in_oklab,var(--surface-muted)_94%,transparent)]"
                                        : enabled
                                          ? "border-primary/24 bg-[color-mix(in_oklab,var(--primary)_10%,transparent)]"
                                          : "border-border bg-[color-mix(in_oklab,var(--surface)_96%,transparent)] hover:border-primary/20"
                                )}
                                onClick={() => {
                                    if (column.required) {
                                        return;
                                    }

                                    setDraftVisibility((current) => ({
                                        ...current,
                                        [column.key]: !current[column.key],
                                    }));
                                }}
                                disabled={column.required}
                            >
                                <div className="flex items-center gap-3">
                                    {Icon ? (
                                        <span className="flex size-8 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--accent)_68%,transparent)] text-primary">
                                            <Icon className="size-3.5" />
                                        </span>
                                    ) : null}
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{column.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {column.required ? "Kolom wajib" : enabled ? "Tampil" : "Disembunyikan"}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={column.required ? "secondary" : enabled ? "default" : "outline"}>
                                    {column.required ? "Wajib" : enabled ? "On" : "Off"}
                                </Badge>
                            </button>
                        );
                    })}
                </div>
                <DialogFooter className="bg-transparent px-5 py-4">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            onApply(draftVisibility);
                            onOpenChange(false);
                        }}
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RowActionDialog({ open, onOpenChange, title, subtitle, summary, actions }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="border-b border-border px-5 py-4">
                    <DialogTitle>{title}</DialogTitle>
                    {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
                </DialogHeader>
                <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto px-5 py-4">
                    <SummaryGrid items={summary} />
                </div>
                <DialogFooter className="bg-transparent px-5 py-4 sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                        {actions
                            .filter((action) => action.tone === "destructive")
                            .map((action) => {
                                const Icon = action.icon;

                                return (
                                    <Button
                                        key={action.key}
                                        type="button"
                                        variant="destructive"
                                        onClick={action.onSelect}
                                    >
                                        {Icon ? <Icon data-icon="inline-start" /> : null}
                                        {action.label}
                                    </Button>
                                );
                            })}
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Tutup
                        </Button>
                        {actions
                            .filter((action) => action.tone !== "destructive")
                            .map((action) => {
                                const Icon = action.icon;
                                const variant = action.tone === "secondary" ? "outline" : "default";

                                return (
                                    <Button key={action.key} type="button" variant={variant} onClick={action.onSelect}>
                                        {Icon ? <Icon data-icon="inline-start" /> : null}
                                        {action.label}
                                    </Button>
                                );
                            })}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function QuickDetailDialog({ open, onOpenChange, title, subtitle, summary, actions }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader className="border-b border-border px-5 py-4">
                    <DialogTitle>{title}</DialogTitle>
                    {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
                </DialogHeader>
                <div className="flex max-h-[64vh] flex-col gap-4 overflow-y-auto px-5 py-4">
                    <SummaryGrid items={summary} />
                </div>
                <DialogFooter className="bg-transparent px-5 py-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Tutup
                    </Button>
                    {actions.map((action) => {
                        const Icon = action.icon || ExternalLinkIcon;
                        const variant = action.tone === "secondary" ? "outline" : "default";

                        return (
                            <Button key={action.key} type="button" variant={variant} onClick={action.onSelect}>
                                <Icon data-icon="inline-start" />
                                {action.label}
                            </Button>
                        );
                    })}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
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
    filtersEnabled = true,
    columnVisibilityEnabled = true,
    infiniteScroll = true,
    tableMaxHeight = DEFAULT_TABLE_HEIGHT,
    mobileMode = "horizontal-scroll",
    rowActionMode = "none",
    rowClickable,
    onRowClick,
    getRowTitle,
    getRowSubtitle,
    getRowSummary,
    getRowActions,
}) {
    const [search, setSearch] = useState("");
    const [sortState, setSortState] = useState({ key: null, direction: "asc" });
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [visibilityOpen, setVisibilityOpen] = useState(false);
    const [filters, setFilters] = useState([]);
    const [activeRow, setActiveRow] = useState(null);
    const [columnVisibility, setColumnVisibility] = useColumnVisibility(columns);
    const deferredSearch = useDeferredValue(search);

    const filterableColumns = useMemo(() => columns.filter((column) => column.filterable), [columns]);

    const filteredRows = useMemo(() => {
        const query = deferredSearch.trim().toLowerCase();
        let nextRows = [...rows];

        if (query) {
            nextRows = nextRows.filter((row) =>
                searchFields.some((field) => normalizeValue(row?.[field]).toLowerCase().includes(query))
            );
        }

        if (filters.length) {
            nextRows = nextRows.filter((row) =>
                filters.every((filter) => {
                    if (!filter.columnKey || !filter.values?.length) {
                        return true;
                    }

                    const column = columns.find((entry) => entry.key === filter.columnKey);
                    if (!column) {
                        return true;
                    }

                    return filter.values.includes(getColumnValue(row, column));
                })
            );
        }

        if (sortState.key) {
            nextRows.sort((left, right) => {
                const column = columns.find(
                    (entry) => entry.sortKey === sortState.key || entry.key === sortState.key
                );
                const leftValue = column ? getColumnValue(left, column) : left?.[sortState.key];
                const rightValue = column ? getColumnValue(right, column) : right?.[sortState.key];
                const result = compareValues(leftValue, rightValue);
                return sortState.direction === "asc" ? result : -result;
            });
        }

        return nextRows;
    }, [columns, deferredSearch, filters, rows, searchFields, sortState]);

    const visibleColumns = useMemo(
        () => columns.filter((column) => column.required || columnVisibility[column.key] !== false),
        [columnVisibility, columns]
    );

    const activeFiltersCount = filters.filter((filter) => filter.columnKey && filter.values?.length).length;

    const {
        containerRef,
        hasMore,
        onScroll,
        totalCount,
        visibleCount,
        visibleItems,
    } = useInfiniteScroll(filteredRows, {
        enabled: infiniteScroll,
        initialCount: DEFAULT_BATCH_SIZE,
        increment: DEFAULT_BATCH_SIZE,
    });

    const canUseRowDialog = rowActionMode !== "none";
    const resolvedRowClickable = rowClickable ?? canUseRowDialog;
    const resolvedTitle = activeRow
        ? (getRowTitle?.(activeRow) ?? normalizeValue(getColumnValue(activeRow, visibleColumns[0] || columns[0] || { key: "id" })))
        : "";
    const resolvedSubtitle = activeRow ? getRowSubtitle?.(activeRow) ?? "" : "";
    const resolvedSummary = activeRow ? getRowSummary?.(activeRow) ?? [] : [];
    const resolvedActions = activeRow
        ? (getRowActions?.(activeRow) || []).map((action) => ({
              ...action,
              onSelect: () => {
                  setActiveRow(null);

                  if (action.href) {
                      window.location.assign(action.href);
                      return;
                  }

                  action.onSelect?.();
              },
          }))
        : [];

    const openRow = (row) => {
        if (onRowClick) {
            onRowClick(row);
        }

        if (!resolvedRowClickable || rowActionMode === "none") {
            return;
        }

        if (rowActionMode === "navigate") {
            const directAction = getRowActions?.(row)?.find((action) => action.href);
            if (directAction?.href) {
                window.location.assign(directAction.href);
            }
            return;
        }

        setActiveRow(row);
    };

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
        <>
            <div className="app-table-wrap overflow-hidden rounded-[28px]">
                <div className="app-table-toolbar flex flex-col gap-4 px-4 py-4 lg:px-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
                            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                                {filteredRows.length} baris
                            </Badge>
                        </div>
                        {description ? <p className="max-w-2xl text-[13px] text-muted-foreground">{description}</p> : null}
                    </div>

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-[19rem]">
                            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder={searchPlaceholder}
                                className="app-input h-9 rounded-2xl pl-10 text-sm"
                            />
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            {toolbar}
                            {filtersEnabled ? (
                                <TableToolbarIconButton
                                    icon={SlidersHorizontalIcon}
                                    label="Filter"
                                    active={activeFiltersCount > 0}
                                    onClick={() => setFiltersOpen(true)}
                                    disabled={!filterableColumns.length}
                                />
                            ) : null}
                            {columnVisibilityEnabled ? (
                                <TableToolbarIconButton
                                    icon={Columns3Icon}
                                    label="Tampilan kolom"
                                    onClick={() => setVisibilityOpen(true)}
                                />
                            ) : null}
                        </div>
                    </div>

                    {activeFiltersCount ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {filters
                                .filter((filter) => filter.columnKey && filter.values?.length)
                                .map((filter) => {
                                    const column = columns.find((entry) => entry.key === filter.columnKey);
                                    return (
                                        <Badge key={filter.id} variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                                            {column?.title}: {filter.values.join(", ")}
                                        </Badge>
                                    );
                                })}
                        </div>
                    ) : null}
                </div>

                <div
                    ref={containerRef}
                    onScroll={onScroll}
                    className={cnValue(tableMaxHeight, mobileMode === "horizontal-scroll" ? "overflow-auto" : "")}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {visibleColumns.map((column) => {
                                    const Icon = column.icon;
                                    const isSorted = sortState.key === column.sortKey;

                                    return (
                                        <TableHead key={column.key} className={column.headerClassName}>
                                            <button
                                                type="button"
                                                onClick={() => handleSort(column)}
                                                className={cnValue(
                                                    "inline-flex w-full items-center gap-2 text-left",
                                                    column.sortKey ? "cursor-pointer" : "cursor-default"
                                                )}
                                            >
                                                {Icon ? (
                                                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_70%,transparent)] text-primary">
                                                        <Icon className="size-3" />
                                                    </span>
                                                ) : null}
                                                <span className="truncate">{column.title}</span>
                                                {column.sortKey ? (
                                                    <span className="ml-auto">
                                                        <SortIndicator active={isSorted} direction={sortState.direction} />
                                                    </span>
                                                ) : null}
                                            </button>
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 8 }).map((_, index) => (
                                      <TableRow key={`loading-${index}`}>
                                          <TableCell colSpan={visibleColumns.length}>
                                              <Skeleton className="h-8 w-full rounded-2xl bg-muted" />
                                          </TableCell>
                                      </TableRow>
                                  ))
                                : visibleItems.length
                                  ? visibleItems.map((row, index) => (
                                        <TableRow
                                            key={row.id ?? index}
                                            data-clickable={resolvedRowClickable ? "true" : "false"}
                                            data-active={activeRow?.id === row.id ? "true" : "false"}
                                            onClick={() => openRow(row)}
                                        >
                                            {visibleColumns.map((column) => (
                                                <TableCell key={column.key} className={cnValue("text-[14px] leading-6", column.cellClassName)}>
                                                    {column.render ? column.render(row) : getColumnValue(row, column)}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                  : (
                                      <TableRow>
                                          <TableCell colSpan={visibleColumns.length} className="py-10 text-center text-sm text-muted-foreground">
                                              {emptyMessage}
                                          </TableCell>
                                      </TableRow>
                                  )}
                        </TableBody>
                    </Table>

                    {!isLoading && visibleItems.length ? (
                        <div className="flex flex-col gap-1 border-t border-border px-4 py-3 text-xs app-table-status sm:flex-row sm:items-center sm:justify-between lg:px-5">
                            <span>
                                Menampilkan {visibleCount} dari {totalCount} baris
                            </span>
                            <span>{hasMore ? "Scroll untuk memuat data berikutnya" : "Semua hasil sudah dimuat"}</span>
                        </div>
                    ) : null}
                </div>
            </div>

            <FilterModal
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                columns={filterableColumns}
                rows={rows}
                value={filters}
                onApply={setFilters}
            />

            <ColumnVisibilityDialog
                open={visibilityOpen}
                onOpenChange={setVisibilityOpen}
                columns={columns}
                value={columnVisibility}
                onApply={setColumnVisibility}
            />

            <RowActionDialog
                open={Boolean(activeRow) && rowActionMode === "action-dialog"}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setActiveRow(null);
                    }
                }}
                title={resolvedTitle}
                subtitle={resolvedSubtitle}
                summary={resolvedSummary}
                actions={resolvedActions}
            />

            <QuickDetailDialog
                open={Boolean(activeRow) && rowActionMode === "quick-detail"}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        setActiveRow(null);
                    }
                }}
                title={resolvedTitle}
                subtitle={resolvedSubtitle}
                summary={resolvedSummary}
                actions={resolvedActions}
            />
        </>
    );
}
