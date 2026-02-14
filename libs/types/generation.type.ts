// =============================================
// TYPES — Generation
// =============================================

export enum GenerationStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
}

/** POST /generation/createGeneration request body */
export interface CreateGenerationInput {
    brand_id: string;
    product_id: string;
    concept_id: string;
    important_notes?: string;
}

/** POST /generation/createGeneration response */
export interface GenerationResponse {
    job_id: string;
    status: GenerationStatus;
    message: string;
}

/** Full generated ad record (from DB) */
export interface GeneratedAd {
    _id: string;
    user_id: string;
    brand_id: string;
    product_id: string;
    concept_id: string;
    folder_id: string | null;

    important_notes: string;

    claude_response_json: any;
    gemini_prompt: string;

    image_url_1x1: string;
    image_url_9x16: string;
    image_url_16x9: string;

    ad_copy_json: {
        headline: string;
        subheadline: string;
        body_text: string;
        callout_texts: string[];
        cta_text: string;
    };

    generation_status: GenerationStatus;

    ad_name: string;
    is_saved: boolean;
    is_favorite: boolean;

    created_at: string;
}
