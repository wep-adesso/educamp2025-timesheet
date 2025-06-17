import { useState, useEffect, useRef } from 'react';
import './App.css';

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
    if (desc.trim()) {
      setItems([
        ...items,
        { id: Date.now(), desc, elapsed: 0, running: false },
      ]);
      setDesc('');
    }
  };

  const toggleTimer = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, running: !item.running } : item
      )
    );
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
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Item description"
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <button onClick={addItem}>Add</button>
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
          <button onClick={resetDay}>Start New Day</button>
        </div>
      )}
    </div>
  );
}

export default App;
