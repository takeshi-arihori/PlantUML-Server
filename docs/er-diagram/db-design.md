# PlantUML図表作成サービス データベース設計書

## 1. データベース概要

### 1.1 基本情報
- **データベース名**: plantuml_service
- **文字コード**: utf8mb4
- **照合順序**: utf8mb4_unicode_ci
- **タイムゾーン**: Asia/Tokyo

### 1.2 命名規則
- テーブル名: 複数形、スネークケース（例: users, diagram_histories）
- カラム名: スネークケース（例: created_at, plantuml_code）
- インデックス名: `idx_テーブル名_カラム名`
- 外部キー名: `fk_テーブル名_参照テーブル名`

## 2. ER図

```sql
-- PlantUMLで記述すると以下のようになります
@startuml
entity users {
  * id : bigint <<PK>>
  --
  * name : varchar(255)
  * email : varchar(255) <<unique>>
  * email_verified_at : timestamp
  * password : varchar(255)
  * remember_token : varchar(100)
  * created_at : timestamp
  * updated_at : timestamp
}

entity projects {
  * id : bigint <<PK>>
  --
  * user_id : bigint <<FK>>
  * name : varchar(255)
  description : text
  * template_type : varchar(50)
  * display_order : int
  * created_at : timestamp
  * updated_at : timestamp
}

entity folders {
  * id : bigint <<PK>>
  --
  * project_id : bigint <<FK>>
  parent_folder_id : bigint <<FK>>
  * name : varchar(100)
  * display_order : int
  * created_at : timestamp
  * updated_at : timestamp
}

entity diagrams {
  * id : bigint <<PK>>
  --
  * project_id : bigint <<FK>>
  folder_id : bigint <<FK>>
  * name : varchar(255)
  * diagram_type : varchar(50)
  * plantuml_code : text
  svg_path : varchar(500)
  png_path : varchar(500)
  thumbnail_path : varchar(500)
  * is_favorite : boolean
  * last_accessed_at : timestamp
  * created_at : timestamp
  * updated_at : timestamp
}

entity diagram_histories {
  * id : bigint <<PK>>
  --
  * diagram_id : bigint <<FK>>
  * version : int
  * plantuml_code : text
  svg_path : varchar(500)
  png_path : varchar(500)
  change_note : varchar(500)
  * created_at : timestamp
}

entity templates {
  * id : bigint <<PK>>
  --
  * category : varchar(50)
  * name : varchar(255)
  * description : text
  * plantuml_code : text
  * diagram_type : varchar(50)
  * difficulty_level : varchar(20)
  * is_active : boolean
  * display_order : int
  * created_at : timestamp
  * updated_at : timestamp
}

entity practice_problems {
  * id : bigint <<PK>>
  --
  * category : varchar(50)
  * difficulty : enum('beginner','intermediate','advanced')
  * title : varchar(255)
  * description : text
  * hint : text
  * answer_plantuml : text
  * answer_explanation : text
  * diagram_type : varchar(50)
  * display_order : int
  * is_active : boolean
  * created_at : timestamp
  * updated_at : timestamp
}

entity practice_progress {
  * id : bigint <<PK>>
  --
  * user_id : bigint <<FK>>
  * problem_id : bigint <<FK>>
  * status : enum('not_started','in_progress','completed')
  * user_answer : text
  * is_correct : boolean
  * attempt_count : int
  * completed_at : timestamp
  * created_at : timestamp
  * updated_at : timestamp
}

entity user_settings {
  * id : bigint <<PK>>
  --
  * user_id : bigint <<FK>>
  * editor_theme : varchar(50)
  * editor_font_size : int
  * auto_save_enabled : boolean
  * auto_save_interval : int
  * default_diagram_type : varchar(50)
  * default_export_format : varchar(20)
  * created_at : timestamp
  * updated_at : timestamp
}

entity activity_logs {
  * id : bigint <<PK>>
  --
  user_id : bigint <<FK>>
  * action_type : varchar(50)
  * target_type : varchar(50)
  target_id : bigint
  metadata : json
  * ip_address : varchar(45)
  * user_agent : varchar(500)
  * created_at : timestamp
}

entity guest_sessions {
  * id : bigint <<PK>>
  --
  * session_id : varchar(255) <<unique>>
  * plantuml_code : text
  * diagram_type : varchar(50)
  * last_activity : timestamp
  * created_at : timestamp
  * updated_at : timestamp
}

users ||--o{ projects : "owns"
users ||--o{ practice_progress : "tracks"
users ||--o| user_settings : "has"
users ||--o{ activity_logs : "generates"
projects ||--o{ folders : "contains"
projects ||--o{ diagrams : "contains"
folders ||--o{ folders : "contains"
folders ||--o{ diagrams : "contains"
diagrams ||--o{ diagram_histories : "has"
practice_problems ||--o{ practice_progress : "attempted by"

@enduml
```

