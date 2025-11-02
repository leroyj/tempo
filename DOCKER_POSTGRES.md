# Documentation - Création de l'utilisateur PostgreSQL

## Comment `tempo_user` est créé

L'utilisateur PostgreSQL `tempo_user` est créé **automatiquement** par l'image Docker PostgreSQL lors du **premier démarrage** du conteneur.

### Mécanisme

L'image `postgres:15-alpine` utilise un script d'initialisation qui :

1. **Détecte si la base est vide** (volume `/var/lib/postgresql/data` vide)
2. **Lit les variables d'environnement** :
   - `POSTGRES_USER` → crée l'utilisateur
   - `POSTGRES_PASSWORD` → définit le mot de passe
   - `POSTGRES_DB` → crée la base de données
3. **Crée automatiquement** :
   - L'utilisateur avec les privilèges superuser
   - La base de données
   - Les permissions nécessaires

### Ordre d'exécution dans docker-compose

```
1. Démarrage conteneur PostgreSQL
   ↓
2. Détection volume vide
   ↓
3. Création tempo_user (via POSTGRES_USER)
   ↓
4. Création tempo_db (via POSTGRES_DB)
   ↓
5. Exécution scripts /docker-entrypoint-initdb.d/
   ↓
   (schema.sql crée les tables)
```

### Configuration actuelle

Dans `docker-compose.yml` et `docker-compose.dev.yml` :

```yaml
environment:
  POSTGRES_DB: tempo_db        # Nom de la base
  POSTGRES_USER: tempo_user     # Nom de l'utilisateur
  POSTGRES_PASSWORD: lapincompris  # Mot de passe
```

### Points importants

- ✅ **Automatique** : Pas besoin de créer l'utilisateur manuellement
- ✅ **Premier démarrage uniquement** : Si le volume existe déjà, l'initialisation est ignorée
- ✅ **Superuser par défaut** : L'utilisateur créé a tous les privilèges
- ⚠️ **Volume persistant** : Les données persistent dans le volume Docker nommé

### Réinitialiser complètement

Si vous voulez recréer l'utilisateur et la base :

```bash
# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer (créera tout depuis zéro)
docker-compose up -d
```

### Vérifier que l'utilisateur existe

```bash
# Se connecter au conteneur PostgreSQL
docker exec -it tempo-postgres psql -U tempo_user -d tempo_db

# Ou depuis votre machine
psql -h localhost -p 3432 -U tempo_user -d tempo_db
```

### Modifier l'utilisateur/mot de passe

⚠️ **Attention** : Changer `POSTGRES_USER` ou `POSTGRES_PASSWORD` après le premier démarrage ne modifie pas l'utilisateur existant.

Pour changer :
1. Supprimez le volume : `docker-compose down -v`
2. Modifiez les variables dans docker-compose.yml
3. Redémarrez : `docker-compose up -d`

