import React, { useState } from "react";

const CONCEPT_CATEGORIES = [
    "All",
    "Feature Pointers",
    "Testimonial",
    "Before & After",
    "Us vs Them",
    "Lifestyle",
    "Stat Callout",
    "Social Proof",
    "Offer / Promo",
    "Problem → Solution",
    "Comparison Chart",
    "Ingredient Spotlight",
];

const CONCEPTS = [
    { id: 1, name: "Feature Pointers", category: "Feature Pointers", uses: 315, popular: true, gradient: "linear-gradient(135deg, #0d9488, #065f46)" },
    { id: 2, name: "Testimonial", category: "Testimonial", uses: 71, popular: true, gradient: "linear-gradient(135deg, #7c3aed, #4338ca)" },
    { id: 3, name: "Before & After", category: "Before & After", uses: 94, popular: true, gradient: "linear-gradient(135deg, #059669, #0d9488)" },
    { id: 4, name: "Us vs Them", category: "Us vs Them", uses: 180, popular: true, gradient: "linear-gradient(135deg, #2563eb, #7c3aed)" },
    { id: 5, name: "Lifestyle", category: "Lifestyle", uses: 164, popular: false, gradient: "linear-gradient(135deg, #0891b2, #164e63)" },
    { id: 6, name: "Stat Callout", category: "Stat Callout", uses: 305, popular: false, gradient: "linear-gradient(135deg, #6366f1, #4338ca)" },
    { id: 7, name: "Social Proof", category: "Social Proof", uses: 506, popular: false, gradient: "linear-gradient(135deg, #059669, #065f46)" },
    { id: 8, name: "Offer / Promo", category: "Offer / Promo", uses: 425, popular: false, gradient: "linear-gradient(135deg, #dc2626, #9f1239)" },
    { id: 9, name: "Problem → Solution", category: "Problem → Solution", uses: 463, popular: false, gradient: "linear-gradient(135deg, #d97706, #92400e)" },
    { id: 10, name: "Comparison Chart", category: "Comparison Chart", uses: 312, popular: false, gradient: "linear-gradient(135deg, #0284c7, #1e3a5f)" },
    { id: 11, name: "Ingredient Spotlight", category: "Ingredient Spotlight", uses: 267, popular: false, gradient: "linear-gradient(135deg, #16a34a, #166534)" },
    { id: 12, name: "Feature Pointers", category: "Feature Pointers", uses: 198, popular: false, gradient: "linear-gradient(135deg, #ea580c, #9a3412)" },
    { id: 13, name: "Testimonial", category: "Testimonial", uses: 442, popular: false, gradient: "linear-gradient(135deg, #8b5cf6, #6d28d9)" },
    { id: 14, name: "Before & After", category: "Before & After", uses: 82, popular: false, gradient: "linear-gradient(135deg, #14b8a6, #0f766e)" },
    { id: 15, name: "Us vs Them", category: "Us vs Them", uses: 235, popular: false, gradient: "linear-gradient(135deg, #3b82f6, #1e40af)" },
    { id: 16, name: "Lifestyle", category: "Lifestyle", uses: 346, popular: false, gradient: "linear-gradient(135deg, #06b6d4, #155e75)" },
    { id: 17, name: "Stat Callout", category: "Stat Callout", uses: 418, popular: false, gradient: "linear-gradient(135deg, #a855f7, #7e22ce)" },
    { id: 18, name: "Social Proof", category: "Social Proof", uses: 465, popular: false, gradient: "linear-gradient(135deg, #22c55e, #15803d)" },
    { id: 19, name: "Offer / Promo", category: "Offer / Promo", uses: 93, popular: false, gradient: "linear-gradient(135deg, #f43f5e, #be123c)" },
    { id: 20, name: "Problem → Solution", category: "Problem → Solution", uses: 301, popular: false, gradient: "linear-gradient(135deg, #f59e0b, #b45309)" },
    { id: 21, name: "Comparison Chart", category: "Comparison Chart", uses: 177, popular: false, gradient: "linear-gradient(135deg, #0ea5e9, #0369a1)" },
    { id: 22, name: "Ingredient Spotlight", category: "Ingredient Spotlight", uses: 121, popular: false, gradient: "linear-gradient(135deg, #34d399, #047857)" },
    { id: 23, name: "Feature Pointers", category: "Feature Pointers", uses: 87, popular: false, gradient: "linear-gradient(135deg, #f97316, #c2410c)" },
    { id: 24, name: "Testimonial", category: "Testimonial", uses: 301, popular: false, gradient: "linear-gradient(135deg, #c084fc, #9333ea)" },
];

interface ConceptStepProps {
    onBack: () => void;
    onNext: () => void;
    selectedConcept: number | null;
    onSelectConcept: (id: number) => void;
}

export default function ConceptStep({ onBack, onNext, selectedConcept, onSelectConcept }: ConceptStepProps) {
    const [conceptFilter, setConceptFilter] = useState("All");

    const filteredConcepts = conceptFilter === "All"
        ? CONCEPTS
        : CONCEPTS.filter((c) => c.category === conceptFilter);

    return (
        <div className="concept-card">
            <div className="concept-card__header">
                <h2 className="concept-card__title">Choose Your Ad Concept</h2>
                <p className="concept-card__subtitle">Select a template style. The AI will generate your ad in this format.</p>
            </div>

            {/* Filter tags */}
            <div className="concept-card__filters">
                {CONCEPT_CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        className={`concept-card__filter${conceptFilter === cat ? " concept-card__filter--active" : ""}`}
                        onClick={() => setConceptFilter(cat)}
                        type="button"
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Concept grid */}
            <div className="concept-card__grid">
                {filteredConcepts.map((concept) => (
                    <div
                        key={concept.id}
                        className={`concept-card__item${selectedConcept === concept.id ? " concept-card__item--selected" : ""}`}
                        onClick={() => onSelectConcept(concept.id)}
                    >
                        <div className="concept-card__item-preview" style={{ background: concept.gradient }}>
                            {concept.popular && <span className="concept-card__item-badge">POPULAR</span>}
                            <div className="concept-card__item-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            {selectedConcept === concept.id && (
                                <div className="concept-card__item-check">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <div className="concept-card__item-info">
                            <span className="concept-card__item-name">{concept.name}</span>
                            <span className="concept-card__item-uses">{concept.uses} uses</span>
                        </div>
                    </div>
                ))}
            </div>

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
