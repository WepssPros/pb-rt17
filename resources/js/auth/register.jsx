import React from "react";
import { createRoot } from "react-dom/client";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    EyeOffIcon,
    ImagePlusIcon,
    LockKeyholeIcon,
    MailIcon,
    ShieldCheckIcon,
    UserRoundIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const steps = [
    {
        id: "account",
        eyebrow: "Step 01",
        title: "Account access",
        description: "Buat identitas akun yang akan dipakai untuk login.",
    },
    {
        id: "personal",
        eyebrow: "Step 02",
        title: "Personal detail",
        description: "Lengkapi identitas dan domisili user PBRT17.",
    },
    {
        id: "media",
        eyebrow: "Step 03",
        title: "Photo upload",
        description: "Tambahkan foto rumah dan foto profil bila tersedia.",
    },
];

function RegisterPage({ bootstrap }) {
    const [currentStep, setCurrentStep] = React.useState(0);
    const [showPassword, setShowPassword] = React.useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = React.useState(false);
    const [perumahan, setPerumahan] = React.useState(bootstrap.old.perumahan || "");
    const [blokRumah, setBlokRumah] = React.useState(bootstrap.old.blok_rumah || "");
    const [housePreview, setHousePreview] = React.useState(bootstrap.housePlaceholder);
    const [profilePreview, setProfilePreview] = React.useState(bootstrap.profilePlaceholder);
    const errors = bootstrap.errors || {};

    const nextStep = () => setCurrentStep((current) => Math.min(steps.length - 1, current + 1));
    const prevStep = () => setCurrentStep((current) => Math.max(0, current - 1));

    const handleFilePreview = (event, type) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result;
            if (type === "house") {
                setHousePreview(result);
            } else {
                setProfilePreview(result);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.3),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.26),_transparent_22%),radial-gradient(circle_at_bottom,_rgba(34,211,238,0.14),_transparent_30%)]" />
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:52px_52px]" />

            <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-5 sm:px-6 sm:py-8 xl:grid-cols-[1.05fr_0.95fr] xl:gap-12 xl:px-10 xl:py-10">
                <section className="order-2 flex flex-col justify-between xl:order-1">
                    <div>
                        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-3 py-2 shadow-[0_16px_40px_-28px_rgba(34,211,238,0.6)] sm:px-4">
                            <img
                                src={bootstrap.logoMark}
                                alt="PBRT17"
                                className="size-9 rounded-full object-cover sm:size-10"
                            />
                            <div>
                                <p className="text-sm font-semibold tracking-wide text-white">PBRT17 KASAMBA</p>
                                <p className="text-xs text-slate-300">Future registration portal</p>
                            </div>
                        </div>

                        <div className="mt-8 max-w-2xl sm:mt-10 xl:mt-14">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-300/80 sm:text-xs sm:tracking-[0.4em]">
                                Member Onboarding Console
                            </p>
                            <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.04] tracking-tight text-white sm:mt-5 sm:text-4xl xl:text-7xl">
                                Registrasi anggota baru dengan alur yang rapi di desktop dan tetap nyaman di mobile.
                            </h1>
                            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
                                Form dibuat agar pengisian data akun, identitas, dan foto berlangsung cepat,
                                jelas, dan tetap konsisten dengan sistem auth PBRT17 yang sudah ada.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:mt-12 xl:grid-cols-3 xl:gap-4">
                        <SignalTile
                            icon={ShieldCheckIcon}
                            title="Validated"
                            text="Field tetap memakai validasi dan rules Laravel Fortify."
                        />
                        <SignalTile
                            icon={UserRoundIcon}
                            title="Structured"
                            text="Langkah registrasi dipisah jelas agar desktop dan mobile tetap nyaman."
                        />
                        <SignalTile
                            icon={ImagePlusIcon}
                            title="Ready"
                            text="Foto rumah dan profil bisa diunggah langsung dalam flow yang sama."
                        />
                    </div>
                </section>

                <section className="order-1 flex items-center justify-center xl:order-2 xl:justify-end">
                    <Card className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-slate-950/82 shadow-[0_40px_120px_-35px_rgba(59,130,246,0.42)] sm:rounded-[32px]">
                        <CardContent className="p-5 sm:p-8 xl:p-10">
                            <div className="mb-6 sm:mb-8">
                                <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                                    Registration Access
                                </div>
                                <h2 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                                    Buat akun baru
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-300">
                                    Lengkapi data pendaftaran sampai selesai lalu submit ke sistem.
                                </p>
                            </div>

                            <StepTabs currentStep={currentStep} />

                            {bootstrap.errorSummary?.length ? (
                                <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-4 text-sm text-rose-100">
                                    <p className="font-semibold text-rose-200">Ada data yang belum benar.</p>
                                    <ul className="mt-2 list-disc space-y-1 pl-5">
                                        {bootstrap.errorSummary.map((error, index) => (
                                            <li key={`${error}-${index}`}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}

                            <form
                                method="POST"
                                action={bootstrap.registerUrl}
                                encType="multipart/form-data"
                                className="mt-6 space-y-6"
                            >
                                <input type="hidden" name="_token" value={bootstrap.csrfToken} />

                                <div className={currentStep === 0 ? "block" : "hidden"}>
                                    <StepPanel
                                        eyebrow={steps[0].eyebrow}
                                        title={steps[0].title}
                                        description={steps[0].description}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <InputField
                                                label="Username"
                                                name="username"
                                                defaultValue={bootstrap.old.username}
                                                placeholder="username"
                                                error={errors.username}
                                            />
                                            <InputField
                                                label="Email"
                                                name="email"
                                                type="email"
                                                defaultValue={bootstrap.old.email}
                                                placeholder="nama@email.com"
                                                error={errors.email}
                                                icon={MailIcon}
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <PasswordField
                                                label="Password"
                                                name="password"
                                                show={showPassword}
                                                onToggle={() => setShowPassword((current) => !current)}
                                                error={errors.password}
                                            />
                                            <PasswordField
                                                label="Confirm Password"
                                                name="password_confirmation"
                                                show={showPasswordConfirmation}
                                                onToggle={() =>
                                                    setShowPasswordConfirmation((current) => !current)
                                                }
                                                error={errors.password_confirmation}
                                            />
                                        </div>
                                    </StepPanel>
                                </div>

                                <div className={currentStep === 1 ? "block" : "hidden"}>
                                    <StepPanel
                                        eyebrow={steps[1].eyebrow}
                                        title={steps[1].title}
                                        description={steps[1].description}
                                    >
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <InputField
                                                label="Nama Lengkap"
                                                name="name"
                                                defaultValue={bootstrap.old.name}
                                                placeholder="Nama lengkap"
                                                error={errors.name}
                                            />
                                            <InputField
                                                label="Mobile"
                                                name="phone_number"
                                                defaultValue={bootstrap.old.phone_number}
                                                placeholder="08xxxxxxxxxx"
                                                error={errors.phone_number}
                                            />
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <SelectField
                                                label="Perumahan"
                                                name="perumahan"
                                                value={perumahan}
                                                onChange={setPerumahan}
                                                options={bootstrap.perumahanOptions}
                                                error={errors.perumahan}
                                            />
                                            <SelectField
                                                label="Blok Rumah"
                                                name="blok_rumah"
                                                value={blokRumah}
                                                onChange={setBlokRumah}
                                                options={bootstrap.blokOptions}
                                                error={errors.blok_rumah}
                                            />
                                        </div>
                                        <InputField
                                            label="Nomor Rumah"
                                            name="no_rumah"
                                            defaultValue={bootstrap.old.no_rumah}
                                            placeholder="Nomor rumah"
                                            error={errors.no_rumah}
                                        />
                                    </StepPanel>
                                </div>

                                <div className={currentStep === 2 ? "block" : "hidden"}>
                                    <StepPanel
                                        eyebrow={steps[2].eyebrow}
                                        title={steps[2].title}
                                        description={steps[2].description}
                                    >
                                        <div className="grid gap-4 lg:grid-cols-2">
                                            <FileField
                                                label="Foto Rumah"
                                                name="foto_rumah"
                                                preview={housePreview}
                                                error={errors.foto_rumah}
                                                roundedClassName="rounded-[24px]"
                                                onChange={(event) => handleFilePreview(event, "house")}
                                            />
                                            <FileField
                                                label="Foto Profil"
                                                name="foto_profile"
                                                preview={profilePreview}
                                                error={errors.foto_profile}
                                                roundedClassName="rounded-full"
                                                onChange={(event) => handleFilePreview(event, "profile")}
                                            />
                                        </div>
                                    </StepPanel>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="text-xs uppercase tracking-[0.22em] text-slate-400">
                                        {currentStep + 1} / {steps.length} steps
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={prevStep}
                                            disabled={currentStep === 0}
                                            className="h-12 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 disabled:opacity-40"
                                        >
                                            <ChevronLeftIcon data-icon="inline-start" />
                                            Previous
                                        </Button>

                                        {currentStep < steps.length - 1 ? (
                                            <Button
                                                type="button"
                                                onClick={nextStep}
                                                className="h-12 rounded-2xl bg-[linear-gradient(135deg,_#22d3ee,_#4f46e5_52%,_#a855f7)] px-6 text-white shadow-[0_24px_60px_-24px_rgba(56,189,248,0.9)]"
                                            >
                                                Next
                                                <ChevronRightIcon data-icon="inline-end" />
                                            </Button>
                                        ) : (
                                            <Button
                                                type="submit"
                                                className="h-12 rounded-2xl bg-[linear-gradient(135deg,_#22d3ee,_#4f46e5_52%,_#a855f7)] px-6 text-white shadow-[0_24px_60px_-24px_rgba(56,189,248,0.9)]"
                                            >
                                                Submit Registration
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </div>
    );
}

function StepTabs({ currentStep }) {
    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
                <div
                    key={step.id}
                    className={[
                        "rounded-[22px] border px-4 py-4 transition",
                        currentStep === index
                            ? "border-cyan-300/30 bg-cyan-300/12 shadow-[0_20px_60px_-40px_rgba(34,211,238,0.8)]"
                            : "border-white/10 bg-slate-950/66",
                    ].join(" ")}
                >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {step.eyebrow}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">{step.description}</p>
                </div>
            ))}
        </div>
    );
}

