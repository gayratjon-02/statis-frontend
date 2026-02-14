// =============================================
// TYPES — Ad Concept
// =============================================

export enum ConceptCategory {
    SOCIAL_PROOF = "social_proof",
    BEFORE_AFTER = "before_after",
    FEATURE_CALLOUT = "feature_callout",
    LISTICLE = "listicle",
    COMPARISON = "comparison",
    UGC_STYLE = "ugc_style",
    EDITORIAL = "editorial",
    BOLD_OFFER = "bold_offer",
    MINIMALIST = "minimalist",
    LIFESTYLE = "lifestyle",
}

export interface AdConcept {
    _id: string;

    // Content
    category: ConceptCategory;
    name: string;
    image_url: string;
    tags: string[];
    description: string;

    // Meta
    source_url: string;
    usage_count: number;
    is_active: boolean;
    display_order: number;

    // Timestamps
    created_at: string;
    updated_at: string;
}
