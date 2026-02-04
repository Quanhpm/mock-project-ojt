import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardFilters } from '../types/dashboard.types';

interface Props {
  filters: DashboardFilters;
  data: Array<{ date: string; revenue: number; formatted: string }>;
}

export const RevenueChart: React.FC<Props> = ({ filters: _filters, data }) => {
  const formatYAxis = (value: number) => `$${(value / 1000).toFixed(0)}k`;

  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl">
          <p>{payload[0].payload.formatted}: ${(payload[0].value / 1000).toFixed(1)}k</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
          <p className="text-sm text-gray-500">Daily revenue trends across all locations</p>
        </div>
        <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
          {(['7 Days', '30 Days', 'Year'] as const).map((range) => (
            <button
              key={range}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === '30 Days'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-gray-500 hover:bg-white hover:text-amber-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="formatted"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#94a3b8', fontWeight: 'bold' }}
            />
            <YAxis
              stroke="#94a3b8"
              tickFormatter={formatYAxis}
              style={{ fontSize: '12px' }}
              tick={{ fill: '#94a3b8', fontWeight: 'bold' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7F5539', strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#7F5539"
              strokeWidth={3}
              dot={{ fill: '#7F5539', r: 4, strokeWidth: 2, stroke: 'white' }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;
