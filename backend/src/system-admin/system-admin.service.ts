import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Department,
  DepartmentDocument,
} from '../organization-structure/models/department.schema';
import {
  Position,
  PositionDocument,
} from '../organization-structure/models/position.schema';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../employee-profile/models/employee-profile.schema';
import { HierarchyBuilder } from '../organization-structure/utils/hierarchy-builder';

@Injectable()
export class SystemAdminService {
  constructor(
    @InjectModel(Department.name)
    private departmentModel: Model<DepartmentDocument>,
    @InjectModel(Position.name)
    private positionModel: Model<PositionDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
  ) {}

  async getSystemInfo() {
    return {
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
      },
      apiVersion: '1.0.0',
      database: {
        connected: true, // Could check actual DB connection status
      },
    };
  }

  async getFeatureFlags() {
    // Feature flags from environment variables
    return {
      enableOrgChartCache: process.env.ENABLE_ORG_CHART_CACHE !== 'false',
      enableAuditLogging: process.env.ENABLE_AUDIT_LOGGING !== 'false',
      enablePerformanceManagement: process.env.ENABLE_PERFORMANCE_MANAGEMENT !== 'false',
      enableLeaveManagement: process.env.ENABLE_LEAVE_MANAGEMENT !== 'false',
      enablePayrollIntegration: process.env.ENABLE_PAYROLL_INTEGRATION !== 'false',
    };
  }

  async recalculateOrgChart() {
    try {
      // Get all active positions
      const allPositions = await this.positionModel
        .find({ isActive: true })
        .exec();

      // Build hierarchy using HierarchyBuilder
      const hierarchy = HierarchyBuilder.buildFullHierarchy(allPositions);

      // Count statistics
      const stats = {
        totalPositions: allPositions.length,
        rootPositions: hierarchy.length,
        totalNodes: this.countNodes(hierarchy),
        timestamp: new Date().toISOString(),
      };

      return {
        success: true,
        message: 'Organization chart recalculated successfully',
        stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to recalculate org chart: ${error.message}`,
        error: error.message,
      };
    }
  }

  private countNodes(nodes: any[]): number {
    let count = nodes.length;
    for (const node of nodes) {
      if (node.subordinates && node.subordinates.length > 0) {
        count += this.countNodes(node.subordinates);
      }
    }
    return count;
  }

  async dataIntegrityCheck() {
    const issues: string[] = [];
    const warnings: string[] = [];
    const stats: any = {};

    try {
      // Check 1: Positions with invalid departmentId
      const allPositions = await this.positionModel.find().exec();
      const allDepartments = await this.departmentModel.find().exec();
      const departmentIds = new Set(
        allDepartments.map((d) => d._id.toString()),
      );

      const positionsWithInvalidDept = allPositions.filter(
        (p) => !departmentIds.has(p.departmentId.toString()),
      );

      if (positionsWithInvalidDept.length > 0) {
        issues.push(
          `Found ${positionsWithInvalidDept.length} position(s) with invalid departmentId`,
        );
      }

      // Check 2: Circular reporting lines
      const circularReports = this.detectCircularReporting(allPositions);
      if (circularReports.length > 0) {
        issues.push(
          `Found ${circularReports.length} circular reporting relationship(s)`,
        );
      }

      // Check 3: Employees with invalid primaryPositionId
      const allEmployees = await this.employeeProfileModel.find().exec();
      const positionIds = new Set(allPositions.map((p) => p._id.toString()));

      const employeesWithInvalidPosition = allEmployees.filter(
        (e) =>
          e.primaryPositionId &&
          !positionIds.has(e.primaryPositionId.toString()),
      );

      if (employeesWithInvalidPosition.length > 0) {
        warnings.push(
          `Found ${employeesWithInvalidPosition.length} employee(s) with invalid primaryPositionId`,
        );
      }

      // Check 4: Departments without head position (warning only)
      const departmentsWithoutHead = allDepartments.filter(
        (d) => !d.headPositionId,
      );
      if (departmentsWithoutHead.length > 0) {
        warnings.push(
          `Found ${departmentsWithoutHead.length} department(s) without head position`,
        );
      }

      // Statistics
      stats.totalDepartments = allDepartments.length;
      stats.totalPositions = allPositions.length;
      stats.totalEmployees = allEmployees.length;
      stats.activePositions = allPositions.filter((p) => p.isActive).length;
      stats.activeEmployees = allEmployees.filter(
        (e) => e.isActive !== false,
      ).length;

      return {
        success: true,
        timestamp: new Date().toISOString(),
        issues,
        warnings,
        stats,
        status:
          issues.length === 0
            ? 'healthy'
            : warnings.length > 0
              ? 'warning'
              : 'error',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Data integrity check failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  private detectCircularReporting(positions: PositionDocument[]): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (positionId: string, path: string[] = []): boolean => {
      if (recStack.has(positionId)) {
        // Found cycle - record the circular path
        const cycleStart = path.indexOf(positionId);
        const cyclePath = path.slice(cycleStart).concat(positionId);
        circular.push(
          `Circular reporting detected: ${cyclePath.map((id) => {
            const pos = positions.find((p) => p._id.toString() === id);
            return pos ? pos.title : id;
          }).join(' -> ')}`,
        );
        return true;
      }
      if (visited.has(positionId)) {
        return false; // Already processed, no cycle from here
      }

      visited.add(positionId);
      recStack.add(positionId);
      path.push(positionId);

      const position = positions.find(
        (p) => p._id.toString() === positionId,
      );
      if (position?.reportsToPositionId) {
        const reportsToId = position.reportsToPositionId.toString();
        hasCycle(reportsToId, [...path]);
      }

      recStack.delete(positionId);
      path.pop();
      return false;
    };

    for (const position of positions) {
      if (!visited.has(position._id.toString())) {
        hasCycle(position._id.toString());
      }
    }

    return circular;
  }
}
