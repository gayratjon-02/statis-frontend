import React, { useState, useRef } from "react";

const AD_COLORS = ["#1a3a4a", "#2a1a3a", "#1a2a3a", "#3a2a1a", "#1a3a2a", "#2a3a1a"];

const CATEGORIES = [
    "All", "Feature Pointers", "Testimonial", "Before & After", "Us vs Them",
    "Lifestyle", "Stat Callout", "Social Proof", "Offer / Promo",
    "Problem → Solution", "Comparison Chart", "Ingredient Spotlight",
];

const INDUSTRIES = [
    "E-commerce", "Supplements", "Apparel", "Beauty", "Food & Beverage",
    "SaaS", "Fitness", "Home Goods", "Pets", "Financial Services", "Education", "Other",
];

const VOICE_TAGS = [
    "Professional", "Playful", "Bold", "Minimalist", "Luxurious",
    "Friendly", "Edgy", "Trustworthy", "Youthful", "Authoritative",
];

const MOCK_CONCEPTS = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    category: CATEGORIES[1 + (i % (CATEGORIES.length - 1))],
    name: `Concept ${i + 1}`,
    usageCount: Math.floor(Math.random() * 500) + 50,
    popular: i < 4,
}));

interface BrandState {
    name: string; description: string; url: string; industry: string;
    logo: File | null; logoPreview: string | null;
    primaryColor: string; secondaryColor: string; accentColor: string;
    voiceTags: string[]; targetAudience: string; competitors: string;
}

interface ProductState {
    name: string; description: string; usps: string[];
    photo: File | null; photoPreview: string | null;
    noPhysicalProduct: boolean; price: string; productUrl: string;
    starRating: string; reviewCount: string; offer: string;
}

