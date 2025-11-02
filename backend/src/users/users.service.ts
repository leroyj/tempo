import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { parse } from 'csv-parse/sync';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Si un nouveau mot de passe est fourni, le hasher
    if (updateUserDto.password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(updateUserDto.password, saltRounds);
      // Créer un objet sans le mot de passe en clair
      const { password, ...updateData } = updateUserDto;
      Object.assign(user, updateData, { passwordHash });
    } else {
      // Pas de changement de mot de passe
      const { password, ...updateData } = updateUserDto;
      Object.assign(user, updateData);
    }

    return await this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async importUsers(users: CreateUserDto[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const userDto of users) {
      try {
        await this.create(userDto);
        success++;
      } catch (error) {
        errors.push(`Erreur pour ${userDto.email}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  /**
   * Import CSV d'utilisateurs
   * Format attendu: email,firstname,lastname,role
   * Structure extensible : on peut facilement brancher une API externe
   * en créant un ImportService qui implémente une interface commune
   */
  async importUsersFromCsv(file: Express.Multer.File): Promise<{ success: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('Fichier CSV requis');
    }

    try {
      const records = parse(file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const users: CreateUserDto[] = records.map((record: any) => ({
        email: record.email || record.Email,
        firstName: record.firstname || record.firstName || record.FirstName,
        lastName: record.lastname || record.lastName || record.LastName,
        role: (record.role || record.Role || 'USER').toUpperCase() as UserRole,
        password: record.password || 'TempPassword123!', // Mot de passe par défaut
        isActive: record.isActive !== undefined ? record.isActive === 'true' : true,
      }));

      return await this.importUsers(users);
    } catch (error) {
      throw new BadRequestException(`Erreur lors du parsing CSV: ${error.message}`);
    }
  }
}