## 3. テーブル定義詳細

### 3.1 users（ユーザー）
Laravel Breezeのデフォルトテーブル

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| name | VARCHAR(255) | NO | | ユーザー名 |
| email | VARCHAR(255) | NO | | メールアドレス |
| email_verified_at | TIMESTAMP | YES | NULL | メール認証日時 |
| password | VARCHAR(255) | NO | | パスワード（ハッシュ化） |
| remember_token | VARCHAR(100) | YES | NULL | Remember Meトークン |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_users_email (email)

### 3.2 projects（プロジェクト）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| user_id | BIGINT UNSIGNED | NO | | ユーザーID |
| name | VARCHAR(255) | NO | | プロジェクト名 |
| description | TEXT | YES | NULL | プロジェクト説明 |
| template_type | VARCHAR(50) | NO | 'general' | テンプレートタイプ |
| display_order | INT | NO | 0 | 表示順序 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_projects_user_id (user_id)
- INDEX idx_projects_display_order (display_order)

**外部キー:**
- FOREIGN KEY fk_projects_users (user_id) REFERENCES users(id) ON DELETE CASCADE

**制約:**
- user_idごとに最大3プロジェクトまで

### 3.3 folders（フォルダー）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| project_id | BIGINT UNSIGNED | NO | | プロジェクトID |
| parent_folder_id | BIGINT UNSIGNED | YES | NULL | 親フォルダーID |
| name | VARCHAR(100) | NO | | フォルダー名 |
| display_order | INT | NO | 0 | 表示順序 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_folders_project_id (project_id)
- INDEX idx_folders_parent_folder_id (parent_folder_id)

**外部キー:**
- FOREIGN KEY fk_folders_projects (project_id) REFERENCES projects(id) ON DELETE CASCADE
- FOREIGN KEY fk_folders_parent (parent_folder_id) REFERENCES folders(id) ON DELETE CASCADE

**制約:**
- 階層は最大2階層まで
- 1フォルダーあたり最大10図表まで

### 3.4 diagrams（図表）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| project_id | BIGINT UNSIGNED | NO | | プロジェクトID |
| folder_id | BIGINT UNSIGNED | YES | NULL | フォルダーID |
| name | VARCHAR(255) | NO | | 図表名 |
| diagram_type | VARCHAR(50) | NO | | 図表タイプ |
| plantuml_code | TEXT | NO | | PlantUMLコード |
| svg_path | VARCHAR(500) | YES | NULL | SVGファイルパス |
| png_path | VARCHAR(500) | YES | NULL | PNGファイルパス |
| thumbnail_path | VARCHAR(500) | YES | NULL | サムネイルパス |
| is_favorite | BOOLEAN | NO | FALSE | お気に入りフラグ |
| last_accessed_at | TIMESTAMP | YES | NULL | 最終アクセス日時 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_diagrams_project_id (project_id)
- INDEX idx_diagrams_folder_id (folder_id)
- INDEX idx_diagrams_last_accessed (last_accessed_at)

**外部キー:**
- FOREIGN KEY fk_diagrams_projects (project_id) REFERENCES projects(id) ON DELETE CASCADE
- FOREIGN KEY fk_diagrams_folders (folder_id) REFERENCES folders(id) ON DELETE SET NULL

**制約:**
- plantuml_codeは最大10,000文字

### 3.5 diagram_histories（図表履歴）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| diagram_id | BIGINT UNSIGNED | NO | | 図表ID |
| version | INT | NO | | バージョン番号 |
| plantuml_code | TEXT | NO | | PlantUMLコード |
| svg_path | VARCHAR(500) | YES | NULL | SVGファイルパス |
| png_path | VARCHAR(500) | YES | NULL | PNGファイルパス |
| change_note | VARCHAR(500) | YES | NULL | 変更メモ |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_diagram_histories_diagram_version (diagram_id, version)
- INDEX idx_diagram_histories_created (created_at)

