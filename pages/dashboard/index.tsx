import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AuthGuard from "../../libs/auth/AuthGuard";
import { getMemberRequest, getUsageRequest, getBrandsRequest, getActivityRequest } from "../../server/user/login";
import { getRecentGenerationsRequest } from "../../server/user/generation";
import { getBrands, deleteBrand } from "../../server/user/brand";
import type { Brand } from "../../libs/types/brand.type";
import type { Member } from "../../libs/types/member.type";

const ROUTES: Record<string, string> = {
    dashboard: "/dashboard",
    generate: "/generateAds",
    library: "/adLibrary",
};

const BG = ["#1a3a4a", "#2a1a3a", "#1a2a3a", "#3a2a1a", "#1a3a2a", "#2a3a1a"];

const DEFAULT_ADS: RecentAd[] = [];
const DEFAULT_ACTIVITY: ActivityItem[] = [];

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", letter: "D" },
    { id: "generate", label: "Generate Ads", letter: "+", badge: "NEW" },
    { id: "library", label: "Ad Library", letter: "L" },
    { id: "brands", label: "Brands", letter: "B" },
    { id: "canva", label: "Canva Templates", letter: "C" },
];

const BOTTOM_NAV = [
    { id: "account", label: "Account", letter: "A" },
    { id: "billing", label: "Billing", letter: "$" },
];

interface UsageData {
    subscription_tier: string;
    subscription_status: string;
    credits_used: number;
    credits_limit: number;
    addon_credits_remaining: number;
    billing_cycle_start: string | null;
    billing_cycle_end: string | null;
    stats: {
        ads_generated: number;
        ads_saved: number;
        canva_templates: number;
    };
}

interface BrandItem {
    _id: string;
    name: string;
}

const INDUSTRY_LABELS: Record<string, string> = {
    ecommerce: "E-Commerce", supplements: "Supplements", apparel: "Apparel",
    beauty: "Beauty", food_beverage: "Food & Beverage", saas: "SaaS",
    fitness: "Fitness", home_goods: "Home Goods", pets: "Pets",
    financial_services: "Financial", education: "Education", other: "Other",
};

const BRAND_COLORS = ["#3ECFCF", "#22C55E", "#8B5CF6", "#F59E0B", "#EC4899", "#6366F1"];

interface RecentAd {
    _id: string;
    ad_name: string;
    image_url: string;
    created_at: string;
    brand_name: string;
    concept_name?: string;
}

interface ActivityItem {
    _id: string;
    label: string;
    sub: string;
    icon: string;
    created_at: string;
    amount?: number;
}

function tierLabel(tier: string): string {
    const map: Record<string, string> = { free: "Free", starter: "Starter", pro: "Pro", growth_engine: "Growth Engine" };
    return map[tier] || tier;
}

