import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { TimeReportFilterDto } from './dto/reports.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance')
  getAttendanceReport(@Query() filter: TimeReportFilterDto) {
    return this.reportsService.getAttendanceReport(filter);
  }
}
