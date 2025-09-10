# PlantUML図表作成サービス テスト戦略書

## 1. テスト戦略概要

### 1.1 テスト方針
- **TDD（Test-Driven Development）**を採用
- Red → Green → Refactorのサイクルを徹底
- テストカバレッジ目標：80%以上

### 1.2 使用ツール
#### バックエンド（Laravel）
- **PHPUnit**: 単体テスト・機能テスト
- **Larastan**: 静的解析（PHPStan for Laravel）
- **PHP CS Fixer**: コードスタイル統一
- **Pest PHP**: より読みやすいテスト記述（オプション）

#### フロントエンド（React）
- **Vitest**: 単体テスト・コンポーネントテスト
- **React Testing Library**: DOM テスト
- **MSW (Mock Service Worker)**: APIモック
- **Playwright**: E2Eテスト
- **Storybook**: UIコンポーネント開発・ビジュアルテスト・デザインシステム

#### 共通
- **GitHub Actions**: CI/CD
- **Docker**: テスト環境の統一

## 2. Larastan設定

### 2.1 インストールと設定

```bash
composer require --dev nunomaduro/larastan
```

### 2.2 phpstan.neon設定

```yaml
includes:
    - ./vendor/nunomaduro/larastan/extension.neon

parameters:
    paths:
        - app
        - database/factories
        - database/seeders
        
    level: 8  # 最高レベルの厳密性
    
    ignoreErrors:
        - '#Unsafe usage of new static#'
        
    checkMissingIterableValueType: false
    
    excludePaths:
        - app/Http/Controllers/Auth/*  # Breeze生成コード
```

### 2.3 実行コマンド

```bash
# Larastan実行
./vendor/bin/phpstan analyse

# レベル指定で実行
./vendor/bin/phpstan analyse --level=5

# メモリ制限を増やして実行
./vendor/bin/phpstan analyse --memory-limit=2G
```

## 3. バックエンドテスト（PHPUnit）

### 3.1 ディレクトリ構造

```
tests/
├── Unit/           # 単体テスト
│   ├── Models/
│   ├── Services/
│   └── Helpers/
├── Feature/        # 機能テスト（Inertia）
│   ├── Auth/
│   ├── ProjectManagement/
│   ├── DiagramEditor/
│   └── Practice/
└── TestCase.php    # 基底テストクラス
```

### 3.2 単体テストサンプル

```php
<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function user_can_have_maximum_three_projects()
    {
        // Arrange
        $user = User::factory()->create();
        
        // Act
        Project::factory()->count(3)->create(['user_id' => $user->id]);
        
        // Assert
        $this->assertCount(3, $user->projects);
        $this->expectException(\Exception::class);
        
        // Act - 4つ目のプロジェクト作成を試みる
        Project::factory()->create(['user_id' => $user->id]);
    }

    /** @test */
    public function project_can_have_maximum_ten_diagrams()
    {
        // Arrange
        $project = Project::factory()->create();
        
        // Act & Assert
        $this->assertLessThanOrEqual(10, $project->diagrams()->count());
    }
}
```

### 3.3 Inertia機能テストサンプル

```php
<?php

namespace Tests\Feature\DiagramEditor;

use Tests\TestCase;
use App\Models\User;
use App\Models\Project;
use Inertia\Testing\AssertableInertia as Assert;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DiagramEditorTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function authenticated_user_can_access_editor()
    {
        // Arrange
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        
        // Act
        $response = $this->actingAs($user)
            ->get(route('editor.index', $project));
        
        // Assert
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Editor/Index')
            ->has('project')
            ->where('project.id', $project->id)
            ->has('diagrams')
            ->has('templates')
        );
    }

    /** @test */
    public function guest_user_can_access_editor_without_saving()
    {
        // Act
        $response = $this->get(route('editor.guest'));
        
        // Assert
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Editor/Guest')
            ->has('templates')
            ->missing('project')
            ->where('canSave', false)
        );
    }

    /** @test */
    public function editor_generates_diagram_from_plantuml_code()
    {
        // Arrange
        $user = User::factory()->create();
        $project = Project::factory()->create(['user_id' => $user->id]);
        $plantUmlCode = '@startuml\nclass User\n@enduml';
        
        // Act
        $response = $this->actingAs($user)
            ->post(route('diagram.generate'), [
                'project_id' => $project->id,
                'plantuml_code' => $plantUmlCode,
                'diagram_type' => 'class'
            ]);
        
        // Assert
        $response->assertSuccessful();
        $response->assertJson([
            'svg_url' => true,
            'png_url' => true,
        ]);
    }
}
```