**外部キー:**
- FOREIGN KEY fk_diagram_histories_diagrams (diagram_id) REFERENCES diagrams(id) ON DELETE CASCADE

### 3.6 templates（テンプレート）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| category | VARCHAR(50) | NO | | カテゴリー |
| name | VARCHAR(255) | NO | | テンプレート名 |
| description | TEXT | YES | NULL | 説明 |
| plantuml_code | TEXT | NO | | PlantUMLコード |
| diagram_type | VARCHAR(50) | NO | | 図表タイプ |
| difficulty_level | VARCHAR(20) | YES | NULL | 難易度 |
| is_active | BOOLEAN | NO | TRUE | 有効フラグ |
| display_order | INT | NO | 0 | 表示順序 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_templates_category (category)
- INDEX idx_templates_diagram_type (diagram_type)

### 3.7 practice_problems（練習問題）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| category | VARCHAR(50) | NO | | カテゴリー |
| difficulty | ENUM | NO | | 難易度（beginner/intermediate/advanced） |
| title | VARCHAR(255) | NO | | 問題タイトル |
| description | TEXT | NO | | 問題文 |
| hint | TEXT | YES | NULL | ヒント |
| answer_plantuml | TEXT | NO | | 正解のPlantUMLコード |
| answer_explanation | TEXT | YES | NULL | 解説 |
| diagram_type | VARCHAR(50) | NO | | 図表タイプ |
| display_order | INT | NO | 0 | 表示順序 |
| is_active | BOOLEAN | NO | TRUE | 有効フラグ |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_practice_problems_category_difficulty (category, difficulty)
- INDEX idx_practice_problems_display_order (display_order)

### 3.8 practice_progress（練習進捗）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| user_id | BIGINT UNSIGNED | NO | | ユーザーID |
| problem_id | BIGINT UNSIGNED | NO | | 問題ID |
| status | ENUM | NO | 'not_started' | ステータス |
| user_answer | TEXT | YES | NULL | ユーザーの回答 |
| is_correct | BOOLEAN | YES | NULL | 正解フラグ |
| attempt_count | INT | NO | 0 | 挑戦回数 |
| completed_at | TIMESTAMP | YES | NULL | 完了日時 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_practice_progress_user_problem (user_id, problem_id)
- INDEX idx_practice_progress_status (status)

**外部キー:**
- FOREIGN KEY fk_practice_progress_users (user_id) REFERENCES users(id) ON DELETE CASCADE
- FOREIGN KEY fk_practice_progress_problems (problem_id) REFERENCES practice_problems(id) ON DELETE CASCADE

### 3.9 user_settings（ユーザー設定）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| user_id | BIGINT UNSIGNED | NO | | ユーザーID |
| editor_theme | VARCHAR(50) | NO | 'vs-dark' | エディターテーマ |
| editor_font_size | INT | NO | 14 | フォントサイズ |
| auto_save_enabled | BOOLEAN | NO | TRUE | 自動保存有効 |
| auto_save_interval | INT | NO | 30 | 自動保存間隔（秒） |
| default_diagram_type | VARCHAR(50) | NO | 'class' | デフォルト図表タイプ |
| default_export_format | VARCHAR(20) | NO | 'png' | デフォルトエクスポート形式 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_user_settings_user_id (user_id)

**外部キー:**
- FOREIGN KEY fk_user_settings_users (user_id) REFERENCES users(id) ON DELETE CASCADE

### 3.10 activity_logs（活動ログ）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| user_id | BIGINT UNSIGNED | YES | NULL | ユーザーID |
| action_type | VARCHAR(50) | NO | | アクションタイプ |
| target_type | VARCHAR(50) | NO | | 対象タイプ |
| target_id | BIGINT | YES | NULL | 対象ID |
| metadata | JSON | YES | NULL | メタデータ |
| ip_address | VARCHAR(45) | NO | | IPアドレス |
| user_agent | VARCHAR(500) | NO | | ユーザーエージェント |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |

**インデックス:**
- PRIMARY KEY (id)
- INDEX idx_activity_logs_user_id (user_id)
- INDEX idx_activity_logs_action_type (action_type)
- INDEX idx_activity_logs_created_at (created_at)

**外部キー:**
- FOREIGN KEY fk_activity_logs_users (user_id) REFERENCES users(id) ON DELETE SET NULL

