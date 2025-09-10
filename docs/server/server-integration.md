# PlantUML図表作成サービス PlantUMLサーバー連携設計書

## 1. PlantUMLサーバー構成

### 1.1 アーキテクチャ概要

```
┌─────────────────┐     HTTP Request    ┌──────────────────┐
│                 │ ──────────────────> │                  │
│  Laravel App    │                     │  PlantUML Server │
│  (PHP-FPM)      │ <────────────────── │  (Docker)        │
│                 │     Image Response   │                  │
└─────────────────┘                     └──────────────────┘
         │                                       │
         │                                       │
         ▼                                       ▼
┌─────────────────┐                     ┌──────────────────┐
│   AWS S3        │                     │   Java Runtime   │
│   Storage       │                     │   + Graphviz     │
└─────────────────┘                     └──────────────────┘
```

### 1.2 PlantUMLサーバーDockerfile

```dockerfile
# docker/plantuml/Dockerfile
FROM openjdk:11-jre-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    graphviz \
    fonts-noto-cjk \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Download PlantUML
ENV PLANTUML_VERSION=1.2024.0
RUN curl -L -o