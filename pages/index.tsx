import React, { useState, useRef, useEffect } from "react";

const STEPS = [
  { number: 1, label: "Brand" },
  { number: 2, label: "Product" },
  { number: 3, label: "Concept" },
  { number: 4, label: "Notes" },
  { number: 5, label: "Generate" },
];

const BRANDS = [
  { id: 1, name: "Bron", initial: "B" },
  { id: 2, name: "Fairway Fuel", initial: "F" },
];

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

export default function Home() {
  const [activeStep, setActiveStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = saved ? saved === "dark" : true;
    setIsDark(prefersDark);
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Form state — Brand
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

  // Form state — Product
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const credits = 565;
  const maxCredits = 750;
  const creditPercent = (credits / maxCredits) * 100;

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

  // Brand selection
  const handleBrandSelect = (brandId: number) => {
    setSelectedBrand(brandId);
    setActiveStep(2);
  };

  // Product form helpers
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

  // Stepper click guard — only allow going back to completed steps
  const handleStepClick = (stepNumber: number) => {
    if (stepNumber === 1) {
      setActiveStep(1);
    } else if (stepNumber === 2 && selectedBrand) {
      setActiveStep(2);
    }
    // Future steps: add guards as needed
  };

  return (
    <div className="home-page">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar__left">
          <span className="navbar__logo">Static Engine</span>
        </div>
        <div className="navbar__right">
          <div className="navbar__credits">
            <span className="navbar__credits-label">Credits</span>
            <div className="navbar__credits-bar">
              <div
                className="navbar__credits-bar-fill"
                style={{ width: `${creditPercent}%` }}
              />
            </div>
            <span className="navbar__credits-count">
              {credits} <span>/ {maxCredits}</span>
            </span>
          </div>
          <button
            className="navbar__theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="navbar__theme-icon navbar__theme-icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="5" fill="#FBBF24" />
                <line x1="12" y1="1" x2="12" y2="4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="20" x2="12" y2="23" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="1" y1="12" x2="4" y2="12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="20" y1="12" x2="23" y2="12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg className="navbar__theme-icon navbar__theme-icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="#F59E0B" />
              </svg>
            )}
          </button>
          <div className="navbar__avatar">B</div>
        </div>
      </nav>

      {/* ── Stepper ── */}
      <div className="stepper">
        {STEPS.map((step, idx) => (
          <div className="stepper__step" key={step.number}>
            <div
              className={`stepper__step-content${activeStep === step.number
                ? " stepper__step-content--active"
                : ""
                }${step.number < activeStep ? " stepper__step-content--completed" : ""}`}
              onClick={() => handleStepClick(step.number)}
            >
              <span
                className={`stepper__step-number${activeStep === step.number
                  ? " stepper__step-number--active"
                  : ""
                  }`}
              >
                {step.number}
              </span>
              <span
                className={`stepper__step-label${activeStep === step.number
                  ? " stepper__step-label--active"
                  : ""
                  }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && <div className="stepper__connector" />}
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="content">
        {/* ── Step 1: Brand ── */}
        {activeStep === 1 && (
          <div className="brand-card">
            <h2 className="brand-card__title">Select an existing brand</h2>
            <div className="brand-card__list">
              {BRANDS.map((brand) => (
                <div
                  className={`brand-card__item${selectedBrand === brand.id ? " brand-card__item--selected" : ""}`}
                  key={brand.id}
                  onClick={() => handleBrandSelect(brand.id)}
                >
                  <div className="brand-card__item-icon">{brand.initial}</div>
                  <span className="brand-card__item-name">{brand.name}</span>
                </div>
              ))}
            </div>
            <div className="brand-card__divider" />
            <div className="brand-card__create">
              <button
                className="brand-card__create-btn"
                onClick={() => setShowModal(true)}
              >
                or create new +
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Product ── */}
        {activeStep === 2 && (
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
                onClick={() => setActiveStep(1)}
                type="button"
              >
                ← Back
              </button>
              <button className="product-card__submit" type="button">
                Next: Choose Concept
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer icon ── */}
      <div className="footer-icon">N</div>

      {/* ── Modal Overlay ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button className="modal__close" onClick={() => setShowModal(false)}>
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
      )}
    </div>
  );
}
