import { useState, type ReactNode } from "react";
import { InstallHintBanner } from "./components/InstallHintBanner";
import { TabBar } from "./components/TabBar";
import { currentMonthKey } from "./core/monthKey";
import { StoreProvider } from "./store/StoreContext";
import { HistoryView } from "./views/HistoryView";
import { MonthPage } from "./views/MonthPage";
import { RecordView } from "./views/RecordView";
import { SettingsView } from "./views/SettingsView";

export type TabKey = "record" | "thisMonth" | "history" | "settings";

/**
 * All four tabs stay mounted simultaneously (toggled with CSS `display`) rather than being
 * conditionally rendered, so in-progress input in one tab (e.g. a half-filled 記録 form)
 * survives switching to another tab and back — matching the iOS app's persistent tab
 * state, which a naive conditional-render approach would lose on every tab switch.
 */
function App() {
  const [tab, setTab] = useState<TabKey>("record");

  return (
    <StoreProvider>
      <div className="app-shell">
        <InstallHintBanner />
        <Page active={tab === "record"}>
          <RecordView />
        </Page>
        <Page active={tab === "thisMonth"}>
          <MonthPage monthKey={currentMonthKey()} />
        </Page>
        <Page active={tab === "history"}>
          <HistoryView />
        </Page>
        <Page active={tab === "settings"}>
          <SettingsView />
        </Page>

        <TabBar active={tab} onChange={setTab} />
      </div>
    </StoreProvider>
  );
}

function Page({ active, children }: { active: boolean; children: ReactNode }) {
  return <div className={active ? undefined : "app-page--hidden"}>{children}</div>;
}

export default App;
