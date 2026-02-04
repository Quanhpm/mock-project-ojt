import React from 'react';
import type { StaffMetrics, DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
}

export const StaffShifts: React.FC<Props> = ({ filters: _filters }) => {
  // Mock data
  const data: StaffMetrics = {
    totalActive: 1018,
    absenceRate: 4.2,
    completedShifts: 4521,
    breakdown: {
      managers: 142,
      staff: 876,
    },
  };

  const totalStaff = data.breakdown.managers + data.breakdown.staff;
  const managerPercentage = ((data.breakdown.managers / totalStaff) * 100).toFixed(1);
  const staffPercentage = ((data.breakdown.staff / totalStaff) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Active Staff Summary */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Active Staff</h3>
        <div className="text-center py-4">
          <p className="text-4xl font-black text-green-600">{data.totalActive}</p>
          <p className="text-sm text-gray-500 mt-1">Currently active</p>
        </div>
      </div>

      {/* Absence Rate */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-bold text-slate-900">Absence Rate</h3>
          <span className="text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
            {data.absenceRate}%
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-red-500 h-full rounded-full"
            style={{ width: `${Math.min(data.absenceRate * 5, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {Math.round((data.absenceRate / 100) * totalStaff)} staff members absent
        </p>
      </div>

      {/* Completed Shifts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Shift Performance</h3>
        <div className="text-center py-4">
          <p className="text-4xl font-black text-blue-600">{data.completedShifts.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Shifts completed this month</p>
        </div>
      </div>

      {/* Staff Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Staff Breakdown</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Managers</span>
              <span className="text-sm font-bold text-slate-900">
                {data.breakdown.managers} ({managerPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full"
                style={{ width: `${managerPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">Staff Members</span>
              <span className="text-sm font-bold text-slate-900">
                {data.breakdown.staff} ({staffPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${staffPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffShifts;
