# PlantUML図表作成サービス コーディング規約

## 1. 全体方針

### 1.1 基本原則
- **可読性優先**: パフォーマンスよりも可読性を重視
- **一貫性**: プロジェクト全体で統一されたスタイル
- **保守性**: 将来の変更に対応しやすいコード
- **テスタビリティ**: テストしやすい設計

### 1.2 準拠する規約
- **PHP**: PSR-1, PSR-2, PSR-4, PSR-12, Laravel Coding Standards
- **JavaScript/TypeScript**: Airbnb JavaScript Style Guide + TypeScript ESLint
- **React**: React/JSX Style Guide
- **CSS**: BEM methodology + Tailwind CSS

## 2. PHP/Laravel コーディング規約

### 2.1 PSR-2 準拠の基本ルール

#### インデントとスペース
```php
<?php
// ✅ Good: 4スペースでインデント
namespace App\Http\Controllers;

class UserController extends Controller
{
    public function index()
    {
        return view('users.index');
    }
}

// ❌ Bad: タブやスペース2つ
class UserController extends Controller
{
  public function index()
  {
    return view('users.index');
  }
}
```

#### 1行の長さ
```php
// ✅ Good: 120文字以内（推奨80文字）
$user = User::where('email', $email)
    ->where('active', true)
    ->first();

// ❌ Bad: 長すぎる行
$user = User::where('email', $email)->where('active', true)->where('created_at', '>', now()->subDays(30))->first();
```

#### 制御構造
```php
// ✅ Good: 制御構造の正しい書き方
if ($condition) {
    // code
} elseif ($anotherCondition) {
    // code
} else {
    // code
}

foreach ($items as $key => $item) {
    // code
}

// ❌ Bad: 波括弧の位置が間違っている
if ($condition)
{
    // code
}
else {
    // code
}
```

### 2.2 PSR-4 オートローディング規約

#### ディレクトリ構造とネームスペース
```php
// ファイル: app/Services/PlantUmlService.php
<?php

namespace App\Services;  // ディレクトリ構造と一致

class PlantUmlService
{
    // class implementation
}

// ファイル: app/Http/Controllers/DiagramController.php
<?php

namespace App\Http\Controllers;  // PSR-4準拠

use App\Services\PlantUmlService;
use Illuminate\Http\Request;

class DiagramController extends Controller
{
    // class implementation
}
```

### 2.3 Laravel 固有のコーディング規約

#### 命名規則

| 要素 | 規則 | 例 |
|------|------|-----|
| Controller | 単数形 + Controller | `UserController` |
| Model | 単数形、PascalCase | `User`, `ProjectDiagram` |
| Migration | snake_case | `2024_01_15_create_users_table` |
| Method (public) | camelCase | `getUser()`, `calculateTotal()` |
| Method (private/protected) | camelCase with prefix | `_validateInput()` |
| Variable | camelCase | `$userName`, `$isActive` |
| Constant | UPPER_SNAKE_CASE | `MAX_ATTEMPTS` |
| Config/Lang keys | snake_case | `'app.timezone'` |
| View | kebab-case or snake_case | `show-active.blade.php` |
| Route | kebab-case | `'user-profile'` |

#### Eloquentモデル
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'template_type',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the project.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the diagrams for the project.
     */
    public function diagrams(): HasMany
    {
        return $this->hasMany(Diagram::class);
    }

    /**
     * Scope a query to only include active projects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Determine if the project has reached the diagram limit.
     */
    public function hasReachedDiagramLimit(): bool
    {
        return $this->diagrams()->count() >= 10;
    }
}
```

#### Controller
```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    private ProjectService $projectService;

    /**
     * Create a new controller instance.
     */
    public function __construct(ProjectService $projectService)
    {
        $this->projectService = $projectService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $projects = auth()->user()
            ->projects()
            ->with('diagrams:id,project_id')
            ->latest()
            ->get();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request): RedirectResponse
    {
        $project = $this->projectService->create(
            $request->validated(),
            $request->user()
        );

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'プロジェクトを作成しました。');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $this->authorize('delete', $project);
        
        $this->projectService->delete($project);

        return redirect()
            ->route('projects.index')
            ->with('success', 'プロジェクトを削除しました。');
    }
}
```

#### Service クラス
```php
<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Exceptions\ProjectLimitExceededException;

class ProjectService
{
    private const MAX_PROJECTS_PER_USER = 3;

