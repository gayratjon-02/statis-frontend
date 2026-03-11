import React from "react";
import type { UsersTabProps } from "../../types/admin.type";

export default function UsersTab({
  users,
  usersTotal,
  usersPage,
  usersLoading,
  userSearch,
  userTierFilter,
  userStatusFilter,
  setUserSearch,
  setUserTierFilter,
  setUserStatusFilter,
  setUsersPage,
  handleBlockUser,
  handleDeleteUser,
}: UsersTabProps) {
  return (
    <div className="admin-dash__section">
      <div className="admin-dash__search" style={{ marginBottom: 16 }}>
        <input
          className="admin-dash__search-input"
          placeholder="Search by email or name..."
          value={userSearch}
          onChange={(e) => { setUserSearch(e.target.value); setUsersPage(1); }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {[
          { label: "All Tiers", value: "" },
          { label: "Free", value: "free" },
          { label: "Starter", value: "starter" },
          { label: "Pro", value: "pro" },
          { label: "Growth", value: "growth" },
        ].map((opt) => (
          <button key={opt.value}
            className={`admin-dash__filter-btn ${userTierFilter === opt.value ? "admin-dash__filter-btn--active" : ""}`}
            onClick={() => { setUserTierFilter(opt.value); setUsersPage(1); }}>
            {opt.label}
          </button>
        ))}
        <span style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />
        {[
          { label: "All Status", value: "" },
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
        ].map((opt) => (
          <button key={opt.value}
            className={`admin-dash__filter-btn ${userStatusFilter === opt.value ? "admin-dash__filter-btn--active" : ""}`}
            onClick={() => { setUserStatusFilter(opt.value); setUsersPage(1); }}>
            {opt.label}
          </button>
        ))}
      </div>

      {usersLoading ? (
        <div className="admin-dash__empty">
          <div className="admin-dash__spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : users.length === 0 ? (
        <div className="admin-dash__empty">
          <div className="admin-dash__empty-icon">👥</div>
          <div className="admin-dash__empty-text">No users found</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>User</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Tier</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Credits</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Joined</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: "1px solid var(--border-subtle, #21262d)" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 500, color: "var(--text)" }}>{user.full_name || "—"}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      background: user.subscription_tier === "free" ? "#21262d" : user.subscription_tier === "pro" ? "#1f3a5f" : user.subscription_tier === "growth" ? "#2d1f5f" : "#1f3a2f",
                      color: user.subscription_tier === "free" ? "var(--muted)" : user.subscription_tier === "pro" ? "#58a6ff" : user.subscription_tier === "growth" ? "#a371f7" : "#3fb950",
                      padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase"
                    }}>
                      {user.subscription_tier}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                      color: user.member_status === "active" ? "#3fb950" : user.member_status === "suspended" ? "#f85149" : "var(--muted)"
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                      {user.member_status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)" }}>
                    {user.credits_used} / {user.credits_limit}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {user.member_status !== "deleted" && (
                        <button
                          onClick={() => handleBlockUser(user)}
                          style={{
                            background: user.member_status === "suspended" ? "#1a3a2a" : "#3a1a1a",
                            color: user.member_status === "suspended" ? "#3fb950" : "#f85149",
                            border: "1px solid currentColor", borderRadius: 5,
                            padding: "4px 10px", fontSize: 12, cursor: "pointer"
                          }}>
                          {user.member_status === "suspended" ? "Reactivate" : "Suspend"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        style={{
                          background: "#3a1a1a",
                          color: "#f85149",
                          border: "1px solid currentColor", borderRadius: 5,
                          padding: "4px 10px", fontSize: 12, cursor: "pointer"
                        }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {usersTotal > 20 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "16px 0" }}>
          <button className="admin-dash__btn admin-dash__btn--ghost"
            disabled={usersPage <= 1}
            onClick={() => setUsersPage((p) => Math.max(1, p - 1))}>
            ← Previous
          </button>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {usersTotal} users · Page {usersPage} of {Math.ceil(usersTotal / 20)}
          </span>
          <button className="admin-dash__btn admin-dash__btn--ghost"
            disabled={usersPage >= Math.ceil(usersTotal / 20)}
            onClick={() => setUsersPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
