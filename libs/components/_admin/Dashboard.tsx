import React from "react";
import type { DashboardProps } from "../../types/admin.type";

export default function Dashboard({
  platformStats,
  total,
  activeCount,
  categoriesCount,
  topCategory,
  recommended,
  resolveImageUrl,
  setActiveNav,
  renderConceptGrid,
}: DashboardProps) {
  return (
    <>
      {platformStats && (
        <div className="admin-dash__stats" style={{ marginBottom: 12 }}>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--blue">
                👥
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">
                users
              </span>
            </div>
            <div className="admin-dash__stat-value">
              {platformStats.users.total}
            </div>
            <div className="admin-dash__stat-label">Total Users</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {platformStats.users.paid} paid · {platformStats.users.active}{" "}
              active
            </div>
          </div>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--green">
                ⚡
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--up">
                today
              </span>
            </div>
            <div className="admin-dash__stat-value">
              {platformStats.generations.today}
            </div>
            <div className="admin-dash__stat-label">Generations Today</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {platformStats.generations.this_week} this week
            </div>
          </div>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--purple">
                🎨
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">
                all time
              </span>
            </div>
            <div className="admin-dash__stat-value">
              {platformStats.generations.total}
            </div>
            <div className="admin-dash__stat-label">Total Generations</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {platformStats.generations.completed} completed ·{" "}
              {platformStats.generations.failed} failed
            </div>
          </div>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                📦
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">
                library
              </span>
            </div>
            <div className="admin-dash__stat-value">{total}</div>
            <div className="admin-dash__stat-label">Total Concepts</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
              {activeCount} active · {categoriesCount} categories
            </div>
          </div>
        </div>
      )}

      {!platformStats && (
        <div className="admin-dash__stats">
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--blue">
                📦
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">
                library
              </span>
            </div>
            <div className="admin-dash__stat-value">{total}</div>
            <div className="admin-dash__stat-label">Total Concepts</div>
          </div>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--green">
                ✅
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--up">
                active
              </span>
            </div>
            <div className="admin-dash__stat-value">{activeCount}</div>
            <div className="admin-dash__stat-label">Active Concepts</div>
          </div>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--purple">
                🏷️
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--neutral">
                types
              </span>
            </div>
            <div className="admin-dash__stat-value">{categoriesCount}</div>
            <div className="admin-dash__stat-label">Categories</div>
          </div>
          <div className="admin-dash__stat-card">
            <div className="admin-dash__stat-top">
              <div className="admin-dash__stat-icon admin-dash__stat-icon--amber">
                🔥
              </div>
              <span className="admin-dash__stat-trend admin-dash__stat-trend--up">
                top
              </span>
            </div>
            <div className="admin-dash__stat-value" style={{ fontSize: 16 }}>
              {topCategory ? topCategory[0] : "—"}
            </div>
            <div className="admin-dash__stat-label">Top Category</div>
          </div>
        </div>
      )}

      <div className="admin-dash__section">
        <div className="admin-dash__section-header">
          <div className="admin-dash__section-title">
            ⭐ Recommended Concepts
            <span className="admin-dash__section-count">
              {recommended.length}
            </span>
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
            <div className="admin-dash__empty-text">
              No recommended concepts yet
            </div>
            <div className="admin-dash__empty-hint">
              Concepts with usage will appear here
            </div>
          </div>
        )}
      </div>

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
        {renderConceptGrid(false)}
      </div>
    </>
  );
}
