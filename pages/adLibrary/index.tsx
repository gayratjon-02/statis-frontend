import React, { useState } from "react";
import AuthGuard from "../../libs/auth/AuthGuard";

const BG = ["#1a3a4a", "#2a1a3a", "#1a2a3a", "#3a2a1a", "#1a3a2a", "#2a3a1a"];

const BRANDS = [
    { id: 1, name: "Bron", color: "#3ECFCF", count: 24 },
    { id: 2, name: "Fairway Fuel", color: "#22C55E", count: 13 },
];

const FOLDERS = [
    { id: 1, name: "Deodorant", icon: "📁", count: 18 },
    { id: 2, name: "Makeup", icon: "📁", count: 6 },
    { id: 3, name: "Pre-Round Chews", icon: "📁", count: 8 },
    { id: 4, name: "Protein Bars", icon: "📁", count: 5 },
];

const CONCEPTS = ["All", "Feature Pointers", "Testimonial", "Before & After", "Us vs Them", "Social Proof", "Stat Callout"];

const MOCK_ADS = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    name: `Ad Variation ${i + 1}`,
    brand: i % 3 === 0 ? "Fairway Fuel" : "Bron",
    brandColor: i % 3 === 0 ? "#22C55E" : "#3ECFCF",
    concept: CONCEPTS[1 + (i % (CONCEPTS.length - 1))],
    date: `${1 + (i % 7)} days ago`,
    canva: i < 3 ? "ready" : i < 5 ? "pending" : "none",
    saved: i < 8,
    ratios: i % 2 === 0 ? ["1:1", "9:16", "16:9"] : ["1:1"],
}));

