import React from "react";
import { ADMIN_NAV_ITEMS } from "../../types/admin.type";
import type { AdminSidebarProps } from "../../types/admin.type";

export default function AdminSidebar({
  activeNav,
  setActiveNav,
  adminName,
  adminRole,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="admin-dash__sidebar">
      <div className="admin-dash__logo">
        <span className="admin-dash__logo-icon">⚡</span>
        <span className="admin-dash__logo-text">Static Engine</span>
        <span className="admin-dash__logo-badge">Admin</span>
      </div>

      <nav className="admin-dash__nav">
        {ADMIN_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`admin-dash__nav-item ${
              activeNav === item.id ? "admin-dash__nav-item--active" : ""
            }`}
            onClick={() => setActiveNav(item.id)}
          >
            <span className="admin-dash__nav-icon">{item.icon}</span>
            {item.label}
            <span className="admin-dash__nav-dot" />
          </button>
        ))}
      </nav>

      <div className="admin-dash__sidebar-footer">
        <div className="admin-dash__user-info">
          <div className="admin-dash__avatar">
            {adminName?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="admin-dash__user-name">
              {adminName || "Admin"}
            </div>
            <div className="admin-dash__user-role">
              {adminRole || "ADMIN"}
            </div>
          </div>
        </div>
        <button className="admin-dash__logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
