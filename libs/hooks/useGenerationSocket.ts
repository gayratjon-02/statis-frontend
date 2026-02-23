// =============================================
// useGenerationSocket — Real-time generation progress via Socket.io
// =============================================

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import API_BASE_URL from "../config/api.config";

interface VariationProgress {
    percent: number;
    step: string;
    message: string;
}

export interface UseGenerationSocketReturn {
    /** Average progress across all tracked variations (0-100) */
    overallPercent: number;
    /** Per-variation progress map: job_id → { percent, step, message } */
    variationProgress: Map<string, VariationProgress>;
    /** IDs of completed variations */
    completedIds: Set<string>;
    /** IDs of failed variations */
    failedIds: Set<string>;
    /** Latest step message from any variation */
    latestMessage: string;
    /** Reset all state (call when generation ends) */
    reset: () => void;
}

/**
 * Connects to the backend Socket.io server and listens for
 * generation:progress, generation:completed, generation:failed events.
 *
 * @param userId  - Current user's _id (for event channel)
 * @param enabled - Whether to connect (true during active generation)
 */
export function useGenerationSocket(
    userId: string | null,
    enabled: boolean,
): UseGenerationSocketReturn {
    const socketRef = useRef<Socket | null>(null);
    const [variationProgress, setVariationProgress] = useState<Map<string, VariationProgress>>(new Map());
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
    const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
    const [latestMessage, setLatestMessage] = useState("Generating your ads...");

    const reset = () => {
        setVariationProgress(new Map());
        setCompletedIds(new Set());
        setFailedIds(new Set());
        setLatestMessage("Generating your ads...");
    };

    useEffect(() => {
        if (!enabled || !userId) return;

        const socket = io(API_BASE_URL, {
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
        });
        socketRef.current = socket;

        // Progress updates per variation
        socket.on(`generation:progress:${userId}`, (data: {
            job_id: string;
            step: string;
            message: string;
            progress_percent: number;
        }) => {
            setVariationProgress((prev) => {
                const next = new Map(prev);
                next.set(data.job_id, {
                    percent: data.progress_percent,
                    step: data.step,
                    message: data.message,
                });
                return next;
            });
            setLatestMessage(data.message);
        });

        // Variation completed
        socket.on(`generation:completed:${userId}`, (data: {
            job_id: string;
            ad_id: string;
            image_url: string;
        }) => {
            setCompletedIds((prev) => new Set(prev).add(data.job_id));
            setVariationProgress((prev) => {
                const next = new Map(prev);
                next.set(data.job_id, { percent: 100, step: "completed", message: "Done" });
                return next;
            });
        });

        // Variation failed
        socket.on(`generation:failed:${userId}`, (data: {
            job_id: string;
            error: string;
        }) => {
            setFailedIds((prev) => new Set(prev).add(data.job_id));
            setVariationProgress((prev) => {
                const next = new Map(prev);
                next.set(data.job_id, { percent: 100, step: "failed", message: data.error });
                return next;
            });
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [userId, enabled]);

    // Overall = average of all known variations (0 for unknown ones)
    const entries = Array.from(variationProgress.values());
    const overallPercent = entries.length > 0
        ? Math.round(entries.reduce((sum, v) => sum + v.percent, 0) / 6) // always divide by 6 (total variations)
        : 0;

    return { overallPercent, variationProgress, completedIds, failedIds, latestMessage, reset };
}
