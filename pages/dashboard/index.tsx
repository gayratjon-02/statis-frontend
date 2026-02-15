import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AuthGuard from "../../libs/auth/AuthGuard";
import { getMemberRequest, getUsageRequest, getBrandsRequest } from "../../server/user/login";
import type { Member } from "../../libs/types/member.type";

const ROUTES: Record<string, string> = {
    dashboard: "/dashboard",
    generate: "/generateAds",
    library: "/adLibrary",
};

const BG = ["#1a3a4a", "#2a1a3a", "#1a2a3a", "#3a2a1a", "#1a3a2a", "#2a3a1a"];

const ADS = [
    { id: 1, name: "Bron Deodorant - Feature Pointers", brand: "Bron", date: "2 hours ago", ratios: ["1:1"] },
    { id: 2, name: "Bron Deodorant - Testimonial", brand: "Bron", date: "Yesterday", ratios: ["1:1", "9:16", "16:9"] },
    { id: 3, name: "Fairway Fuel - Social Proof", brand: "Fairway Fuel", date: "2 days ago", ratios: ["1:1", "9:16"] },
    { id: 4, name: "Bron Makeup - Before & After", brand: "Bron", date: "3 days ago", ratios: ["1:1"] },
    { id: 5, name: "Fairway Fuel - Stat Callout", brand: "Fairway Fuel", date: "4 days ago", ratios: ["1:1", "16:9"] },
    { id: 6, name: "Bron Deodorant - Us vs Them", brand: "Bron", date: "5 days ago", ratios: ["1:1"] },
];

const ACTIVITY = [
    { action: "Generated 6 ads", detail: "Bron Deodorant - Feature Pointers", time: "2h ago", letter: "G" },
    { action: "Saved variation #3", detail: "Bron Deodorant - Testimonial", time: "1d ago", letter: "S" },
    { action: "Exported all ratios", detail: "Fairway Fuel - Social Proof", time: "2d ago", letter: "E" },
    { action: "Bought Canva template", detail: "Bron Makeup - Before & After", time: "3d ago", letter: "C" },
    { action: "Created new product", detail: "Fairway Fuel Pre-Round Chews", time: "4d ago", letter: "P" },
];

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
}

interface BrandItem {
    _id: string;
    brand_name: string;
}

function tierLabel(tier: string): string {
    const map: Record<string, string> = { FREE: "Free", STARTER: "Starter", PRO: "Pro", GROWTH_ENGINE: "Growth Engine" };
    return map[tier] || tier;
}

function daysUntil(dateStr: string | null): number {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Try localStorage first for instant display
                const stored = localStorage.getItem("se_member");
                if (stored) setMember(JSON.parse(stored));

                // Fetch fresh data in parallel
                const [memberData, usageData, brandsData] = await Promise.allSettled([
                    getMemberRequest(),
                    getUsageRequest(),
                    getBrandsRequest(),
                ]);

                if (memberData.status === "fulfilled") {
                    setMember(memberData.value as Member);
                    localStorage.setItem("se_member", JSON.stringify(memberData.value));
                }
                if (usageData.status === "fulfilled") setUsage(usageData.value as UsageData);
                if (brandsData.status === "fulfilled") {
                    const list = Array.isArray(brandsData.value) ? brandsData.value : brandsData.value?.list || [];
                    setBrands(list);
                }
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleNav = (id: string) => {
        if (ROUTES[id]) {
            router.push(ROUTES[id]);
        } else {
            setPage(id);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("se_access_token");
        localStorage.removeItem("se_member");
        router.push("/login");
    };

    // Derived values
    const userName = member?.full_name || "User";
    const userInitial = userName.charAt(0).toUpperCase();
    const tier = usage?.subscription_tier || "FREE";
    const remaining = usage ? usage.credits_limit - usage.credits_used : 0;
    const limit = usage?.credits_limit || 0;
    const pct = limit > 0 ? (remaining / limit) * 100 : 0;
    const renewDays = usage ? daysUntil(usage.billing_cycle_end) : 0;
    const filtered = brandFilter === "all" ? ADS : ADS.filter((a) => a.brand.toLowerCase().includes(brandFilter));
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
                </div>

                {/* User */}
                <div
                    className="sidebar-user"
                    style={{
                        justifyContent: collapsed ? "center" : "flex-start",
                        padding: collapsed ? "16px 0" : "16px",
                        cursor: "pointer",
                    }}
                    title="Click to logout"
                    onClick={handleLogout}
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
                        <div className="dash-header__title">Welcome back, {userName.split(" ")[0]}</div>
                    </div>
                    <button className="btn-generate" onClick={() => router.push("/generateAds")}>+ Generate New Ad</button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    {[
                        { label: "CREDITS LEFT", val: String(remaining), sub: `of ${limit}`, color: "var(--accent)", bar: pct },
                        { label: "ADS GENERATED", val: "37", sub: "this cycle", color: "var(--g1)", trend: "+12 vs last month" },
                        { label: "ADS SAVED", val: "24", sub: "across 2 brands", color: "var(--green)", trend: null },
                        { label: "CANVA TEMPLATES", val: "3", sub: "1 pending", color: "var(--yellow)", trend: null },
                    ].map((s, i) => (
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
                                        id: b.brand_name.toLowerCase(),
                                        label: b.brand_name,
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
                            {filtered.slice(0, 6).map((ad, i) => (
                                <div key={ad.id} className="ad-card">
                                    <div
                                        className="ad-card__image"
                                        style={{
                                            background: `linear-gradient(135deg, ${BG[i % 6]}dd, ${BG[(i + 3) % 6]}aa)`,
                                        }}
                                    >
                                        <span className="ad-card__placeholder">AD</span>
                                        <div className="ad-card__overlay">
                                            <button className="btn-view-ad">View</button>
                                            <button className="btn-dl">DL</button>
                                        </div>
                                        <div className="ad-card__ratios">
                                            {ad.ratios.map((r) => (
                                                <span key={r} className="ad-card__ratio">{r}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ad-card__info">
                                        <div className="ad-card__name">{ad.name}</div>
                                        <div className="ad-card__meta">
                                            <span className="ad-card__date">{ad.date}</span>
                                            <span
                                                className="ad-card__brand"
                                                style={{
                                                    background: ad.brand === "Bron" ? "#3ECFCF18" : "#22C55E18",
                                                    color: ad.brand === "Bron" ? "#3ECFCF" : "#22C55E",
                                                }}
                                            >
                                                {ad.brand}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            {ACTIVITY.map((item, i) => (
                                <div key={i} className="activity-item">
                                    <div className="activity-item__icon">{item.letter}</div>
                                    <div className="activity-item__body">
                                        <div className="activity-item__action">{item.action}</div>
                                        <div className="activity-item__detail">{item.detail}</div>
                                    </div>
                                    <span className="activity-item__time">{item.time}</span>
                                </div>
                            ))}
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
