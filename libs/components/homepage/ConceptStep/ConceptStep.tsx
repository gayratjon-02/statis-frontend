import React, { useState, useEffect } from "react";
import { getConcepts } from "../../../../server/user/concept";
import { ConceptCategory } from "../../../../libs/types/concept.type";
import type { AdConcept } from "../../../../libs/types/concept.type";
import API_BASE_URL from "../../../../libs/config/api.config";

// ── Category tab options ──
const CATEGORY_TABS: { label: string; value: string }[] = [
    { label: "All", value: "" },
    { label: "Feature Callout", value: ConceptCategory.FEATURE_CALLOUT },
    { label: "Social Proof", value: ConceptCategory.SOCIAL_PROOF },
    { label: "Before & After", value: ConceptCategory.BEFORE_AFTER },
    { label: "Comparison", value: ConceptCategory.COMPARISON },
    { label: "Lifestyle", value: ConceptCategory.LIFESTYLE },
    { label: "Bold Offer", value: ConceptCategory.BOLD_OFFER },
    { label: "UGC Style", value: ConceptCategory.UGC_STYLE },
    { label: "Listicle", value: ConceptCategory.LISTICLE },
    { label: "Editorial", value: ConceptCategory.EDITORIAL },
    { label: "Minimalist", value: ConceptCategory.MINIMALIST },
];

// ── Category label helper ──
const categoryLabel = (cat: string): string => {
    const found = CATEGORY_TABS.find((t) => t.value === cat);
    return found?.label || cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

// ── Image URL helper ──
const resolveImageUrl = (url: string): string => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
};

interface ConceptStepProps {
    onBack: () => void;
    onNext: () => void;
    selectedConcept: AdConcept | null;
    onSelectConcept: (concept: AdConcept) => void;
}

export default function ConceptStep({ onBack, onNext, selectedConcept, onSelectConcept }: ConceptStepProps) {
    const [concepts, setConcepts] = useState<AdConcept[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // ── Fetch concepts ──
    useEffect(() => {
        loadConcepts();
    }, [activeCategory]);

    const loadConcepts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getConcepts(
                activeCategory || undefined,
                undefined,
                1,
                50
            );
            setConcepts(Array.isArray(data) ? data : (data?.list || []));
        } catch (err: any) {
            setError(err.message || "Failed to load concepts");
        } finally {
            setLoading(false);
        }
    };

    // ── Client-side search filter (by name/tags) ──
    const filtered = searchQuery.trim()
        ? concepts.filter((c) => {
            const q = searchQuery.toLowerCase();
            return (
                c.name.toLowerCase().includes(q) ||
                c.tags?.some((t) => t.toLowerCase().includes(q)) ||
                c.description?.toLowerCase().includes(q)
            );
        })
        : concepts;

    // ── Popular threshold (top 10% by usage_count) ──
    const maxUsage = concepts.length > 0 ? Math.max(...concepts.map((c) => c.usage_count || 0)) : 0;
    const popularThreshold = maxUsage * 0.6;

    return (
        <div className="concept-card">
            <div className="concept-card__header">
                <h2 className="concept-card__title">Choose Your Ad Concept</h2>
                <p className="concept-card__subtitle">Select a template style. The AI will generate your ad in this format.</p>
            </div>

            {/* Search */}
            <div className="concept-card__search">
                <svg className="concept-card__search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                    className="concept-card__search-input"
                    placeholder="Search concepts by name or tag..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Category filter tabs */}
            <div className="concept-card__filters">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab.value}
                        className={`concept-card__filter${activeCategory === tab.value ? " concept-card__filter--active" : ""}`}
                        onClick={() => setActiveCategory(tab.value)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Loading state */}
            {loading && (
                <div className="concept-card__loading">
                    <div className="concept-card__spinner" />
                    <span>Loading concepts...</span>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="concept-card__error">
                    <span>⚠️ {error}</span>
                    <button className="concept-card__retry-btn" onClick={loadConcepts}>Retry</button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && filtered.length === 0 && (
                <div className="concept-card__empty">
                    <div className="concept-card__empty-icon">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect x="4" y="4" width="32" height="32" rx="6" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="14" cy="14" r="3" fill="currentColor" opacity="0.5" />
                            <path d="M36 28l-10-10L8 36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="concept-card__empty-text">
                        {searchQuery ? "No concepts match your search" : "No concepts available"}
                    </p>
                    <p className="concept-card__empty-hint">
                        {searchQuery ? "Try a different keyword" : "Concepts will be added by admin"}
                    </p>
                </div>
            )}

            {/* Concept grid */}
            {!loading && !error && filtered.length > 0 && (
                <div className="concept-card__grid">
                    {filtered.map((concept) => (
                        <div
                            key={concept._id}
                            className={`concept-card__item${selectedConcept?._id === concept._id ? " concept-card__item--selected" : ""}`}
                            onClick={() => onSelectConcept(concept)}
                        >
                            <div className="concept-card__item-preview">
                                {concept.image_url ? (
                                    <img
                                        src={resolveImageUrl(concept.image_url)}
                                        alt={concept.name}
                                        className="concept-card__item-image"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="concept-card__item-placeholder">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                            <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                {(concept.usage_count || 0) > popularThreshold && popularThreshold > 0 && (
                                    <span className="concept-card__item-badge">POPULAR</span>
                                )}
                                {selectedConcept?._id === concept._id && (
                                    <div className="concept-card__item-check">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="concept-card__item-info">
                                <span className="concept-card__item-name">{concept.name}</span>
                                <div className="concept-card__item-meta">
                                    <span className="concept-card__item-category">{categoryLabel(concept.category)}</span>
                                    <span className="concept-card__item-uses">{concept.usage_count || 0} uses</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="concept-card__footer">
                <button
                    className="concept-card__back-btn"
                    onClick={onBack}
                    type="button"
                >
                    ← Back
                </button>
                <button
                    className={`concept-card__submit${!selectedConcept ? " concept-card__submit--disabled" : ""}`}
                    type="button"
                    disabled={!selectedConcept}
                    onClick={onNext}
                >
                    Next: Add Notes
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
