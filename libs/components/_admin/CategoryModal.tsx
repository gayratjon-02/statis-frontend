import React from "react";
import type { CategoryModalProps } from "../../types/admin.type";

export default function CategoryModal({
  show,
  editingCatId,
  catName,
  catDescription,
  catDisplayOrder,
  catModalError,
  catModalLoading,
  setCatName,
  setCatDescription,
  setCatDisplayOrder,
  onSubmit,
  onClose,
}: CategoryModalProps) {
  if (!show) return null;

  return (
    <div className="admin-modal__overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div className="admin-modal__title">
            {editingCatId ? "Edit Category" : "New Category"}
          </div>
          <button className="admin-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {catModalError && (
          <div className="admin-modal__error">{catModalError}</div>
        )}

        <form className="admin-modal__form" onSubmit={onSubmit}>
          <div className="admin-modal__field">
            <label className="admin-modal__label">Category Name *</label>
            <input
              className="admin-modal__input"
              placeholder="e.g. Social Proof"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="admin-modal__field">
            <label className="admin-modal__label">Description</label>
            <textarea
              className="admin-modal__input"
              placeholder="Describe what this category covers..."
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              rows={3}
              style={{ resize: "vertical" }}
            />
          </div>
          <div className="admin-modal__field">
            <label className="admin-modal__label">Display Order</label>
            <input
              type="number"
              className="admin-modal__input"
              placeholder="0"
              min={0}
              value={catDisplayOrder}
              onChange={(e) =>
                setCatDisplayOrder(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
          </div>
          <button
            type="submit"
            className="admin-modal__submit"
            disabled={catModalLoading}
          >
            {catModalLoading ? (
              <>
                <span className="admin-dash__spinner" />{" "}
                {editingCatId ? "Saving..." : "Creating..."}
              </>
            ) : editingCatId ? (
              "Save Changes"
            ) : (
              "Create Category"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
