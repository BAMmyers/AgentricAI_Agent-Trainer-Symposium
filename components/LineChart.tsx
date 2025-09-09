
import React from 'react';

interface LineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, color = '#e94560', width = 300, height = 150 }) => {
  if (data.length < 2) {
    return (
        <div style={{ width, height }} className="flex items-center justify-center text-xs text-text-secondary">
            Waiting for data...
        </div>
    );
  }

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const maxVal = Math.max(...data, 1); // Ensure max is at least 1 to prevent division by zero and handle flat lines
  const minVal = Math.min(...data, 0); // Ensure min is at most 0
  const valRange = maxVal - minVal;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((d - minVal) / valRange) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const lastPoint = points.split(' ').pop()?.split(',');
  const lastX = lastPoint ? parseFloat(lastPoint[0]) : 0;
  const lastY = lastPoint ? parseFloat(lastPoint[1]) : 0;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <g transform={`translate(${padding}, ${padding})`}>
        {/* Y-axis labels */}
        <text x={-5} y={0} dy="0.3em" textAnchor="end" className="text-xs fill-current text-text-secondary">{maxVal.toFixed(2)}</text>
        <text x={-5} y={chartHeight} dy="0.3em" textAnchor="end" className="text-xs fill-current text-text-secondary">{minVal.toFixed(2)}</text>
        
        {/* Chart line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          style={{ transition: 'points 0.5s ease-in-out' }}
        />
        
        {/* Pulsing dot on the last point */}
        <circle cx={lastX} cy={lastY} r="4" fill={color} className="animate-pulse" />
      </g>
    </svg>
  );
};

export default LineChart;
