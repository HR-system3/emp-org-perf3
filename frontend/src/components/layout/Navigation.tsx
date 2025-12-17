'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission } from '@/lib/rolePermissions';
import { performanceFeatureAccess } from '@/lib/performanceRoles';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  permission?: string;
}

interface NavSection {
  section: string;
}

type NavItemType = NavItem | NavSection;

const allNavItems: NavItemType[] = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
  
  // Organization Structure Section
  { section: 'Organization Structure' },
  { name: 'Departments', href: ROUTES.DEPARTMENTS, icon: '🏢', permission: 'canViewDepartments' },
  { name: 'Positions', href: ROUTES.POSITIONS, icon: '💼', permission: 'canViewPositions' },
  { name: 'Change Requests', href: ROUTES.CHANGE_REQUESTS, icon: '📝', permission: 'canViewChangeRequests' },
  { name: 'Org Chart', href: ROUTES.ORG_CHART, icon: '🌳', permission: 'canViewOrgChart' },
  
  // Employee Profile Section
  { section: 'Employee Profile' },
  { name: 'Create Employee', href: '/employee-profile/new', icon: '➕', permission: 'canCreateEmployee' },
  { name: 'Search Employee', href: '/employee-profile/search-by-number', icon: '🔍', permission: 'canSearchEmployee' },
  { name: 'Employees Directory', href: '/employee-profile/employees', icon: '👥', permission: 'canViewAllEmployees' },
  { name: 'Profile Change Requests', href: '/employee-profile/change-requests', icon: '📋', permission: 'canViewChangeRequests' },
  { name: 'Process Requests', href: '/employee-profile/change-requests/process', icon: '✅', permission: 'canProcessChangeRequests' },
  { name: 'Self-Service Demo', href: '/employee-profile/self-demo', icon: '👨‍💼', permission: 'canViewSelfService' },
  { name: 'Manager Team Demo', href: '/employee-profile/manager-team-demo', icon: '👥', permission: 'canViewManagerTeam' },
  
  // Performance Management Section
  { section: 'Performance Management' },
  { name: 'Templates', href: ROUTES.PERFORMANCE_TEMPLATES, icon: '📋', permission: 'canViewTemplates' },
  { name: 'Cycles', href: ROUTES.PERFORMANCE_CYCLES, icon: '🔄', permission: 'canViewCycles' },
  { name: 'Assignments', href: ROUTES.PERFORMANCE_ASSIGNMENTS, icon: '📝', permission: 'canViewAssignments' },
  { name: 'Records', href: ROUTES.PERFORMANCE_RECORDS, icon: '📊', permission: 'canViewRecords' },
  { name: 'Disputes', href: ROUTES.PERFORMANCE_DISPUTES, icon: '⚖️', permission: 'canViewDisputes' },
  
  // Personal
  { section: 'Personal' },
  { name: 'My Team', href: ROUTES.MY_TEAM, icon: '👥', permission: 'canViewManagerTeam' },
  { name: 'Profile', href: ROUTES.PROFILE, icon: '👤' },

  // System Admin
  { section: 'System Administration' },
  { name: 'Create Auth User', href: '/system-admin/users/create', icon: '🛠️', permission: 'canAssignRoles' },
  { name: 'User Management', href: '/users', icon: '👥', permission: 'canAssignRoles' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Filter nav items based on user role and permissions
  let navItems = allNavItems.filter((item) => {
    if ('section' in item) {
      return true; // Always show section headers initially
    }
    
    // If no permission required, show to all authenticated users
    if (!item.permission) {
      return true;
    }
    
    // Special handling for Performance Management items
    if (item.href.startsWith('/performance/')) {
      if (!user?.role) {
        return false;
      }
      
      // Use performance-specific role checks
      if (item.href === ROUTES.PERFORMANCE_TEMPLATES) {
        return performanceFeatureAccess.canViewTemplates(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_CYCLES) {
        return performanceFeatureAccess.canViewCycles(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_ASSIGNMENTS) {
        return performanceFeatureAccess.canViewAssignments(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_RECORDS) {
        return performanceFeatureAccess.canViewRecords(user.role);
      }
      if (item.href === ROUTES.PERFORMANCE_DISPUTES) {
        return performanceFeatureAccess.canViewDisputes(user.role);
      }
    }
    
    // Check if user has the required permission for other items
    if (!user?.role) {
      return false;
    }
    
    return hasPermission(user.role, item.permission as any);
  });
  
  // Filter out empty sections (section headers with no items after them)
  navItems = navItems.filter((item, index, array) => {
    if ('section' in item) {
      // Check if there are any non-section items after this section header
      const hasItemsAfter = array.slice(index + 1).some(nextItem => !('section' in nextItem));
      return hasItemsAfter;
    }
    return true;
  });

  return (
    <nav className="h-full w-full bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-8">
        <Link href="/" className="block">
          <h1 className="text-2xl font-bold text-blue-600">HR System</h1>
          <p className="text-sm text-gray-500">Complete Management</p>
        </Link>
      </div>

      <ul className="space-y-1">
        {navItems.map((item, index) => {
          if ('section' in item) {
            return (
              <li key={`section-${index}`} className="pt-4 pb-2 px-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.section}
                </p>
              </li>
            );
          }

          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}