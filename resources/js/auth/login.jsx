import React from "react";
import { createRoot } from "react-dom/client";
import { EyeIcon, EyeOffIcon, LockKeyholeIcon, MailIcon, ShieldCheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginPage({ bootstrap }) {
    const [showPassword, setShowPassword] = React.useState(false);
    const errors = bootstrap.errors || {};

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.28),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.22),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.12),_transparent_30%)]" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />

            <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-10 lg:py-10">
                <section className="order-2 flex flex-col justify-between lg:order-1">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 shadow-[0_16px_40px_-28px_rgba(34,211,238,0.6)] sm:px-4">
                            <img
                                src={bootstrap.logoMark}
                                alt="PBRT17"
                                className="size-9 rounded-full object-cover sm:size-10"
                            />
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-white">PBRT17 KASAMBA</p>
                                <p className="text-xs text-slate-300">Realtime finance monitoring</p>
                            </div>
                        </div>

                        <div className="mt-8 max-w-2xl sm:mt-10 lg:mt-14">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80 sm:text-xs sm:tracking-[0.4em]">
                                Future Finance Console
                            </p>
                            <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.04] tracking-tight text-white sm:mt-5 sm:text-4xl lg:text-7xl">
                                Login ke dashboard kas yang cepat, tajam, dan nyaman di mobile.
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
                                Masuk ke workspace PBRT17 untuk memantau kas, jadwal, target proyek,
                                dan transaksi harian dalam satu pusat kendali modern.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-4">
                        <SignalTile
                            icon={ShieldCheckIcon}
                            title="Secure"
                            text="CSRF, validation, dan flow Fortify tetap dipakai."
                        />
                        <SignalTile
                            icon={MailIcon}
                            title="Realtime"
                            text="Akses cepat ke monitoring penjualan, pembelian, dan kas."
                        />
                        <SignalTile
                            icon={LockKeyholeIcon}
                            title="Focused"
                            text="UI clean, high-tech, dan dibuat khusus untuk admin PBRT17."
                        />
                    </div>
                </section>

                <section className="order-1 flex items-center justify-center lg:order-2 lg:justify-end">
                    <Card className="w-full max-w-xl rounded-[28px] border border-white/10 bg-slate-950/82 shadow-[0_40px_120px_-35px_rgba(59,130,246,0.42)] sm:rounded-[32px]">
                        <CardContent className="p-5 sm:p-8 lg:p-10">
                            <div className="mb-6 sm:mb-8">
                                <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                                    Operator Access
                                </div>
                                <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                                    Selamat datang kembali
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Gunakan akun yang sudah terdaftar untuk masuk ke sistem monitoring kas.
                                </p>
                            </div>

                            <form method="POST" action={bootstrap.loginUrl} className="space-y-5 sm:space-y-6">
                                <input type="hidden" name="_token" value={bootstrap.csrfToken} />

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-200">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <MailIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="text"
                                            defaultValue={bootstrap.old.email || ""}
                                            className="h-13 rounded-2xl border-white/12 bg-slate-950/30 pl-11 text-white placeholder:text-slate-500 sm:h-14"
                                            placeholder="nama@email.com"
                                            autoFocus
                                        />
                                    </div>
                                    {errors.email ? (
                                        <p className="text-sm text-rose-300">{errors.email}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-200">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <LockKeyholeIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            className="h-13 rounded-2xl border-white/12 bg-slate-950/30 pl-11 pr-12 text-white placeholder:text-slate-500 sm:h-14"
                                            placeholder="Masukkan password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="size-4" />
                                            ) : (
                                                <EyeIcon className="size-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password ? (
                                        <p className="text-sm text-rose-300">{errors.password}</p>
                                    ) : null}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                    <label className="flex items-center gap-3 text-sm text-slate-300">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            value="1"
                                            defaultChecked={bootstrap.old.remember}
                                            className="size-4 rounded border border-white/20 bg-slate-950/40 accent-cyan-300"
                                        />
                                        Remember me
                                    </label>
                                    {bootstrap.registerUrl ? (
                                        <a
                                            href={bootstrap.registerUrl}
                                            className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                                        >
                                            Belum punya akun?
                                        </a>
                                    ) : null}
                                </div>

                                <Button
                                    type="submit"
                                    className="h-13 w-full rounded-2xl bg-[linear-gradient(135deg,_#22d3ee,_#4f46e5_52%,_#a855f7)] text-base font-semibold text-white shadow-[0_24px_60px_-24px_rgba(56,189,248,0.9)] hover:opacity-95 sm:h-14"
                                >
                                    Sign In
                                </Button>

                                {bootstrap.status ? (
                                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                                        {bootstrap.status}
                                    </div>
                                ) : null}
                            </form>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

function SignalTile({ icon: Icon, title, text }) {
    return (
        <div className="rounded-[22px] border border-white/10 bg-slate-950/66 p-4 sm:rounded-[24px] sm:p-5">
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_rgba(34,211,238,0.22),_rgba(79,70,229,0.2))] text-cyan-200 sm:mb-4 sm:size-12">
                <Icon className="size-5" />
            </div>
            <p className="text-sm font-semibold text-white sm:text-base">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
        </div>
    );
}

const container = document.getElementById("login-root");

if (container) {
    const bootstrap = window.__LOGIN_BOOTSTRAP__ || {};
    createRoot(container).render(<LoginPage bootstrap={bootstrap} />);
}