## 4. フロントエンドテスト（Vitest）

### 4.1 ディレクトリ構造

```
resources/js/
├── __tests__/
│   ├── unit/          # 単体テスト
│   │   ├── utils/
│   │   └── hooks/
│   ├── components/    # コンポーネントテスト
│   │   ├── Editor/
│   │   ├── Dashboard/
│   │   └── Practice/
│   └── integration/   # 統合テスト
├── stories/           # Storybook Stories
│   ├── components/
│   │   ├── Editor/
│   │   ├── Dashboard/
│   │   └── Practice/
│   └── pages/
└── test-utils/
    ├── setup.ts
    └── mocks/
```

### 4.2 Vitest設定（vite.config.js）

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './resources/js/test-utils/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'resources/js/test-utils/',
            ]
        }
    },
});
```

### 4.3 Storybook設定

#### 4.3.1 インストール

```bash
# Storybook初期化
npx storybook@latest init

# 必要なアドオンをインストール
npm install --save-dev @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-a11y @storybook/addon-viewport
```

#### 4.3.2 .storybook/main.ts設定

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../resources/js/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (config) => {
    // Viteの設定をStorybookに適用
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': '/resources/js',
        },
      },
    };
  },
};

export default config;
```

#### 4.3.3 Storyのサンプル

```typescript
// resources/js/stories/components/Editor/MonacoEditor.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import MonacoEditor from '@/Components/Editor/MonacoEditor';

const meta: Meta<typeof MonacoEditor> = {
  title: 'Components/Editor/MonacoEditor',
  component: MonacoEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'PlantUMLコード編集用のMonacoEditorコンポーネント',
      },
    },
  },
  argTypes: {
    value: {
      control: 'text',
      description: 'PlantUMLコード',
    },
    language: {
      control: 'select',
      options: ['plantuml', 'text'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '@startuml\nclass User {\n  +name: String\n  +email: String\n}\n@enduml',
    language: 'plantuml',
    onChange: () => {},
  },
};

export const Empty: Story = {
  args: {
    value: '',
    language: 'plantuml',
    onChange: () => {},
  },
};

export const ComplexDiagram: Story = {
  args: {
    value: `@startuml
class User {
  +id: bigint
  +name: String
  +email: String
  +password: String
  --
  +createProject(): Project
  +deleteProject(id: bigint): void
}

class Project {
  +id: bigint
  +name: String
  +description: String
  --
  +addDiagram(): Diagram
  +removeDiagram(id: bigint): void
}

class Diagram {
  +id: bigint
  +name: String
  +plantuml_code: String
  --
  +render(): String
  +export(format: String): File
}

