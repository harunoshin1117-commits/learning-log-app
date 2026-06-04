# 勉強ログアプリ

毎日学んだことを記録できる、HTML / CSS / JavaScript だけのシンプルなWebアプリです。

## 機能

- 学習内容の入力
- カテゴリ選択
  - JavaScript
  - Codex
  - Git
  - AI活用
  - その他
- 今日の学習ログ保存
- 保存済みログ一覧表示
- カテゴリ絞り込み
- キーワード検索
- ログ削除
- 今日学んだ数の表示
- localStorageへの保存
- スマホ対応レイアウト

## ファイル構成

```text
learning-log-app/
├── index.html
├── style.css
├── README.md
└── js/
    ├── app.js
    ├── storage.js
    └── render.js
```

## 使い方

1. VS Codeでこのフォルダを開きます。
2. `index.html` をGo Liveで開きます。
3. カテゴリを選び、学習内容を入力して「保存する」を押します。
4. 保存済みログは一覧に表示されます。
5. カテゴリやキーワードでログを絞り込めます。
6. 不要なログは「削除」ボタンで削除できます。

保存データはブラウザのlocalStorageに保存されます。別のブラウザや別の端末には自動同期されません。

## GitHub Pagesで公開する手順

1. GitHubで新しいリポジトリを作成します。
2. このフォルダ内のファイルをリポジトリに追加してpushします。
3. GitHubのリポジトリ画面で `Settings` を開きます。
4. `Pages` を開きます。
5. `Build and deployment` の `Source` で `Deploy from a branch` を選びます。
6. `Branch` で公開したいブランチを選び、フォルダは `/root` を選びます。
7. `Save` を押します。
8. 表示されたGitHub PagesのURLにアクセスします。

このアプリは相対パスで作っているため、GitHub Pagesのサブパス公開でも動きやすい構成です。

## 今後の改善案

- 編集機能を追加する
- 月別やカテゴリ別の集計を追加する
- 学習時間の入力を追加する
- CSVエクスポート機能を追加する
- ダークモードを追加する
