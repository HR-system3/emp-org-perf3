'use client';

import React from 'react';
import Navigation from './Navigation';

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full">
      <Navigation />
    </aside>
  );
}