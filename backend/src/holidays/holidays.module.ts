import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';
import { PublicHoliday } from './entities/public-holiday.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PublicHoliday])],
  controllers: [HolidaysController],
  providers: [HolidaysService],
  exports: [HolidaysService],
})
export class HolidaysModule {}

