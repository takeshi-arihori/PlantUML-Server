# Commit Message Convention

このプロジェクトでは、[Conventional Commits](https://www.conventionalcommits.org/) 仕様に従います。

## フォーマット

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type

必須。以下のいずれかを使用：

- **feat**: 新機能
- **fix**: バグ修正
- **docs**: ドキュメントのみの変更
- **style**: コードの意味に影響しない変更（空白、フォーマット、セミコロンなど）
- **refactor**: バグ修正や機能追加を含まないコード変更
- **perf**: パフォーマンス改善
- **test**: テストの追加や修正
- **build**: ビルドシステムや外部依存関係に影響する変更
- **ci**: CI設定ファイルとスクリプトの変更
- **chore**: その他の変更（ドキュメント生成など）
- **revert**: 以前のコミットを取り消す

## Scope

オプション。変更の影響範囲を示す：

- **auth**: 認証関連
- **editor**: エディタ機能
- **project**: プロジェクト管理
- **diagram**: 図表生成
- **practice**: 練習問題機能
- **api**: API関連
- **db**: データベース
- **ui**: UI/UXコンポーネント
- **deps**: 依存関係

## Subject

必須。変更の簡潔な説明：

- 命令形、現在形を使用（"change" not "changed" nor "changes"）
- 最初の文字を大文字にしない
- 末尾にピリオドを付けない
- 50文字以内

## Body

オプション。変更の動機と以前の動作との対比を説明：

- 72文字で改行
- 何を、なぜ変更したかを説明（どのように変更したかではない）

## Footer

オプション。Breaking Changesやクローズするissueを記載：

- Breaking Changesは`BREAKING CHANGE:`で始める
- Issue参照は`Closes #123`または`Fixes #123`

## 例

### 新機能追加
```
feat(editor): add auto-save functionality

Implement auto-save feature that saves user's work every 30 seconds
for authenticated users. This prevents data loss due to unexpected
browser crashes or network issues.

- Add auto-save service
- Add visual indicator in status bar
- Store unsaved changes in localStorage as backup

Closes #234
```

### バグ修正
```
fix(diagram): resolve memory leak in preview generation

The diagram preview component was not properly cleaning up event
listeners when unmounting, causing memory leaks in long-running
sessions.

Added cleanup in useEffect return function.

Fixes #456
```

### 破壊的変更
```
feat(api)!: change diagram generation endpoint response format

BREAKING CHANGE: The response format of /api/generate-diagram has
changed from returning direct URLs to returning an object with
metadata.

Before:
{
  "svg": "url",
  "png": "url"
}

After:
{
  "formats": {
    "svg": { "url": "...", "size": "..." },
    "png": { "url": "...", "size": "..." }
  },
  "metadata": { ... }
}

Migration guide available in docs/migration/v2.md
```

### リバート
```
revert: feat(editor): add auto-save functionality

This reverts commit 3d5c2b1a4f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c.

The auto-save feature was causing performance issues in Safari.
Need to optimize the implementation before re-introducing.

Refs #234
```

## Commitizen（推奨）

対話的にコミットメッセージを作成：

```bash
npm install -g commitizen
npm install -g cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
```

使用方法：
```bash
git add .
git cz
```

## Commitlint設定

コミットメッセージの自動検証：

```bash
npm install --save-dev @commitlint/config-conventional @commitlint/cli
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```