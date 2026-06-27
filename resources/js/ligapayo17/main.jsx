import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import {
    CalendarDaysIcon,
    CheckIcon,
    MapPinIcon,
    MinusIcon,
    MoonStarIcon,
    SunMediumIcon,
    TrophyIcon,
    UsersRoundIcon,
    XIcon,
} from "lucide-react";

import { fetchJson, isoToIndoDate } from "@/admin/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const formToneClass = {
    W: "liga-form-w",
    R: "liga-form-r",
    L: "liga-form-l",
};

const formIconMap = {
    W: CheckIcon,
    R: CheckIcon,
    L: XIcon,
    D: MinusIcon,
    "-": MinusIcon,
};

function FormDots({ values = [] }) {
    return (
        <div className="liga-form">
            {values.length ? values.map((value, index) => {
                const Icon = formIconMap[value] || MinusIcon;
                const latestClass = index === 0 ? "liga-form-latest" : "";

                return (
                    <span
                        key={`${value}-${index}`}
                        className={`liga-form-dot ${formToneClass[value] || "liga-form-draw"} ${latestClass}`}
                        title={value === "W" ? "Menang" : value === "R" ? "Menang rubber" : "Kalah"}
                        aria-label={value === "W" ? "Menang" : value === "R" ? "Menang rubber" : "Kalah"}
                    >
                        <Icon className="liga-form-icon" strokeWidth={3.2} />
                    </span>
                );
            }) : (
                <span className="liga-form-dot liga-form-draw" title="Belum ada hasil" aria-label="Belum ada hasil">
                    <MinusIcon className="liga-form-icon" strokeWidth={3.2} />
                </span>
            )}
        </div>
    );
}

function TeamNames({ row }) {
    return (
        <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">
                {[row.player_one, row.player_two].filter(Boolean).join(" / ") || "Ganda putra"}
            </p>
        </div>
    );
}

