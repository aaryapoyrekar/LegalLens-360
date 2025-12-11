import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RiskMeterProps {
  score: number;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  // Data for the semi-circle
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s < 30) return '#10b981'; // Green
    if (s < 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  return (
    <div className="relative h-48 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="score" fill={color} />
            <Cell key="remaining" fill="#e2e8f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute bottom-0 flex flex-col items-center">
        <span className="text-4xl font-bold text-slate-800">{score}/100</span>
        <span className="text-sm font-medium uppercase tracking-wider text-slate-500 mb-2">
          Risk Score
        </span>
      </div>
    </div>
  );
};

export default RiskMeter;
