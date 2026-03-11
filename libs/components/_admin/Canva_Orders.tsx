import React from "react";
import type { CanvaOrdersTabProps } from "../../types/admin.type";

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
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--border)",
                  color: "var(--muted)",
                  textAlign: "left",
                }}
              >
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Order</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>User</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Ad</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Status</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Price</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Created</th>
                <th style={{ padding: "8px 12px", fontWeight: 500 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {canvaOrders.map((order) => {
                const user = order.users ?? (order as any).users;
                const ad = order.generated_ads ?? (order as any).generated_ads;
                const email =
                  typeof user === "object" && user !== null
                    ? (user as any).email
                    : "—";
                const fullName =
                  typeof user === "object" && user !== null
                    ? (user as any).full_name
                    : "—";
                const adName =
                  typeof ad === "object" && ad !== null
                    ? (ad as any).ad_name
                    : "—";
                const isPending = order.status === "pending";
                return (
                  <tr
                    key={order._id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle, #21262d)",
                    }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <code style={{ fontSize: 11 }}>
                        {order._id.slice(0, 8)}…
                      </code>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text)" }}>
                        {fullName || "—"}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {email}
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>{adName}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        className={`admin-dash__concept-status ${
                          order.status === "fulfilled"
                            ? "admin-dash__concept-status--active"
                            : "admin-dash__concept-status--inactive"
                        }`}
                        style={{ marginRight: 6 }}
                      />
                      {order.status}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {(order.price_paid_cents / 100).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "10px 12px",
                        fontSize: 12,
                        color: "var(--muted)",
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      {isPending ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <input
                            type="url"
                            placeholder="https://www.canva.com/design/..."
                            value={
                              canvaFulfillId === order._id
                                ? canvaFulfillLink
                                : ""
                            }
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
                            style={{
                              fontSize: 12,
                              padding: "7px 14px",
                              whiteSpace: "nowrap",
                            }}
                            disabled={
                              (canvaFulfilling &&
                                canvaFulfillId === order._id) ||
                              !(
                                canvaFulfillId === order._id &&
                                canvaFulfillLink.trim()
                              )
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
                        <div
                          style={{
                            fontSize: 11,
                            color: "#f85149",
                            marginTop: 4,
                          }}
                        >
                          {canvaFulfillError}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
