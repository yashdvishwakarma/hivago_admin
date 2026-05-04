import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line
} from 'recharts';

const data = [
  { name: 'Mon', gmv: 52000 },
  { name: 'Tue', gmv: 58000 },
  { name: 'Wed', gmv: 61000 },
  { name: 'Thu', gmv: 68000 },
  { name: 'Fri', gmv: 73000 },
  { name: 'Sat', gmv: 87000 },
  { name: 'Sun', gmv: 79000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 shadow-lg rounded-lg p-3">
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-[#8b1515]">
          ₹{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function GMVChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">GMV Over Time</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#888', fontSize: 12 }}
              tickFormatter={(value) => `₹${value / 1000}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="gmv" 
              stroke="#8b1515" 
              strokeWidth={3}
              dot={{ fill: '#8b1515', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
