import React, { useState, useRef } from "react";
import { createBrand, uploadBrandLogo } from "../../../../server/user/brand";
import { BrandIndustry, BrandVoice } from "../../../types/brand.type";
import type { Brand, CreateBrandInput } from "../../../types/brand.type";

// ── Industry options: label → enum ──
const INDUSTRIES: { label: string; value: BrandIndustry }[] = [
    { label: "E-Commerce", value: BrandIndustry.ECOMMERCE },
    { label: "Supplements", value: BrandIndustry.SUPPLEMENTS },
    { label: "Fashion & Apparel", value: BrandIndustry.APPAREL },
    { label: "Beauty & Cosmetics", value: BrandIndustry.BEAUTY },
    { label: "Food & Beverage", value: BrandIndustry.FOOD_BEVERAGE },
    { label: "SaaS / Technology", value: BrandIndustry.SAAS },
    { label: "Sports & Fitness", value: BrandIndustry.FITNESS },
    { label: "Home & Living", value: BrandIndustry.HOME_GOODS },
    { label: "Pets", value: BrandIndustry.PETS },
    { label: "Financial Services", value: BrandIndustry.FINANCIAL_SERVICES },
    { label: "Education", value: BrandIndustry.EDUCATION },
    { label: "Other", value: BrandIndustry.OTHER },
];

// ── Voice tag options: label → enum ──
const VOICE_TAGS: { label: string; value: BrandVoice }[] = [
    { label: "Professional", value: BrandVoice.PROFESSIONAL },
    { label: "Playful", value: BrandVoice.PLAYFUL },
    { label: "Bold", value: BrandVoice.BOLD },
    { label: "Minimalist", value: BrandVoice.MINIMALIST },
    { label: "Luxurious", value: BrandVoice.LUXURIOUS },
    { label: "Friendly", value: BrandVoice.FRIENDLY },
    { label: "Edgy", value: BrandVoice.EDGY },
    { label: "Trustworthy", value: BrandVoice.TRUSTWORTHY },
    { label: "Youthful", value: BrandVoice.YOUTHFUL },
    { label: "Authoritative", value: BrandVoice.AUTHORITATIVE },
];

interface CreateBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBrandCreated?: (brand: Brand) => void;
}

