# Résolution : Erreur "@nestjs/common" introuvable

## Problème

TypeScript ne trouve pas le module `@nestjs/common` car les dépendances npm ne sont pas installées dans le conteneur Docker.

## Solution

Reconstruire l'image Docker pour installer toutes les dépendances :

```bash
# Arrêter les conteneurs
docker-compose -f docker-compose.dev.yml down

# Reconstruire l'image sans cache (force la réinstallation complète)
docker-compose -f docker-compose.dev.yml build --no-cache backend

# Redémarrer
docker-compose -f docker-compose.dev.yml up -d
```

Ou plus simplement :

```bash
docker-compose -f docker-compose.dev.yml up -d --build
```

## Vérification

Après reconstruction, vérifier que les dépendances sont installées :

```bash
docker exec -it tempo-backend-dev ls -la node_modules/@nestjs/common
```

Cela devrait afficher les fichiers du module.

## Alternative : Installation manuelle dans le conteneur

Si le problème persiste :

```bash
docker exec -it tempo-backend-dev npm install
```

## Note

Le Dockerfile.dev a été amélioré pour utiliser `npm install --legacy-peer-deps` qui résout certains conflits de dépendances.

