import React from "react";
import type { ConceptModalProps } from "../../types/admin.type";

export default function ConceptModal({
  title,
  show,
  loading,
  error,
  name,
  categoryId,
  description,
  tags,
  sourceUrl,
  imagePreview,
  categories,
  fileInputRef,
  setName,
  setCategoryId,
  setDescription,
  setTags,
  setSourceUrl,
  onImageSelect,
  onSubmit,
  onClose,
  submitLabel,
  loadingLabel,
}: ConceptModalProps) {
  if (!show) return null;

  return (
    <div className="admin-modal__overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{title}</h2>
          <button className="admin-modal__close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className="admin-modal__error">⚠️ {error}</div>
        )}

        <form className="admin-modal__form" onSubmit={onSubmit}>
          <div
            className="admin-modal__upload"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="admin-modal__upload-preview"
              />
            ) : (
              <div className="admin-modal__upload-placeholder">
                <span className="admin-modal__upload-icon">📷</span>
                <span className="admin-modal__upload-text">
                  Click to upload image
                </span>
                <span className="admin-modal__upload-hint">
                  PNG, JPG, WEBP — max 10MB
                </span>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onImageSelect}
              style={{ display: "none" }}
            />
          </div>

          <div className="admin-modal__field">
            <label className="admin-modal__label">Name *</label>
            <input
              className="admin-modal__input"
              placeholder="e.g. Bold Social Proof Banner"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="admin-modal__field">
            <label className="admin-modal__label">Category *</label>
            <select
              className="admin-modal__input admin-modal__select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-modal__field">
            <label className="admin-modal__label">Description</label>
            <textarea
              className="admin-modal__input admin-modal__textarea"
              placeholder="Describe the concept style and when to use it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="admin-modal__field">
            <label className="admin-modal__label">Tags</label>
            <input
              className="admin-modal__input"
              placeholder="tag1, tag2, tag3 (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          <div className="admin-modal__field">
            <label className="admin-modal__label">Source URL</label>
            <input
              className="admin-modal__input"
              placeholder="https://example.com/inspiration"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="admin-modal__submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="admin-dash__spinner" /> {loadingLabel}
              </>
            ) : (
              submitLabel
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
