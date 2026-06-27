import React, { useEffect, useMemo, useState } from "react";
import {
    CalendarDaysIcon,
    CheckCircle2Icon,
    ExternalLinkIcon,
    ListOrderedIcon,
    PencilIcon,
    PlusIcon,
    ShieldCheckIcon,
    SwordsIcon,
    Trash2Icon,
    TrophyIcon,
    UserRoundIcon,
    UsersRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

import { AdminDataTable } from "@/admin/data-table";
import { TableMetaCell } from "@/admin/table-cells";
import { buildNestedParams, fetchJson, isoToIndoDate, sendForm, stripHtml } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const emptyTeam = {
    id: "",
    name: "",
    player_one: "",
    player_two: "",
    is_active: true,
    sort_order: 0,
};

const emptyMatch = {
    id: "",
    schedule_id: "",
    home_team_id: "",
    away_team_id: "",
    status: "scheduled",
    result_type: "",
    winner_team_id: "",
    set_scores: [
        { home: "", away: "" },
        { home: "", away: "" },
        { home: "", away: "" },
    ],
    notes: "",
};

function Field({ label, children }) {
    return (
        <label className="space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
            </span>
            {children}
        </label>
    );
}

function NativeSelect({ value, onChange, children, disabled = false }) {
    return (
        <select
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="app-input flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            {children}
        </select>
    );
}

function PageHeader({ publicUrl, onAddTeam, onAddMatch }) {
    return (
        <section className="app-page-header overflow-hidden rounded-[32px] px-6 py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                    <div className="app-soft-accent mb-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em]">
                        Tournament
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                        Liga Payo 17
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                        Kelola pasangan, hubungkan match ke jadwal calendar, dan input hasil liga ganda putra.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                        <a href={publicUrl} target="_blank" rel="noreferrer">
                            <ExternalLinkIcon data-icon="inline-start" />
                            Preview
                        </a>
                    </Button>
                    <Button variant="outline" onClick={onAddTeam}>
                        <PlusIcon data-icon="inline-start" />
                        Pasangan
                    </Button>
                    <Button onClick={onAddMatch}>
                        <SwordsIcon data-icon="inline-start" />
                        Match
                    </Button>
                </div>
            </div>
        </section>
    );
}

function ResultBadge({ match }) {
    if (match.status !== "finished") {
        return <Badge variant="outline">Belum main</Badge>;
    }

    return (
        <Badge variant="secondary" className="gap-1">
            <TrophyIcon className="size-3" />
            {match.result_type === "straight" ? "Straight 2 poin" : "Rubber 1 poin"}
        </Badge>
    );
}

function normalizeMatch(row) {
    return {
        ...emptyMatch,
        id: row.id || "",
        schedule_id: String(row.schedule_id || ""),
        home_team_id: String(row.home_team_id || ""),
        away_team_id: String(row.away_team_id || ""),
        status: row.status || "scheduled",
        result_type: row.result_type || "",
        winner_team_id: row.winner_team_id ? String(row.winner_team_id) : "",
        set_scores: [
            ...(row.set_scores || []),
            { home: "", away: "" },
            { home: "", away: "" },
            { home: "", away: "" },
        ].slice(0, 3),
        notes: row.notes || "",
    };
}

