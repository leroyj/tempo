# Guide d'installation détaillé - Tempo

## Prérequis

- **Node.js** 18+ et npm
- **PostgreSQL** 14+
- **Git** (optionnel)

## Installation étape par étape

### 1. Cloner ou créer le projet

```bash
cd tempo
```

### 2. Configuration de la base de données PostgreSQL

```sql
CREATE DATABASE tempo_db;
CREATE USER tempo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tempo_db TO tempo_user;
```

### 3. Initialisation de la base de données

Exécuter le script SQL de création du schéma :

```bash
psql -U tempo_user -d tempo_db -f db/schema.sql
```

### 4. Configuration des variables d'environnement

Créer un fichier `backend/.env` :

```env
DATABASE_URL=postgresql://tempo_user:your_password@localhost:5432/tempo_db
JWT_SECRET=your-secret-key-change-in-production-min-32-characters-long
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

**Important** : Utilisez un JWT_SECRET fort et unique en production (minimum 32 caractères).

### 5. Installation des dépendances

Depuis la racine du projet :

```bash
npm run install:all
```

Ou manuellement :

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 6. Lancement de l'application

#### Terminal 1 - Backend

```bash
cd backend
npm run start:dev
```

Le backend sera accessible sur `http://localhost:3000`
Swagger UI : `http://localhost:3000/api`

#### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

Le frontend sera accessible sur `http://localhost:3001`

### 7. Première connexion

1. Ouvrir `http://localhost:3001`
2. Se connecter avec :
   - Email: `admin@tempo.com`
   - Mot de passe: `admin123`

L'utilisateur admin est créé automatiquement au premier démarrage du backend.

## Format CSV pour imports

### Utilisateurs (users/import)

```csv
email,firstname,lastname,role
user1@example.com,John,Doe,USER
manager1@example.com,Jane,Smith,MANAGER
admin@example.com,Admin,User,ADMIN
```

### Catégories (categories/import)

```csv
code,label,is_default,display_order
PROJET_A,Projet A,false,10
SUPPORT,Support client,false,20
FORMATION,Formation,false,30
```

### Jours fériés (holidays/import)

```csv
date,label,country
2025-01-01,Jour de l'an,FR
2025-05-01,Fête du travail,FR
2025-12-25,Noël,FR
```

## Structure du projet

```
tempo/
├── backend/              # API NestJS
│   ├── src/
│   │   ├── auth/        # Authentification JWT
│   │   ├── users/       # Gestion utilisateurs
│   │   ├── categories/  # Catégories d'activité
│   │   ├── timesheets/  # Feuilles de temps
│   │   ├── holidays/    # Jours fériés
│   │   ├── dashboard/   # Tableau de bord manager
│   │   └── reports/     # Exports CSV
│   └── package.json
├── frontend/             # Application React
│   ├── src/
│   │   ├── pages/       # Pages principales
│   │   ├── components/  # Composants réutilisables
│   │   ├── store/       # Zustand store
│   │   └── api/         # Client API
│   └── package.json
└── db/                   # Scripts SQL
    └── schema.sql
```

## Production

### Variables d'environnement à configurer

- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Secret pour la signature des tokens JWT (minimum 32 caractères)
- `NODE_ENV` : `production`
- `PORT` : Port du backend (par défaut 3000)
- `FRONTEND_URL` : URL du frontend en production

### Désactiver synchronize TypeORM

Dans `backend/src/app.module.ts`, changer :

```typescript
synchronize: false, // Toujours false en production
```

Utiliser des migrations TypeORM en production.

### Build du frontend

```bash
cd frontend
npm run build
```

Les fichiers compilés seront dans `frontend/build/` à servir avec un serveur web (nginx, Apache, etc.).

## Dépannage

### Erreur de connexion à la base de données

Vérifier :
- PostgreSQL est démarré
- Les identifiants dans `.env` sont corrects
- La base de données existe

### Erreur CORS

Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend.

### Token JWT invalide

Vérifier que `JWT_SECRET` est défini et constant (ne pas changer entre les redémarrages).