function daysUntil(dateStr: string | null): number {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function DashboardPage() {
    const router = useRouter();
    const [brandFilter, setBrandFilter] = useState("all");
    const [collapsed, setCollapsed] = useState(false);
    const [page, setPage] = useState("dashboard");

    // API state
    const [member, setMember] = useState<Member | null>(null);
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [brands, setBrands] = useState<BrandItem[]>([]);
    const [recentAds, setRecentAds] = useState<RecentAd[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Brands page state
    const [fullBrands, setFullBrands] = useState<Brand[]>([]);
    const [brandsLoading, setBrandsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Try localStorage first for instant display
                const stored = localStorage.getItem("se_member");
                if (stored) setMember(JSON.parse(stored));

                // Fetch fresh data in parallel
                // Fetch fresh data in parallel
                const [memberData, usageData, brandsData, adsData, activityData] = await Promise.allSettled([
                    getMemberRequest(),
                    getUsageRequest(),
                    getBrandsRequest(),
                    getRecentGenerationsRequest(),
                    getActivityRequest(),
                ]);

                if (memberData.status === "fulfilled") {
                    setMember(memberData.value as Member);
                    localStorage.setItem("se_member", JSON.stringify(memberData.value));
                }
                if (usageData.status === "fulfilled") setUsage(usageData.value as UsageData);
                if (brandsData.status === "fulfilled") {
                    const list = Array.isArray(brandsData.value) ? brandsData.value : (brandsData.value as any)?.list || [];
                    setBrands(list);
                }
                if (adsData.status === "fulfilled") setRecentAds(adsData.value);
                if (activityData.status === "fulfilled") setActivity(activityData.value);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    // Brands sahifasiga o'tganda — to'liq brand ma'lumotlarini yuklash
    useEffect(() => {
        if (page === "brands") {
            setBrandsLoading(true);
            getBrands(1, 100)
                .then((res) => setFullBrands(res.list))
                .catch(console.error)
                .finally(() => setBrandsLoading(false));
        }
    }, [page]);

    const handleDeleteBrand = async (id: string) => {
        if (!confirm("Do you want to delete this brand?")) return;
        setDeletingId(id);
        try {
            await deleteBrand(id);
            setFullBrands((prev) => prev.filter((b) => b._id !== id));
            setBrands((prev) => prev.filter((b) => b._id !== id));
        } catch (err) {
            console.error("Delete brand error:", err);
            alert("Brand o'chirishda xato yuz berdi");
        } finally {
            setDeletingId(null);
        }
    };

    const handleNav = (id: string) => {
        if (ROUTES[id]) {
            router.push(ROUTES[id]);
        } else {
            setPage(id);
        }
    };

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem("se_access_token");
        localStorage.removeItem("se_member");
        // Prevent back button from returning to protected page
        router.replace("/login");
    };

    // Derived values
    const userName = member?.full_name || "User";
    const userInitial = userName.charAt(0).toUpperCase();
    const tier = usage?.subscription_tier || "FREE";
    const remaining = usage ? usage.credits_limit - usage.credits_used : 0;
    const limit = usage?.credits_limit || 0;
    const pct = limit > 0 ? (remaining / limit) * 100 : 0;
    const renewDays = usage ? daysUntil(usage.billing_cycle_end) : 0;
    const filtered = brandFilter === "all" ? recentAds : recentAds.filter((a) => a.brand_name.toLowerCase().includes(brandFilter));
    const sw = collapsed ? 72 : 240;

    return (
        <div className="dashboard-layout">
            {/* ===== SIDEBAR ===== */}
            <div className="dash-sidebar" style={{ width: sw }}>
                {/* Logo */}
                <div
                    className="dash-sidebar__header"
                    style={{
                        padding: collapsed ? "20px 12px" : "20px",
                        justifyContent: collapsed ? "center" : "space-between",
                    }}
                >
                    {collapsed ? (
                        <div className="dash-sidebar__logo-icon" onClick={() => setCollapsed(false)}>
                            S
                        </div>
                    ) : (
                        <>
                            <span className="dash-sidebar__logo grad-text">Static Engine</span>
                            <div className="dash-sidebar__toggle" onClick={() => setCollapsed(true)}>
                                &laquo;
                            </div>
                        </>
                    )}
                </div>

                {/* Nav */}
                <div className="dash-sidebar__nav">
                    {NAV_ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className={`nav-item ${page === item.id ? "nav-item--active" : ""}`}
                            onClick={() => handleNav(item.id)}
                            style={{
                                padding: collapsed ? "11px 0" : "11px 14px",
                                justifyContent: collapsed ? "center" : "flex-start",
                            }}
                        >
                            <div className={`nav-item__icon ${page === item.id ? "nav-item__icon--active" : "nav-item__icon--inactive"}`}>
                                {item.letter}
                            </div>
                            {!collapsed && (
                                <span
                                    className="nav-item__label"
                                    style={{
                                        fontWeight: page === item.id ? 600 : 400,
                                        color: page === item.id ? "var(--text)" : "var(--muted)",
                                    }}
                                >
                                    {item.label}
                                </span>
                            )}
                            {!collapsed && item.badge && <span className="nav-item__badge">{item.badge}</span>}
                        </div>
                    ))}

                    <div className="dash-sidebar__spacer" />

                    {/* Credits */}
                    {!collapsed && (
                        <div className="credits-card">
                            <div className="credits-card__header">
                                <span className="credits-card__label">Credits</span>
                                <span className="credits-card__plan">{tierLabel(tier)}</span>
                            </div>
                            <div className="credits-card__amount">
                                <span className="credits-card__value">{remaining}</span>
                                <span className="credits-card__limit">/ {limit}</span>
                            </div>
                            <div className="credits-card__bar">
                                <div className="credits-card__bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="credits-card__renew">Renews in {renewDays} days</div>
                        </div>
                    )}

                    {/* Bottom nav */}
                    {BOTTOM_NAV.map((item) => (
                        <div
                            key={item.id}
                            className="nav-item"
                            onClick={() => setPage(item.id)}
                            style={{
                                padding: collapsed ? "10px 0" : "10px 14px",
                                justifyContent: collapsed ? "center" : "flex-start",
                            }}
                        >
                            <span style={{ fontSize: 13, width: 28, textAlign: "center", color: "var(--dim)", fontWeight: 600 }}>
                                {item.letter}
                            </span>
                            {!collapsed && <span style={{ fontSize: 13, color: "var(--dim)" }}>{item.label}</span>}
                        </div>
                    ))}

                    {/* Logout */}
                    <div
                        className="nav-item"
                        onClick={handleLogout}
                        style={{
                            padding: collapsed ? "10px 0" : "10px 14px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            cursor: "pointer",
                            marginTop: 4,
                        }}
                    >
                        <span style={{ fontSize: 13, width: 28, textAlign: "center", color: "#EF4444", fontWeight: 600 }}>
                            ⏻
                        </span>
                        {!collapsed && <span style={{ fontSize: 13, color: "#EF4444", fontWeight: 500 }}>Logout</span>}
                    </div>
                </div>

                {/* User */}
                <div
                    className="sidebar-user"
                    style={{
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "16px 0" : "16px",
                    }}
                >
                    <div className="sidebar-user__avatar">{userInitial}</div>
                    {!collapsed && (
                        <div>
                            <div className="sidebar-user__name">{userName}</div>
                            <div className="sidebar-user__plan">{tierLabel(tier)} Plan</div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="dash-main" style={{ marginLeft: sw }}>
                {/* Header */}
                <div className="dash-header">
                    <div>
                        <div className="dash-header__date">
                            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                        </div>
                        <div className="dash-header__title">
                            {page === "brands" ? "My Brands" : `Welcome back, ${userName.split(" ")[0]}`}
                        </div>
                    </div>
                    {page === "brands" ? (
                        <button className="btn-generate" onClick={() => router.push("/generateAds")}>
                            + Create New Brand
                        </button>
                    ) : (
                        <button className="btn-generate" onClick={() => router.push("/generateAds")}>+ Generate New Ad</button>
                    )}
                </div>

                {/* ===== BRANDS PAGE ===== */}
                {page === "brands" && (
                    <div className="brands-page">
                        {/* Stats Row */}
                        <div className="brands-page__stats">
                            <div className="brands-stat">
                                <span className="brands-stat__value" style={{ color: "var(--accent)" }}>{fullBrands.length}</span>
                                <span className="brands-stat__label">Total Brands</span>
                            </div>
                            <div className="brands-stat">
                                <span className="brands-stat__value" style={{ color: "var(--green)" }}>{usage?.stats?.ads_generated || 0}</span>
                                <span className="brands-stat__label">Ads Generated</span>
                            </div>
                            <div className="brands-stat">
                                <span className="brands-stat__value" style={{ color: "var(--g1)" }}>
                                    {[...new Set(fullBrands.map(b => b.industry))].length}
                                </span>
                                <span className="brands-stat__label">Industries</span>
                            </div>
                        </div>

                        {/* Brands Grid */}
                        {brandsLoading ? (
                            <div className="brands-page__loading">
                                <div className="brands-page__spinner" />
                                <span>Loading brands...</span>
                            </div>
                        ) : fullBrands.length === 0 ? (
                            <div className="brands-page__empty">
                                <div className="brands-page__empty-icon">B</div>
                                <h3>No brands yet</h3>
                                <p>Create your first brand to start generating ads</p>
                                <button className="btn-generate" onClick={() => router.push("/generateAds")}>
                                    + Create First Brand
                                </button>
                            </div>
                        ) : (
                            <div className="brands-grid">
                                {fullBrands.map((brand, i) => (
                                    <div key={brand._id} className="brand-card">
                                        {/* Card Header with gradient */}
                                        <div
                                            className="brand-card__header"
                                            style={{
                                                background: `linear-gradient(135deg, ${brand.primary_color || BRAND_COLORS[i % 6]}cc, ${brand.secondary_color || BRAND_COLORS[(i + 2) % 6]}88)`,
                                            }}
                                        >
                                            <div className="brand-card__logo">
                                                {brand.logo_url ? (
                                                    <img src={brand.logo_url} alt={brand.name} />
                                                ) : (
                                                    <span>{brand.name.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="brand-card__body">
                                            <h3 className="brand-card__name">{brand.name}</h3>
                                            <span className="brand-card__industry">
                                                {INDUSTRY_LABELS[brand.industry] || brand.industry}
                                            </span>
                                            {brand.description && (
                                                <p className="brand-card__desc">
                                                    {brand.description.length > 80
                                                        ? brand.description.slice(0, 80) + "..."
                                                        : brand.description}
                                                </p>
                                            )}

                                            {/* Colors */}
                                            <div className="brand-card__colors">
                                                {[brand.primary_color, brand.secondary_color, brand.accent_color, brand.background_color]
                                                    .filter(Boolean)
                                                    .map((color, ci) => (
                                                        <div
                                                            key={ci}
                                                            className="brand-card__color-dot"
                                                            style={{ backgroundColor: color }}
                                                            title={color}
                                                        />
                                                    ))}
                                            </div>

                                            {/* Voice tags */}
                                            {brand.voice_tags && brand.voice_tags.length > 0 && (
                                                <div className="brand-card__tags">
                                                    {brand.voice_tags.slice(0, 3).map((tag) => (
                                                        <span key={tag} className="brand-card__tag">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer */}
                                        <div className="brand-card__footer">
                                            <span className="brand-card__date">
                                                {new Date(brand.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="brand-card__actions">
                                                <button
                                                    className="brand-card__btn brand-card__btn--delete"
                                                    onClick={() => handleDeleteBrand(brand._id)}
                                                    disabled={deletingId === brand._id}
                                                >
                                                    {deletingId === brand._id ? "..." : "✕"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== DASHBOARD PAGE ===== */}
                {page === "dashboard" && (
                    <>
                        {/* Stats */}
                        <div className="stats-grid">
                            {[
                                { label: "CREDITS LEFT", val: String(remaining), sub: `of ${limit}`, color: "var(--accent)", bar: pct },
                                { label: "ADS GENERATED", val: String(usage?.stats?.ads_generated || 0), sub: "lifetime", color: "var(--g1)", trend: null },
                                { label: "ADS SAVED", val: String(usage?.stats?.ads_saved || 0), sub: "across brands", color: "var(--green)", trend: null },
                                { label: "CANVA TEMPLATES", val: String(usage?.stats?.canva_templates || 0), sub: "ready to use", color: "var(--yellow)", trend: null },
                            ].map((s: any, i) => (
                                <div key={i} className="stat-card">
                                    <div className="stat-card__label">{s.label}</div>
                                    <div className="stat-card__row">
                                        <span className="stat-card__value" style={{ color: s.color }}>{s.val}</span>
                                        <span className="stat-card__sub">{s.sub}</span>
                                    </div>
                                    {s.bar != null && (
                                        <div className="stat-card__bar">
                                            <div className="stat-card__bar-fill" style={{ width: `${s.bar}%` }} />
                                        </div>
                                    )}
                                    {s.trend && <div className="stat-card__trend">{s.trend}</div>}
                                </div>
                            ))}
                        </div>

                        {/* Grid: Ads + Sidebar */}
                        <div className="dash-grid">
                            {/* Recent Ads */}
                            <div className="recent-ads">
                                <div className="recent-ads__header">
                                    <span className="recent-ads__title">Recent Ads</span>
                                    <div className="recent-ads__filters">
                                        {[
                                            { id: "all", label: "All", color: "var(--accent)" },
                                            ...brands.map((b, i) => ({
                                                id: b.name.toLowerCase(),
                                                label: b.name,
                                                color: ["#3ECFCF", "#22C55E", "#F59E0B", "#8B5CF6", "#EC4899"][i % 5],
                                            })),
                                        ].map((b) => (
                                            <button
                                                key={b.id}
                                                className={`brand-filter-btn ${brandFilter === b.id ? "brand-filter-btn--active" : ""}`}
                                                onClick={() => setBrandFilter(b.id)}
                                                style={{
                                                    background: brandFilter === b.id ? `${b.color}22` : undefined,
                                                    color: brandFilter === b.id ? b.color : undefined,
                                                }}
                                            >
                                                {b.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="ads-grid">
                                    {recentAds.length > 0 ? (
                                        recentAds
                                            .filter(ad => brandFilter === "all" || ad.brand_name.toLowerCase() === brandFilter)
                                            .slice(0, 6)
                                            .map((ad, i) => (
                                                <div key={ad._id} className="ad-card">
                                                    <div
                                                        className="ad-card__image"
                                                        style={{
                                                            background: ad.image_url ? `url(${ad.image_url}) center/cover` : `linear-gradient(135deg, ${BG[i % 6]}dd, ${BG[(i + 3) % 6]}aa)`,
                                                        }}
                                                    >
                                                        {!ad.image_url && <span className="ad-card__placeholder">AD</span>}
                                                        <div className="ad-card__overlay">
                                                            <button className="btn-view-ad">View</button>
                                                            <button className="btn-dl">DL</button>
                                                        </div>
                                                    </div>
                                                    <div className="ad-card__info">
                                                        <div className="ad-card__name">{ad.ad_name}</div>
                                                        <div className="ad-card__meta">
                                                            <span className="ad-card__date">{timeAgo(ad.created_at)}</span>
                                                            <span
                                                                className="ad-card__brand"
                                                                style={{
                                                                    background: "#3ECFCF18",
                                                                    color: "#3ECFCF",
                                                                }}
                                                            >
                                                                {ad.brand_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div style={{ color: "var(--muted)", fontStyle: "italic", padding: 20 }}>No ads generated yet.</div>
                                    )}
                                </div>

                                <div className="view-all-link" onClick={() => router.push("/adLibrary")} style={{ cursor: "pointer" }}>View all ads in library</div>
                            </div>

                            {/* Right sidebar */}
                            <div className="dash-right">
                                {/* Quick Actions */}
                                <div className="quick-actions">
                                    <div className="quick-actions__title">Quick Actions</div>
                                    {[
                                        { label: "Generate New Ad", desc: "5 credits per generation", letter: "+", primary: true },
                                        { label: "Create New Brand", desc: "Set up a brand profile", letter: "B", primary: false },
                                        { label: "Buy More Credits", desc: "100 credits for $15", letter: "$", primary: false },
                                    ].map((a, i) => (
                                        <div
                                            key={i}
                                            className={`action-item ${a.primary ? "action-item--primary" : ""}`}
                                            style={{ marginBottom: i < 2 ? 6 : 0 }}
                                        >
                                            <div className={`action-item__icon ${a.primary ? "action-item__icon--primary" : "action-item__icon--default"}`}>
                                                {a.letter}
                                            </div>
                                            <div>
                                                <div className="action-item__label" style={{ color: a.primary ? "var(--text)" : "var(--muted)" }}>
                                                    {a.label}
                                                </div>
                                                <div className="action-item__desc">{a.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Activity */}
                                <div className="activity-card">
                                    <div className="activity-card__title">Recent Activity</div>
                                    {activity.length > 0 ? (
                                        activity.map((item, i) => (
                                            <div key={item._id} className="activity-item">
                                                <div className="activity-item__icon">{item.icon}</div>
                                                <div className="activity-item__body">
                                                    <div className="activity-item__action">{item.label}</div>
                                                    <div className="activity-item__detail">{item.sub}</div>
                                                </div>
                                                <span className="activity-item__time">{timeAgo(item.created_at)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: 16, color: "var(--muted)", fontSize: 13 }}>No recent activity.</div>
                                    )}
                                </div>

                                {/* Tip */}
                                <div className="tip-card">
                                    <div className="tip-card__label">Tip of the day</div>
                                    <div className="tip-card__title">Try &quot;Feature Pointers&quot; for supplements</div>
                                    <div className="tip-card__desc">
                                        Brands in your space see 2.3x higher CTR with feature pointer ads that highlight specific product benefits.
                                    </div>
                                    <button className="tip-card__btn">Try this concept</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <AuthGuard>
            <DashboardPage />
        </AuthGuard>
    );
}
