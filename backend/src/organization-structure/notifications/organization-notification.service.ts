import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from '../../employee-profile/models/employee-profile.schema';
import {
  Position,
  PositionDocument,
} from '../models/position.schema';
import {
  Department,
  DepartmentDocument,
} from '../models/department.schema';
import {
  StructureChangeRequest,
  StructureChangeRequestDocument,
} from '../models/structure-change-request.schema';
import {
  EmployeeSystemRole,
  EmployeeSystemRoleDocument,
} from '../../employee-profile/models/employee-system-role.schema';
import { User, UserDocument } from '../../users/models/user.schema';
import {
  InAppNotification,
  InAppNotificationDocument,
} from '../models/in-app-notification.schema';
import { IEmailService } from './email-service.interface';

/**
 * Organization Notification Service
 * REQ-OSM-11: Notify stakeholders on hierarchy changes
 * 
 * This service identifies and notifies relevant stakeholders when organizational
 * structure changes occur. Notifications are logged and ready for email/in-app integration.
 */
@Injectable()
export class OrganizationNotificationService {
  private emailService?: IEmailService;
  private notificationQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  constructor(
    @InjectModel(EmployeeProfile.name)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(Position.name)
    private readonly positionModel: Model<PositionDocument>,
    @InjectModel(Department.name)
    private readonly departmentModel: Model<DepartmentDocument>,
    @InjectModel(StructureChangeRequest.name)
    private readonly changeRequestModel: Model<StructureChangeRequestDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private readonly employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(InAppNotification.name)
    private readonly inAppNotificationModel: Model<InAppNotificationDocument>,
  ) {}

  /**
   * Set email service (injected from module)
   */
  setEmailService(emailService: IEmailService): void {
    this.emailService = emailService;
  }

  /**
   * Identify stakeholders for a department change
   */
  private async getDepartmentStakeholders(
    departmentId: Types.ObjectId | string,
  ): Promise<string[]> {
    const stakeholders: string[] = [];

    // Get department head
    const department = await this.departmentModel
      .findById(departmentId)
      .select('headPositionId')
      .lean()
      .exec();

    if (department?.headPositionId) {
      const headProfile = await this.employeeProfileModel
        .findOne({ primaryPositionId: department.headPositionId })
        .select('personalEmail')
        .lean()
        .exec();
      if (headProfile?.personalEmail) {
        stakeholders.push(headProfile.personalEmail);
      }
    }

    // Get all employees in the department
    const departmentEmployees = await this.employeeProfileModel
      .find({ primaryDepartmentId: departmentId, status: 'ACTIVE' })
      .select('personalEmail')
      .lean()
      .exec();

    departmentEmployees.forEach((emp) => {
      if (emp.personalEmail) {
        stakeholders.push(emp.personalEmail);
      }
    });

    return [...new Set(stakeholders)]; // Remove duplicates
  }

  /**
   * Identify stakeholders for a position change
   */
  private async getPositionStakeholders(
    positionId: Types.ObjectId | string,
  ): Promise<string[]> {
    const stakeholders: string[] = [];

    // Get position holder
    const positionHolder = await this.employeeProfileModel
      .findOne({ primaryPositionId: positionId })
      .select('personalEmail')
      .lean()
      .exec();
    if (positionHolder?.personalEmail) {
      stakeholders.push(positionHolder.personalEmail);
    }

    // Get reporting manager
    const position = await this.positionModel
      .findById(positionId)
      .select('reportsToPositionId departmentId')
      .lean()
      .exec();

    if (position?.reportsToPositionId) {
      const managerProfile = await this.employeeProfileModel
        .findOne({ primaryPositionId: position.reportsToPositionId })
        .select('personalEmail')
        .lean()
        .exec();
      if (managerProfile?.personalEmail) {
        stakeholders.push(managerProfile.personalEmail);
      }
    }

    // Get direct reports
    const directReports = await this.employeeProfileModel
      .find({
        supervisorPositionId: positionId,
        status: 'ACTIVE',
      })
      .select('personalEmail')
      .lean()
      .exec();

    directReports.forEach((emp) => {
      if (emp.personalEmail) {
        stakeholders.push(emp.personalEmail);
      }
    });

    return [...new Set(stakeholders)]; // Remove duplicates
  }

