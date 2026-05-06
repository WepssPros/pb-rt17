import React, { useEffect, useMemo, useState } from "react";
import {
    BellIcon,
    ChevronRightIcon,
    CommandIcon,
    LogOutIcon,
    MenuIcon,
    MoonStarIcon,
    PlusIcon,
    SparklesIcon,
    SunMediumIcon,
    LayoutDashboardIcon,
    PackageIcon,
    WalletIcon,
    BarChart3Icon,
    FileTextIcon,
    TargetIcon,
    ChevronUpIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const iconMap = {
    dashboard: SparklesIcon,
    master: CommandIcon,
    transaction: ChevronRightIcon,
    finance: BellIcon,
    report: CommandIcon,
    settings: CommandIcon,
};

function initialsOf(name) {
    return String(name || "PB")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

function ThemeToggle({ theme, onToggle, compact = false }) {
    return (
        <Button
            variant="outline"
            size={compact ? "icon-sm" : "sm"}
            className={compact ? "rounded-xl" : "rounded-2xl"}
            onClick={onToggle}
        >
            {theme === "dark" ? (
                <SunMediumIcon data-icon="inline-start" />
            ) : (
                <MoonStarIcon data-icon="inline-start" />
            )}
            {compact ? null : theme === "dark" ? "Light" : "Dark"}
        </Button>
    );
}

function BrandCard() {
    return (
        <div className="app-panel rounded-[26px] p-4">
            <div className="flex items-center gap-3">
                <div className="app-accent-badge flex size-11 items-center justify-center rounded-2xl text-sm font-semibold shadow-[0_16px_36px_-24px_rgba(99,102,241,0.7)]">
                    PB
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">PBRT17 Admin</p>
                    <p className="truncate text-xs text-muted-foreground">Cashflow workspace</p>
                </div>
            </div>
        </div>
    );
}

function MenuTree({ groupedMenu, authUser, onNavigate }) {
    return (
        <>
            <nav className="flex-1 space-y-3 overflow-y-auto pr-1">
                {groupedMenu.map((group) => {
                    const Icon = iconMap[group.icon] || ChevronRightIcon;

                    return (
                        <section key={group.label} className="app-subpanel rounded-[24px] p-3">
                            <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                                <Icon className="size-3.5" />
                                {group.label}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                {group.items.map((item) => (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={onNavigate}
                                        className={[
                                            "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                                            item.active
                                                ? "app-soft-accent shadow-[0_12px_32px_-24px_rgba(99,102,241,0.45)]"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                        ].join(" ")}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </nav>

            <div className="app-panel mt-4 rounded-[24px] p-3">
                <div className="flex items-center gap-3">
                    <Avatar className="size-11 rounded-2xl">
                        <AvatarImage src={authUser.avatar} alt={authUser.name} />
                        <AvatarFallback className="rounded-2xl bg-muted text-muted-foreground">
                            {initialsOf(authUser.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {authUser.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {authUser.email}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

function BottomNavbar({ groupedMenu }) {
    const [openPopup, setOpenPopup] = useState(null); // 'transaksi' | 'keuangan'

    const findItem = (groupLabel, itemLabel) => {
        const group = groupedMenu.find(g => g.label === groupLabel);
        if (!group) return null;
        if (itemLabel) return group.items.find(i => i.label === itemLabel);
        return group.items[0];
    };

    const nav = {
        dash: findItem('Overview'),
        stok: findItem('Master Data'),
        penjualan: findItem('Transaksi', 'Penjualan'),
        pembelian: findItem('Transaksi', 'Pembelian'),
        kas: findItem('Keuangan', 'Kas & Transaksi'),
        jurnal: findItem('Keuangan', 'Jurnal Umum'),
        target: findItem('Keuangan', 'Target Proyek'),
        laporan: findItem('Laporan')
    };

    const NavButton = ({ label, icon: Icon, active, onClick, href, isCenter = false }) => {
        const content = (
            <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`relative flex items-center justify-center ${isCenter ? 'size-12 -mt-6 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 border-4 border-background' : 'size-6'}`}>
                    <Icon className={isCenter ? "size-6" : "size-5"} />
                </div>
                <span className={`text-[10px] font-medium leading-none ${isCenter ? 'mt-0.5' : ''}`}>{label}</span>
            </div>
        );

        if (href) {
            return (
                <a href={href} className="flex flex-1 items-center justify-center py-2">
                    {content}
                </a>
            );
        }

        return (
            <button onClick={onClick} className="flex flex-1 items-center justify-center py-2 outline-none">
                {content}
            </button>
        );
    };

    const PopupMenu = ({ open, onClose, items, title }) => {
        if (!open) return null;
        return (
            <>
                <div className="fixed inset-0 z-[60] bg-background/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
                <div className="fixed bottom-24 left-4 right-4 z-[70] animate-in slide-in-from-bottom-10 fade-in duration-300 zoom-in-95">
                    <div className="app-panel-elevated flex flex-col gap-1 rounded-[28px] p-2 shadow-2xl">
                        <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{title}</div>
                        {items.map((item, idx) => item && (
                            <a 
                                key={idx} 
                                href={item.href} 
                                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-muted active:scale-95"
                            >
                                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <ChevronUpIcon className="size-4 rotate-90" />
                                </div>
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 lg:hidden">
            <div className="relative mx-auto flex max-w-md items-center justify-around rounded-[32px] bg-background/80 px-2 py-1 shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.15)] backdrop-blur-xl border border-white/10">
                <NavButton 
                    label="Dash" 
                    icon={LayoutDashboardIcon} 
                    active={nav.dash?.active} 
                    href={nav.dash?.href} 
                />
                <NavButton 
                    label="Stok" 
                    icon={PackageIcon} 
                    active={nav.stok?.active} 
                    href={nav.stok?.href} 
                />
                
                <NavButton 
                    label="Trans" 
                    icon={PlusIcon} 
                    isCenter 
                    onClick={() => setOpenPopup(openPopup === 'trans' ? null : 'trans')}
                />

                <NavButton 
                    label="Keu" 
                    icon={WalletIcon} 
                    active={nav.kas?.active || nav.jurnal?.active || nav.target?.active}
                    onClick={() => setOpenPopup(openPopup === 'keu' ? null : 'keu')}
                />
                <NavButton 
                    label="Lap" 
                    icon={BarChart3Icon} 
                    active={nav.laporan?.active} 
                    href={nav.laporan?.href} 
                />
            </div>

            <PopupMenu 
                open={openPopup === 'trans'} 
                onClose={() => setOpenPopup(null)}
                title="Transaksi Cepat"
                items={[nav.penjualan, nav.pembelian]}
            />

            <PopupMenu 
                open={openPopup === 'keu'} 
                onClose={() => setOpenPopup(null)}
                title="Keuangan & Proyek"
                items={[nav.kas, nav.jurnal, nav.target]}
            />
        </div>
    );
}

function UserMenu({ authUser }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-2xl px-2">
                    <Avatar className="size-8 rounded-xl">
                        <AvatarImage src={authUser.avatar} alt={authUser.name} />
                        <AvatarFallback className="rounded-xl bg-muted text-muted-foreground">
                            {initialsOf(authUser.name)}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 rounded-2xl">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <a href={authUser.profileUrl}>Profil Saya</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => document.getElementById("logout-form")?.submit()}
                    >
                        <LogOutIcon data-icon="inline-start" />
                        Log Out
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function AdminLayout({ bootstrap, theme, onThemeChange, children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const groupedMenu = useMemo(() => bootstrap.menu || [], [bootstrap.menu]);
    const authUser = bootstrap.authUser || {};

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem("pbrt-theme", theme);
        window.__PBRT_THEME__ = theme;
    }, [theme]);

    return (
        <div className="theme app-shell">
            <div className="mx-auto grid min-h-screen max-w-[1680px] gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-5">
                <aside className="hidden lg:block">
                    <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col">
                        <div className="app-panel app-panel-elevated flex h-full flex-col rounded-[32px] p-4">
                            <BrandCard />
                            <div className="mt-4 flex min-h-0 flex-1 flex-col">
                                <MenuTree groupedMenu={groupedMenu} authUser={authUser} />
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="min-w-0">
                    <header className="relative z-30 lg:sticky lg:top-4">
                        <div className="app-toolbar rounded-[28px] px-4 py-3 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.3)]">
                            <div className="flex items-center gap-3">
                                <div className="hidden lg:hidden">
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        className="rounded-xl lg:hidden"
                                        onClick={() => setMobileOpen(true)}
                                    >
                                        <MenuIcon />
                                        <span className="sr-only">Open navigation</span>
                                    </Button>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs uppercase tracking-[0.22em] text-muted-foreground">
                                        {bootstrap.currentRoute}
                                    </p>
                                    <p className="truncate text-sm font-medium text-foreground/78">
                                        Workspace operasional PBRT17
                                    </p>
                                </div>

                                <div className="hidden items-center gap-2 sm:flex">
                                    <Badge className="app-accent-badge rounded-full px-3 py-1 shadow-none">
                                        Hybrid React + Laravel
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                    <ThemeToggle
                                        theme={theme}
                                        onToggle={() =>
                                            onThemeChange((current) =>
                                                current === "dark" ? "light" : "dark"
                                            )
                                        }
                                    />
                                    <UserMenu authUser={authUser} />
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="pt-4">
                        <div className="flex flex-col gap-5">{children}</div>
                    </main>

                    <footer className="pb-24 pt-6 lg:pb-6">
                        <Separator className="mb-4 bg-border" />
                        <div className="flex flex-col gap-2 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
                            <p>PBRT17 KASAMBA admin console.</p>
                            <p>Theme light/dark konsisten tanpa mengubah logika transaksi Laravel.</p>
                        </div>
                    </footer>
                </div>
            </div>

            <BottomNavbar groupedMenu={groupedMenu} />

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="app-overlay-panel w-[92vw] max-w-[340px] p-0">
                    <SheetHeader className="border-b border-border px-4 py-4">
                        <SheetTitle>Navigasi Admin</SheetTitle>
                    </SheetHeader>
                    <div className="flex h-full min-h-0 flex-col p-4">
                        <BrandCard />
                        <div className="mt-4 flex min-h-0 flex-1 flex-col">
                            <MenuTree
                                groupedMenu={groupedMenu}
                                authUser={authUser}
                                onNavigate={() => setMobileOpen(false)}
                            />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <form id="logout-form" action={bootstrap.logoutUrl} method="POST" className="hidden">
                <input type="hidden" name="_token" value={bootstrap.csrfToken} />
            </form>
        </div>
    );
}
