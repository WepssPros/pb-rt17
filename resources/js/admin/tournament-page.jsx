import React, { useEffect, useMemo, useState } from "react";
import {
    CalendarDaysIcon,
    CheckCircle2Icon,
    ExternalLinkIcon,
    ListOrderedIcon,
    PencilIcon,
    PlusIcon,
    SearchIcon,
    ShieldCheckIcon,
    SwordsIcon,
    Trash2Icon,
    TrophyIcon,
    UserRoundIcon,
    UsersRoundIcon,
} from "lucide-react";
import { toast } from "sonner";

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
    event_type: "match",
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

function Field({ label, children, className = "" }) {
    return (
        <label className={`tournament-field ${className}`}>
            <span>{label}</span>
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
            className="tournament-input"
        >
            {children}
        </select>
    );
}

function PageHeader({ publicUrl, onAddTeam, onAddMatch }) {
    return (
        <section className="tournament-hero">
            <div className="min-w-0">
                <div className="tournament-kicker">
                    <TrophyIcon className="size-3.5" />
                    Tournament
                </div>
                <h1>Liga Payo 17</h1>
                <p>Kelola pasangan, jadwal match, dan hasil liga ganda putra.</p>
            </div>
            <div className="tournament-actions">
                <Button asChild variant="outline" className="tournament-action-button">
                    <a href={publicUrl} target="_blank" rel="noreferrer">
                        <ExternalLinkIcon data-icon="inline-start" />
                        Preview
                    </a>
                </Button>
                <Button variant="outline" className="tournament-action-button" onClick={onAddTeam}>
                    <PlusIcon data-icon="inline-start" />
                    Pasangan
                </Button>
                <Button className="tournament-action-button" onClick={onAddMatch}>
                    <SwordsIcon data-icon="inline-start" />
                    Match
                </Button>
            </div>
        </section>
    );
}

function ResultBadge({ match }) {
    if ((match.event_type || "match") === "info") {
        return <Badge variant="secondary" className="tournament-status-badge">Informasi</Badge>;
    }

    if (match.status !== "finished") {
        return <Badge variant="outline" className="tournament-status-badge">Belum main</Badge>;
    }

    return (
        <Badge variant="secondary" className="tournament-status-badge">
            <TrophyIcon className="size-3" />
            {match.result_type === "straight" ? "Straight 2 poin" : "Rubber 1 poin"}
        </Badge>
    );
}

function ActionButtons({ onEdit, onDelete }) {
    return (
        <div className="tournament-row-actions">
            <button type="button" onClick={onEdit} aria-label="Edit data">
                <PencilIcon className="size-4" />
            </button>
            <button type="button" className="is-danger" onClick={onDelete} aria-label="Hapus data">
                <Trash2Icon className="size-4" />
            </button>
        </div>
    );
}

function EmptyState({ children }) {
    return (
        <div className="tournament-empty">
            <UsersRoundIcon className="size-5" />
            <span>{children}</span>
        </div>
    );
}

function PanelToolbar({ title, description, count, search, onSearch, placeholder }) {
    return (
        <div className="tournament-panel-head">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h2>{title}</h2>
                    <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px]">
                        {count} baris
                    </Badge>
                </div>
                <p>{description}</p>
            </div>
            <div className="tournament-search">
                <SearchIcon className="size-4" />
                <Input
                    value={search}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder={placeholder}
                    className="app-input h-10 rounded-2xl pl-10"
                />
            </div>
        </div>
    );
}

