import mongoose from 'mongoose';
import { DepartmentSchema } from './models/department.schema';
import { PositionSchema } from './models/position.schema';
import { PositionStatus } from './enums/organization-structure.enums';

/**
 * Seed Organization Structure Module
 * Creates sample departments and positions with valid reporting lines
 */
export async function seedOrganizationStructure(
  connection: mongoose.Connection,
) {
  const DepartmentModel = connection.model('Department', DepartmentSchema);
  const PositionModel = connection.model('Position', PositionSchema);

  console.log('Clearing Organization Structure...');
  await PositionModel.deleteMany({});
  await DepartmentModel.deleteMany({});

  console.log('Seeding Departments...');

  // Create Department 1: Human Resources
  const hrDept = await DepartmentModel.create({
    deptId: 'DEPT-HR-001',
    code: 'HR',
    name: 'Human Resources',
    description: 'Handles all HR operations, recruitment, and employee relations',
    costCenter: 'CC-HR-001',
    isActive: true,
  });

  // Create Department 2: Engineering
  const engDept = await DepartmentModel.create({
    deptId: 'DEPT-ENG-001',
    code: 'ENG',
    name: 'Engineering',
    description: 'Software development and technical operations',
    costCenter: 'CC-ENG-001',
    isActive: true,
  });

  console.log('Departments seeded.');

  console.log('Seeding Positions...');

  // Create Pay Grade IDs (mock - these should exist in Payroll module)
  // In real scenario, these would be fetched from Payroll module
  const payGradeSenior = new mongoose.Types.ObjectId();
  const payGradeMid = new mongoose.Types.ObjectId();
  const payGradeJunior = new mongoose.Types.ObjectId();

  // Create top-level position: Chief HR Officer (no reporting line)
  const chiefHRO = await PositionModel.create({
    positionId: 'POS-CHRO-001',
    code: 'CHRO',
    title: 'Chief Human Resources Officer',
    description: 'Head of HR department',
    jobKey: 'HR-EXEC-001',
    departmentId: hrDept._id,
    payGradeId: payGradeSenior,
    reportsToPositionId: undefined, // Top-level position
    status: PositionStatus.VACANT,
    costCenter: 'CC-HR-001',
    isActive: true,
  });

  // Update department head
  hrDept.headPositionId = chiefHRO._id;
  await hrDept.save();

  // Create position reporting to CHRO: HR Manager
  const hrManager = await PositionModel.create({
    positionId: 'POS-HRM-001',
    code: 'HR-MGR',
    title: 'HR Manager',
    description: 'Manages HR operations and team',
    jobKey: 'HR-MGR-001',
    departmentId: hrDept._id,
    payGradeId: payGradeMid,
    reportsToPositionId: chiefHRO._id,
    status: PositionStatus.VACANT,
    costCenter: 'CC-HR-001',
    isActive: true,
  });

  // Create position reporting to HR Manager: HR Specialist
  const hrSpecialist = await PositionModel.create({
    positionId: 'POS-HRS-001',
    code: 'HR-SPEC',
    title: 'HR Specialist',
    description: 'Handles HR operations and employee relations',
    jobKey: 'HR-SPEC-001',
    departmentId: hrDept._id,
    payGradeId: payGradeJunior,
    reportsToPositionId: hrManager._id,
    status: PositionStatus.VACANT,
    costCenter: 'CC-HR-001',
    isActive: true,
  });

  // Create top-level position in Engineering: CTO (no reporting line)
  const cto = await PositionModel.create({
    positionId: 'POS-CTO-001',
    code: 'CTO',
    title: 'Chief Technology Officer',
    description: 'Head of Engineering department',
    jobKey: 'ENG-EXEC-001',
    departmentId: engDept._id,
    payGradeId: payGradeSenior,
    reportsToPositionId: undefined, // Top-level position
    status: PositionStatus.VACANT,
    costCenter: 'CC-ENG-001',
    isActive: true,
  });

  // Update department head
  engDept.headPositionId = cto._id;
  await engDept.save();

  // Create position reporting to CTO: Engineering Manager
  const engManager = await PositionModel.create({
    positionId: 'POS-ENGM-001',
    code: 'ENG-MGR',
    title: 'Engineering Manager',
    description: 'Manages engineering team and projects',
    jobKey: 'ENG-MGR-001',
    departmentId: engDept._id,
    payGradeId: payGradeMid,
    reportsToPositionId: cto._id,
    status: PositionStatus.VACANT,
    costCenter: 'CC-ENG-001',
    isActive: true,
  });

  // Create position reporting to Engineering Manager: Senior Developer
  const seniorDev = await PositionModel.create({
    positionId: 'POS-SDEV-001',
    code: 'ENG-SDEV',
    title: 'Senior Software Developer',
    description: 'Senior developer role in engineering team',
    jobKey: 'ENG-SDEV-001',
    departmentId: engDept._id,
    payGradeId: payGradeMid,
    reportsToPositionId: engManager._id,
    status: PositionStatus.VACANT,
    costCenter: 'CC-ENG-001',
    isActive: true,
  });

  console.log('Positions seeded.');

  return {
    departments: {
      hr: hrDept,
      engineering: engDept,
    },
    positions: {
      chiefHRO,
      hrManager,
      hrSpecialist,
      cto,
      engManager,
      seniorDev,
    },
  };
}


