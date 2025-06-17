import React, { useEffect } from 'react';

export default function BeerCheers({ show, onDone }) {
  // Simple SVG cheers animation
  const [cheer, setCheer] = React.useState(false);
  useEffect(() => {
    if (show) {
      setCheer(true);
      const t = setTimeout(() => {
        setCheer(false);
        onDone && onDone();
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  if (!show && !cheer) return null;
  return (
    <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',zIndex:1001,pointerEvents:'none',display:'flex',justifyContent:'center',alignItems:'center'}}>
      <svg width="180" height="120" viewBox="0 0 180 120">
        <g>
          <g style={{transform: cheer ? 'rotate(-18deg)' : 'rotate(0deg)', transformOrigin: '60px 90px', transition: 'transform 0.4s cubic-bezier(.7,1.7,.7,1.01)'}}>
            <rect x="40" y="60" width="40" height="60" rx="12" fill="#ffe066" stroke="#bfa100" strokeWidth="4" />
            <rect x="40" y="60" width="40" height="20" rx="10" fill="#fffbe6" stroke="none" />
            <ellipse cx="60" cy="60" rx="20" ry="8" fill="#fffbe6" />
            <rect x="40" y="110" width="40" height="10" rx="5" fill="#bfa100" />
          </g>
          <g style={{transform: cheer ? 'rotate(18deg)' : 'rotate(0deg)', transformOrigin: '120px 90px', transition: 'transform 0.4s cubic-bezier(.7,1.7,.7,1.01)'}}>
            <rect x="100" y="60" width="40" height="60" rx="12" fill="#ffe066" stroke="#bfa100" strokeWidth="4" />
            <rect x="100" y="60" width="40" height="20" rx="10" fill="#fffbe6" stroke="none" />
            <ellipse cx="120" cy="60" rx="20" ry="8" fill="#fffbe6" />
            <rect x="100" y="110" width="40" height="10" rx="5" fill="#bfa100" />
          </g>
        </g>
        {/* Cheers lines */}
        {cheer && <g>
          <line x1="60" y1="40" x2="60" y2="20" stroke="#ffe066" strokeWidth="4" strokeLinecap="round" />
          <line x1="120" y1="40" x2="120" y2="20" stroke="#ffe066" strokeWidth="4" strokeLinecap="round" />
          <line x1="90" y1="50" x2="90" y2="10" stroke="#ffe066" strokeWidth="3" strokeLinecap="round" />
        </g>}
      </svg>
    </div>
  );
}
