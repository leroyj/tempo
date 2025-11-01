import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TimesheetsService } from './timesheets.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('timesheets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('timesheets')
export class TimesheetsController {
  constructor(private readonly timesheetsService: TimesheetsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle feuille de temps' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400, description: 'Total de la semaine incorrect ou feuille déjà existante' })
  create(@CurrentUser() user: User, @Body() createTimesheetDto: CreateTimesheetDto) {
    return this.timesheetsService.create(user.id, createTimesheetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Liste toutes les feuilles de temps (toutes pour manager/admin)' })
  findAll(@CurrentUser() user: User) {
    return this.timesheetsService.findAll(user.id, user.role);
  }

  @Get('week')
  @ApiOperation({ summary: 'Récupérer la feuille de temps pour une semaine donnée' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Feuille non trouvée' })
  findByWeek(
    @CurrentUser() user: User,
    @Query('weekStartDate') weekStartDate: string,
    @Query('userId') userId?: string,
  ) {
    const targetUserId = userId && (user.role === 'MANAGER' || user.role === 'ADMIN') ? userId : user.id;
    return this.timesheetsService.findByWeek(targetUserId, weekStartDate, user);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Récupérer toutes les feuilles d\'une semaine (manager/admin uniquement)' })
  getAllByWeek(@Query('weekStartDate') weekStartDate: string) {
    return this.timesheetsService.getAllByWeek(weekStartDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une feuille de temps par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.timesheetsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une feuille de temps' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Total de la semaine incorrect' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTimesheetDto: UpdateTimesheetDto,
    @CurrentUser() user: User,
  ) {
    return this.timesheetsService.update(id, updateTimesheetDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une feuille de temps' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.timesheetsService.remove(id, user);
  }
}

