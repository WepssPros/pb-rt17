import React, { useEffect, useMemo, useState } from "react";
import {
    ArrowDownLeftIcon,
    ArrowUpRightIcon,
    AlertTriangleIcon,
    BadgeInfoIcon,
    BoxesIcon,
    Building2Icon,
    CalendarDaysIcon,
    CalendarClockIcon,
    CheckCircle2Icon,
    CheckIcon,
    CircleDotIcon,
    CircleDollarSignIcon,
    Clock3Icon,
    EyeIcon,
    FileCode2Icon,
    FileTextIcon,
    HashIcon,
    HouseIcon,
    ImageIcon,
    ImageUpIcon,
    LandmarkIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    PlusIcon,
    Package2Icon,
    ReceiptTextIcon,
    ShieldCheckIcon,
    TargetIcon,
    Trash2Icon,
    TypeIcon,
    UploadIcon,
    UserRoundIcon,
    WalletIcon,
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
    getTransactionTone,
    MoneyValueCell,
    TableMetaCell,
    TransactionTypeBadge,
} from "@/admin/table-cells";
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
const DIALOG_FORM_GAP = "gap-5";
const EMPTY_SELECT_VALUE = "__empty__";

function cx(...values) {
    return values.filter(Boolean).join(" ");
}

function spanClass(span = "full") {
    return {
        full: "col-span-12",
        half: "col-span-12 md:col-span-6",
        third: "col-span-12 md:col-span-4",
        twoThirds: "col-span-12 md:col-span-8",
        quarter: "col-span-12 md:col-span-3",
    }[span] || "col-span-12";
}

function FormGrid({ className, children }) {
    return <div className={cx("grid grid-cols-12", DIALOG_FORM_GAP, className)}>{children}</div>;
}

function resolveFieldPlaceholder(id = "", type = "text", kind = "input") {
    const key = String(id || "").toLowerCase();

    if (kind === "select") {
        if (key.includes("product-child")) return "Pilih produk isi";
        if (key.includes("ref-code")) return "Pilih kode referensi";
        if (key.includes("cash-account")) return "Pilih akun kas";
        if (key.includes("role")) return "Pilih role";
        if (key.includes("user")) return "Pilih user";
        return "Pilih data";
    }

    if (kind === "textarea") {
        if (key.includes("note") || key.includes("notes")) return "Tulis catatan tambahan";
        if (key.includes("description")) return "Tulis deskripsi";
        return "Tulis informasi tambahan";
    }

    if (kind === "money") {
        if (key.includes("cost")) return "Masukkan harga modal";
        if (key.includes("sell")) return "Masukkan harga jual";
        if (key.includes("balance")) return "Masukkan saldo awal";
        if (key.includes("amount")) return "Masukkan nominal";
        if (key.includes("target")) return "Masukkan target dana";
        return "Masukkan nominal";
    }

    if (type === "date") return "Pilih tanggal";
    if (type === "time") return "Pilih waktu";
    if (type === "number") return "Masukkan angka";

    if (key.includes("name")) return "Masukkan nama";
    if (key.includes("sku")) return "Masukkan SKU";
    if (key.includes("unit")) return "Contoh: pcs atau tube";
    if (key.includes("location")) return "Masukkan lokasi";
    if (key.includes("title")) return "Masukkan judul";
    if (key.includes("number") || key.includes("invoice") || key.includes("reference")) return "Masukkan nomor referensi";
    if (key.includes("customer")) return "Masukkan nama pelanggan";
    if (key.includes("supplier")) return "Masukkan nama supplier";
    if (key.includes("code")) return "Masukkan kode";
    if (key.includes("value")) return "Masukkan nilai";
    if (key.includes("phone")) return "Masukkan nomor telepon";
    if (key.includes("email")) return "Masukkan email";

    return "Masukkan data";
}

function FieldHeading({ icon: Icon, label, htmlFor }) {
    return (
        <FieldLabel htmlFor={htmlFor} className="mb-1.5 gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[color-mix(in_oklab,var(--accent)_66%,transparent)] text-primary dark:bg-[color-mix(in_oklab,var(--accent)_32%,transparent)]">
                <Icon className="size-3" />
            </span>
            <span>{label}</span>
        </FieldLabel>
    );
}

function TextControl({ id, icon: Icon, className, type = "text", placeholder, ...props }) {
    return (
        <div className="relative">
            {Icon ? (
                <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
                    <Icon className="size-4" />
                </span>
            ) : null}
            <Input
                id={id}
                type={type}
                placeholder={placeholder || resolveFieldPlaceholder(id, type)}
                className={cx("app-input rounded-lg", Icon ? "pl-11" : "", className)}
                {...props}
            />
        </div>
    );
}

function TextareaControl({ id, icon: Icon, className, placeholder, ...props }) {
    return (
        <div className="relative">
            {Icon ? (
                <span className="pointer-events-none absolute left-3.5 top-4 z-10 text-muted-foreground">
                    <Icon className="size-4" />
                </span>
            ) : null}
            <Textarea
                id={id}
                placeholder={placeholder || resolveFieldPlaceholder(id, "text", "textarea")}
                className={cx("rounded-lg", Icon ? "pl-11" : "", className)}
                {...props}
            />
        </div>
    );
}

function SelectControl({ id, icon: Icon, value, onValueChange, placeholder, children, triggerClassName }) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <div className="relative">
                {Icon ? (
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground">
                        <Icon className="size-4" />
                    </span>
                ) : null}
                <SelectTrigger id={id} className={cx("app-input rounded-lg", Icon ? "pl-11" : "", triggerClassName)}>
                    <SelectValue placeholder={placeholder || resolveFieldPlaceholder(id, "text", "select")} />
                </SelectTrigger>
            </div>
            <SelectContent>{children}</SelectContent>
        </Select>
    );
}

function MoneyControl({ id, icon: Icon = WalletIcon, className, placeholder, ...props }) {
    return (
        <InputGroup className={cx("rounded-lg", className)}>
            <InputGroupAddon className="pl-3">
                <Icon className="size-4" />
                <InputGroupText>Rp</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
                id={id}
                placeholder={placeholder || resolveFieldPlaceholder(id, "text", "money")}
                className="pl-1.5"
                {...props}
            />
        </InputGroup>
    );
}

