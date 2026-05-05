import React, { useEffect, useMemo, useState } from "react";
import {
    AlertTriangleIcon,
    CalendarClockIcon,
    CheckCircle2Icon,
    CircleDollarSignIcon,
    EyeIcon,
    ImageIcon,
    PencilIcon,
    PlusIcon,
    ReceiptTextIcon,
    TargetIcon,
    Trash2Icon,
    UserPlus2Icon,
    WalletCardsIcon,
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
    InputGroupTextarea,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { AdminDataTable } from "@/admin/data-table";
import {
    buildNestedParams,
    fetchJson,
    formatCurrency,
    formatCurrencyInput,
    formatNumber,
    isoToIndoDate,
    parseCurrencyInput,
    percentage,
    sendForm,
    stripHtml,
    todayYmd,
} from "@/admin/utils";

const PAGE_CARD_CLASS = "app-panel app-panel-elevated rounded-[28px]";
const SUBPANEL_CLASS = "app-subpanel rounded-[24px] p-4";
const EMPTY_PANEL_CLASS = "app-empty rounded-[24px]";

function PageHero({ title, description, actions }) {
    return (
        <section className="app-page-header overflow-hidden rounded-[32px] px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <div className="app-soft-accent mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
                        Workspace
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                        {description}
                    </p>
                </div>
                {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
        </section>
    );
}

function MetricCard({ title, value, hint, icon: Icon, tone = "violet" }) {
    const toneClass = {
        violet: "from-[rgba(var(--app-glow),0.20)] to-[rgba(var(--app-glow),0.06)] text-primary",
        emerald: "from-emerald-500/18 to-violet-500/8 text-emerald-600 dark:text-emerald-300",
        rose: "from-rose-500/18 to-violet-500/8 text-rose-600 dark:text-rose-300",
        sky: "from-sky-500/18 to-violet-500/8 text-sky-600 dark:text-sky-300",
    }[tone];

    return (
        <Card className={PAGE_CARD_CLASS}>
            <CardContent className="flex items-center gap-4 p-5">
                <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${toneClass}`}>
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="truncate text-xl font-semibold text-foreground">{value}</p>
                    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
                </div>
            </CardContent>
        </Card>
    );
}

function useRemoteRows(url, mapRows, deps = []) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const payload = await fetchJson(url);
            const items = Array.isArray(payload?.data) ? payload.data : [];
            setRows(mapRows ? items.map(mapRows) : items);
        } catch (error) {
            toast.error(error.message || "Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, deps); // eslint-disable-line react-hooks/exhaustive-deps

    return { rows, loading, reload: load, setRows };
}

function DialogShell({ open, onOpenChange, title, description, children, footer }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90svh] max-w-4xl p-0">
                <DialogHeader className="shrink-0 border-b border-border bg-transparent px-6 py-5">
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    {children}
                </div>
                {footer ? <DialogFooter className="shrink-0">{footer}</DialogFooter> : null}
            </DialogContent>
        </Dialog>
    );
}

function ResourceDialogFooter({ submitLabel, onSubmit, onClose, dangerLabel, onDanger }) {
    return (
        <>
            {onDanger ? (
                <Button variant="destructive" onClick={onDanger}>
                    <Trash2Icon data-icon="inline-start" />
                    {dangerLabel || "Hapus"}
                </Button>
            ) : null}
            <Button variant="outline" onClick={onClose}>
                Batal
            </Button>
            <Button onClick={onSubmit}>
                <CheckCircle2Icon data-icon="inline-start" />
                {submitLabel}
            </Button>
        </>
    );
}

function DashboardPage({ bootstrap }) {
    const metrics = bootstrap.pageData;
    const [mounted, setMounted] = useState(false);
    const salesChart = useMemo(
        () =>
            Object.entries(metrics.salesPerMonth || {}).map(([month, amount]) => ({
                month: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(
                    new Date(2026, Number(month) - 1, 1)
                ),
                amount,
            })),
        [metrics.salesPerMonth]
    );
    const [events, setEvents] = useState([]);
    const [openForm, setOpenForm] = useState(false);
    const [openList, setOpenList] = useState(false);
    const [selectedDay, setSelectedDay] = useState(todayYmd());
    const [form, setForm] = useState({
        id: "",
        title: "",
        location: "",
        date: todayYmd(),
        start_time: "18:00",
        end_time: "23:00",
        note: "",
    });

    const reloadEvents = async () => {
        const payload = await fetchJson(metrics.routes.events);
        setEvents(payload || []);
    };

    useEffect(() => {
        setMounted(true);
        reloadEvents().catch((error) => toast.error(error.message));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedEvents = events.filter(
        (event) => event?.extendedProps?.db_date === selectedDay
    );

    const openCreate = (date = todayYmd()) => {
        setForm({
            id: "",
            title: "",
            location: "",
            date,
            start_time: "18:00",
            end_time: "23:00",
            note: "",
        });
        setOpenForm(true);
    };

    const openEdit = (event) => {
        setForm({
            id: event.id,
            title: event.title || "",
            location: event.extendedProps?.location || "",
            date: event.extendedProps?.db_date || todayYmd(),
            start_time: event.extendedProps?.db_start_time || "18:00",
            end_time: event.extendedProps?.db_end_time || "23:00",
            note: event.extendedProps?.note || "",
        });
        setOpenForm(true);
    };

    const saveSchedule = async () => {
        try {
            const targetUrl = form.id
                ? `${metrics.routes.base}/${form.id}`
                : metrics.routes.store;
            await fetchJson(targetUrl, {
                method: form.id ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": bootstrap.csrfToken,
                },
                body: JSON.stringify({
                    title: form.title,
                    location: form.location,
                    date: form.date,
                    start_time: form.start_time,
                    end_time: form.end_time,
                    note: form.note,
                }),
            });
            toast.success(form.id ? "Jadwal diperbarui" : "Jadwal ditambahkan");
            setOpenForm(false);
            reloadEvents();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const deleteSchedule = async () => {
        try {
            await fetchJson(`${metrics.routes.base}/${form.id}`, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": bootstrap.csrfToken,
                },
            });
            toast.success("Jadwal dihapus");
            setOpenForm(false);
            reloadEvents();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title="Dashboard keuangan dan jadwal PBRT17"
                description="Ringkasan kas, performa penjualan, proyek aktif, dan jadwal latihan dalam satu workspace operasional yang lebih rapih."
                actions={
                    <Button onClick={() => openCreate()}>
                        <PlusIcon data-icon="inline-start" />
                        Tambah Jadwal
                    </Button>
                }
            />

            <section className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
                <MetricCard
                    title="Kas Saat Ini"
                    value={formatCurrency(metrics.currentCash)}
                    hint="saldo akun utama"
                    icon={WalletCardsIcon}
                    tone="sky"
                />
                <MetricCard
                    title="Laba Bersih"
                    value={formatCurrency(metrics.profit)}
                    hint={`growth ${percentage(metrics.growthProfit)}`}
                    icon={CircleDollarSignIcon}
                    tone="emerald"
                />
                <MetricCard
                    title="Pengeluaran"
                    value={formatCurrency(metrics.totalPurchase)}
                    hint={`growth ${percentage(metrics.growthExpense)}`}
                    icon={ReceiptTextIcon}
                    tone="rose"
                />
                <MetricCard
                    title="Transaksi"
                    value={formatNumber(metrics.totalTransactions)}
                    hint="jumlah pergerakan kas"
                    icon={CalendarClockIcon}
                    tone="violet"
                />
            </section>

            <section className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
                <Card className={PAGE_CARD_CLASS}>
                    <CardHeader>
                        <CardTitle>Pendapatan per bulan</CardTitle>
                        <CardDescription>
                            Menggunakan perhitungan penjualan bersih setelah COGS.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px]">
                        {mounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesChart}>
                                    <defs>
                                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.42} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.04} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" stroke="#64748b" />
                                    <YAxis stroke="#64748b" tickFormatter={(value) => `Rp${formatNumber(value)}`} />
                                    <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#salesFill)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full animate-pulse rounded-[24px] bg-muted" />
                        )}
                    </CardContent>
                </Card>

                <Card className={PAGE_CARD_CLASS}>
                    <CardHeader>
                        <CardTitle>Target proyek</CardTitle>
                        <CardDescription>
                            Prioritas proyek aktif dan persentase pencapaian dana.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        {(metrics.projectTargets || []).map((project) => (
                            <div
                                key={`${project.name}-${project.target_date}`}
                                className={SUBPANEL_CLASS}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-foreground">{project.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Target {project.target_date}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">{project.progress}%</Badge>
                                </div>
                                <div className="mt-3 h-2 rounded-full bg-muted">
                                    <div
                                        className="app-accent-badge h-2 rounded-full"
                                        style={{ width: `${Math.min(100, project.progress)}%` }}
                                    />
                                </div>
                                <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Target Rp {project.target_amount}</span>
                                    <span>Kas Rp {project.saldo}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <Card className={PAGE_CARD_CLASS}>
                <CardHeader>
                    <CardTitle>Kalender jadwal</CardTitle>
                    <CardDescription>
                        Klik tanggal untuk melihat daftar jadwal, atau klik event untuk edit.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {mounted ? (
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            locale="id"
                            events={events}
                            height="auto"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek",
                            }}
                            dateClick={(info) => {
                                setSelectedDay(info.dateStr);
                                setOpenList(true);
                            }}
                            eventClick={(info) => openEdit(info.event)}
                        />
                    ) : (
                        <div className="h-80 animate-pulse rounded-[24px] bg-muted" />
                    )}
                </CardContent>
            </Card>

            <DialogShell
                open={openList}
                onOpenChange={setOpenList}
                title={`Jadwal ${selectedDay}`}
                description="Klik salah satu jadwal untuk mengedit atau buat jadwal baru di tanggal ini."
                footer={
                    <ResourceDialogFooter
                        submitLabel="Tambah Jadwal"
                        onSubmit={() => {
                            setOpenList(false);
                            openCreate(selectedDay);
                        }}
                        onClose={() => setOpenList(false)}
                    />
                }
            >
                <div className="flex flex-col gap-3">
                    {selectedEvents.length ? (
                        selectedEvents.map((event) => (
                            <button
                                type="button"
                                key={event.id}
                                onClick={() => {
                                    setOpenList(false);
                                    openEdit(event);
                                }}
                                className="app-subpanel rounded-[20px] px-4 py-4 text-left transition hover:border-primary/25 hover:bg-accent/60"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-foreground">{event.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {event.extendedProps?.db_start_time} -{" "}
                                            {event.extendedProps?.db_end_time}
                                        </p>
                                    </div>
                                    <Badge variant="secondary">
                                        {event.extendedProps?.location || "Tanpa lokasi"}
                                    </Badge>
                                </div>
                            </button>
                        ))
                    ) : (
                        <Alert>
                            <AlertTriangleIcon />
                            <AlertTitle>Tidak ada jadwal</AlertTitle>
                            <AlertDescription>
                                Belum ada jadwal pada tanggal ini.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </DialogShell>

            <DialogShell
                open={openForm}
                onOpenChange={setOpenForm}
                title={form.id ? "Edit jadwal" : "Tambah jadwal"}
                description="Semua waktu mengikuti Asia/Jakarta."
                footer={
                    <ResourceDialogFooter
                        submitLabel={form.id ? "Simpan Perubahan" : "Simpan Jadwal"}
                        onSubmit={saveSchedule}
                        onClose={() => setOpenForm(false)}
                        dangerLabel="Hapus Jadwal"
                        onDanger={form.id ? deleteSchedule : undefined}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="schedule-title">Judul</FieldLabel>
                        <Input
                            id="schedule-title"
                            value={form.title}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, title: event.target.value }))
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="schedule-location">Lokasi</FieldLabel>
                        <Input
                            id="schedule-location"
                            value={form.location}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, location: event.target.value }))
                            }
                        />
                    </Field>
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="schedule-date">Tanggal</FieldLabel>
                            <Input
                                id="schedule-date"
                                type="date"
                                className="w-full"
                                value={form.date}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, date: event.target.value }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="schedule-start">Mulai</FieldLabel>
                            <Input
                                id="schedule-start"
                                type="time"
                                className="w-full"
                                value={form.start_time}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        start_time: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="schedule-end">Selesai</FieldLabel>
                            <Input
                                id="schedule-end"
                                type="time"
                                className="w-full"
                                value={form.end_time}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, end_time: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="schedule-note">Catatan</FieldLabel>
                        <Textarea
                            id="schedule-note"
                            value={form.note}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, note: event.target.value }))
                            }
                        />
                    </Field>
                </FieldGroup>
            </DialogShell>
        </>
    );
}

function ProductPage({ bootstrap }) {
    const { rows, loading, reload } = useRemoteRows(bootstrap.pageData.routes.data, (row) => ({
        ...row,
        cost_price_value: Number(String(row.cost_price).replace(/\./g, "")),
        sell_price_value: Number(String(row.sell_price).replace(/\./g, "")),
    }));
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(emptyProduct(bootstrap.pageData));
    const [confirmDelete, setConfirmDelete] = useState(null);

    const submit = async () => {
        try {
            const values = buildNestedParams([
                ["name", draft.name],
                ["sku", draft.sku],
                ["unit", draft.unit],
                ["unit_content", draft.pcs_per_unit],
                ["child_product_id", draft.child_product_id],
                ["pcs_per_unit", draft.pcs_per_unit],
                ["cost_price", parseCurrencyInput(draft.cost_price)],
                ["sell_price", parseCurrencyInput(draft.sell_price)],
                ["notes", draft.notes],
                ...(draft.id ? [["_method", "PUT"]] : []),
            ]);
            await sendForm(
                draft.id ? `/products/${draft.id}` : "/products",
                values
            );
            toast.success(draft.id ? "Produk diperbarui" : "Produk ditambahkan");
            setOpen(false);
            setDraft(emptyProduct(bootstrap.pageData));
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const remove = async () => {
        try {
            await sendForm(`/products/${confirmDelete.id}`, buildNestedParams([["_method", "DELETE"]]));
            toast.success("Produk dihapus");
            setConfirmDelete(null);
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title="Stok shuttlecock"
                description="Kelola katalog produk, SKU, relasi produk isi, harga modal, harga jual, dan status stok secara native React."
                actions={
                    <Button
                        onClick={() => {
                            setDraft(emptyProduct(bootstrap.pageData));
                            setOpen(true);
                        }}
                    >
                        <PlusIcon data-icon="inline-start" />
                        Tambah Produk
                    </Button>
                }
            />

            <AdminDataTable
                title="Daftar produk"
                description="Sumber data tetap memakai endpoint `/products/data` yang sudah ada."
                rows={rows}
                isLoading={loading}
                searchFields={["name", "product_name", "sku", "unit"]}
                columns={[
                    { key: "name", title: "Nama Produk", sortKey: "name", render: (row) => row.product_name || row.name },
                    { key: "sku", title: "SKU", sortKey: "sku" },
                    { key: "unit", title: "Satuan", sortKey: "unit" },
                    { key: "cost", title: "Harga Pokok", sortKey: "cost_price_value", render: (row) => formatCurrency(row.cost_price_value) },
                    { key: "sell", title: "Harga Jual", sortKey: "sell_price_value", render: (row) => formatCurrency(row.sell_price_value) },
                    {
                        key: "stock",
                        title: "Stok",
                        sortKey: "stock",
                        render: (row) => (
                            <Badge variant={Number(row.stock) > 0 ? "secondary" : "destructive"}>
                                {row.stock}
                            </Badge>
                        ),
                    },
                    {
                        key: "actions",
                        title: "Aksi",
                        render: (row) => (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setDraft(productDraftFromRow(row));
                                        setOpen(true);
                                    }}
                                >
                                    <PencilIcon data-icon="inline-start" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setConfirmDelete(row)}
                                >
                                    <Trash2Icon data-icon="inline-start" />
                                    Hapus
                                </Button>
                            </div>
                        ),
                    },
                ]}
            />

            <DialogShell
                open={open}
                onOpenChange={setOpen}
                title={draft.id ? "Edit produk" : "Tambah produk"}
                description="Form ini tetap mengirim ke endpoint Laravel yang sama."
                footer={
                    <ResourceDialogFooter
                        submitLabel={draft.id ? "Simpan Produk" : "Tambah Produk"}
                        onSubmit={submit}
                        onClose={() => setOpen(false)}
                    />
                }
            >
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="product-name">Nama Produk</FieldLabel>
                            <Input
                                id="product-name"
                                value={draft.name}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, name: event.target.value }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="product-sku">SKU</FieldLabel>
                            <Input
                                id="product-sku"
                                value={draft.sku}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, sku: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="product-unit">Satuan</FieldLabel>
                            <Input
                                id="product-unit"
                                value={draft.unit}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, unit: event.target.value }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="product-child">Produk Isi (PCS)</FieldLabel>
                            <Select
                                value={String(draft.child_product_id || "")}
                                onValueChange={(value) =>
                                    setDraft((current) => ({
                                        ...current,
                                        child_product_id: value,
                                    }))
                                }
                            >
                                <SelectTrigger id="product-child" className="w-full">
                                    <SelectValue placeholder="Tidak ada" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="">Tidak ada</SelectItem>
                                        {bootstrap.pageData.childProducts.map((product) => (
                                            <SelectItem key={product.id} value={String(product.id)}>
                                                {product.name} ({product.sku})
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="product-pcs">Jumlah PCS / unit</FieldLabel>
                            <Input
                                id="product-pcs"
                                type="number"
                                value={draft.pcs_per_unit}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        pcs_per_unit: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="product-cost">Harga Modal</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>Rp</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="product-cost"
                                    value={draft.cost_price}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            cost_price: formatCurrencyInput(event.target.value),
                                        }))
                                    }
                                />
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="product-sell">Harga Jual</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>Rp</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="product-sell"
                                    value={draft.sell_price}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            sell_price: formatCurrencyInput(event.target.value),
                                        }))
                                    }
                                />
                            </InputGroup>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel htmlFor="product-notes">Catatan</FieldLabel>
                        <Textarea
                            id="product-notes"
                            value={draft.notes}
                            onChange={(event) =>
                                setDraft((current) => ({ ...current, notes: event.target.value }))
                            }
                        />
                    </Field>
                </FieldGroup>
            </DialogShell>

            <AlertDialog open={Boolean(confirmDelete)} onOpenChange={() => setConfirmDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data produk yang dihapus tidak dapat dikembalikan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={remove}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function TransactionPage({ bootstrap, mode }) {
    const pageData = bootstrap.pageData;
    const endpoint = mode === "sale" ? pageData.routes.data : pageData.routes.data;
    const { rows, loading, reload } = useRemoteRows(endpoint, (row) => row);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(emptyTransaction(mode, pageData));

    const submit = async () => {
        try {
            const params = [];
            const root = mode === "sale"
                ? [
                      ["invoice_no", draft.invoice_no],
                      ["sale_date", draft.sale_date],
                      ["customer", draft.partner],
                  ]
                : [
                      ["reference_no", draft.reference_no],
                      ["purchase_date", draft.purchase_date],
                      ["supplier", draft.partner],
                  ];

            root.forEach((entry) => params.push(entry));
            params.push(["paid", parseCurrencyInput(draft.paid)]);
            params.push(["cash_account_id", draft.cash_account_id]);

            draft.items.forEach((item, index) => {
                params.push([`items[${index}][product_id]`, item.product_id]);
                params.push([`items[${index}][qty]`, item.qty]);
                params.push([
                    `items[${index}][${mode === "sale" ? "sell_price" : "cost_per_unit"}]`,
                    parseCurrencyInput(item.price),
                ]);
                params.push([`items[${index}][unit]`, item.unit || ""]);
            });

            await sendForm(pageData.routes.store, buildNestedParams(params));
            toast.success(mode === "sale" ? "Penjualan disimpan" : "Pembelian disimpan");
            setOpen(false);
            setDraft(emptyTransaction(mode, pageData));
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const columns =
        mode === "sale"
            ? [
                  { key: "invoice_no", title: "Invoice", sortKey: "invoice_no", render: (row) => <span>{stripHtml(row.invoice_no)}</span> },
                  { key: "sale_date", title: "Tanggal", sortKey: "sale_date", render: (row) => stripHtml(row.sale_date) },
                  { key: "customer", title: "Pelanggan", sortKey: "customer" },
                  { key: "total", title: "Total", render: (row) => stripHtml(row.total) },
                  { key: "paid", title: "Terbayar", render: (row) => stripHtml(row.paid) },
                  { key: "items_count", title: "Item", render: (row) => stripHtml(row.items_count) },
              ]
            : [
                  { key: "reference_no", title: "Referensi", sortKey: "reference_no", render: (row) => stripHtml(row.reference_no) },
                  { key: "purchase_date", title: "Tanggal", sortKey: "purchase_date", render: (row) => stripHtml(row.purchase_date) },
                  { key: "supplier", title: "Supplier", sortKey: "supplier" },
                  { key: "total", title: "Total", render: (row) => stripHtml(row.total) },
                  { key: "paid", title: "Terbayar", render: (row) => stripHtml(row.paid) },
                  { key: "items_count", title: "Item", render: (row) => stripHtml(row.items_count) },
              ];

    const total = draft.items.reduce(
        (sum, item) =>
            sum + Number(item.qty || 0) * Number(parseCurrencyInput(item.price) || 0),
        0
    );

    return (
        <>
            <PageHero
                title={mode === "sale" ? "Penjualan shuttlecock" : "Pembelian shuttlecock"}
                description="Form transaksi dibangun ulang di React tetapi tetap submit ke service transaksi Laravel yang sama."
                actions={
                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        {mode === "sale" ? "Tambah Penjualan" : "Tambah Pembelian"}
                    </Button>
                }
            />

            <AdminDataTable
                title={mode === "sale" ? "Daftar penjualan" : "Daftar pembelian"}
                description="List tetap memakai endpoint datatable existing."
                rows={rows}
                isLoading={loading}
                searchFields={
                    mode === "sale"
                        ? ["invoice_no", "customer", "sale_date"]
                        : ["reference_no", "supplier", "purchase_date"]
                }
                columns={columns}
            />

            <DialogShell
                open={open}
                onOpenChange={setOpen}
                title={mode === "sale" ? "Tambah penjualan" : "Tambah pembelian"}
                description="Gunakan produk dan akun kas yang sudah tersedia di backend."
                footer={
                    <ResourceDialogFooter
                        submitLabel={mode === "sale" ? "Simpan Penjualan" : "Simpan Pembelian"}
                        onSubmit={submit}
                        onClose={() => setOpen(false)}
                    />
                }
            >
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor={`${mode}-number`}>
                                {mode === "sale" ? "Invoice" : "Referensi"}
                            </FieldLabel>
                            <Input
                                id={`${mode}-number`}
                                value={mode === "sale" ? draft.invoice_no : draft.reference_no}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        [mode === "sale" ? "invoice_no" : "reference_no"]:
                                            event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${mode}-date`}>Tanggal</FieldLabel>
                            <Input
                                id={`${mode}-date`}
                                type="date"
                                value={mode === "sale" ? draft.sale_date : draft.purchase_date}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        [mode === "sale" ? "sale_date" : "purchase_date"]:
                                            event.target.value,
                                    }))
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor={`${mode}-partner`}>
                                {mode === "sale" ? "Pelanggan" : "Supplier"}
                            </FieldLabel>
                            <Input
                                id={`${mode}-partner`}
                                value={draft.partner}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        partner: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>

                    <div className={SUBPANEL_CLASS}>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-foreground">Daftar produk</p>
                                <p className="text-sm text-muted-foreground">
                                    Tambah item sebanyak yang dibutuhkan.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setDraft((current) => ({
                                        ...current,
                                        items: [...current.items, emptyTransactionItem(pageData.products)],
                                    }))
                                }
                            >
                                <PlusIcon data-icon="inline-start" />
                                Tambah Item
                            </Button>
                        </div>
                        <div className="flex flex-col gap-4">
                            {draft.items.map((item, index) => (
                                <div
                                    key={`item-${index}`}
                                    className="app-panel grid gap-3 rounded-[20px] p-4 md:grid-cols-[2fr_100px_180px_120px]"
                                >
                                    <Field>
                                        <FieldLabel>Produk</FieldLabel>
                                        <Select
                                            value={String(item.product_id)}
                                            onValueChange={(value) => {
                                                const product = pageData.products.find(
                                                    (entry) => String(entry.id) === value
                                                );
                                                setDraft((current) => ({
                                                    ...current,
                                                    items: current.items.map((currentItem, currentIndex) =>
                                                        currentIndex === index
                                                            ? {
                                                                  ...currentItem,
                                                                  product_id: value,
                                                                  unit: product?.unit || "",
                                                                  price: formatCurrencyInput(
                                                                      String(
                                                                          mode === "sale"
                                                                              ? product?.sell_price || 0
                                                                              : product?.cost_price || 0
                                                                      )
                                                                  ),
                                                              }
                                                            : currentItem
                                                    ),
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih produk" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {pageData.products.map((product) => (
                                                        <SelectItem key={product.id} value={String(product.id)}>
                                                            {product.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Qty</FieldLabel>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={(event) =>
                                                updateItemDraft(setDraft, index, "qty", event.target.value)
                                            }
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>
                                            {mode === "sale" ? "Harga Jual" : "Harga Beli"}
                                        </FieldLabel>
                                        <InputGroup>
                                            <InputGroupAddon>
                                                <InputGroupText>Rp</InputGroupText>
                                            </InputGroupAddon>
                                            <InputGroupInput
                                                value={item.price}
                                                onChange={(event) =>
                                                    updateItemDraft(
                                                        setDraft,
                                                        index,
                                                        "price",
                                                        formatCurrencyInput(event.target.value)
                                                    )
                                                }
                                            />
                                        </InputGroup>
                                    </Field>
                                    <Field>
                                        <FieldLabel>Subtotal</FieldLabel>
                                        <div className="app-subpanel flex h-8 items-center rounded-lg px-3 text-sm font-medium text-foreground/85">
                                            {formatCurrency(
                                                Number(item.qty || 0) *
                                                    Number(parseCurrencyInput(item.price) || 0)
                                            )}
                                        </div>
                                    </Field>
                                    <div className="md:col-span-4">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setDraft((current) => ({
                                                    ...current,
                                                    items:
                                                        current.items.length === 1
                                                            ? current.items
                                                            : current.items.filter((_, currentIndex) => currentIndex !== index),
                                                }))
                                            }
                                        >
                                            <Trash2Icon data-icon="inline-start" />
                                            Hapus baris
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>{mode === "sale" ? "Dibayar" : "Terbayar"}</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>Rp</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    value={draft.paid}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            paid: formatCurrencyInput(event.target.value),
                                        }))
                                    }
                                />
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel>Akun kas</FieldLabel>
                            <Select
                                value={String(draft.cash_account_id)}
                                onValueChange={(value) =>
                                    setDraft((current) => ({
                                        ...current,
                                        cash_account_id: value,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih akun kas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {pageData.cashAccounts.map((account) => (
                                            <SelectItem key={account.id} value={String(account.id)}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </div>

                    <div className="app-soft-accent rounded-[20px] px-4 py-3 text-sm font-medium">
                        Total transaksi: {formatCurrency(total)}
                    </div>
                </FieldGroup>
            </DialogShell>
        </>
    );
}

function CashAccountsPage({ bootstrap }) {
    const { rows, loading, reload } = useRemoteRows(
        bootstrap.pageData.routes.data,
        (row) => row
    );
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState({ name: "", code: "", balance: "" });

    const submit = async () => {
        try {
            await sendForm(
                bootstrap.pageData.routes.store,
                buildNestedParams([
                    ["name", draft.name],
                    ["code", draft.code],
                    ["balance", parseCurrencyInput(draft.balance)],
                ])
            );
            toast.success("Akun kas ditambahkan");
            setOpen(false);
            setDraft({ name: "", code: "", balance: "" });
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title="Akun kas"
                description="Kelola akun kas yang menjadi sumber transaksi dan target proyek."
                actions={
                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Tambah Akun
                    </Button>
                }
            />

            <AdminDataTable
                title="Daftar akun kas"
                description="Data diambil dari endpoint `/cash` dengan mode AJAX."
                rows={rows}
                isLoading={loading}
                searchFields={["name", "code"]}
                columns={[
                    { key: "name", title: "Nama Akun", sortKey: "name" },
                    { key: "code", title: "Kode", sortKey: "code" },
                    { key: "balance", title: "Saldo", render: (row) => <span>{stripHtml(row.balance)}</span> },
                    {
                        key: "action",
                        title: "Aksi",
                        render: (row) => (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/cash/${row.id}/transactions`}>
                                    <EyeIcon data-icon="inline-start" />
                                    Detail
                                </a>
                            </Button>
                        ),
                    },
                ]}
            />

            <DialogShell
                open={open}
                onOpenChange={setOpen}
                title="Tambah akun kas"
                description="Tetap mengirim ke endpoint Laravel yang sudah dipakai form lama."
                footer={
                    <ResourceDialogFooter
                        submitLabel="Simpan Akun"
                        onSubmit={submit}
                        onClose={() => setOpen(false)}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="cash-name">Nama akun</FieldLabel>
                        <Input
                            id="cash-name"
                            value={draft.name}
                            onChange={(event) =>
                                setDraft((current) => ({ ...current, name: event.target.value }))
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="cash-code">Kode akun</FieldLabel>
                        <Input
                            id="cash-code"
                            value={draft.code}
                            onChange={(event) =>
                                setDraft((current) => ({ ...current, code: event.target.value }))
                            }
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="cash-balance">Saldo awal</FieldLabel>
                        <InputGroup>
                            <InputGroupAddon>
                                <InputGroupText>Rp</InputGroupText>
                            </InputGroupAddon>
                            <InputGroupInput
                                id="cash-balance"
                                value={draft.balance}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        balance: formatCurrencyInput(event.target.value),
                                    }))
                                }
                            />
                        </InputGroup>
                    </Field>
                </FieldGroup>
            </DialogShell>
        </>
    );
}

function CashTransactionsPage({ bootstrap }) {
    const { rows, loading, reload } = useRemoteRows(
        bootstrap.pageData.routes.data,
        (row) => row
    );
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState({
        type: "in",
        amount: "",
        description: "",
        refCode: "",
        refValue: "",
    });

    const submit = async () => {
        try {
            await sendForm(
                bootstrap.pageData.routes.store,
                buildNestedParams([
                    ["cash_account_id", bootstrap.pageData.account.id],
                    ["type", draft.type],
                    ["amount", parseCurrencyInput(draft.amount)],
                    ["description", draft.description],
                    [
                        "reference_type",
                        draft.refCode && draft.refValue
                            ? `${draft.refCode}-${draft.refValue}`
                            : "",
                    ],
                ])
            );
            toast.success("Transaksi ditambahkan");
            setOpen(false);
            setDraft({ type: "in", amount: "", description: "", refCode: "", refValue: "" });
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title={`Transaksi kas ${bootstrap.pageData.account.name}`}
                description="Mutasi akun kas dengan running balance dari endpoint Laravel yang sama."
                actions={
                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Tambah Transaksi
                    </Button>
                }
            />

            <AdminDataTable
                title="Riwayat transaksi"
                description="Debit, kredit, dan saldo berjalan akun kas."
                rows={rows}
                isLoading={loading}
                searchFields={["description", "reference", "created_at"]}
                columns={[
                    { key: "created_at", title: "Tanggal", render: (row) => stripHtml(row.created_at) },
                    { key: "type_label", title: "Tipe", render: (row) => stripHtml(row.type_label) },
                    { key: "description", title: "Deskripsi" },
                    { key: "amount", title: "Nominal", render: (row) => stripHtml(row.amount) },
                    { key: "saldo_after", title: "Saldo Setelah", render: (row) => stripHtml(row.saldo_after) },
                    { key: "reference", title: "Referensi" },
                ]}
            />

            <DialogShell
                open={open}
                onOpenChange={setOpen}
                title="Tambah transaksi kas"
                description="Kombinasi kode referensi mengikuti format lama."
                footer={
                    <ResourceDialogFooter
                        submitLabel="Simpan Transaksi"
                        onSubmit={submit}
                        onClose={() => setOpen(false)}
                    />
                }
            >
                <FieldGroup>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>Tipe</FieldLabel>
                            <Select
                                value={draft.type}
                                onValueChange={(value) =>
                                    setDraft((current) => ({ ...current, type: value }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="in">Masuk</SelectItem>
                                        <SelectItem value="out">Keluar</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel>Nominal</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>Rp</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    value={draft.amount}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            amount: formatCurrencyInput(event.target.value),
                                        }))
                                    }
                                />
                            </InputGroup>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel>Deskripsi</FieldLabel>
                        <Textarea
                            value={draft.description}
                            onChange={(event) =>
                                setDraft((current) => ({
                                    ...current,
                                    description: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>Kode referensi</FieldLabel>
                            <Select
                                value={draft.refCode}
                                onValueChange={(value) =>
                                    setDraft((current) => ({ ...current, refCode: value }))
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Pilih kode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {["PUR", "GTG", "IUR", "BUY", "SELL"].map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {code}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel>Nilai referensi</FieldLabel>
                            <Input
                                value={draft.refValue}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        refValue: event.target.value,
                                    }))
                                }
                            />
                            <FieldDescription>
                                Hasil akhir:{" "}
                                {draft.refCode && draft.refValue
                                    ? `${draft.refCode}-${draft.refValue}`
                                    : "-"}
                            </FieldDescription>
                        </Field>
                    </div>
                </FieldGroup>
            </DialogShell>
        </>
    );
}

function ProjectTargetsPage({ bootstrap }) {
    const { rows, loading, reload } = useRemoteRows(
        bootstrap.pageData.routes.data,
        (row) => row
    );
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState({
        id: "",
        name: "",
        target_amount: "",
        target_date: todayYmd(),
        cash_account_id: "",
        notes: "",
    });
    const [confirmDelete, setConfirmDelete] = useState(null);

    const submit = async () => {
        try {
            await sendForm(
                draft.id ? `/projects/${draft.id}` : "/projects",
                buildNestedParams([
                    ["name", draft.name],
                    ["target_amount", parseCurrencyInput(draft.target_amount)],
                    ["target_date", draft.target_date],
                    ["cash_account_id", draft.cash_account_id],
                    ["notes", draft.notes],
                    ...(draft.id ? [["_method", "PATCH"]] : []),
                ])
            );
            toast.success(draft.id ? "Target diperbarui" : "Target ditambahkan");
            setOpen(false);
            setDraft({
                id: "",
                name: "",
                target_amount: "",
                target_date: todayYmd(),
                cash_account_id: "",
                notes: "",
            });
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const remove = async () => {
        try {
            await sendForm(`/projects/${confirmDelete.id}`, buildNestedParams([["_method", "DELETE"]]));
            toast.success("Target dihapus");
            setConfirmDelete(null);
            reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title="Target proyek"
                description="Target pembangunan dengan progress otomatis berdasarkan saldo kas terkait."
                actions={
                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon data-icon="inline-start" />
                        Tambah Target
                    </Button>
                }
            />

            <AdminDataTable
                title="Daftar target"
                description="Menggunakan endpoint proyek yang ada."
                rows={rows}
                isLoading={loading}
                searchFields={["name", "status"]}
                columns={[
                    { key: "name", title: "Nama Proyek", sortKey: "name" },
                    { key: "target_amount", title: "Target Dana", render: (row) => formatCurrency(row.target_amount) },
                    { key: "target_date", title: "Target", render: (row) => isoToIndoDate(row.target_date) },
                    { key: "cash_account_name", title: "Kas", render: (row) => row.cash_account?.name || row.cash_account_name },
                    { key: "achievement", title: "Pencapaian", render: (row) => <Badge variant="secondary">{row.achievement}%</Badge> },
                    { key: "status", title: "Status", render: (row) => <Badge>{row.status}</Badge> },
                    {
                        key: "actions",
                        title: "Aksi",
                        render: (row) => (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setDraft({
                                            id: row.id,
                                            name: row.name,
                                            target_amount: formatCurrencyInput(row.target_amount),
                                            target_date: row.target_date,
                                            cash_account_id: String(row.cash_account_id || row.cash_account?.id || ""),
                                            notes: row.notes || "",
                                        });
                                        setOpen(true);
                                    }}
                                >
                                    <PencilIcon data-icon="inline-start" />
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setConfirmDelete(row)}
                                >
                                    <Trash2Icon data-icon="inline-start" />
                                    Hapus
                                </Button>
                            </div>
                        ),
                    },
                ]}
            />

            <DialogShell
                open={open}
                onOpenChange={setOpen}
                title={draft.id ? "Edit target proyek" : "Tambah target proyek"}
                description="Target dan status tetap dihitung oleh backend."
                footer={
                    <ResourceDialogFooter
                        submitLabel={draft.id ? "Simpan Target" : "Tambah Target"}
                        onSubmit={submit}
                        onClose={() => setOpen(false)}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel>Nama proyek</FieldLabel>
                        <Input
                            value={draft.name}
                            onChange={(event) =>
                                setDraft((current) => ({ ...current, name: event.target.value }))
                            }
                        />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field>
                            <FieldLabel>Target dana</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>
                                    <InputGroupText>Rp</InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    value={draft.target_amount}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            target_amount: formatCurrencyInput(event.target.value),
                                        }))
                                    }
                                />
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel>Tanggal target</FieldLabel>
                            <Input
                                type="date"
                                value={draft.target_date}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        target_date: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel>Sumber kas</FieldLabel>
                        <Select
                            value={String(draft.cash_account_id)}
                            onValueChange={(value) =>
                                setDraft((current) => ({ ...current, cash_account_id: value }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih kas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {bootstrap.pageData.cashAccounts.map((account) => (
                                        <SelectItem key={account.id} value={String(account.id)}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel>Catatan</FieldLabel>
                        <Textarea
                            value={draft.notes}
                            onChange={(event) =>
                                setDraft((current) => ({ ...current, notes: event.target.value }))
                            }
                        />
                    </Field>
                </FieldGroup>
            </DialogShell>

            <AlertDialog open={Boolean(confirmDelete)} onOpenChange={() => setConfirmDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus target proyek?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus target dari daftar aktif.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={remove}>Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function ReportsPage({ bootstrap }) {
    const [from, setFrom] = useState(bootstrap.pageData.from);
    const [to, setTo] = useState(bootstrap.pageData.to);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const payload = await fetchJson(
                `${bootstrap.pageData.routes.data}?from=${from}&to=${to}`
            );
            setRows(payload?.data || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <>
            <PageHero
                title="Rekap stok"
                description="Laporan mutasi stok berbasis periode dengan saldo awal, masuk, keluar, dan saldo akhir."
                actions={
                    <>
                        <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
                        <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
                        <Button onClick={load}>
                            <EyeIcon data-icon="inline-start" />
                            Tampilkan
                        </Button>
                    </>
                }
            />

            <AdminDataTable
                title="Laporan stok"
                rows={rows}
                isLoading={loading}
                searchFields={["product", "sku", "unit"]}
                columns={[
                    { key: "product", title: "Produk", render: (row) => stripHtml(row.product) },
                    { key: "sku", title: "SKU", render: (row) => stripHtml(row.sku) },
                    { key: "saldo_awal", title: "Saldo Awal", render: (row) => stripHtml(row.saldo_awal) },
                    { key: "masuk", title: "Masuk", render: (row) => stripHtml(row.masuk) },
                    { key: "keluar", title: "Keluar", render: (row) => stripHtml(row.keluar) },
                    { key: "saldo_akhir", title: "Saldo Akhir", render: (row) => stripHtml(row.saldo_akhir) },
                    { key: "unit", title: "Unit", render: (row) => stripHtml(row.unit) },
                ]}
            />
        </>
    );
}

function RolesIndexPage({ bootstrap }) {
    const pageData = bootstrap.pageData;
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openRole, setOpenRole] = useState(false);
    const [openUserRole, setOpenUserRole] = useState(false);
    const [draftRole, setDraftRole] = useState({ id: "", name: "", permissions: [] });
    const [draftUserRole, setDraftUserRole] = useState({ role_id: "", user_id: "" });

    const loadUsers = async () => {
        setLoading(true);
        try {
            const payload = await fetchJson(pageData.routes.datatable);
            setRows(payload?.data || []);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const submitRole = async () => {
        try {
            await sendForm(
                draftRole.id ? `/roles/${draftRole.id}` : "/roles",
                buildNestedParams([
                    ["name", draftRole.name],
                    ...draftRole.permissions.map((permission) => ["permissions[]", permission]),
                    ...(draftRole.id ? [["_method", "PUT"]] : []),
                ])
            );
            toast.success(draftRole.id ? "Role diperbarui" : "Role ditambahkan");
            window.location.reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const submitUserRole = async () => {
        try {
            const payload = await sendForm(
                pageData.routes.addUser,
                buildNestedParams([
                    ["role_id", draftUserRole.role_id],
                    ["user_id", draftUserRole.user_id],
                ])
            );
            toast.success(payload.success || "User ditambahkan ke role");
            setOpenUserRole(false);
            loadUsers();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title="Manajemen user dan role"
                description="Kelola role, permission, dan assignment user tanpa mengubah backend Spatie yang sudah berjalan."
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setDraftUserRole({
                                    role_id: pageData.roles[0]?.id ? String(pageData.roles[0].id) : "",
                                    user_id: pageData.users[0]?.id ? String(pageData.users[0].id) : "",
                                });
                                setOpenUserRole(true);
                            }}
                        >
                            <UserPlus2Icon data-icon="inline-start" />
                            Tambah User ke Role
                        </Button>
                        <Button
                            onClick={() => {
                                setDraftRole({ id: "", name: "", permissions: [] });
                                setOpenRole(true);
                            }}
                        >
                            <PlusIcon data-icon="inline-start" />
                            Add Role
                        </Button>
                    </>
                }
            />

            <section className="grid gap-4 lg:grid-cols-3">
                {pageData.roles.map((role) => (
                    <Card key={role.id} className={PAGE_CARD_CLASS}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between gap-2">
                                <span>{role.name}</span>
                                <Badge variant="secondary">{role.users_count} user</Badge>
                            </CardTitle>
                            <CardDescription>
                                Role untuk akses menu dan fitur tertentu.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-3">
                            <div className="flex -space-x-3">
                                {(role.users || []).slice(0, 4).map((user) => (
                                    <Avatar key={user.id} className="size-10 border-2 border-background">
                                        <AvatarImage src={user.foto_profile_url} alt={user.name} />
                                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                    try {
                                        const payload = await fetchJson(
                                            `/roles/${role.id}/permissions`
                                        );
                                        setDraftRole({
                                            id: role.id,
                                            name: role.name,
                                            permissions: payload.permissions || [],
                                        });
                                        setOpenRole(true);
                                    } catch (error) {
                                        toast.error(error.message);
                                    }
                                }}
                            >
                                <PencilIcon data-icon="inline-start" />
                                Edit
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <AdminDataTable
                title="User role matrix"
                description="List user diambil dari endpoint server-side lama dan difilter di sisi React."
                rows={rows}
                isLoading={loading}
                searchFields={["full_name", "email", "role"]}
                columns={[
                    {
                        key: "user",
                        title: "User",
                        render: (row) => (
                            <div className="flex items-center gap-3">
                                <Avatar className="size-10 rounded-2xl">
                                    <AvatarImage src={row.foto_profile_url} alt={row.full_name} />
                                    <AvatarFallback className="rounded-2xl">
                                        {initials(row.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-foreground">{row.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{row.email}</p>
                                </div>
                            </div>
                        ),
                    },
                    { key: "role", title: "Role", sortKey: "role" },
                    { key: "status", title: "Status", render: (row) => <Badge variant="secondary">{row.status}</Badge> },
                    {
                        key: "actions",
                        title: "Aksi",
                        render: (row) => (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/roles/user/${row.id}`}>
                                    <EyeIcon data-icon="inline-start" />
                                    Profil
                                </a>
                            </Button>
                        ),
                    },
                ]}
            />

            <DialogShell
                open={openRole}
                onOpenChange={setOpenRole}
                title={draftRole.id ? "Edit role" : "Tambah role"}
                description="Pilih permission yang memang diperlukan."
                footer={
                    <ResourceDialogFooter
                        submitLabel={draftRole.id ? "Simpan Role" : "Tambah Role"}
                        onSubmit={submitRole}
                        onClose={() => setOpenRole(false)}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel>Nama role</FieldLabel>
                        <Input
                            value={draftRole.name}
                            onChange={(event) =>
                                setDraftRole((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                        />
                    </Field>
                    <div className={SUBPANEL_CLASS}>
                        <p className="mb-3 text-sm font-medium text-muted-foreground">Permissions</p>
                        <div className="grid gap-3 md:grid-cols-2">
                            {pageData.permissions.map((permission) => (
                                <label
                                    key={permission.name}
                                    className="app-panel flex items-center gap-3 rounded-2xl px-4 py-3 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={draftRole.permissions.includes(permission.name)}
                                        onChange={(event) =>
                                            setDraftRole((current) => ({
                                                ...current,
                                                permissions: event.target.checked
                                                    ? [...current.permissions, permission.name]
                                                    : current.permissions.filter(
                                                          (item) => item !== permission.name
                                                      ),
                                            }))
                                        }
                                    />
                                    <span>{permission.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </FieldGroup>
            </DialogShell>

            <DialogShell
                open={openUserRole}
                onOpenChange={setOpenUserRole}
                title="Tambah user ke role"
                description="Action ini tetap memakai endpoint `/roles/add-user`."
                footer={
                    <ResourceDialogFooter
                        submitLabel="Tambahkan User"
                        onSubmit={submitUserRole}
                        onClose={() => setOpenUserRole(false)}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel>Role</FieldLabel>
                        <Select
                            value={draftUserRole.role_id}
                            onValueChange={(value) =>
                                setDraftUserRole((current) => ({ ...current, role_id: value }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {pageData.roles.map((role) => (
                                        <SelectItem key={role.id} value={String(role.id)}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field>
                        <FieldLabel>User</FieldLabel>
                        <Select
                            value={draftUserRole.user_id}
                            onValueChange={(value) =>
                                setDraftUserRole((current) => ({ ...current, user_id: value }))
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {pageData.users.map((user) => (
                                        <SelectItem key={user.id} value={String(user.id)}>
                                            {user.name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </FieldGroup>
            </DialogShell>
        </>
    );
}

function RoleProfilePage({ bootstrap }) {
    const user = bootstrap.pageData.user;
    const [draftProfile, setDraftProfile] = useState({
        name: user.name || "",
        username: user.username || "",
        phone_number: user.phone_number || "",
        perumahan: user.perumahan || "",
        blok_rumah: user.blok_rumah || "",
        no_rumah: user.no_rumah || "",
    });
    const [openProfile, setOpenProfile] = useState(false);
    const [openPhotoProfile, setOpenPhotoProfile] = useState(false);
    const [openPhotoHouse, setOpenPhotoHouse] = useState(false);
    const [profileFile, setProfileFile] = useState(null);
    const [houseFile, setHouseFile] = useState(null);

    const submitProfile = async () => {
        try {
            await sendForm(
                bootstrap.pageData.routes.updateProfile,
                buildNestedParams([
                    ...Object.entries(draftProfile),
                    ["_method", "PUT"],
                ])
            );
            window.location.reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const submitPhoto = async (type) => {
        try {
            const formData = new FormData();
            formData.append("_method", "PUT");
            formData.append(
                type === "profile" ? "foto_profile" : "foto_rumah",
                type === "profile" ? profileFile : houseFile
            );
            await sendForm(
                type === "profile"
                    ? bootstrap.pageData.routes.updatePhotoProfile
                    : bootstrap.pageData.routes.updatePhotoHouse,
                formData
            );
            window.location.reload();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHero
                title={user.name}
                description="Profil anggota, kontak, alamat, dan foto rumah di workspace admin baru."
                actions={
                    <Button variant="outline" asChild>
                        <a href="/roles">
                            <EyeIcon data-icon="inline-start" />
                            Kembali ke manajemen user
                        </a>
                    </Button>
                }
            />

            <section className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                <Card className={`${PAGE_CARD_CLASS} overflow-hidden`}>
                    <div className="h-48 w-full bg-muted">
                        {user.foto_rumah_url ? (
                            <img
                                src={user.foto_rumah_url}
                                alt="Foto rumah"
                                className="h-full w-full object-cover"
                            />
                        ) : null}
                    </div>
                    <CardContent className="relative px-6 pb-6 pt-0">
                        <Avatar className="-mt-12 size-24 rounded-[28px] border-4 border-background shadow-lg">
                            <AvatarImage src={user.foto_profile_url} alt={user.name} />
                            <AvatarFallback className="rounded-[28px]">{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold text-foreground">{user.name}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setOpenPhotoProfile(true)}>
                                    <ImageIcon data-icon="inline-start" />
                                    Foto Profil
                                </Button>
                                <Button onClick={() => setOpenProfile(true)}>
                                    <PencilIcon data-icon="inline-start" />
                                    Edit Profil
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className={PAGE_CARD_CLASS}>
                    <CardHeader>
                        <CardTitle>Informasi user</CardTitle>
                        <CardDescription>Data profil dan domisili.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 text-sm">
                        <InfoRow label="Username" value={user.username || "-"} />
                        <InfoRow label="Status" value={user.status_label || "Active"} />
                        <InfoRow label="Roles" value={(user.roles || []).map((role) => role.name).join(", ") || "-"} />
                        <InfoRow label="Perumahan" value={user.perumahan || "-"} />
                        <InfoRow
                            label="Alamat rumah"
                            value={`Blok ${user.blok_rumah || "-"}, No. ${user.no_rumah || "-"}`}
                        />
                        <InfoRow label="Kontak" value={user.phone_number || "-"} />
                        <InfoRow label="Joined" value={user.joined_at || "-"} />
                        <Button variant="outline" onClick={() => setOpenPhotoHouse(true)}>
                            <ImageIcon data-icon="inline-start" />
                            Ubah Foto Rumah
                        </Button>
                    </CardContent>
                </Card>
            </section>

            <DialogShell
                open={openProfile}
                onOpenChange={setOpenProfile}
                title="Edit data profil"
                footer={
                    <ResourceDialogFooter
                        submitLabel="Simpan Profil"
                        onSubmit={submitProfile}
                        onClose={() => setOpenProfile(false)}
                    />
                }
            >
                <FieldGroup>
                    {Object.entries({
                        name: "Nama Lengkap",
                        username: "Username",
                        phone_number: "Nomor HP",
                        perumahan: "Perumahan",
                        blok_rumah: "Blok",
                        no_rumah: "Nomor Rumah",
                    }).map(([key, label]) => (
                        <Field key={key}>
                            <FieldLabel>{label}</FieldLabel>
                            <Input
                                value={draftProfile[key]}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        [key]: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    ))}
                </FieldGroup>
            </DialogShell>

            <DialogShell
                open={openPhotoProfile}
                onOpenChange={setOpenPhotoProfile}
                title="Ubah foto profil"
                footer={
                    <ResourceDialogFooter
                        submitLabel="Upload Foto"
                        onSubmit={() => submitPhoto("profile")}
                        onClose={() => setOpenPhotoProfile(false)}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel>File foto profil</FieldLabel>
                        <Input type="file" accept="image/*" onChange={(event) => setProfileFile(event.target.files?.[0] || null)} />
                    </Field>
                </FieldGroup>
            </DialogShell>

            <DialogShell
                open={openPhotoHouse}
                onOpenChange={setOpenPhotoHouse}
                title="Ubah foto rumah"
                footer={
                    <ResourceDialogFooter
                        submitLabel="Upload Foto Rumah"
                        onSubmit={() => submitPhoto("house")}
                        onClose={() => setOpenPhotoHouse(false)}
                    />
                }
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel>File foto rumah</FieldLabel>
                        <Input type="file" accept="image/*" onChange={(event) => setHouseFile(event.target.files?.[0] || null)} />
                    </Field>
                </FieldGroup>
            </DialogShell>
        </>
    );
}

function JournalsIndexPage({ bootstrap }) {
    const { rows, loading } = useRemoteRows(bootstrap.pageData.routes.data, (row) => row);

    return (
        <>
            <PageHero
                title="Jurnal umum"
                description="Daftar jurnal dari transaksi yang sudah dibentuk backend."
                actions={
                    <Button variant="outline" asChild>
                        <a href="/dashboard">
                            <EyeIcon data-icon="inline-start" />
                            Kembali ke dashboard
                        </a>
                    </Button>
                }
            />

            <AdminDataTable
                title="Daftar jurnal"
                rows={rows}
                isLoading={loading}
                searchFields={["memo", "reference"]}
                columns={[
                    { key: "date", title: "Tanggal", render: (row) => stripHtml(row.date) },
                    { key: "reference", title: "Referensi", render: (row) => stripHtml(row.reference) },
                    { key: "memo", title: "Keterangan", render: (row) => stripHtml(row.memo) },
                    { key: "debit_total", title: "Debit", render: (row) => stripHtml(row.debit_total) },
                    { key: "credit_total", title: "Kredit", render: (row) => stripHtml(row.credit_total) },
                    {
                        key: "action",
                        title: "Aksi",
                        render: (row) => (
                            <Button variant="outline" size="sm" asChild>
                                <a href={`/accounting/journals/${row.id}`}>
                                    <EyeIcon data-icon="inline-start" />
                                    Detail
                                </a>
                            </Button>
                        ),
                    },
                ]}
            />
        </>
    );
}

function JournalShowPage({ bootstrap }) {
    const { rows, loading } = useRemoteRows(bootstrap.pageData.routes.lines, (row) => row);
    const journal = bootstrap.pageData.journal;

    return (
        <>
            <PageHero
                title={`Jurnal #${journal.id}`}
                description="Detail baris jurnal dan ringkasan referensi."
                actions={
                    <Button variant="outline" asChild>
                        <a href="/accounting">
                            <EyeIcon data-icon="inline-start" />
                            Kembali
                        </a>
                    </Button>
                }
            />

            <Card className={PAGE_CARD_CLASS}>
                <CardHeader>
                    <CardTitle>Informasi jurnal</CardTitle>
                    <CardDescription>Metadata utama transaksi jurnal.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    <InfoRow label="Tanggal" value={journal.date_label} />
                    <InfoRow label="Referensi" value={journal.reference_label} />
                    <InfoRow label="Memo" value={journal.memo || "-"} />
                </CardContent>
            </Card>

            <AdminDataTable
                title="Baris jurnal"
                rows={rows}
                isLoading={loading}
                searchFields={["account", "description"]}
                columns={[
                    { key: "account", title: "Akun", render: (row) => stripHtml(row.account) },
                    { key: "description", title: "Catatan", render: (row) => stripHtml(row.description || row.note) },
                    { key: "debit", title: "Debit", render: (row) => stripHtml(row.debit) },
                    { key: "credit", title: "Kredit", render: (row) => stripHtml(row.credit) },
                ]}
            />
        </>
    );
}

function FallbackPage({ bootstrap }) {
    return (
        <Alert>
            <AlertTriangleIcon />
            <AlertTitle>Halaman belum terpetakan</AlertTitle>
            <AlertDescription>
                Route <strong>{bootstrap.currentRoute}</strong> belum dipasang ke registry React.
            </AlertDescription>
        </Alert>
    );
}

function emptyProduct(pageData) {
    return {
        id: "",
        name: "",
        sku: "",
        unit: "",
        child_product_id: "",
        pcs_per_unit: "12",
        cost_price: "",
        sell_price: "",
        notes: "",
    };
}

function productDraftFromRow(row) {
    return {
        id: row.id,
        name: row.product_name || row.name || "",
        sku: row.sku || "",
        unit: row.unit || "",
        child_product_id: String(row.child_product_id || ""),
        pcs_per_unit: String(row.pcs_per_unit || 12),
        cost_price: formatCurrencyInput(String(row.cost_price_value || row.cost_price || 0)),
        sell_price: formatCurrencyInput(String(row.sell_price_value || row.sell_price || 0)),
        notes: row.notes || "",
    };
}

function emptyTransaction(mode, pageData) {
    return {
        invoice_no: "",
        reference_no: "",
        sale_date: todayYmd(),
        purchase_date: todayYmd(),
        partner: "",
        paid: "",
        cash_account_id: pageData.cashAccounts?.[0]?.id
            ? String(pageData.cashAccounts[0].id)
            : "",
        items: [emptyTransactionItem(pageData.products)],
    };
}

function emptyTransactionItem(products) {
    const firstProduct = products?.[0];
    return {
        product_id: firstProduct?.id ? String(firstProduct.id) : "",
        qty: "1",
        price: "",
        unit: firstProduct?.unit || "",
    };
}

function updateItemDraft(setDraft, index, key, value) {
    setDraft((current) => ({
        ...current,
        items: current.items.map((item, currentIndex) =>
            currentIndex === index ? { ...item, [key]: value } : item
        ),
    }));
}

function InfoRow({ label, value }) {
    return (
        <div className={`${SUBPANEL_CLASS} gap-1`}>
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
        </div>
    );
}

function initials(name) {
    return String(name || "PB")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

const registry = {
    dashboard: DashboardPage,
    products: ProductPage,
    penjualan: (props) => <TransactionPage {...props} mode="sale" />,
    pembelian: (props) => <TransactionPage {...props} mode="purchase" />,
    cash: CashAccountsPage,
    "cash-transactions": CashTransactionsPage,
    projects: ProjectTargetsPage,
    reports: ReportsPage,
    roles: RolesIndexPage,
    "roles-user": RoleProfilePage,
    journals: JournalsIndexPage,
    "journals-show": JournalShowPage,
};

export function getAdminPage(pageKey) {
    return registry[pageKey] || FallbackPage;
}
