import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import AdminGuard from "../../../libs/auth/AdminGuard";
import { useAdminAuth } from "../../../libs/hooks/useAdminAuth";
import { getConcepts, getRecommendedConcepts } from "../../../server/admin/admnGetApis";
import { deleteConcept, createConcept, uploadConceptImage, updateConcept } from "../../../server/admin/adminPostApis";
import type { AdConcept } from "../../../libs/types/concept.type";
import { ConceptCategory } from "../../../libs/types/concept.type";
import API_BASE_URL from "../../../libs/config/api.config";

/** Prepend API base URL to relative image paths */
function resolveImageUrl(url?: string): string {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
}

// ── Nav items ──
const NAV_ITEMS = [
    { icon: "📊", label: "Dashboard", id: "dashboard" },
    { icon: "🎨", label: "Concepts", id: "concepts" },
    { icon: "⭐", label: "Recommended", id: "recommended" },
];

// ── Category labels for filters ──
const CATEGORIES: { value: string; label: string }[] = [
    { value: "", label: "All" },
    ...Object.values(ConceptCategory).map((c) => ({
        value: c,
        label: c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    })),
];

function AdminDashboard() {
    const router = useRouter();
    const { session, logout } = useAdminAuth();

    // ── State ──
    const [activeNav, setActiveNav] = useState("dashboard");
    const [concepts, setConcepts] = useState<AdConcept[]>([]);
    const [recommended, setRecommended] = useState<AdConcept[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [page, setPage] = useState(1);

    // ── Create Concept Modal ──
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState("");
    const [newName, setNewName] = useState("");
    const [newCategory, setNewCategory] = useState<ConceptCategory>(ConceptCategory.SOCIAL_PROOF);
    const [newDescription, setNewDescription] = useState("");
    const [newTags, setNewTags] = useState("");
    const [newSourceUrl, setNewSourceUrl] = useState("");
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newImagePreview, setNewImagePreview] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Fetch concepts ──
    const fetchConcepts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getConcepts({ search, category, page, limit: 12 });
            setConcepts(res.list || []);
            setTotal(res.total || 0);
        } catch (err: any) {
            setError(err.message || "Failed to load concepts");
            setConcepts([]);
        } finally {
            setLoading(false);
        }
    }, [search, category, page]);

    // ── Fetch recommended ──
    const fetchRecommended = useCallback(async () => {
        try {
            const res = await getRecommendedConcepts();
            setRecommended(res || []);
        } catch {
            setRecommended([]);
        }
    }, []);

    useEffect(() => {
        fetchConcepts();
        fetchRecommended();
    }, [fetchConcepts, fetchRecommended]);

    // ── Delete concept ──
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This action cannot be undone.`)) return;
        try {
            await deleteConcept(id);
            fetchConcepts();
            fetchRecommended();
        } catch (err: any) {
            alert(err.message || "Failed to delete concept");
        }
    };

    // ── Toggle visibility (active/inactive) ──
    const handleToggleVisibility = async (concept: AdConcept) => {
        try {
            await updateConcept(concept._id, { is_active: !concept.is_active });
            fetchConcepts();
            fetchRecommended();
        } catch (err: any) {
            alert(err.message || "Failed to toggle visibility");
        }
    };

    // ── Create concept ──
    const resetModal = () => {
        setNewName("");
        setNewCategory(ConceptCategory.SOCIAL_PROOF);
        setNewDescription("");
        setNewTags("");
        setNewSourceUrl("");
        setNewImageFile(null);
        setNewImagePreview("");
        setModalError("");
        setModalLoading(false);
    };

    const openModal = () => {
        resetModal();
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        resetModal();
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setNewImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setNewImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleCreateConcept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) { setModalError("Name is required"); return; }
        if (!newImageFile) { setModalError("Image is required"); return; }

        const tags = newTags.split(",").map((t) => t.trim()).filter(Boolean);
        if (tags.length === 0) { setModalError("At least 1 tag is required"); return; }

        setModalLoading(true);
        setModalError("");

        try {
            // 1. Upload image
            const uploadRes = await uploadConceptImage(newImageFile);

            // 2. Create concept

            await createConcept({
                name: newName.trim(),
                category: newCategory,
                description: newDescription.trim() || "",
                image_url: uploadRes.image_url,
                tags,
                source_url: newSourceUrl.trim() || undefined,
                is_active: true,
            });

            closeModal();
            fetchConcepts();
            fetchRecommended();
        } catch (err: any) {
            setModalError(err.message || "Failed to create concept");
        } finally {
            setModalLoading(false);
        }
    };

    // ── Logout ──
    const handleLogout = () => {
        logout();
        router.replace("/_admin/login");
    };

    // ── Stats ──
    const activeCount = concepts.filter((c) => c.is_active).length;
    const categoryCounts = concepts.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

    return (
        <div className="admin-dash">
            {/* ── Sidebar ── */}
            <aside className="admin-dash__sidebar">
                <div className="admin-dash__logo">
                    <span className="admin-dash__logo-icon">⚡</span>
                    <span className="admin-dash__logo-text">Static Engine</span>
                    <span className="admin-dash__logo-badge">Admin</span>
                </div>

                <nav className="admin-dash__nav">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`admin-dash__nav-item ${activeNav === item.id ? "admin-dash__nav-item--active" : ""}`}
                            onClick={() => setActiveNav(item.id)}
                        >
                            <span className="admin-dash__nav-icon">{item.icon}</span>
                            {item.label}
                            <span className="admin-dash__nav-dot" />
                        </button>
                    ))}
                </nav>

                <div className="admin-dash__sidebar-footer">
                    <div className="admin-dash__user-info">
                        <div className="admin-dash__avatar">
                            {session?.admin?.name?.charAt(0)?.toUpperCase() || "A"}
                        </div>
                        <div>
                            <div className="admin-dash__user-name">{session?.admin?.name || "Admin"}</div>
                            <div className="admin-dash__user-role">{session?.admin?.role || "ADMIN"}</div>
                        </div>
                    </div>
                    <button className="admin-dash__logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="admin-dash__main">
                {/* Header */}
                <div className="admin-dash__header">
                    <div>
                        <h1 className="admin-dash__title">
                            {activeNav === "dashboard" && "Dashboard"}
                            {activeNav === "concepts" && "Concept Library"}
                            {activeNav === "recommended" && "Recommended Concepts"}
                        </h1>
                        <p className="admin-dash__subtitle">
                            {activeNav === "dashboard" && "Overview of your concept library and platform"}
                            {activeNav === "concepts" && "Manage, search, and organize ad concepts"}
                            {activeNav === "recommended" && "Top performing concepts by usage"}
                        </p>
                    </div>
                </div>

                {/* ── Dashboard View ── */}
                {activeNav === "dashboard" && (
                    <>
                        {/* Stats */}
                        <div className="admin-dash__stats">
                            <div className="admin-dash__stat-card">
                                <div className="admin-dash__stat-top">
                                    <div className="admin-dash__stat-icon admin-dash__stat-icon--blue">📦</div>
                                    <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">library</span>
                                </div>
                                <div className="admin-dash__stat-value">{total}</div>
                                <div className="admin-dash__stat-label">Total Concepts</div>
                            </div>
                            <div className="admin-dash__stat-card">
                                <div className="admin-dash__stat-top">
                                    <div className="admin-dash__stat-icon admin-dash__stat-icon--green">✅</div>
                                    <span className="admin-dash__stat-trend admin-dash__stat-trend--up">active</span>
                                </div>
                                <div className="admin-dash__stat-value">{activeCount}</div>
                                <div className="admin-dash__stat-label">Active Concepts</div>
                            </div>
                            <div className="admin-dash__stat-card">
                                <div className="admin-dash__stat-top">
                                    <div className="admin-dash__stat-icon admin-dash__stat-icon--purple">🏷️</div>
                                    <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">types</span>
                                </div>
                                <div className="admin-dash__stat-value">{Object.keys(categoryCounts).length}</div>
                                <div className="admin-dash__stat-label">Categories Used</div>
                            </div>
                            <div className="admin-dash__stat-card">
                                <div className="admin-dash__stat-top">
                                    <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">🔥</div>
                                    <span className="admin-dash__stat-trend admin-dash__stat-trend--up">top</span>
                                </div>
                                <div className="admin-dash__stat-value" style={{ fontSize: 16 }}>
                                    {topCategory
                                        ? topCategory[0].replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
                                        : "—"}
                                </div>
                                <div className="admin-dash__stat-label">Top Category</div>
                            </div>
                        </div>

                        {/* Recommended */}
                        <div className="admin-dash__section">
                            <div className="admin-dash__section-header">
                                <div className="admin-dash__section-title">
                                    ⭐ Recommended Concepts
                                    <span className="admin-dash__section-count">{recommended.length}</span>
                                </div>
                                <button
                                    className="admin-dash__btn admin-dash__btn--ghost"
                                    onClick={() => setActiveNav("recommended")}
                                >
                                    View All →
                                </button>
                            </div>
                            {recommended.length > 0 ? (
                                <div className="admin-dash__recommended">
                                    {recommended.map((c) => (
                                        <div key={c._id} className="admin-dash__rec-card">
                                            <img
                                                src={resolveImageUrl(c.image_url)}
                                                alt={c.name}
                                                className="admin-dash__rec-img"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                            <div className="admin-dash__rec-body">
                                                <div className="admin-dash__rec-name">{c.name}</div>
                                                <div className="admin-dash__rec-usage">
                                                    {c.usage_count} uses
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="admin-dash__empty">
                                    <div className="admin-dash__empty-icon">⭐</div>
                                    <div className="admin-dash__empty-text">No recommended concepts yet</div>
                                    <div className="admin-dash__empty-hint">Concepts with usage will appear here</div>
                                </div>
                            )}
                        </div>

                        {/* Recent Concepts */}
                        <div className="admin-dash__section">
                            <div className="admin-dash__section-header">
                                <div className="admin-dash__section-title">
                                    🎨 Recent Concepts
                                    <span className="admin-dash__section-count">{total}</span>
                                </div>
                                <button
                                    className="admin-dash__btn admin-dash__btn--ghost"
                                    onClick={() => setActiveNav("concepts")}
                                >
                                    Manage All →
                                </button>
                            </div>
                            {renderConceptGrid()}
                        </div>
                    </>
                )}

                {/* ── Concepts View ── */}
                {activeNav === "concepts" && (
                    <div className="admin-dash__section">
                        <div className="admin-dash__section-header">
                            <div className="admin-dash__section-title">
                                🎨 All Concepts
                                <span className="admin-dash__section-count">{total}</span>
                            </div>
                            <div className="admin-dash__section-actions">
                                <button className="admin-dash__btn admin-dash__btn--primary" onClick={openModal}>
                                    ＋ Add Concept
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="admin-dash__search">
                            <input
                                className="admin-dash__search-input"
                                placeholder="Search concepts by name..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                            />
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    className={`admin-dash__filter-btn ${category === cat.value ? "admin-dash__filter-btn--active" : ""}`}
                                    onClick={() => {
                                        setCategory(cat.value);
                                        setPage(1);
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {renderConceptGrid()}

                        {/* Pagination */}
                        {total > 12 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "16px 0" }}>
                                <button
                                    className="admin-dash__btn admin-dash__btn--ghost"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    ← Previous
                                </button>
                                <span style={{ padding: "8px 14px", fontSize: 13, color: "var(--muted)" }}>
                                    Page {page} of {Math.ceil(total / 12)}
                                </span>
                                <button
                                    className="admin-dash__btn admin-dash__btn--ghost"
                                    disabled={page >= Math.ceil(total / 12)}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Recommended View ── */}
                {activeNav === "recommended" && (
                    <div className="admin-dash__section">
                        <div className="admin-dash__section-header">
                            <div className="admin-dash__section-title">
                                ⭐ Top Concepts by Usage
                                <span className="admin-dash__section-count">{recommended.length}</span>
                            </div>
                            <button className="admin-dash__btn admin-dash__btn--ghost" onClick={fetchRecommended}>
                                🔄 Refresh
                            </button>
                        </div>
                        {recommended.length > 0 ? (
                            <div className="admin-dash__grid">
                                {recommended.map((c) => (
                                    <div key={c._id} className="admin-dash__concept-card">
                                        <img
                                            src={resolveImageUrl(c.image_url)}
                                            alt={c.name}
                                            className="admin-dash__concept-img"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                        <div className="admin-dash__concept-body">
                                            <div className="admin-dash__concept-category">
                                                {c.category?.replace(/_/g, " ")}
                                            </div>
                                            <div className="admin-dash__concept-name">{c.name}</div>
                                            <div className="admin-dash__concept-meta">
                                                <span className="admin-dash__concept-usage">
                                                    🔥 {c.usage_count} uses
                                                </span>
                                                <span
                                                    className={`admin-dash__concept-status ${c.is_active ? "admin-dash__concept-status--active" : "admin-dash__concept-status--inactive"}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="admin-dash__empty">
                                <div className="admin-dash__empty-icon">⭐</div>
                                <div className="admin-dash__empty-text">No recommended concepts</div>
                                <div className="admin-dash__empty-hint">
                                    Concepts will be ranked by usage_count
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ── Create Concept Modal ── */}
            {showModal && (
                <div className="admin-modal__overlay" onClick={closeModal}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal__header">
                            <h2 className="admin-modal__title">🎨 Add New Concept</h2>
                            <button className="admin-modal__close" onClick={closeModal}>✕</button>
                        </div>

                        {modalError && (
                            <div className="admin-modal__error">⚠️ {modalError}</div>
                        )}

                        <form className="admin-modal__form" onSubmit={handleCreateConcept}>
                            {/* Image Upload */}
                            <div className="admin-modal__upload" onClick={() => fileInputRef.current?.click()}>
                                {newImagePreview ? (
                                    <img src={newImagePreview} alt="Preview" className="admin-modal__upload-preview" />
                                ) : (
                                    <div className="admin-modal__upload-placeholder">
                                        <span className="admin-modal__upload-icon">📷</span>
                                        <span className="admin-modal__upload-text">Click to upload image</span>
                                        <span className="admin-modal__upload-hint">PNG, JPG, WEBP — max 10MB</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handleImageSelect}
                                    style={{ display: "none" }}
                                />
                            </div>

                            {/* Name */}
                            <div className="admin-modal__field">
                                <label className="admin-modal__label">Name *</label>
                                <input
                                    className="admin-modal__input"
                                    placeholder="e.g. Bold Social Proof Banner"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                />
                            </div>

                            {/* Category */}
                            <div className="admin-modal__field">
                                <label className="admin-modal__label">Category *</label>
                                <select
                                    className="admin-modal__input admin-modal__select"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value as ConceptCategory)}
                                >
                                    {Object.values(ConceptCategory).map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div className="admin-modal__field">
                                <label className="admin-modal__label">Description</label>
                                <textarea
                                    className="admin-modal__input admin-modal__textarea"
                                    placeholder="Describe the concept style and when to use it..."
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {/* Tags */}
                            <div className="admin-modal__field">
                                <label className="admin-modal__label">Tags</label>
                                <input
                                    className="admin-modal__input"
                                    placeholder="tag1, tag2, tag3 (comma-separated)"
                                    value={newTags}
                                    onChange={(e) => setNewTags(e.target.value)}
                                />
                            </div>

                            {/* Source URL */}
                            <div className="admin-modal__field">
                                <label className="admin-modal__label">Source URL</label>
                                <input
                                    className="admin-modal__input"
                                    placeholder="https://example.com/inspiration"
                                    value={newSourceUrl}
                                    onChange={(e) => setNewSourceUrl(e.target.value)}
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="admin-modal__submit"
                                disabled={modalLoading}
                            >
                                {modalLoading ? (
                                    <>
                                        <span className="admin-dash__spinner" /> Creating...
                                    </>
                                ) : (
                                    "Create Concept"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    // ── Render helpers ──
    function renderConceptGrid() {
        if (loading) {
            return (
                <div className="admin-dash__loading">
                    <span className="admin-dash__spinner" />
                    Loading concepts...
                </div>
            );
        }

        if (error) {
            return <div className="admin-dash__error">⚠️ {error}</div>;
        }

        if (concepts.length === 0) {
            return (
                <div className="admin-dash__empty">
                    <div className="admin-dash__empty-icon">🎨</div>
                    <div className="admin-dash__empty-text">No concepts found</div>
                    <div className="admin-dash__empty-hint">
                        {search || category ? "Try different filters" : "Create your first concept to get started"}
                    </div>
                </div>
            );
        }

        return (
            <div className="admin-dash__grid">
                {concepts.map((c) => (
                    <div key={c._id} className={`admin-dash__concept-card ${!c.is_active ? "admin-dash__concept-card--inactive" : ""}`}>
                        <img
                            src={resolveImageUrl(c.image_url)}
                            alt={c.name}
                            className="admin-dash__concept-img"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                        <div className="admin-dash__concept-body">
                            <div className="admin-dash__concept-category">
                                {c.category?.replace(/_/g, " ")}
                            </div>
                            <div className="admin-dash__concept-name">{c.name}</div>
                            <div className="admin-dash__concept-meta">
                                <span className="admin-dash__concept-usage">
                                    {c.usage_count} uses
                                </span>
                                <span
                                    className={`admin-dash__concept-status ${c.is_active ? "admin-dash__concept-status--active" : "admin-dash__concept-status--inactive"}`}
                                />
                            </div>
                            {c.tags?.length > 0 && (
                                <div className="admin-dash__concept-tags">
                                    {c.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="admin-dash__concept-tag">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                                <button
                                    className={`admin-dash__btn ${c.is_active ? "admin-dash__btn--ghost" : "admin-dash__btn--primary"}`}
                                    style={{ flex: 1, padding: "5px 8px", fontSize: 11 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleVisibility(c);
                                    }}
                                >
                                    {c.is_active ? "👁 Hide" : "👁‍🗨 Show"}
                                </button>
                                <button
                                    className="admin-dash__btn admin-dash__btn--ghost"
                                    style={{ flex: 1, padding: "5px 8px", fontSize: 11 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(c._id, c.name);
                                    }}
                                >
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

// ── Protected wrapper ──
export default function ProtectedAdminHomepage() {
    return (
        <AdminGuard>
            <AdminDashboard />
        </AdminGuard>
    );
}
