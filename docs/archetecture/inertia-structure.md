# PlantUML図表作成サービス Inertiaページ構成設計書

## 1. Inertia.js アーキテクチャ概要

### 1.1 基本構成
```
Laravel (Backend)          Inertia.js          React (Frontend)
     │                         │                      │
     ├── Controllers ──────> Props ──────> Pages/Components
     ├── Models                │                      │
     ├── Services              │                   State/Hooks
     └── Middleware       Shared Data              Context
```

### 1.2 ディレクトリ構造

```
project-root/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/           # Breeze認証
│   │   │   ├── DashboardController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── DiagramController.php
│   │   │   ├── EditorController.php
│   │   │   ├── PracticeController.php
│   │   │   └── SettingsController.php
│   │   └── Middleware/
│   │       ├── HandleInertiaRequests.php
│   │       └── ShareInertiaData.php
│   │
│   └── Services/
│       ├── PlantUmlService.php
│       ├── DiagramService.php
│       └── StorageService.php
│
└── resources/
    └── js/
        ├── Pages/              # Inertiaページコンポーネント
        │   ├── Auth/
        │   ├── Dashboard/
        │   ├── Projects/
        │   ├── Editor/
        │   ├── Practice/
        │   └── Settings/
        ├── Components/         # 再利用可能コンポーネント
        ├── Layouts/           # レイアウトコンポーネント
        ├── Hooks/             # カスタムフック
        ├── Utils/             # ユーティリティ関数
        └── app.tsx            # エントリーポイント
```

## 2. ルーティング設計

### 2.1 routes/web.php

```php
<?php

use App\Http\Controllers\{
    DashboardController,
    ProjectController,
    DiagramController,
    EditorController,
    PracticeController,
    SettingsController
};
use Inertia\Inertia;

// Public Routes
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

// Guest Editor
Route::get('/editor', [EditorController::class, 'guest'])
    ->name('editor.guest');

// Practice Routes (Public)
Route::prefix('practice')->name('practice.')->group(function () {
    Route::get('/', [PracticeController::class, 'index'])->name('index');
    Route::get('/{problem}', [PracticeController::class, 'show'])->name('show');
    Route::post('/{problem}/submit', [PracticeController::class, 'submit'])
        ->name('submit');
});

// Cheatsheet
Route::get('/cheatsheet', function () {
    return Inertia::render('Cheatsheet/Index');
})->name('cheatsheet');

// Authenticated Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    
    // Projects
    Route::prefix('projects')->name('projects.')->group(function () {
        Route::get('/', [ProjectController::class, 'index'])->name('index');
        Route::post('/', [ProjectController::class, 'store'])->name('store');
        Route::get('/{project}', [ProjectController::class, 'show'])->name('show');
        Route::put('/{project}', [ProjectController::class, 'update'])->name('update');
        Route::delete('/{project}', [ProjectController::class, 'destroy'])->name('destroy');
        
        // Project Editor
        Route::get('/{project}/editor', [EditorController::class, 'project'])
            ->name('editor');
        
        // Diagrams within Project
        Route::prefix('/{project}/diagrams')->name('diagrams.')->group(function () {
            Route::post('/', [DiagramController::class, 'store'])->name('store');
            Route::get('/{diagram}', [DiagramController::class, 'show'])->name('show');
            Route::put('/{diagram}', [DiagramController::class, 'update'])->name('update');
            Route::delete('/{diagram}', [DiagramController::class, 'destroy'])->name('destroy');
        });
    });
    
    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [SettingsController::class, 'index'])->name('index');
        Route::put('/editor', [SettingsController::class, 'updateEditor'])
            ->name('editor.update');
    });
});

// PlantUML Generation (Both Guest and Auth)
Route::post('/api/generate-diagram', [DiagramController::class, 'generate'])
    ->name('diagram.generate');

// Auto-save endpoint
Route::post('/api/auto-save', [DiagramController::class, 'autoSave'])
    ->middleware('auth')
    ->name('diagram.autosave');

require __DIR__.'/auth.php';
```

## 3. Controllerとページコンポーネント設計

### 3.1 DashboardController