function StandingsTable({ rows }) {
    if (!rows.length) {
        return (
            <div className="liga-empty">
                <UsersRoundIcon className="size-5" />
                <span>Belum ada data klasemen.</span>
            </div>
        );
    }

    return (
        <div className="liga-table-wrap">
            <table className="liga-table">
                <colgroup>
                    <col className="liga-col-pos" />
                    <col className="liga-col-team" />
                    <col className="liga-col-stat" />
                    <col className="liga-col-stat" />
                    <col className="liga-col-stat" />
                    <col className="liga-col-set" />
                    <col className="liga-col-pts" />
                    <col className="liga-col-last" />
                </colgroup>
                <thead>
                    <tr>
                        <th className="w-10">#</th>
                        <th>Pasangan</th>
                        <th>MP</th>
                        <th>W</th>
                        <th>L</th>
                        <th>Set</th>
                        <th className="text-right">Pts</th>
                        <th>Last 5</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id} className={row.position <= 4 ? "liga-row-final" : ""}>
                            <td className="liga-pos">{row.position}</td>
                            <td className="liga-team-cell"><TeamNames row={row} /></td>
                            <td>{row.mp}</td>
                            <td>{row.w}</td>
                            <td>{row.l}</td>
                            <td>{row.set_for}-{row.set_against}</td>
                            <td className="liga-points">{row.points}</td>
                            <td className="liga-last-five"><FormDots values={row.form} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MobileStandings({ rows }) {
    if (!rows.length) return null;

    return (
        <div className="liga-mobile-list">
            {rows.map((row) => (
                <div className="liga-mobile-row" key={row.id}>
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="liga-mobile-pos">{row.position}</span>
                        <TeamNames row={row} />
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-semibold leading-none text-foreground">{row.points}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pts</p>
                    </div>
                    <div className="liga-mobile-meta">
                        <span>MP {row.mp}</span>
                        <span>W {row.w}</span>
                        <span>L {row.l}</span>
                        <span>Set {row.set_for}-{row.set_against}</span>
                    </div>
                    <FormDots values={row.form} />
                </div>
            ))}
        </div>
    );
}

function scoreLabel(match) {
    if ((match?.event_type || "match") === "info") return "Informasi";

    const scores = match?.set_scores || [];
    const filled = scores
        .filter((set) => set.home !== "" && set.away !== "")
        .map((set) => `${set.home}-${set.away}`)
        .join(", ");

    if (filled) return filled;
    if (match?.status !== "finished") return "Belum main";

    return match.result_type === "straight" ? "Straight" : "Rubber";
}

function LigaPayo17App({ endpoint }) {
    const [payload, setPayload] = useState({ league: {}, standings: [], events: [], matches: [] });
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [activeTab, setActiveTab] = useState("standings");
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "light";
        return window.localStorage.getItem("pbrt-theme") || document.documentElement.dataset.theme || "light";
    });

    useEffect(() => {
        fetchJson(endpoint)
            .then(setPayload)
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, [endpoint]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem("pbrt-theme", theme);
    }, [theme]);

    const hasEvents = Boolean(payload.events?.length);
    const nextMatches = useMemo(
        () => (payload.matches || []).filter((match) => (match.event_type || "match") === "match" && match.status !== "finished").slice(0, 3),
        [payload.matches]
    );
    const selectedIsInfo = (selectedMatch?.event_type || "match") === "info";
    const selectedTitle = selectedIsInfo
        ? (selectedMatch?.schedule?.title || "Informasi Liga")
        : `${selectedMatch?.home_team?.name || "-"} vs ${selectedMatch?.away_team?.name || "-"}`;

    return (
        <main className="liga-page">
            <section className="liga-shell">
                <header className="liga-header">
                    <div>
                        <div className="liga-kicker">
                            <TrophyIcon className="size-3.5" />
                            Badminton Ganda Putra
                        </div>
                        <h1>{payload.league?.name || "Liga Payo 17"}</h1>
                        <p>{payload.league?.subtitle || "Klasemen badminton ganda putra PBRT17"}</p>
                    </div>
                    <div className="liga-header-side">
                        <button
                            type="button"
                            className="liga-theme-toggle"
                            onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
                            aria-label={theme === "dark" ? "Aktifkan light mode" : "Aktifkan dark mode"}
                        >
                            {theme === "dark" ? <SunMediumIcon className="size-4" /> : <MoonStarIcon className="size-4" />}
                            <span>{theme === "dark" ? "Light" : "Dark"}</span>
                        </button>
                        <div className="liga-updated">
                            <span>Updated</span>
                            <strong>{payload.league?.updated_at || "-"}</strong>
                        </div>
                    </div>
                </header>

                <nav className="liga-tabs" aria-label="Liga Payo 17 sections">
                    <button
                        type="button"
                        className={activeTab === "standings" ? "is-active" : ""}
                        onClick={() => setActiveTab("standings")}
                    >
                        Klasemen
                    </button>
                    <button
                        type="button"
                        className={activeTab === "schedule" ? "is-active" : ""}
                        onClick={() => setActiveTab("schedule")}
                    >
                        Jadwal
                    </button>
                </nav>

                {activeTab === "standings" ? (
                <section className="liga-section">
                    <div className="liga-section-head">
                        <div>
                            <h2>Klasemen</h2>
                            <p>Menang telak 2 poin, rubber 1 poin, kalah 0 poin.</p>
                            <div className="liga-finals-note">
                                <i />
                                <span>Garis kiri hijau menandai 4 besar Grand Final.</span>
                            </div>
                        </div>
                        <div className="liga-legend">
                            <span><i className="liga-dot-win" /> W</span>
                            <span><i className="liga-dot-rubber" /> R</span>
                            <span><i className="liga-dot-loss" /> L</span>
                        </div>
                    </div>
                    {loading ? (
                        <div className="liga-skeleton" />
                    ) : !payload.standings?.length ? (
                        <StandingsTable rows={[]} />
                    ) : (
                        <StandingsTable rows={payload.standings || []} />
                    )}
                </section>
                ) : null}

                {activeTab === "standings" && nextMatches.length ? (
                    <section className="liga-next">
                        {nextMatches.map((match) => (
                            <div key={match.id} className="liga-next-item">
                                <span>{isoToIndoDate(match.schedule?.date)} · {match.schedule?.start_time}</span>
                                <strong>{match.home_team?.name} vs {match.away_team?.name}</strong>
                            </div>
                        ))}
                    </section>
                ) : null}

                {activeTab === "schedule" ? (
                <section className="liga-section">
                    <div className="liga-section-head">
                        <div>
                            <h2>Jadwal</h2>
                            <p>Jadwal dibaca dari calendar dashboard yang sudah dihubungkan ke match liga.</p>
                        </div>
                    </div>
                    {!hasEvents && !loading ? (
                        <div className="liga-empty">
                            <CalendarDaysIcon className="size-5" />
                            <span>Belum ada jadwal match turnamen.</span>
                        </div>
                    ) : null}
                    <div className="liga-calendar">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            locale="id"
                            events={payload.events || []}
                            height="auto"
                            headerToolbar={{
                                left: "prev,next today",
                                center: "title",
                                right: "dayGridMonth,timeGridWeek",
                            }}
                            eventClick={(info) => setSelectedMatch(info.event.extendedProps?.match || null)}
                        />
                    </div>
                </section>
                ) : null}
            </section>

            <Dialog open={Boolean(selectedMatch)} onOpenChange={(open) => !open && setSelectedMatch(null)}>
                <DialogContent className="liga-event-dialog p-0">
                    <DialogHeader className="liga-event-dialog-head">
                        <DialogTitle>
                            {selectedTitle}
                        </DialogTitle>
                        <DialogDescription>Detail jadwal Liga Payo 17</DialogDescription>
                    </DialogHeader>
                    <div className="liga-event-dialog-body">
                        <div className="liga-event-line">
                            <CalendarDaysIcon className="size-4 text-muted-foreground" />
                            <span>{isoToIndoDate(selectedMatch?.schedule?.date)} · {selectedMatch?.schedule?.start_time} - {selectedMatch?.schedule?.end_time || "selesai"}</span>
                        </div>
                        <div className="liga-event-line">
                            <MapPinIcon className="size-4 text-muted-foreground" />
                            <span>{selectedMatch?.schedule?.location || "Lokasi belum diisi"}</span>
                        </div>
                        <div className="liga-event-result">
                            <span>Jenis</span>
                            <Badge variant={selectedIsInfo ? "secondary" : "outline"}>
                                {selectedIsInfo ? "Informasi" : "Pertandingan"}
                            </Badge>
                        </div>
                        {!selectedIsInfo ? (
                            <div className="liga-event-result">
                                <span>Hasil</span>
                                <Badge variant={selectedMatch?.status === "finished" ? "secondary" : "outline"}>
                                    {scoreLabel(selectedMatch)}
                                </Badge>
                            </div>
                        ) : null}
                        {!selectedIsInfo && selectedMatch?.winner_team ? (
                            <div className="liga-event-result">
                                <span>Pemenang</span>
                                <strong>{selectedMatch.winner_team.name}</strong>
                            </div>
                        ) : null}
                        {selectedMatch?.notes ? (
                            <div className="liga-event-note">
                                <span>{selectedIsInfo ? "Informasi" : "Catatan"}</span>
                                <p>{selectedMatch.notes}</p>
                            </div>
                        ) : null}
                    </div>
                    <DialogFooter className="liga-event-dialog-footer">
                        <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                            <XIcon data-icon="inline-start" />
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}

const root = document.getElementById("ligapayo17-root");

if (root) {
    createRoot(root).render(
        <React.StrictMode>
            <LigaPayo17App endpoint={root.dataset.endpoint} />
        </React.StrictMode>
    );
}
