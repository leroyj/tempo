# Tempo - Application de Gestion des Temps Hebdomadaire

Application web complète pour la saisie et la gestion des temps hebdomadaires.

## Architecture

- **Backend** : NestJS (Node.js + TypeScript)
- **Frontend** : React + TypeScript
- **Base de données** : PostgreSQL
- **Authentification** : JWT

## Installation

### Prérequis

- Node.js 18+ et npm
- PostgreSQL 14+

### Configuration de la base de données

1. Créer une base de données PostgreSQL :
```sql
CREATE DATABASE tempo_db;
```

2. Configurer les variables d'environnement dans `backend/.env` :
```
DATABASE_URL=postgresql://user:password@localhost:5432/tempo_db
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
```

### Installation des dépendances

```bash
npm run install:all
```

## Lancement

### Développement

Terminal 1 - Backend :
```bash
npm run start:backend
```

Terminal 2 - Frontend :
```bash
npm run start:frontend
```

Le backend sera accessible sur `http://localhost:3000`
Le frontend sera accessible sur `http://localhost:3001`

### Migrations de la base de données

```bash
cd backend
npm run migration:run
```

### Utilisateur par défaut

Un utilisateur admin est créé automatiquement :
- Email: `admin@tempo.com`
- Mot de passe: `admin123`

## Déploiement avec Docker

### Production

```bash
docker-compose up -d
```

Le backend sera accessible sur `http://localhost:3000`

### Développement

```bash
docker-compose -f docker-compose.dev.yml up
```

Cela démarre :
- **PostgreSQL** sur le port `3432` (hôte)
- **Backend** sur le port `3030` (API REST)
- **Frontend** sur le port `3080` (interface web)

Le frontend et le backend tournent en mode **watch** (rechargement automatique lors des modifications).

### Build manuel de l'image

```bash
cd backend
docker build -t tempo-backend:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/tempo_db \
  -e JWT_SECRET=your-secret-key \
  tempo-backend:latest
```

## Structure du projet

```
tempo/
├── backend/          # API NestJS
│   ├── Dockerfile    # Dockerfile production
│   ├── Dockerfile.dev # Dockerfile développement
│   └── .dockerignore
├── frontend/          # Application React
├── db/              # Scripts SQL et migrations
├── docker-compose.yml      # Compose production
└── docker-compose.dev.yml   # Compose développement
```

## Documentation API

Une fois le backend démarré, la documentation Swagger est accessible sur :
`http://localhost:3000/api`

## Format CSV pour imports

### Utilisateurs
```csv
email,firstname,lastname,role
user@example.com,John,Doe,USER
manager@example.com,Jane,Smith,MANAGER
```

### Catégories
```csv
code,label,is_default,display_order
PROJET_A,Projet A,false,10
SUPPORT,Support client,false,20
```

### Jours fériés
```csv
date,label,country
2025-01-01,Jour de l'an,FR
2025-05-01,Fête du travail,FR
```

