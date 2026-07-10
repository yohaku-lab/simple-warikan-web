import { useState } from "react";
import { detectInstallHintPlatform, isStandaloneDisplay } from "../core/installHint";

const DISMISSED_KEY = "simple-warikan:install-hint-dismissed";

/**
 * One-time banner nudging mobile browser users to add the app to their home screen —
 * on iOS that exempts the data from Safari's 7-day localStorage cleanup, so it's a data-
 * safety feature, not just convenience. Dismissal is remembered in its own localStorage
 * key (not the store) so importing/clearing data doesn't resurrect the banner.
 */
export function InstallHintBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return true;
    }
  });

  const platform = detectInstallHintPlatform(navigator.userAgent, isStandaloneDisplay());
  if (!platform || dismissed) return null;

  function handleDismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Storage unavailable — just hide for this page load.
    }
    setDismissed(true);
  }

  return (
    <div className="install-hint" role="note">
      <div className="install-hint-body">
        <p className="install-hint-title">ホーム画面に追加して使うのがおすすめ</p>
        <p className="install-hint-text">
          {platform === "ios"
            ? "ブラウザのままだと、7日間開かないとデータが自動削除されることがあります。共有ボタン（□↑）→「ホーム画面に追加」で通常のアプリのように使えます。"
            : "メニュー（⋮）→「アプリをインストール」（または「ホーム画面に追加」）で、通常のアプリのように使えてデータも消えにくくなります。"}
        </p>
      </div>
      <button type="button" className="install-hint-close" aria-label="閉じる" onClick={handleDismiss}>
        ×
      </button>
    </div>
  );
}
