# simple-warikan-web（シンプル生活費精算）

2人（カップル・夫婦を想定）で家賃・光熱費など生活費を割り勘するための、記録して月ごとに精算するだけのシンプルなWebアプリ。iOSネイティブアプリ `../simple-warikan` のWeb移植版。Vite + React + TypeScriptの完全静的サイトで、サーバー・アカウントなし、自分の端末のブラウザ（localStorage）だけにデータを保持する。

## アプリ名について

- ユーザー向けの名称は**「シンプル生活費精算」**（ホーム画面表示は「生活費精算」）。2026-07-14に「シンプル割り勘」から改名した — 姉妹アプリ「シンプル傾斜割り勘」と紛らわしかったため。
- リポジトリ名・ディレクトリ名（`simple-warikan-web`）とlocalStorageキー（`simple-warikan:store`・`simple-warikan:install-hint-dismissed`）は**旧名のまま意図的に維持**している。特にlocalStorageキーを変えると公開済みユーザーの既存データが読めなくなるので、改名に追随させないこと。
- 名称を変える場合の変更箇所: `index.html`（title・description・apple-mobile-web-app-title）、`vite.config.ts`（PWA manifest）、`SettingsView`（アプリについて欄・エクスポートのファイル名）。

## iOS版との関係

- ロジック（ドメインモデル・精算計算・月キー生成）は `../simple-warikan/SimpleWarikanCore/` の仕様を1:1で移植した。`src/core/expense.ts`・`src/core/monthKey.ts`・`src/core/settlement.ts` がそれぞれ `Expense.swift`・`MonthKey.swift`・`Settlement.swift`+`SettlementCalculator.swift` に対応する。
- **コード共有は一切していない**。iOS版リポジトリは参照のみで、変更もしていない。Swift → TypeScriptへの書き写しであり、ビルド成果物やパッケージの依存関係は完全に独立している。
- UIもSwiftUIビューの構成・文言を参考にTypeScript/Reactで再構築した（`RecordExpenseView.swift` → `src/views/RecordView.tsx` など）。StoreKit課金・WidgetKitウィジェット・アプリアイコン変更はWeb版には存在しない（後述）。

## ドメインロジックで意図的に変えた点

- **`settle()`の丸め処理**: iOS版は`Decimal`（10進数の任意精度演算）で計算するため浮動小数点誤差が原理的に発生しない。JavaScriptには`Decimal`相当の型が標準にないため、`src/core/settlement.ts`の`settle()`は「支出ごとに`amount * selfSharePercent`を整数のまま合計し、最後に一度だけ100で割る」実装にして、33%のような割り切れない負担割合が複数月にまたがっても浮動小数点誤差で「精算済み」判定が狂わないようにしている（単純に`Expense`ごとの端数を都度合計するとテストで再現できる誤差が乗る）。
- Node.js 22以降には`--experimental-webstorage`によるグローバル`localStorage`があり、これがjsdomの`localStorage`と衝突してテストが壊れる（`localStorage.clear is not a function`）。`npm test`は`cross-env NODE_OPTIONS=--no-experimental-webstorage`を付けて起動することでこれを回避している（`package.json`参照）。

## 意図的にやらないこと

- **サーバー同期・アカウント・複数デバイス間共有はしない**。データはこの端末のブラウザのlocalStorageにのみ保存され、精算結果は相手に口頭/LINEで伝える運用を前提にしている（iOS版と同じ方針）。
- **3人以上の割り勘には対応しない**（2人固定）。
- **課金機能はない**。iOS版にあるStoreKit課金（ウィジェット・アプリアイコン変更の解放）はWeb版には存在しない — ウィジェットもアプリアイコン変更もWebでは概念自体が存在しないため。
- 外部チャートライブラリを使わない。履歴タブの月別推移グラフ（`src/components/MonthlyBalanceChart.tsx`）は素のSVGで自作している。
- UIフレームワーク（Tailwind等）を使わない。プレーンCSS + CSS変数でテーマ管理している（`src/index.css`）。

## 構成

