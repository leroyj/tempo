import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';

/**
 * Script de seeding pour créer l'utilisateur admin par défaut
 * À exécuter au premier démarrage de l'application
 */
export async function seedAdmin(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // Vérifier si un admin existe déjà
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@tempo.com' },
  });

  if (existingAdmin) {
    console.log('Utilisateur admin déjà existant');
    return;
  }

  // Créer l'admin avec le mot de passe hashé
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('admin123', saltRounds);

  const admin = userRepository.create({
    email: 'admin@tempo.com',
    passwordHash,
    firstName: 'Admin',
    lastName: 'Tempo',
    role: UserRole.ADMIN,
    isActive: true,
  });

  await userRepository.save(admin);
  console.log('Utilisateur admin créé avec succès');
  console.log('Email: admin@tempo.com');
  console.log('Mot de passe: admin123');
}

