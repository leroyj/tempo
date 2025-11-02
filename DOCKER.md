# Guide Docker - Tempo

## Vue d'ensemble

Le projet inclut plusieurs Dockerfiles et configurations Docker Compose pour faciliter le déploiement et le développement.

## Fichiers Docker

### Backend

- **`backend/Dockerfile`** : Dockerfile de production optimisé (multi-stage build)
- **`backend/Dockerfile.dev`** : Dockerfile pour le développement (avec hot-reload)
- **`backend/.dockerignore`** : Fichiers exclus du contexte de build

### Compose

- **`docker-compose.yml`** : Configuration pour la production (backend + PostgreSQL)
- **`docker-compose.dev.yml`** : Configuration pour le développement (avec volumes montés)

## Utilisation

### Production

#### Avec Docker Compose (recommandé)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

#### Build manuel de l'image

```bash
cd backend
docker build -t tempo-backend:latest .

# Lancer le conteneur
docker run -d \
  --name tempo-backend \
  -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:password@host:5432/tempo_db \
  -e JWT_SECRET=your-secret-key-min-32-characters \
  -e NODE_ENV=production \
  -e PORT=3000 \
  tempo-backend:latest
```

### Développement

```bash
# Démarrer en mode développement (avec hot-reload)
docker-compose -f docker-compose.dev.yml up

# Les modifications dans ./backend seront reflétées automatiquement
```

## Variables d'environnement

Variables requises pour le backend :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret pour la signature JWT (min 32 chars) | `your-secret-key-here` |
| `PORT` | Port d'écoute du backend | `3000` |
| `NODE_ENV` | Environnement (development/production) | `production` |
| `FRONTEND_URL` | URL du frontend (pour CORS) | `http://localhost:3001` |

## Sécurité

Le Dockerfile de production :
- ✅ Utilise un build multi-stage pour réduire la taille de l'image
- ✅ Exécute avec un utilisateur non-root (nestjs:nodejs)
- ✅ N'inclut que les dépendances de production
- ✅ Nettoie le cache npm après l'installation

## Optimisations

### Taille de l'image

L'image finale utilise Alpine Linux (~50-70 MB) et ne contient que :
- Node.js runtime
- Dépendances de production
- Code compilé (dist/)

### Build cache

Le Dockerfile est optimisé pour le cache Docker :
1. Copie d'abord `package*.json` pour installer les dépendances
2. Copie ensuite le code source
3. Build seulement si le code change

## Dépannage

### Le backend ne démarre pas

```bash
# Vérifier les logs
docker logs tempo-backend

# Vérifier la santé
docker inspect tempo-backend | grep Health -A 10
```

### Erreur de connexion à la base de données

1. Vérifier que PostgreSQL est démarré : `docker ps`
2. Vérifier la variable `DATABASE_URL`
3. Vérifier que le schéma SQL est initialisé

### Rebuild après modification des dépendances

```bash
docker-compose build --no-cache backend
docker-compose up -d
```

## Exemple de déploiement en production

```bash
# 1. Créer un fichier .env.production
cat > .env.production << EOF
DATABASE_URL=postgresql://prod_user:secure_password@postgres:5432/tempo_db
JWT_SECRET=$(openssl rand -base64 32)
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://tempo.example.com
EOF

# 2. Lancer avec les variables d'environnement
docker-compose --env-file .env.production up -d
```

## Volumes persistants

Les données PostgreSQL sont stockées dans un volume nommé `postgres_data` (ou `postgres_data_dev` en dev).

Pour sauvegarder :
```bash
docker run --rm -v tempo_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

Pour restaurer :
```bash
docker run --rm -v tempo_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

