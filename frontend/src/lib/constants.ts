export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  DEPARTMENTS: '/departments',
  POSITIONS: '/positions',
  CHANGE_REQUESTS: '/change-requests',
  SUBMIT_CHANGE_REQUEST: '/change-requests/submit',
  APPROVE_CHANGE_REQUESTS: '/change-requests/approve',
  ORG_CHART: '/org-chart',
  PROFILE: '/profile',
  MY_TEAM: '/my-team',
  PERFORMANCE_TEMPLATES: '/performance/templates',
  PERFORMANCE_CYCLES: '/performance/cycles',
  PERFORMANCE_ASSIGNMENTS: '/performance/assignments',
  PERFORMANCE_RECORDS: '/performance/records',
  PERFORMANCE_DISPUTES: '/performance/disputes',
};

export const CHANGE_REQUEST_STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SUBMITTED: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  IMPLEMENTED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELED: 'bg-gray-100 text-gray-500',
};

export const CHANGE_REQUEST_TYPE_LABELS = {
  POSITION_CHANGE: 'Position change',
  DEPARTMENT_CHANGE: 'Department change',
  TRANSFER: 'Transfer (between departments)',
};