# PlantUML図表作成サービス GitHub設定・テンプレート

## 1. ディレクトリ構造

```
.github/
├── workflows/
│   ├── ci.yml
│   ├── deploy.yml
│   ├── code-quality.yml
│   └── security.yml
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   ├── feature_request.md
│   ├── config.yml
│   └── performance_issue.md
├── PULL_REQUEST_TEMPLATE/
│   └── pull_request_template.md
├── dependabot.yml
├── CODEOWNERS
├── CONTRIBUTING.md
├── SECURITY.md
├── FUNDING.yml
└── commit-convention.md
```

## 2. コミットメッセージ規約

### 2.1 .github/commit-convention.md

```markdown
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
```

### 2.2 .gitmessage（グローバルテンプレート）

```
# <type>(<scope>): <subject>
# 
# <body>
# 
# <footer>
# 
# Type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
# Scope: auth, editor, project, diagram, practice, api, db, ui, deps
# Subject: 命令形で50文字以内
# Body: 何を、なぜ変更したか（72文字で改行）
# Footer: Breaking Changes, Closes #issue
```

## 3. Pull Requestテンプレート

### 3.1 .github/PULL_REQUEST_TEMPLATE/pull_request_template.md

```markdown
## 📋 概要
<!-- このPRで何を実現するか簡潔に説明してください -->

## 🔗 関連Issue
<!-- Closes #(issue番号) の形式で記載 -->
Closes #

## 📝 変更内容
<!-- 主な変更点をリスト形式で記載 -->
- [ ] 
- [ ] 
- [ ] 

## 🏷️ 変更の種類
<!-- 該当するものにチェック -->
- [ ] 🐛 バグ修正 (Bug fix)
- [ ] ✨ 新機能 (New feature)
- [ ] 💥 破壊的変更 (Breaking change)
- [ ] 📝 ドキュメント (Documentation)
- [ ] ♻️ リファクタリング (Refactoring)
- [ ] ⚡ パフォーマンス改善 (Performance)
- [ ] ✅ テスト (Test)
- [ ] 🔧 設定 (Configuration)
- [ ] 🎨 UI/UX (User Interface)

## 📸 スクリーンショット
<!-- UI変更の場合は、変更前後のスクリーンショットを添付 -->
<details>
<summary>変更前</summary>

<!-- スクリーンショットをここに貼り付け -->

</details>

<details>
<summary>変更後</summary>

<!-- スクリーンショットをここに貼り付け -->

</details>

## 🧪 テスト
<!-- どのようにテストしたか記載 -->

### テスト環境
- [ ] ローカル開発環境
- [ ] Docker環境
- [ ] ステージング環境

### テスト内容
```bash
# 実行したテストコマンド
php artisan test
npm run test
```

### テスト結果
- [ ] 全ての既存テストが通過
- [ ] 新規テストを追加
- [ ] 手動テスト完了

## 📚 ドキュメント
<!-- ドキュメントの更新が必要な場合はチェック -->
- [ ] README.md を更新
- [ ] API ドキュメントを更新
- [ ] インラインコメントを追加
- [ ] 型定義を更新

## ✅ チェックリスト
<!-- PRを作成する前に確認 -->
- [ ] コードは自己レビュー済み
- [ ] コメントを追加（特に複雑なロジック）
- [ ] ドキュメントを更新
- [ ] 変更によって既存機能が壊れていない
- [ ] 依存関係の変更がある場合は`package.json`/`composer.json`を更新
- [ ] データベースマイグレーションがある場合はロールバック可能
- [ ] 環境変数の追加がある場合は`.env.example`を更新
- [ ] セキュリティを考慮（SQLインジェクション、XSS等）
- [ ] パフォーマンスへの影響を考慮
- [ ] エラーハンドリングを実装

## 🚀 デプロイ前の確認
<!-- 本番デプロイ前に必要な作業 -->
- [ ] マイグレーションの実行が必要
- [ ] 環境変数の追加が必要
- [ ] キャッシュのクリアが必要
- [ ] 新しい依存関係のインストールが必要
- [ ] Cronジョブの追加/変更が必要

## 💬 レビュアーへのコメント
<!-- レビュアーに特に見てもらいたい点や懸念事項 -->

## 📎 参考リンク
<!-- 参考にした記事やドキュメントのリンク -->
- 

---
<!-- 
PRのタイトルは以下の形式で記載してください：
[Type] スコープ: 簡潔な説明
例: [feat] editor: 自動保存機能を追加
-->
```

## 4. Issueテンプレート

### 4.1 .github/ISSUE_TEMPLATE/bug_report.md