User ||--o{ Project : "owns"
Project ||--o{ Diagram : "contains"
@enduml`,
    language: 'plantuml',
    onChange: () => {},
  },
};

// インタラクションテスト付きのStory
export const WithInteractions: Story = {
  args: {
    value: '@startuml\nclass Test\n@enduml',
    language: 'plantuml',
    onChange: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = canvas.getByRole('textbox');
    
    // エディターにフォーカス
    await userEvent.click(editor);
    
    // コードを追加
    await userEvent.type(editor, '\nclass NewClass');
    
    // 期待する動作をテスト
    expect(editor).toHaveValue(expect.stringContaining('class NewClass'));
  },
};
```

#### 4.3.4 ビジュアルリグレッションテスト

```typescript
// resources/js/stories/components/Dashboard/ProjectCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ProjectCard from '@/Components/Dashboard/ProjectCard';

const meta: Meta<typeof ProjectCard> = {
  title: 'Components/Dashboard/ProjectCard',
  component: ProjectCard,
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    project: {
      id: 1,
      name: 'サンプルプロジェクト',
      description: 'これはサンプルプロジェクトです',
      diagramsCount: 5,
      lastUpdated: '2024-01-15T10:30:00Z',
    },
  },
};

export const LongName: Story = {
  args: {
    project: {
      id: 2,
      name: 'とても長いプロジェクト名のテストケースです。この名前は非常に長く、UIの表示確認のために使用されます。',
      description: '長い名前のプロジェクト説明文も含まれています。',
      diagramsCount: 12,
      lastUpdated: '2024-01-10T15:45:00Z',
    },
  },
};

export const NoDiagrams: Story = {
  args: {
    project: {
      id: 3,
      name: '空のプロジェクト',
      description: 'まだ図表が作成されていないプロジェクト',
      diagramsCount: 0,
      lastUpdated: '2024-01-20T09:00:00Z',
    },
  },
};

// レスポンシブテスト
export const MobileView: Story = {
  ...Default,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

### 4.4 コンポーネントテストサンプル

```typescript
// resources/js/__tests__/components/Editor/MonacoEditor.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MonacoEditor from '@/Components/Editor/MonacoEditor';

describe('MonacoEditor', () => {
    it('renders editor with initial value', () => {
        const initialCode = '@startuml\nclass Test\n@enduml';
        
        render(
            <MonacoEditor
                value={initialCode}
                onChange={vi.fn()}
            />
        );
        
        expect(screen.getByText(/class Test/)).toBeInTheDocument();
    });
    
    it('calls onChange when content changes', async () => {
        const handleChange = vi.fn();
        const user = userEvent.setup();
        
        render(
            <MonacoEditor
                value=""
                onChange={handleChange}
            />
        );
        
        const editor = screen.getByRole('textbox');
        await user.type(editor, '@startuml');
        
        await waitFor(() => {
            expect(handleChange).toHaveBeenCalledWith('@startuml');
        });
    });
    
    it('shows syntax highlighting for PlantUML', () => {
        render(
            <MonacoEditor
                value="@startuml"
                onChange={vi.fn()}
                language="plantuml"
            />
        );
        
        const highlighted = screen.getByText('@startuml');
        expect(highlighted).toHaveClass('token-keyword');
    });
});
```

### 4.4 Inertiaページコンポーネントテスト

```typescript
// resources/js/__tests__/components/Pages/Editor.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { usePage } from '@inertiajs/react';
import Editor from '@/Pages/Editor/Index';

vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
    router: {
        post: vi.fn(),
    },
}));

