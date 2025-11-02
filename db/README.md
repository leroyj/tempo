# Scripts SQL - Base de données Tempo

## Fichiers

### `schema.sql`
Schéma complet de la base de données :
- Création des tables
- Contraintes et index
- Catégories par défaut
- Exécuté en premier lors de l'initialisation

### `seed-data.sql`
Données de test pour le développement :
- Utilisateurs de test (admin, user, manager)
- Catégories supplémentaires
- Jours fériés pour 2025
- Exemple de feuille de temps
- Exécuté après `schema.sql`

## Utilisateurs de test

Les utilisateurs suivants sont créés avec le mot de passe `admin123` :

| Email | Rôle | Nom |
|-------|------|-----|
| admin@tempo.com | ADMIN | Admin Tempo |
| user1@tempo.com | USER | Jean Dupont |
| manager1@tempo.com | MANAGER | Marie Martin |

## Ordre d'exécution

Lors du premier démarrage du conteneur PostgreSQL :

1. **01-schema.sql** - Crée la structure de la base
2. **02-seed-data.sql** - Insère les données de test

## Réinitialiser les données

Pour réinitialiser complètement la base avec les données de test :

```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

## Note importante

Le fichier `seed-data.sql` utilise `ON CONFLICT DO NOTHING` pour éviter les erreurs si les données existent déjà. Il est donc sûr de l'exécuter plusieurs fois.