function TeamPanel({ rows, loading, search, onSearch, onEdit, onDelete }) {
    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rows;

        return rows.filter((team) => [team.name, team.player_one, team.player_two]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)));
    }, [rows, search]);

    return (
        <section className="tournament-panel">
            <PanelToolbar
                title="Pasangan ganda putra"
                description="Daftar peserta aktif dan urutan tampil di klasemen."
                count={filteredRows.length}
                search={search}
                onSearch={onSearch}
                placeholder="Cari pasangan"
            />

            <div className="tournament-table-wrap">
                <table className="tournament-table">
                    <thead>
                        <tr>
                            <th><ListOrderedIcon className="size-3.5" /> Urutan</th>
                            <th><UsersRoundIcon className="size-3.5" /> Pasangan</th>
                            <th><UserRoundIcon className="size-3.5" /> Pemain</th>
                            <th><ShieldCheckIcon className="size-3.5" /> Status</th>
                            <th className="text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? Array.from({ length: 6 }).map((_, index) => (
                            <tr key={`loading-team-${index}`}>
                                <td colSpan={5}><div className="tournament-skeleton" /></td>
                            </tr>
                        )) : filteredRows.length ? filteredRows.map((team) => (
                            <tr key={team.id}>
                                <td data-label="Urutan">
                                    <Badge variant="outline" className="tournament-order">{team.sort_order || 0}</Badge>
                                </td>
                                <td data-label="Pasangan">
                                    <div className="tournament-meta">
                                        <span className="tournament-icon"><UsersRoundIcon className="size-4" /></span>
                                        <strong>{team.name}</strong>
                                    </div>
                                </td>
                                <td data-label="Pemain">
                                    <span className="tournament-muted">
                                        {[team.player_one, team.player_two].filter(Boolean).join(" / ") || "-"}
                                    </span>
                                </td>
                                <td data-label="Status">
                                    <Badge variant={team.is_active ? "secondary" : "outline"} className="tournament-status-badge">
                                        {team.is_active ? "Aktif" : "Nonaktif"}
                                    </Badge>
                                </td>
                                <td data-label="Aksi">
                                    <ActionButtons
                                        onEdit={() => onEdit(team)}
                                        onDelete={() => onDelete(team)}
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState>Belum ada pasangan yang cocok.</EmptyState>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function MatchPanel({ rows, loading, search, onSearch, onEdit, onDelete }) {
    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rows;

        return rows.filter((match) => [
            match.status,
            match.event_type,
            match.result_type,
            match.schedule?.title,
            match.schedule?.location,
            match.home_team?.name,
            match.away_team?.name,
            match.winner_team?.name,
        ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
    }, [rows, search]);

    return (
        <section className="tournament-panel">
            <PanelToolbar
                title="Match liga"
                description="Match mengambil jadwal dari calendar dashboard yang sudah dibuat."
                count={filteredRows.length}
                search={search}
                onSearch={onSearch}
                placeholder="Cari match"
            />

            <div className="tournament-table-wrap">
                <table className="tournament-table">
                    <thead>
                        <tr>
                            <th><CalendarDaysIcon className="size-3.5" /> Jadwal</th>
                            <th><SwordsIcon className="size-3.5" /> Match</th>
                            <th><TrophyIcon className="size-3.5" /> Pemenang</th>
                            <th><CheckCircle2Icon className="size-3.5" /> Hasil</th>
                            <th className="text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? Array.from({ length: 6 }).map((_, index) => (
                            <tr key={`loading-match-${index}`}>
                                <td colSpan={5}><div className="tournament-skeleton" /></td>
                            </tr>
                        )) : filteredRows.length ? filteredRows.map((match) => (
                            <tr key={match.id}>
                                <td data-label="Jadwal">
                                    <div className="tournament-meta">
                                        <span className="tournament-icon"><CalendarDaysIcon className="size-4" /></span>
                                        <div>
                                            <strong>{isoToIndoDate(match.schedule?.date)}</strong>
                                            <span>{match.schedule?.start_time || "-"} · {match.schedule?.location || "Lokasi belum diisi"}</span>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Match">
                                    <div className="tournament-meta">
                                        <span className="tournament-icon"><SwordsIcon className="size-4" /></span>
                                        <strong>
                                            {(match.event_type || "match") === "info"
                                                ? (match.schedule?.title || "Informasi Liga")
                                                : `${match.home_team?.name || "-"} vs ${match.away_team?.name || "-"}`}
                                        </strong>
                                    </div>
                                </td>
                                <td data-label="Pemenang">
                                    <span className="tournament-muted">{(match.event_type || "match") === "info" ? "Informasi" : (match.winner_team?.name || "-")}</span>
                                </td>
                                <td data-label="Hasil">
                                    <ResultBadge match={match} />
                                </td>
                                <td data-label="Aksi">
                                    <ActionButtons
                                        onEdit={() => onEdit(match)}
                                        onDelete={() => onDelete(match)}
                                    />
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5}>
                                    <EmptyState>Belum ada match yang cocok.</EmptyState>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function normalizeMatch(row) {
    return {
        ...emptyMatch,
        id: row.id || "",
        event_type: row.event_type || "match",
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
    const [teamSearch, setTeamSearch] = useState("");
    const [matchSearch, setMatchSearch] = useState("");
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
    const isInfoEvent = (matchDraft.event_type || "match") === "info";

    const openCreateTeam = () => {
        setTeamDraft(emptyTeam);
        setTeamOpen(true);
    };

    const openEditTeam = (row) => {
        setTeamDraft({
            id: row.id,
            name: row.name || "",
            player_one: row.player_one || "",
            player_two: row.player_two || "",
            is_active: Boolean(row.is_active),
            sort_order: row.sort_order || 0,
        });
        setTeamOpen(true);
    };

    const openCreateMatch = () => {
        setMatchDraft(emptyMatch);
        setMatchOpen(true);
    };

    const openEditMatch = (row) => {
        setMatchDraft(normalizeMatch(row));
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
                ["event_type", matchDraft.event_type || "match"],
                ["home_team_id", isInfoEvent ? "" : matchDraft.home_team_id],
                ["away_team_id", isInfoEvent ? "" : matchDraft.away_team_id],
                ["status", isInfoEvent ? "scheduled" : matchDraft.status],
                ["result_type", !isInfoEvent && matchDraft.status === "finished" ? matchDraft.result_type : ""],
                ["winner_team_id", !isInfoEvent && matchDraft.status === "finished" ? matchDraft.winner_team_id : ""],
                ["notes", matchDraft.notes],
                ...(matchDraft.id ? [["_method", "PATCH"]] : []),
            ];

            if (!isInfoEvent) {
                matchDraft.set_scores.forEach((set, index) => {
                    entries.push([`set_scores[${index}][home]`, set.home]);
                    entries.push([`set_scores[${index}][away]`, set.away]);
                });
            }

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
        <div className="tournament-page">
            <PageHeader publicUrl={routes.publicUrl} onAddTeam={openCreateTeam} onAddMatch={openCreateMatch} />

            <Tabs defaultValue="teams" className="tournament-tabs-shell">
                <TabsList className="tournament-tabs">
                    <TabsTrigger value="teams">Pasangan</TabsTrigger>
                    <TabsTrigger value="matches">Hasil Match</TabsTrigger>
                </TabsList>

                <TabsContent value="teams" className="mt-3">
                    <TeamPanel
                        rows={payload.teams || []}
                        loading={loading}
                        search={teamSearch}
                        onSearch={setTeamSearch}
                        onEdit={openEditTeam}
                        onDelete={(row) => setDeleteTarget({ type: "team", id: row.id, name: row.name })}
                    />
                </TabsContent>

                <TabsContent value="matches" className="mt-3">
                    <MatchPanel
                        rows={payload.matches || []}
                        loading={loading}
                        search={matchSearch}
                        onSearch={setMatchSearch}
                        onEdit={openEditMatch}
                        onDelete={(row) => setDeleteTarget({
                            type: "match",
                            id: row.id,
                            name: (row.event_type || "match") === "info"
                                ? (row.schedule?.title || "Informasi Liga")
                                : `${row.home_team?.name} vs ${row.away_team?.name}`,
                        })}
                    />
                </TabsContent>
            </Tabs>

            <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
                <DialogContent className="tournament-dialog max-w-[640px] p-0">
                    <DialogHeader className="tournament-dialog-head">
                        <DialogTitle>{teamDraft.id ? "Edit pasangan" : "Tambah pasangan"}</DialogTitle>
                        <DialogDescription>Nama pasangan akan tampil di klasemen publik.</DialogDescription>
                    </DialogHeader>
                    <div className="tournament-dialog-body grid gap-4 sm:grid-cols-2">
                        <Field label="Nama pasangan" className="sm:col-span-2">
                            <Input className="tournament-input" value={teamDraft.name} onChange={(event) => setTeamDraft((current) => ({ ...current, name: event.target.value }))} />
                        </Field>
                        <Field label="Pemain 1">
                            <Input className="tournament-input" value={teamDraft.player_one} onChange={(event) => setTeamDraft((current) => ({ ...current, player_one: event.target.value }))} />
                        </Field>
                        <Field label="Pemain 2">
                            <Input className="tournament-input" value={teamDraft.player_two} onChange={(event) => setTeamDraft((current) => ({ ...current, player_two: event.target.value }))} />
                        </Field>
                        <Field label="Urutan">
                            <Input className="tournament-input" type="number" min="0" value={teamDraft.sort_order} onChange={(event) => setTeamDraft((current) => ({ ...current, sort_order: event.target.value }))} />
                        </Field>
                        <Field label="Status">
                            <NativeSelect value={teamDraft.is_active ? "1" : "0"} onChange={(value) => setTeamDraft((current) => ({ ...current, is_active: value === "1" }))}>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </NativeSelect>
                        </Field>
                    </div>
                    <DialogFooter className="tournament-dialog-footer">
                        <Button variant="outline" onClick={() => setTeamOpen(false)}>Batal</Button>
                        <Button onClick={saveTeam}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
                <DialogContent className="tournament-dialog tournament-match-dialog max-h-[88svh] max-w-[860px] p-0">
                    <DialogHeader className="tournament-dialog-head">
                        <DialogTitle>{matchDraft.id ? "Edit match" : "Tambah match"}</DialogTitle>
                        <DialogDescription>Pilih jadwal dari calendar dashboard, lalu isi pasangan dan hasil.</DialogDescription>
                    </DialogHeader>
                    <div className="tournament-dialog-body">
                        <div className="tournament-form-section">
                            <h3>Jadwal</h3>
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

                        <div className="tournament-form-section">
                            <h3>Jenis jadwal</h3>
                            <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
                                <Field label="Tipe">
                                    <NativeSelect
                                        value={matchDraft.event_type || "match"}
                                        onChange={(value) => setMatchDraft((current) => ({
                                            ...current,
                                            event_type: value,
                                            home_team_id: value === "info" ? "" : current.home_team_id,
                                            away_team_id: value === "info" ? "" : current.away_team_id,
                                            winner_team_id: value === "info" ? "" : current.winner_team_id,
                                            result_type: value === "info" ? "" : current.result_type,
                                            status: value === "info" ? "scheduled" : current.status,
                                            set_scores: value === "info" ? emptyMatch.set_scores : current.set_scores,
                                        }))}
                                    >
                                        <option value="match">Pertandingan</option>
                                        <option value="info">Informasi</option>
                                    </NativeSelect>
                                </Field>
                                <div className="tournament-info-hint">
                                    {isInfoEvent
                                        ? "Gunakan catatan untuk pengumuman, meeting, briefing, atau informasi lain. Data ini tidak masuk klasemen."
                                        : "Pertandingan masuk jadwal liga dan hasilnya bisa menghitung klasemen jika status selesai."}
                                </div>
                            </div>
                        </div>

                        {!isInfoEvent ? (
                            <>
                                <div className="tournament-form-grid">
                                    <div className="tournament-form-section">
                                        <h3>Pasangan</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
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
                                        </div>
                                    </div>

                                    <div className="tournament-form-section">
                                        <h3>Hasil</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
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
                                                    <option value="straight">Straight - 2 poin</option>
                                                    <option value="rubber">Rubber - 1 poin</option>
                                                </NativeSelect>
                                            </Field>
                                        </div>
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
                                </div>

                                <div className="tournament-form-section">
                                    <h3>Skor set</h3>
                                    <div className="tournament-set-grid">
                                        {matchDraft.set_scores.map((set, index) => (
                                            <div key={index} className="tournament-set-card">
                                                <p>Set {index + 1}</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <Input
                                                        className="tournament-input text-center"
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
                                                        className="tournament-input text-center"
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
                            </>
                        ) : null}

                        <div className="tournament-form-section">
                            <h3>{isInfoEvent ? "Informasi" : "Catatan"}</h3>
                            <Field label={isInfoEvent ? "Isi informasi" : "Catatan match"}>
                                <Textarea
                                    className="tournament-input min-h-24 resize-y"
                                    placeholder={isInfoEvent ? "Contoh: Technical meeting, perubahan jadwal, atau informasi untuk peserta." : "Tulis catatan tambahan untuk match ini."}
                                    value={matchDraft.notes}
                                    onChange={(event) => setMatchDraft((current) => ({ ...current, notes: event.target.value }))}
                                />
                            </Field>
                        </div>
                    </div>
                    <DialogFooter className="tournament-dialog-footer">
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
        </div>
    );
}