describe('Editor Page', () => {
    it('displays project name for authenticated user', () => {
        vi.mocked(usePage).mockReturnValue({
            props: {
                project: {
                    id: 1,
                    name: 'My Project',
                },
                diagrams: [],
                auth: {
                    user: { id: 1, name: 'Test User' }
                }
            }
        });
        
        render(<Editor />);
        
        expect(screen.getByText('My Project')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });
    
    it('hides save button for guest user', () => {
        vi.mocked(usePage).mockReturnValue({
            props: {
                diagrams: [],
                auth: { user: null }
            }
        });
        
        render(<Editor />);
        
        expect(screen.queryByText('Save')).not.toBeInTheDocument();
        expect(screen.getByText('Download')).toBeInTheDocument();
    });
});
```

## 5. E2Eテスト（Playwright）

### 5.1 ディレクトリ構造

```
e2e/
├── tests/
│   ├── auth.spec.ts
│   ├── editor.spec.ts
│   ├── dashboard.spec.ts
│   └── practice.spec.ts
├── fixtures/
│   └── test-data.ts
└── playwright.config.ts
```

### 5.2 E2Eテストサンプル

```typescript
// e2e/tests/editor.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PlantUML Editor', () => {
    test('guest can create and download diagram', async ({ page }) => {
        // Navigate to editor
        await page.goto('/editor');
        
        // Type PlantUML code
        await page.locator('.monaco-editor').click();
        await page.keyboard.type('@startuml\nclass User {\n  +name: String\n}\n@enduml');
        
        // Wait for preview to update
        await page.waitForSelector('svg.plantuml-diagram');
        
        // Check preview is visible
        const svg = await page.locator('svg.plantuml-diagram');
        await expect(svg).toBeVisible();
        
        // Download PNG
        const downloadPromise = page.waitForEvent('download');
        await page.getByRole('button', { name: 'Download PNG' }).click();
        const download = await downloadPromise;
        
        expect(download.suggestedFilename()).toContain('.png');
    });
    
    test('authenticated user can save diagram', async ({ page }) => {
        // Login
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.getByRole('button', { name: 'Log in' }).click();
        
        // Navigate to editor
        await page.goto('/dashboard');
        await page.getByRole('button', { name: 'New Diagram' }).click();
        
        // Create diagram
        await page.locator('.monaco-editor').click();
        await page.keyboard.type('@startuml\nclass Test\n@enduml');
        
        // Save diagram
        await page.fill('input[name="diagram_name"]', 'Test Diagram');
        await page.getByRole('button', { name: 'Save' }).click();
        
        // Check success message
        await expect(page.locator('.toast-success')).toHaveText('Diagram saved successfully');
        
        // Verify in dashboard
        await page.goto('/dashboard');
        await expect(page.getByText('Test Diagram')).toBeVisible();
    });
});
```

## 6. TDD実践フロー

### 6.1 新機能開発時のTDDサイクル

1. **Red Phase（失敗するテストを書く）**
```php
/** @test */
public function diagram_has_version_history()
{
    $diagram = Diagram::factory()->create();
    
    $diagram->updateCode('new code');
    
    $this->assertCount(2, $diagram->histories);
}
```

2. **Green Phase（テストを通す最小限の実装）**
```php
public function updateCode($newCode)
{
    $this->histories()->create([
        'version' => $this->histories()->count() + 1,
        'plantuml_code' => $newCode,
    ]);
    
    $this->update(['plantuml_code' => $newCode]);
}
```

3. **Refactor Phase（コードを改善）**
```php
public function updateCode($newCode)
{
    DB::transaction(function () use ($newCode) {
        $this->createHistory();
        $this->update(['plantuml_code' => $newCode]);
        $this->generateDiagram();
    });
}
```

### 6.2 テスト駆動の開発順序

1. **Model層のテスト → 実装**
2. **Service層のテスト → 実装**
3. **Controller層のテスト → 実装**
4. **Reactコンポーネントのテスト → 実装**
5. **Storybookでコンポーネント仕様確認**
6. **統合テスト → 調整**
7. **E2Eテスト → 最終確認**

## 7. CI/CD設定

### 7.1 GitHub Actions設定

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  larastan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
      - name: Install Dependencies
        run: composer install -q --no-ansi --no-interaction --no-scripts --no-progress --prefer-dist
      - name: Run Larastan
        run: ./vendor/bin/phpstan analyse

  phpunit:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: test_db
          MYSQL_ROOT_PASSWORD: password
        ports:
          - 3306:3306
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
      - name: Install Dependencies
        run: composer install
      - name: Run Tests
        run: php artisan test --coverage

  vitest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install Dependencies
        run: npm ci
      - name: Run Vitest
        run: npm run test:unit
      - name: Coverage Report
        run: npm run test:coverage

  storybook:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install Dependencies
        run: npm ci
      - name: Build Storybook
        run: npm run build-storybook
      - name: Run Storybook Tests
        run: npm run test-storybook

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E Tests
        run: npm run test:e2e
```

