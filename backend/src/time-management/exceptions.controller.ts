import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ExceptionsService } from './exceptions.service';
import { CreateTimeExceptionDto, ReviewTimeExceptionDto } from './dto/exception.dto';

@Controller('exceptions')
export class ExceptionsController {
  constructor(private readonly exceptionsService: ExceptionsService) {}

  @Post()
  create(@Body() dto: CreateTimeExceptionDto) {
    return this.exceptionsService.createException(dto);
  }

  @Patch(':id')
  review(
    @Param('id') id: string,
    @Body() dto: ReviewTimeExceptionDto,
  ) {
    return this.exceptionsService.reviewException(id, dto);
  }

  @Get('payroll-sync')
  getPayrollSync() {
    return this.exceptionsService.buildPayrollSyncPayload();
  }
}
