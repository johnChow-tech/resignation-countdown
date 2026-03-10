import { useState } from 'react';
import CountdownTimer from './components/countdownTimer';
import './App.scss';
import './index.css';

function App() {
  const [resignationDate, setResignationDate] = useState('2026-03-31');
  const [workStart, setWorkStart] = useState('09:30');
  const [workEnd, setWorkEnd] = useState('18:30');
  // New State for Paid Time Off (PTO)
  const [ptoDays, setPtoDays] = useState(4);

  const targetDateTime = `${resignationDate}T${workEnd}:00`;

  return (
    <main className="app-main" data-testid="app-main">
      <header className="app-header">
        <h1>我还要忍多久...</h1>
        <h2>计算辞职后剩余上班时间的跑路计时器</h2>
      </header>

      <section className="settings-panel" data-testid="settings-panel">
        <div className="input-group">
          <label htmlFor="resignation-date">离职日</label>
          <input
            id="resignation-date"
            type="date"
            value={resignationDate}
            onChange={(e) => setResignationDate(e.target.value)}
            data-testid="input-resignation-date"
          />
        </div>

        <div className="input-group">
          <label htmlFor="work-start">上班时间</label>
          <input
            id="work-start"
            type="time"
            value={workStart}
            onChange={(e) => setWorkStart(e.target.value)}
            data-testid="input-work-start"
          />
        </div>

        <div className="input-group">
          <label htmlFor="work-end">下班时间</label>
          <input
            id="work-end"
            type="time"
            value={workEnd}
            onChange={(e) => setWorkEnd(e.target.value)}
            data-testid="input-work-end"
          />
        </div>

        <div className="input-group">
          <label htmlFor="pto-days">带薪假（天数）</label>
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