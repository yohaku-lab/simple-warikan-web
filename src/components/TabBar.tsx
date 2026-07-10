import type { TabKey } from "../App";
import { HistoryIcon, RecordIcon, SettingsIcon, ThisMonthIcon } from "./icons";

const TABS: { key: TabKey; label: string; Icon: typeof RecordIcon }[] = [
  { key: "record", label: "記録", Icon: RecordIcon },
  { key: "thisMonth", label: "今月", Icon: ThisMonthIcon },
  { key: "history", label: "履歴", Icon: HistoryIcon },
  { key: "settings", label: "設定", Icon: SettingsIcon },
];

export function TabBar({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          className={`tab-bar-button${active === key ? " active" : ""}`}
          onClick={() => onChange(key)}
          aria-current={active === key ? "page" : undefined}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
