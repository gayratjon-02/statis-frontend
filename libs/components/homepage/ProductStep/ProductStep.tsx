import React, { useState, useRef } from "react";

interface ProductStepProps {
    onBack: () => void;
    onNext: () => void;
}

export default function ProductStep({ onBack, onNext }: ProductStepProps) {
    const [noPhysicalProduct, setNoPhysicalProduct] = useState(false);
    const [productName, setProductName] = useState("");
    const [pricePoint, setPricePoint] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [usps, setUsps] = useState(["", "", ""]);
    const [productPhoto, setProductPhoto] = useState<string | null>(null);
    const [productDragOver, setProductDragOver] = useState(false);
    const [starRating, setStarRating] = useState("");
    const [reviewCount, setReviewCount] = useState("");
    const [offerDiscount, setOfferDiscount] = useState("");
    const [showStarDropdown, setShowStarDropdown] = useState(false);

    const productFileInputRef = useRef<HTMLInputElement>(null);

    const updateUsp = (index: number, value: string) => {
        const updated = [...usps];
        updated[index] = value;
        setUsps(updated);
    };

    const addUsp = () => setUsps([...usps, ""]);

    const removeUsp = (index: number) => {
        if (usps.length > 1) setUsps(usps.filter((_, i) => i !== index));
    };

    const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setProductPhoto(file.name);
    };

    const handleProductDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setProductDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) setProductPhoto(file.name);
    };

    return (
        <div className="product-card">
            <div className="product-card__header">
                <h2 className="product-card__title">Add Your Product</h2>
                <p className="product-card__subtitle">Tell us about the product you're advertising.</p>
            </div>

            {/* Toggle: No physical product */}
            <div className="product-card__toggle-row">
                <button
                    className={`product-card__toggle${noPhysicalProduct ? " product-card__toggle--active" : ""}`}
                    onClick={() => setNoPhysicalProduct(!noPhysicalProduct)}
                    type="button"
                >
                    <span className="product-card__toggle-track">
                        <span className="product-card__toggle-thumb" />
                    </span>
                </button>
                <span className="product-card__toggle-label">No physical product (SaaS, service, digital product)</span>
            </div>

            {/* Product Name + Price */}
            <div className="product-card__row">
                <div className="product-card__field product-card__field--grow">
                    <label className="product-card__label">
                        PRODUCT NAME <span className="product-card__required">*</span>
                    </label>
                    <input
                        className="product-card__input"
                        placeholder="e.g., Bron Deodorant"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                </div>
                <div className="product-card__field">
                    <label className="product-card__label">PRICE POINT</label>
                    <input
                        className="product-card__input"
                        placeholder="e.g., $29.99"
                        value={pricePoint}
                        onChange={(e) => setPricePoint(e.target.value)}
                    />
                </div>
            </div>

            {/* Product Description */}
            <div className="product-card__field">
                <label className="product-card__label">
                    PRODUCT DESCRIPTION <span className="product-card__required">*</span>
                </label>
                <textarea
                    className="product-card__textarea"
                    placeholder="What is it, what does it do, who is it for?"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                />
            </div>

            {/* Unique Selling Points */}
            <div className="product-card__field">
                <label className="product-card__label">
                    UNIQUE SELLING POINTS <span className="product-card__required">*</span>
                </label>
                <div className="product-card__usps">
                    {usps.map((usp, idx) => (
                        <div className="product-card__usp-row" key={idx}>
                            <span className="product-card__usp-num">{idx + 1}</span>
                            <input
                                className="product-card__input product-card__input--usp"
                                placeholder={`USP ${idx + 1}, e.g., "48-hour odor protection"`}
                                value={usp}
                                onChange={(e) => updateUsp(idx, e.target.value)}
                            />
                            <button
                                className="product-card__usp-remove"
                                onClick={() => removeUsp(idx)}
                                type="button"
                                disabled={usps.length <= 1}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <button className="product-card__usp-add" onClick={addUsp} type="button">
                    + Add USP
                </button>
            </div>

            {/* Product Photo */}
            <div className="product-card__field">
                <label className="product-card__label">
                    PRODUCT PHOTO <span className="product-card__required">*</span>
                </label>
                <div
                    className={`product-card__upload${productDragOver ? " product-card__upload--drag" : ""}${productPhoto ? " product-card__upload--has-file" : ""}`}
                    onClick={() => productFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setProductDragOver(true); }}
                    onDragLeave={() => setProductDragOver(false)}
                    onDrop={handleProductDrop}
                >
                    <input
                        type="file"
                        ref={productFileInputRef}
                        accept=".png,.jpg,.jpeg"
                        onChange={handleProductFileChange}
                        hidden
                    />
                    {productPhoto ? (
                        <>
                            <div className="product-card__upload-icon product-card__upload-icon--success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="product-card__upload-filename">{productPhoto}</span>
                            <span className="product-card__upload-change">Click to replace</span>
                        </>
                    ) : (
                        <>
                            <div className="product-card__upload-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                                    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span className="product-card__upload-text">Upload product photo with clean/white background</span>
                            <span className="product-card__upload-hint">PNG or JPG · Max 10MB</span>
                        </>
                    )}
                </div>
            </div>

            {/* Optional Enrichment */}
            <div className="product-card__divider-label">
                <span>OPTIONAL ENRICHMENT</span>
            </div>

            <div className="product-card__row product-card__row--thirds">
                <div className="product-card__field">
                    <label className="product-card__label">STAR RATING</label>
                    <div className="product-card__select-wrapper">
                        <div
                            className="product-card__select"
                            onClick={() => setShowStarDropdown(!showStarDropdown)}
                        >
                            <span className={starRating ? "" : "product-card__select-placeholder"}>
                                {starRating || "Select"}
                            </span>
                            <svg className="product-card__select-arrow" width="12" height="12" viewBox="0 0 12 12">
                                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        {showStarDropdown && (
                            <div className="product-card__dropdown">
                                {["⭐ 5.0", "⭐ 4.5", "⭐ 4.0", "⭐ 3.5", "⭐ 3.0"].map((r) => (
                                    <div
                                        key={r}
                                        className={`product-card__dropdown-item${starRating === r ? " product-card__dropdown-item--active" : ""}`}
                                        onClick={() => { setStarRating(r); setShowStarDropdown(false); }}
                                    >
                                        {r}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="product-card__field">
                    <label className="product-card__label">REVIEW COUNT</label>
                    <input
                        className="product-card__input"
                        placeholder="e.g., 2400"
                        value={reviewCount}
                        onChange={(e) => setReviewCount(e.target.value)}
                    />
                </div>
                <div className="product-card__field">
                    <label className="product-card__label">OFFER / DISCOUNT</label>
                    <input
                        className="product-card__input"
                        placeholder="e.g., 20% off first order"
                        value={offerDiscount}
                        onChange={(e) => setOfferDiscount(e.target.value)}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="product-card__footer">
                <button
                    className="product-card__back-btn"
                    onClick={onBack}
                    type="button"
                >
                    ← Back
                </button>
                <button className="product-card__submit" type="button" onClick={onNext}>
                    Next: Choose Concept
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
