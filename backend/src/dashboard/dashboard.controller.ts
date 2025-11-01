import { Controller, Get, Post, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { MissingTimesheetDto } from './dto/missing-timesheet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('missing-timesheets')
  @ApiOperation({ summary: 'Liste les feuilles de temps manquantes ou en retard pour une semaine' })
  @ApiResponse({ status: 200, type: [MissingTimesheetDto] })
  getMissingTimesheets(@Query('weekStartDate') weekStartDate: string): Promise<MissingTimesheetDto[]> {
    return this.dashboardService.getMissingTimesheets(weekStartDate);
  }

  @Post('remind')
  @ApiOperation({ summary: 'Envoyer une relance à un utilisateur (simulé pour l\'instant)' })
  @ApiResponse({ status: 200 })
  sendReminder(
    @Body() body: { userId: string; weekStartDate: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.dashboardService.sendReminder(body.userId, body.weekStartDate);
  }
}