  /**
   * Log notification and send via email/in-app
   */
  private async logNotification(
    event: string,
    stakeholders: string[],
    details: Record<string, any>,
  ): Promise<void> {
    console.log('[OrganizationNotification]', {
      event,
      stakeholders,
      details,
      timestamp: new Date().toISOString(),
    });

    // Queue notifications for async processing
    this.queueNotification(async () => {
      // Create in-app notifications
      await this.createInAppNotifications(event, stakeholders, details);

      // Send email notifications if email service is configured
      if (this.emailService && stakeholders.length > 0) {
        await this.sendEmailNotifications(event, stakeholders, details);
      }
    });
  }

  /**
   * Queue notification for async processing
   */
  private queueNotification(notificationFn: () => Promise<void>): void {
    this.notificationQueue.push(notificationFn);
    this.processQueue();
  }

  /**
   * Process notification queue asynchronously
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.notificationQueue.length > 0) {
      const notificationFn = this.notificationQueue.shift();
      if (notificationFn) {
        try {
          await notificationFn();
        } catch (error) {
          console.error('[OrganizationNotification] Error processing notification:', error);
        }
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Create in-app notification records
   */
  private async createInAppNotifications(
    event: string,
    stakeholders: string[],
    details: Record<string, any>,
  ): Promise<void> {
    // Get employee IDs from email addresses
    const employeeProfiles = await this.employeeProfileModel
      .find({ personalEmail: { $in: stakeholders } })
      .select('_id')
      .lean()
      .exec();

    const notifications = employeeProfiles.map((profile) => {
      const notification = this.buildInAppNotification(event, details);
      return {
        ...notification,
        recipientEmployeeId: profile._id,
      };
    });

    if (notifications.length > 0) {
      await this.inAppNotificationModel.insertMany(notifications).catch((err) => {
        console.error('[OrganizationNotification] Failed to create in-app notifications:', err);
      });
    }
  }

  /**
   * Build in-app notification object
   */
  private buildInAppNotification(
    event: string,
    details: Record<string, any>,
  ): Partial<InAppNotification> {
    const templates: Record<string, { title: string; message: string; type: 'info' | 'warning' | 'success' | 'error'; actionUrl?: string }> = {
      DEPARTMENT_CREATED: {
        title: 'New Department Created',
        message: `Department "${details.departmentName || details.departmentId}" has been created.`,
        type: 'info',
      },
      DEPARTMENT_UPDATED: {
        title: 'Department Updated',
        message: `Department "${details.departmentName || details.departmentId}" has been updated.`,
        type: 'info',
      },
      POSITION_CREATED: {
        title: 'New Position Created',
        message: `Position "${details.positionTitle || details.positionId}" has been created.`,
        type: 'info',
      },
      POSITION_UPDATED: {
        title: 'Position Updated',
        message: `Position "${details.positionTitle || details.positionId}" has been updated.`,
        type: 'info',
      },
      POSITION_DEACTIVATED: {
        title: 'Position Deactivated',
        message: `Position "${details.positionTitle || details.positionId}" has been deactivated.`,
        type: 'warning',
      },
      POSITION_DELIMITED: {
        title: 'Position Delimited',
        message: `Position "${details.positionTitle || details.positionId}" has been delimited. Reason: ${details.reason || 'N/A'}`,
        type: 'warning',
      },
      CHANGE_REQUEST_SUBMITTED: {
        title: 'Change Request Submitted',
        message: `Change request ${details.requestNumber} has been submitted and is pending approval.`,
        type: 'info',
        actionUrl: `/change-requests/${details.requestId}`,
      },
      CHANGE_REQUEST_APPROVED: {
        title: 'Change Request Approved',
        message: `Change request ${details.requestNumber} has been approved and implemented.`,
        type: 'success',
        actionUrl: `/change-requests/${details.requestId}`,
      },
      CHANGE_REQUEST_REJECTED: {
        title: 'Change Request Rejected',
        message: `Change request ${details.requestNumber} has been rejected.${details.reason ? ` Reason: ${details.reason}` : ''}`,
        type: 'error',
        actionUrl: `/change-requests/${details.requestId}`,
      },
      REPORTING_LINE_CHANGED: {
        title: 'Reporting Line Changed',
        message: `Your reporting line has been updated for position "${details.positionTitle || details.positionId}".`,
        type: 'info',
      },
    };

    const template = templates[event] || {
      title: 'Organization Update',
      message: 'An organizational structure change has occurred.',
      type: 'info' as const,
    };

    return {
      eventType: event,
      title: template.title,
      message: template.message,
      type: template.type,
      metadata: details,
      actionUrl: template.actionUrl,
    };
  }