### 3.11 guest_sessions（ゲストセッション）

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|---------|------|------------|------|
| id | BIGINT UNSIGNED | NO | AUTO_INCREMENT | プライマリキー |
| session_id | VARCHAR(255) | NO | | セッションID |
| plantuml_code | TEXT | YES | NULL | PlantUMLコード |
| diagram_type | VARCHAR(50) | YES | NULL | 図表タイプ |
| last_activity | TIMESTAMP | NO | CURRENT_TIMESTAMP | 最終活動時刻 |
| created_at | TIMESTAMP | YES | NULL | 作成日時 |
| updated_at | TIMESTAMP | YES | NULL | 更新日時 |

**インデックス:**
- PRIMARY KEY (id)
- UNIQUE KEY idx_guest_sessions_session_id (session_id)
- INDEX idx_guest_sessions_last_activity (last_activity)

**自動削除:**
- 24時間経過後に自動削除（Cronジョブ）

## 4. Enum定義

### 4.1 diagram_type（図表タイプ）
```php
enum DiagramType: string {
    case USE_CASE = 'use_case';
    case CLASS = 'class';
    case ACTIVITY = 'activity';
    case STATE = 'state';
    case COMPONENT = 'component';
    case SEQUENCE = 'sequence';
    case ER = 'er';
    case MINDMAP = 'mindmap';
    case GANTT = 'gantt';
}
```

### 4.2 template_type（テンプレートタイプ）
```php
enum TemplateType: string {
    case GENERAL = 'general';
    case SYSTEM_DESIGN = 'system_design';
    case DATABASE_DESIGN = 'database_design';
    case CUSTOM = 'custom';
}
```

### 4.3 difficulty（難易度）
```php
enum Difficulty: string {
    case BEGINNER = 'beginner';
    case INTERMEDIATE = 'intermediate';
    case ADVANCED = 'advanced';
}
```

### 4.4 practice_status（練習ステータス）
```php
enum PracticeStatus: string {
    case NOT_STARTED = 'not_started';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
}
```

### 4.5 action_type（アクションタイプ）
```php
enum ActionType: string {
    case LOGIN = 'login';
    case LOGOUT = 'logout';
    case CREATE_PROJECT = 'create_project';
    case UPDATE_PROJECT = 'update_project';
    case DELETE_PROJECT = 'delete_project';
    case CREATE_DIAGRAM = 'create_diagram';
    case UPDATE_DIAGRAM = 'update_diagram';
    case DELETE_DIAGRAM = 'delete_diagram';
    case EXPORT_DIAGRAM = 'export_diagram';
    case COMPLETE_PRACTICE = 'complete_practice';
}
```

## 5. マイグレーション順序

1. users（Laravel Breeze標準）
2. projects
3. folders
4. diagrams
5. diagram_histories
6. templates
7. practice_problems
8. practice_progress
9. user_settings
10. activity_logs
11. guest_sessions

## 6. インデックス戦略

### 6.1 パフォーマンス最適化のためのインデックス
- 頻繁に検索される外部キーには全てインデックスを作成
- 日時でのソートが必要なカラムにインデックスを作成
- ユニーク制約が必要なカラムにユニークインデックスを作成

### 6.2 複合インデックス
- practice_progress: (user_id, problem_id) - ユーザーごとの進捗確認
- practice_problems: (category, difficulty) - カテゴリーと難易度での検索

## 7. パーティショニング戦略

### 7.1 activity_logs
- 月単位でのパーティショニングを検討
- 3ヶ月以上前のデータは別テーブルへアーカイブ

### 7.2 diagram_histories
- diagram_idでのハッシュパーティショニングを検討
- 古いバージョンは圧縮保存

## 8. データ整合性の確保

### 8.1 トランザクション処理
- プロジェクト削除時：関連する全データを一括削除
- 図表保存時：履歴の作成も同一トランザクション内で実行

### 8.2 カスケード削除
- ユーザー削除 → プロジェクト、設定、進捗も削除
- プロジェクト削除 → フォルダー、図表も削除
- 図表削除 → 履歴も削除

## 9. 初期データ（Seeder）

### 9.1 templates
- システム設計用テンプレート（5種類）
- データベース設計用テンプレート（3種類）
- 汎用テンプレート（5種類）

### 9.2 practice_problems
- 初級問題（10問）
- 中級問題（10問）
- 上級問題（10問）

---

**文書バージョン**: 1.0  
**作成日**: 2025年1月  
**最終更新日**: 2025年1月