import React, { useState, useEffect } from 'react';

const TimerApp1 = () => {
  const [timers, setTimers] = useState(() => {
    const savedTimers = localStorage.getItem('timers');
    return savedTimers ? JSON.parse(savedTimers) : [];
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [completedTimer, setCompletedTimer] = useState('');
  const [newTimer, setNewTimer] = useState({ name: '', duration: '', category: '', halfwayAlert: false });
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem('timerHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [expandedCategories, setExpandedCategories] = useState({});
  const [theme, setTheme] = useState('light');
  const [showHistory, setShowHistory] = useState(false);
  useEffect(() => {
    localStorage.setItem('timers', JSON.stringify(timers));
    localStorage.setItem('timerHistory', JSON.stringify(history));
  }, [timers, history]);

  const addTimer = () => {
    const timerObj = {
      ...newTimer,
      duration: parseInt(newTimer.duration),
      remainingTime: parseInt(newTimer.duration),
      status: 'Paused',
      halfwayAlertTriggered: false,
    };
    setTimers([...timers, timerObj]);
    setNewTimer({ name: '', duration: '', category: '', halfwayAlert: false });
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const startTimer = (timerName) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.name === timerName && timer.status !== 'Running') {
          timer.status = 'Running';
          timer.intervalId = setInterval(() => {
            setTimers((currentTimers) =>
              currentTimers.map((t) => {
                if (t.name === timerName && t.status === 'Running') {
                  if (t.remainingTime > 0) {
                    t.remainingTime -= 1;
                  } else {
                    clearInterval(t.intervalId);
                    handleTimerCompletion(t);
                    t.status = 'Completed';
                  }
                }
                return t;
              })
            );
          }, 1000);
        }
        return timer;
      })
    );
  };

  const pauseTimer = (timerName) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.name === timerName) {
          clearInterval(timer.intervalId);
          timer.status = 'Paused';
        }
        return timer;
      })
    );
  };

  const resetTimer = (timerName) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) => {
        if (timer.name === timerName) {
          clearInterval(timer.intervalId);
          timer.remainingTime = timer.duration;
          timer.status = 'Paused';
        }
        return timer;
      })
    );
  };

  const handleTimerCompletion = (timer) => {
    setCompletedTimer(timer.name);
    setHistory([...history, { name: timer.name, completedAt: new Date().toLocaleString() }]);
    setModalVisible(true);
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const categorizedTimers = timers.reduce((acc, timer) => {
    if (!acc[timer.category]) acc[timer.category] = [];
    acc[timer.category].push(timer);
    return acc;
  }, {});

  const exportHistory = () => {
    const json = JSON.stringify(history, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'timer_history.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewHistory = () => {
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
  };


  return (
    <div style={{ padding: '20px', backgroundColor: theme === 'light' ? '#fff' : '#333', color: theme === 'light' ? '#000' : '#fff' }}>
      <h1>Multi-Timer App</h1>
      <h2>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
      </button> </h2>
      <p>
      <input placeholder='Timer Name' value={newTimer.name} onChange={(e) => setNewTimer({ ...newTimer, name: e.target.value })} />
      </p>
      <p>
      <input placeholder='Duration (seconds)' type='number' value={newTimer.duration} onChange={(e) => setNewTimer({ ...newTimer, duration: e.target.value })} />
      </p>
      <p>
      <input placeholder='Category' value={newTimer.category} onChange={(e) => setNewTimer({ ...newTimer, category: e.target.value })} />
      </p>
      <button onClick={addTimer}>Add Timer</button>
      <p><button onClick={exportHistory}>Export Timer History</button></p>

      {Object.keys(categorizedTimers).map((category) => (
        <div key={category} style={{ margin: '15px 0' }}>
          <h3 onClick={() => toggleCategory(category)} style={{ cursor: 'pointer' }}>{category} {expandedCategories[category] ? '-' : '+'}</h3>
          {expandedCategories[category] && (
            <ul>
              {categorizedTimers[category].map((timer) => (
                <li key={timer.name} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px' }}>
                  {timer.name} - {timer.remainingTime}s - Status: {timer.status}
                  <div style={{ backgroundColor: '#e0e0e0', width: '100%', height: '10px', margin: '5px 0' }}>
                    <div style={{ backgroundColor: '#76c7c0', height: '100%', width: `${((timer.duration - timer.remainingTime) / timer.duration) * 100}%` }}></div>
                  </div>
                  <button onClick={() => startTimer(timer.name)}>Start</button>
                  <button onClick={() => pauseTimer(timer.name)}>Pause</button>
                  <button onClick={() => resetTimer(timer.name)}>Reset</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

<button onClick={viewHistory}>View Timer History</button>
      {showHistory && (
        <div>
          <h2>Timer History</h2>
          <ul>
            {history.map((entry, index) => (
              <li key={index}>{entry.name} - Completed at: {entry.completedAt}</li>
            ))}
          </ul>
          <button onClick={closeHistory}>Close History</button>
        </div>
      )}
    </div>
  );
};

export default TimerApp1;
