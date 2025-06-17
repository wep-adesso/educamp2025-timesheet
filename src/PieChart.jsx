// PieChart.jsx
import React from 'react';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28CFF', '#FF6F91', '#6FFFB0', '#FFB86F', '#6F8CFF', '#FF6F6F'
];

function getPieSegments(data) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let angle = 0;
  return data.map((d, i) => {
    const valueAngle = total === 0 ? 0 : (d.value / total) * 2 * Math.PI;
    const x1 = 50 + 50 * Math.cos(angle);
    const y1 = 50 + 50 * Math.sin(angle);
    angle += valueAngle;
    const x2 = 50 + 50 * Math.cos(angle);
    const y2 = 50 + 50 * Math.sin(angle);
    const largeArc = valueAngle > Math.PI ? 1 : 0;
    const pathData = `M50,50 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`;
    return {
      pathData,
      color: COLORS[i % COLORS.length],
      label: d.label,
      value: d.value,
    };
  });
}

export default function PieChart({ data }) {
  // Only show if at least two items have value > 0
  if (!data.length || data.filter(d => d.value > 0).length < 2) return null;
  const segments = getPieSegments(data);
  return (
    <svg width={200} height={200} viewBox="0 0 100 100">
      {segments.map((seg, i) => (
        <path key={i} d={seg.pathData} fill={seg.color} stroke="#fff" strokeWidth={0.5} />
      ))}
      {segments.map((seg, i) => {
        // Place label at the middle angle of the segment
        const total = data.reduce((sum, d) => sum + d.value, 0);
        let startAngle = 0;
        for (let j = 0; j < i; j++) {
          startAngle += (data[j].value / total) * 2 * Math.PI;
        }
        const midAngle = startAngle + (data[i].value / total) * Math.PI;
        const x = 50 + 35 * Math.cos(midAngle);
        const y = 50 + 35 * Math.sin(midAngle);
        return (
          <text
            key={i}
            x={x}
            y={y}
            fontSize={4}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="#222"
          >
            {data[i].label}
          </text>
        );
      })}
    </svg>
  );
}
