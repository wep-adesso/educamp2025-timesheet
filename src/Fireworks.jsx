import React, { useEffect } from 'react';

// Simple fireworks using canvas
export default function Fireworks({ show, onDone }) {
  const ref = React.useRef();

  useEffect(() => {
    if (!show) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let running = true;
    const W = canvas.width = 300;
    const H = canvas.height = 180;
    const particles = [];
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * 2 * Math.PI;
      const speed = 2 + Math.random() * 2;
      particles.push({
        x: W/2, y: H/2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: `hsl(${Math.random()*360},90%,60%)`
      });
    }
    function draw() {
      ctx.clearRect(0,0,W,H);
      for (const p of particles) {
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2*Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function update() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.alpha -= 0.018;
      }
    }
    let frame = 0;
    function loop() {
      if (!running) return;
      draw();
      update();
      frame++;
      if (frame < 60) {
        requestAnimationFrame(loop);
      } else {
        running = false;
        onDone && onDone();
      }
    }
    loop();
    return () => { running = false; };
  }, [show, onDone]);

  return show ? (
    <div style={{position:'fixed',left:0,top:0,width:'100vw',height:'100vh',zIndex:1000,pointerEvents:'none',display:'flex',justifyContent:'center',alignItems:'center'}}>
      <canvas ref={ref} style={{background:'transparent',width:300,height:180}} />
    </div>
  ) : null;
}
