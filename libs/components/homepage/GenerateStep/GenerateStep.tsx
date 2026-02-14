import React, { useState, useEffect, useRef } from "react";
import { createGeneration } from "../../../../server/user/generation";

interface GenerateStepProps {
    onEditNotes: () => void;
    onTryConcept: () => void;
    brandId: string;
    productId: string;
    conceptId: string;
    importantNotes: string;
}

const GRADIENTS = [
    "linear-gradient(135deg, #0d9488, #065f46)",
    "linear-gradient(135deg, #0891b2, #164e63)",
    "linear-gradient(135deg, #059669, #0d9488)",
    "linear-gradient(135deg, #7c3aed, #4338ca)",
    "linear-gradient(135deg, #2563eb, #7c3aed)",
    "linear-gradient(135deg, #06b6d4, #155e75)",
];

export default function GenerateStep({
    onEditNotes,
    onTryConcept,
    brandId,
    productId,
    conceptId,
    importantNotes,
}: GenerateStepProps) {
    const [completedCount, setCompletedCount] = useState(0);
    const [jobId, setJobId] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [apiLoading, setApiLoading] = useState(true);
    const totalVariations = 6;
    const isGenerating = completedCount < totalVariations;
    const hasStarted = useRef(false);

    // Call createGeneration API on mount
    useEffect(() => {
        if (hasStarted.current) return;
        hasStarted.current = true;
        startGeneration();
    }, []);

    const startGeneration = async () => {
        try {
            setApiLoading(true);
            setApiError(null);
            setCompletedCount(0);

            const result = await createGeneration({
                brand_id: brandId,
                product_id: productId,
                concept_id: conceptId,
                important_notes: importantNotes || undefined,
            });

            setJobId(result.job_id);
            setApiLoading(false);

            // Simulate progress (real polling will replace this)
            simulateProgress();
        } catch (err: any) {
            setApiError(err.message || "Generation failed");
            setApiLoading(false);
        }
    };

    const simulateProgress = () => {
        let count = 0;
        const tick = () => {
            count++;
            setCompletedCount(count);
            if (count < totalVariations) {
                setTimeout(tick, 1200 + Math.random() * 800);
            }
        };
        setTimeout(tick, 1500);
    };

    const handleRegenerateAll = () => {
        hasStarted.current = false;
        setJobId(null);
        startGeneration();
    };

    const handleRetry = () => {
        hasStarted.current = false;
        startGeneration();
    };

    const handleRedo = (index: number) => {
        // Placeholder for single redo
    };

    // API error state
    if (apiError) {
        return (
            <div className="generate-card">
                <div className="generate-card__error-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5" />
                        <path d="M12 8v5M12 16h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <h3 className="generate-card__error-title">Generation Failed</h3>
                    <p className="generate-card__error-message">{apiError}</p>
                    <div className="generate-card__error-actions">
                        <button className="generate-card__retry-btn" onClick={handleRetry} type="button">
                            Try Again
                        </button>
                        <button className="generate-card__back-link" onClick={onEditNotes} type="button">
                            ← Edit Notes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="generate-card">
            {/* Header */}
            <div className="generate-card__header">
                <div className="generate-card__header-left">
                    <h2 className="generate-card__title">
                        {apiLoading ? "Starting Generation..." : isGenerating ? "Generating Your Ads" : "Your Ad Variations"}
                    </h2>
                    <p className="generate-card__subtitle">
                        {apiLoading
                            ? "Sending request to AI pipeline..."
                            : isGenerating
                                ? `${completedCount} of ${totalVariations} variations complete`
                                : `${totalVariations} variations generated · 5 credits used`}
                    </p>
                    {jobId && (
                        <span className="generate-card__job-id">Job: {jobId.slice(0, 8)}...</span>
                    )}
                </div>
                {!isGenerating && !apiLoading && (
                    <button className="generate-card__regenerate-all" onClick={handleRegenerateAll}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Regenerate All (5 credits)
                    </button>
                )}
            </div>

            {/* Progress bar (generating only) */}
            {(isGenerating || apiLoading) && (
                <div className="generate-card__progress">
                    <div
                        className="generate-card__progress-fill"
                        style={{ width: apiLoading ? "5%" : `${(completedCount / totalVariations) * 100}%` }}
                    />
                </div>
            )}

            {/* Grid */}
            <div className="generate-card__grid">
                {Array.from({ length: totalVariations }).map((_, i) => {
                    const done = i < completedCount && !apiLoading;
                    return (
                        <div key={i} className={`generate-card__item${done ? " generate-card__item--done" : ""}`}>
                            <div
                                className="generate-card__item-preview"
                                style={{ background: GRADIENTS[i % GRADIENTS.length] }}
                            >
                                {done ? (
                                    <>
                                        <span className="generate-card__item-label">Variation {i + 1}</span>
                                        <span className="generate-card__item-tag">[AI Generated Ad]</span>
                                    </>
                                ) : (
                                    <span className="generate-card__item-loading">
                                        <span className="generate-card__item-spinner" />
                                        {apiLoading ? "Waiting..." : "Generating..."}
                                    </span>
                                )}
                            </div>
                            {done && (
                                <div className="generate-card__item-actions">
                                    <div className="generate-card__item-btns">
                                        <button className="generate-card__action-btn" type="button">
                                            Fix Errors
                                        </button>
                                        <button className="generate-card__action-btn" type="button" onClick={() => handleRedo(i)}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Redo
                                        </button>
                                        <button className="generate-card__action-btn" type="button">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            Download
                                        </button>
                                    </div>
                                    <button className="generate-card__save-btn" type="button">
                                        Save Ad
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer (complete only) */}
            {!isGenerating && !apiLoading && (
                <div className="generate-card__footer">
                    <span className="generate-card__footer-text">Not what you're looking for?</span>
                    <button className="generate-card__footer-link" onClick={onEditNotes} type="button">
                        Edit notes &amp; regenerate
                    </button>
                    <span className="generate-card__footer-text">or</span>
                    <button className="generate-card__footer-link" onClick={onTryConcept} type="button">
                        try a different concept
                    </button>
                </div>
            )}
        </div>
    );
}

