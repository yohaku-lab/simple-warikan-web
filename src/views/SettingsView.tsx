import { useRef, useState } from "react";
import { parseStore } from "../storage/schema";
import { useStore } from "../store/StoreContext";
import { APP_VERSION } from "../version";

/** "設定" tab: partner display name, JSON export/import, full data wipe (double
 * confirmed), and a brief about section. Mirrors SettingsView.swift, minus the
 * StoreKit/widget/app-icon sections that don't apply to a web build. */
export function SettingsView() {
  const { store, updateSettings, replaceStore, resetStore } = useStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [deleteStep, setDeleteStep] = useState<0 | 1 | 2>(0);

  function handleExport() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `simple-warikan-${today}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    setImportError(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseStore(JSON.parse(text));
      const confirmed = window.confirm(
        `${parsed.expenses.length}件の支出データをインポートします。現在のデータはすべて置き換えられます。よろしいですか？`,
      );
      if (!confirmed) return;
      replaceStore(parsed);
      setImportError(null);
    } catch {
      setImportError("ファイルの形式が正しくありません。エクスポートしたJSONファイルを選択してください。");
    }
  }

  function handleDeleteAll() {
    if (deleteStep === 0) {
      setDeleteStep(1);
      return;
    }
    resetStore();
    setDeleteStep(0);
  }

  return (
    <div className="app-page">
      <h1 className="page-title">設定</h1>

      <div className="section">
        <p className="section-label">相手の名前</p>
        <div className="card">
          <input
            className="text-input"
            type="text"
            value={store.settings.partnerName}
            onChange={(e) => updateSettings({ partnerName: e.target.value })}
            placeholder="相手"
          />
        </div>
        <p className="settings-section-footer">記録画面や精算結果に表示される呼び方です（例: 妻、夫、相手）。</p>
      </div>

      <div className="section">
        <p className="section-label">データ</p>
        <div className="card">
          <div className="settings-row">
            <span className="settings-row-label">JSONエクスポート</span>
            <button type="button" className="text-button" onClick={handleExport}>
              書き出す
            </button>
          </div>
          <div className="settings-row">
            <span className="settings-row-label">JSONインポート</span>
            <button type="button" className="text-button" onClick={handleImportClick}>
              読み込む
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={handleFileSelected}
          />
        </div>
        {importError && <p className="settings-section-footer" style={{ color: "var(--color-danger)" }}>{importError}</p>}
        <p className="settings-section-footer">
          インポートすると現在のデータはすべて置き換わります。事前にエクスポートして控えておくことをおすすめします。
        </p>
      </div>

      <div className="section">
        <p className="section-label">データの削除</p>
        <div className="card">
          {deleteStep === 0 ? (
            <button type="button" className="text-button danger" onClick={handleDeleteAll}>
              すべてのデータを削除
            </button>
          ) : (
            <div>
              <p className="settings-section-footer" style={{ margin: "0 0 10px" }}>
                本当にすべての記録・精算履歴を削除しますか？この操作は元に戻せません。
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" className="secondary-button" onClick={() => setDeleteStep(0)}>
                  やめる
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  style={{ color: "var(--color-danger)" }}
                  onClick={handleDeleteAll}
                >
                  完全に削除する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="section">
        <p className="section-label">アプリについて</p>
        <div className="card about-text">
          <p style={{ margin: 0 }}>シンプル割り勘（Web版） v{APP_VERSION}</p>
          <p style={{ margin: "6px 0 0" }}>
            データはこの端末のブラウザ内にのみ保存されます。サーバーへの送信やアカウント登録はありません。
          </p>
        </div>
      </div>

      <div className="ad-slot" />
    </div>
  );
}
