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
                <tr key={user._id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 500, color: "var(--text)" }}>{user.full_name || "—"}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>{user.email}</div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className={`admin-tier-badge admin-tier-badge--${user.subscription_tier}`}>
                      {user.subscription_tier}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className={`admin-status-dot admin-status-dot--${user.member_status}`}>
                      <span className="admin-status-dot__circle" />
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
                          className={`admin-action-btn ${user.member_status === "suspended" ? "admin-action-btn--green" : "admin-action-btn--red"}`}
                          onClick={() => handleBlockUser(user)}
                        >
                          {user.member_status === "suspended" ? "Reactivate" : "Suspend"}
                        </button>
                      )}
                      <button
                        className="admin-action-btn admin-action-btn--red"
                        onClick={() => handleDeleteUser(user)}
                      >
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