```php
<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('Dashboard/Index', [
            'projects' => $user->projects()
                ->withCount('diagrams')
                ->latest('updated_at')
                ->get()
                ->map(fn($project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'diagrams_count' => $project->diagrams_count,
                    'updated_at' => $project->updated_at->diffForHumans(),
                ]),
            'recentActivity' => $user->activityLogs()
                ->latest()
                ->take(10)
                ->get()
                ->map(fn($log) => [
                    'action' => $log->action_type,
                    'target' => $log->target_type,
                    'created_at' => $log->created_at->diffForHumans(),
                ]),
            'practiceProgress' => [
                'beginner' => $user->practiceProgress()
                    ->whereHas('problem', fn($q) => $q->where('difficulty', 'beginner'))
                    ->where('status', 'completed')
                    ->count(),
                'intermediate' => $user->practiceProgress()
                    ->whereHas('problem', fn($q) => $q->where('difficulty', 'intermediate'))
                    ->where('status', 'completed')
                    ->count(),
                'advanced' => $user->practiceProgress()
                    ->whereHas('problem', fn($q) => $q->where('difficulty', 'advanced'))
                    ->where('status', 'completed')
                    ->count(),
            ],
            'stats' => [
                'total_projects' => $user->projects()->count(),
                'total_diagrams' => $user->projects()->withCount('diagrams')->get()->sum('diagrams_count'),
                'max_projects' => 3,
                'max_diagrams_per_project' => 10,
            ],
        ]);
    }
}
```

### 3.2 React Pageコンポーネント例

```tsx
// resources/js/Pages/Dashboard/Index.tsx
import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProjectCard from '@/Components/ProjectCard';
import ActivityFeed from '@/Components/ActivityFeed';
import PracticeProgress from '@/Components/PracticeProgress';
import { PageProps } from '@/types';

interface DashboardProps extends PageProps {
    projects: Array<{
        id: number;
        name: string;
        description: string;
        diagrams_count: number;
        updated_at: string;
    }>;
    recentActivity: Array<{
        action: string;
        target: string;
        created_at: string;
    }>;
    practiceProgress: {
        beginner: number;
        intermediate: number;
        advanced: number;
    };
    stats: {
        total_projects: number;
        total_diagrams: number;
        max_projects: number;
        max_diagrams_per_project: number;
    };
}

export default function Dashboard({ 
    auth, 
    projects, 
    recentActivity, 
    practiceProgress,
    stats 
}: DashboardProps) {
    const canCreateProject = stats.total_projects < stats.max_projects;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            こんにちは、{auth.user.name}さん
                        </h1>
                    </div>

                    {/* Projects Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">
                                    プロジェクト ({stats.total_projects}/{stats.max_projects})
                                </h2>
                                {canCreateProject && (
                                    <Link
                                        href="/projects/create"
                                        className="btn btn-primary"
                                    >
                                        新規プロジェクト
                                    </Link>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {projects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Recent Activity */}
                        <ActivityFeed activities={recentActivity} />
                        
                        {/* Practice Progress */}
                        <PracticeProgress progress={practiceProgress} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

## 4. 共有データ設計（HandleInertiaRequests）

### 4.1 HandleInertiaRequests.php

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'settings' => $request->user()->settings,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'app' => [
                'name' => config('app.name'),
                'max_plantuml_length' => 10000,
                'max_file_size' => 5 * 1024 * 1024, // 5MB
                'rate_limits' => [
                    'guest' => 3,
                    'authenticated' => 10,
                ],
            ],
        ]);
    }
}
```

## 5. エディタページの詳細設計

### 5.1 EditorController

```php
<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Template;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class EditorController extends Controller
{
    public function guest(): Response
    {
        return Inertia::render('Editor/Guest', [
            'templates' => Template::where('is_active', true)
                ->orderBy('display_order')
                ->get(['id', 'name', 'category', 'plantuml_code']),
            'sessionId' => session()->getId(),
            'canSave' => false,
        ]);
    }

    public function project(Request $request, Project $project): Response
    {
        $this->authorize('view', $project);

        return Inertia::render('Editor/Project', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'folders' => $project->folders()
                    ->with('diagrams:id,name,folder_id,updated_at')
                    ->get(),
            ],
            'currentDiagram' => $request->query('diagram_id') 
                ? $project->diagrams()->find($request->query('diagram_id'))
                : null,
            'templates' => Template::where('is_active', true)
                ->orderBy('display_order')
                ->get(['id', 'name', 'category', 'plantuml_code']),
            'canSave' => true,
            'autoSaveEnabled' => $request->user()->settings->auto_save_enabled ?? true,
            'autoSaveInterval' => $request->user()->settings->auto_save_interval ?? 30,
        ]);
    }
}
```

