// =============================================
// SERVER — Brand Config API
// =============================================

import API_BASE_URL from "../../libs/config/api.config";

export interface IndustryItem {
    id: string;
    label: string;
}

export interface VoiceItem {
    id: string;
    label: string;
}

export interface BrandConfig {
    industries: IndustryItem[];
    voices: VoiceItem[];
}

/**
 * GET /brand/config
 * Fetch industry & voice config lists for dropdowns.
 * No auth required.
 */
export async function getBrandConfig(): Promise<BrandConfig> {
    const res = await fetch(`${API_BASE_URL}/brand/config`);

    if (!res.ok) {
        throw new Error("Failed to fetch brand config");
    }

    return res.json();
}

export interface CreditCosts {
    credits_per_generation: number;
    credits_per_fix_errors: number;
    credits_per_regenerate_single: number;
}

const DEFAULT_CREDIT_COSTS: CreditCosts = {
    credits_per_generation: 5,
    credits_per_fix_errors: 2,
    credits_per_regenerate_single: 2,
};

/**
 * GET /system-config
 * Fetch public credit cost config. No auth required.
 */
export async function getCreditCosts(): Promise<CreditCosts> {
    try {
        const res = await fetch(`${API_BASE_URL}/system-config`);
        if (!res.ok) return DEFAULT_CREDIT_COSTS;
        const data = await res.json();
        return {
            credits_per_generation: Number(data.credits_per_generation) || DEFAULT_CREDIT_COSTS.credits_per_generation,
            credits_per_fix_errors: Number(data.credits_per_fix_errors) || DEFAULT_CREDIT_COSTS.credits_per_fix_errors,
            credits_per_regenerate_single: Number(data.credits_per_regenerate_single) || DEFAULT_CREDIT_COSTS.credits_per_regenerate_single,
        };
    } catch {
        return DEFAULT_CREDIT_COSTS;
    }
}
