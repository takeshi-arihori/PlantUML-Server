# Contributing to PlantUML Editor

このプロジェクトへの貢献を検討いただき、ありがとうございます！

## 貢献の方法

### 🐛 バグ報告

1. [Issues](https://github.com/recursion-curriculum/plantuml-server/issues)で既存の問題を検索
2. 見つからない場合は[新しいIssue](https://github.com/recursion-curriculum/plantuml-server/issues/new/choose)を作成
3. バグ報告テンプレートを使用して詳細を記載

### ✨ 機能提案

1. [Discussions](https://github.com/recursion-curriculum/plantuml-server/discussions)でアイデアを議論
2. 合意が得られたら[Feature Request Issue](https://github.com/recursion-curriculum/plantuml-server/issues/new/choose)を作成

### 📝 ドキュメント改善

ドキュメントの誤字脱字、不明確な説明、追加が必要な情報などを見つけた場合は、PRを作成してください。

### 💻 コード貢献

#### 開発環境のセットアップ

```bash
# リポジトリをフォーク
# フォークをクローン
git clone https://github.com/your-username/plantuml-server.git
cd plantuml-server

# アップストリームを追加
git remote add upstream https://github.com/recursion-curriculum/plantuml-server.git

# 依存関係のインストール
composer install
npm install

# 環境設定
cp .env.example .env
php artisan key:generate

# 開発サーバー起動
composer dev
```

#### ブランチ戦略

```bash
# 最新のmainを取得
git checkout main
git pull upstream main

# 機能ブランチを作成
git checkout -b feature/your-feature-name
# または
git checkout -b fix/your-bug-fix
```

ブランチ名の規則:
- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメント
- `refactor/` - リファクタリング
- `test/` - テスト追加/修正
- `chore/` - ビルド、ツール、依存関係

#### コミット規約

[Conventional Commits](https://www.conventionalcommits.org/)に従ってください。
詳細は[コミット規約](.github/commit-convention.md)を参照してください。

```bash
# 例
git commit -m "feat(editor): add auto-save feature"
git commit -m "fix(diagram): resolve memory leak in preview"
git commit -m "docs: update API documentation"
```

#### テスト

PRを作成する前に、すべてのテストが通ることを確認してください。

```bash
# PHPテスト
composer test
./vendor/bin/phpstan analyse

# JavaScriptテスト
npm run types
npm run lint
npm run format:check

# ビルドテスト
npm run build
```

#### Pull Request

1. フォークしたリポジトリにプッシュ
2. [PR作成](https://github.com/recursion-curriculum/plantuml-server/compare)
3. PRテンプレートを記入
4. CIがすべて通ることを確認
5. レビューを待つ

### 📋 レビュープロセス

1. 自動チェック（CI/CD）がすべて通る
2. 最低1人のレビュアーの承認が必要
3. コードオーナーの承認が必要（該当する場合）
4. マージはスクワッシュマージを使用

### 🏷️ ラベル

- `good first issue` - 初心者向け
- `help wanted` - 助けが必要
- `bug` - バグ
- `enhancement` - 機能改善
- `documentation` - ドキュメント
- `duplicate` - 重複
- `invalid` - 無効
- `wontfix` - 修正しない

## 開発ガイドライン

### コーディング規約

- [コーディング規約](docs/coding-rule/coding-rules.md)を参照
- PHP: PSR-1, PSR-2, PSR-4, PSR-12, Laravel標準
- TypeScript: Airbnb JavaScript Style Guide
- React: React/JSX Style Guide

### アーキテクチャ

- [システム設計](docs/archetecture/inertia-structure.md)
- [データベース設計](docs/er-diagram/db-design.md)
- [テスト戦略](docs/test-driven-development/test-strategy.md)

## 質問・サポート

- [Issues](https://github.com/recursion-curriculum/plantuml-server/issues)でバグ報告・機能提案
- [Discussions](https://github.com/recursion-curriculum/plantuml-server/discussions)で質問・議論

## ライセンス

このプロジェクトに貢献することで、あなたのコードが[MIT License](LICENSE)の下でライセンスされることに同意したものとみなされます。

## 謝辞

すべての貢献者に感謝します！