import React, { useState } from 'react';
import type { AuditMetrics, DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const AuditControl: React.FC<Props> = ({ filters: _filters }) => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Mock data
  const data: AuditMetrics = {
    recentActions: [
      {
        id: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: 'Alice Johnson',
        action: 'Update',
        entity: 'Product',
        entityId: 'PROD-001',
        changes: [
          { field: 'Price', oldValue: '$4.50', newValue: '$5.00' },
          { field: 'Stock', oldValue: '150', newValue: '120' },
        ],
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        user: 'Bob Smith',
        action: 'Cancel',
        entity: 'Order',
        entityId: 'ORD-12345',
        changes: [
          { field: 'Status', oldValue: 'CONFIRMED', newValue: 'CANCELLED' },
          { field: 'Reason', oldValue: 'None', newValue: 'Customer Request' },
        ],
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        user: 'Carol White',
        action: 'Soft Delete',
        entity: 'Product',
        entityId: 'PROD-002',
        changes: [
          { field: 'Status', oldValue: 'ACTIVE', newValue: 'INACTIVE' },
        ],
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        user: 'David Brown',
        action: 'Update',
        entity: 'Customer',
        entityId: 'CUST-456',
        changes: [
          { field: 'Tier', oldValue: 'SILVER', newValue: 'GOLD' },
        ],
      },
    ],
    mostChangedEntities: [
      { entityType: 'Product', changeCount: 156 },
      { entityType: 'Order', changeCount: 98 },
      { entityType: 'Customer', changeCount: 45 },
      { entityType: 'Inventory', changeCount: 32 },
    ],
    userActivitySummary: [
      { user: 'Alice Johnson', actionCount: 324 },
      { user: 'Bob Smith', actionCount: 287 },
      { user: 'Carol White', actionCount: 156 },
      { user: 'David Brown', actionCount: 98 },
    ],
  };

  const getActionColor = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'update':
        return 'bg-blue-100 text-blue-700';
      case 'cancel':
        return 'bg-red-100 text-red-700';
      case 'soft delete':
        return 'bg-yellow-100 text-yellow-700';
      case 'create':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}m ago`;
    }
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Recent Actions */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Actions</h3>
        <div className="space-y-2">
          {data.recentActions.map((log) => (
            <div key={log.id}>
              <div
                className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() =>
                  setExpandedLog(expandedLog === log.id ? null : log.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-sm font-semibold text-slate-700">
                        {log.entity}
                      </span>
                      <span className="text-xs text-gray-500">#{log.entityId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">
                          By <span className="font-semibold text-slate-700">{log.user}</span>
                        </p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      expandedLog === log.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>

              {expandedLog === log.id && (
                <div className="bg-white border-l-4 border-slate-200 p-4 mt-1 rounded-r-lg">
                  <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">
                    Changes
                  </p>
                  <div className="space-y-2">
                    {log.changes.map((change, idx) => (
                      <div key={idx} className="text-xs">
                        <p className="font-semibold text-slate-700">{change.field}</p>
                        <p className="text-gray-500">
                          <span className="line-through">{change.oldValue}</span>
                          {' → '}
                          <span className="text-green-600 font-semibold">
                            {change.newValue}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Changed Entities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Most Changed Entities
          </h3>
          <div className="space-y-3">
            {data.mostChangedEntities.map((item) => {
              const maxChanges = Math.max(
                ...data.mostChangedEntities.map((e) => e.changeCount)
              );
              const percentage = (item.changeCount / maxChanges) * 100;

              return (
                <div key={item.entityType}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {item.entityType}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.changeCount}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-600 h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Activity Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            User Activity Summary
          </h3>
          <div className="space-y-3">
            {data.userActivitySummary.map((item) => (
              <div key={item.user} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-semibold text-slate-700">
                  {item.user}
                </span>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">
                    {item.actionCount}
                  </p>
                  <p className="text-xs text-gray-500">actions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditControl;
