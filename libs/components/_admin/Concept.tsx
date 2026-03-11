import React from "react";
import type { ConceptsTabProps } from "../../types/admin.type";

export default function ConceptsTab({
  total,
  search,
  setSearch,
  page,
  setPage,
  categoryFilter,
  setCategoryFilter,
  categoryFilters,
  openModal,
  renderConceptGrid,
}: ConceptsTabProps) {
  return (
    <div className="admin-dash__section">
      <div className="admin-dash__section-header">
        <div className="admin-dash__section-title">
          🎨 All Concepts
          <span className="admin-dash__section-count">{total}</span>
        </div>
        <div className="admin-dash__section-actions">
          <button
            className="admin-dash__btn admin-dash__btn--primary"
            onClick={openModal}
          >
            ＋ Add Concept
          </button>
        </div>
      </div>

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
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categoryFilters.map((cat) => (
            <button
              key={cat.value}
              className={`admin-dash__filter-btn ${
                categoryFilter === cat.value
                  ? "admin-dash__filter-btn--active"
                  : ""
              }`}
              onClick={() => {
                setCategoryFilter(cat.value);
                setPage(1);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {renderConceptGrid(true)}

      {total > 12 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "16px 0",
          }}
        >
          <button
            className="admin-dash__btn admin-dash__btn--ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span
            style={{
              padding: "8px 14px",
              fontSize: 13,
              color: "var(--muted)",
            }}
          >
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
  );
}