```markdown
---
name: 🐛 バグ報告
about: バグを報告して改善に協力
title: '[Bug] '
labels: 'bug, needs-triage'
assignees: ''
---

## 🐛 バグの概要
<!-- バグの内容を簡潔に説明してください -->

## 📍 再現手順
<!-- バグを再現する手順を記載してください -->
1. 
2. 
3. 
4. バグが発生

## 🎯 期待される動作
<!-- 正常な場合の動作を説明してください -->

## 💥 実際の動作
<!-- 実際に起きた動作を説明してください -->

## 📸 スクリーンショット
<!-- 可能であればスクリーンショットやエラーログを添付 -->

## 🌍 環境情報

### ブラウザ
- [ ] Chrome (バージョン: )
- [ ] Firefox (バージョン: )
- [ ] Safari (バージョン: )
- [ ] Edge (バージョン: )
- [ ] その他: 

### OS
- [ ] Windows 11
- [ ] Windows 10
- [ ] macOS (バージョン: )
- [ ] Linux (ディストリビューション: )
- [ ] iOS (バージョン: )
- [ ] Android (バージョン: )

### その他
- ユーザータイプ: [ ] ゲスト / [ ] ログインユーザー
- 発生頻度: [ ] 常に / [ ] 時々 / [ ] 一度だけ
- 発生開始時期: 

## 📝 エラーメッセージ
```
エラーメッセージやコンソールログをここに貼り付け
```

## 🔍 追加情報
<!-- その他、バグ解決に役立つ情報があれば記載 -->

## ✅ チェックリスト
- [ ] 既存のIssueを検索して重複がないことを確認した
- [ ] タイトルは具体的でわかりやすい
- [ ] 再現手順は明確で他の人も再現可能
- [ ] 必要な情報をすべて記載した
```

### 4.2 .github/ISSUE_TEMPLATE/feature_request.md

```markdown
---
name: ✨ 機能リクエスト
about: 新機能や改善のアイデアを提案
title: '[Feature] '
labels: 'enhancement, needs-triage'
assignees: ''
---

## ✨ 機能の概要
<!-- 提案する機能を簡潔に説明してください -->

## 🎯 解決したい課題
<!-- この機能がどんな問題を解決するか説明してください -->

### 現状の問題点
<!-- 現在困っていることを具体的に -->

### 理想の状態
<!-- この機能があればどうなるか -->

## 💡 提案する解決策
<!-- どのように実装すべきか、あなたのアイデアを共有してください -->

## 🔄 代替案
<!-- 検討した他の解決方法があれば記載 -->

## 📊 期待される効果
<!-- この機能によってもたらされる価値 -->
- [ ] ユーザー体験の向上
- [ ] パフォーマンスの改善
- [ ] 開発効率の向上
- [ ] セキュリティの強化
- [ ] その他: 

## 🎨 UIモックアップ
<!-- 可能であれば、UIの簡単なスケッチや説明を追加 -->

## 📚 参考資料
<!-- 参考になるサービスや記事のリンク -->
- 

## ✅ チェックリスト
- [ ] 既存のIssueを検索して重複がないことを確認した
- [ ] 機能の目的と価値が明確
- [ ] 実装可能性を考慮した
- [ ] プロジェクトの方向性に合致している
```

### 4.3 .github/ISSUE_TEMPLATE/performance_issue.md

```markdown
---
name: ⚡ パフォーマンス問題
about: パフォーマンスに関する問題を報告
title: '[Performance] '
labels: 'performance, needs-triage'
assignees: ''
---

## ⚡ 問題の概要
<!-- パフォーマンス問題の内容を説明してください -->

## 📍 発生箇所
<!-- どの機能/ページで問題が発生するか -->
- ページ/機能: 
- URL: 
- 操作: 

## 📊 パフォーマンス指標
<!-- 可能であれば具体的な数値を記載 -->
- 読み込み時間: 
- レスポンスタイム: 
- メモリ使用量: 
- CPU使用率: 

## 🔄 再現手順
1. 
2. 
3. 

## 🌍 環境情報
- ブラウザ: 
- OS: 
- ネットワーク: [ ] 高速 / [ ] 中速 / [ ] 低速
- デバイス: [ ] デスクトップ / [ ] ノートPC / [ ] タブレット / [ ] スマートフォン

## 📸 証拠
<!-- Performance ProfilerやNetwork タブのスクリーンショット -->

## 🎯 期待されるパフォーマンス
<!-- どの程度のパフォーマンスを期待しているか -->

## 📝 追加情報
<!-- その他関連する情報 -->
```

### 4.4 .github/ISSUE_TEMPLATE/config.yml