    /**
     * Create a new project for the user.
     *
     * @param array $data
     * @param User $user
     * @return Project
     * @throws ProjectLimitExceededException
     */
    public function create(array $data, User $user): Project
    {
        if ($this->hasReachedProjectLimit($user)) {
            throw new ProjectLimitExceededException(
                'プロジェクト数の上限に達しています。'
            );
        }

        return DB::transaction(function () use ($data, $user) {
            $project = $user->projects()->create($data);
            
            $this->createDefaultFolders($project);
            $this->logActivity($user, 'project_created', $project);
            
            return $project;
        });
    }

    /**
     * Check if user has reached project limit.
     */
    private function hasReachedProjectLimit(User $user): bool
    {
        return $user->projects()->count() >= self::MAX_PROJECTS_PER_USER;
    }

    /**
     * Create default folders for the project.
     */
    private function createDefaultFolders(Project $project): void
    {
        $defaultFolders = ['Models', 'Views', 'Controllers'];
        
        foreach ($defaultFolders as $folderName) {
            $project->folders()->create([
                'name' => $folderName,
                'display_order' => 0,
            ]);
        }
    }

    /**
     * Log user activity.
     */
    private function logActivity(User $user, string $action, Project $project): void
    {
        activity()
            ->causedBy($user)
            ->performedOn($project)
            ->log($action);
    }
}
```

#### Form Request Validation
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('projects')->where(function ($query) {
                    return $query->where('user_id', $this->user()->id);
                }),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
            'template_type' => [
                'required',
                'string',
                Rule::in(['general', 'system_design', 'database_design']),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'プロジェクト名は必須です。',
            'name.unique' => 'このプロジェクト名は既に使用されています。',
            'template_type.in' => '無効なテンプレートタイプです。',
        ];
    }
}
```

### 2.4 データベース関連

#### Migration
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('template_type', 50)->default('general');
            $table->integer('display_order')->default(0);
            $table->timestamps();
            
            $table->index(['user_id', 'created_at']);
            $table->unique(['user_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
```

#### Seeder
```php
<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Diagram;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::factory(10)
            ->has(
                Project::factory(2)
                    ->has(Diagram::factory(5))
            )
            ->create();
    }
}
```

## 3. TypeScript/React コーディング規約

### 3.1 TypeScript 基本ルール

#### 型定義
```typescript
// ✅ Good: 明示的な型定義
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

interface ProjectProps {
    project: Project;
    onUpdate: (project: Project) => void;
    isLoading?: boolean;  // Optional property
}

// 型エイリアス
type DiagramType = 'class' | 'sequence' | 'useCase' | 'activity';

// Enum（必要な場合のみ）
enum Status {
    Draft = 'draft',
    Published = 'published',
    Archived = 'archived',
}

// ❌ Bad: any型の使用
let data: any;  // 避ける
```

#### 関数の型定義
```typescript
// ✅ Good: 関数の型を明確に
const calculateTotal = (items: Item[]): number => {
    return items.reduce((sum, item) => sum + item.price, 0);
};

// Async関数
const fetchUser = async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
};

// コールバック関数の型
type EventHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;

const handleClick: EventHandler = (event) => {
    event.preventDefault();
    // handle click
};
```

### 3.2 React/JSX コーディング規約

#### コンポーネント定義
```tsx
// ✅ Good: 関数コンポーネント with TypeScript
import React, { useState, useCallback, memo } from 'react';
import { Head, Link } from '@inertiajs/react';
import type { Project, User } from '@/types';

interface DashboardProps {
    user: User;
    projects: Project[];
    canCreateProject: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user, 
    projects, 
    canCreateProject 
}) => {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const handleProjectSelect = useCallback((project: Project) => {
        setSelectedProject(project);
    }, []);

    return (
        <div className="dashboard">
            <Head title="Dashboard" />
            <h1>Welcome, {user.name}!</h1>
            
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onSelect={handleProjectSelect}
                    isSelected={selectedProject?.id === project.id}
                />
            ))}
            
            {canCreateProject && (
                <Link href="/projects/create">
                    Create New Project
                </Link>
            )}
        </div>
    );
};

export default memo(Dashboard);
```

#### Hooks の使用
```tsx
// ✅ Good: カスタムフックの定義
import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface UseProjectsOptions {
    userId: number;
    autoRefresh?: boolean;
}