export default function CreateBrandModal({ isOpen, onClose, onBrandCreated }: CreateBrandModalProps) {
    // ── Form state ──
    const [brandName, setBrandName] = useState("");
    const [industry, setIndustry] = useState<BrandIndustry | "">("");
    const [description, setDescription] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#3ECFCF");
    const [secondaryColor, setSecondaryColor] = useState("#3B82F6");
    const [accentColor, setAccentColor] = useState("#E94560");
    const [backgroundColor, setBackgroundColor] = useState("#0F172A");
    const [selectedTags, setSelectedTags] = useState<BrandVoice[]>([]);
    const [targetAudience, setTargetAudience] = useState("");
    const [competitors, setCompetitors] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);

    // ── UI state ──
    const [dragOver, setDragOver] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Helpers ──
    const toggleTag = (tagValue: BrandVoice) => {
        setSelectedTags((prev) =>
            prev.includes(tagValue) ? prev.filter((t) => t !== tagValue) : [...prev, tagValue]
        );
    };

    const processFile = async (file: File) => {
        // Validate file type
        const allowed = /\.(png|jpg|jpeg|webp)$/i;
        if (!allowed.test(file.name)) {
            setLogoError("Only PNG, JPG, JPEG, WEBP files are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setLogoError("File size must be under 5MB");
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setLogoError(null);
        setLogoUploading(true);

        try {
            const result = await uploadBrandLogo(file);
            setLogoUrl(result.logo_url);
        } catch (err: any) {
            setLogoError(err.message || "Failed to upload logo");
            setLogoFile(null);
            setLogoPreview(null);
            setLogoUrl(null);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    };

    const getIndustryLabel = (value: BrandIndustry | ""): string => {
        if (!value) return "";
        return INDUSTRIES.find((i) => i.value === value)?.label || "";
    };

    // ── Validation ──
    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (!brandName.trim()) errors.brandName = "Brand name is required";
        else if (brandName.length > 100) errors.brandName = "Max 100 characters";

        if (!industry) errors.industry = "Industry is required";

        if (!description.trim()) errors.description = "Description is required";
        else if (description.length > 500) errors.description = "Max 500 characters";

        if (!websiteUrl.trim()) errors.websiteUrl = "Website URL is required";
        else if (!/^https?:\/\/.+\..+/.test(websiteUrl)) errors.websiteUrl = "Enter a valid URL (https://...)";

        if (!primaryColor || !/^#[0-9A-Fa-f]{6}$/.test(primaryColor)) errors.primaryColor = "Valid hex color required";
        if (!secondaryColor || !/^#[0-9A-Fa-f]{6}$/.test(secondaryColor)) errors.secondaryColor = "Valid hex color required";

        if (selectedTags.length === 0) errors.voiceTags = "Select at least one voice tag";

        if (!targetAudience.trim()) errors.targetAudience = "Target audience is required";
        else if (targetAudience.length > 300) errors.targetAudience = "Max 300 characters";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setError(null);

        try {
            const input: CreateBrandInput = {
                name: brandName.trim(),
                description: description.trim(),
                website_url: websiteUrl.trim(),
                industry: industry as BrandIndustry,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
                accent_color: accentColor || undefined,
                background_color: backgroundColor || undefined,
                voice_tags: selectedTags,
                target_audience: targetAudience.trim(),
                competitors: competitors.trim() || undefined,
                logo_url: logoUrl || undefined,
            };

            const newBrand = await createBrand(input);

            // Reset form
            setBrandName("");
            setIndustry("");
            setDescription("");
            setWebsiteUrl("");
            setPrimaryColor("#3ECFCF");
            setSecondaryColor("#3B82F6");
            setAccentColor("#E94560");
            setBackgroundColor("#0F172A");
            setSelectedTags([]);
            setTargetAudience("");
            setCompetitors("");
            setLogoFile(null);
            setLogoPreview(null);
            setLogoUrl(null);
            setLogoError(null);
            setFieldErrors({});

            onBrandCreated?.(newBrand);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create brand. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button className="modal__close" onClick={onClose} disabled={submitting}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Header */}
                <div className="modal__header">
                    <h2 className="modal__title">Create Brand Profile</h2>
                    <p className="modal__subtitle">
                        Your brand details power the AI to create on-brand ads.
                    </p>
                </div>

                {/* Global error */}
                {error && (
                    <div className="modal__error">
                        <span>⚠️ {error}</span>
                        <button className="modal__error-dismiss" onClick={() => setError(null)}>✕</button>
                    </div>
                )}

                {/* Scrollable content */}
                <div className="modal__body">
                    {/* ─── Section 01: Brand Identity ─── */}
                    <div className="modal__section">
                        <div className="modal__section-header">
                            <span className="modal__section-num">01</span>
                            <span className="modal__section-title">Brand Identity</span>
                        </div>

                        <div className="modal__row">
                            <div className="modal__field modal__field--half">
                                <label className="modal__label">
                                    Brand Name <span className="modal__required">*</span>
                                </label>
                                <input
                                    className={`modal__input${fieldErrors.brandName ? " modal__input--error" : ""}`}
                                    type="text"
                                    placeholder="e.g. Bron"
                                    value={brandName}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 100) setBrandName(e.target.value);
                                    }}
                                    maxLength={100}
                                />
                                {fieldErrors.brandName && <span className="modal__field-error">{fieldErrors.brandName}</span>}
                            </div>
                            <div className="modal__field modal__field--half">
                                <label className="modal__label">
                                    Industry <span className="modal__required">*</span>
                                </label>
                                <div className="modal__select-wrap">
                                    <button
                                        className={`modal__select${fieldErrors.industry ? " modal__input--error" : ""}`}
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    >
                                        <span className={industry ? "" : "modal__select-placeholder"}>
                                            {getIndustryLabel(industry) || "Select industry"}
                                        </span>
                                        <svg
                                            className={`modal__select-arrow${showDropdown ? " modal__select-arrow--open" : ""}`}
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                    {showDropdown && (
                                        <div className="modal__dropdown">
                                            {INDUSTRIES.map((ind) => (
                                                <div
                                                    key={ind.value}
                                                    className={`modal__dropdown-item${industry === ind.value ? " modal__dropdown-item--active" : ""}`}
                                                    onClick={() => {
                                                        setIndustry(ind.value);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {ind.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {fieldErrors.industry && <span className="modal__field-error">{fieldErrors.industry}</span>}
                            </div>
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Brand Description <span className="modal__required">*</span>
                            </label>
                            <textarea
                                className={`modal__textarea${fieldErrors.description ? " modal__input--error" : ""}`}
                                placeholder="What does your brand do? Who does it serve?"
                                value={description}
                                onChange={(e) => {
                                    if (e.target.value.length <= 500) setDescription(e.target.value);
                                }}
                                rows={3}
                            />
                            <span className="modal__char-count">
                                {description.length}/500
                            </span>
                            {fieldErrors.description && <span className="modal__field-error">{fieldErrors.description}</span>}
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Website URL <span className="modal__required">*</span>
                            </label>
                            <input
                                className={`modal__input${fieldErrors.websiteUrl ? " modal__input--error" : ""}`}
                                type="url"
                                placeholder="https://yourbrand.com"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                            />
                            {fieldErrors.websiteUrl && <span className="modal__field-error">{fieldErrors.websiteUrl}</span>}
                        </div>
                    </div>

                    {/* ─── Section 02: Brand Visuals ─── */}
                    <div className="modal__section">
                        <div className="modal__section-header">
                            <span className="modal__section-num">02</span>
                            <span className="modal__section-title">Brand Visuals</span>
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Logo (PNG) <span className="modal__optional-tag">optional</span>
                            </label>
                            <div
                                className={`modal__upload${dragOver ? " modal__upload--drag" : ""}${logoPreview ? " modal__upload--has-file" : ""}`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".png,.jpg,.jpeg,.webp"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                {logoUploading ? (
                                    <>
                                        <div className="modal__upload-spinner" />
                                        <span className="modal__upload-text">Uploading...</span>
                                    </>
                                ) : logoPreview ? (
                                    <>
                                        <img
                                            src={logoPreview}
                                            alt="Brand logo preview"
                                            className="modal__upload-preview"
                                        />
                                        <span className="modal__upload-filename">{logoFile?.name}</span>
                                        <span className="modal__upload-change">Click to change</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="modal__upload-icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69788C14.6621 4.48016 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="modal__upload-text">
                                            Drag & drop or click to upload logo
                                        </span>
                                        <span className="modal__upload-hint">
                                            PNG, JPG, WEBP · Transparent bg preferred · Max 5MB
                                        </span>
                                    </>
                                )}
                            </div>
                            {logoError && <span className="modal__field-error">{logoError}</span>}
                        </div>

                        <div className="modal__colors">
                            <div className="modal__color-field">
                                <label className="modal__label">
                                    Primary Color <span className="modal__required">*</span>
                                </label>
                                <div className="modal__color-input">
                                    <div className="modal__color-swatch-wrap">
                                        <input
                                            type="color"
                                            className="modal__color-picker"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                        />
                                        <div
                                            className="modal__color-swatch"
                                            style={{ backgroundColor: primaryColor }}
                                        />
                                    </div>
                                    <input
                                        className="modal__color-hex"
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal__color-field">
                                <label className="modal__label">
                                    Secondary Color <span className="modal__required">*</span>
                                </label>
                                <div className="modal__color-input">
                                    <div className="modal__color-swatch-wrap">
                                        <input
                                            type="color"
                                            className="modal__color-picker"
                                            value={secondaryColor}
                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                        />
                                        <div
                                            className="modal__color-swatch"
                                            style={{ backgroundColor: secondaryColor }}
                                        />
                                    </div>
                                    <input
                                        className="modal__color-hex"
                                        type="text"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal__color-field">
                                <label className="modal__label">Accent Color</label>
                                <div className="modal__color-input">
                                    <div className="modal__color-swatch-wrap">
                                        <input
                                            type="color"
                                            className="modal__color-picker"
                                            value={accentColor}
                                            onChange={(e) => setAccentColor(e.target.value)}
                                        />
                                        <div
                                            className="modal__color-swatch"
                                            style={{ backgroundColor: accentColor }}
                                        />
                                    </div>
                                    <input
                                        className="modal__color-hex"
                                        type="text"
                                        value={accentColor}
                                        onChange={(e) => setAccentColor(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal__color-field">
                                <label className="modal__label">Background Color</label>
                                <div className="modal__color-input">
                                    <div className="modal__color-swatch-wrap">
                                        <input
                                            type="color"
                                            className="modal__color-picker"
                                            value={backgroundColor}
                                            onChange={(e) => setBackgroundColor(e.target.value)}
                                        />
                                        <div
                                            className="modal__color-swatch"
                                            style={{ backgroundColor: backgroundColor }}
                                        />
                                    </div>
                                    <input
                                        className="modal__color-hex"
                                        type="text"
                                        value={backgroundColor}
                                        onChange={(e) => setBackgroundColor(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Section 03: Brand Voice ─── */}
                    <div className="modal__section">
                        <div className="modal__section-header">
                            <span className="modal__section-num">03</span>
                            <span className="modal__section-title">Brand Voice</span>
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Voice &amp; Tone <span className="modal__required">*</span>
                            </label>
                            <div className="modal__tags">
                                {VOICE_TAGS.map((tag) => (
                                    <button
                                        key={tag.value}
                                        className={`modal__tag${selectedTags.includes(tag.value) ? " modal__tag--active" : ""}`}
                                        onClick={() => toggleTag(tag.value)}
                                        type="button"
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                            {fieldErrors.voiceTags && <span className="modal__field-error">{fieldErrors.voiceTags}</span>}
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Target Audience <span className="modal__required">*</span>
                            </label>
                            <textarea
                                className={`modal__textarea${fieldErrors.targetAudience ? " modal__input--error" : ""}`}
                                placeholder='e.g. "Men 25-40 interested in grooming who want simple, no-fuss products"'
                                value={targetAudience}
                                onChange={(e) => {
                                    if (e.target.value.length <= 300) setTargetAudience(e.target.value);
                                }}
                                rows={2}
                            />
                            <span className="modal__char-count">
                                {targetAudience.length}/300
                            </span>
                            {fieldErrors.targetAudience && <span className="modal__field-error">{fieldErrors.targetAudience}</span>}
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Competitor Brands (optional)
                            </label>
                            <input
                                className="modal__input"
                                type="text"
                                placeholder="e.g. Harry's, Dollar Shave Club, Manscaped"
                                value={competitors}
                                onChange={(e) => setCompetitors(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal__footer">
                    <button
                        className="modal__submit"
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="modal__submit-spinner" />
                                <span>Creating Brand...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Brand</span>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