```yaml
blank_issues_enabled: false
contact_links:
  - name: 💬 ディスカッション
    url: https://github.com/your-org/plantuml-editor/discussions
    about: アイデアや質問はディスカッションで
  - name: 📚 ドキュメント
    url: https://docs.example.com/
    about: ドキュメントを確認
  - name: 🔒 セキュリティ問題
    url: https://github.com/your-org/plantuml-editor/security/policy
    about: セキュリティ脆弱性の報告はこちら
```

## 5. GitHub Actions ワークフロー

### 5.1 .github/workflows/ci.yml

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  PHP_VERSION: '8.4'
  NODE_VERSION: '20'

jobs:
  # Lintとコード品質チェック
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          tools: php-cs-fixer, phpstan
          
      - name: Get Composer cache directory
        id: composer-cache
        run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT
        
      - name: Cache Composer dependencies
        uses: actions/cache@v3
        with:
          path: ${{ steps.composer-cache.outputs.dir }}
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-
          
      - name: Install PHP dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
        
      - name: Run PHP CS Fixer
        run: vendor/bin/php-cs-fixer fix --dry-run --diff
        
      - name: Run PHPStan
        run: vendor/bin/phpstan analyse --level=8
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install Node dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
        
      - name: Run Prettier check
        run: npm run format:check
        
      - name: TypeScript type check
        run: npm run type-check

  # PHPテスト
  test-php:
    name: PHP Tests
    runs-on: ubuntu-latest
    needs: lint
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: test_db
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
          
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: ${{ env.PHP_VERSION }}
          extensions: mbstring, pdo_mysql, redis
          coverage: xdebug
          
      - name: Get Composer cache directory
        id: composer-cache
        run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT
        
      - name: Cache Composer dependencies
        uses: actions/cache@v3
        with:
          path: ${{ steps.composer-cache.outputs.dir }}
          key: ${{ runner.os }}-composer-${{ hashFiles('**/composer.lock') }}
          restore-keys: ${{ runner.os }}-composer-
          
      - name: Install dependencies
        run: composer install --no-progress --prefer-dist --optimize-autoloader
        
      - name: Prepare Laravel
        run: |
          cp .env.testing .env
          php artisan key:generate
          php artisan config:cache
          
      - name: Run migrations
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: test_db
          DB_USERNAME: root
          DB_PASSWORD: password
        run: php artisan migrate --force
        
      - name: Run tests with coverage
        env:
          DB_CONNECTION: mysql
          DB_HOST: 127.0.0.1
          DB_PORT: 3306
          DB_DATABASE: test_db
          DB_USERNAME: root
          DB_PASSWORD: password
          REDIS_HOST: 127.0.0.1
        run: php artisan test --coverage --min=80
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml
          fail_ci_if_error: true

  # JavaScriptテスト
  test-js:
    name: JavaScript Tests
    runs-on: ubuntu-latest
    needs: lint
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        
      - name: Run component tests
        run: npm run test:components
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: true

  # E2Eテスト
  test-e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: [test-php, test-js]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Start Docker services
        run: |
          docker-compose up -d
          sleep 10
          docker-compose exec -T app php artisan migrate --seed
          
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload Playwright report
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
          
      - name: Stop Docker services
        if: always()
        run: docker-compose down

  # ビルドテスト
  build:
    name: Build Assets
    runs-on: ubuntu-latest
    needs: lint
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build production assets
        run: npm run build
        
      - name: Check build size
        run: |
          echo "Build size report:"
          du -sh public/build/
          
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-assets
          path: public/build/
          retention-days: 1
```

### 5.2 .github/workflows/deploy.yml

```yaml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deployment environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

env:
  AWS_REGION: ap-northeast-1
  ECR_REPOSITORY: plantuml-editor
  ECS_SERVICE: plantuml-editor-service
  ECS_CLUSTER: plantuml-cluster