interface UseProjectsReturn {
    projects: Project[];
    isLoading: boolean;
    error: Error | null;
    refetch: () => void;
}

export const useProjects = ({ 
    userId, 
    autoRefresh = false 
}: UseProjectsOptions): UseProjectsReturn => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/users/${userId}/projects`);
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchProjects();
        
        if (autoRefresh) {
            const interval = setInterval(fetchProjects, 30000);
            return () => clearInterval(interval);
        }
    }, [fetchProjects, autoRefresh]);

    return { projects, isLoading, error, refetch: fetchProjects };
};
```

#### Props と State の管理
```tsx
// ✅ Good: Props の分割代入と型安全性
interface EditorProps {
    initialCode?: string;
    readOnly?: boolean;
    onChange?: (code: string) => void;
    onSave?: (code: string) => Promise<void>;
}

const Editor: React.FC<EditorProps> = ({
    initialCode = '@startuml\n\n@enduml',
    readOnly = false,
    onChange,
    onSave,
}) => {
    // State の初期化
    const [code, setCode] = useState(initialCode);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // イベントハンドラー
    const handleCodeChange = useCallback((newCode: string) => {
        setCode(newCode);
        onChange?.(newCode);  // Optional chaining
    }, [onChange]);

    const handleSave = useCallback(async () => {
        if (!onSave) return;
        
        setIsSaving(true);
        setError(null);
        
        try {
            await onSave(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setIsSaving(false);
        }
    }, [code, onSave]);

    return (
        <div className="editor-container">
            {/* Component JSX */}
        </div>
    );
};
```

### 3.3 ファイル構成とimport順序

```typescript
// ✅ Good: import順序
// 1. React関連
import React, { useState, useEffect, useCallback } from 'react';

// 2. 外部ライブラリ
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';

// 3. 内部モジュール（絶対パス）
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';

// 4. 内部モジュール（相対パス）
import { ProjectCard } from './ProjectCard';
import { validateProject } from '../utils/validation';

// 5. スタイル
import styles from './Dashboard.module.css';

// 6. 型定義
import type { Project, User } from '@/types';
```

## 4. テストコード規約

### 4.1 PHPUnit テスト

```php
<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->project = Project::factory()->create([
            'user_id' => $this->user->id,
        ]);
    }

    /** @test */
    public function user_can_view_their_projects(): void
    {
        // Arrange
        $projects = Project::factory()
            ->count(3)
            ->create(['user_id' => $this->user->id]);

        // Act
        $response = $this->actingAs($this->user)
            ->get(route('projects.index'));

        // Assert
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Projects/Index')
            ->has('projects', 3)
        );
    }

    /** @test */
    public function user_cannot_exceed_project_limit(): void
    {
        // Arrange
        Project::factory()
            ->count(3)
            ->create(['user_id' => $this->user->id]);

        // Act & Assert
        $response = $this->actingAs($this->user)
            ->post(route('projects.store'), [
                'name' => 'Fourth Project',
                'template_type' => 'general',
            ]);

        $response->assertSessionHasErrors('project_limit');
    }
}
```

### 4.2 Vitest テスト

```typescript
// ✅ Good: Vitest テストの書き方
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard } from '@/Pages/Dashboard';
import type { User, Project } from '@/types';

describe('Dashboard', () => {
    let mockUser: User;
    let mockProjects: Project[];

    beforeEach(() => {
        mockUser = {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
        };

        mockProjects = [
            {
                id: 1,
                name: 'Project 1',
                description: 'Description 1',
                diagramsCount: 5,
            },
            {
                id: 2,
                name: 'Project 2',
                description: 'Description 2',
                diagramsCount: 3,
            },
        ];
    });

    it('should display user name', () => {
        // Arrange & Act
        render(
            <Dashboard 
                user={mockUser} 
                projects={mockProjects}
                canCreateProject={true}
            />
        );

        // Assert
        expect(screen.getByText('Welcome, Test User!')).toBeInTheDocument();
    });

    it('should handle project creation', async () => {
        // Arrange
        const user = userEvent.setup();
        const handleCreate = vi.fn();

        render(
            <Dashboard 
                user={mockUser} 
                projects={mockProjects}
                canCreateProject={true}
                onCreateProject={handleCreate}
            />
        );

        // Act
        const createButton = screen.getByRole('button', { 
            name: /create new project/i 
        });
        await user.click(createButton);

        // Assert
        await waitFor(() => {
            expect(handleCreate).toHaveBeenCalledTimes(1);
        });
    });
});
```

