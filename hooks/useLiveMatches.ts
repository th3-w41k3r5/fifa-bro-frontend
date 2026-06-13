import { useEffect } from "react";
import type { MatchSummary } from "@/types";

export type LiveMatch = {
    matchId: string | number;
    status?: string;
    minute?: number;
    period?: string;
    homeScore?: number;
    awayScore?: number;
};

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

        const updatedMatch = {
            ...match,
            status: "live",
            liveMinute: live.minute,
            livePeriod: live.period,
            homeScore: live.homeScore,
            awayScore: live.awayScore,
        };

        console.log("LIVE MATCH STATE UPDATE:", {
            id: updatedMatch.id,
            status: updatedMatch.status,
            liveMinute: updatedMatch.liveMinute,
            livePeriod: updatedMatch.livePeriod,
            homeScore: updatedMatch.homeScore,
            awayScore: updatedMatch.awayScore,
        });

        return updatedMatch;
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
    useEffect(() => {
        const ws = new WebSocket(
            "wss://fifa-live-worker.iitjeepritam.workers.dev/ws"
        );

        ws.onopen = () => {
            console.log("connected");
        };

        ws.onmessage = event => {
            const data = JSON.parse(event.data) as LiveUpdatePayload;

            console.log("WS DATA:", data);

            onUpdate(data);
        };

        ws.onclose = () => {
            console.log("closed");
        };

        return () => ws.close();
    }, []);
}
