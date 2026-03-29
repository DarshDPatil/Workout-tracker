import React from 'react';

interface RadarChartProps {
  data: { axis: string; value: number }[];
  size?: number;
}

/**
 * RadarChart Component
 * A minimalist, modern radar chart for muscle volume distribution.
 */
const RadarChart: React.FC<RadarChartProps> = ({ data, size = 300 }) => {
  const padding = 40;
  const center = size / 2;
  const radius = (size / 2) - padding;
  const angleStep = (Math.PI * 2) / data.length;

  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value), 1000); // Default min scale of 1000

  // Calculate points for the volume polygon
  const points = data.map((d, i) => {
    const r = (d.value / maxValue) * radius;
    const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
    const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
    return `${x},${y}`;
  }).join(' ');

  // Calculate grid lines (circles/polygons)
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPolygons = gridLevels.map(level => {
    return data.map((_, i) => {
      const r = level * radius;
      const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
      const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[32px] card-shadow border border-gray-100">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-300 mb-6">Volume Distribution</h4>
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid Background */}
        {gridPolygons.map((p, i) => (
          <polygon
            key={i}
            points={p}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="1"
          />
        ))}

        {/* Axis Lines */}
        {data.map((_, i) => {
          const x = center + radius * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + radius * Math.sin(i * angleStep - Math.PI / 2);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#F3F4F6"
              strokeWidth="1"
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const labelRadius = radius + 15;
          const x = center + labelRadius * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + labelRadius * Math.sin(i * angleStep - Math.PI / 2);
          
          // Adjust text anchor based on position
          let textAnchor: "middle" | "end" | "start" = "middle";
          if (x < center - 10) textAnchor = "end";
          if (x > center + 10) textAnchor = "start";

          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="text-[8px] font-black fill-gray-400 uppercase tracking-tighter"
            >
              {d.axis}
            </text>
          );
        })}

        {/* Volume Polygon */}
        <polygon
          points={points}
          fill="rgba(0, 0, 0, 0.05)"
          stroke="black"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const r = (d.value / maxValue) * radius;
          const x = center + r * Math.cos(i * angleStep - Math.PI / 2);
          const y = center + r * Math.sin(i * angleStep - Math.PI / 2);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="black"
              className="transition-all duration-500 ease-out"
            />
          );
        })}
      </svg>
      
      <div className="mt-6 flex gap-4 overflow-x-auto w-full px-2 no-scrollbar">
        {data.filter(d => d.value > 0).map(d => (
          <div key={d.axis} className="shrink-0 flex flex-col items-center">
            <span className="text-[8px] font-black text-gray-300 uppercase">{d.axis}</span>
            <span className="text-xs font-black">{Math.round(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RadarChart;
