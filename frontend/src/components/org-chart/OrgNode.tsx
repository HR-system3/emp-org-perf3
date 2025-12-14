import React, { useState } from 'react';
import { HierarchyNode } from '@/types/employee.types';

interface OrgNodeProps {
  node: HierarchyNode;
}

export default function OrgNode({ node }: OrgNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow min-w-[200px]">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">
            👤
          </div>
          <h3 className="font-semibold text-gray-900">{node.name}</h3>
          <p className="text-sm text-blue-600">{node.positionTitle}</p>
          <p className="text-xs text-gray-500">{node.departmentName}</p>
          <p className="text-xs text-gray-400 mt-1">{node.email}</p>
        </div>
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? '▼ Collapse' : '▶ Expand'} ({node.children!.length})
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col items-center mt-6">
          <div className="w-px h-6 bg-gray-300"></div>
          <div className="flex gap-8">
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-6 bg-gray-300"></div>
                <OrgNode node={child} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}