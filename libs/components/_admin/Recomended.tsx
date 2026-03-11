import React from "react";
import type { RecommendedTabProps } from "../../types/admin.type";

export default function RecommendedTab({
  recommended,
  resolveImageUrl,
  getCategoryName,
  fetchRecommended,
}: RecommendedTabProps) {
  return (
    <div className="admin-dash__section">
      <div className="admin-dash__section-header">
        <div className="admin-dash__section-title">
          ⭐ Top Concepts by Usage
          <span className="admin-dash__section-count">
            {recommended.length}
          </span>
        </div>
        <button
          className="admin-dash__btn admin-dash__btn--ghost"
          onClick={fetchRecommended}
        >
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
                  {getCategoryName(c.category_id, c.category_name)}
                </div>
                <div className="admin-dash__concept-name">{c.name}</div>
                <div className="admin-dash__concept-meta">
                  <span className="admin-dash__concept-usage">
                    🔥 {c.usage_count} uses
                  </span>
                  <span
                    className={`admin-dash__concept-status ${
                      c.is_active
                        ? "admin-dash__concept-status--active"
                        : "admin-dash__concept-status--inactive"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-dash__empty">
          <div className="admin-dash__empty-icon">⭐</div>
          <div className="admin-dash__empty-text">
            No recommended concepts
          </div>
          <div className="admin-dash__empty-hint">
            Concepts will be ranked by usage_count
          </div>
        </div>
      )}
    </div>
  );
}
