import React, { useState, useEffect } from "react";
import type { Brand } from "../../../types/brand.type";
import { getBrands } from "../../../../server/user/brand";

interface BrandStepProps {
    selectedBrand: string | null;
    onBrandSelect: (brandId: string) => void;
    onCreateNew: () => void;
    refreshTrigger?: number;
}

export default function BrandStep({ selectedBrand, onBrandSelect, onCreateNew, refreshTrigger }: BrandStepProps) {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadBrands();
    }, [refreshTrigger]);

    const loadBrands = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getBrands(1, 50);
            setBrands(Array.isArray(data) ? data : (data?.list || []));
        } catch (err: any) {
            setError(err.message || "Failed to load brands");
        } finally {
            setLoading(false);
        }
    };

    // Refresh list when coming back (e.g. after creating a new brand)
    const handleCreateNew = () => {
        onCreateNew();
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const formatIndustry = (industry: string) => {
        return industry.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="brand-card">
            <div className="brand-card__header">
                <h2 className="brand-card__title">Select a Brand</h2>
                <span className="brand-card__count">
                    {loading ? "..." : `${brands.length} brand${brands.length !== 1 ? "s" : ""}`}
                </span>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="brand-card__loading">
                    <div className="brand-card__spinner" />
                    <span>Loading brands...</span>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="brand-card__error">
                    <span>⚠️ {error}</span>
                    <button className="brand-card__retry-btn" onClick={loadBrands}>
                        Retry
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && brands.length === 0 && (
                <div className="brand-card__empty">
                    <div className="brand-card__empty-icon">
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect x="4" y="8" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M4 16h32" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="12" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M20 22h10M20 26h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                    </div>
                    <p className="brand-card__empty-text">No brands yet</p>
                    <p className="brand-card__empty-hint">Create your first brand to get started</p>
                </div>
            )}

            {/* Brand list */}
            {!loading && !error && brands.length > 0 && (
                <div className="brand-card__list">
                    {brands.map((brand) => (
                        <div
                            className={`brand-card__item${selectedBrand === brand._id ? " brand-card__item--selected" : ""}`}
                            key={brand._id}
                            onClick={() => onBrandSelect(brand._id)}
                        >
                            {/* Left: color accent + icon */}
                            <div
                                className="brand-card__item-icon"
                                style={{
                                    backgroundColor: brand.primary_color ? `${brand.primary_color}20` : undefined,
                                    color: brand.primary_color || undefined,
                                }}
                            >
                                {brand.logo_url ? (
                                    <img src={brand.logo_url} alt={brand.name} className="brand-card__item-logo" />
                                ) : (
                                    brand.name.charAt(0).toUpperCase()
                                )}
                            </div>

                            {/* Center: name + meta */}
                            <div className="brand-card__item-info">
                                <span className="brand-card__item-name">{brand.name}</span>
                                <div className="brand-card__item-meta">
                                    <span className="brand-card__item-industry">
                                        {formatIndustry(brand.industry)}
                                    </span>
                                    <span className="brand-card__item-date">
                                        {formatDate(brand.created_at)}
                                    </span>
                                </div>
                            </div>

                            {/* Right: color palette dots */}
                            <div className="brand-card__item-colors">
                                {brand.primary_color && (
                                    <span
                                        className="brand-card__color-dot"
                                        style={{ backgroundColor: brand.primary_color }}
                                        title={`Primary: ${brand.primary_color}`}
                                    />
                                )}
                                {brand.secondary_color && (
                                    <span
                                        className="brand-card__color-dot"
                                        style={{ backgroundColor: brand.secondary_color }}
                                        title={`Secondary: ${brand.secondary_color}`}
                                    />
                                )}
                                {brand.accent_color && (
                                    <span
                                        className="brand-card__color-dot"
                                        style={{ backgroundColor: brand.accent_color }}
                                        title={`Accent: ${brand.accent_color}`}
                                    />
                                )}
                            </div>

                            {/* Selection checkmark */}
                            {selectedBrand === brand._id && (
                                <div className="brand-card__item-check">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="brand-card__divider" />
            <div className="brand-card__create">
                <button className="brand-card__create-btn" onClick={handleCreateNew}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>Create New Brand</span>
                </button>
            </div>
        </div>
    );
}