  /**
   * Send email notifications
   */
  private async sendEmailNotifications(
    event: string,
    stakeholders: string[],
    details: Record<string, any>,
  ): Promise<void> {
    if (!this.emailService) return;

    const subject = this.getEmailSubject(event, details);
    const body = this.getEmailBody(event, details);

    try {
      await this.emailService.sendEmail(stakeholders, subject, body, {
        priority: 'normal',
      });
    } catch (error) {
      console.error('[OrganizationNotification] Failed to send email notifications:', error);
    }
  }

  /**
   * Get email subject for event
   */
  private getEmailSubject(event: string, details: Record<string, any>): string {
    const subjects: Record<string, string> = {
      DEPARTMENT_CREATED: `New Department Created: ${details.departmentName || details.departmentId}`,
      DEPARTMENT_UPDATED: `Department Updated: ${details.departmentName || details.departmentId}`,
      POSITION_CREATED: `New Position Created: ${details.positionTitle || details.positionId}`,
      POSITION_UPDATED: `Position Updated: ${details.positionTitle || details.positionId}`,
      POSITION_DEACTIVATED: `Position Deactivated: ${details.positionTitle || details.positionId}`,
      POSITION_DELIMITED: `Position Delimited: ${details.positionTitle || details.positionId}`,
      CHANGE_REQUEST_SUBMITTED: `Change Request Submitted: ${details.requestNumber}`,
      CHANGE_REQUEST_APPROVED: `Change Request Approved: ${details.requestNumber}`,
      CHANGE_REQUEST_REJECTED: `Change Request Rejected: ${details.requestNumber}`,
      REPORTING_LINE_CHANGED: `Reporting Line Changed: ${details.positionTitle || details.positionId}`,
    };

    return subjects[event] || 'Organization Structure Update';
  }

