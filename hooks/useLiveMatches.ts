import { useEffect, useRef } from "react";
import type { FifaMatchDetail, MatchSummary, MatchGoalScorers } from "@/types";

export type LiveMatch = {
    matchId: string | number;
    status?: string;
    minute?: number;
    period?: string;
    homeScore?: number;
    awayScore?: number;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
    goalScorers?: MatchGoalScorers;
    fifaDetail?: FifaMatchDetail | Record<string, unknown> | null;
};

function sanitizeLiveGoalScorers(
    goalScorers: MatchGoalScorers,
    homeScore?: number,
    awayScore?: number
): MatchGoalScorers {
    const home = homeScore ?? 0;
    const away = awayScore ?? 0;

    return {
        home: home > 0 ? goalScorers.home ?? [] : [],
        away: away > 0 ? goalScorers.away ?? [] : [],
    };
}

export type LiveUpdatePayload = {
    type: string;
    matches?: LiveMatch[];
    [key: string]: unknown;
};

export function applyLiveUpdateToMatches(
    matches: MatchSummary[],
    data: LiveUpdatePayload
): MatchSummary[] {
    if (data.type !== "live_update" || !Array.isArray(data.matches)) {
        return matches;
    }

    return matches.map(match => {
        const live = data.matches?.find(
            liveMatch => String(liveMatch.matchId) === String(match.id)
        );

        if (!live) return match;

        const goalScorers = sanitizeLiveGoalScorers(
            live.goalScorers ?? { home: [], away: [] },
            live.homeScore,
            live.awayScore
        );

        return {
            ...match,
            status: "live",
            liveMinute: live.minute,
            livePeriod: live.period,
            homeScore: live.homeScore,
            awayScore: live.awayScore,
            homePenaltyScore: live.homePenaltyScore,
            awayPenaltyScore: live.awayPenaltyScore,
            goalScorers,
            ...(live.fifaDetail != null
                ? { fifaDetail: live.fifaDetail as FifaMatchDetail }
                : {}),
        };
    });
}

export function applyLiveUpdateToMatch(
    match: MatchSummary,
    data: LiveUpdatePayload
): MatchSummary {
    return applyLiveUpdateToMatches([match], data)[0] ?? match;
}

export function useLiveMatches(
    onUpdate: (data: LiveUpdatePayload) => void
) {
    const onUpdateRef = useRef(onUpdate);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
        let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
        let reconnectAttempt = 0;
        let closedByReact = false;

        const clearTimers = () => {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            reconnectTimer = null;
            heartbeatTimer = null;
        };

        const connect = () => {
            ws = new WebSocket(
                "wss://fifa-live-worker.iitjeepritam.workers.dev/ws"
            );

            ws.onopen = () => {
                reconnectAttempt = 0;

                heartbeatTimer = setInterval(() => {
                    if (ws?.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({ type: "ping" }));
                    }
                }, 10000);
            };

            ws.onmessage = event => {
                const data = JSON.parse(event.data) as LiveUpdatePayload;
                onUpdateRef.current(data);
            };

            ws.onerror = event => {
                console.error("WebSocket error:", event);
            };

            ws.onclose = () => {
                if (heartbeatTimer) clearInterval(heartbeatTimer);
                heartbeatTimer = null;

                if (closedByReact) return;

                const delay = Math.min(1000 * 2 ** reconnectAttempt, 15000);
                reconnectAttempt += 1;

                reconnectTimer = setTimeout(connect, delay);
            };
        };

        connect();

        return () => {
            closedByReact = true;
            clearTimers();
            ws?.close();
        };
    }, []);
}