function LibraryPage() {
    const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
    const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
    const [conceptFilter, setConceptFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [detailId, setDetailId] = useState<number | null>(null);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const filtered = MOCK_ADS.filter((ad) => {
        if (selectedBrand && !BRANDS.find((b) => b.id === selectedBrand && b.name === ad.brand)) return false;
        if (conceptFilter !== "All" && ad.concept !== conceptFilter) return false;
        if (search && !ad.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const detailAd = detailId != null ? MOCK_ADS.find((a) => a.id === detailId) : null;

    return (
        <div className="library-layout">
            {/* ===== LEFT PANEL ===== */}
            <div className="lib-panel">
                <div className="lib-panel__header">
                    <span className="lib-panel__logo grad-text">Library</span>
                </div>

                {/* Brands */}
                <div className="panel-section">
                    <div className="panel-section__header">
                        <span className="panel-section__title">Brands</span>
                        <button className="panel-section__action">+</button>
                    </div>
                    <div
                        className={`panel-item ${!selectedBrand ? "panel-item--active" : ""}`}
                        onClick={() => setSelectedBrand(null)}
                        style={{
                            background: !selectedBrand ? "rgba(62,207,207,0.05)" : "transparent",
                        }}
                    >
                        <span className="panel-item__icon">⊞</span>
                        <span className="panel-item__label" style={{ fontWeight: !selectedBrand ? 600 : 400, color: !selectedBrand ? "var(--text)" : "var(--muted)" }}>
                            All Brands
                        </span>
                        <span className="panel-item__count">{MOCK_ADS.length}</span>
                    </div>
                    {BRANDS.map((b) => (
                        <div
                            key={b.id}
                            className={`panel-item ${selectedBrand === b.id ? "panel-item--active" : ""}`}
                            onClick={() => setSelectedBrand(selectedBrand === b.id ? null : b.id)}
                            style={{
                                background: selectedBrand === b.id ? `${b.color}0a` : "transparent",
                            }}
                        >
                            <span className="panel-item__dot" style={{ background: b.color }} />
                            <span className="panel-item__label" style={{ fontWeight: selectedBrand === b.id ? 600 : 400, color: selectedBrand === b.id ? "var(--text)" : "var(--muted)" }}>
                                {b.name}
                            </span>
                            <span className="panel-item__count">{b.count}</span>
                        </div>
                    ))}
                </div>

                <hr className="panel-divider" />

                {/* Folders */}
                <div className="panel-section">
                    <div className="panel-section__header">
                        <span className="panel-section__title">Products</span>
                        <button className="panel-section__action">+</button>
                    </div>
                    {FOLDERS.map((f) => (
                        <div
                            key={f.id}
                            className={`panel-item ${selectedFolder === f.id ? "panel-item--active" : ""}`}
                            onClick={() => setSelectedFolder(selectedFolder === f.id ? null : f.id)}
                            style={{
                                background: selectedFolder === f.id ? "rgba(62,207,207,0.05)" : "transparent",
                            }}
                        >
                            <span className="panel-item__icon">{f.icon}</span>
                            <span className="panel-item__label" style={{ fontWeight: selectedFolder === f.id ? 600 : 400, color: selectedFolder === f.id ? "var(--text)" : "var(--muted)" }}>
                                {f.name}
                            </span>
                            <span className="panel-item__count">{f.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="lib-main">
                {/* Top Bar */}
                <div className="lib-topbar">
                    <div className="lib-topbar__title-area">
                        <div className="lib-topbar__title">
                            {selectedBrand ? BRANDS.find((b) => b.id === selectedBrand)?.name : "All"} Ads
                        </div>
                        <div className="lib-topbar__path">
                            Library {selectedBrand ? ` / ${BRANDS.find((b) => b.id === selectedBrand)?.name}` : ""}
                            {selectedFolder ? ` / ${FOLDERS.find((f) => f.id === selectedFolder)?.name}` : ""}
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
                        {filtered.map((ad) => (
                            <div
                                key={ad.id}
                                className={`lib-ad-card ${selectedIds.includes(ad.id) ? "lib-ad-card--selected" : ""}`}
                                onClick={() => setDetailId(ad.id)}
                            >
                                <div
                                    className="lib-ad-card__image"
                                    style={{
                                        background: `linear-gradient(135deg, ${BG[ad.id % 6]}dd, ${BG[(ad.id + 3) % 6]}aa)`,
                                    }}
                                >
                                    <span className="lib-ad-card__placeholder">AD</span>
                                    <div
                                        className={`lib-ad-card__select ${selectedIds.includes(ad.id) ? "lib-ad-card__select--checked" : ""}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSelect(ad.id);
                                        }}
                                    >
                                        {selectedIds.includes(ad.id) ? "✓" : ""}
                                    </div>
                                    {ad.canva !== "none" && (
                                        <div
                                            className="lib-ad-card__canva-badge"
                                            style={{
                                                background: ad.canva === "ready" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                                                color: ad.canva === "ready" ? "var(--green)" : "var(--yellow)",
                                            }}
                                        >
                                            {ad.canva === "ready" ? "CANVA ✓" : "PENDING"}
                                        </div>
                                    )}
                                </div>
                                <div className="lib-ad-card__info">
                                    <div className="lib-ad-card__name">{ad.name}</div>
                                    <div className="lib-ad-card__meta">
                                        <span className="lib-ad-card__date">{ad.date}</span>
                                        <span
                                            className="lib-ad-card__brand"
                                            style={{ background: `${ad.brandColor}18`, color: ad.brandColor }}
                                        >
                                            {ad.brand}
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
                        {filtered.map((ad) => (
                            <div
                                key={ad.id}
                                className={`lib-list-item ${selectedIds.includes(ad.id) ? "lib-list-item--selected" : ""}`}
                                onClick={() => setDetailId(ad.id)}
                            >
                                <div
                                    className={`lib-list-item__select ${selectedIds.includes(ad.id) ? "lib-list-item__select--checked" : ""}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSelect(ad.id);
                                    }}
                                >
                                    {selectedIds.includes(ad.id) ? "✓" : ""}
                                </div>
                                <div
                                    className="lib-list-item__thumb"
                                    style={{
                                        background: `linear-gradient(135deg, ${BG[ad.id % 6]}cc, ${BG[(ad.id + 3) % 6]}88)`,
                                    }}
                                >
                                    <span>AD</span>
                                </div>
                                <div className="lib-list-item__info">
                                    <div className="lib-list-item__name">{ad.name}</div>
                                    <div className="lib-list-item__concept">{ad.concept}</div>
                                </div>
                                <span
                                    className="lib-list-item__brand"
                                    style={{ background: `${ad.brandColor}18`, color: ad.brandColor }}
                                >
                                    {ad.brand}
                                </span>
                                <span className="lib-list-item__date">{ad.date}</span>
                                <div className="lib-list-item__actions">
                                    <button className="lib-list-item__action-btn">View</button>
                                    <button className="lib-list-item__action-btn">⤓</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {filtered.length === 0 && (
                    <div className="lib-empty">
                        <div className="lib-empty__icon">🔍</div>
                        <div className="lib-empty__title">No ads found</div>
                        <div className="lib-empty__desc">Try adjusting your filters or search query.</div>
                    </div>
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
                                background: `linear-gradient(135deg, ${BG[detailAd.id % 6]}dd, ${BG[(detailAd.id + 3) % 6]}aa)`,
                            }}
                        >
                            <span className="lib-detail-panel__preview-label">AD</span>
                        </div>

                        <div className="lib-detail-panel__body">
                            <div className="lib-detail-panel__meta">
                                {[
                                    { label: "Brand", value: detailAd.brand },
                                    { label: "Concept", value: detailAd.concept },
                                    { label: "Date", value: detailAd.date },
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