### 5.2 Editor Reactコンポーネント

```tsx
// resources/js/Pages/Editor/Project.tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { useDebounce } from '@/Hooks/useDebounce';
import MonacoEditor from '@/Components/Editor/MonacoEditor';
import DiagramPreview from '@/Components/Editor/DiagramPreview';
import EditorToolbar from '@/Components/Editor/EditorToolbar';
import FileExplorer from '@/Components/Editor/FileExplorer';
import SplitPane from '@/Components/SplitPane';

interface EditorProjectProps {
    project: {
        id: number;
        name: string;
        folders: Array<any>;
    };
    currentDiagram?: {
        id: number;
        name: string;
        plantuml_code: string;
    };
    templates: Array<{
        id: number;
        name: string;
        category: string;
        plantuml_code: string;
    }>;
    canSave: boolean;
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
}

export default function EditorProject({
    project,
    currentDiagram,
    templates,
    canSave,
    autoSaveEnabled,
    autoSaveInterval,
}: EditorProjectProps) {
    const [code, setCode] = useState(currentDiagram?.plantuml_code || '@startuml\n\n@enduml');
    const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    const debouncedCode = useDebounce(code, 500);
    const lastSavedCode = useRef(code);

    // Generate diagram on code change
    useEffect(() => {
        if (debouncedCode) {
            generateDiagram(debouncedCode);
        }
    }, [debouncedCode]);

    // Auto-save functionality
    useEffect(() => {
        if (!autoSaveEnabled || !canSave || !hasChanges) return;

        const interval = setInterval(() => {
            if (hasChanges && currentDiagram) {
                autoSave();
            }
        }, autoSaveInterval * 1000);

        return () => clearInterval(interval);
    }, [autoSaveEnabled, hasChanges, currentDiagram]);

    const generateDiagram = async (plantUmlCode: string) => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-diagram', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    code: plantUmlCode,
                    format: 'svg',
                }),
            });

            const data = await response.json();
            setDiagramUrl(data.svg_url);
        } catch (error) {
            console.error('Failed to generate diagram:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = useCallback(() => {
        if (!canSave || !currentDiagram) return;

        setIsSaving(true);
        router.put(
            `/projects/${project.id}/diagrams/${currentDiagram.id}`,
            {
                plantuml_code: code,
                name: currentDiagram.name,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    lastSavedCode.current = code;
                    setHasChanges(false);
                    setIsSaving(false);
                },
                onError: () => {
                    setIsSaving(false);
                },
            }
        );
    }, [code, currentDiagram, project.id]);

    const autoSave = useCallback(() => {
        if (code !== lastSavedCode.current) {
            handleSave();
        }
    }, [code, handleSave]);

    const handleCodeChange = (newCode: string) => {
        setCode(newCode);
        setHasChanges(newCode !== lastSavedCode.current);
    };

    const handleExport = async (format: 'png' | 'svg' | 'txt') => {
        // Export implementation
    };

    return (
        <div className="h-screen flex flex-col">
            <Head title={`Editor - ${project.name}`} />
            
            <EditorToolbar
                projectName={project.name}
                hasChanges={hasChanges}
                isSaving={isSaving}
                onSave={handleSave}
                onExport={handleExport}
                canSave={canSave}
            />

            <div className="flex-1 flex">
                <FileExplorer
                    folders={project.folders}
                    currentDiagramId={currentDiagram?.id}
                    projectId={project.id}
                />

                <SplitPane
                    left={
                        <MonacoEditor
                            value={code}
                            onChange={handleCodeChange}
                            language="plantuml"
                            theme="vs-dark"
                        />
                    }
                    right={
                        <DiagramPreview
                            url={diagramUrl}
                            isLoading={isGenerating}
                            error={null}
                        />
                    }
                    defaultSize={50}
                />
            </div>

            <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between">
                <span>文字数: {code.length}/10000</span>
                <span>
                    {hasChanges && '● 未保存の変更'}
                    {isSaving && '保存中...'}
                    {!hasChanges && !isSaving && '✓ 保存済み'}
                </span>
                <span>自動保存: {autoSaveEnabled ? 'ON' : 'OFF'}</span>
            </div>
        </div>
    );
}
```