function StepPanel({ eyebrow, title, description, children }) {
    return (
        <div className="space-y-5">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300/80">
                    {eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
            </div>
            {children}
        </div>
    );
}

function InputField({
    label,
    name,
    type = "text",
    defaultValue,
    placeholder,
    error,
    icon: Icon,
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-slate-200">
                {label}
            </Label>
            <div className="relative">
                {Icon ? (
                    <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                ) : null}
                <Input
                    id={name}
                    name={name}
                    type={type}
                    defaultValue={defaultValue || ""}
                    placeholder={placeholder}
                    className={[
                        "h-13 rounded-2xl border-white/12 bg-slate-950/72 text-white placeholder:text-slate-500 sm:h-14",
                        Icon ? "pl-11" : "",
                    ].join(" ")}
                />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
    );
}

function PasswordField({ label, name, show, onToggle, error }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-slate-200">
                {label}
            </Label>
            <div className="relative">
                <LockKeyholeIcon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                    id={name}
                    name={name}
                    type={show ? "text" : "password"}
                    className="h-13 rounded-2xl border-white/12 bg-slate-950/72 pl-11 pr-12 text-white placeholder:text-slate-500 sm:h-14"
                    placeholder="Masukkan password"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
                >
                    {show ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
    );
}

function SelectField({ label, name, value, onChange, options, error }) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-slate-200">
                {label}
            </Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger
                    id={name}
                    className="h-13 w-full rounded-2xl border-white/12 bg-slate-950/72 text-white sm:h-14"
                >
                    <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 text-white">
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <input type="hidden" name={name} value={value} />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </div>
    );
}

function FileField({ label, name, preview, error, roundedClassName, onChange }) {
    return (
        <div className="rounded-[24px] border border-white/12 bg-slate-950/72 p-4">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className={`overflow-hidden border border-white/15 bg-slate-900/80 ${roundedClassName}`}>
                    <img
                        src={preview}
                        alt={label}
                        className="h-32 w-32 object-cover sm:h-36 sm:w-36"
                    />
                </div>
                <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                        Upload gambar agar data anggota lebih lengkap.
                    </p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-300/16">
                    <ImagePlusIcon className="size-4" />
                    Pilih File
                    <input
                        type="file"
                        name={name}
                        accept="image/*"
                        className="hidden"
                        onChange={onChange}
                    />
                </label>
            </div>
            {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
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

const container = document.getElementById("register-root");

if (container) {
    const bootstrap = window.__REGISTER_BOOTSTRAP__ || {};
    createRoot(container).render(<RegisterPage bootstrap={bootstrap} />);
}
