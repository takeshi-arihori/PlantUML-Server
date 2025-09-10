# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is a PlantUML diagram creation service built with Laravel + Inertia.js + React. The service allows users to create, edit, and manage UML diagrams using PlantUML text syntax, supporting both guest users (temporary storage) and authenticated users (persistent storage with project management).

## Essential Commands

### Development
```bash
# Start full development environment (Laravel server, queue, logs, Vite)
composer dev

# Frontend only development
npm run dev

# Build for production
npm run build
npm run build:ssr  # For SSR support
```

### Testing
```bash
# Backend tests (Pest PHP)
composer test
./vendor/bin/pest

# Static analysis (Larastan level 10)
./vendor/bin/phpstan analyse

# Frontend tests
npm run types        # TypeScript checking
npm run lint         # ESLint
npm run format       # Prettier formatting
npm run format:check # Check formatting
```

### Database
```bash
php artisan migrate
php artisan db:seed
```

## Architecture Overview

### Core Stack
- **Backend**: Laravel 12 with Inertia.js server-side adapter
- **Frontend**: React 19 with TypeScript, using Inertia.js client
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Testing**: Pest PHP (backend), Vitest (frontend planned)

### Key Architectural Patterns

**Controller → Inertia Props → React Pages Flow**:
```php
// Laravel Controller
return inertia('Editor/Index', [
    'project' => $project,
    'diagrams' => $diagrams,
    'templates' => $templates,
]);
```

**Service Layer for PlantUML Processing**:
- `PlantUmlService`: Handles PlantUML code compilation to SVG/PNG
- `DiagramService`: Manages diagram CRUD and version history
- `StorageService`: Handles file storage for generated diagrams

### Database Schema (11 Core Tables)
- **User Management**: `users`, `user_settings`
- **Project Hierarchy**: `projects` → `folders` → `diagrams`
- **Version Control**: `diagram_histories`
- **Learning System**: `templates`, `practice_problems`, `practice_progress`
- **Tracking**: `activity_logs`, `guest_sessions`

**Key Business Rules**:
- Users limited to 3 projects max
- Folders max 2-level hierarchy, 10 diagrams per folder
- PlantUML code max 10,000 characters
- Guest sessions auto-expire after 24 hours

### Directory Structure

```
app/Http/Controllers/
├── Auth/                   # Laravel Breeze authentication
├── DashboardController     # User dashboard and project overview
├── ProjectController       # Project and folder management
├── DiagramController       # Diagram CRUD and file generation
├── EditorController        # PlantUML editor (guest + auth)
├── PracticeController      # Learning/practice problems
└── SettingsController      # User preferences

resources/js/
├── pages/                  # Inertia page components
├── components/             # Reusable React components
├── layouts/                # Page layout components
├── hooks/                  # Custom React hooks
├── actions/               # Server actions via Inertia
└── wayfinder/             # Laravel Wayfinder integration
```

## Development Workflow

### Test-Driven Development
- **Backend**: Use Pest PHP with factories for all model/service testing
- **Frontend**: Vitest + React Testing Library (planned in test strategy)
- **Static Analysis**: Larastan configured at maximum level (10)

### PlantUML Integration
- Diagrams are generated server-side and served as static files
- Support for real-time preview (guest) vs. persistent storage (auth)
- File generation creates SVG, PNG, and thumbnail versions
- Version history maintained for authenticated users

### User Experience Patterns
- **Guest Users**: Local storage, download-only, rate-limited
- **Authenticated Users**: Full CRUD, project organization, version history
- **Auto-save**: 30-second intervals for authenticated users
- **Manual Save**: Available for both user types

## Code Quality Standards

- **PHP**: Larastan level 10 enforcement
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with Tailwind CSS plugin
- **Linting**: ESLint with React hooks rules

## Database Migrations Order
Follow this sequence when creating new migrations:
1. users (Laravel Breeze)
2. projects → folders → diagrams → diagram_histories
3. templates → practice_problems → practice_progress
4. user_settings → activity_logs → guest_sessions