  /**
   * Get email body for event
   */
  private getEmailBody(event: string, details: Record<string, any>): string {
    // Simple HTML email template
    const body = `
      <html>
        <body>
          <h2>Organization Structure Notification</h2>
          <p>An organizational structure change has occurred:</p>
          <ul>
            ${Object.entries(details)
              .map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`)
              .join('')}
          </ul>
          <p>Please log in to the system to view more details.</p>
        </body>
      </html>
    `;
    return body;
  }

  /**
   * Notify stakeholders when a department is created
   */
  async notifyDepartmentCreated(
    departmentId: Types.ObjectId | string,
    departmentName: string,
  ): Promise<void> {
    const stakeholders = await this.getDepartmentStakeholders(departmentId);
    await this.logNotification('DEPARTMENT_CREATED', stakeholders, {
      departmentId: departmentId.toString(),
      departmentName,
    });
  }

  /**
   * Notify stakeholders when a department is updated
   */
  async notifyDepartmentUpdated(
    departmentId: Types.ObjectId | string,
    departmentName: string,
    changes: Record<string, any>,
  ): Promise<void> {
    const stakeholders = await this.getDepartmentStakeholders(departmentId);
    await this.logNotification('DEPARTMENT_UPDATED', stakeholders, {
      departmentId: departmentId.toString(),
      departmentName,
      changes,
    });
  }

  /**
   * Notify stakeholders when a position is created
   */
  async notifyPositionCreated(
    positionId: Types.ObjectId | string,
    positionTitle: string,
  ): Promise<void> {
    const stakeholders = await this.getPositionStakeholders(positionId);
    await this.logNotification('POSITION_CREATED', stakeholders, {
      positionId: positionId.toString(),
      positionTitle,
    });
  }

  /**
   * Notify stakeholders when a position is updated
   */
  async notifyPositionUpdated(
    positionId: Types.ObjectId | string,
    positionTitle: string,
    changes: Record<string, any>,
  ): Promise<void> {
    const stakeholders = await this.getPositionStakeholders(positionId);
    await this.logNotification('POSITION_UPDATED', stakeholders, {
      positionId: positionId.toString(),
      positionTitle,
      changes,
    });
  }

  /**
   * Notify stakeholders when a position is deactivated
   */
  async notifyPositionDeactivated(
    positionId: Types.ObjectId | string,
    positionTitle: string,
  ): Promise<void> {
    const stakeholders = await this.getPositionStakeholders(positionId);
    await this.logNotification('POSITION_DEACTIVATED', stakeholders, {
      positionId: positionId.toString(),
      positionTitle,
    });
  }

  /**
   * Notify stakeholders when a position is delimited
   */
  async notifyPositionDelimited(
    positionId: Types.ObjectId | string,
    positionTitle: string,
    reason: string,
  ): Promise<void> {
    const stakeholders = await this.getPositionStakeholders(positionId);
    await this.logNotification('POSITION_DELIMITED', stakeholders, {
      positionId: positionId.toString(),
      positionTitle,
      reason,
    });
  }

  /**
   * Notify stakeholders when a change request is submitted
   */
  async notifyChangeRequestSubmitted(
    requestId: Types.ObjectId | string,
    requestNumber: string,
    requestedBy: string,
  ): Promise<void> {
    // Notify HR admins and managers via User model
    const hrUsers = await this.userModel
      .find({
        role: { $in: ['HR Admin', 'HR Manager'] },
        isActive: true,
      })
      .select('email')
      .lean()
      .exec();

    const stakeholders = hrUsers
      .map((user) => user.email)
      .filter(Boolean);

    await this.logNotification('CHANGE_REQUEST_SUBMITTED', stakeholders, {
      requestId: requestId.toString(),
      requestNumber,
      requestedBy,
    });
  }

  /**
   * Notify stakeholders when a change request is approved
   */
  async notifyChangeRequestApproved(
    requestId: Types.ObjectId | string,
    requestNumber: string,
    approverId: string,
  ): Promise<void> {
    const request = await this.changeRequestModel
      .findById(requestId)
      .select('requestedByEmployeeId targetDepartmentId targetPositionId')
      .lean()
      .exec();

    if (!request) return;

    let stakeholders: string[] = [];

    // Notify requester
    const requester = await this.employeeProfileModel
      .findById(request.requestedByEmployeeId)
      .select('personalEmail')
      .lean()
      .exec();
    if (requester?.personalEmail) {
      stakeholders.push(requester.personalEmail);
    }

    // Notify affected stakeholders
    if (request.targetDepartmentId) {
      const deptStakeholders = await this.getDepartmentStakeholders(
        request.targetDepartmentId,
      );
      stakeholders.push(...deptStakeholders);
    }
    if (request.targetPositionId) {
      const posStakeholders = await this.getPositionStakeholders(
        request.targetPositionId,
      );
      stakeholders.push(...posStakeholders);
    }

    await this.logNotification('CHANGE_REQUEST_APPROVED', [...new Set(stakeholders)], {
      requestId: requestId.toString(),
      requestNumber,
      approverId,
    });
  }

  /**
   * Notify stakeholders when a change request is rejected
   */
  async notifyChangeRequestRejected(
    requestId: Types.ObjectId | string,
    requestNumber: string,
    approverId: string,
    reason?: string,
  ): Promise<void> {
    const request = await this.changeRequestModel
      .findById(requestId)
      .select('requestedByEmployeeId')
      .lean()
      .exec();

    if (!request) return;

    // Notify requester
    const requester = await this.employeeProfileModel
      .findById(request.requestedByEmployeeId)
      .select('personalEmail')
      .lean()
      .exec();

    const stakeholders = requester?.personalEmail ? [requester.personalEmail] : [];

    await this.logNotification('CHANGE_REQUEST_REJECTED', stakeholders, {
      requestId: requestId.toString(),
      requestNumber,
      approverId,
      reason,
    });
  }

  /**
   * Notify stakeholders when reporting line changes
   */
  async notifyReportingLineChanged(
    positionId: Types.ObjectId | string,
    oldManagerId: Types.ObjectId | string | null,
    newManagerId: Types.ObjectId | string | null,
  ): Promise<void> {
    const stakeholders: string[] = [];

    // Get position holder
    const positionHolder = await this.employeeProfileModel
      .findOne({ primaryPositionId: positionId })
      .select('personalEmail')
      .lean()
      .exec();
    if (positionHolder?.personalEmail) {
      stakeholders.push(positionHolder.personalEmail);
    }

    // Get old manager
    if (oldManagerId) {
      const oldManager = await this.employeeProfileModel
        .findOne({ primaryPositionId: oldManagerId })
        .select('personalEmail')
        .lean()
        .exec();
      if (oldManager?.personalEmail) {
        stakeholders.push(oldManager.personalEmail);
      }
    }

    // Get new manager
    if (newManagerId) {
      const newManager = await this.employeeProfileModel
        .findOne({ primaryPositionId: newManagerId })
        .select('personalEmail')
        .lean()
        .exec();
      if (newManager?.personalEmail) {
        stakeholders.push(newManager.personalEmail);
      }
    }

    await this.logNotification('REPORTING_LINE_CHANGED', [...new Set(stakeholders)], {
      positionId: positionId.toString(),
      oldManagerId: oldManagerId?.toString(),
      newManagerId: newManagerId?.toString(),
    });
  }
}
