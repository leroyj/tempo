# Fix : ERR_EMPTY_RESPONSE sur le frontend Docker

## Problème

L'erreur `ERR_EMPTY_RESPONSE` indique que React Scripts écoute uniquement sur `localhost` dans le conteneur, bloquant les connexions externes.

## Solution appliquée

1. **Variable `HOST=0.0.0.0`** dans docker-compose.dev.yml
   - Force React Scripts à écouter sur toutes les interfaces

2. **Variable `DANGEROUSLY_DISABLE_HOST_CHECK=true`**
   - Désactive la vérification de host pour le développement

3. **Modification du CMD dans Dockerfile.dev**
   - S'assure que HOST est défini au démarrage

## Redémarrer le frontend

Après ces modifications :

```bash
# Arrêter le conteneur frontend
docker-compose -f docker-compose.dev.yml stop frontend

# Redémarrer
docker-compose -f docker-compose.dev.yml up frontend

# Ou reconstruire si nécessaire
docker-compose -f docker-compose.dev.yml up --build frontend
```

## Vérification

Les logs du conteneur devraient afficher :
```
Compiled successfully!
You can now view tempo-frontend in the browser.
  Local:            http://localhost:3001
  On Your Network:  http://0.0.0.0:3001
```

Le frontend devrait être accessible sur `http://localhost:3080`

