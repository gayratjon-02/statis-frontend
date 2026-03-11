import React, { useState, useMemo } from "react";
import type { CanvaOrdersTabProps } from "../../types/admin.type";
import type { CanvaOrderAdmin } from "../../../server/admin/admnGetApis";

type SortField = "created_at" | "price" | "status";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export default function CanvaOrdersTab({
  canvaOrders,
  canvaOrdersLoading,
  canvaFulfillId,
  canvaFulfillLink,
  canvaFulfilling,
  canvaFulfillError,
  setCanvaFulfillId,
  setCanvaFulfillLink,
  fetchCanvaOrders,
  handleFulfill,
}: CanvaOrdersTabProps) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return " ↕";
    return sortDir === "asc" ? " ↑" : " ↓";
  };

  const filtered = useMemo(() => {
    if (statusFilter === "all") return canvaOrders;
    return canvaOrders.filter((o) => o.status === statusFilter);
  }, [canvaOrders, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortField === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === "price") {
        cmp = a.price_paid_cents - b.price_paid_cents;
      } else if (sortField === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    canvaOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [canvaOrders]);

  const uniqueStatuses = Object.keys(statusCounts);

  return (
    <div className="admin-dash__section">
      <div className="admin-dash__section-header">
        <div className="admin-dash__section-title">
          📦 Canva Orders
          <span className="admin-dash__section-count">
            {canvaOrders.length}
          </span>
        </div>
        <button
          className="admin-dash__btn admin-dash__btn--ghost"
          onClick={fetchCanvaOrders}
          disabled={canvaOrdersLoading}
        >
          {canvaOrdersLoading ? "…" : "🔄 Refresh"}
        </button>
      </div>

      {canvaOrdersLoading ? (
        <div className="admin-dash__empty">
          <div
            className="admin-dash__spinner"
            style={{ width: 32, height: 32 }}
          />
          <div className="admin-dash__empty-text">Loading orders...</div>
        </div>
      ) : canvaOrders.length === 0 ? (
        <div className="admin-dash__empty">
          <div className="admin-dash__empty-icon">📦</div>
          <div className="admin-dash__empty-text">No Canva orders yet</div>
          <div className="admin-dash__empty-hint">
            Orders will appear here when users purchase Canva templates
          </div>
        </div>
      ) : (
        <>
          {/* Status Filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", padding: "0 22px 16px" }}>
            <button
              className={`admin-dash__filter-btn ${statusFilter === "all" ? "admin-dash__filter-btn--active" : ""}`}
              onClick={() => { setStatusFilter("all"); setPage(1); }}
            >
              All ({canvaOrders.length})
            </button>
            {uniqueStatuses.map((s) => (
              <button
                key={s}
                className={`admin-dash__filter-btn ${statusFilter === s ? "admin-dash__filter-btn--active" : ""}`}
                onClick={() => { setStatusFilter(s); setPage(1); }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)} ({statusCounts[s]})
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontWeight: 500 }}>Order</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500 }}>User</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500 }}>Ad</th>
                  <th
                    style={{ padding: "8px 12px", fontWeight: 500, cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("status")}
                  >
                    Status{sortIcon("status")}
                  </th>
                  <th
                    style={{ padding: "8px 12px", fontWeight: 500, cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("price")}
                  >
                    Price{sortIcon("price")}
                  </th>
                  <th
                    style={{ padding: "8px 12px", fontWeight: 500, cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("created_at")}
                  >
                    Created{sortIcon("created_at")}
                  </th>
                  <th style={{ padding: "8px 12px", fontWeight: 500 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    canvaFulfillId={canvaFulfillId}
                    canvaFulfillLink={canvaFulfillLink}
                    canvaFulfilling={canvaFulfilling}
                    canvaFulfillError={canvaFulfillError}
                    setCanvaFulfillId={setCanvaFulfillId}
                    setCanvaFulfillLink={setCanvaFulfillLink}
                    handleFulfill={handleFulfill}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {sorted.length > PAGE_SIZE && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "16px 0" }}>
              <button
                className="admin-dash__btn admin-dash__btn--ghost"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {sorted.length} orders · Page {page} of {totalPages}
              </span>
              <button
                className="admin-dash__btn admin-dash__btn--ghost"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OrderRow({
  order,
  canvaFulfillId,
  canvaFulfillLink,
  canvaFulfilling,
  canvaFulfillError,
  setCanvaFulfillId,
  setCanvaFulfillLink,
  handleFulfill,
}: {
  order: CanvaOrderAdmin;
  canvaFulfillId: string | null;
  canvaFulfillLink: string;
  canvaFulfilling: boolean;
  canvaFulfillError: string;
  setCanvaFulfillId: (id: string | null) => void;
  setCanvaFulfillLink: (v: string) => void;
  handleFulfill: (orderId: string) => void;
}) {
  const user = order.users;
  const ad = order.generated_ads;
  const email = typeof user === "object" && user !== null ? user.email : "—";
  const fullName = typeof user === "object" && user !== null ? user.full_name : "—";
  const adName = typeof ad === "object" && ad !== null ? ad.ad_name : "—";
  const isPending = order.status === "pending";

  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 12px" }}>
        <code style={{ fontSize: 11 }}>{order._id.slice(0, 8)}…</code>
      </td>
      <td style={{ padding: "10px 12px" }}>
        <div style={{ fontWeight: 500, color: "var(--text)" }}>
          {fullName || "—"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>{email}</div>
      </td>
      <td style={{ padding: "10px 12px" }}>{adName}</td>
      <td style={{ padding: "10px 12px" }}>
        <span
          className={`admin-status-dot admin-status-dot--${order.status === "fulfilled" ? "active" : order.status === "pending" ? "suspended" : ""}`}
        >
          <span className="admin-status-dot__circle" />
          {order.status}
        </span>
      </td>
      <td style={{ padding: "10px 12px" }}>
        {(order.price_paid_cents / 100).toFixed(2)}
      </td>
      <td
        style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted)" }}
      >
        {new Date(order.created_at).toLocaleDateString()}
      </td>
      <td style={{ padding: "10px 12px" }}>
        {isPending ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="url"
              placeholder="https://www.canva.com/design/..."
              value={canvaFulfillId === order._id ? canvaFulfillLink : ""}
              onChange={(e) => {
                setCanvaFulfillLink(e.target.value);
                setCanvaFulfillId(order._id);
              }}
              className="admin-dash__search-input"
              style={{
                padding: "7px 10px",
                fontSize: 12,
                minWidth: 200,
                flex: 1,
              }}
            />
            <button
              className="admin-dash__btn admin-dash__btn--primary"
              style={{ fontSize: 12, padding: "7px 14px", whiteSpace: "nowrap" }}
              disabled={
                (canvaFulfilling && canvaFulfillId === order._id) ||
                !(canvaFulfillId === order._id && canvaFulfillLink.trim())
              }
              onClick={() => handleFulfill(order._id)}
            >
              {canvaFulfilling && canvaFulfillId === order._id
                ? "Sending..."
                : "Send"}
            </button>
          </div>
        ) : order.canva_link ? (
          <a
            href={order.canva_link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "var(--accent)",
              fontSize: 12,
              textDecoration: "underline",
            }}
          >
            Open in Canva
          </a>
        ) : (
          <span style={{ color: "var(--muted)" }}>—</span>
        )}
        {canvaFulfillError && canvaFulfillId === order._id && (
          <div style={{ fontSize: 11, color: "var(--red)", marginTop: 4 }}>
            {canvaFulfillError}
          </div>
        )}
      </td>
    </tr>
  );
}
