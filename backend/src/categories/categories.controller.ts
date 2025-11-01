import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les catégories (avec défauts pour l\'utilisateur)' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: User, @Query('forUser') forUser?: string) {
    if (forUser === 'true') {
      return this.categoriesService.findForUser(user.id);
    }
    return this.categoriesService.findAllWithDefaults();
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer les catégories d\'un utilisateur spécifique' })
  getUserCategories(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.categoriesService.findForUser(userId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Créer une nouvelle catégorie' })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une catégorie par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Mettre à jour une catégorie' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Supprimer une catégorie' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }

  @Post('user/:userId')
  @ApiOperation({ summary: 'Ajouter une catégorie à un utilisateur' })
  addCategoryToUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() body: { categoryId: string },
  ) {
    return this.categoriesService.addCategoryToUser(userId, body.categoryId);
  }

  @Delete('user/:userId/:categoryId')
  @ApiOperation({ summary: 'Retirer une catégorie d\'un utilisateur' })
  removeCategoryFromUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
  ) {
    return this.categoriesService.removeCategoryFromUser(userId, categoryId);
  }

  @Post('import')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Importer des catégories depuis un fichier CSV' })
  async importCategories(@UploadedFile() file: Express.Multer.File) {
    return this.categoriesService.importCategoriesFromCsv(file);
  }
}

