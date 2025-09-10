# PlantUML図表作成サービス

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
- **Inertia.js** - モダンなSSRフレームワーク
- **Pest** - テストフレームワーク
- **Larastan** - 静的解析（Level 10）

### フロントエンド
- **React 19** - UIライブラリ
- **TypeScript** - 型安全な開発
- **Tailwind CSS 4** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなUIコンポーネント
- **Monaco Editor** - コードエディタ

### インフラストラクチャ
- **AWS EC2** - アプリケーションサーバー
- **AWS RDS Aurora** - データベース（MySQL互換）
- **AWS S3** - ファイルストレージ
- **AWS CloudFront** - CDN

## 環境構築

### 必要要件
- PHP 8.2以上
- Node.js 20以上
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

## ライセンス

MIT License

---

**開発チーム**: Recursion Curriculum Project  
**作成日**: 2025年1月