# PlantUML図表作成サービス

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com) [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Latest-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com) [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

[![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net) [![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org) [![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com) [![Docker](https://img.shields.io/badge/Docker-Latest-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

PlantUMLを使用してUML図を簡単に作成・管理できるWebサービスです。テキストベースの記述から美しい図表への変換により、効率的なソフトウェア設計・モデリングを実現します。

## 主な機能

### ゲストユーザー
- PlantUMLエディタの使用
- リアルタイムプレビュー
- 図表のダウンロード（PNG/SVG/TXT形式）
- チートシート閲覧
- プラクティス問題への挑戦
- ローカルストレージによる一時保存（24時間）

### 認証ユーザー
- プロジェクト管理（最大3プロジェクト）
- 図表の永続的な保存
- 履歴管理・バージョン管理
- 学習進捗の保存
- 自動保存機能（30秒間隔）

### 対応図表タイプ
- ユースケース図
- クラス図
- アクティビティ図
- 状態図
- コンポーネント図
- シーケンス図
- ER図
- マインドマップ
- ガントチャート

## 技術スタック

### バックエンド
- **Laravel 12** - PHPフレームワーク
- **PHP 8.4** - サーバーサイド言語
- **Inertia.js** - モダンなSSRフレームワーク
- **PlantUML Server** - 図表生成エンジン
- **Pest** - テストフレームワーク
- **Larastan** - 静的解析（Level 10）

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS 4** - ユーティリティファーストCSS
- **shadcn/ui** - 再利用可能なUIコンポーネント
- **Monaco Editor** - コードエディタ
- **Vite** - 高速ビルドツール

### データベース・インフラストラクチャ
- **MySQL 8** - リレーショナルデータベース
- **Redis** - キャッシュ・セッション管理
- **Docker** - コンテナ化・開発環境
- **AWS EC2** - アプリケーションサーバー
- **AWS RDS Aurora** - データベース（MySQL互換）
- **AWS S3** - ファイルストレージ
- **AWS CloudFront** - CDN

## 環境構築

### 必要要件
- PHP 8.4以上
- Node.js 22以上
- MySQL 8以上
- Redis（オプション）
- Docker（推奨）
- Composer
- npm または yarn

### インストール

1. **リポジトリのクローン**
```bash
git clone <repository-url>
cd plantuml-server
```

2. **PHP依存関係のインストール**
```bash
composer install
```

3. **Node.js依存関係のインストール**
```bash
npm install
```

4. **環境ファイルの設定**
```bash
cp .env.example .env
php artisan key:generate
```

5. **データベースの設定**
```bash
# .envファイルでデータベース設定を編集後
php artisan migrate
php artisan db:seed
```

### 開発サーバーの起動

**フル開発環境（推奨）:**
```bash
composer dev
# Laravel server + queue + logs + Vite を同時起動
```

**個別起動:**
```bash
# バックエンド
php artisan serve

# フロントエンド
npm run dev
```

## 開発情報

### ディレクトリ構造
```
├── app/
│   ├── Http/Controllers/    # コントローラー
│   ├── Models/             # Eloquentモデル
│   └── Services/           # ビジネスロジック
├── resources/js/
│   ├── pages/              # Inertiaページコンポーネント
│   ├── components/         # 再利用可能コンポーネント
│   ├── layouts/           # レイアウトコンポーネント
│   └── hooks/             # カスタムフック
├── database/
│   ├── migrations/         # データベーススキーマ
│   └── seeders/           # 初期データ
└── docs/                  # プロジェクトドキュメント
```

### テスト実行

```bash
# バックエンドテスト（Pest）
composer test

# 静的解析（Larastan Level 10）
./vendor/bin/phpstan analyse

# フロントエンドテスト
npm run types        # TypeScriptチェック
npm run lint         # ESLint
npm run format       # Prettier
```

### コーディング規約

- **PHP**: PSR-1, PSR-2, PSR-4, PSR-12, Laravel標準
- **TypeScript**: Airbnb JavaScript Style Guide
- **React**: React/JSX Style Guide
- **CSS**: Tailwind CSS + BEM methodology

## ドキュメント

詳細なドキュメントは `docs/` ディレクトリにあります：

- [要件定義書](docs/requirements.md)
- [DB設計書](docs/er-diagram/db-design.md)
- [アーキテクチャ設計](docs/archetecture/inertia-structure.md)
- [画面設計書](docs/archetecture/screen-design.md)
- [テスト戦略](docs/test-driven-development/test-strategy.md)
- [サーバー連携](docs/server/server-integration.md)
- [コーディング規約](docs/coding-rule/coding-rules.md)

## 開発フェーズ

### Phase 1: MVP（2週間）
- [x] 基本的なエディタ機能実装
- [x] PlantUML → 図表変換機能
- [x] ゲストユーザー機能
- [x] ダウンロード機能

### Phase 2: ユーザー機能（2週間）
- [ ] ユーザー認証（Laravel Breeze）
- [ ] プロジェクト管理機能
- [ ] 図表の永続保存
- [ ] 履歴管理機能

### Phase 3: 学習機能（1週間）
- [ ] プラクティス問題機能
- [ ] 進捗管理機能
- [ ] テンプレート機能の拡充

### Phase 4: 本番環境構築（1週間）
- [ ] AWS環境構築
- [ ] CI/CDパイプライン構築
- [ ] 監視設定

## 貢献

プロジェクトへの貢献を歓迎します！詳細は[Contributing Guide](.github/CONTRIBUTING.md)をご覧ください。

### 開発者向け

- バグ報告: [Issues](https://github.com/recursion-curriculum/plantuml-server/issues/new/choose)
- 機能提案: [Feature Request](https://github.com/recursion-curriculum/plantuml-server/issues/new/choose)
- ディスカッション: [Discussions](https://github.com/recursion-curriculum/plantuml-server/discussions)

### コミット規約

[Conventional Commits](.github/commit-convention.md)に従ってください。

```bash
feat(editor): add auto-save functionality
fix(diagram): resolve memory leak issue
docs: update API documentation
```

## セキュリティ

セキュリティに関する問題を発見した場合は、[Security Policy](.github/SECURITY.md)に従って報告してください。
