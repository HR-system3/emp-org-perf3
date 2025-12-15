'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

const navItems = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
  
  // Organization Structure Section
  { section: 'Organization Structure' },
  { name: 'Departments', href: ROUTES.DEPARTMENTS, icon: '🏢' },
  { name: 'Positions', href: ROUTES.POSITIONS, icon: '💼' },
  { name: 'Change Requests', href: ROUTES.CHANGE_REQUESTS, icon: '📝' },
  { name: 'Org Chart', href: ROUTES.ORG_CHART, icon: '🌳' },
  
  // Employee Profile Section
  { section: 'Employee Profile' },
  { name: 'Create Employee', href: '/employee-profile/new', icon: '➕' },
  { name: 'Search Employee', href: '/employee-profile/search-by-number', icon: '🔍' },
  { name: 'Profile Change Requests', href: '/employee-profile/change-requests', icon: '📋' },
  { name: 'Process Requests', href: '/employee-profile/change-requests/process', icon: '✅' },
  { name: 'Self-Service Demo', href: '/employee-profile/self-demo', icon: '👨‍💼' },
  { name: 'Manager Team Demo', href: '/employee-profile/manager-team-demo', icon: '👥' },
  
  // Performance Management Section
  { section: 'Performance Management' },
  { name: 'Templates', href: ROUTES.PERFORMANCE_TEMPLATES, icon: '📋' },
  { name: 'Cycles', href: ROUTES.PERFORMANCE_CYCLES, icon: '🔄' },
  { name: 'Assignments', href: ROUTES.PERFORMANCE_ASSIGNMENTS, icon: '📝' },
  { name: 'Records', href: ROUTES.PERFORMANCE_RECORDS, icon: '📊' },
  { name: 'Disputes', href: ROUTES.PERFORMANCE_DISPUTES, icon: '⚖️' },
  
  // Personal
  { section: 'Personal' },
  { name: 'My Team', href: ROUTES.MY_TEAM, icon: '👥' },
  { name: 'Profile', href: ROUTES.PROFILE, icon: '👤' },
];

export default function Navigation() {
  const pathname = usePathname();

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