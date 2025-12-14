import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Holiday,
  HolidayDocument,
} from './models/holiday.schema';
import {
  CalendarQueryDto,
  CreateHolidayDto,
  UpdateHolidayDto,
} from './dto/calendar.dto';

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Holiday.name)
    private readonly holidayModel: Model<HolidayDocument>,
  ) {}

  async createHoliday(dto: CreateHolidayDto) {
    const created = new this.holidayModel({
      type: dto.type,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      name: dto.name,
      active: true,
    });

    return created.save();
  }

  async getHolidays(query: CalendarQueryDto) {
    const filter: any = { active: true };

    if (query.fromDate || query.toDate) {
      filter.startDate = {};
      if (query.fromDate) {
        filter.startDate.$gte = new Date(query.fromDate);
      }
      if (query.toDate) {
        filter.startDate.$lte = new Date(query.toDate);
      }
    }

    return this.holidayModel.find(filter).lean();
  }

  async getCalendar(query: CalendarQueryDto) {
    // For now, calendar is just the active holidays list
    return this.getHolidays(query);
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const holiday = await this.holidayModel.findById(id);
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    if (dto.type !== undefined) holiday.type = dto.type;
    if (dto.startDate !== undefined)
      holiday.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined)
      holiday.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (dto.name !== undefined) holiday.name = dto.name;
    if (dto.active !== undefined) holiday.active = dto.active;

    return holiday.save();
  }

  async deleteHoliday(id: string) {
    const holiday = await this.holidayModel.findById(id);
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }

    holiday.active = false;
    await holiday.save();

    return { success: true };
  }
}