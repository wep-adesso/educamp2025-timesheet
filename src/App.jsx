import { useState, useEffect, useRef } from 'react';
import './App.css';
import PieChart from './PieChart';

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('time-tracker-items');
    return saved ? JSON.parse(saved) : [];
  });
  const [desc, setDesc] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef();

  useEffect(() => {
    localStorage.setItem('time-tracker-items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!showSummary) {
      intervalRef.current = setInterval(() => {
        setItems((prev) =>
          prev.map((item) =>
            item.running
              ? { ...item, elapsed: item.elapsed + 1000 }
              : item
          )
        );
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [showSummary]);

  const addItem = () => {
    const trimmed = desc.trim();
    if (!trimmed) return;
    if (items.some((item) => item.desc === trimmed)) {
      setError('Item with this description already exists.');
      return;
    }
    setItems([
      ...items,
      { id: Date.now(), desc: trimmed, elapsed: 0, running: false },
    ]);
    setDesc('');
    setError('');
  };

  const toggleTimer = (id) => {
    setItems((prev) => {
      const isStarting = !prev.find((item) => item.id === id)?.running;
      if (isStarting) {
        // Stop all others, start only this one
        return prev.map((item) =>
          item.id === id
            ? { ...item, running: true }
            : { ...item, running: false }
        );
      } else {
        // Just stop this one
        return prev.map((item) =>
          item.id === id ? { ...item, running: false } : item
        );
      }
    });
  };

  const stopAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, running: false })));
    setShowSummary(true);
  };

  const resetDay = () => {
    setItems([]);
    setShowSummary(false);
  };

  return (
    <div className="container">
      <h1>Time Tracker</h1>
      {!showSummary ? (
        <>
          <div className="add-item">
            <input
              value={desc}
              onChange={(e) => { setDesc(e.target.value); setError(''); }}
              placeholder="Item description"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <button onClick={addItem}>Add</button>
            {error && <div className="error" style={{color:'red',marginTop:4}}>{error}</div>}
          </div>
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id} className="item">
                <span className="desc">{item.desc}</span>
                <span className="time">{formatTime(item.elapsed)}</span>
                <button onClick={() => toggleTimer(item.id)}>
                  {item.running ? 'Stop' : 'Start'}
                </button>
              </li>
            ))}
          </ul>
          {items.length > 0 && (
            <button className="end-day" onClick={stopAll}>
              End Workday & Show Summary
            </button>
          )}
          {/* Pie chart below main screen */}
          <div style={{marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h3>Time Distribution</h3>
            <PieChart data={items.map(item => ({ label: item.desc, value: item.elapsed }))} />
          </div>
        </>
      ) : (
        <div className="summary">
          <h2>Summary</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span className="desc">{item.desc}</span>: <span className="time">{formatTime(item.elapsed)}</span>
              </li>
            ))}
          </ul>
          <div style={{marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <h3>Time Distribution</h3>
            <PieChart data={items.map(item => ({ label: item.desc, value: item.elapsed }))} />
          </div>
          <button onClick={resetDay}>Start New Day</button>
        </div>
      )}
    </div>
  );
}

export default App;
