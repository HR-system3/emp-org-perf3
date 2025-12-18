/**
 * Email Service Interface
 * 
 * Abstract interface for email service integration.
 * Implementations can use SendGrid, AWS SES, or other email providers.
 */
export interface IEmailService {
  /**
   * Send an email notification
   * @param to - Recipient email address(es)
   * @param subject - Email subject
   * @param body - Email body (HTML or plain text)
   * @param options - Additional options (CC, BCC, attachments, etc.)
   */
  sendEmail(
    to: string | string[],
    subject: string,
    body: string,
    options?: EmailOptions,
  ): Promise<void>;
}

export interface EmailOptions {
  cc?: string | string[];
  bcc?: string | string[];
  from?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
  priority?: 'high' | 'normal' | 'low';
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * Email template types for organization notifications
 */
export enum EmailTemplateType {
  DEPARTMENT_CREATED = 'department_created',
  DEPARTMENT_UPDATED = 'department_updated',
  POSITION_CREATED = 'position_created',
  POSITION_UPDATED = 'position_updated',
  POSITION_DEACTIVATED = 'position_deactivated',
  POSITION_DELIMITED = 'position_delimited',
  CHANGE_REQUEST_SUBMITTED = 'change_request_submitted',
  CHANGE_REQUEST_APPROVED = 'change_request_approved',
  CHANGE_REQUEST_REJECTED = 'change_request_rejected',
  REPORTING_LINE_CHANGED = 'reporting_line_changed',
}
