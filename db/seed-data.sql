-- Données de test pour le développement
-- Ce script est exécuté après schema.sql lors de l'initialisation

-- Vérifier si les données existent déjà pour éviter les doublons
DO $$
DECLARE
    week_monday DATE;
    user_id_val UUID;
    timesheet_id_val UUID;
BEGIN
    -- Insérer des utilisateurs de test (si non existants)
    -- Mot de passe pour tous : 'admin123'
    -- Hash bcrypt : $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@tempo.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES (
            'admin@tempo.com',
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'Admin',
            'Tempo',
            'ADMIN',
            true
        ) ON CONFLICT (email) DO NOTHING;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'user1@tempo.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES (
            'user1@tempo.com',
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'Jean',
            'Dupont',
            'USER',
            true
        ) ON CONFLICT (email) DO NOTHING;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager1@tempo.com') THEN
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
        VALUES (
            'manager1@tempo.com',
            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
            'Marie',
            'Martin',
            'MANAGER',
            true
        ) ON CONFLICT (email) DO NOTHING;
    END IF;

    -- Insérer des catégories supplémentaires pour les tests
    IF NOT EXISTS (SELECT 1 FROM categories WHERE code = 'PROJET_A') THEN
        INSERT INTO categories (code, label, is_default, display_order)
        VALUES
            ('PROJET_A', 'Projet Alpha', false, 10),
            ('PROJET_B', 'Projet Beta', false, 20),
            ('SUPPORT', 'Support client', false, 30),
            ('FORMATION', 'Formation', false, 40)
        ON CONFLICT (code) DO NOTHING;
    END IF;

    -- Insérer quelques jours fériés pour 2025
    IF NOT EXISTS (SELECT 1 FROM public_holidays WHERE date = '2025-01-01') THEN
        INSERT INTO public_holidays (date, label, country)
        VALUES
            ('2025-01-01', 'Jour de l''an', 'FR'),
            ('2025-04-21', 'Lundi de Pâques', 'FR'),
            ('2025-05-01', 'Fête du travail', 'FR'),
            ('2025-05-08', 'Victoire en Europe', 'FR'),
            ('2025-05-29', 'Ascension', 'FR'),
            ('2025-06-09', 'Lundi de Pentecôte', 'FR'),
            ('2025-07-14', 'Fête nationale', 'FR'),
            ('2025-08-15', 'Assomption', 'FR'),
            ('2025-11-01', 'Toussaint', 'FR'),
            ('2025-11-11', 'Armistice', 'FR'),
            ('2025-12-25', 'Noël', 'FR')
        ON CONFLICT (date, country) DO NOTHING;
    END IF;

    -- Insérer une feuille de temps exemple pour la semaine courante
    -- Calculer le lundi de la semaine courante
    week_monday := DATE_TRUNC('week', CURRENT_DATE)::DATE;
    -- Ajuster pour avoir le lundi (1 = lundi en PostgreSQL)
    IF EXTRACT(DOW FROM week_monday) = 0 THEN
        week_monday := week_monday - INTERVAL '6 days';
    ELSE
        week_monday := week_monday - (EXTRACT(DOW FROM week_monday)::INTEGER - 1) * INTERVAL '1 day';
    END IF;

    -- Récupérer l'ID d'un utilisateur
    SELECT id INTO user_id_val FROM users WHERE email = 'user1@tempo.com' LIMIT 1;

    IF user_id_val IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM timesheets WHERE user_id = user_id_val AND week_start_date = week_monday
    ) THEN
        -- Créer une feuille de temps
        INSERT INTO timesheets (user_id, week_start_date, status, total_days)
        VALUES (user_id_val, week_monday, 'DRAFT', 5.0)
        RETURNING id INTO timesheet_id_val;

        -- Ajouter quelques entrées
        IF timesheet_id_val IS NOT NULL THEN
            INSERT INTO timesheet_entries (
                timesheet_id,
                category_id,
                monday, tuesday, wednesday, thursday, friday,
                total
            )
            SELECT
                timesheet_id_val,
                c.id,
                CASE WHEN c.code = 'CONGES' THEN 0 ELSE 0.25 END,
                CASE WHEN c.code = 'CONGES' THEN 0 ELSE 0.25 END,
                CASE WHEN c.code = 'CONGES' THEN 0 ELSE 0.25 END,
                CASE WHEN c.code = 'CONGES' THEN 0 ELSE 0.25 END,
                CASE WHEN c.code = 'CONGES' THEN 0 ELSE 0.25 END,
                CASE WHEN c.code = 'CONGES' THEN 0 ELSE 1.25 END
            FROM categories c
            WHERE c.is_default = true
            LIMIT 4;
        END IF;
    END IF;

END $$;

-- Note : Les mots de passe par défaut sont 'admin123' pour tous les utilisateurs
-- (hash bcrypt avec salt rounds 10)
-- À changer en production !

