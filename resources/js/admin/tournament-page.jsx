import React, { useEffect, useMemo, useState } from "react";
import {
    CalendarDaysIcon,
    CheckCircle2Icon,
    EyeIcon,
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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

const EMPTY_SELECT_VALUE = "__empty__";

function Field({ label, children, className = "" }) {
    return (
        <label className={`tournament-field ${className}`}>
            <span>{label}</span>
            {children}
        </label>
    );
}

function TournamentSelect({ value, onChange, placeholder = "Pilih opsi", disabled = false, children }) {
    return (
        <Select
            value={value ? String(value) : EMPTY_SELECT_VALUE}
            disabled={disabled}
            onValueChange={(nextValue) => onChange(nextValue === EMPTY_SELECT_VALUE ? "" : nextValue)}
        >
            <SelectTrigger className="tournament-select-trigger">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper" className="tournament-select-content">
                {children}
            </SelectContent>
        </Select>
    );
}

function scheduleDateLabel(schedule) {
    if (!schedule?.date) return "-";

    if (schedule.end_date && schedule.end_date !== schedule.date) {
        return `${isoToIndoDate(schedule.date)} - ${isoToIndoDate(schedule.end_date)}`;
    }

    return isoToIndoDate(schedule.date);
}

function scheduleMatchCountLabel(schedule) {
    const count = Number(schedule?.tournament_match_count || 0);

    return count > 0 ? ` (${count} partai)` : "";
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

function ActionButtons({ onDetail, onEdit, onDelete }) {
    return (
        <div className="tournament-row-actions">
            {onDetail ? (
                <button type="button" onClick={onDetail} aria-label="Lihat detail">
                    <EyeIcon className="size-4" />
                </button>
            ) : null}
            <button type="button" onClick={onEdit} aria-label="Edit data">
                <PencilIcon className="size-4" />
            </button>
            <button type="button" className="is-danger" onClick={onDelete} aria-label="Hapus data">
                <Trash2Icon className="size-4" />
            </button>
        </div>
    );
}

function isTournamentMatch(match) {
    return (match?.event_type || "match") === "match";
}

function pairKey(homeId, awayId) {
    const ids = [Number(homeId), Number(awayId)]
        .filter(Boolean)
        .sort((a, b) => a - b);

    return ids.length === 2 ? ids.join(":") : "";
}

function isPairUsed(homeId, awayId, currentMatchId, matches = []) {
    return Boolean(findPairMatch(homeId, awayId, currentMatchId, matches));
}

function findPairMatch(homeId, awayId, currentMatchId, matches = []) {
    const targetPair = pairKey(homeId, awayId);
    if (!targetPair) return null;

    return matches
        .filter(isTournamentMatch)
        .find((match) => {
            if (currentMatchId && Number(match.id) === Number(currentMatchId)) return false;

            return pairKey(match.home_team_id, match.away_team_id) === targetPair;
        }) || null;
}

function isTeamDisabledForOpponent(candidateId, opponentId, currentMatchId, matches = []) {
    if (!candidateId || !opponentId) return false;
    if (String(candidateId) === String(opponentId)) return true;

    return isPairUsed(candidateId, opponentId, currentMatchId, matches);
}

function teamSelectLabel(team) {
    return [team?.name, [team?.player_one, team?.player_two].filter(Boolean).join(" / ")]
        .filter(Boolean)
        .join(" - ");
}

function teamPlayersLabel(team) {
    return [team?.player_one, team?.player_two].filter(Boolean).join(" / ") || "Pemain belum diisi";
}

function lockedPairScheduleLabel(match) {
    if (!match?.schedule) return "Sudah terjadwal";

    return [
        scheduleDateLabel(match.schedule),
        match.schedule.start_time,
        match.schedule.location,
    ].filter(Boolean).join(" · ");
}

function formatMatchScore(match) {
    const score = (match?.set_scores || [])
        .filter((set) => set.home !== "" && set.away !== "" && set.home !== null && set.away !== null)
        .map((set) => `${set.home}-${set.away}`)
        .join(", ");

    if (score) return score;
    if (match?.status !== "finished") return "Belum main";

    return match?.result_type === "straight" ? "Straight" : "Rubber";
}

function resolveOpponent(match, teamId) {
    const id = Number(teamId);

    if (Number(match?.home_team_id) === id) return match.away_team || null;
    if (Number(match?.away_team_id) === id) return match.home_team || null;

    return null;
}

function resolveTeamOutcome(match, teamId) {
    if (match?.status !== "finished") return "scheduled";

    return Number(match?.winner_team_id) === Number(teamId) ? "win" : "loss";
}

function buildTeamMatchSummary(teams = [], matches = []) {
    const initial = teams.reduce((carry, team) => ({
        ...carry,
        [team.id]: {
            finished: 0,
            scheduled: 0,
            wins: 0,
            losses: 0,
            points: 0,
            finishedMatches: [],
            scheduledMatches: [],
            opponentNames: [],
        },
    }), {});

    matches
        .filter(isTournamentMatch)
        .forEach((match) => {
            [match.home_team_id, match.away_team_id]
                .filter(Boolean)
                .forEach((teamId) => {
                    if (!initial[teamId]) return;

                    const opponent = resolveOpponent(match, teamId);
                    const detail = {
                        ...match,
                        opponent,
                        outcome: resolveTeamOutcome(match, teamId),
                    };

                    if (opponent?.name) {
                        initial[teamId].opponentNames.push(opponent.name);
                    }

                    if (match.status === "finished") {
                        initial[teamId].finished += 1;
                        initial[teamId].finishedMatches.push(detail);

                        if (Number(match.winner_team_id) === Number(teamId)) {
                            initial[teamId].wins += 1;
                            initial[teamId].points += match.result_type === "straight" ? 2 : 1;
                        } else {
                            initial[teamId].losses += 1;
                        }
                    } else {
                        initial[teamId].scheduled += 1;
                        initial[teamId].scheduledMatches.push(detail);
                    }
                });
        });

    Object.values(initial).forEach((summary) => {
        const byScheduleAsc = (a, b) => `${a.schedule?.date || ""} ${a.schedule?.start_time || ""}`.localeCompare(`${b.schedule?.date || ""} ${b.schedule?.start_time || ""}`);
        summary.finishedMatches.sort((a, b) => byScheduleAsc(b, a));
        summary.scheduledMatches.sort(byScheduleAsc);
        summary.opponentNames = [...new Set(summary.opponentNames)];
    });

    return initial;
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

function TeamPanel({ rows, summaries, loading, search, onSearch, onDetail, onEdit, onDelete }) {
    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rows;

        return rows.filter((team) => [team.name, team.player_one, team.player_two, ...(summaries[team.id]?.opponentNames || [])]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query)));
    }, [rows, summaries, search]);

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
                            <th><CheckCircle2Icon className="size-3.5" /> Main</th>
                            <th><CalendarDaysIcon className="size-3.5" /> Scheduled</th>
                            <th><ShieldCheckIcon className="size-3.5" /> Status</th>
                            <th className="text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? Array.from({ length: 6 }).map((_, index) => (
                            <tr key={`loading-team-${index}`}>
                                <td colSpan={7}><div className="tournament-skeleton" /></td>
                            </tr>
                        )) : filteredRows.length ? filteredRows.map((team) => {
                            const summary = summaries[team.id] || {};

                            return (
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
                                    <td data-label="Main">
                                        <Badge variant="secondary" className="tournament-status-badge">{summary.finished || 0} selesai</Badge>
                                    </td>
                                    <td data-label="Scheduled">
                                        <Badge variant="outline" className="tournament-status-badge">{summary.scheduled || 0} siap</Badge>
                                    </td>
                                    <td data-label="Status">
                                        <Badge variant={team.is_active ? "secondary" : "outline"} className="tournament-status-badge">
                                            {team.is_active ? "Aktif" : "Nonaktif"}
                                        </Badge>
                                    </td>
                                    <td data-label="Aksi">
                                        <ActionButtons
                                            onDetail={() => onDetail(team)}
                                            onEdit={() => onEdit(team)}
                                            onDelete={() => onDelete(team)}
                                        />
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={7}>
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

function TeamDetailDialog({ team, summary, open, onOpenChange }) {
    const players = [team?.player_one, team?.player_two].filter(Boolean).join(" / ") || "Pemain belum lengkap";
    const metrics = [
        ["Selesai", summary?.finished || 0],
        ["Scheduled", summary?.scheduled || 0],
        ["Menang", summary?.wins || 0],
        ["Kalah", summary?.losses || 0],
        ["Poin", summary?.points || 0],
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="tournament-dialog tournament-team-detail-dialog max-h-[88svh] max-w-[760px] p-0">
                <DialogHeader className="tournament-dialog-head">
                    <DialogTitle>{team?.name || "Detail pasangan"}</DialogTitle>
                    <DialogDescription>{players}</DialogDescription>
                </DialogHeader>
                <div className="tournament-dialog-body">
                    <div className="tournament-detail-summary">
                        {metrics.map(([label, value]) => (
                            <div key={label} className="tournament-detail-metric">
                                <span>{label}</span>
                                <strong>{value}</strong>
                            </div>
                        ))}
                    </div>

                    <div className="tournament-detail-section">
                        <div className="tournament-detail-section-head">
                            <h3>Sudah bertanding</h3>
                            <Badge variant="secondary" className="tournament-status-badge">{summary?.finished || 0} match</Badge>
                        </div>
                        {summary?.finishedMatches?.length ? (
                            <div className="tournament-ledger-list">
                                {summary.finishedMatches.map((match) => (
                                    <div key={`finished-${match.id}`} className="tournament-ledger-row">
                                        <div>
                                            <strong>{match.opponent?.name || "Lawan belum diisi"}</strong>
                                            <span>{scheduleDateLabel(match.schedule)} · {match.schedule?.start_time || "-"}</span>
                                        </div>
                                        <div className="tournament-ledger-result">
                                            <Badge
                                                variant={match.outcome === "win" ? "secondary" : "outline"}
                                                className={`tournament-status-badge ${match.outcome === "win" ? "is-win" : "is-loss"}`}
                                            >
                                                {match.outcome === "win" ? "Menang" : "Kalah"}
                                            </Badge>
                                            <span>{formatMatchScore(match)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState>Belum ada match selesai.</EmptyState>
                        )}
                    </div>

                    <div className="tournament-detail-section">
                        <div className="tournament-detail-section-head">
                            <h3>Akan bertanding</h3>
                            <Badge variant="outline" className="tournament-status-badge">{summary?.scheduled || 0} scheduled</Badge>
                        </div>
                        {summary?.scheduledMatches?.length ? (
                            <div className="tournament-ledger-list">
                                {summary.scheduledMatches.map((match) => (
                                    <div key={`scheduled-${match.id}`} className="tournament-ledger-row">
                                        <div>
                                            <strong>{match.opponent?.name || "Lawan belum diisi"}</strong>
                                            <span>{scheduleDateLabel(match.schedule)} · {match.schedule?.start_time || "-"} · {match.schedule?.location || "Lokasi belum diisi"}</span>
                                        </div>
                                        <div className="tournament-ledger-result">
                                            <Badge variant="outline" className="tournament-status-badge">Belum main</Badge>
                                            <span>{match.schedule?.title || "Jadwal liga"}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState>Belum ada jadwal berikutnya.</EmptyState>
                        )}
                    </div>
                </div>
                <DialogFooter className="tournament-dialog-footer">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                                            <strong>{scheduleDateLabel(match.schedule)}</strong>
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
    const [detailTeam, setDetailTeam] = useState(null);
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
    const teamSummaries = useMemo(
        () => buildTeamMatchSummary(payload.teams || [], payload.matches || []),
        [payload.teams, payload.matches]
    );

    const selectedHomeId = String(matchDraft.home_team_id || "");
    const selectedAwayId = String(matchDraft.away_team_id || "");
    const isInfoEvent = (matchDraft.event_type || "match") === "info";
    const detailSummary = detailTeam ? teamSummaries[detailTeam.id] : null;

    const updateHomeTeam = (value) => {
        setMatchDraft((current) => {
            const nextAwayId = isTeamDisabledForOpponent(current.away_team_id, value, current.id, payload.matches) ? "" : current.away_team_id;
            const nextWinnerId = [value, nextAwayId].includes(current.winner_team_id) ? current.winner_team_id : "";

            return {
                ...current,
                home_team_id: value,
                away_team_id: nextAwayId,
                winner_team_id: nextWinnerId,
            };
        });
    };

    const updateAwayTeam = (value) => {
        setMatchDraft((current) => {
            const nextHomeId = isTeamDisabledForOpponent(current.home_team_id, value, current.id, payload.matches) ? "" : current.home_team_id;
            const nextWinnerId = [nextHomeId, value].includes(current.winner_team_id) ? current.winner_team_id : "";

            return {
                ...current,
                home_team_id: nextHomeId,
                away_team_id: value,
                winner_team_id: nextWinnerId,
            };
        });
    };

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
                        summaries={teamSummaries}
                        loading={loading}
                        search={teamSearch}
                        onSearch={setTeamSearch}
                        onDetail={setDetailTeam}
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
                            <TournamentSelect value={teamDraft.is_active ? "1" : "0"} onChange={(value) => setTeamDraft((current) => ({ ...current, is_active: value === "1" }))}>
                                <SelectItem value="1">Aktif</SelectItem>
                                <SelectItem value="0">Nonaktif</SelectItem>
                            </TournamentSelect>
                        </Field>
                    </div>
                    <DialogFooter className="tournament-dialog-footer">
                        <Button variant="outline" onClick={() => setTeamOpen(false)}>Batal</Button>
                        <Button onClick={saveTeam}>Simpan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TeamDetailDialog
                team={detailTeam}
                summary={detailSummary}
                open={Boolean(detailTeam)}
                onOpenChange={(open) => !open && setDetailTeam(null)}
            />

            <Dialog open={matchOpen} onOpenChange={setMatchOpen}>
                <DialogContent className="tournament-dialog tournament-match-dialog max-h-[90svh] p-0">
                    <DialogHeader className="tournament-dialog-head">
                        <DialogTitle>{matchDraft.id ? "Edit match" : "Tambah match"}</DialogTitle>
                        <DialogDescription>Pilih jadwal dari calendar dashboard, lalu isi pasangan dan hasil.</DialogDescription>
                    </DialogHeader>
                    <div className="tournament-dialog-body">
                        <div className="tournament-form-section">
                            <h3>Jadwal</h3>
                            <Field label="Jadwal calendar">
                                <TournamentSelect value={matchDraft.schedule_id} onChange={(value) => setMatchDraft((current) => ({ ...current, schedule_id: value }))} placeholder="Pilih jadwal">
                                    <SelectItem value={EMPTY_SELECT_VALUE}>Pilih jadwal</SelectItem>
                                    {(payload.schedules || []).map((schedule) => (
                                        <SelectItem key={schedule.id} value={String(schedule.id)}>
                                            {scheduleDateLabel(schedule)} {schedule.start_time} · {schedule.title}{scheduleMatchCountLabel(schedule)}
                                        </SelectItem>
                                    ))}
                                </TournamentSelect>
                            </Field>
                        </div>

                        <div className="tournament-form-section">
                            <h3>Jenis jadwal</h3>
                            <div className="grid gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
                                <Field label="Tipe">
                                    <TournamentSelect
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
                                        <SelectItem value="match">Pertandingan</SelectItem>
                                        <SelectItem value="info">Informasi</SelectItem>
                                    </TournamentSelect>
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
                                                <TournamentSelect value={selectedHomeId} onChange={updateHomeTeam} placeholder="Pilih pasangan">
                                                    <SelectItem value={EMPTY_SELECT_VALUE}>Pilih pasangan</SelectItem>
                                                    {activeTeams.map((team) => {
                                                        const sameTeam = selectedAwayId && String(team.id) === selectedAwayId;
                                                        const lockedMatch = sameTeam ? null : findPairMatch(team.id, selectedAwayId, matchDraft.id, payload.matches);
                                                        const disabled = Boolean(sameTeam || lockedMatch);
                                                        const detail = sameTeam
                                                            ? "Pasangan lawan sedang dipilih"
                                                            : lockedMatch
                                                                ? `Sudah terjadwal: ${lockedPairScheduleLabel(lockedMatch)}`
                                                                : teamPlayersLabel(team);

                                                        return (
                                                            <SelectItem key={team.id} value={String(team.id)} disabled={disabled} textValue={`${teamSelectLabel(team)} ${detail}`}>
                                                                <span className={`tournament-select-row ${disabled ? "is-disabled" : ""}`}>
                                                                    <strong>{team.name}</strong>
                                                                    <small>{detail}</small>
                                                                </span>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </TournamentSelect>
                                            </Field>
                                            <Field label="Pasangan B">
                                                <TournamentSelect value={selectedAwayId} onChange={updateAwayTeam} placeholder="Pilih pasangan">
                                                    <SelectItem value={EMPTY_SELECT_VALUE}>Pilih pasangan</SelectItem>
                                                    {activeTeams.map((team) => {
                                                        const sameTeam = selectedHomeId && String(team.id) === selectedHomeId;
                                                        const lockedMatch = sameTeam ? null : findPairMatch(team.id, selectedHomeId, matchDraft.id, payload.matches);
                                                        const disabled = Boolean(sameTeam || lockedMatch);
                                                        const detail = sameTeam
                                                            ? "Pasangan lawan sedang dipilih"
                                                            : lockedMatch
                                                                ? `Sudah terjadwal: ${lockedPairScheduleLabel(lockedMatch)}`
                                                                : teamPlayersLabel(team);

                                                        return (
                                                            <SelectItem key={team.id} value={String(team.id)} disabled={disabled} textValue={`${teamSelectLabel(team)} ${detail}`}>
                                                                <span className={`tournament-select-row ${disabled ? "is-disabled" : ""}`}>
                                                                    <strong>{team.name}</strong>
                                                                    <small>{detail}</small>
                                                                </span>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </TournamentSelect>
                                            </Field>
                                        </div>
                                        <p className="tournament-field-hint">Lawan yang sudah terjadwal otomatis dikunci agar pairing liga tidak dobel.</p>
                                    </div>

                                    <div className="tournament-form-section">
                                        <h3>Hasil</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field label="Status">
                                                <TournamentSelect
                                                    value={matchDraft.status}
                                                    onChange={(value) => setMatchDraft((current) => ({
                                                        ...current,
                                                        status: value,
                                                        result_type: value === "finished" ? current.result_type : "",
                                                        winner_team_id: value === "finished" ? current.winner_team_id : "",
                                                    }))}
                                                >
                                                    <SelectItem value="scheduled">Belum main</SelectItem>
                                                    <SelectItem value="finished">Selesai</SelectItem>
                                                </TournamentSelect>
                                            </Field>
                                            <Field label="Jenis hasil">
                                                <TournamentSelect
                                                    value={matchDraft.result_type}
                                                    disabled={matchDraft.status !== "finished"}
                                                    onChange={(value) => setMatchDraft((current) => ({ ...current, result_type: value }))}
                                                    placeholder="Pilih hasil"
                                                >
                                                    <SelectItem value={EMPTY_SELECT_VALUE}>Pilih hasil</SelectItem>
                                                    <SelectItem value="straight">Straight - 2 poin</SelectItem>
                                                    <SelectItem value="rubber">Rubber - 1 poin</SelectItem>
                                                </TournamentSelect>
                                            </Field>
                                        </div>
                                        <Field label="Pemenang">
                                            <TournamentSelect
                                                value={matchDraft.winner_team_id}
                                                disabled={matchDraft.status !== "finished"}
                                                onChange={(value) => setMatchDraft((current) => ({ ...current, winner_team_id: value }))}
                                                placeholder="Pilih pemenang"
                                            >
                                                <SelectItem value={EMPTY_SELECT_VALUE}>Pilih pemenang</SelectItem>
                                                {activeTeams
                                                    .filter((team) => [selectedHomeId, selectedAwayId].includes(String(team.id)))
                                                    .map((team) => (
                                                        <SelectItem key={team.id} value={String(team.id)}>
                                                            {team.name}
                                                        </SelectItem>
                                                    ))}
                                            </TournamentSelect>
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
