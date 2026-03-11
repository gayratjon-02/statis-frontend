import React from "react";
import type { PromptManageTabProps } from "../../types/admin.type";

export default function PromptManageTab({
  promptTemplates,
  promptTemplatesLoading,
  promptEditId,
  promptEditContent,
  promptEditActive,
  promptSaveLoading,
  promptSaveError,
  setPromptEditId,
  setPromptEditContent,
  setPromptEditActive,
  setPromptSaveError,
  handleSavePrompt,
  fetchPromptTemplates,
}: PromptManageTabProps) {
  return (
    <div className="admin-dash__section">
      <div className="admin-dash__section-header">
        <div className="admin-dash__section-title">
          📝 Prompt Templates
          <span className="admin-dash__section-count">
            {promptTemplates.length}
          </span>
        </div>
        <button
          className="admin-dash__btn admin-dash__btn--ghost"
          onClick={fetchPromptTemplates}
          disabled={promptTemplatesLoading}
        >
          {promptTemplatesLoading ? "…" : "🔄 Refresh"}
        </button>
      </div>
      {promptTemplatesLoading ? (
        <div className="admin-dash__empty">
          <div
            className="admin-dash__spinner"
            style={{ width: 32, height: 32 }}
          />
          <div className="admin-dash__empty-text">Loading prompts...</div>
        </div>
      ) : promptTemplates.length === 0 ? (
        <div className="admin-dash__empty">
          <div className="admin-dash__empty-icon">📝</div>
          <div className="admin-dash__empty-text">
            No prompt templates found
          </div>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {promptTemplates.map((t) => {
            const isEditing = promptEditId === t._id;
            const content = isEditing ? promptEditContent : t.content;
            const active = isEditing ? promptEditActive : t.is_active;
            return (
              <div
                key={t._id}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div>
                    <span
                      style={{ fontWeight: 600, color: "var(--text)" }}
                    >
                      {t.name}
                    </span>
                    <span
                      style={{
                        marginLeft: 10,
                        fontSize: 12,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.template_type}
                    </span>
                  </div>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => {
                        if (!isEditing) {
                          setPromptEditId(t._id);
                          setPromptEditContent(t.content);
                          setPromptEditActive(!t.is_active);
                        } else {
                          setPromptEditActive(!promptEditActive);
                        }
                      }}
                    />
                    Active
                  </label>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => {
                    if (!isEditing) {
                      setPromptEditId(t._id);
                      setPromptEditContent(e.target.value);
                      setPromptEditActive(t.is_active);
                    } else {
                      setPromptEditContent(e.target.value);
                    }
                  }}
                  placeholder="Prompt content..."
                  rows={10}
                  style={{
                    width: "100%",
                    background: "var(--bg)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--text)",
                    padding: 12,
                    fontSize: 13,
                    fontFamily: "monospace",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
                {(isEditing ||
                  content !== t.content ||
                  active !== t.is_active) && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <button
                      className="admin-dash__btn admin-dash__btn--primary"
                      disabled={promptSaveLoading}
                      onClick={() => handleSavePrompt(t._id)}
                    >
                      {promptSaveLoading ? "Saving…" : "Save changes"}
                    </button>
                    <button
                      className="admin-dash__btn admin-dash__btn--ghost"
                      onClick={() => {
                        setPromptEditId(null);
                        setPromptEditContent("");
                        setPromptSaveError("");
                      }}
                    >
                      Cancel
                    </button>
                    {promptSaveError && (
                      <span style={{ fontSize: 13, color: "#f85149" }}>
                        {promptSaveError}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
