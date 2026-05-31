'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function HotspotBarChart({ data }: any) {
  // Sort data to show top hotspots first
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 6);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis 
          dataKey="name" 
          type="category" 
          axisLine={false} 
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 10 }}
          width={80}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          contentStyle={{ 
            backgroundColor: '#0f172a', 
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '12px'
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
          {sortedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={index === 0 ? '#ef4444' : index < 3 ? '#f59e0b' : '#3b82f6'} 
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
