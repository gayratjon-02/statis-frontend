import React, { useState } from "react";

interface NotesStepProps {
    onBack: () => void;
    onGenerate: (notes: string) => void;
    brandName: string;
    productName: string;
    conceptName: string;
}

export default function NotesStep({
    onBack,
    onGenerate,
    brandName,
    productName,
    conceptName,
}: NotesStepProps) {
    const [notes, setNotes] = useState("");

    const handleGenerate = () => {
        onGenerate(notes.trim());
    };

    return (
        <div className="notes-card">
            <div className="notes-card__header">
                <h2 className="notes-card__title">Important Notes</h2>
                <p className="notes-card__subtitle">
                    Any special instructions for the AI? This is optional but helps fine-tune your results.
                </p>
            </div>

            {/* Textarea */}
            <div className="notes-card__field">
                <textarea
                    className="notes-card__textarea"
                    placeholder={`Examples:\n• "Make sure the ad mentions the color blue"\n• "Use a dark, moody background"\n• "Target audience is men 30-50 who play golf"\n• "Ad should feel premium and luxurious"`}
                    value={notes}
                    onChange={(e) => {
                        if (e.target.value.length <= 500) setNotes(e.target.value);
                    }}
                    rows={6}
                />
                <span className="notes-card__char-count">{notes.length}/500</span>
            </div>

            {/* Generation Summary */}
            <div className="notes-card__summary">
                <h3 className="notes-card__summary-title">GENERATION SUMMARY</h3>
                <div className="notes-card__summary-grid">
                    <div className="notes-card__summary-item">
                        <span className="notes-card__summary-label">Brand</span>
                        <span className="notes-card__summary-value">{brandName || "Not set"}</span>
                    </div>
                    <div className="notes-card__summary-item">
                        <span className="notes-card__summary-label">Product</span>
                        <span className="notes-card__summary-value">{productName || "Not set"}</span>
                    </div>
                    <div className="notes-card__summary-item">
                        <span className="notes-card__summary-label">Concept</span>
                        <span className="notes-card__summary-value">{conceptName || "Not set"}</span>
                    </div>
                    <div className="notes-card__summary-item">
                        <span className="notes-card__summary-label">Credit Cost</span>
                        <span className="notes-card__summary-value">5 credits (6 variations)</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="notes-card__footer">
                <button className="notes-card__back-btn" onClick={onBack} type="button">
                    ← Back
                </button>
                <button className="notes-card__generate-btn" onClick={handleGenerate} type="button">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" />
                    </svg>
                    Generate Ads
                </button>
            </div>
        </div>
    );
}
