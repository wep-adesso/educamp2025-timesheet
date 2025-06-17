import { useState, useEffect, useRef } from 'react';
import './App.css';
import PieChart from './PieChart';
import AnalogClock from './AnalogClock';
import Fireworks from './Fireworks';
import BeerCheers from './BeerCheers';

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
  const [suggestions, setSuggestions] = useState(() => {
    const saved = localStorage.getItem('time-tracker-suggestions');
    return saved ? JSON.parse(saved) : [];
  });
  const [billable, setBillable] = useState(false);
  const [fireworks, setFireworks] = useState(false);
  const [beer, setBeer] = useState(false);
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
      { id: Date.now(), desc: trimmed, elapsed: 0, running: false, billable },
    ]);
    setDesc('');
    setBillable(false);
    setError('');
    // Store suggestion if new
    setSuggestions(prev => {
      if (!prev.includes(trimmed)) {
        const updated = [...prev, trimmed];
        localStorage.setItem('time-tracker-suggestions', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
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
        setFireworks(true);
        return prev.map((item) =>
          item.id === id ? { ...item, running: false } : item
        );
      }
    });
  };

  const stopAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, running: false })));
    setBeer(true);
    setShowSummary(true);
  };

  const resetDay = () => {
    setItems([]);
    setShowSummary(false);
  };

  const handleTimeChange = (id, value) => {
    // value in format HH:MM:SS
    const [h, m, s] = value.split(':').map(Number);
    const ms = ((h || 0) * 3600 + (m || 0) * 60 + (s || 0)) * 1000;
    setItems(prev => prev.map(item => item.id === id ? { ...item, elapsed: ms } : item));
  };

  const handleBillableChange = (id, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, billable: value } : item));
  };

  return (
    <div className="container">
      <BeerCheers show={beer} onDone={() => setBeer(false)} />
      <Fireworks show={fireworks} onDone={() => setFireworks(false)} />
      <h1>Time Tracker</h1>
      {!showSummary ? (
        <>
          <AnalogClock size={90} />
          <div className="add-item">
            <input
              list="item-suggestions"
              value={desc}
              onChange={(e) => { setDesc(e.target.value); setError(''); }}
              placeholder="Item description"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <datalist id="item-suggestions">
              {suggestions.map((s, i) => <option value={s} key={i} />)}
            </datalist>
            <label style={{display:'flex',alignItems:'center',gap:4}}>
              <input type="checkbox" checked={billable} onChange={e => setBillable(e.target.checked)} />
              Billable
            </label>
            <button onClick={addItem}>Add</button>
            {error && <div className="error" style={{color:'red',marginTop:4}}>{error}</div>}
          </div>
          <ul className="item-list">
            {items.map((item) => (
              <li key={item.id} className="item">
                <span className="desc">{item.desc}</span>
                <input
                  type="text"
                  value={formatTime(item.elapsed)}
                  onChange={e => handleTimeChange(item.id, e.target.value)}
                  style={{ width: 90, fontFamily: 'monospace', margin: '0 1rem', textAlign: 'center' }}
                  pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                  title="HH:MM:SS"
                />
                <span title={item.billable ? 'Billable' : 'Non-billable'} style={{marginRight:8}}>
                  <input
                    type="checkbox"
                    checked={item.billable}
                    onChange={e => handleBillableChange(item.id, e.target.checked)}
                    style={{marginRight:4}}
                  />
                  {item.billable ? '💰' : '🕒'}
                </span>
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
                <span className="desc">{item.desc}</span>: <span className="time">{formatTime(item.elapsed)}</span> {item.billable ? '💰' : '🕒'}
              </li>
            ))}
          </ul>
          <div style={{ fontWeight: 'bold', margin: '1.5rem 0 0.5rem 0' }}>
            Total time: {formatTime(items.reduce((sum, item) => sum + item.elapsed, 0))}<br/>
            <span style={{color:'#4caf50'}}>Billable: {formatTime(items.filter(item => item.billable).reduce((sum, item) => sum + item.elapsed, 0))}</span><br/>
            <span style={{color:'#f44336'}}>Non-billable: {formatTime(items.filter(item => !item.billable).reduce((sum, item) => sum + item.elapsed, 0))}</span>
          </div>
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
