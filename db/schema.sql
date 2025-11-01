-- Schéma PostgreSQL pour l'application Tempo
-- Gestion des temps hebdomadaire

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'MANAGER', 'ADMIN')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Table des catégories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(255) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_code ON categories(code);

-- Table de liaison utilisateur-catégories (catégories personnalisées)
CREATE TABLE user_categories (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, category_id)
);

CREATE INDEX idx_user_categories_user ON user_categories(user_id);
CREATE INDEX idx_user_categories_category ON user_categories(category_id);

-- Table des feuilles de temps (timesheets)
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL, -- Date du lundi de la semaine
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED')),
    total_days DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, week_start_date)
);

CREATE INDEX idx_timesheets_user ON timesheets(user_id);
CREATE INDEX idx_timesheets_week ON timesheets(week_start_date);
CREATE INDEX idx_timesheets_status ON timesheets(status);

-- Table des entrées de feuille de temps
CREATE TABLE timesheet_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID NOT NULL REFERENCES timesheets(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    subactivity VARCHAR(255), -- Sous-activité (texte libre)
    monday DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (monday >= 0),
    tuesday DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (tuesday >= 0),
    wednesday DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (wednesday >= 0),
    thursday DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (thursday >= 0),
    friday DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (friday >= 0),
    total DECIMAL(5, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timesheet_entries_timesheet ON timesheet_entries(timesheet_id);
CREATE INDEX idx_timesheet_entries_category ON timesheet_entries(category_id);

-- Table des jours fériés
CREATE TABLE public_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    label VARCHAR(255) NOT NULL,
    country VARCHAR(10) DEFAULT 'FR',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (date, country)
);

CREATE INDEX idx_holidays_date ON public_holidays(date);

-- Fonction pour calculer automatiquement le total d'une entrée
CREATE OR REPLACE FUNCTION calculate_entry_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total := NEW.monday + NEW.tuesday + NEW.wednesday + NEW.thursday + NEW.friday;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_entry_total
    BEFORE INSERT OR UPDATE ON timesheet_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_entry_total();

-- Fonction pour calculer le total des jours d'une feuille
CREATE OR REPLACE FUNCTION calculate_timesheet_total()
RETURNS TRIGGER AS $$
BEGIN
    SELECT COALESCE(SUM(total), 0) INTO NEW.total_days
    FROM timesheet_entries
    WHERE timesheet_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Insertion des catégories par défaut
INSERT INTO categories (code, label, is_default, display_order) VALUES
('CONGES', 'Congés / Absences', true, 1),
('REUNION', 'Réunion d''équipe', true, 2),
('CSE', 'Activité CSE', true, 3),
('MANAGEMENT', 'Management', true, 4);

-- Insertion de l'utilisateur admin par défaut
-- Mot de passe: admin123 (hash bcrypt avec salt rounds 10)
-- Hash généré avec: bcrypt.hashSync('admin123', 10)
-- À changer en production !
-- Note: Le hash doit être généré par l'application au premier démarrage
-- Ce script ne crée pas l'admin car le hash doit être généré dynamiquement

