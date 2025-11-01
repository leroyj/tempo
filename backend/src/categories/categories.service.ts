import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { parse } from 'csv-parse/sync';
import { Category } from './entities/category.entity';
import { UserCategory } from './entities/user-category.entity';
import { User } from '../users/entities/user.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(UserCategory)
    private userCategoriesRepository: Repository<UserCategory>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      where: { parentId: null }, // Récupérer uniquement les catégories principales
      relations: ['children'],
      order: { displayOrder: 'ASC', label: 'ASC' },
    });
  }

  async findAllWithDefaults(): Promise<Category[]> {
    // Récupérer toutes les catégories par défaut + toutes les catégories
    return await this.categoriesRepository.find({
      order: { displayOrder: 'ASC', label: 'ASC' },
    });
  }

  async findForUser(userId: string): Promise<Category[]> {
    // Catégories par défaut + catégories personnalisées de l'utilisateur
    const defaultCategories = await this.categoriesRepository.find({
      where: { isDefault: true },
      relations: ['children'],
      order: { displayOrder: 'ASC' },
    });

    const userCategories = await this.userCategoriesRepository.find({
      where: { userId },
      relations: ['category', 'category.children'],
    });

    const customCategories = userCategories.map((uc) => uc.category);

    // Fusionner et dédupliquer
    const allCategories = [...defaultCategories, ...customCategories];
    const uniqueCategories = Array.from(
      new Map(allCategories.map((cat) => [cat.id, cat])).values(),
    );

    return uniqueCategories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${id} non trouvée`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }

  async addCategoryToUser(userId: string, categoryId: string): Promise<void> {
    const existing = await this.userCategoriesRepository.findOne({
      where: { userId, categoryId },
    });

    if (!existing) {
      const userCategory = this.userCategoriesRepository.create({
        userId,
        categoryId,
      });
      await this.userCategoriesRepository.save(userCategory);
    }
  }

  async removeCategoryFromUser(userId: string, categoryId: string): Promise<void> {
    await this.userCategoriesRepository.delete({ userId, categoryId });
  }

  async getUserCategories(userId: string): Promise<Category[]> {
    const userCategories = await this.userCategoriesRepository.find({
      where: { userId },
      relations: ['category', 'category.children'],
    });

    return userCategories.map((uc) => uc.category);
  }

  async importCategories(categories: CreateCategoryDto[]): Promise<{ success: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;

    for (const categoryDto of categories) {
      try {
        await this.create(categoryDto);
        success++;
      } catch (error) {
        errors.push(`Erreur pour ${categoryDto.code}: ${error.message}`);
      }
    }

    return { success, errors };
  }

  /**
   * Import CSV de catégories
   * Format attendu: code,label,is_default,display_order
   * Structure extensible vers une source API externe
   */
  async importCategoriesFromCsv(file: Express.Multer.File): Promise<{ success: number; errors: string[] }> {
    if (!file) {
      throw new BadRequestException('Fichier CSV requis');
    }

    try {
      const records = parse(file.buffer.toString('utf-8'), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const categories: CreateCategoryDto[] = records.map((record: any) => ({
        code: record.code || record.Code,
        label: record.label || record.Label,
        isDefault: record.is_default === 'true' || record.isDefault === 'true',
        displayOrder: parseInt(record.display_order || record.displayOrder || '0', 10),
        parentId: record.parent_id || record.parentId,
      }));

      return await this.importCategories(categories);
    } catch (error) {
      throw new BadRequestException(`Erreur lors du parsing CSV: ${error.message}`);
    }
  }
}