## 5. Git コミット規約

### 5.1 コミットメッセージ

```bash
# ✅ Good: 構造化されたコミットメッセージ
<type>(<scope>): <subject>

<body>

<footer>

# 例：
feat(editor): add auto-save functionality

- Implement auto-save every 30 seconds for logged-in users
- Add visual indicator for save status
- Store unsaved changes in localStorage as backup

Closes #123
```

### 5.2 コミットタイプ

| タイプ | 説明 | 例 |
|--------|------|-----|
| feat | 新機能 | `feat(auth): add OAuth login` |
| fix | バグ修正 | `fix(editor): resolve memory leak` |
| docs | ドキュメント | `docs(readme): update installation guide` |
| style | コードスタイル | `style: format code with prettier` |
| refactor | リファクタリング | `refactor(api): simplify error handling` |
| test | テスト | `test(user): add integration tests` |
| chore | 雑務 | `chore(deps): update dependencies` |
| perf | パフォーマンス | `perf(query): optimize database queries` |

## 6. コードレビューチェックリスト

### 6.1 PHP/Laravel
- [ ] PSR-2/PSR-4準拠
- [ ] 適切な型宣言（PHP 8.4の型機能を活用）
- [ ] Eloquentのクエリ最適化（N+1問題の回避）
- [ ] 適切なバリデーション
- [ ] トランザクション処理
- [ ] エラーハンドリング
- [ ] セキュリティ（SQLインジェクション、XSS対策）

### 6.2 TypeScript/React
- [ ] TypeScriptの型安全性
- [ ] React Hooksの依存配列
- [ ] メモ化の適切な使用
- [ ] キー属性の一意性
- [ ] アクセシビリティ（ARIA属性）
- [ ] エラーバウンダリー

### 6.3 共通
- [ ] テストカバレッジ（80%以上）
- [ ] ドキュメント/コメント
- [ ] パフォーマンス考慮
- [ ] セキュリティ考慮
- [ ] 命名の適切性

## 7. ツール設定

### 7.1 PHP CS Fixer設定（.php-cs-fixer.php）

```php
<?php

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__)
    ->exclude(['bootstrap', 'storage', 'vendor'])
    ->name('*.php')
    ->name('_ide_helper')
    ->notName('*.blade.php')
    ->ignoreDotFiles(true)
    ->ignoreVCS(true);

return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR2' => true,
        '@PSR12' => true,
        'array_syntax' => ['syntax' => 'short'],
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
        'no_unused_imports' => true,
        'not_operator_with_successor_space' => true,
        'trailing_comma_in_multiline' => true,
        'phpdoc_scalar' => true,
        'unary_operator_spaces' => true,
        'binary_operator_spaces' => true,
        'blank_line_before_statement' => [
            'statements' => ['break', 'continue', 'declare', 'return', 'throw', 'try'],
        ],
        'phpdoc_single_line_var_spacing' => true,
        'phpdoc_var_without_name' => true,
        'method_argument_space' => [
            'on_multiline' => 'ensure_fully_multiline',
            'keep_multiple_spaces_after_comma' => true,
        ],
        'single_trait_insert_per_statement' => true,
    ])
    ->setFinder($finder);
```

### 7.2 ESLint設定（.eslintrc.json）

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "airbnb",
    "airbnb-typescript",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "project": "./tsconfig.json"
  },
  "plugins": [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "import"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/require-default-props": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

### 7.3 Prettier設定（.prettierrc）

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## 8. 自動化スクリプト

### 8.1 pre-commitフック（.husky/pre-commit）

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# PHP CS Fixer
./vendor/bin/php-cs-fixer fix --dry-run --diff

# PHPStan
./vendor/bin/phpstan analyse

# ESLint
npm run lint

# Prettier
npm run format:check

# Run tests
npm run test:unit
php artisan test --parallel
```

### 8.2 CI/CD設定（一部）

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  php-cs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run PHP CS Fixer
        run: |
          composer install
          ./vendor/bin/php-cs-fixer fix --dry-run --diff

  phpstan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run PHPStan
        run: |
          composer install
          ./vendor/bin/phpstan analyse --level=8

  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ESLint
        run: |
          npm ci
          npm run lint
```

---

**文書バージョン**: 1.0  
**作成日**: 2025年1月  
**最終更新日**: 2025年1月