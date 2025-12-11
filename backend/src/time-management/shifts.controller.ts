import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  Query,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import {
  CreateShiftTypeDto,
  UpdateShiftTypeDto,
  CreateShiftDto,
  UpdateShiftDto,
  AssignShiftDto,
  GetAssignmentsQueryDto,
} from './dto/shifts.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  // ===== Shift Types =====

  @Post('types')
  createShiftType(@Body() dto: CreateShiftTypeDto) {
    return this.shiftsService.createShiftType(dto);
  }

  @Get('types')
  getShiftTypes() {
    return this.shiftsService.getShiftTypes();
  }

  @Patch('types/:id')
  updateShiftType(
    @Param('id') id: string,
    @Body() dto: UpdateShiftTypeDto,
  ) {
    return this.shiftsService.updateShiftType(id, dto);
  }

  @Delete('types/:id')
  deleteShiftType(@Param('id') id: string) {
    return this.shiftsService.deleteShiftType(id);
  }

  // ===== Shifts =====

  @Post()
  createShift(@Body() dto: CreateShiftDto) {
    return this.shiftsService.createShift(dto);
  }

  @Get()
  getShifts() {
    return this.shiftsService.getShifts();
  }

  @Get(':id')
  getShiftById(@Param('id') id: string) {
    return this.shiftsService.getShiftById(id);
  }

  @Patch(':id')
  updateShift(@Param('id') id: string, @Body() dto: UpdateShiftDto) {
    return this.shiftsService.updateShift(id, dto);
  }

  @Delete(':id')
  deleteShift(@Param('id') id: string) {
    return this.shiftsService.deleteShift(id);
  }

  // ===== Assignments =====

  @Post('assign')
  assignShift(@Body() dto: AssignShiftDto) {
    return this.shiftsService.assignShift(dto);
  }

  @Get('assignments')
  getAssignments(@Query() query: GetAssignmentsQueryDto) {
    return this.shiftsService.getAssignments(query);
  }

  @Get('employee/:employeeId')
  getEmployeeShiftForDate(
    @Param('employeeId') employeeId: string,
    @Query('date') date?: string,
  ) {
    return this.shiftsService.getEmployeeShiftForDate(employeeId, date);
  }
}