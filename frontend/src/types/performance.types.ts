export enum AppraisalTemplateType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  PROBATIONARY = 'PROBATIONARY',
  PROJECT = 'PROJECT',
  AD_HOC = 'AD_HOC',
}

export enum AppraisalCycleStatus {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum AppraisalAssignmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  PUBLISHED = 'PUBLISHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

export enum AppraisalRecordStatus {
  DRAFT = 'DRAFT',
  MANAGER_SUBMITTED = 'MANAGER_SUBMITTED',
  HR_PUBLISHED = 'HR_PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AppraisalDisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  ADJUSTED = 'ADJUSTED',
  REJECTED = 'REJECTED',
}

export enum AppraisalRatingScaleType {
  THREE_POINT = 'THREE_POINT',
  FIVE_POINT = 'FIVE_POINT',
  TEN_POINT = 'TEN_POINT',
}

export enum DisputeResolutionAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

// Template Types
export interface RatingScaleDefinition {
  type: AppraisalRatingScaleType;
  min: number;
  max: number;
  step?: number;
  labels?: string[];
}

export interface EvaluationCriterion {
  key: string;
  title: string;
  details?: string;
  weight?: number;
  maxScore?: number;
  required?: boolean;
}

export interface AppraisalTemplate {
  _id: string;
  name: string;
  description?: string;
  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria: EvaluationCriterion[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppraisalTemplateDto {
  name: string;
  description?: string;
  templateType: AppraisalTemplateType;
  ratingScale: RatingScaleDefinition;
  criteria: EvaluationCriterion[];
  instructions?: string;
  applicableDepartmentIds?: string[];
  applicablePositionIds?: string[];
  isActive?: boolean;
}

export interface UpdateAppraisalTemplateDto extends Partial<CreateAppraisalTemplateDto> {}

// Cycle Types
export interface CycleTemplateAssignment {
  templateId: string;
  departmentIds: string[];
}

export interface AppraisalCycle {
  _id: string;
  name: string;
  description?: string;
  cycleType: AppraisalTemplateType;
  startDate: string;
  endDate: string;
  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;
  templateAssignments?: CycleTemplateAssignment[];
  status?: AppraisalCycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppraisalCycleDto {
  name: string;
  description?: string;
  cycleType: AppraisalTemplateType;
  startDate: string;
  endDate: string;
  managerDueDate?: string;
  employeeAcknowledgementDueDate?: string;
  templateAssignments?: CycleTemplateAssignment[];
}

export interface UpdateAppraisalCycleDto extends Partial<CreateAppraisalCycleDto> {}

export interface CycleProgress {
  cycleId: string;
  totalAssignments: number;
  notStarted: number;
  inProgress: number;
  submitted: number;
  published: number;
  acknowledged: number;
  completionRate: number;
}

// Assignment Types
export interface BulkAssignmentItem {
  employeeProfileId: string;
  managerProfileId: string;
  departmentId: string;
  positionId?: string;
  dueDate?: string;
}

export interface BulkAssignAppraisalsDto {
  cycleId: string;
  templateId: string;
  assignments: BulkAssignmentItem[];
}

export interface AppraisalAssignment {
  _id: string;
  cycleId: string;
  templateId: string;
  employeeProfileId: string;
  managerProfileId: string;
  departmentId: string;
  positionId?: string;
  status: AppraisalAssignmentStatus;
  dueDate?: string;
  latestAppraisalId?: string;
  createdAt: string;
  updatedAt: string;
}

// Record Types
export interface RatingEntry {
  key: string;
  title: string;
  ratingValue: number;
  ratingLabel?: string;
  weightedScore?: number;
  comments?: string;
}

export interface AppraisalRecord {
  _id: string;
  assignmentId: string;
  cycleId: string;
  templateId: string;
  employeeProfileId: string;
  managerProfileId: string;
  ratings: RatingEntry[];
  totalScore?: number;
  overallRatingLabel?: string;
  managerSummary?: string;
  strengths?: string;
  improvementAreas?: string;
  status: AppraisalRecordStatus;
  managerSubmittedAt?: string;
  hrPublishedAt?: string;
  publishedByEmployeeId?: string;
  employeeViewedAt?: string;
  employeeAcknowledgedAt?: string;
  employeeAcknowledgementComment?: string;
  archivedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppraisalRecordDto {
  assignmentId: string;
  cycleId: string;
  templateId: string;
  employeeProfileId: string;
  managerProfileId: string;
  ratings: RatingEntry[];
  totalScore?: number;
  overallRatingLabel?: string;
  managerSummary?: string;
  strengths?: string;
  improvementAreas?: string;
}

export interface UpdateAppraisalRecordDto extends Partial<CreateAppraisalRecordDto> {}

export interface PublishAppraisalRecordDto {
  publishedByEmployeeId: string;
}

export interface AcknowledgeAppraisalRecordDto {
  employeeAcknowledgementComment?: string;
}

// Dispute Types
export interface AppraisalDispute {
  _id: string;
  appraisalId: string;
  assignmentId: string;
  cycleId: string;
  raisedByEmployeeId: string;
  reason: string;
  details?: string;
  status: AppraisalDisputeStatus;
  resolutionSummary?: string;
  resolvedByEmployeeId?: string;
  updatedTotalScore?: number;
  updatedOverallRatingLabel?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDisputeDto {
  appraisalId: string;
  assignmentId: string;
  cycleId: string;
  raisedByEmployeeId: string;
  reason: string;
  details?: string;
}

export interface ResolveDisputeDto {
  action: DisputeResolutionAction;
  resolutionSummary: string;
  resolvedByEmployeeId: string;
  updatedTotalScore?: number;
  updatedOverallRatingLabel?: string;
}