function ReadonlyField({ icon: Icon, value, className }) {
    return (
        <div className={cx("app-subpanel flex h-11 items-center gap-2.5 rounded-2xl px-3.5 text-sm font-medium text-foreground/88", className)}>
            {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
            <span className="truncate">{value}</span>
        </div>
    );
}

function UploadField({ label, helper, file, onChange, accept = "image/*" }) {
    const inputId = React.useId();

    return (
        <div className="app-subpanel rounded-[20px] p-5">
            <div className="flex flex-col gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
                    {helper ? <p className="mt-1 text-sm text-muted-foreground">{helper}</p> : null}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label htmlFor={inputId}>
                        <input
                            id={inputId}
                            type="file"
                            accept={accept}
                            className="sr-only"
                            onChange={(event) => onChange(event.target.files?.[0] || null)}
                        />
                        <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-[color-mix(in_oklab,var(--surface)_96%,transparent)] px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted">
                            <UploadIcon className="size-4" />
                            Pilih File
                        </span>
                    </label>
                    <div className="min-w-0 text-sm text-muted-foreground">
                        {file?.name || "Belum ada file dipilih"}
                    </div>
                </div>
            </div>
        </div>
    );
}

function PermissionCheck({ label, checked, onChange }) {
    return (
        <label className="app-panel group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-foreground transition hover:border-primary/25 hover:bg-accent/35">
            <span className="relative">
                <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
                <span
                    className={cx(
                        "flex size-5 items-center justify-center rounded-md border transition peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/25",
                        checked
                            ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_30%,transparent)]"
                            : "border-border bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] text-transparent"
                    )}
                >
                    <CheckIcon className="size-3.5" />
                </span>
            </span>
            <span>{label}</span>
        </label>
    );
}

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
                <FormGrid>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading htmlFor="schedule-title" icon={TypeIcon} label="Judul" />
                            <TextControl
                                id="schedule-title"
                                icon={TypeIcon}
                                value={form.title}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, title: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading htmlFor="schedule-location" icon={MapPinIcon} label="Lokasi" />
                            <TextControl
                                id="schedule-location"
                                icon={MapPinIcon}
                                value={form.location}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, location: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("third")}>
                        <Field>
                            <FieldHeading htmlFor="schedule-date" icon={CalendarDaysIcon} label="Tanggal" />
                            <TextControl
                                id="schedule-date"
                                icon={CalendarDaysIcon}
                                type="date"
                                value={form.date}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, date: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("third")}>
                        <Field>
                            <FieldHeading htmlFor="schedule-start" icon={Clock3Icon} label="Mulai" />
                            <TextControl
                                id="schedule-start"
                                icon={Clock3Icon}
                                type="time"
                                value={form.start_time}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        start_time: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("third")}>
                        <Field>
                            <FieldHeading htmlFor="schedule-end" icon={Clock3Icon} label="Selesai" />
                            <TextControl
                                id="schedule-end"
                                icon={Clock3Icon}
                                type="time"
                                value={form.end_time}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, end_time: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading htmlFor="schedule-note" icon={FileTextIcon} label="Catatan" />
                            <TextareaControl
                                id="schedule-note"
                                icon={FileTextIcon}
                                value={form.note}
                                onChange={(event) =>
                                    setForm((current) => ({ ...current, note: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                </FormGrid>
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
                [
                    "child_product_id",
                    draft.child_product_id === EMPTY_SELECT_VALUE ? "" : draft.child_product_id,
                ],
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
                title="Produk"
                description="Katalog produk, SKU, harga, dan stok aktif."
                rows={rows}
                isLoading={loading}
                searchFields={["name", "product_name", "sku", "unit"]}
                rowActionMode="action-dialog"
                getRowTitle={(row) => row.product_name || row.name}
                getRowSubtitle={(row) => `${row.sku || "-"} · ${row.unit || "-"}`}
                getRowSummary={(row) => [
                    { label: "Nama Produk", value: row.product_name || row.name, icon: Package2Icon },
                    { label: "SKU", value: row.sku || "-", icon: HashIcon },
                    { label: "Satuan", value: row.unit || "-", icon: BoxesIcon },
                    { label: "Harga Jual", value: formatCurrency(row.sell_price_value), icon: CircleDollarSignIcon },
                    { label: "Harga Pokok", value: formatCurrency(row.cost_price_value), icon: WalletIcon },
                    { label: "Stok", value: String(row.stock ?? 0), icon: BoxesIcon },
                ]}
                getRowActions={(row) => [
                    {
                        key: "delete",
                        label: "Hapus",
                        icon: Trash2Icon,
                        tone: "destructive",
                        onSelect: () => setConfirmDelete(row),
                    },
                    {
                        key: "edit",
                        label: "Edit Produk",
                        icon: PencilIcon,
                        tone: "primary",
                        onSelect: () => {
                            setDraft(productDraftFromRow(row));
                            setOpen(true);
                        },
                    },
                ]}
                columns={[
                    {
                        key: "name",
                        title: "Nama Produk",
                        icon: Package2Icon,
                        sortKey: "name",
                        required: true,
                        filterable: true,
                        filterAccessor: (row) => row.product_name || row.name,
                        render: (row) => (
                            <TableMetaCell
                                icon={Package2Icon}
                                value={row.product_name || row.name}
                                truncate
                                maxLength={28}
                                textClassName="font-medium text-foreground"
                            />
                        ),
                    },
                    {
                        key: "sku",
                        title: "SKU",
                        icon: HashIcon,
                        sortKey: "sku",
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={HashIcon}
                                value={row.sku}
                                textClassName="font-medium tracking-[0.02em] text-muted-foreground"
                            />
                        ),
                    },
                    {
                        key: "unit",
                        title: "Satuan",
                        icon: BoxesIcon,
                        sortKey: "unit",
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={BoxesIcon}
                                value={row.unit}
                                textClassName="font-medium lowercase text-muted-foreground"
                            />
                        ),
                    },
                    {
                        key: "cost",
                        title: "Harga Pokok",
                        icon: WalletIcon,
                        sortKey: "cost_price_value",
                        render: (row) => (
                            <MoneyValueCell value={formatCurrency(row.cost_price_value)} tone="balance" />
                        ),
                    },
                    {
                        key: "sell",
                        title: "Harga Jual",
                        icon: CircleDollarSignIcon,
                        sortKey: "sell_price_value",
                        render: (row) => (
                            <MoneyValueCell value={formatCurrency(row.sell_price_value)} tone="balance" />
                        ),
                    },
                    {
                        key: "stock",
                        title: "Stok",
                        icon: BoxesIcon,
                        sortKey: "stock",
                        filterable: true,
                        render: (row) => (
                            <Badge variant={Number(row.stock) > 0 ? "secondary" : "destructive"}>
                                {row.stock}
                            </Badge>
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
                <FormGrid>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading htmlFor="product-name" icon={Package2Icon} label="Nama Produk" />
                            <TextControl
                                id="product-name"
                                icon={Package2Icon}
                                value={draft.name}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, name: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading htmlFor="product-sku" icon={HashIcon} label="SKU" />
                            <TextControl
                                id="product-sku"
                                icon={HashIcon}
                                value={draft.sku}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, sku: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading htmlFor="product-unit" icon={BoxesIcon} label="Satuan" />
                            <TextControl
                                id="product-unit"
                                icon={BoxesIcon}
                                value={draft.unit}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, unit: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading htmlFor="product-child" icon={Package2Icon} label="Produk Isi (PCS)" />
                            <SelectControl
                                id="product-child"
                                icon={Package2Icon}
                                value={String(draft.child_product_id || EMPTY_SELECT_VALUE)}
                                onValueChange={(value) =>
                                    setDraft((current) => ({
                                        ...current,
                                        child_product_id: value,
                                    }))
                                }
                                placeholder="Tidak ada"
                            >
                                <SelectGroup>
                                    <SelectItem value={EMPTY_SELECT_VALUE}>Tidak ada</SelectItem>
                                    {bootstrap.pageData.childProducts.map((product) => (
                                        <SelectItem key={product.id} value={String(product.id)}>
                                            {product.name} ({product.sku})
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectControl>
                        </Field>
                    </div>
                    <div className={spanClass("third")}>
                        <Field>
                            <FieldHeading htmlFor="product-pcs" icon={BoxesIcon} label="Jumlah PCS / unit" />
                            <TextControl
                                id="product-pcs"
                                icon={BoxesIcon}
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
                    </div>
                    <div className={spanClass("third")}>
                        <Field>
                            <FieldHeading htmlFor="product-cost" icon={WalletIcon} label="Harga Modal" />
                            <MoneyControl
                                id="product-cost"
                                icon={WalletIcon}
                                value={draft.cost_price}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        cost_price: formatCurrencyInput(event.target.value),
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("third")}>
                        <Field>
                            <FieldHeading htmlFor="product-sell" icon={CircleDollarSignIcon} label="Harga Jual" />
                            <MoneyControl
                                id="product-sell"
                                icon={CircleDollarSignIcon}
                                value={draft.sell_price}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        sell_price: formatCurrencyInput(event.target.value),
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading htmlFor="product-notes" icon={FileTextIcon} label="Catatan" />
                            <TextareaControl
                                id="product-notes"
                                icon={FileTextIcon}
                                value={draft.notes}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, notes: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                </FormGrid>
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
                  {
                      key: "invoice_no",
                      title: "Invoice",
                      icon: FileCode2Icon,
                      sortKey: "invoice_no",
                      required: true,
                      filterable: true,
                      render: (row) => (
                          <TableMetaCell
                              icon={FileCode2Icon}
                              value={row.invoice_no}
                              truncate
                              maxLength={28}
                              textClassName="font-medium text-foreground"
                          />
                      ),
                  },
                  {
                      key: "sale_date",
                      title: "Tanggal",
                      icon: CalendarDaysIcon,
                      sortKey: "sale_date",
                      filterable: true,
                      render: (row) => (
                          <TableMetaCell icon={CalendarDaysIcon} value={row.sale_date} textClassName="font-medium" />
                      ),
                  },
                  {
                      key: "customer",
                      title: "Pelanggan",
                      icon: UserRoundIcon,
                      sortKey: "customer",
                      filterable: true,
                      render: (row) => (
                          <TableMetaCell
                              icon={UserRoundIcon}
                              value={row.customer}
                              truncate
                              maxLength={24}
                              textClassName="font-medium text-foreground"
                          />
                      ),
                  },
                  {
                      key: "total",
                      title: "Total",
                      icon: WalletIcon,
                      render: (row) => <MoneyValueCell value={row.total} tone="balance" />,
                  },
                  {
                      key: "paid",
                      title: "Terbayar",
                      icon: WalletCardsIcon,
                      render: (row) => <MoneyValueCell value={row.paid} tone="credit" />,
                  },
                  {
                      key: "items_count",
                      title: "Item",
                      icon: BoxesIcon,
                      render: (row) => (
                          <TableMetaCell icon={BoxesIcon} value={row.items_count} textClassName="text-[13px]" />
                      ),
                  },
              ]
            : [
                  {
                      key: "reference_no",
                      title: "Referensi",
                      icon: ReceiptTextIcon,
                      sortKey: "reference_no",
                      required: true,
                      filterable: true,
                      render: (row) => (
                          <TableMetaCell
                              icon={ReceiptTextIcon}
                              value={row.reference_no}
                              truncate
                              maxLength={28}
                              textClassName="font-medium text-foreground"
                          />
                      ),
                  },
                  {
                      key: "purchase_date",
                      title: "Tanggal",
                      icon: CalendarDaysIcon,
                      sortKey: "purchase_date",
                      filterable: true,
                      render: (row) => (
                          <TableMetaCell icon={CalendarDaysIcon} value={row.purchase_date} textClassName="font-medium" />
                      ),
                  },
                  {
                      key: "supplier",
                      title: "Supplier",
                      icon: Building2Icon,
                      sortKey: "supplier",
                      filterable: true,
                      render: (row) => (
                          <TableMetaCell
                              icon={Building2Icon}
                              value={row.supplier}
                              truncate
                              maxLength={24}
                              textClassName="font-medium text-foreground"
                          />
                      ),
                  },
                  {
                      key: "total",
                      title: "Total",
                      icon: WalletIcon,
                      render: (row) => <MoneyValueCell value={row.total} tone="balance" />,
                  },
                  {
                      key: "paid",
                      title: "Terbayar",
                      icon: WalletCardsIcon,
                      render: (row) => <MoneyValueCell value={row.paid} tone="credit" />,
                  },
                  {
                      key: "items_count",
                      title: "Item",
                      icon: BoxesIcon,
                      render: (row) => (
                          <TableMetaCell icon={BoxesIcon} value={row.items_count} textClassName="text-[13px]" />
                      ),
                  },
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
                title={mode === "sale" ? "Penjualan" : "Pembelian"}
                description={mode === "sale" ? "Riwayat invoice dan pembayaran." : "Riwayat referensi dan pembayaran pembelian."}
                rows={rows}
                isLoading={loading}
                searchFields={
                    mode === "sale"
                        ? ["invoice_no", "customer", "sale_date"]
                        : ["reference_no", "supplier", "purchase_date"]
                }
                rowActionMode="quick-detail"
                getRowTitle={(row) =>
                    mode === "sale" ? stripHtml(row.invoice_no) : stripHtml(row.reference_no)
                }
                getRowSubtitle={(row) =>
                    mode === "sale"
                        ? `${stripHtml(row.sale_date)} · ${stripHtml(row.customer || "-")}`
                        : `${stripHtml(row.purchase_date)} · ${stripHtml(row.supplier || "-")}`
                }
                getRowSummary={(row) =>
                    mode === "sale"
                        ? [
                              { label: "Invoice", value: stripHtml(row.invoice_no), icon: FileCode2Icon },
                              { label: "Tanggal", value: stripHtml(row.sale_date), icon: CalendarDaysIcon },
                              { label: "Pelanggan", value: stripHtml(row.customer || "-"), icon: UserRoundIcon },
                              { label: "Total", value: stripHtml(row.total), icon: WalletIcon },
                              { label: "Terbayar", value: stripHtml(row.paid), icon: WalletCardsIcon },
                              { label: "Item", value: stripHtml(row.items_count), icon: BoxesIcon },
                              { label: "Catatan", value: stripHtml(row.note || "-"), icon: FileTextIcon },
                          ]
                        : [
                              { label: "Referensi", value: stripHtml(row.reference_no), icon: ReceiptTextIcon },
                              { label: "Tanggal", value: stripHtml(row.purchase_date), icon: CalendarDaysIcon },
                              { label: "Supplier", value: stripHtml(row.supplier || "-"), icon: Building2Icon },
                              { label: "Total", value: stripHtml(row.total), icon: WalletIcon },
                              { label: "Terbayar", value: stripHtml(row.paid), icon: WalletCardsIcon },
                              { label: "Item", value: stripHtml(row.items_count), icon: BoxesIcon },
                              { label: "Catatan", value: stripHtml(row.note || "-"), icon: FileTextIcon },
                          ]
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
                <div className="flex flex-col gap-5">
                    <FormGrid>
                        <div className={spanClass("third")}>
                            <Field>
                                <FieldHeading
                                    htmlFor={`${mode}-number`}
                                    icon={mode === "sale" ? FileCode2Icon : ReceiptTextIcon}
                                    label={mode === "sale" ? "Invoice" : "Referensi"}
                                />
                                <ReadonlyField
                                    icon={mode === "sale" ? FileCode2Icon : ReceiptTextIcon}
                                    value={mode === "sale" ? draft.invoice_no : draft.reference_no}
                                    className="h-[44px]"
                                />
                            </Field>
                        </div>
                        <div className={spanClass("third")}>
                            <Field>
                                <FieldHeading htmlFor={`${mode}-date`} icon={CalendarDaysIcon} label="Tanggal" />
                                <TextControl
                                    id={`${mode}-date`}
                                    icon={CalendarDaysIcon}
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
                        </div>
                        <div className={spanClass("third")}>
                            <Field>
                                <FieldHeading
                                    htmlFor={`${mode}-partner`}
                                    icon={UserRoundIcon}
                                    label={mode === "sale" ? "Pelanggan" : "Supplier"}
                                />
                                <TextControl
                                    id={`${mode}-partner`}
                                    icon={UserRoundIcon}
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
                    </FormGrid>

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
                                    className="app-panel flex flex-col gap-4 rounded-[20px] p-4"
                                >
                                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                                        <div className="flex-1 min-w-0">
                                            <Field>
                                                <FieldHeading icon={Package2Icon} label="Produk" />
                                                <SelectControl
                                                    icon={Package2Icon}
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
                                                                                  Math.floor(
                                                                                      Number(
                                                                                          mode === "sale"
                                                                                              ? product?.sell_price || 0
                                                                                              : product?.cost_price || 0
                                                                                      )
                                                                                  )
                                                                              )
                                                                          ),
                                                                      }
                                                                    : currentItem
                                                            ),
                                                        }));
                                                    }}
                                                    placeholder="Pilih produk"
                                                    triggerClassName="!h-[44px]"
                                                >
                                                    <SelectGroup>
                                                        {pageData.products.map((product) => (
                                                            <SelectItem key={product.id} value={String(product.id)}>
                                                                {product.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
                                                </SelectControl>
                                            </Field>
                                        </div>
                                        <div className="w-full md:w-[150px] shrink-0">
                                            <Field>
                                                <FieldHeading icon={BoxesIcon} label="Qty" />
                                                <TextControl
                                                    icon={BoxesIcon}
                                                    type="number"
                                                    min="1"
                                                    value={item.qty}
                                                    className="!h-[44px]"
                                                    onChange={(event) =>
                                                        updateItemDraft(setDraft, index, "qty", event.target.value)
                                                    }
                                                />
                                            </Field>
                                        </div>
                                        <div className="shrink-0 pb-0.5">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/15 hover:text-destructive w-full md:w-11 !h-[44px]"
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
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-3">
                                        <div className="flex-1 min-w-0">
                                            <Field>
                                                <FieldHeading
                                                    icon={mode === "sale" ? CircleDollarSignIcon : WalletIcon}
                                                    label={mode === "sale" ? "Harga Jual" : "Harga Beli"}
                                                />
                                                <MoneyControl
                                                    icon={mode === "sale" ? CircleDollarSignIcon : WalletIcon}
                                                    value={item.price}
                                                    className="!h-[44px]"
                                                    onChange={(event) =>
                                                        updateItemDraft(
                                                            setDraft,
                                                            index,
                                                            "price",
                                                            formatCurrencyInput(event.target.value)
                                                        )
                                                    }
                                                />
                                            </Field>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Field>
                                                <FieldHeading icon={ReceiptTextIcon} label="Subtotal" />
                                                <ReadonlyField
                                                    icon={ReceiptTextIcon}
                                                    className="!h-[44px]"
                                                    value={formatCurrency(
                                                        Number(item.qty || 0) *
                                                            Number(parseCurrencyInput(item.price) || 0)
                                                    )}
                                                />
                                            </Field>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <FormGrid>
                        <div className={spanClass("half")}>
                            <Field>
                                <FieldHeading
                                    htmlFor={`${mode}-paid`}
                                    icon={WalletIcon}
                                    label={mode === "sale" ? "Dibayar" : "Terbayar"}
                                />
                                <MoneyControl
                                    id={`${mode}-paid`}
                                    icon={WalletIcon}
                                    value={draft.paid}
                                    onChange={(event) =>
                                        setDraft((current) => ({
                                            ...current,
                                            paid: formatCurrencyInput(event.target.value),
                                        }))
                                    }
                                />
                            </Field>
                        </div>
                        <div className={spanClass("half")}>
                            <Field>
                                <FieldHeading icon={LandmarkIcon} label="Akun kas" />
                                <SelectControl
                                    icon={LandmarkIcon}
                                    value={String(draft.cash_account_id)}
                                    onValueChange={(value) =>
                                        setDraft((current) => ({
                                            ...current,
                                            cash_account_id: value,
                                        }))
                                    }
                                    placeholder="Pilih akun kas"
                                >
                                    <SelectGroup>
                                        {pageData.cashAccounts.map((account) => (
                                            <SelectItem key={account.id} value={String(account.id)}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectControl>
                            </Field>
                        </div>
                    </FormGrid>

                    <div className="app-soft-accent rounded-[20px] px-4 py-3 text-sm font-medium">
                        Total transaksi: {formatCurrency(total)}
                    </div>
                </div>
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
                title="Akun kas"
                description="Saldo dan kode akun kas aktif."
                rows={rows}
                isLoading={loading}
                searchFields={["name", "code"]}
                rowActionMode="action-dialog"
                getRowTitle={(row) => stripHtml(row.name || "-")}
                getRowSubtitle={(row) => stripHtml(row.code || "-")}
                getRowSummary={(row) => [
                    { label: "Nama Akun", value: stripHtml(row.name || "-"), icon: LandmarkIcon },
                    { label: "Kode", value: stripHtml(row.code || "-"), icon: HashIcon },
                    { label: "Saldo", value: stripHtml(row.balance || "-"), icon: WalletIcon },
                ]}
                getRowActions={(row) => [
                    {
                        key: "detail",
                        label: "Lihat Detail",
                        icon: EyeIcon,
                        tone: "primary",
                        href: `/cash/${row.id}/transactions`,
                    },
                ]}
                columns={[
                    {
                        key: "name",
                        title: "Nama Akun",
                        icon: LandmarkIcon,
                        sortKey: "name",
                        required: true,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={LandmarkIcon}
                                value={row.name}
                                truncate
                                maxLength={24}
                                textClassName="font-medium text-foreground"
                            />
                        ),
                    },
                    {
                        key: "code",
                        title: "Kode",
                        icon: HashIcon,
                        sortKey: "code",
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={HashIcon}
                                value={row.code}
                                textClassName="font-medium tracking-[0.02em] text-muted-foreground"
                            />
                        ),
                    },
                    {
                        key: "balance",
                        title: "Saldo",
                        icon: WalletIcon,
                        render: (row) => <MoneyValueCell value={row.balance} tone="balance" />,
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
                <FormGrid>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading htmlFor="cash-name" icon={LandmarkIcon} label="Nama akun" />
                            <TextControl
                                id="cash-name"
                                icon={LandmarkIcon}
                                value={draft.name}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, name: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading htmlFor="cash-code" icon={HashIcon} label="Kode akun" />
                            <TextControl
                                id="cash-code"
                                icon={HashIcon}
                                value={draft.code}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, code: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading htmlFor="cash-balance" icon={WalletIcon} label="Saldo awal" />
                            <MoneyControl
                                id="cash-balance"
                                icon={WalletIcon}
                                value={draft.balance}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        balance: formatCurrencyInput(event.target.value),
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </FormGrid>
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
                title="Transaksi kas"
                description="Debit, kredit, dan saldo berjalan."
                rows={rows}
                isLoading={loading}
                searchFields={["description", "reference", "created_at"]}
                rowActionMode="quick-detail"
                getRowTitle={(row) => stripHtml(row.description || row.reference || "Transaksi kas")}
                getRowSubtitle={(row) => `${stripHtml(row.created_at)} · ${stripHtml(row.type_label || "-")}`}
                getRowSummary={(row) => [
                    { label: "Tanggal", value: stripHtml(row.created_at), icon: CalendarDaysIcon },
                    {
                        label: "Tipe",
                        value: <TransactionTypeBadge value={row.type_label || "-"} />,
                        icon: CircleDotIcon,
                        tone: getTransactionTone(row.type_label),
                    },
                    {
                        label: "Nominal",
                        value: <MoneyValueCell value={row.amount || "-"} tone={getTransactionTone(row.type_label)} />,
                        icon: WalletIcon,
                        tone: getTransactionTone(row.type_label),
                    },
                    {
                        label: "Saldo Setelah",
                        value: <MoneyValueCell value={row.saldo_after || "-"} tone="balance" />,
                        icon: WalletCardsIcon,
                        tone: "balance",
                    },
                    { label: "Referensi", value: stripHtml(row.reference || "-"), icon: HashIcon },
                    { label: "Deskripsi", value: stripHtml(row.description || "-"), icon: FileTextIcon },
                ]}
                columns={[
                    {
                        key: "created_at",
                        title: "Tanggal",
                        icon: CalendarDaysIcon,
                        filterable: true,
                        render: (row) => stripHtml(row.created_at),
                    },
                    {
                        key: "type_label",
                        title: "Tipe",
                        icon: CircleDotIcon,
                        filterable: true,
                        render: (row) => <TransactionTypeBadge value={row.type_label} />,
                    },
                    {
                        key: "description",
                        title: "Deskripsi",
                        icon: FileTextIcon,
                        required: true,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={FileTextIcon}
                                value={row.description}
                                truncate
                                maxLength={20}
                                textClassName="text-[13px]"
                            />
                        ),
                    },
                    {
                        key: "amount",
                        title: "Nominal",
                        icon: WalletIcon,
                        render: (row) => (
                            <MoneyValueCell
                                value={row.amount}
                                tone={getTransactionTone(row.type_label)}
                            />
                        ),
                    },
                    {
                        key: "saldo_after",
                        title: "Saldo Setelah",
                        icon: WalletCardsIcon,
                        render: (row) => <MoneyValueCell value={row.saldo_after} tone="balance" />,
                    },
                    {
                        key: "reference",
                        title: "Referensi",
                        icon: HashIcon,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell icon={HashIcon} value={row.reference} textClassName="text-[13px]" />
                        ),
                    },
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
                <FormGrid>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={CircleDotIcon} label="Tipe" />
                            <SelectControl
                                icon={CircleDotIcon}
                                value={draft.type}
                                onValueChange={(value) =>
                                    setDraft((current) => ({ ...current, type: value }))
                                }
                            >
                                <SelectGroup>
                                    <SelectItem value="in">Masuk</SelectItem>
                                    <SelectItem value="out">Keluar</SelectItem>
                                </SelectGroup>
                            </SelectControl>
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={WalletIcon} label="Nominal" />
                            <MoneyControl
                                icon={WalletIcon}
                                value={draft.amount}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        amount: formatCurrencyInput(event.target.value),
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading icon={FileTextIcon} label="Deskripsi" />
                            <TextareaControl
                                icon={FileTextIcon}
                                value={draft.description}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        description: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={BadgeInfoIcon} label="Kode referensi" />
                            <SelectControl
                                icon={BadgeInfoIcon}
                                value={draft.refCode}
                                onValueChange={(value) =>
                                    setDraft((current) => ({ ...current, refCode: value }))
                                }
                                placeholder="Pilih kode"
                            >
                                <SelectGroup>
                                    {["PUR", "GTG", "IUR", "BUY", "SELL"].map((code) => (
                                        <SelectItem key={code} value={code}>
                                            {code}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectControl>
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={HashIcon} label="Nilai referensi" />
                            <TextControl
                                icon={HashIcon}
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
                </FormGrid>
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
                title="Target proyek"
                description="Progress dana dan status target aktif."
                rows={rows}
                isLoading={loading}
                searchFields={["name", "status"]}
                rowActionMode="action-dialog"
                getRowTitle={(row) => stripHtml(row.name || "-")}
                getRowSubtitle={(row) => `${isoToIndoDate(row.target_date)} · ${stripHtml(row.status || "-")}`}
                getRowSummary={(row) => [
                    { label: "Nama Proyek", value: stripHtml(row.name || "-"), icon: TargetIcon },
                    { label: "Target Dana", value: formatCurrency(row.target_amount), icon: WalletIcon },
                    { label: "Target", value: isoToIndoDate(row.target_date), icon: CalendarDaysIcon },
                    {
                        label: "Kas",
                        value: stripHtml(row.cash_account?.name || row.cash_account_name || "-"),
                        icon: LandmarkIcon,
                    },
                    { label: "Pencapaian", value: `${row.achievement}%`, icon: BadgeInfoIcon },
                    { label: "Status", value: stripHtml(row.status || "-"), icon: BadgeInfoIcon },
                ]}
                getRowActions={(row) => [
                    {
                        key: "delete",
                        label: "Hapus",
                        icon: Trash2Icon,
                        tone: "destructive",
                        onSelect: () => setConfirmDelete(row),
                    },
                    {
                        key: "edit",
                        label: "Edit Target",
                        icon: PencilIcon,
                        tone: "primary",
                        onSelect: () => {
                            setDraft({
                                id: row.id,
                                name: row.name,
                                target_amount: formatCurrencyInput(row.target_amount),
                                target_date: row.target_date,
                                cash_account_id: String(row.cash_account_id || row.cash_account?.id || ""),
                                notes: row.notes || "",
                            });
                            setOpen(true);
                        },
                    },
                ]}
                columns={[
                    {
                        key: "name",
                        title: "Nama Proyek",
                        icon: TargetIcon,
                        sortKey: "name",
                        required: true,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={TargetIcon}
                                value={row.name}
                                truncate
                                maxLength={28}
                                textClassName="font-medium text-foreground"
                            />
                        ),
                    },
                    {
                        key: "target_amount",
                        title: "Target Dana",
                        icon: WalletIcon,
                        render: (row) => (
                            <MoneyValueCell value={formatCurrency(row.target_amount)} tone="balance" />
                        ),
                    },
                    {
                        key: "target_date",
                        title: "Target",
                        icon: CalendarDaysIcon,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={CalendarDaysIcon}
                                value={isoToIndoDate(row.target_date)}
                                textClassName="font-medium"
                            />
                        ),
                    },
                    {
                        key: "cash_account_name",
                        title: "Kas",
                        icon: LandmarkIcon,
                        filterable: true,
                        filterAccessor: (row) => row.cash_account?.name || row.cash_account_name,
                        render: (row) => (
                            <TableMetaCell
                                icon={LandmarkIcon}
                                value={row.cash_account?.name || row.cash_account_name}
                                truncate
                                maxLength={24}
                                textClassName="font-medium text-foreground"
                            />
                        ),
                    },
                    {
                        key: "achievement",
                        title: "Pencapaian",
                        icon: BadgeInfoIcon,
                        render: (row) => (
                            <Badge variant="secondary" className="font-semibold">
                                {row.achievement}%
                            </Badge>
                        ),
                    },
                    {
                        key: "status",
                        title: "Status",
                        icon: BadgeInfoIcon,
                        filterable: true,
                        render: (row) => (
                            <Badge variant="outline" className="font-semibold">
                                {row.status}
                            </Badge>
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
                <FormGrid>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading icon={TargetIcon} label="Nama proyek" />
                            <TextControl
                                icon={TargetIcon}
                                value={draft.name}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, name: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={WalletIcon} label="Target dana" />
                            <MoneyControl
                                icon={WalletIcon}
                                value={draft.target_amount}
                                onChange={(event) =>
                                    setDraft((current) => ({
                                        ...current,
                                        target_amount: formatCurrencyInput(event.target.value),
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={CalendarDaysIcon} label="Tanggal target" />
                            <TextControl
                                icon={CalendarDaysIcon}
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
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading icon={LandmarkIcon} label="Sumber kas" />
                            <SelectControl
                                icon={LandmarkIcon}
                                value={String(draft.cash_account_id)}
                                onValueChange={(value) =>
                                    setDraft((current) => ({ ...current, cash_account_id: value }))
                                }
                                placeholder="Pilih kas"
                            >
                                <SelectGroup>
                                    {bootstrap.pageData.cashAccounts.map((account) => (
                                        <SelectItem key={account.id} value={String(account.id)}>
                                            {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectControl>
                        </Field>
                    </div>
                    <div className={spanClass("full")}>
                        <Field>
                            <FieldHeading icon={FileTextIcon} label="Catatan" />
                            <TextareaControl
                                icon={FileTextIcon}
                                value={draft.notes}
                                onChange={(event) =>
                                    setDraft((current) => ({ ...current, notes: event.target.value }))
                                }
                            />
                        </Field>
                    </div>
                </FormGrid>
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
                        <div className="w-full sm:w-[180px]">
                            <TextControl
                                icon={CalendarDaysIcon}
                                type="date"
                                value={from}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-[180px]">
                            <TextControl
                                icon={CalendarDaysIcon}
                                type="date"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                            />
                        </div>
                        <Button onClick={load}>
                            <EyeIcon data-icon="inline-start" />
                            Tampilkan
                        </Button>
                    </>
                }
            />

            <AdminDataTable
                title="Rekap stok"
                rows={rows}
                isLoading={loading}
                searchFields={["product", "sku", "unit"]}
                rowActionMode="quick-detail"
                getRowTitle={(row) => stripHtml(row.product || "-")}
                getRowSubtitle={(row) => `${stripHtml(row.sku || "-")} · ${stripHtml(row.unit || "-")}`}
                getRowSummary={(row) => [
                    { label: "Produk", value: stripHtml(row.product || "-"), icon: Package2Icon },
                    { label: "SKU", value: stripHtml(row.sku || "-"), icon: HashIcon },
                    { label: "Saldo Awal", value: stripHtml(row.saldo_awal || "-"), icon: BoxesIcon },
                    { label: "Masuk", value: stripHtml(row.masuk || "-"), icon: BoxesIcon },
                    { label: "Keluar", value: stripHtml(row.keluar || "-"), icon: BoxesIcon },
                    { label: "Saldo Akhir", value: stripHtml(row.saldo_akhir || "-"), icon: BoxesIcon },
                    { label: "Unit", value: stripHtml(row.unit || "-"), icon: BoxesIcon },
                ]}
                columns={[
                    {
                        key: "product",
                        title: "Produk",
                        icon: Package2Icon,
                        required: true,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={Package2Icon}
                                value={row.product}
                                truncate
                                maxLength={26}
                                textClassName="font-medium text-foreground"
                            />
                        ),
                    },
                    {
                        key: "sku",
                        title: "SKU",
                        icon: HashIcon,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={HashIcon}
                                value={row.sku}
                                textClassName="font-medium tracking-[0.02em] text-muted-foreground"
                            />
                        ),
                    },
                    {
                        key: "saldo_awal",
                        title: "Saldo Awal",
                        icon: BoxesIcon,
                        render: (row) => (
                            <TableMetaCell
                                icon={BoxesIcon}
                                value={row.saldo_awal}
                                tone="balance"
                                textClassName="font-medium"
                            />
                        ),
                    },
                    {
                        key: "masuk",
                        title: "Masuk",
                        icon: BoxesIcon,
                        render: (row) => (
                            <TableMetaCell
                                icon={ArrowUpRightIcon}
                                value={row.masuk}
                                tone="credit"
                                textClassName="font-medium"
                            />
                        ),
                    },
                    {
                        key: "keluar",
                        title: "Keluar",
                        icon: BoxesIcon,
                        render: (row) => (
                            <TableMetaCell
                                icon={ArrowDownLeftIcon}
                                value={row.keluar}
                                tone="debit"
                                textClassName="font-medium"
                            />
                        ),
                    },
                    {
                        key: "saldo_akhir",
                        title: "Saldo Akhir",
                        icon: BoxesIcon,
                        render: (row) => (
                            <TableMetaCell
                                icon={BoxesIcon}
                                value={row.saldo_akhir}
                                tone="balance"
                                textClassName="font-semibold"
                            />
                        ),
                    },
                    {
                        key: "unit",
                        title: "Unit",
                        icon: BoxesIcon,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={BoxesIcon}
                                value={row.unit}
                                textClassName="font-medium lowercase text-muted-foreground"
                            />
                        ),
                    },
                ]}
            />
        </>
    );
}

function RolesIndexPage({ bootstrap }) {
    const pageData = bootstrap.pageData;
    const authUserId = String(bootstrap.authUser?.id ?? "");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openRole, setOpenRole] = useState(false);
    const [openUserRole, setOpenUserRole] = useState(false);
    const [draftRole, setDraftRole] = useState({ id: "", name: "", permissions: [] });
    const [draftUserRole, setDraftUserRole] = useState({ role_id: "", user_id: "" });

    const roleItems = pageData.roles || [];
    const permissionItems = pageData.permissions || [];
    const availableUsers = pageData.users || [];
    const allPermissionNames = permissionItems.map((permission) => permission.name);
    const hasAssignableUsers = availableUsers.length > 0;

    const permissionGroups = useMemo(() => {
        const grouped = permissionItems.reduce((accumulator, permission) => {
            const [groupKey, ...rest] = permission.name.split(".");
            const actionKey = rest.join(".") || permission.name;
            if (!accumulator[groupKey]) {
                accumulator[groupKey] = [];
            }
            accumulator[groupKey].push({
                ...permission,
                actionLabel: actionKey.replaceAll(".", " "),
            });
            return accumulator;
        }, {});

        return Object.entries(grouped).map(([group, items]) => ({
            group,
            title: group.replaceAll("-", " "),
            items,
        }));
    }, [permissionItems]);

    const normalizePermissionNames = (permissions) => {
        if (Array.isArray(permissions)) {
            return permissions.map((item) => String(item));
        }

        if (permissions && typeof permissions === "object") {
            return Object.values(permissions).map((item) => String(item));
        }

        return [];
    };

    const overviewItems = useMemo(
        () => [
            {
                title: "Role aktif",
                value: formatNumber(roleItems.length),
                hint: "Kelompok akses yang tersedia di workspace admin.",
                icon: ShieldCheckIcon,
                tone: "violet",
            },
            {
                title: "Permission tersedia",
                value: formatNumber(permissionItems.length),
                hint: "Hak akses granular yang bisa dipasang ke role.",
                icon: FileCode2Icon,
                tone: "sky",
            },
            {
                title: "User belum ditetapkan",
                value: formatNumber(availableUsers.length),
                hint: hasAssignableUsers
                    ? "Siap dimasukkan ke role yang sesuai."
                    : "Semua user sudah punya role aktif.",
                icon: UserPlus2Icon,
                tone: hasAssignableUsers ? "emerald" : "rose",
            },
        ],
        [availableUsers.length, hasAssignableUsers, permissionItems.length, roleItems.length]
    );

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

    const openRoleEditor = async (role) => {
        try {
            const payload = await fetchJson(`/roles/${role.id}/permissions`);
            setDraftRole({
                id: role.id,
                name: role.name,
                permissions: normalizePermissionNames(payload.permissions),
            });
            setOpenRole(true);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const openUserRoleDialog = (roleId = "") => {
        setDraftUserRole({
            role_id: roleId ? String(roleId) : roleItems[0]?.id ? String(roleItems[0].id) : "",
            user_id: availableUsers[0]?.id ? String(availableUsers[0].id) : "",
        });
        setOpenUserRole(true);
    };

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

    const hasAllPermissions =
        allPermissionNames.length > 0 &&
        allPermissionNames.every((permissionName) => draftRole.permissions.includes(permissionName));

    const togglePermission = (permissionName, checked) => {
        setDraftRole((current) => ({
            ...current,
            permissions: checked
                ? Array.from(new Set([...current.permissions, permissionName]))
                : current.permissions.filter((item) => item !== permissionName),
        }));
    };

    const statusBadgeClass = (status) => {
        const normalized = String(status || "").toLowerCase();

        if (normalized === "active") {
            return "border-emerald-500/25 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300";
        }

        if (normalized === "pending") {
            return "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-300";
        }

        return "border-border bg-secondary text-secondary-foreground";
    };

    return (
        <>
            <PageHero
                title="RBAC management"
                description="Kelola role, permission, dan assignment user aktif dalam satu workspace akses yang lebih rapih."
                actions={
                    <>
                        <Button
                            variant="outline"
                            disabled={!hasAssignableUsers || roleItems.length === 0}
                            onClick={() => openUserRoleDialog()}
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
                            Tambah Role
                        </Button>
                    </>
                }
            />

            <section className="grid gap-4 xl:grid-cols-3">
                {overviewItems.map((item) => (
                    <MetricCard
                        key={item.title}
                        title={item.title}
                        value={item.value}
                        hint={item.hint}
                        icon={item.icon}
                        tone={item.tone}
                    />
                ))}
            </section>

            <section className={`${PAGE_CARD_CLASS} p-5 md:p-6`}>
                <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                            Access groups
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-foreground">Role aktif</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Setiap role merangkum hak akses dan anggota yang menjalankan alur operasional tertentu.
                        </p>
                    </div>
                    <Badge variant="outline" className="h-8 rounded-full px-3 text-[11px] uppercase tracking-[0.18em]">
                        {formatNumber(roleItems.length)} role tersedia
                    </Badge>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-3">
                    {roleItems.map((role) => (
                        <article key={role.id} className="app-subpanel rounded-[24px] border border-border/70 p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        Access group
                                    </p>
                                    <h3 className="mt-2 truncate text-lg font-semibold text-foreground">
                                        {role.name}
                                    </h3>
                                </div>
                                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--accent)_52%,transparent)] text-primary dark:bg-[color-mix(in_oklab,var(--accent)_28%,transparent)]">
                                    <ShieldCheckIcon className="size-5" />
                                </span>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] px-3 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        User
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        {formatNumber(role.users_count || 0)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] px-3 py-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        Permission
                                    </p>
                                    <p className="mt-1 text-lg font-semibold text-foreground">
                                        {formatNumber(role.permissions_count || 0)}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                        Anggota role
                                    </p>
                                    {(role.users || []).length ? (
                                        <div className="mt-2 flex -space-x-3">
                                            {(role.users || []).slice(0, 5).map((user) => (
                                                <Avatar
                                                    key={user.id}
                                                    className="size-10 border-2 border-background shadow-sm"
                                                >
                                                    <AvatarImage src={user.foto_profile_url} alt={user.name} />
                                                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Belum ada user di role ini.
                                        </p>
                                    )}
                                </div>
                                <div className="flex shrink-0 flex-col gap-2">
                                    <Button variant="outline" size="sm" onClick={() => openRoleEditor(role)}>
                                        <PencilIcon data-icon="inline-start" />
                                        Edit Role
                                    </Button>
                                    <Button
                                        size="sm"
                                        disabled={!hasAssignableUsers}
                                        onClick={() => openUserRoleDialog(role.id)}
                                    >
                                        <UserPlus2Icon data-icon="inline-start" />
                                        Tambah User
                                    </Button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <AdminDataTable
                title="Assignment user"
                description="Pantau role aktif per user dan buka profil pribadi bila diperlukan."
                rows={rows}
                isLoading={loading}
                searchFields={["full_name", "email", "role", "status_label"]}
                rowActionMode="action-dialog"
                getRowTitle={(row) => stripHtml(row.full_name || "-")}
                getRowSubtitle={(row) => stripHtml(row.email || "-")}
                getRowSummary={(row) => [
                    { label: "Nama", value: stripHtml(row.full_name || "-"), icon: UserRoundIcon },
                    { label: "Email", value: stripHtml(row.email || "-"), icon: FileTextIcon },
                    { label: "Role", value: stripHtml(row.role || "-"), icon: ShieldCheckIcon },
                    { label: "Status", value: stripHtml(row.status_label || "-"), icon: BadgeInfoIcon },
                    {
                        label: "Foto Profil",
                        value: row.foto_profile_url ? "Tersedia" : "Belum ada",
                        icon: ImageIcon,
                    },
                    {
                        label: "Foto Rumah",
                        value: row.foto_rumah_url ? "Tersedia" : "Belum ada",
                        icon: HouseIcon,
                    },
                ]}
                getRowActions={(row) =>
                    String(row.id) === authUserId
                        ? [
                              {
                                  key: "profile",
                                  label: "Buka Profil",
                                  icon: EyeIcon,
                                  tone: "primary",
                                  href: `/roles/user/${row.id}`,
                              },
                          ]
                        : []
                }
                columns={[
                    {
                        key: "user",
                        title: "User",
                        icon: UserRoundIcon,
                        required: true,
                        filterable: true,
                        filterAccessor: (row) => `${row.full_name} ${row.email}`,
                        render: (row) => (
                            <div className="flex items-center gap-2.5">
                                <Avatar className="size-9 rounded-2xl">
                                    <AvatarImage src={row.foto_profile_url} alt={row.full_name} />
                                    <AvatarFallback className="rounded-2xl">
                                        {initials(row.full_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{row.full_name}</p>
                                    <p className="truncate text-[11px] text-muted-foreground">{row.email}</p>
                                </div>
                            </div>
                        ),
                    },
                    {
                        key: "role",
                        title: "Role",
                        icon: ShieldCheckIcon,
                        sortKey: "role",
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={ShieldCheckIcon}
                                value={stripHtml(row.role || "Belum ada role")}
                                truncate
                                maxLength={22}
                                textClassName="font-medium text-foreground"
                            />
                        ),
                    },
                    {
                        key: "status",
                        title: "Status",
                        icon: BadgeInfoIcon,
                        filterable: true,
                        render: (row) => (
                            <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${statusBadgeClass(
                                    row.status_label
                                )}`}
                            >
                                {row.status_label || "Active"}
                            </span>
                        ),
                    },
                ]}
            />

            <DialogShell
                open={openRole}
                onOpenChange={setOpenRole}
                title={draftRole.id ? "Edit role" : "Tambah role"}
                description="Tentukan nama role dan permission yang memang diperlukan untuk alur kerja ini."
                footer={
                    <ResourceDialogFooter
                        submitLabel={draftRole.id ? "Simpan Role" : "Tambah Role"}
                        onSubmit={submitRole}
                        onClose={() => setOpenRole(false)}
                    />
                }
            >
                <div className="flex flex-col gap-5">
                    <Field>
                        <FieldHeading htmlFor="role-name" icon={ShieldCheckIcon} label="Nama role" />
                        <TextControl
                            id="role-name"
                            icon={ShieldCheckIcon}
                            value={draftRole.name}
                            onChange={(event) =>
                                setDraftRole((current) => ({
                                    ...current,
                                    name: event.target.value,
                                }))
                            }
                            placeholder="Contoh: Bendahara, Admin, Kasir"
                        />
                    </Field>

                    <div className={SUBPANEL_CLASS}>
                        <div className="flex flex-col gap-4 border-b border-border/70 pb-4 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-xl">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                    Permission matrix
                                </p>
                                <h3 className="mt-2 text-base font-semibold text-foreground">Hak akses role</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Grouping permission mengikuti modul agar lebih mudah discan dan diverifikasi.
                                </p>
                            </div>
                            <PermissionCheck
                                label="Pilih semua permission"
                                checked={hasAllPermissions}
                                onChange={(event) =>
                                    setDraftRole((current) => ({
                                        ...current,
                                        permissions: event.target.checked ? allPermissionNames : [],
                                    }))
                                }
                            />
                        </div>

                        <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            {permissionGroups.map((group) => (
                                <div key={group.group} className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--surface)_99%,transparent)] p-4">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                                Modul
                                            </p>
                                            <h4 className="mt-1 text-sm font-semibold capitalize text-foreground">
                                                {group.title}
                                            </h4>
                                        </div>
                                        <Badge variant="outline" className="rounded-full">
                                            {group.items.length} izin
                                        </Badge>
                                    </div>

                                    <div className="grid gap-2">
                                        {group.items.map((permission) => (
                                            <PermissionCheck
                                                key={permission.name}
                                                label={permission.actionLabel}
                                                checked={draftRole.permissions.includes(permission.name)}
                                                onChange={(event) =>
                                                    togglePermission(permission.name, event.target.checked)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogShell>

            <DialogShell
                open={openUserRole}
                onOpenChange={setOpenUserRole}
                title="Tambah user ke role"
                description="Pilih role tujuan dan user yang belum ditetapkan ke role agar struktur akses tetap rapi."
                footer={
                    <ResourceDialogFooter
                        submitLabel="Tambahkan User"
                        onSubmit={submitUserRole}
                        onClose={() => setOpenUserRole(false)}
                    />
                }
            >
                <div className="flex flex-col gap-5">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Role aktif
                            </p>
                            <p className="mt-1 text-base font-semibold text-foreground">{formatNumber(roleItems.length)}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                User tersedia
                            </p>
                            <p className="mt-1 text-base font-semibold text-foreground">{formatNumber(availableUsers.length)}</p>
                        </div>
                        <div className="rounded-2xl border border-border/70 bg-[color-mix(in_oklab,var(--surface)_98%,transparent)] px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Status
                            </p>
                            <p className="mt-1 text-base font-semibold text-foreground">
                                {hasAssignableUsers ? "Siap assign" : "Tidak ada user tersisa"}
                            </p>
                        </div>
                    </div>

                    <FormGrid>
                        <div className={spanClass("half")}>
                            <Field>
                                <FieldHeading icon={ShieldCheckIcon} label="Role" />
                                <SelectControl
                                    icon={ShieldCheckIcon}
                                    value={draftUserRole.role_id}
                                    onValueChange={(value) =>
                                        setDraftUserRole((current) => ({ ...current, role_id: value }))
                                    }
                                    placeholder="Pilih role"
                                >
                                    <SelectGroup>
                                        {roleItems.map((role) => (
                                            <SelectItem key={role.id} value={String(role.id)}>
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectControl>
                            </Field>
                        </div>
                        <div className={spanClass("half")}>
                            <Field>
                                <FieldHeading icon={UserRoundIcon} label="User" />
                                <SelectControl
                                    icon={UserRoundIcon}
                                    value={draftUserRole.user_id}
                                    onValueChange={(value) =>
                                        setDraftUserRole((current) => ({ ...current, user_id: value }))
                                    }
                                    placeholder="Pilih user"
                                >
                                    <SelectGroup>
                                        {availableUsers.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectControl>
                            </Field>
                        </div>
                    </FormGrid>

                    {!hasAssignableUsers ? (
                        <Alert>
                            <AlertTriangleIcon className="size-4" />
                            <AlertTitle>Tidak ada user tersedia</AlertTitle>
                            <AlertDescription>
                                Semua user yang terdeteksi saat ini sudah memiliki role aktif.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </div>
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
                <FormGrid>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={UserRoundIcon} label="Nama Lengkap" />
                            <TextControl
                                icon={UserRoundIcon}
                                value={draftProfile.name}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={HashIcon} label="Username" />
                            <TextControl
                                icon={HashIcon}
                                value={draftProfile.username}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        username: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={PhoneIcon} label="Nomor HP" />
                            <TextControl
                                icon={PhoneIcon}
                                value={draftProfile.phone_number}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        phone_number: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={Building2Icon} label="Perumahan" />
                            <TextControl
                                icon={Building2Icon}
                                value={draftProfile.perumahan}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        perumahan: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={HouseIcon} label="Blok" />
                            <TextControl
                                icon={HouseIcon}
                                value={draftProfile.blok_rumah}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        blok_rumah: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                    <div className={spanClass("half")}>
                        <Field>
                            <FieldHeading icon={HashIcon} label="Nomor Rumah" />
                            <TextControl
                                icon={HashIcon}
                                value={draftProfile.no_rumah}
                                onChange={(event) =>
                                    setDraftProfile((current) => ({
                                        ...current,
                                        no_rumah: event.target.value,
                                    }))
                                }
                            />
                        </Field>
                    </div>
                </FormGrid>
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
                <UploadField
                    label="File foto profil"
                    helper="Unggah foto profil baru dengan format gambar yang jelas."
                    file={profileFile}
                    onChange={setProfileFile}
                />
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
                <UploadField
                    label="File foto rumah"
                    helper="Unggah foto rumah terbaru untuk data anggota."
                    file={houseFile}
                    onChange={setHouseFile}
                />
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
                title="Jurnal"
                rows={rows}
                isLoading={loading}
                searchFields={["memo", "reference"]}
                rowActionMode="action-dialog"
                getRowTitle={(row) => stripHtml(row.reference || "-")}
                getRowSubtitle={(row) => stripHtml(row.date || "-")}
                getRowSummary={(row) => [
                    { label: "Tanggal", value: stripHtml(row.date || "-"), icon: CalendarDaysIcon },
                    { label: "Referensi", value: stripHtml(row.reference || "-"), icon: ReceiptTextIcon },
                    { label: "Keterangan", value: stripHtml(row.memo || "-"), icon: FileTextIcon },
                    { label: "Debit", value: stripHtml(row.debit_total || "-"), icon: WalletIcon },
                    { label: "Kredit", value: stripHtml(row.credit_total || "-"), icon: WalletCardsIcon },
                ]}
                getRowActions={(row) => [
                    {
                        key: "detail",
                        label: "Buka Detail",
                        icon: EyeIcon,
                        tone: "primary",
                        href: `/accounting/journals/${row.id}`,
                    },
                ]}
                columns={[
                    {
                        key: "date",
                        title: "Tanggal",
                        icon: CalendarDaysIcon,
                        filterable: true,
                        render: (row) => stripHtml(row.date),
                    },
                    {
                        key: "reference",
                        title: "Referensi",
                        icon: ReceiptTextIcon,
                        required: true,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell icon={ReceiptTextIcon} value={row.reference} truncate maxLength={24} />
                        ),
                    },
                    {
                        key: "memo",
                        title: "Keterangan",
                        icon: FileTextIcon,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell icon={FileTextIcon} value={row.memo} truncate maxLength={24} textClassName="text-[13px]" />
                        ),
                    },
                    {
                        key: "debit_total",
                        title: "Debit",
                        icon: WalletIcon,
                        render: (row) => <MoneyValueCell value={row.debit_total} tone="debit" />,
                    },
                    {
                        key: "credit_total",
                        title: "Kredit",
                        icon: WalletCardsIcon,
                        render: (row) => <MoneyValueCell value={row.credit_total} tone="credit" />,
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
                rowActionMode="quick-detail"
                getRowTitle={(row) => stripHtml(row.account || "-")}
                getRowSubtitle={(row) => stripHtml(row.description || row.note || "-")}
                getRowSummary={(row) => [
                    { label: "Akun", value: stripHtml(row.account || "-"), icon: LandmarkIcon },
                    { label: "Catatan", value: stripHtml(row.description || row.note || "-"), icon: FileTextIcon },
                    { label: "Debit", value: stripHtml(row.debit || "-"), icon: WalletIcon },
                    { label: "Kredit", value: stripHtml(row.credit || "-"), icon: WalletCardsIcon },
                ]}
                columns={[
                    {
                        key: "account",
                        title: "Akun",
                        icon: LandmarkIcon,
                        required: true,
                        filterable: true,
                        render: (row) => stripHtml(row.account),
                    },
                    {
                        key: "description",
                        title: "Catatan",
                        icon: FileTextIcon,
                        filterable: true,
                        render: (row) => (
                            <TableMetaCell
                                icon={FileTextIcon}
                                value={row.description || row.note}
                                truncate
                                maxLength={24}
                                textClassName="text-[13px]"
                            />
                        ),
                    },
                    {
                        key: "debit",
                        title: "Debit",
                        icon: WalletIcon,
                        render: (row) => <MoneyValueCell value={row.debit} tone="debit" />,
                    },
                    {
                        key: "credit",
                        title: "Kredit",
                        icon: WalletCardsIcon,
                        render: (row) => <MoneyValueCell value={row.credit} tone="credit" />,
                    },
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
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const dateStr = `${pad(d.getDate())}${pad(d.getMonth() + 1)}${d.getFullYear()}`;
    const timeStr = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

    return {
        invoice_no: mode === "sale" ? `INV-${dateStr}-${timeStr}-SHTCOCK` : "",
        reference_no: mode !== "sale" ? `REF-${dateStr}-${timeStr}-BUY` : "",
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
