import React from "react";
import type { CostTrackerTabProps } from "../../types/admin.type";

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function CostTrackerTab({
  tokenUsage,
  costByUser,
  profitability,
  costDays,
  setCostDays,
  costsLoading,
}: CostTrackerTabProps) {
  if (costsLoading) {
    return (
      <div className="admin-dash__section">
        <div className="admin-dash__empty">
          <div className="admin-dash__spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  const profit = profitability?.estimated_monthly_profit ?? 0;
  const isPositive = profit >= 0;

  return (
    <div className="admin-dash__section">
      {/* ── Time Period Selector ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { label: "7 days", value: 7 },
          { label: "30 days", value: 30 },
          { label: "90 days", value: 90 },
        ].map((opt) => (
          <button
            key={opt.value}
            className={`admin-dash__filter-btn ${costDays === opt.value ? "admin-dash__filter-btn--active" : ""}`}
            onClick={() => setCostDays(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Total API Cost */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Total API Cost
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
            ${fmt(tokenUsage?.total_cost ?? 0)}
          </div>
          <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}>
            Last {costDays} days
          </div>
        </div>

        {/* Est. Monthly Revenue */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Est. Monthly Revenue
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>
            ${fmt(profitability?.estimated_monthly_revenue ?? 0, 0)}
          </div>
          <div style={{ fontSize: 11, color: "var(--dim)", marginTop: 4 }}>
            {profitability?.paid_subscribers ?? 0} paid subscribers
          </div>
        </div>

        {/* Est. Profit */}
        <div style={{
          background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px",
        }}>
          <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            Est. Profit
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: isPositive ? "#22c55e" : "#ef4444" }}>
            {isPositive ? "+" : ""}${fmt(profit)}
          </div>
          <div style={{ fontSize: 11, color: isPositive ? "#22c55e" : "#ef4444", marginTop: 4 }}>
            {profitability?.profit_margin_percent ?? 0}% margin
            {" · "}${fmt(profitability?.avg_cost_per_subscriber ?? 0)}/subscriber
          </div>
        </div>
      </div>

      {/* ── Provider Breakdown ── */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "20px 24px", marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          Provider Breakdown
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Claude */}
          <div style={{
            padding: 16, borderRadius: 8, background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#a78bfa", marginBottom: 8 }}>🤖 Claude</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--dim)" }}>
              <span><strong style={{ color: "var(--text)" }}>{tokenUsage?.claude.calls ?? 0}</strong> API calls</span>
              <span><strong style={{ color: "var(--text)" }}>{fmtTokens(tokenUsage?.claude.input_tokens ?? 0)}</strong> input tokens</span>
              <span><strong style={{ color: "var(--text)" }}>{fmtTokens(tokenUsage?.claude.output_tokens ?? 0)}</strong> output tokens</span>
              <span style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "#a78bfa" }}>
                ${fmt(tokenUsage?.claude.cost ?? 0)}
              </span>
            </div>
          </div>

          {/* Gemini */}
          <div style={{
            padding: 16, borderRadius: 8, background: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#60a5fa", marginBottom: 8 }}>🎨 Gemini</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, color: "var(--dim)" }}>
              <span><strong style={{ color: "var(--text)" }}>{tokenUsage?.gemini.calls ?? 0}</strong> API calls</span>
              <span style={{ color: "var(--dim)", fontSize: 11 }}>Fixed cost per image ($0.03)</span>
              <span style={{ marginTop: 12, fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>
                ${fmt(tokenUsage?.gemini.cost ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cost by User Table ── */}
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12,
        padding: "20px 24px",
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>
          Cost by User
        </h3>

        {costByUser.length === 0 ? (
          <div className="admin-dash__empty">
            <div className="admin-dash__empty-icon">💰</div>
            <div className="admin-dash__empty-text">No usage data yet</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", fontWeight: 500 }}>Email</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500 }}>Plan</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500, textAlign: "right" }}>Claude</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500, textAlign: "right" }}>Gemini</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500, textAlign: "right" }}>Total</th>
                  <th style={{ padding: "8px 12px", fontWeight: 500, textAlign: "right" }}>Gens</th>
                </tr>
              </thead>
              <tbody>
                {costByUser.map((u) => (
                  <tr key={u.user_id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 500, color: "var(--text)" }}>{u.full_name || "—"}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className={`admin-tier-badge admin-tier-badge--${u.subscription_tier}`}>
                        {u.subscription_tier}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#a78bfa", fontWeight: 500 }}>
                      ${fmt(u.claude_cost)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "#60a5fa", fontWeight: 500 }}>
                      ${fmt(u.gemini_cost)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--text)", fontWeight: 600 }}>
                      ${fmt(u.total_cost)}
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--muted)" }}>
                      {u.generations}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
