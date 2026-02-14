import React, { useState, useRef } from "react";
import { createProduct, uploadProductPhoto } from "../../../../server/user/product";
import type { CreateProductInput, Product } from "../../../../libs/types/product.type";

interface ProductStepProps {
    brandId: string;
    onBack: () => void;
    onNext: (product: Product) => void;
}

export default function ProductStep({ brandId, onBack, onNext }: ProductStepProps) {
    // ── Form state ──
    const [noPhysicalProduct, setNoPhysicalProduct] = useState(false);
    const [productName, setProductName] = useState("");
    const [pricePoint, setPricePoint] = useState("");
    const [productDescription, setProductDescription] = useState("");
    const [usps, setUsps] = useState(["", "", ""]);
    const [starRating, setStarRating] = useState("");
    const [reviewCount, setReviewCount] = useState("");
    const [offerDiscount, setOfferDiscount] = useState("");

    // ── Photo upload state ──
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoError, setPhotoError] = useState<string | null>(null);

    // ── UI state ──
    const [productDragOver, setProductDragOver] = useState(false);
    const [showStarDropdown, setShowStarDropdown] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const productFileInputRef = useRef<HTMLInputElement>(null);

    // ── USP helpers ──
    const updateUsp = (index: number, value: string) => {
        const updated = [...usps];
        updated[index] = value;
        setUsps(updated);
    };

    const addUsp = () => {
        if (usps.length < 5) setUsps([...usps, ""]);
    };

    const removeUsp = (index: number) => {
        if (usps.length > 1) setUsps(usps.filter((_, i) => i !== index));
    };

    // ── Photo upload ──
    const processPhotoFile = async (file: File) => {
        const allowed = /\.(png|jpg|jpeg|webp)$/i;
        if (!allowed.test(file.name)) {
            setPhotoError("Only PNG, JPG, JPEG, WEBP files are allowed");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setPhotoError("File size must be under 10MB");
            return;
        }

        setPhotoFile(file);
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoError(null);
        setPhotoUploading(true);

        try {
            const result = await uploadProductPhoto(file);
            setPhotoUrl(result.photo_url);
        } catch (err: any) {
            setPhotoError(err.message || "Failed to upload photo");
            setPhotoFile(null);
            setPhotoPreview(null);
            setPhotoUrl(null);
        } finally {
            setPhotoUploading(false);
        }
    };

    const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processPhotoFile(file);
    };

    const handleProductDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setProductDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processPhotoFile(file);
    };

    // ── Star rating parser ──
    const parseStarRating = (val: string): number | undefined => {
        const match = val.match(/[\d.]+/);
        return match ? parseFloat(match[0]) : undefined;
    };

    // ── Validation ──
    const validate = (): boolean => {
        const errors: Record<string, string> = {};

        if (!productName.trim()) errors.productName = "Product name is required";
        if (!productDescription.trim()) errors.productDescription = "Description is required";

        const validUsps = usps.filter((u) => u.trim());
        if (validUsps.length === 0) errors.usps = "At least one USP is required";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Submit ──
    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setError(null);

        try {
            const validUsps = usps.filter((u) => u.trim()).map((u) => u.trim());

            const input: CreateProductInput = {
                brand_id: brandId,
                name: productName.trim(),
                description: productDescription.trim(),
                usps: validUsps,
                has_physical_product: !noPhysicalProduct,
                photo_url: photoUrl || undefined,
                price_text: pricePoint.trim() || undefined,
                star_rating: starRating ? parseStarRating(starRating) : undefined,
                review_count: reviewCount ? parseInt(reviewCount, 10) || undefined : undefined,
                offer_text: offerDiscount.trim() || undefined,
            };

            const newProduct = await createProduct(input);
            onNext(newProduct);
        } catch (err: any) {
            setError(err.message || "Failed to create product. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="product-card">
            <div className="product-card__header">
                <h2 className="product-card__title">Add Your Product</h2>
                <p className="product-card__subtitle">Tell us about the product you're advertising.</p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="product-card__error">
                    <span>{error}</span>
                    <button className="product-card__error-dismiss" onClick={() => setError(null)}>×</button>
                </div>
            )}

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
                        className={`product-card__input${fieldErrors.productName ? " product-card__input--error" : ""}`}
                        placeholder="e.g., Bron Deodorant"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />
                    {fieldErrors.productName && <span className="product-card__field-error">{fieldErrors.productName}</span>}
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
                    className={`product-card__textarea${fieldErrors.productDescription ? " product-card__input--error" : ""}`}
                    placeholder="What is it, what does it do, who is it for?"
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={3}
                />
                {fieldErrors.productDescription && <span className="product-card__field-error">{fieldErrors.productDescription}</span>}
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
                {fieldErrors.usps && <span className="product-card__field-error">{fieldErrors.usps}</span>}
                {usps.length < 5 && (
                    <button className="product-card__usp-add" onClick={addUsp} type="button">
                        + Add USP
                    </button>
                )}
            </div>

            {/* Product Photo */}
            <div className="product-card__field">
                <label className="product-card__label">
                    PRODUCT PHOTO <span className="product-card__required">*</span>
                </label>
                <div
                    className={`product-card__upload${productDragOver ? " product-card__upload--drag" : ""}${photoPreview ? " product-card__upload--has-file" : ""}`}
                    onClick={() => productFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setProductDragOver(true); }}
                    onDragLeave={() => setProductDragOver(false)}
                    onDrop={handleProductDrop}
                >
                    <input
                        type="file"
                        ref={productFileInputRef}
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={handleProductFileChange}
                        hidden
                    />
                    {photoUploading ? (
                        <>
                            <div className="product-card__upload-spinner" />
                            <span className="product-card__upload-text">Uploading...</span>
                        </>
                    ) : photoPreview ? (
                        <>
                            <img
                                src={photoPreview}
                                alt="Product photo preview"
                                className="product-card__upload-preview"
                            />
                            <span className="product-card__upload-filename">{photoFile?.name}</span>
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
                            <span className="product-card__upload-hint">PNG, JPG, WEBP · Max 10MB</span>
                        </>
                    )}
                </div>
                {photoError && <span className="product-card__field-error">{photoError}</span>}
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
                <button
                    className={`product-card__submit${submitting ? " product-card__submit--loading" : ""}`}
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <>
                            <span className="product-card__submit-spinner" />
                            Creating...
                        </>
                    ) : (
                        <>
                            Next: Choose Concept
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
