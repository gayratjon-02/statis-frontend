import React from "react";
import type { CategoriesTabProps } from "../../types/admin.type";

export default function CategoriesTab({
  categories,
  deletingCatId,
  openAddCategory,
  openEditCategory,
  handleDeleteCategory,
}: CategoriesTabProps) {
  return (
    <div className="admin-dash__section">
      <div className="admin-dash__section-header">
        <div className="admin-dash__section-title">
          🏷️ All Categories
          <span className="admin-dash__section-count">{categories.length}</span>
        </div>
        <button
          className="admin-dash__btn admin-dash__btn--primary"
          onClick={openAddCategory}
        >
          ＋ Add Category
        </button>
      </div>

      {categories.length > 0 ? (
        <div className="admin-cat-grid">
          {categories.map((cat) => (
            <div key={cat._id} className="admin-cat-card">
              <div className="admin-cat-card__body">
                <div className="admin-cat-card__name">{cat.name}</div>
                <div className="admin-cat-card__slug">slug: {cat.slug}</div>
                {cat.description && (
                  <div className="admin-cat-card__desc">{cat.description}</div>
                )}
                <div className="admin-cat-card__order">
                  Order: {cat.display_order}
                </div>
              </div>
              <div className="admin-cat-card__actions">
                <button
                  className="admin-cat-card__btn admin-cat-card__btn--edit"
                  onClick={() => openEditCategory(cat)}
                >
                  Edit
                </button>
                <button
                  className="admin-cat-card__btn admin-cat-card__btn--delete"
                  disabled={deletingCatId === cat._id}
                  onClick={() => {
                    if (
                      confirm(`Delete "${cat.name}"? This cannot be undone.`)
                    ) {
                      handleDeleteCategory(cat._id);
                    }
                  }}
                >
                  {deletingCatId === cat._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-dash__empty">
          <div className="admin-dash__empty-icon">🏷️</div>
          <div className="admin-dash__empty-text">No categories yet</div>
          <div className="admin-dash__empty-hint">
            Create your first category to organize concepts
          </div>
        </div>
      )}
    </div>
  );
}
