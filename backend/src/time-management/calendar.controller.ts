import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import {
  CalendarQueryDto,
  CreateHolidayDto,
  UpdateHolidayDto,
} from './dto/calendar.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getCalendar(@Query() query: CalendarQueryDto) {
    return this.calendarService.getCalendar(query);
  }

  @Get('holidays')
  getHolidays(@Query() query: CalendarQueryDto) {
    return this.calendarService.getHolidays(query);
  }

  @Post('holidays')
  createHoliday(@Body() dto: CreateHolidayDto) {
    return this.calendarService.createHoliday(dto);
  }

  @Patch('holidays/:id')
  updateHoliday(
    @Param('id') id: string,
    @Body() dto: UpdateHolidayDto,
  ) {
    return this.calendarService.updateHoliday(id, dto);
  }

  @Delete('holidays/:id')
  deleteHoliday(@Param('id') id: string) {
    return this.calendarService.deleteHoliday(id);
  }
}
