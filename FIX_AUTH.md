# Solution : Erreur d'authentification PostgreSQL

## Problème

L'erreur `password authentication failed for user "tempo_user"` indique que :
- Soit l'utilisateur a été créé avec un autre mot de passe
- Soit le volume PostgreSQL existe déjà avec une ancienne configuration

## Solution 1 : Réinitialiser le volume (recommandé en développement)

```bash
# Arrêter les conteneurs et supprimer le volume
docker-compose -f docker-compose.dev.yml down -v

# Redémarrer (recréera tout depuis zéro)
docker-compose -f docker-compose.dev.yml up -d
```

## Solution 2 : Vérifier le mot de passe actuel

Si vous ne voulez pas perdre les données :

```bash
# Se connecter au conteneur PostgreSQL en tant que superuser
docker exec -it tempo-postgres-dev psql -U postgres -d postgres

# Dans psql, changer le mot de passe
ALTER USER tempo_user WITH PASSWORD 'lapincompris';
\q
```

## Solution 3 : Créer l'utilisateur manuellement

Si l'utilisateur n'existe pas :

```bash
# Se connecter en tant que postgres (superuser par défaut)
docker exec -it tempo-postgres-dev psql -U postgres -d postgres

# Créer l'utilisateur et la base
CREATE USER tempo_user WITH PASSWORD 'lapincompris';
CREATE DATABASE tempo_db OWNER tempo_user;
GRANT ALL PRIVILEGES ON DATABASE tempo_db TO tempo_user;
\q
```

## Prévention

Pour éviter ce problème :
- Toujours utiliser `down -v` avant de changer le mot de passe
- Utiliser des fichiers `.env` pour centraliser les mots de passe
- Documenter les changements de configuration