## 6. 状態管理設計

### 6.1 Context API使用

```tsx
// resources/js/Contexts/EditorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorContextType {
    code: string;
    setCode: (code: string) => void;
    diagramType: string;
    setDiagramType: (type: string) => void;
    isGenerating: boolean;
    setIsGenerating: (generating: boolean) => void;
    selectedTemplate: number | null;
    setSelectedTemplate: (id: number | null) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [code, setCode] = useState('@startuml\n\n@enduml');
    const [diagramType, setDiagramType] = useState('class');
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

    return (
        <EditorContext.Provider
            value={{
                code,
                setCode,
                diagramType,
                setDiagramType,
                isGenerating,
                setIsGenerating,
                selectedTemplate,
                setSelectedTemplate,
            }}
        >
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (context === undefined) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
```

### 6.2 カスタムフック

```tsx
// resources/js/Hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// resources/js/Hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}
```

## 7. フォーム処理（Inertia Form Helper）

### 7.1 プロジェクト作成フォーム

```tsx
// resources/js/Pages/Projects/Create.tsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface ProjectFormData {
    name: string;
    description: string;
    template_type: string;
}

export default function CreateProject() {
    const { data, setData, post, processing, errors, reset } = useForm<ProjectFormData>({
        name: '',
        description: '',
        template_type: 'general',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/projects', {
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={submit}>
            <div>
                <InputLabel htmlFor="name" value="プロジェクト名" />
                <TextInput
                    id="name"
                    type="text"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="off"
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="description" value="説明" />
                <textarea
                    id="description"
                    name="description"
                    value={data.description}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    onChange={(e) => setData('description', e.target.value)}
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="mt-4">
                <InputLabel htmlFor="template_type" value="テンプレートタイプ" />
                <select
                    id="template_type"
                    name="template_type"
                    value={data.template_type}
                    className="mt-1 block w-full rounded-md border-gray-300"
                    onChange={(e) => setData('template_type', e.target.value)}
                >
                    <option value="general">汎用</option>
                    <option value="system_design">システム設計</option>
                    <option value="database_design">データベース設計</option>
                </select>
                <InputError message={errors.template_type} className="mt-2" />
            </div>

            <div className="flex items-center justify-end mt-4">
                <PrimaryButton disabled={processing}>
                    作成
                </PrimaryButton>
            </div>
        </form>
    );
}
```

## 8. リアルタイム通信設計（オプション）

### 8.1 Laravel Echo設定（将来の拡張用）

```typescript
// resources/js/bootstrap.ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
});

// 使用例: 自動保存の通知
window.Echo.private(`user.${userId}`)
    .listen('DiagramSaved', (e: any) => {
        console.log('Diagram saved:', e.diagram);
    });
```

## 9. エラーハンドリング

### 9.1 グローバルエラーハンドラー

```tsx
// resources/js/Components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-red-600">
                            エラーが発生しました
                        </h1>
                        <p className="mt-2 text-gray-600">
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            ページを再読み込み
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
```

## 10. パフォーマンス最適化

### 10.1 コード分割とLazy Loading

```tsx
// resources/js/app.tsx
import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import Loading from '@/Components/Loading';

const app = document.getElementById('app');

createInertiaApp({
    title: (title) => `${title} - PlantUML Editor`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: false });
        return pages[`./Pages/${name}.tsx`]();
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <Suspense fallback={<Loading />}>
                <App {...props} />
            </Suspense>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
```

### 10.2 メモ化とパフォーマンス最適化

```tsx
// resources/js/Components/Editor/MonacoEditor.tsx
import React, { memo, useCallback } from 'react';
import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: string;
    theme?: string;
}

const MonacoEditor = memo(({ 
    value, 
    onChange, 
    language = 'plantuml',
    theme = 'vs-dark' 
}: MonacoEditorProps) => {
    const handleEditorChange = useCallback((value: string | undefined) => {
        if (value !== undefined) {
            onChange(value);
        }
    }, [onChange]);

    return (
        <Editor
            height="100%"
            language={language}
            theme={theme}
            value={value}
            onChange={handleEditorChange}
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
            }}
        />
    );
});

MonacoEditor.displayName = 'MonacoEditor';

export default MonacoEditor;
```

---

**文書バージョン**: 1.0  
**作成日**: 2025年1月  
**最終更新日**: 2025年1月