## 8. テストデータ管理

### 8.1 Factoryパターン

```php
// database/factories/DiagramFactory.php
namespace Database\Factories;

use App\Models\Diagram;
use Illuminate\Database\Eloquent\Factories\Factory;

class DiagramFactory extends Factory
{
    protected $model = Diagram::class;

    public function definition()
    {
        return [
            'name' => $this->faker->words(3, true),
            'diagram_type' => $this->faker->randomElement(['class', 'sequence', 'use_case']),
            'plantuml_code' => $this->generateSamplePlantUml(),
        ];
    }
    
    private function generateSamplePlantUml()
    {
        return "@startuml\nclass {$this->faker->word} {\n}\n@enduml";
    }
}
```

### 8.2 Seederパターン

```php
// database/seeders/TestDataSeeder.php
class TestDataSeeder extends Seeder
{
    public function run()
    {
        if (app()->environment('testing')) {
            User::factory()
                ->has(Project::factory()->count(2)
                    ->has(Diagram::factory()->count(5)))
                ->count(3)
                ->create();
        }
    }
}
```

## 9. パフォーマンステスト

### 9.1 負荷テスト

```php
/** @test */
public function can_handle_concurrent_diagram_generation()
{
    $users = User::factory()->count(10)->create();
    
    $responses = [];
    foreach ($users as $user) {
        $responses[] = $this->actingAs($user)
            ->postJson('/api/generate-diagram', [
                'code' => '@startuml\nclass Test\n@enduml'
            ]);
    }
    
    foreach ($responses as $response) {
        $response->assertSuccessful();
    }
    
    $this->assertLessThan(1000, $this->getExecutionTime());
}
```

## 10. Storybookを活用した開発戦略

### 10.1 コンポーネント駆動開発（CDD）

1. **デザインシステムの構築**
   - 基本的なUIコンポーネント（Button, Input, Card等）をStorybookで管理
   - 色、フォント、スペーシングなどのデザイントークンを定義

2. **コンポーネント仕様の明確化**
   - PropsのバリエーションをStoriesで網羅
   - エラー状態、ローディング状態等の状態管理も含める

3. **ビジュアルテスト**
   - Chromaticやreg-suitを使用したビジュアルリグレッションテスト
   - レスポンシブデザインの確認

### 10.2 Storybook実行コマンド

```bash
# Storybook開発サーバー起動
npm run storybook

# Storybookビルド
npm run build-storybook

# Storybookテスト実行
npm run test-storybook

# インタラクションテスト実行
npm run test-storybook -- --watch
```

### 10.3 package.json設定例

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test-storybook": "test-storybook",
    "test:unit": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  },
  "devDependencies": {
    "@storybook/addon-a11y": "^7.6.0",
    "@storybook/addon-essentials": "^7.6.0",
    "@storybook/addon-interactions": "^7.6.0",
    "@storybook/addon-viewport": "^7.6.0",
    "@storybook/react-vite": "^7.6.0",
    "@storybook/test-runner": "^0.16.0"
  }
}
```

## 11. テストカバレッジ目標

### 11.1 カバレッジ基準

| 領域 | 目標カバレッジ | 必須カバレッジ |
|------|---------------|--------------|
| Models | 90% | 80% |
| Services | 85% | 75% |
| Controllers | 80% | 70% |
| React Components | 80% | 70% |
| Utilities | 95% | 85% |
| Stories Coverage | 100% | 90% |
| 全体 | 80% | 70% |

### 11.2 カバレッジレポート

```bash
# PHPUnit カバレッジ
php artisan test --coverage --min=80

# Vitest カバレッジ
npm run test:coverage -- --coverage.thresholds.lines=80

# Storybook カバレッジ
npm run test-storybook -- --coverage
```

---

**文書バージョン**: 1.0  
**作成日**: 2025年1月  
**最終更新日**: 2025年1月