export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DEPARTMENTS: '/departments',
  POSITIONS: '/positions',
  CHANGE_REQUESTS: '/change-requests',
  SUBMIT_CHANGE_REQUEST: '/change-requests/submit',
  APPROVE_CHANGE_REQUESTS: '/change-requests/approve',
  ORG_CHART: '/org-chart',
  PROFILE: '/profile',
  MY_TEAM: '/my-team',
};

export const CHANGE_REQUEST_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export const CHANGE_REQUEST_TYPE_LABELS = {
  DEPARTMENT_CREATE: 'Create Department',
  DEPARTMENT_UPDATE: 'Update Department',
  DEPARTMENT_DELETE: 'Delete Department',
  POSITION_CREATE: 'Create Position',
  POSITION_UPDATE: 'Update Position',
  POSITION_DELETE: 'Delete Position',
  POSITION_DEACTIVATE: 'Deactivate Position',
};