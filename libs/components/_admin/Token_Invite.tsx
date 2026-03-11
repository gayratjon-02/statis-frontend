import React from "react";
import toast from "react-hot-toast";
import { AdminRole } from "../../enums/admin.enum";
import type { InviteTokensTabProps } from "../../types/admin.type";

export default function InviteTokensTab({
  invites,
  invitesLoading,
  invitesError,
  generatedInvite,
  isGeneratingInvite,
  handleGenerateInvite,
}: InviteTokensTabProps) {
  return (
    <div className="admin-dash__section">
      <div className="admin-dash__section-header">
        <div className="admin-dash__section-title">
          🎟 Manage Invite Tokens
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            className="admin-dash__btn admin-dash__btn--primary"
            disabled={isGeneratingInvite}
            onClick={() => handleGenerateInvite(AdminRole.CONTENT_ADMIN)}
          >
            {isGeneratingInvite ? "Generating..." : "＋ Content Admin Token"}
          </button>
          <button
            className="admin-dash__btn admin-dash__btn--primary"
            disabled={isGeneratingInvite}
            style={{ background: "#4B5563" }}
            onClick={() => handleGenerateInvite(AdminRole.SUPER_ADMIN)}
          >
            {isGeneratingInvite ? "Generating..." : "＋ Super Admin Token"}
          </button>
        </div>
      </div>

      <div style={{ padding: "22px" }}>
        {generatedInvite && (
          <div
            style={{
              padding: "16px",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                color: "#10B981",
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              New Token Generated Successfully
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <code
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "10px 14px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  fontSize: "15px",
                  color: "white",
                  flex: 1,
                }}
              >
                {generatedInvite}
              </code>
              <button
                className="admin-dash__btn admin-dash__btn--ghost"
                onClick={() => {
                  navigator.clipboard.writeText(generatedInvite);
                  toast.success("Copied to clipboard");
                }}
              >
                Copy
              </button>
            </div>
            <div
              style={{
                color: "var(--muted)",
                fontSize: "12px",
                marginTop: "10px",
              }}
            >
              Save this token now. It grants registration access.
            </div>
          </div>
        )}

        {invitesLoading ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "var(--muted)",
            }}
          >
            Loading invites...
          </div>
        ) : invitesError ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#EF4444",
            }}
          >
            {invitesError}
          </div>
        ) : invites.length > 0 ? (
          <div className="admin-dash__table-wrapper">
            <table className="admin-dash__table">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Role</th>
                  <th>Created At</th>
                  <th>Expires At (Time Remaining)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => {
                  const isExpired =
                    new Date(inv.expires_at) < new Date();
                  const statusColor = inv.is_used
                    ? "#6B7280"
                    : isExpired
                    ? "#EF4444"
                    : "#10B981";
                  const statusText = inv.is_used
                    ? "Used"
                    : isExpired
                    ? "Expired"
                    : "Active";
                  const timeRemainingMs =
                    new Date(inv.expires_at).getTime() -
                    new Date().getTime();
                  const hoursRemaining = Math.max(
                    0,
                    Math.floor(timeRemainingMs / (1000 * 60 * 60)),
                  );
                  const daysRemaining = Math.max(
                    0,
                    Math.floor(hoursRemaining / 24),
                  );
                  const remainingText =
                    timeRemainingMs > 0
                      ? daysRemaining > 0
                        ? `${daysRemaining}d remaining`
                        : `${hoursRemaining}h remaining`
                      : "Expired";

                  return (
                    <tr key={inv._id}>
                      <td style={{ fontFamily: "monospace" }}>
                        {inv.token}
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            background:
                              inv.role === AdminRole.SUPER_ADMIN
                                ? "rgba(239, 68, 68, 0.1)"
                                : "rgba(59, 130, 246, 0.1)",
                            color:
                              inv.role === AdminRole.SUPER_ADMIN
                                ? "#EF4444"
                                : "#3B82F6",
                          }}
                        >
                          {inv.role}
                        </span>
                      </td>
                      <td style={{ color: "var(--muted)" }}>
                        {new Date(inv.created_at).toLocaleString()}
                      </td>
                      <td style={{ color: "var(--muted)" }}>
                        <div>
                          {new Date(inv.expires_at).toLocaleString()}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            marginTop: "2px",
                            color: isExpired
                              ? "#EF4444"
                              : "var(--muted)",
                          }}
                        >
                          {remainingText}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: statusColor,
                            }}
                          />
                          <span
                            style={{ color: statusColor, fontSize: 13 }}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-dash__empty">
            <div className="admin-dash__empty-icon">🎟️</div>
            <div className="admin-dash__empty-text">
              No active invites
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