export function TournamentPage({ bootstrap }) {
    const routes = bootstrap.pageData.routes;
    const [payload, setPayload] = useState({ teams: [], matches: [], schedules: [], standings: [] });
    const [loading, setLoading] = useState(true);
    const [teamOpen, setTeamOpen] = useState(false);
    const [matchOpen, setMatchOpen] = useState(false);
    const [teamDraft, setTeamDraft] = useState(emptyTeam);
    const [matchDraft, setMatchDraft] = useState(emptyMatch);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            setPayload(await fetchJson(routes.data));
        } catch (error) {
            toast.error(error.message || "Gagal memuat data tournament");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const activeTeams = useMemo(
        () => (payload.teams || []).filter((team) => team.is_active),
        [payload.teams]
    );

    const selectedHomeId = String(matchDraft.home_team_id || "");
    const selectedAwayId = String(matchDraft.away_team_id || "");

    const openCreateTeam = () => {
        setTeamDraft(emptyTeam);
        setTeamOpen(true);
    };

    const openCreateMatch = () => {
        setMatchDraft(emptyMatch);
        setMatchOpen(true);
    };

    const saveTeam = async () => {
        try {
            await sendForm(
                teamDraft.id ? `${routes.teamsBase}/${teamDraft.id}` : routes.teamsStore,
                buildNestedParams([
                    ["name", teamDraft.name],
                    ["player_one", teamDraft.player_one],
                    ["player_two", teamDraft.player_two],
                    ["is_active", teamDraft.is_active ? 1 : 0],
                    ["sort_order", teamDraft.sort_order || 0],
                    ...(teamDraft.id ? [["_method", "PATCH"]] : []),
                ])
            );
            toast.success(teamDraft.id ? "Pasangan diperbarui" : "Pasangan ditambahkan");
            setTeamOpen(false);
            load();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const saveMatch = async () => {
        try {
            const entries = [
                ["schedule_id", matchDraft.schedule_id],
                ["home_team_id", matchDraft.home_team_id],
                ["away_team_id", matchDraft.away_team_id],
                ["status", matchDraft.status],
                ["result_type", matchDraft.status === "finished" ? matchDraft.result_type : ""],
                ["winner_team_id", matchDraft.status === "finished" ? matchDraft.winner_team_id : ""],
                ["notes", matchDraft.notes],
                ...(matchDraft.id ? [["_method", "PATCH"]] : []),
            ];

            matchDraft.set_scores.forEach((set, index) => {
                entries.push([`set_scores[${index}][home]`, set.home]);
                entries.push([`set_scores[${index}][away]`, set.away]);
            });

            await sendForm(
                matchDraft.id ? `${routes.matchesBase}/${matchDraft.id}` : routes.matchesStore,
                buildNestedParams(entries)
            );
            toast.success(matchDraft.id ? "Match diperbarui" : "Match ditambahkan");
            setMatchOpen(false);
            load();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const remove = async () => {
        if (!deleteTarget) return;

        try {
            const base = deleteTarget.type === "team" ? routes.teamsBase : routes.matchesBase;
            await sendForm(`${base}/${deleteTarget.id}`, buildNestedParams([["_method", "DELETE"]]));
            toast.success(deleteTarget.type === "team" ? "Pasangan dihapus" : "Match dihapus");
            setDeleteTarget(null);
            load();
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <>
            <PageHeader publicUrl={routes.publicUrl} onAddTeam={openCreateTeam} onAddMatch={openCreateMatch} />

            <Tabs defaultValue="teams" className="space-y-5">
                <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl">
                    <TabsTrigger value="teams">Pasangan</TabsTrigger>
                    <TabsTrigger value="matches">Hasil Match</TabsTrigger>
                </TabsList>

                <TabsContent value="teams">
                    <AdminDataTable
                        title="Pasangan ganda putra"
                        description="Daftar peserta aktif dan urutan tampil di klasemen."
                        rows={payload.teams || []}
                        isLoading={loading}
                        searchFields={["name", "player_one", "player_two"]}
                        rowActionMode="action-dialog"
                        getRowTitle={(row) => row.name}
                        getRowSubtitle={(row) => [row.player_one, row.player_two].filter(Boolean).join(" / ")}
                        getRowActions={(row) => [
                            {
                                key: "delete",
                                label: "Hapus",
                                icon: Trash2Icon,
                                tone: "destructive",
                                onSelect: () => setDeleteTarget({ type: "team", id: row.id, name: row.name }),
                            },
                            {
                                key: "edit",
                                label: "Edit",
                                icon: PencilIcon,
                                tone: "primary",
                                onSelect: () => {
                                    setTeamDraft({
                                        id: row.id,
                                        name: row.name || "",
                                        player_one: row.player_one || "",
                                        player_two: row.player_two || "",
                                        is_active: Boolean(row.is_active),
                                        sort_order: row.sort_order || 0,
                                    });
                                    setTeamOpen(true);
                                },
                            },
                        ]}
                        columns={[
                            {
                                key: "sort_order",
                                title: "Urutan",
                                icon: ListOrderedIcon,
                                render: (row) => <Badge variant="outline">{row.sort_order || 0}</Badge>,
                            },
                            {
                                key: "name",
                                title: "Pasangan",
                                icon: UsersRoundIcon,
                                required: true,
                                sortKey: "name",
                                render: (row) => (
                                    <TableMetaCell icon={UsersRoundIcon} value={row.name} textClassName="font-semibold" />
                                ),
                            },
                            {
                                key: "players",
                                title: "Pemain",
                                icon: UserRoundIcon,
                                render: (row) => (
                                    <TableMetaCell
                                        icon={UserRoundIcon}
                                        value={[row.player_one, row.player_two].filter(Boolean).join(" / ") || "-"}
                                        truncate
                                        maxLength={34}
                                    />
                                ),
                            },
                            {
                                key: "is_active",
                                title: "Status",
                                icon: ShieldCheckIcon,
                                render: (row) => (
                                    <Badge variant={row.is_active ? "secondary" : "outline"}>
                                        {row.is_active ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                ),
                            },
                        ]}
                    />
                </TabsContent>

                <TabsContent value="matches">
                    <AdminDataTable
                        title="Match liga"
                        description="Match mengambil jadwal dari calendar dashboard yang sudah dibuat."
                        rows={payload.matches || []}
                        isLoading={loading}
                        searchFields={["status", "result_type"]}
                        rowActionMode="action-dialog"
                        getRowTitle={(row) => `${row.home_team?.name || "-"} vs ${row.away_team?.name || "-"}`}
                        getRowSubtitle={(row) => `${isoToIndoDate(row.schedule?.date)} · ${row.schedule?.start_time || ""}`}
                        getRowActions={(row) => [
                            {
                                key: "delete",
                                label: "Hapus",
                                icon: Trash2Icon,
                                tone: "destructive",
                                onSelect: () => setDeleteTarget({ type: "match", id: row.id, name: `${row.home_team?.name} vs ${row.away_team?.name}` }),
                            },
                            {
                                key: "edit",
                                label: "Edit",
                                icon: PencilIcon,
                                tone: "primary",
                                onSelect: () => {
                                    setMatchDraft(normalizeMatch(row));
                                    setMatchOpen(true);
                                },
                            },
                        ]}
                        columns={[
                            {
                                key: "schedule",
                                title: "Jadwal",
                                icon: CalendarDaysIcon,
                                render: (row) => (
                                    <TableMetaCell
                                        icon={CalendarDaysIcon}
                                        value={`${isoToIndoDate(row.schedule?.date)} ${row.schedule?.start_time || ""}`}
                                        textClassName="font-medium"
                                    />
                                ),
                            },
                            {
                                key: "teams",
                                title: "Match",
                                icon: SwordsIcon,
                                required: true,
                                render: (row) => (
                                    <TableMetaCell
                                        icon={SwordsIcon}
                                        value={`${row.home_team?.name || "-"} vs ${row.away_team?.name || "-"}`}
                                        truncate
                                        maxLength={42}
                                        textClassName="font-semibold"
                                    />
                                ),
                            },
                            {
                                key: "winner",
                                title: "Pemenang",
                                icon: TrophyIcon,
                                render: (row) => <TableMetaCell icon={TrophyIcon} value={row.winner_team?.name || "-"} />,
                            },
                            {
                                key: "status",
                                title: "Hasil",
                                icon: CheckCircle2Icon,
                                render: (row) => <ResultBadge match={row} />,
                            },
                        ]}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{teamDraft.id ? "Edit pasangan" : "Tambah pasangan"}</DialogTitle>
                        <DialogDescription>Nama pasangan akan tampil di klasemen publik.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Field label="Nama pasangan">
                                <Input value={teamDraft.name} onChange={(event) => setTeamDraft((current) => ({ ...current, name: event.target.value }))} />
                            </Field>
                        </div>
                        <Field label="Pemain 1">
                            <Input value={teamDraft.player_one} onChange={(event) => setTeamDraft((current) => ({ ...current, player_one: event.target.value }))} />
                        </Field>
                        <Field label="Pemain 2">
                            <Input value={teamDraft.player_two} onChange={(event) => setTeamDraft((current) => ({ ...current, player_two: event.target.value }))} />
                        </Field>
                        <Field label="Urutan">
                            <Input type="number" min="0" value={teamDraft.sort_order} onChange={(event) => setTeamDraft((current) => ({ ...current, sort_order: event.target.value }))} />
                        </Field>
                        <Field label="Status">
                            <NativeSelect value={teamDraft.is_active ? "1" : "0"} onChange={(value) => setTeamDraft((current) => ({ ...current, is_active: value === "1" }))}>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </NativeSelect>
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTeamOpen(false)}>Batal</Button>
                        <Button onClick={saveTeam}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
                <DialogContent className="max-h-[90svh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{matchDraft.id ? "Edit match" : "Tambah match"}</DialogTitle>
                        <DialogDescription>Pilih jadwal dari calendar dashboard, lalu isi pasangan dan hasil.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Field label="Jadwal calendar">
                                <NativeSelect value={matchDraft.schedule_id} onChange={(value) => setMatchDraft((current) => ({ ...current, schedule_id: value }))}>
                                    <option value="">Pilih jadwal</option>
                                    {(payload.schedules || []).map((schedule) => {
                                        const usedByCurrent = String(schedule.id) === String(matchDraft.schedule_id);
                                        return (
                                            <option key={schedule.id} value={schedule.id} disabled={schedule.has_tournament_match && !usedByCurrent}>
                                                {isoToIndoDate(schedule.date)} {schedule.start_time} · {schedule.title}{schedule.has_tournament_match && !usedByCurrent ? " (sudah dipakai)" : ""}
                                            </option>
                                        );
                                    })}
                                </NativeSelect>
                            </Field>
                        </div>
                        <Field label="Pasangan A">
                            <NativeSelect value={selectedHomeId} onChange={(value) => setMatchDraft((current) => ({ ...current, home_team_id: value }))}>
                                <option value="">Pilih pasangan</option>
                                {activeTeams.map((team) => (
                                    <option key={team.id} value={team.id} disabled={String(team.id) === selectedAwayId}>{team.name}</option>
                                ))}
                            </NativeSelect>
                        </Field>
                        <Field label="Pasangan B">
                            <NativeSelect value={selectedAwayId} onChange={(value) => setMatchDraft((current) => ({ ...current, away_team_id: value }))}>
                                <option value="">Pilih pasangan</option>
                                {activeTeams.map((team) => (
                                    <option key={team.id} value={team.id} disabled={String(team.id) === selectedHomeId}>{team.name}</option>
                                ))}
                            </NativeSelect>
                        </Field>
                        <Field label="Status">
                            <NativeSelect
                                value={matchDraft.status}
                                onChange={(value) => setMatchDraft((current) => ({
                                    ...current,
                                    status: value,
                                    result_type: value === "finished" ? current.result_type : "",
                                    winner_team_id: value === "finished" ? current.winner_team_id : "",
                                }))}
                            >
                                <option value="scheduled">Belum main</option>
                                <option value="finished">Selesai</option>
                            </NativeSelect>
                        </Field>
                        <Field label="Jenis hasil">
                            <NativeSelect
                                value={matchDraft.result_type}
                                disabled={matchDraft.status !== "finished"}
                                onChange={(value) => setMatchDraft((current) => ({ ...current, result_type: value }))}
                            >
                                <option value="">Pilih hasil</option>
                                <option value="straight">Menang telak / straight - 2 poin</option>
                                <option value="rubber">Menang rubber - 1 poin</option>
                            </NativeSelect>
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Pemenang">
                                <NativeSelect
                                    value={matchDraft.winner_team_id}
                                    disabled={matchDraft.status !== "finished"}
                                    onChange={(value) => setMatchDraft((current) => ({ ...current, winner_team_id: value }))}
                                >
                                    <option value="">Pilih pemenang</option>
                                    {activeTeams
                                        .filter((team) => [selectedHomeId, selectedAwayId].includes(String(team.id)))
                                        .map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                                </NativeSelect>
                            </Field>
                        </div>
                        <div className="sm:col-span-2">
                            <div className="grid gap-3 sm:grid-cols-3">
                                {matchDraft.set_scores.map((set, index) => (
                                    <div key={index} className="app-subpanel rounded-2xl p-3">
                                        <p className="mb-2 text-xs font-semibold text-muted-foreground">Set {index + 1}</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="A"
                                                value={set.home}
                                                onChange={(event) => setMatchDraft((current) => {
                                                    const next = [...current.set_scores];
                                                    next[index] = { ...next[index], home: event.target.value };
                                                    return { ...current, set_scores: next };
                                                })}
                                            />
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="B"
                                                value={set.away}
                                                onChange={(event) => setMatchDraft((current) => {
                                                    const next = [...current.set_scores];
                                                    next[index] = { ...next[index], away: event.target.value };
                                                    return { ...current, set_scores: next };
                                                })}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <Field label="Catatan">
                                <Textarea value={matchDraft.notes} onChange={(event) => setMatchDraft((current) => ({ ...current, notes: event.target.value }))} />
                            </Field>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setMatchOpen(false)}>Batal</Button>
                        <Button onClick={saveMatch}>Simpan Match</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus data?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data {stripHtml(deleteTarget?.name || "ini")} akan dihapus dari Tournament.
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