export default function GeneratePage() {
    const [step, setStep] = useState(0);
    const [brand, setBrand] = useState<BrandState>({
        name: "", description: "", url: "", industry: "",
        logo: null, logoPreview: null,
        primaryColor: "#3ECFCF", secondaryColor: "#3B82F6", accentColor: "#E94560",
        voiceTags: [], targetAudience: "", competitors: "",
    });
    const [product, setProduct] = useState<ProductState>({
        name: "", description: "", usps: ["", "", ""],
        photo: null, photoPreview: null,
        noPhysicalProduct: false, price: "", productUrl: "",
        starRating: "", reviewCount: "", offer: "",
    });
    const [selectedConcept, setSelectedConcept] = useState<number | null>(null);
    const [conceptFilter, setConceptFilter] = useState("All");
    const [notes, setNotes] = useState("");
    const [generatingAds, setGeneratingAds] = useState([false, false, false, false, false, false]);
    const [completedAds, setCompletedAds] = useState([false, false, false, false, false, false]);
    const [savedAds, setSavedAds] = useState([false, false, false, false, false, false]);
    const [existingBrands] = useState([
        { id: 1, name: "Bron", color: "#3ECFCF" },
        { id: 2, name: "Fairway Fuel", color: "#22C55E" },
    ]);
    const [showBrandSelector, setShowBrandSelector] = useState(true);
    const [credits] = useState({ used: 185, limit: 750 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const productFileRef = useRef<HTMLInputElement>(null);

    const steps = [
        { label: "Brand" },
        { label: "Product" },
        { label: "Concept" },
        { label: "Notes" },
        { label: "Generate" },
    ];

    const startGeneration = () => {
        setStep(4);
        setGeneratingAds([true, true, true, true, true, true]);
        setCompletedAds([false, false, false, false, false, false]);
        setSavedAds([false, false, false, false, false, false]);
        [1200, 2800, 4200, 5800, 7500, 9000].forEach((delay, i) => {
            setTimeout(() => {
                setGeneratingAds((prev) => { const n = [...prev]; n[i] = false; return n; });
                setCompletedAds((prev) => { const n = [...prev]; n[i] = true; return n; });
                if (i === 5) setTimeout(() => setStep(5), 300);
            }, delay);
        });
    };

    const toggleVoiceTag = (tag: string) => {
        setBrand((prev) => ({
            ...prev,
            voiceTags: prev.voiceTags.includes(tag)
                ? prev.voiceTags.filter((t) => t !== tag)
                : [...prev.voiceTags, tag],
        }));
    };

    const addUsp = () => {
        if (product.usps.length < 5) setProduct((p) => ({ ...p, usps: [...p.usps, ""] }));
    };

    const removeUsp = (index: number) => {
        if (product.usps.length > 1) setProduct((p) => ({ ...p, usps: p.usps.filter((_, i) => i !== index) }));
    };

    const updateUsp = (index: number, value: string) => {
        setProduct((p) => ({ ...p, usps: p.usps.map((u, i) => (i === index ? value : u)) }));
    };

    const filteredConcepts = conceptFilter === "All" ? MOCK_CONCEPTS : MOCK_CONCEPTS.filter((c) => c.category === conceptFilter);
    const remaining = credits.limit - credits.used;

    return (
        <div className="gen-page">
            {/* ===== TOP BAR ===== */}
            <div className="gen-topbar">
                <div className="gen-topbar__brand">
                    <span className="gen-topbar__logo grad-text">Static Engine</span>
                    <span className="gen-topbar__beta">BETA</span>
                </div>
                <div className="gen-topbar__right">
                    <div className="gen-credits">
                        <span className="gen-credits__label">Credits</span>
                        <div className="gen-credits__bar-wrap">
                            <div className="gen-credits__bar">
                                <div className="gen-credits__bar-fill" style={{ width: `${(remaining / credits.limit) * 100}%` }} />
                            </div>
                            <span className="gen-credits__val">{remaining}</span>
                            <span className="gen-credits__max">/ {credits.limit}</span>
                        </div>
                    </div>
                    <div className="gen-avatar">B</div>
                </div>
            </div>

            {/* ===== STEP INDICATOR ===== */}
            {step < 5 && (
                <div className="gen-steps">
                    {steps.map((s, i) => (
                        <div key={i} className="gen-step">
                            <div
                                className={`gen-step__btn ${i === step ? "gen-step__btn--active" : ""} ${i < step ? "gen-step__btn--done" : ""}`}
                                onClick={() => { if (i < step) setStep(i); }}
                            >
                                <div className={`gen-step__num ${i === step ? "gen-step__num--active" : i < step ? "gen-step__num--done" : "gen-step__num--pending"}`}>
                                    {i < step ? "✓" : i + 1}
                                </div>
                                <span className="gen-step__label" style={{
                                    fontWeight: i === step ? 600 : 400,
                                    color: i === step ? "var(--text)" : i < step ? "var(--accent)" : "var(--dim)",
                                }}>
                                    {s.label}
                                </span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className="gen-step__line" style={{ background: i < step ? "var(--accent)" : "var(--border)" }} />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ===== CONTENT ===== */}
            <div className={`gen-content ${step === 2 ? "gen-content--medium" : step >= 4 ? "gen-content--wide" : "gen-content--narrow"}`}>

                {/* ══════ STEP 0: BRAND ══════ */}
                {step === 0 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                        {showBrandSelector && (
                            <div className="gen-brand-selector">
                                <div className="gen-brand-selector__title">Select an existing brand</div>
                                <div className="gen-brand-list">
                                    {existingBrands.map((b) => (
                                        <div key={b.id} className="gen-brand-item"
                                            onClick={() => { setBrand((prev) => ({ ...prev, name: b.name })); setStep(1); }}
                                        >
                                            <div className="gen-brand-item__icon" style={{ background: `${b.color}33`, color: b.color }}>
                                                {b.name[0]}
                                            </div>
                                            <span style={{ fontWeight: 500 }}>{b.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="gen-or-divider" onClick={() => setShowBrandSelector(false)}>
                                    <div className="gen-or-divider__line" />
                                    <span className="gen-or-divider__text">or create new +</span>
                                    <div className="gen-or-divider__line" />
                                </div>
                            </div>
                        )}

                        {!showBrandSelector && (
                            <>
                                <div className="gen-card">
                                    <div className="gen-card__title">Create Brand Profile</div>
                                    <div className="gen-card__desc">Your brand details power the AI to create on-brand ads.</div>

                                    <div className="gen-section"><span className="gen-section__num">01</span> Brand Identity</div>

                                    <div className="gen-grid-2">
                                        <div>
                                            <label className="gen-label">Brand Name *</label>
                                            <input className="gen-input" placeholder="e.g., Bron" value={brand.name}
                                                onChange={(e) => setBrand((p) => ({ ...p, name: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="gen-label">Industry *</label>
                                            <select className="gen-select" value={brand.industry}
                                                onChange={(e) => setBrand((p) => ({ ...p, industry: e.target.value }))}>
                                                <option value="">Select industry</option>
                                                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="gen-mb-20">
                                        <label className="gen-label">Brand Description *</label>
                                        <textarea className="gen-textarea" style={{ height: 80 }}
                                            placeholder="What does your brand do? Who does it serve?"
                                            value={brand.description}
                                            onChange={(e) => setBrand((p) => ({ ...p, description: e.target.value }))} />
                                        <div className="gen-char-count">{brand.description.length}/500</div>
                                    </div>

                                    <div className="gen-mb-28">
                                        <label className="gen-label">Website URL *</label>
                                        <input className="gen-input" placeholder="https://yourbrand.com" value={brand.url}
                                            onChange={(e) => setBrand((p) => ({ ...p, url: e.target.value }))} />
                                    </div>

                                    <div className="gen-section"><span className="gen-section__num">02</span> Brand Visuals</div>

                                    <div className="gen-mb-20">
                                        <label className="gen-label">Logo (PNG) *</label>
                                        <div className="gen-upload" onClick={() => fileInputRef.current?.click()}
                                            style={brand.logoPreview ? { backgroundImage: `url(${brand.logoPreview})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 120 } : {}}>
                                            {!brand.logoPreview && (
                                                <>
                                                    <div className="gen-upload__icon">⬆</div>
                                                    <div className="gen-upload__label">Click to upload PNG logo</div>
                                                    <div className="gen-upload__hint">Transparent background preferred · Max 5MB</div>
                                                </>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept=".png" style={{ display: "none" }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    setBrand((p) => ({ ...p, logo: file, logoPreview: url }));
                                                }
                                            }} />
                                    </div>

                                    <div className="gen-grid-3">
                                        {([
                                            { label: "Primary Color *", key: "primaryColor" as const },
                                            { label: "Secondary Color *", key: "secondaryColor" as const },
                                            { label: "Accent Color", key: "accentColor" as const },
                                        ]).map(({ label, key }) => (
                                            <div key={key}>
                                                <label className="gen-label">{label}</label>
                                                <div className="gen-color-row">
                                                    <input type="color" value={brand[key]} className="gen-color-picker"
                                                        onChange={(e) => setBrand((p) => ({ ...p, [key]: e.target.value }))} />
                                                    <input className="gen-input" style={{ flex: 1, fontFamily: "monospace", fontSize: 13 }}
                                                        value={brand[key]}
                                                        onChange={(e) => setBrand((p) => ({ ...p, [key]: e.target.value }))} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="gen-section"><span className="gen-section__num">03</span> Brand Voice</div>

                                    <div className="gen-mb-20">
                                        <label className="gen-label">Voice & Tone *</label>
                                        <div className="gen-tags">
                                            {VOICE_TAGS.map((tag) => (
                                                <div key={tag} className={`gen-tag ${brand.voiceTags.includes(tag) ? "gen-tag--active" : ""}`}
                                                    onClick={() => toggleVoiceTag(tag)}>
                                                    {tag}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="gen-mb-20">
                                        <label className="gen-label">Target Audience *</label>
                                        <textarea className="gen-textarea" style={{ height: 60 }}
                                            placeholder='e.g., "Men 25-40 interested in grooming who want simple, no-fuss products"'
                                            value={brand.targetAudience}
                                            onChange={(e) => setBrand((p) => ({ ...p, targetAudience: e.target.value }))} />
                                    </div>

                                    <div className="gen-mb-20">
                                        <label className="gen-label">Competitor Brands (Optional)</label>
                                        <input className="gen-input" placeholder="e.g., Harry's, Dollar Shave Club, Manscaped"
                                            value={brand.competitors}
                                            onChange={(e) => setBrand((p) => ({ ...p, competitors: e.target.value }))} />
                                    </div>
                                </div>

                                <div className="gen-nav gen-nav--right">
                                    <button className="gen-btn-next" onClick={() => setStep(1)}>Next: Add Product →</button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ══════ STEP 1: PRODUCT ══════ */}
                {step === 1 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                        <div className="gen-card">
                            <div className="gen-card__title">Add Your Product</div>
                            <div className="gen-card__desc">Tell us about the product you&apos;re advertising.</div>

                            <div className="gen-toggle-row">
                                <div className="gen-toggle"
                                    onClick={() => setProduct((p) => ({ ...p, noPhysicalProduct: !p.noPhysicalProduct }))}
                                    style={{ background: product.noPhysicalProduct ? "var(--accent)" : "var(--border)" }}>
                                    <div className="gen-toggle__knob"
                                        style={{ transform: product.noPhysicalProduct ? "translateX(20px)" : "translateX(0)" }} />
                                </div>
                                <span style={{ fontSize: 14, color: "var(--muted)" }}>No physical product (SaaS, service, digital product)</span>
                            </div>

                            <div className="gen-grid-2">
                                <div>
                                    <label className="gen-label">Product Name *</label>
                                    <input className="gen-input" placeholder="e.g., Bron Deodorant" value={product.name}
                                        onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="gen-label">Price Point</label>
                                    <input className="gen-input" placeholder="e.g., $29.99" value={product.price}
                                        onChange={(e) => setProduct((p) => ({ ...p, price: e.target.value }))} />
                                </div>
                            </div>

                            <div className="gen-mb-20">
                                <label className="gen-label">Product Description *</label>
                                <textarea className="gen-textarea" style={{ height: 80 }}
                                    placeholder="What is it, what does it do, who is it for?"
                                    value={product.description}
                                    onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))} />
                            </div>

                            <div className="gen-mb-20">
                                <label className="gen-label">Unique Selling Points *</label>
                                {product.usps.map((usp, i) => (
                                    <div key={i} className="gen-usp-row">
                                        <div className="gen-usp-num">{i + 1}</div>
                                        <input className="gen-input" style={{ flex: 1 }}
                                            placeholder={`USP ${i + 1}, e.g., "48-hour odor protection"`}
                                            value={usp} onChange={(e) => updateUsp(i, e.target.value)} />
                                        {product.usps.length > 1 && (
                                            <button className="gen-usp-remove" onClick={() => removeUsp(i)}>×</button>
                                        )}
                                    </div>
                                ))}
                                {product.usps.length < 5 && (
                                    <button className="gen-usp-add" onClick={addUsp}>+ Add USP</button>
                                )}
                            </div>

                            <div className="gen-mb-20">
                                <label className="gen-label">{product.noPhysicalProduct ? "Hero Image (Optional)" : "Product Photo *"}</label>
                                <div className="gen-upload" onClick={() => productFileRef.current?.click()}
                                    style={product.photoPreview ? { backgroundImage: `url(${product.photoPreview})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: 160 } : {}}>
                                    {!product.photoPreview && (
                                        <>
                                            <div className="gen-upload__icon">📷</div>
                                            <div className="gen-upload__label">
                                                {product.noPhysicalProduct ? "Upload a screenshot, mockup, or lifestyle image" : "Upload product photo with clean/white background"}
                                            </div>
                                            <div className="gen-upload__hint">PNG or JPG · Max 10MB</div>
                                        </>
                                    )}
                                </div>
                                <input ref={productFileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const url = URL.createObjectURL(file);
                                            setProduct((p) => ({ ...p, photo: file, photoPreview: url }));
                                        }
                                    }} />
                            </div>

                            <div className="gen-divider">
                                <div className="gen-divider__line" />
                                <span>OPTIONAL ENRICHMENT</span>
                                <div className="gen-divider__line" />
                            </div>

                            <div className="gen-grid-3" style={{ marginBottom: 16 }}>
                                <div>
                                    <label className="gen-label">Star Rating</label>
                                    <select className="gen-select" value={product.starRating}
                                        onChange={(e) => setProduct((p) => ({ ...p, starRating: e.target.value }))}>
                                        <option value="">Select</option>
                                        {[5.0, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1, 4.0].map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="gen-label">Review Count</label>
                                    <input className="gen-input" placeholder="e.g., 2400" value={product.reviewCount}
                                        onChange={(e) => setProduct((p) => ({ ...p, reviewCount: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="gen-label">Offer / Discount</label>
                                    <input className="gen-input" placeholder="e.g., 20% off first order" value={product.offer}
                                        onChange={(e) => setProduct((p) => ({ ...p, offer: e.target.value }))} />
                                </div>
                            </div>
                        </div>

                        <div className="gen-nav">
                            <button className="gen-btn-back" onClick={() => setStep(0)}>← Back</button>
                            <button className="gen-btn-next" onClick={() => setStep(2)}>Next: Choose Concept →</button>
                        </div>
                    </div>
                )}

                {/* ══════ STEP 2: CONCEPT ══════ */}
                {step === 2 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                        <div className="gen-card__title">Choose Your Ad Concept</div>
                        <div className="gen-card__desc">Select a template style. The AI will generate your ad in this format.</div>

                        <div className="gen-concept-filter">
                            {CATEGORIES.map((cat) => (
                                <button key={cat}
                                    className={`gen-concept-filter-btn ${conceptFilter === cat ? "gen-concept-filter-btn--active" : ""}`}
                                    onClick={() => setConceptFilter(cat)}>
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="gen-concepts-grid">
                            {filteredConcepts.map((concept) => (
                                <div key={concept.id}
                                    className={`gen-concept-card ${selectedConcept === concept.id ? "gen-concept-card--selected" : ""}`}
                                    onClick={() => setSelectedConcept(concept.id)}>
                                    <div className="gen-concept-card__preview"
                                        style={{ background: `linear-gradient(135deg, ${AD_COLORS[concept.id % 6]}ee, ${AD_COLORS[(concept.id + 2) % 6]}aa)` }}>
                                        <div className="gen-concept-card__placeholder">▣</div>
                                        {concept.popular && <div className="gen-concept-card__popular">POPULAR</div>}
                                        {selectedConcept === concept.id && <div className="gen-concept-card__check">✓</div>}
                                    </div>
                                    <div className="gen-concept-card__info">
                                        <div className="gen-concept-card__name">{concept.category}</div>
                                        <div className="gen-concept-card__uses">{concept.usageCount} uses</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="gen-nav">
                            <button className="gen-btn-back" onClick={() => setStep(1)}>← Back</button>
                            <button className="gen-btn-next" disabled={!selectedConcept}
                                onClick={() => { if (selectedConcept) setStep(3); }}>
                                Next: Add Notes →
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════ STEP 3: NOTES ══════ */}
                {step === 3 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                        <div className="gen-card">
                            <div className="gen-card__title">Important Notes</div>
                            <div className="gen-card__desc">Any special instructions for the AI? This is optional but helps fine-tune your results.</div>

                            <textarea className="gen-textarea" style={{ height: 160, fontSize: 15, lineHeight: 1.6 }}
                                placeholder={`Examples:\n• "Make sure the ad mentions the color blue"\n• "Use a dark, moody background"\n• "Target audience is men 30-50 who play golf"\n• "Ad should feel premium and luxurious"`}
                                value={notes} onChange={(e) => setNotes(e.target.value)} />
                            <div className="gen-char-count">{notes.length}/500</div>

                            <div className="gen-summary">
                                <div className="gen-summary__title">GENERATION SUMMARY</div>
                                <div className="gen-summary__grid">
                                    {[
                                        { label: "Brand", value: brand.name || "Not set" },
                                        { label: "Product", value: product.name || "Not set" },
                                        { label: "Concept", value: selectedConcept ? MOCK_CONCEPTS.find((c) => c.id === selectedConcept)?.category : "Not selected" },
                                        { label: "Credit Cost", value: "5 credits (6 variations)" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="gen-summary__row">
                                            <span className="gen-summary__label">{label}</span>
                                            <span className="gen-summary__value">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="gen-nav">
                            <button className="gen-btn-back" onClick={() => setStep(2)}>← Back</button>
                            <button className="gen-btn-generate" onClick={startGeneration}>⚡ Generate Ads</button>
                        </div>
                    </div>
                )}

                {/* ══════ STEP 4: GENERATING ══════ */}
                {step === 4 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                        <div className="gen-progress-title">
                            <h2>Generating Your Ads</h2>
                            <p>{completedAds.filter(Boolean).length} of 6 variations complete</p>
                        </div>

                        <div className="gen-ad-grid">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`gen-ad-card ${completedAds[i] ? "gen-ad-card--complete" : ""}`}>
                                    <div className={`gen-ad-card__preview ${generatingAds[i] ? "gen-ad-card__preview--shimmer" : !completedAds[i] ? "gen-ad-card__preview--empty" : ""}`}
                                        style={completedAds[i] ? { background: `linear-gradient(135deg, ${AD_COLORS[i]}dd, ${AD_COLORS[(i + 3) % 6]}aa)` } : {}}>
                                        {completedAds[i] ? (
                                            <div className="gen-ad-card__result">
                                                <div className="gen-ad-card__result-title">Ad Variation {i + 1}</div>
                                                <div className="gen-ad-card__result-sub">[Generated Image]</div>
                                            </div>
                                        ) : generatingAds[i] ? (
                                            <div className="gen-ad-card__gen-text">Generating...</div>
                                        ) : null}
                                    </div>
                                    {completedAds[i] && (
                                        <div className="gen-ad-card__actions">
                                            <button className="gen-ad-btn">Fix Errors</button>
                                            <button className="gen-ad-btn gen-ad-btn--primary">Save Ad</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════ STEP 5: RESULTS ══════ */}
                {step === 5 && (
                    <div style={{ animation: "fadeIn 0.4s ease" }}>
                        <div className="gen-results-header">
                            <div>
                                <h2>Your Ad Variations</h2>
                                <p>6 variations generated · 5 credits used</p>
                            </div>
                            <button className="gen-results-regen" onClick={() => { setStep(4); startGeneration(); }}>
                                🔄 Regenerate All (5 credits)
                            </button>
                        </div>

                        <div className="gen-ad-grid">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className={`gen-ad-card ${savedAds[i] ? "gen-ad-card--saved" : ""}`}>
                                    <div className="gen-ad-card__preview"
                                        style={{
                                            background: `linear-gradient(135deg, ${AD_COLORS[i]}dd, ${AD_COLORS[(i + 3) % 6]}aa)`,
                                            height: 280,
                                            position: "relative",
                                        }}>
                                        <div className="gen-ad-card__result">
                                            <div style={{ fontSize: 16, fontWeight: 700, opacity: 0.7 }}>Variation {i + 1}</div>
                                            <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4 }}>[AI Generated Ad]</div>
                                        </div>
                                        {savedAds[i] && <div className="gen-ad-card__saved-badge">SAVED</div>}
                                    </div>

                                    <div className="gen-ad-card__actions-full">
                                        <div style={{ display: "flex", gap: 6 }}>
                                            <button className="gen-ad-btn">Fix Errors</button>
                                            <button className="gen-ad-btn">↻ Redo</button>
                                            <button className="gen-ad-btn">⤓ Download</button>
                                        </div>

                                        {!savedAds[i] ? (
                                            <button className="gen-ad-btn--save"
                                                onClick={() => setSavedAds((prev) => { const n = [...prev]; n[i] = true; return n; })}>
                                                Save Ad
                                            </button>
                                        ) : (
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button className="gen-ad-btn--ratio">Get All Ratios</button>
                                                <button className="gen-ad-btn--canva">Buy Canva Template</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="gen-results-footer">
                            <span>Not what you&apos;re looking for? </span>
                            <button onClick={() => setStep(3)}>Edit notes &amp; regenerate</button>
                            <span> or </span>
                            <button onClick={() => setStep(2)}>try a different concept</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
