'use client';

import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart';
import type { DashboardFilters } from '../types/dashboard.types';

interface OrderSourceItem {
  name: string;
  value: number;
  orders: number;
}

interface Props {
  filters: DashboardFilters;
  data?: OrderSourceItem[];
}

const chartConfig = {
  orders: {
    label: 'Orders',
  },
  pos: {
    label: 'POS Terminal',
    color: 'var(--cf-primary)',
  },
  online: {
    label: 'Online/App',
    color: 'var(--cf-accent-light)',
  },
} satisfies ChartConfig;

export const OrderSourceComparison: React.FC<Props> = ({ filters: _filters, data = [] }) => {
  const colors = ['var(--cf-primary)', 'var(--cf-accent-light)'];

  const chartData = data.map((item) => ({
    name: item.name,
    value: item.value,
    orders: item.orders,
  }));

  const CustomTooltip = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl">
          <p>{payload[0].payload.name}: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };


  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-4">
        <CardTitle>Order Source Comparison</CardTitle>
        <CardDescription>Distribution by channel</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0 flex items-center gap-8">
        {/* Pie Chart */}
        <div className="w-56 h-56 flex-shrink-0">
          <ChartContainer config={chartConfig} className="w-full h-full mx-0 mb-0">
            <PieChart>
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={0}
              >
                {chartData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                    style={{
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        {/* Legend & Stats */}
        <div className="flex-1 space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: colors[idx] }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                  <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {item.name === 'POS Terminal' ? 'In-store transactions' : 'Web and Mobile orders'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm mt-4">
        <div className="w-full flex items-center gap-2 leading-none font-medium pt-2 border-t border-slate-100">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <span className="text-amber-700">Online grew 12% this month</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderSourceComparison;
