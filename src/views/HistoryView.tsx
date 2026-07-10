import { useState } from "react";
import { MonthlyBalanceChart, type BalanceChartPoint } from "../components/MonthlyBalanceChart";
import { SealCheckIcon } from "../components/icons";
import { formatYearMonth, formatYen } from "../core/format";
import { settlementDirection } from "../core/settlement";
import { useHistoryMonths } from "../hooks/useHistoryMonths";
import { useStore } from "../store/StoreContext";
import { MonthPage } from "./MonthPage";

/** "履歴" tab: past months (current month excluded — it lives under "今月") with a
 * settlement badge, plus a month-over-month bar chart. Tapping a month drills into the
 * same `MonthPage` the "今月" tab uses. Mirrors HistoryView.swift. */
export function HistoryView() {
  const { store } = useStore();
  const partnerName = store.settings.partnerName;
  const summaries = useHistoryMonths();
  const [drilledMonthKey, setDrilledMonthKey] = useState<string | null>(null);

  if (drilledMonthKey) {
    return <MonthPage monthKey={drilledMonthKey} onBack={() => setDrilledMonthKey(null)} />;
  }

  if (summaries.length === 0) {
    return (
      <div className="app-page">
        <h1 className="page-title">履歴</h1>
        <div className="empty-state">
          <div className="empty-state-title">過去の月がありません</div>
          <div className="empty-state-desc">翌月になると、先月分がここに表示されます</div>
        </div>
      </div>
    );
  }

  const chartPoints: BalanceChartPoint[] = [...summaries]
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .map((summary) => ({
      key: summary.monthKey,
      label: String(summary.monthStart.getMonth() + 1),
      netAmount: settlementNet(summary),
    }));

  return (
    <div className="app-page">
      <h1 className="page-title">履歴</h1>

      <div className="chart-wrap">
        <p className="chart-title">月別の精算額推移</p>
        <MonthlyBalanceChart points={chartPoints} />
      </div>

      <div className="section">
        <p className="section-label">過去の月</p>
        <ul className="expense-list">
          {summaries.map((summary) => {
            const direction = settlementDirection(summary.settlement);
            return (
              <li key={summary.monthKey}>
                <button type="button" className="history-month-row" onClick={() => setDrilledMonthKey(summary.monthKey)}>
                  <div className="history-month-main">
                    <div className="history-month-title">{formatYearMonth(summary.monthStart)}</div>
                    <div className="history-month-sub">
                      {direction.kind === "partnerPaysMe" && `${partnerName}が${formatYen(direction.amount)}払う`}
                      {direction.kind === "iPayPartner" && `自分が${formatYen(direction.amount)}払う`}
                      {direction.kind === "settled" && "差額なし"}
                    </div>
                  </div>
                  {summary.isSettled && <SealCheckIcon className="history-settled-icon" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="ad-slot" />
    </div>
  );
}

function settlementNet(summary: ReturnType<typeof useHistoryMonths>[number]): number {
  const direction = settlementDirection(summary.settlement);
  if (direction.kind === "partnerPaysMe") return direction.amount;
  if (direction.kind === "iPayPartner") return -direction.amount;
  return 0;
}
