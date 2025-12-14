import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TimeManagementController } from './time-management.controller';
import { TimeManagementService } from './time-management.service';

import {
  NotificationLog,
  NotificationLogSchema,
} from './models/notification-log.schema';
import {
  AttendanceCorrectionRequest,
  AttendanceCorrectionRequestSchema,
} from './models/attendance-correction-request.schema';
import {
  ShiftType,
  ShiftTypeSchema,
} from './models/shift-type.schema';
import {
  ScheduleRule,
  ScheduleRuleSchema,
} from './models/schedule-rule.schema';
import {
  AttendanceRecord,
  AttendanceRecordSchema,
} from './models/attendance-record.schema';
import {
  Shift,
  ShiftSchema,
} from './models/shift.schema';
import {
  ShiftAssignment,
  ShiftAssignmentSchema,
} from './models/shift-assignment.schema';
import {
  Holiday,
  HolidaySchema,
} from './models/holiday.schema';
import {
  LatenessRule,
  latenessRuleSchema,
} from './models/lateness-rule.schema';
import {
  OvertimeRule,
  OvertimeRuleSchema,
} from './models/overtime-rule.schema';
import {
  TimeException,
  TimeExceptionSchema,
} from './models/time-exception.schema';

// Member 2–3 (Attendance / Exceptions / Reports)
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { ExceptionsService } from './exceptions.service';
import { ExceptionsController } from './exceptions.controller';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

// Member 1 (Shifts / Calendar)
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
      {
        name: AttendanceCorrectionRequest.name,
        schema: AttendanceCorrectionRequestSchema,
      },
      { name: ShiftType.name, schema: ShiftTypeSchema },
      { name: ScheduleRule.name, schema: ScheduleRuleSchema },
      { name: AttendanceRecord.name, schema: AttendanceRecordSchema },
      { name: Shift.name, schema: ShiftSchema },
      { name: ShiftAssignment.name, schema: ShiftAssignmentSchema },
      { name: Holiday.name, schema: HolidaySchema },
      { name: LatenessRule.name, schema: latenessRuleSchema },
      { name: OvertimeRule.name, schema: OvertimeRuleSchema },
      { name: TimeException.name, schema: TimeExceptionSchema },
    ]),
  ],
  controllers: [
    TimeManagementController,
    AttendanceController,
    ExceptionsController,
    ReportsController,
    ShiftsController,
    CalendarController,
  ],
  providers: [
    TimeManagementService,
    AttendanceService,
    ExceptionsService,
    ReportsService,
    ShiftsService,
    CalendarService,
  ],
})
export class TimeManagementModule {}