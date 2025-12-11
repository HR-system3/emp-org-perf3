import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { allowance } from './models/allowance.schema';
import { payGrade } from './models/payGrades.schema';
import { terminationAndResignationBenefits } from './models/terminationAndResignationBenefits';

import { CreateAllowanceDto } from './dto/create-allowance.dto';
import { UpdateAllowanceDto } from './dto/update-allowance.dto';

import { CreatePayGradeDto } from './dto/create-pay-grade.dto';
import { UpdatePayGradeDto } from './dto/update-pay-grade.dto';

import { CreateTerminationBenefitDto } from './dto/create-termination-benefit.dto';
import { UpdateTerminationBenefitDto } from './dto/update-termination-benefit.dto';

@Injectable()
export class PayrollConfigurationService {
  constructor(
    @InjectModel(allowance.name)
    private readonly allowanceModel: Model<allowance>,

    @InjectModel(payGrade.name)
    private readonly payGradeModel: Model<payGrade>,

    @InjectModel(terminationAndResignationBenefits.name)
    private readonly terminationModel: Model<terminationAndResignationBenefits>,
  ) {}

  // =========================================================
  //  ALLOWANCES
  // =========================================================
  async createAllowance(dto: CreateAllowanceDto) {
    // check duplicate
    const exists = await this.allowanceModel.findOne({ name: dto.name });
    if (exists) {
      throw new BadRequestException('Allowance name already exists.');
    }

    const created = new this.allowanceModel({
      ...dto,
      status: 'DRAFT',  // always draft in Member 1
    });

    return created.save();
  }

  async findAllAllowances() {
    return this.allowanceModel.find();
  }

  async findAllowanceById(id: string) {
    const found = await this.allowanceModel.findById(id);
    if (!found) throw new NotFoundException('Allowance not found');
    return found;
  }

  async updateAllowance(id: string, dto: UpdateAllowanceDto) {
    const exist = await this.allowanceModel.findById(id);
    if (!exist) throw new NotFoundException('Allowance not found');

    // unique name validation
    if (dto.name) {
      const duplicate = await this.allowanceModel.findOne({ name: dto.name, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another allowance already uses this name.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  // =========================================================
  //  PAY GRADES
  // =========================================================
  async createPayGrade(dto: CreatePayGradeDto) {
    // validate unique grade
    const exist = await this.payGradeModel.findOne({ grade: dto.grade });
    if (exist) {
      throw new BadRequestException('Pay Grade already exists.');
    }

    // business rule: grossSalary >= baseSalary
    if (dto.grossSalary < dto.baseSalary) {
      throw new BadRequestException('Gross salary cannot be less than base salary.');
    }

    const created = new this.payGradeModel({
      ...dto,
      status: 'DRAFT', // always draft
    });

    return created.save();
  }

  async findAllPayGrades() {
    return this.payGradeModel.find();
  }

  async findPayGradeById(id: string) {
    const found = await this.payGradeModel.findById(id);
    if (!found) throw new NotFoundException('Pay Grade not found');
    return found;
  }

  async updatePayGrade(id: string, dto: UpdatePayGradeDto) {
    const exist = await this.payGradeModel.findById(id);
    if (!exist) throw new NotFoundException('Pay Grade not found');

    // unique grade validation
    if (dto.grade) {
      const duplicate = await this.payGradeModel.findOne({ grade: dto.grade, _id: { $ne: id } });
      if (duplicate) throw new BadRequestException('Another Pay Grade already uses this grade.');
    }

    // validate salary rule
    if (dto.baseSalary && dto.grossSalary) {
      if (dto.grossSalary < dto.baseSalary) {
        throw new BadRequestException('Gross salary cannot be less than base salary.');
      }
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  // =========================================================
  //  TERMINATION / RESIGNATION BENEFITS
  // =========================================================
  async createTerminationBenefit(dto: CreateTerminationBenefitDto) {
    const exist = await this.terminationModel.findOne({ name: dto.name });
    if (exist) throw new BadRequestException('Termination Benefit already exists.');

    const created = new this.terminationModel({
      ...dto,
      status: 'DRAFT',
    });

    return created.save();
  }

  async findAllTerminationBenefits() {
    return this.terminationModel.find();
  }

  async findTerminationBenefitById(id: string) {
    const found = await this.terminationModel.findById(id);
    if (!found) throw new NotFoundException('Termination benefit not found');
    return found;
  }

  async updateTerminationBenefit(id: string, dto: UpdateTerminationBenefitDto) {
    const exist = await this.terminationModel.findById(id);
    if (!exist) throw new NotFoundException('Termination benefit not found');

    // unique name validation
    if (dto.name) {
      const duplicate = await this.terminationModel.findOne({
        name: dto.name,
        _id: { $ne: id },
      });
      if (duplicate) throw new BadRequestException('Another benefit already uses this name.');
    }

    Object.assign(exist, dto);
    return exist.save();
  }

  // =========================================================
  //  FULL STRUCTURE OVERVIEW
  // =========================================================
  async getFullStructure() {
    const payGrades = await this.payGradeModel.find();
    const allowances = await this.allowanceModel.find();
    const terminationBenefits = await this.terminationModel.find();

    return {
      payGrades,
      allowances,
      terminationBenefits,
    };
  }
}
