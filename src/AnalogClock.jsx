import React, { useEffect, useState } from 'react';

function getClockHands(date) {
  const hours = date.getHours() % 12;
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return {
    hour: (hours + minutes / 60) * 30, // 360/12
    minute: (minutes + seconds / 60) * 6, // 360/60
    second: seconds * 6, // 360/60
  };
}

export default function AnalogClock({ size = 80 }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const hands = getClockHands(now);
  const center = size / 2;
  const r = center - 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{marginBottom: 16}}>
      <circle cx={center} cy={center} r={r} fill="#fff" stroke="#bbb" strokeWidth={2} />
      {/* hour hand */}
      <line x1={center} y1={center} x2={center + r * 0.5 * Math.sin(Math.PI * hands.hour / 180)} y2={center - r * 0.5 * Math.cos(Math.PI * hands.hour / 180)} stroke="#222" strokeWidth={4} strokeLinecap="round" />
      {/* minute hand */}
      <line x1={center} y1={center} x2={center + r * 0.7 * Math.sin(Math.PI * hands.minute / 180)} y2={center - r * 0.7 * Math.cos(Math.PI * hands.minute / 180)} stroke="#222" strokeWidth={2.5} strokeLinecap="round" />
      {/* second hand */}
      <line x1={center} y1={center} x2={center + r * 0.85 * Math.sin(Math.PI * hands.second / 180)} y2={center - r * 0.85 * Math.cos(Math.PI * hands.second / 180)} stroke="#f44336" strokeWidth={1.5} strokeLinecap="round" />
      <circle cx={center} cy={center} r={2.5} fill="#222" />
    </svg>
  );
}