- `src/core/` — ドメインロジック（サーバー・DOM非依存、Vitestで単体テスト可能）。`expense.ts`・`monthKey.ts`・`settlement.ts`・`format.ts`（金額/日付フォーマット、IME全角数字の正規化`normalizeAmountText`含む）・`installHint.ts`（ホーム画面追加バナーの表示判定）。
- `src/storage/schema.ts` — localStorageの読み書きとバージョン付きスキーマのバリデーション（`parseStore`はJSONインポート時のバリデーションにも流用している）。`persist.ts` — `navigator.storage.persist()`のベストエフォート要求。ページロード時ではなく支出の保存・インポート時に呼ぶ（Firefoxはここで許可ダイアログを出すため、意味のある操作に紐づけている）。
- 金額入力は`src/components/AmountInput.tsx`に共通化している。IME変換中のテキストを`onChange`で加工すると日本語IMEがオンのとき入力が全消しされるため、変換中は素通しし、確定（compositionend）時に全角→半角正規化する。金額欄を触るときはこの制約を壊さないこと。
- `src/components/InstallHintBanner.tsx` — モバイルブラウザ（非スタンドアロン時のみ）にホーム画面追加を促す一度きりのバナー。iOS Safariの「7日間未訪問でlocalStorage自動削除」対策の中核（ホーム画面Webアプリは対象外になる）。閉じた記録はストアとは別のlocalStorageキーに持つ。
- `src/store/StoreContext.tsx` — アプリ全体の状態を持つ唯一のReact Context。全ミューテーションは`localStorage`へ同期的に保存される。
- `src/hooks/` — `useMonthExpenses`（月ごとの支出抽出・ソート）・`useHistoryMonths`（履歴タブの月別サマリー集計）。
- `src/views/` — 4タブ本体: `RecordView`（記録）・`MonthPage`（今月／履歴ドリルインの共通実装）・`HistoryView`（履歴）・`SettingsView`（設定）。
- `src/components/` — `ExpenseEditModal`（追加・編集共通）・`SettlementSummary`・`MonthlyBalanceChart`・`PayerSegment`・`ShareSlider`・`TabBar`・`Toast`・`icons.tsx`。
- `src/App.tsx` — 4タブをすべて常時マウントし、CSSの`display`切り替えでタブ遷移する（タブを離れても入力中のフォーム状態が消えないようにするため。条件付きレンダリングだとタブ切り替えでアンマウント→状態消失してしまう）。
- `scripts/generate-icons.mjs` — PWAアイコン（`public/icon-192.png`・`icon-512.png`・`favicon.svg`）をSVGから生成するスクリプト。`node scripts/generate-icons.mjs`で再生成できる。

## ビルド・テスト（CLIから）

```sh
npm install
npm run test        # Vitest（単体テスト、全パス確認済み）
npm run build       # tsc -b && vite build（型チェック含む、成功確認済み）
npx tsc --noEmit    # 型チェックのみ実行したい場合
npm run dev         # 開発サーバー
npm run dev -- --host  # LAN公開（iPhone実機からMacのIP:5173で確認する時。.claude/launch.jsonは--host付き）
```

## Cloudflare Pagesへのデプロイ

1. このリポジトリをGitHubに接続するか、Cloudflare Pagesの「Direct Upload」で`dist/`をアップロードする。
2. ビルド設定:
   - ビルドコマンド: `npm run build`
   - ビルド出力ディレクトリ: `dist`
   - ルートディレクトリ: `simple-warikan-web`（モノレポの一部として置く場合）
3. 環境変数は不要（完全静的サイト、サーバーAPIなし）。
4. PWAのService Worker（`vite-plugin-pwa`, `autoUpdate`）はビルド時に`dist/sw.js`として出力される。Cloudflare Pages側で追加設定は不要。

## 広告（AdSense）を入れる場合

各ページ（`RecordView`・`MonthPage`・`HistoryView`・`SettingsView`）のスクロール領域末尾に`<div className="ad-slot" />`を置いてあるだけで、現時点では何も描画していない（`.ad-slot`は`src/index.css`内でコメント付きで定義）。広告ユニットを追加する際はこの要素を差し替える想定。AdSenseの審査・ポリシー確認は別途必要。
