import React, { useState, useRef } from "react";

const INDUSTRIES = [
    "Fashion & Apparel",
    "Food & Beverage",
    "Technology",
    "Health & Wellness",
    "Beauty & Cosmetics",
    "Sports & Fitness",
    "Home & Living",
    "Automotive",
    "Finance",
    "Education",
    "Travel & Hospitality",
    "Entertainment",
];

const VOICE_TAGS = [
    "Professional",
    "Playful",
    "Bold",
    "Minimalist",
    "Luxurious",
    "Friendly",
    "Edgy",
    "Trustworthy",
    "Youthful",
    "Authoritative",
];

interface CreateBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateBrandModal({ isOpen, onClose }: CreateBrandModalProps) {
    const [brandName, setBrandName] = useState("");
    const [industry, setIndustry] = useState("");
    const [description, setDescription] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#3ECFCF");
    const [secondaryColor, setSecondaryColor] = useState("#3B82F6");
    const [accentColor, setAccentColor] = useState("#E94560");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [targetAudience, setTargetAudience] = useState("");
    const [competitors, setCompetitors] = useState("");
    const [logoFile, setLogoFile] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setLogoFile(file.name);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setLogoFile(file.name);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button className="modal__close" onClick={onClose}>
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
                                    className="modal__input"
                                    type="text"
                                    placeholder="e.g. Bron"
                                    value={brandName}
                                    onChange={(e) => setBrandName(e.target.value)}
                                />
                            </div>
                            <div className="modal__field modal__field--half">
                                <label className="modal__label">
                                    Industry <span className="modal__required">*</span>
                                </label>
                                <div className="modal__select-wrap">
                                    <button
                                        className="modal__select"
                                        type="button"
                                        onClick={() => setShowDropdown(!showDropdown)}
                                    >
                                        <span className={industry ? "" : "modal__select-placeholder"}>
                                            {industry || "Select industry"}
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
                                                    key={ind}
                                                    className={`modal__dropdown-item${industry === ind ? " modal__dropdown-item--active" : ""}`}
                                                    onClick={() => {
                                                        setIndustry(ind);
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    {ind}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Brand Description <span className="modal__required">*</span>
                            </label>
                            <textarea
                                className="modal__textarea"
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
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Website URL <span className="modal__required">*</span>
                            </label>
                            <input
                                className="modal__input"
                                type="url"
                                placeholder="https://yourbrand.com"
                                value={websiteUrl}
                                onChange={(e) => setWebsiteUrl(e.target.value)}
                            />
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
                                Logo (PNG) <span className="modal__required">*</span>
                            </label>
                            <div
                                className={`modal__upload${dragOver ? " modal__upload--drag" : ""}${logoFile ? " modal__upload--has-file" : ""}`}
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
                                    accept=".png"
                                    style={{ display: "none" }}
                                    onChange={handleFileChange}
                                />
                                {logoFile ? (
                                    <>
                                        <div className="modal__upload-icon modal__upload-icon--success">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="modal__upload-filename">{logoFile}</span>
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
                                            Click to upload PNG logo
                                        </span>
                                        <span className="modal__upload-hint">
                                            Transparent background preferred · Max 5MB
                                        </span>
                                    </>
                                )}
                            </div>
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
                                        key={tag}
                                        className={`modal__tag${selectedTags.includes(tag) ? " modal__tag--active" : ""}`}
                                        onClick={() => toggleTag(tag)}
                                        type="button"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal__field">
                            <label className="modal__label">
                                Target Audience <span className="modal__required">*</span>
                            </label>
                            <textarea
                                className="modal__textarea"
                                placeholder='e.g. "Men 25-40 interested in grooming who want simple, no-fuss products"'
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                                rows={2}
                            />
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
                    <button className="modal__submit" type="button">
                        <span>Next: Add Product</span>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
