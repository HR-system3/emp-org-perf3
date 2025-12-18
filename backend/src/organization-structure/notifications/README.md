# Organization Notification System

## Overview

The Organization Notification System (REQ-OSM-11) provides comprehensive notification capabilities for organizational structure changes. It supports both email and in-app notifications with async processing.

## Architecture

### Components

1. **OrganizationNotificationService** - Main notification service
2. **IEmailService** - Email service interface (implement with SendGrid/AWS SES)
3. **InAppNotification** - Database model for in-app notifications
4. **Notification Queue** - Async processing queue

## Email Service Integration

### Step 1: Create Email Service Implementation

Create an implementation of `IEmailService`:

```typescript
// Example: SendGrid implementation
import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { IEmailService, EmailOptions } from './email-service.interface';

@Injectable()
export class SendGridEmailService implements IEmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    body: string,
    options?: EmailOptions,
  ): Promise<void> {
    const msg = {
      to: Array.isArray(to) ? to : [to],
      from: options?.from || process.env.FROM_EMAIL,
      subject,
      html: body,
      cc: options?.cc,
      bcc: options?.bcc,
    };

    await sgMail.send(msg);
  }
}
```

### Step 2: Register Email Service

In `organization-structure.module.ts`:

```typescript
@Module({
  // ... existing imports
  providers: [
    OrganizationStructureService,
    OrganizationNotificationService,
    {
      provide: 'EMAIL_SERVICE',
      useClass: SendGridEmailService, // or AWS SES, etc.
    },
    // ... other providers
  ],
})
export class OrganizationStructureModule {
  constructor(
    private notificationService: OrganizationNotificationService,
    @Inject('EMAIL_SERVICE') private emailService: IEmailService,
  ) {
    // Inject email service after module initialization
    this.notificationService.setEmailService(this.emailService);
  }
}
```

## Notification Events

The system sends notifications for:

- **Department Created** - When a new department is created
- **Department Updated** - When department details are updated
- **Position Created** - When a new position is created
- **Position Updated** - When position details are updated
- **Position Deactivated** - When a position is deactivated
- **Position Delimited** - When a position is delimited
- **Change Request Submitted** - When a change request is submitted
- **Change Request Approved** - When a change request is approved
- **Change Request Rejected** - When a change request is rejected
- **Reporting Line Changed** - When a position's reporting line changes

## Stakeholder Identification

The service automatically identifies stakeholders:

- **Department changes**: Department head, all employees in department
- **Position changes**: Position holder, reporting manager, direct reports
- **Change requests**: Requester, HR admins/managers, affected stakeholders

## In-App Notifications

In-app notifications are stored in the `in_app_notifications` collection and can be retrieved via:

```typescript
// Get unread notifications for employee
GET /notifications?employeeId={id}&unread=true

// Mark notification as read
PATCH /notifications/{id}/read
```

## Async Processing

Notifications are processed asynchronously via an internal queue to avoid blocking the main request flow. Failed notifications are logged but don't interrupt the main operation.

## Configuration

Set environment variables:

```env
# Email Service (example for SendGrid)
SENDGRID_API_KEY=your_api_key
FROM_EMAIL=noreply@yourcompany.com

# Or for AWS SES
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

## Testing

Notifications are logged to console in development. In production, ensure email service is configured and test with:

```typescript
// Test notification
await notificationService.notifyDepartmentCreated(
  departmentId,
  'Test Department'
);
```

## Future Enhancements

- [ ] SMS notifications for critical changes
- [ ] Notification preferences per user
- [ ] Digest emails (daily/weekly summaries)
- [ ] Webhook support for external integrations
