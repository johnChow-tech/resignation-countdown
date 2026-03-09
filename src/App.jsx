import { useState } from 'react';
import CountdownTimer from './components/CountdownTimer';
import './App.scss';
import './index.css';

function App() {
  const [resignationDate, setResignationDate] = useState('2026-12-31');
  const [workStart, setWorkStart] = useState('09:30');
  const [workEnd, setWorkEnd] = useState('18:30');
  // New State for Paid Time Off (PTO)
  const [ptoDays, setPtoDays] = useState(0);

  const targetDateTime = `${resignationDate}T${workEnd}:00`;

  return (
    <main className="app-main" data-testid="app-main">
      <header className="app-header">
        <h1>Operation: Next Chapter</h1>
      </header>
      
      <section className="settings-panel" data-testid="settings-panel">
        <div className="input-group">
          <label htmlFor="resignation-date">Resignation Date</label>
          <input 
            id="resignation-date"
            type="date" 
            value={resignationDate} 
            onChange={(e) => setResignationDate(e.target.value)}
            data-testid="input-resignation-date"
          />
        </div>

        <div className="input-group">
          <label htmlFor="pto-days">Paid Leave (Days)</label>
          <input 
            id="pto-days"
            type="number" 
            min="0"
            step="0.5"
            value={ptoDays} 
            onChange={(e) => setPtoDays(e.target.value)}
            data-testid="input-pto-days"
            placeholder="e.g. 10"
          />
        </div>

        <div className="input-group">
          <label htmlFor="work-start">Work Start</label>
          <input 
            id="work-start"
            type="time" 
            value={workStart} 
            onChange={(e) => setWorkStart(e.target.value)}
            data-testid="input-work-start"
          />
        </div>

        <div className="input-group">
          <label htmlFor="work-end">Work End</label>
          <input 
            id="work-end"
            type="time" 
            value={workEnd} 
            onChange={(e) => setWorkEnd(e.target.value)}
            data-testid="input-work-end"
          />
        </div>
      </section>

      <section className="timer-section">
        <CountdownTimer 
          targetDate={targetDateTime} 
          workStart={workStart}
          workEnd={workEnd}
          ptoDays={ptoDays}
        />
      </section>
    </main>
  );
}

export default App;