jobs:
  deploy:
    name: Deploy to ${{ github.event.inputs.environment || 'staging' }}
    runs-on: ubuntu-latest
    environment: ${{ github.event.inputs.environment || 'staging' }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-get-login@v2
        
      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
          
      - name: Fill in the new image ID in the Amazon ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: .aws/task-definition.json
          container-name: plantuml-app
          image: ${{ steps.build-image.outputs.image }}
          
      - name: Deploy Amazon ECS task definition
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
          
      - name: Run database migrations
        run: |
          aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition plantuml-migrate \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.SUBNET_IDS }}],securityGroups=[${{ secrets.SECURITY_GROUP_ID }}]}"
            
      - name: Clear cache
        run: |
          aws ecs run-task \
            --cluster ${{ env.ECS_CLUSTER }} \
            --task-definition plantuml-cache-clear \
            --launch-type FARGATE \
            --network-configuration "awsvpcConfiguration={subnets=[${{ secrets.SUBNET_IDS }}],securityGroups=[${{ secrets.SECURITY_GROUP_ID }}]}"
            
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: |
            Deployment to ${{ github.event.inputs.environment || 'staging' }} ${{ job.status }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

### 5.3 .github/workflows/code-quality.yml

```yaml
name: Code Quality

on:
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 0 * * 1' # 毎週月曜日

jobs:
  sonarcloud:
    name: SonarCloud Analysis
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Dependency Review
        uses: actions/dependency-review-action@v3

  code-complexity:
    name: Code Complexity Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          
      - name: Install dependencies
        run: composer install --no-progress
        
      - name: Check cyclomatic complexity
        run: vendor/bin/phpmetrics --report-html=metrics public
        
      - name: Upload metrics report
        uses: actions/upload-artifact@v3
        with:
          name: code-metrics
          path: metrics/
          retention-days: 30
```

### 5.4 .github/workflows/security.yml

```yaml
name: Security

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # 毎日

jobs:
  security-scan:
    name: Security Scanning
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  dependency-check:
    name: Dependency Security Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run Composer audit
        run: |
          composer install --no-scripts
          composer audit
          
      - name: Run npm audit
        run: |
          npm ci
          npm audit --audit-level=high

  secrets-scan:
    name: Secret Scanning
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## 6. その他の設定ファイル

### 6.1 .github/dependabot.yml

```yaml
version: 2
updates:
  # PHP dependencies
  - package-ecosystem: "composer"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 10
    reviewers:
      - "your-org/backend-team"
    labels:
      - "dependencies"
      - "php"
    commit-message:
      prefix: "chore"
      include: "scope"

  # JavaScript dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "Asia/Tokyo"
    open-pull-requests-limit: 10
    reviewers:
      - "your-org/frontend-team"
    labels:
      - "dependencies"
      - "javascript"
    commit-message:
      prefix: "chore"
      include: "scope"
    ignore:
      # 特定のパッケージを除外する場合
      - dependency-name: "webpack"
        versions: ["5.x"]

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "ci"
      include: "scope"

  # Docker
  - package-ecosystem: "docker"
    directory: "/docker/php"
    schedule:
      interval: "monthly"
    labels:
      - "dependencies"
      - "docker"
    commit-message:
      prefix: "build"
      include: "scope"
```

### 6.2 .github/CODEOWNERS

```
# Global owners
* @your-org/tech-leads

# Backend
/app/ @your-org/backend-team
/database/ @your-org/backend-team
/routes/ @your-org/backend-team
/tests/Feature/ @your-org/backend-team
/tests/Unit/ @your-org/backend-team
*.php @your-org/backend-team

# Frontend
/resources/js/ @your-org/frontend-team
/resources/css/ @your-org/frontend-team
/resources/views/ @your-org/frontend-team
*.tsx @your-org/frontend-team
*.ts @your-org/frontend-team
*.jsx @your-org/frontend-team
*.js @your-org/frontend-team

# Infrastructure
/docker/ @your-org/devops-team
/.github/ @your-org/devops-team
/infrastructure/ @your-org/devops-team
*.yml @your-org/devops-team
*.yaml @your-org/devops-team

# Documentation
/docs/ @your-org/docs-team
*.md @your-org/docs-team
README.md @your-org/tech-leads

# Security
/security/ @your-org/security-team
.env.example @your-org/security-team

# Database
/database/migrations/ @your-org/database-team @your-org/backend-team
```

### 6.3 .github/CONTRIBUTING.md

```markdown
# Contributing to PlantUML Editor

このプロジェクトへの貢献を検討いただき、ありがとうございます！

## 行動規範

このプロジェクトに参加するすべての人は、[Code of Conduct](CODE_OF_CONDUCT.md)に従う必要があります。

## 貢献の方法

### 🐛 バグ報告

1. [Issues](https://github.com/your-org/plantuml-editor/issues)で既存の問題を検索
2. 見つからない場合は[新しいIssue](https://github.com/your-org/plantuml-editor/issues/new/choose)を作成
3. バグ報告テンプレートを使用して詳細を記載

### ✨ 機能提案

1. [Discussions](https://github.com/your-org/plantuml-editor/discussions)でアイデアを議論
2. 合意が得られたら[Feature Request Issue](https://github.com/your-org/plantuml-editor/issues/new/choose)を作成

### 📝 ドキュメント改善

ドキュメントの誤字脱字、不明確な説明、追加が必要な情報などを見つけた場合は、PRを作成してください。

### 💻 コード貢献

#### 開発環境のセットアップ

```bash
# リポジトリをフォーク
# フォークをクローン
git clone https://github.com/your-username/plantuml-editor.git
cd plantuml-editor

# アップストリームを追加
git remote add upstream https://github.com/your-org/plantuml-editor.git

# DevContainerで開発
code .
# "Dev Containers: Reopen in Container"を実行
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

```bash
# Commitizenを使用（推奨）
npm run commit

# または手動で
git commit -m "feat(editor): add auto-save feature"
```

#### テスト

PRを作成する前に、すべてのテストが通ることを確認してください。

```bash
# PHPテスト
composer test
composer test:coverage

# JavaScriptテスト
npm run test
npm run test:coverage

# E2Eテスト
npm run test:e2e

# Lint
composer lint
npm run lint
```

#### Pull Request

1. フォークしたリポジトリにプッシュ
2. [PR作成](https://github.com/your-org/plantuml-editor/compare)
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

- [PHP/Laravel](docs/coding-standards/php.md)
- [TypeScript/React](docs/coding-standards/typescript.md)
- [CSS/Tailwind](docs/coding-standards/css.md)

### アーキテクチャ

- [システム設計](docs/architecture/system-design.md)
- [データベース設計](docs/architecture/database.md)
- [API設計](docs/architecture/api.md)

## 質問・サポート

- [Discussions](https://github.com/your-org/plantuml-editor/discussions)で質問
- [Discord](https://discord.gg/xxxxx)で議論

## ライセンス

このプロジェクトに貢献することで、あなたのコードが[MIT License](LICENSE)の下でライセンスされることに同意したものとみなされます。

## 謝辞

すべての貢献者に感謝します！

<!-- ALL-CONTRIBUTORS-LIST:START -->
<!-- ALL-CONTRIBUTORS-LIST:END -->
```

### 6.4 .github/SECURITY.md

```markdown
# Security Policy

## サポートされているバージョン

現在、以下のバージョンにセキュリティアップデートを提供しています：

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## 脆弱性の報告

セキュリティ脆弱性を発見した場合は、**公開のIssueを作成しないでください**。

### 報告方法

1. **メール**: security@example.com に詳細を送信
2. **GitHub Security Advisory**: [こちら](https://github.com/your-org/plantuml-editor/security/advisories/new)から報告

### 報告に含めるべき情報

- 脆弱性の種類
- 影響を受けるコンポーネント
- 再現手順
- 影響の範囲
- 可能であれば、修正案

### 対応プロセス

1. **24時間以内**: 受領確認の返信
2. **72時間以内**: 初期評価と深刻度の判定
3. **7日以内**: 修正計画の共有
4. **30日以内**: パッチのリリース（深刻度による）

### 報奨金プログラム

現在、報奨金プログラムは実施していませんが、貢献者としてクレジットさせていただきます。

## セキュリティベストプラクティス

### 開発者向け

- 依存関係を定期的に更新
- `composer audit` と `npm audit` を定期的に実行
- 環境変数に機密情報を保存
- SQLインジェクション対策（Eloquent ORM使用）
- XSS対策（Blade テンプレートエスケープ）
- CSRF対策（Laravel CSRFトークン）

### デプロイメント

- HTTPS を強制
- 適切なCORSヘッダー設定
- セキュリティヘッダーの設定
- ファイルアップロードの検証
- レート制限の実装

## 既知の脆弱性

現在、既知の脆弱性はありません。

## 連絡先

- セキュリティチーム: security@example.com
- PGP Key: [公開鍵](https://example.com/pgp-key.asc)

## 更新履歴

- 2024-01-15: ポリシー作成
- 2024-06-01: 連絡先更新
```

### 6.5 .github/FUNDING.yml

```yaml
# These are supported funding model platforms

github: [your-org]
patreon: # Replace with a single Patreon username
open_collective: # Replace with a single Open Collective username
ko_fi: # Replace with a single Ko-fi username
tidelift: # Replace with a single Tidelift platform-name/package-name
community_bridge: # Replace with a single Community Bridge project-name
liberapay: # Replace with a single Liberapay username
issuehunt: # Replace with a single IssueHunt username
otechie: # Replace with a single Otechie username
lfx_crowdfunding: # Replace with a single LFX Crowdfunding project-name
custom: # Replace with up to 4 custom sponsorship URLs
```

---

**文書バージョン**: 1.0  
**作成日**: 2025年1月  
**最終更新日**: 2025年1月