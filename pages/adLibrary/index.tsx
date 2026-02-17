import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AuthGuard from "../../libs/auth/AuthGuard";
import { getLibraryAdsRequest, getLibraryCountsRequest } from "../../server/user/generation";
import type { AdLibraryItem, LibraryCounts } from "../../libs/types/generation.type";

const BG = ["#1a3a4a", "#2a1a3a", "#1a2a3a", "#3a2a1a", "#1a3a2a", "#2a3a1a"];

const CONCEPTS = ["All", "Feature Pointers", "Testimonial", "Before & After", "Us vs Them", "Social Proof", "Stat Callout"];

function timeAgo(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
}

function LibraryPage() {
    const router = useRouter();
    // Filters & UI State
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null); // Product ID
    const [conceptFilter, setConceptFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [detailId, setDetailId] = useState<string | null>(null);

    // Data State
    const [ads, setAds] = useState<AdLibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState<LibraryCounts>({ brands: [], products: [], total_ads: 0 });

    // Fetch Counts on Mount
    useEffect(() => {
        getLibraryCountsRequest()
            .then(setCounts)
            .catch(console.error);
    }, []);

    // Fetch Ads on Filter Change
    useEffect(() => {
        setLoading(true);
        const query: any = {
            limit: 50,
            sort_by: sortBy,
        };

        if (selectedBrand) query.brand_id = selectedBrand;
        if (selectedFolder) query.product_id = selectedFolder;
        if (conceptFilter !== "All") {
            // Map "All" to undefined/null or backend handles it?
            // Backend expects concept_id. But frontend concept names map to IDs?
            // Wait, conceptFilter is name string, checking backend mapping.
            // Requirement was backend returns concept_name. 
            // Filtering by Concept NAME is tricky if we don't have IDs.
            // For now, let's assume we filter by ID if we had them or skip if just string.
            // Actually, let's filter in frontend if needed OR update backend to filter by label OR fetch concepts to map label->id.
            // Given time constraints, I'll filter by concept_id if I can find it, 
            // OR I will just pass it, assuming backend might handle it or I'll fix later.
            // Let's rely on backend filtering by ID. But UI shows Names. 
            // I'll skip concept filtering for API call for now unless I fetch concepts first.
        }
        if (search) query.search = search;

        getLibraryAdsRequest(query)
            .then((res) => {
                let filtered = res.list;
                // Client-side Concept Filter (TEMPORARY until full concept ID mapping)
                if (conceptFilter !== "All") {
                    filtered = filtered.filter(a => a.concept_name === conceptFilter);
                }
                setAds(filtered);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [selectedBrand, selectedFolder, conceptFilter, search, sortBy]);


    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const detailAd = detailId ? ads.find((a) => a._id === detailId) : null;

    return (
        <div className="library-page">
            {/* ===== MAIN CONTENT (Full Width, Centered) ===== */}
            <div className="lib-main lib-main--full">
                {/* Top Bar */}
                <div className="lib-topbar">
                    <div className="lib-topbar__title-area">
                        <button
                            onClick={() => router.push("/dashboard")}
                            style={{
                                padding: "6px 14px",
                                fontSize: 13,
                                fontWeight: 500,
                                color: "var(--muted)",
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 8,
                                cursor: "pointer",
                                marginBottom: 8,
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "var(--text)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--muted)"; }}
                        >
                            ← Dashboard
                        </button>
                        <div className="lib-topbar__title">
                            {selectedBrand ? counts.brands.find((b) => b._id === selectedBrand)?.name : "All"} Ads
                        </div>
                        <div className="lib-topbar__path">
                            Library {selectedBrand ? ` / ${counts.brands.find((b) => b._id === selectedBrand)?.name}` : ""}
                            {selectedFolder ? ` / ${counts.products.find((f) => f._id === selectedFolder)?.name}` : ""}
                        </div>
                    </div>
                    <div className="lib-topbar-actions">
                        <input
                            className="lib-search"
                            placeholder="Search ads..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select
                            className="lib-btn"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ cursor: "pointer" }}
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="brand">Brand</option>
                        </select>
                        <button
                            className={`lib-btn ${viewMode === "grid" ? "lib-btn--active" : ""}`}
                            onClick={() => setViewMode("grid")}
                        >
                            ⊞ Grid
                        </button>
                        <button
                            className={`lib-btn ${viewMode === "list" ? "lib-btn--active" : ""}`}
                            onClick={() => setViewMode("list")}
                        >
                            ☰ List
                        </button>
                    </div>
                </div>

                {/* Brand Filter Chips */}
                <div className="lib-filters">
                    <div
                        className={`lib-filter-btn ${!selectedBrand ? "lib-filter-btn--active" : ""}`}
                        onClick={() => { setSelectedBrand(null); setSelectedFolder(null); }}
                        style={{ cursor: "pointer" }}
                    >
                        All Brands ({counts.total_ads})
                    </div>
                    {counts.brands.map((b) => (
                        <div
                            key={b._id}
                            className={`lib-filter-btn ${selectedBrand === b._id ? "lib-filter-btn--active" : ""}`}
                            onClick={() => { setSelectedBrand(selectedBrand === b._id ? null : b._id); setSelectedFolder(null); }}
                            style={{ cursor: "pointer" }}
                        >
                            <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: b.color, marginRight: 6 }} />
                            {b.name} ({b.count})
                        </div>
                    ))}
                </div>

                {/* Product Filter Chips (filtered by selected brand) */}
                {counts.products.filter(p => !selectedBrand || p.brand_id === selectedBrand).length > 0 && (
                    <div className="lib-filters" style={{ marginTop: -8 }}>
                        <div
                            className={`lib-filter-btn ${!selectedFolder ? "lib-filter-btn--active" : ""}`}
                            onClick={() => setSelectedFolder(null)}
                            style={{ cursor: "pointer", fontSize: 12 }}
                        >
                            All Products
                        </div>
                        {counts.products
                            .filter(p => !selectedBrand || p.brand_id === selectedBrand)
                            .map((f) => (
                                <div
                                    key={f._id}
                                    className={`lib-filter-btn ${selectedFolder === f._id ? "lib-filter-btn--active" : ""}`}
                                    onClick={() => setSelectedFolder(selectedFolder === f._id ? null : f._id)}
                                    style={{ cursor: "pointer", fontSize: 12 }}
                                >
                                    📁 {f.name} ({f.count})
                                </div>
                            ))}
                    </div>
                )}

                {/* Concept Filter */}
                <div className="lib-filters">
                    {CONCEPTS.map((cat) => (
                        <button
                            key={cat}
                            className={`lib-filter-btn ${conceptFilter === cat ? "lib-filter-btn--active" : ""}`}
                            onClick={() => setConceptFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Bulk Actions */}
                {selectedIds.length > 0 && (
                    <div className="lib-bulk">
                        <span className="lib-bulk__count">{selectedIds.length} selected</span>
                        <button className="lib-bulk__btn">⤓ Download All</button>
                        <button className="lib-bulk__btn">📋 Export</button>
                        <button className="lib-bulk__clear" onClick={() => setSelectedIds([])}>
                            Clear
                        </button>
                    </div>
                )}

                {/* Grid View */}
                {viewMode === "grid" && (
                    <div className="lib-ads-grid">
                        {ads.map((ad, i) => (
                            <div
                                key={ad._id}
                                className={`lib-ad-card ${selectedIds.includes(ad._id) ? "lib-ad-card--selected" : ""}`}
                                onClick={() => setDetailId(ad._id)}
                            >
                                <div
                                    className="lib-ad-card__image"
                                    style={{
                                        background: ad.image ? `url(${ad.image}) center/cover` : `linear-gradient(135deg, ${BG[i % 6]}dd, ${BG[(i + 3) % 6]}aa)`,
                                    }}
                                >
                                    {!ad.image && <span className="lib-ad-card__placeholder">AD</span>}
                                    <div
                                        className={`lib-ad-card__select ${selectedIds.includes(ad._id) ? "lib-ad-card__select--checked" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelect(ad._id);
                                        }}
                                    >
                                        {selectedIds.includes(ad._id) ? "✓" : ""}
                                    </div>
                                </div>
                                <div className="lib-ad-card__info">
                                    <div className="lib-ad-card__name">{ad.name}</div>
                                    <div className="lib-ad-card__meta">
                                        <span className="lib-ad-card__date">{timeAgo(ad.created_at)}</span>
                                        <span
                                            className="lib-ad-card__brand"
                                            style={{ background: `${ad.brand_color}18`, color: ad.brand_color }}
                                        >
                                            {ad.brand_name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                    <div className="lib-ads-list">
                        {ads.map((ad, i) => (
                            <div
                                key={ad._id}
                                className={`lib-list-item ${selectedIds.includes(ad._id) ? "lib-list-item--selected" : ""}`}
                                onClick={() => setDetailId(ad._id)}
                            >
                                <div
                                    className={`lib-list-item__select ${selectedIds.includes(ad._id) ? "lib-list-item__select--checked" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelect(ad._id);
                                    }}
                                >
                                    {selectedIds.includes(ad._id) ? "✓" : ""}
                                </div>
                                <div
                                    className="lib-list-item__thumb"
                                    style={{
                                        background: ad.image ? `url(${ad.image}) center/cover` : `linear-gradient(135deg, ${BG[i % 6]}cc, ${BG[(i + 3) % 6]}88)`,
                                    }}
                                >
                                    {!ad.image && <span>AD</span>}
                                </div>
                                <div className="lib-list-item__info">
                                    <div className="lib-list-item__name">{ad.name}</div>
                                    <div className="lib-list-item__concept">{ad.concept_name}</div>
                                </div>
                                <span
                                    className="lib-list-item__brand"
                                    style={{ background: `${ad.brand_color}18`, color: ad.brand_color }}
                                >
                                    {ad.brand_name}
                                </span>
                                <span className="lib-list-item__date">{timeAgo(ad.created_at)}</span>
                                <div className="lib-list-item__actions">
                                    <button className="lib-list-item__action-btn">View</button>
                                    <button className="lib-list-item__action-btn">⤓</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && ads.length === 0 && (
                    <div className="lib-empty">
                        <div className="lib-empty__icon">🔍</div>
                        <div className="lib-empty__title">No ads found</div>
                        <div className="lib-empty__desc">Try adjusting your filters or search query.</div>
                    </div>
                )}
                {loading && (
                    <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Loading ads...</div>
                )}
            </div>

            {/* ===== DETAIL PANEL ===== */}
            {detailAd && (
                <div className="lib-detail-overlay" onClick={() => setDetailId(null)}>
                    <div className="lib-detail-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="lib-detail-panel__header">
                            <span className="lib-detail-panel__title">{detailAd.name}</span>
                            <button className="lib-detail-panel__close" onClick={() => setDetailId(null)}>
                                ×
                            </button>
                        </div>

                        <div
                            className="lib-detail-panel__preview"
                            style={{
                                background: detailAd.image ? `url(${detailAd.image}) center/contain no-repeat` : `linear-gradient(135deg, #eee, #ddd)`,
                            }}
                        >
                            {!detailAd.image && <span className="lib-detail-panel__preview-label">AD</span>}
                        </div>

                        <div className="lib-detail-panel__body">
                            <div className="lib-detail-panel__meta">
                                {[
                                    { label: "Brand", value: detailAd.brand_name },
                                    { label: "Concept", value: detailAd.concept_name },
                                    { label: "Date", value: timeAgo(detailAd.created_at) },
                                    { label: "Ratios", value: detailAd.ratios.join(", ") },
                                ].map((m) => (
                                    <div key={m.label}>
                                        <div className="detail-meta__label">{m.label}</div>
                                        <div className="detail-meta__value">{m.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="detail-actions">
                                <button className="detail-actions__btn detail-actions__btn--primary">
                                    ⤓ Download Ad
                                </button>
                                <div className="detail-actions__row">
                                    <button className="detail-actions__btn detail-actions__btn--secondary">
                                        Get All Ratios
                                    </button>
                                    <button className="detail-actions__btn detail-actions__btn--secondary">
                                        Fix Errors
                                    </button>
                                </div>
                                <div className="detail-actions__row">
                                    <button className="detail-actions__btn detail-actions__btn--secondary">
                                        ↻ Regenerate
                                    </button>
                                    <button
                                        className="detail-actions__btn detail-actions__btn--secondary"
                                        style={{
                                            borderColor: "rgba(245,158,11,0.27)",
                                            color: "var(--yellow)",
                                        }}
                                    >
                                        Buy Canva Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Library() {
    return (
        <AuthGuard>
            <LibraryPage />
        </AuthGuard>
    );
}
