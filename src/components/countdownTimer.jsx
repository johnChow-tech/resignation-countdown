import { useState, useEffect } from 'react';
import { calculateWorkingTimeLeft } from '../utils/timeCalculator';
import './CountdownTimer.scss';

const CountdownTimer = ({ targetDate, workStart = '09:30', workEnd = '18:30', ptoDays = 0 }) => {
  const [timeData, setTimeData] = useState(() => calculateWorkingTimeLeft(targetDate, workStart, workEnd, ptoDays));

  useEffect(() => {
    const timer = setInterval(() => {
      const newData = calculateWorkingTimeLeft(targetDate, workStart, workEnd, ptoDays);
      setTimeData(newData);

      if (newData.days === 0 && newData.hours === 0 && newData.minutes === 0 && newData.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, workStart, workEnd, ptoDays]);

  const isFinished = timeData.days === 0 && timeData.hours === 0 && timeData.minutes === 0 && timeData.seconds === 0;

  return (
    <div className={`countdown-container ${!timeData.isWorkingHours && !isFinished ? 'is-frozen' : ''}`} data-testid="timer-wrapper">
      {!isFinished && (
        <h2 className="timer-title" data-testid="timer-title">
          {timeData.isWorkingHours ? (
            <span className="status-active">距离解放还有...</span>
          ) : (
            <span className="status-frozen">下班时间</span>
          )}
        </h2>
      )}



      <div className="timer-display" data-testid="timer-display">
        {!isFinished ? (
          ['days', 'hours', 'minutes', 'seconds'].map((unit) => (
            <div key={unit} className="time-block" data-testid={`unit-${unit}`}>
              <span className="value" data-testid={`value-${unit}`}>
                {timeData[unit].toString().padStart(2, '0')}
              </span>
              <span className="label">{unit.toUpperCase()}</span>
            </div>
          ))
        ) : (
          <div className="finished-msg" data-testid="freedom-msg">
            🎉恭喜你🎉<br />
            感谢你常年的付出！
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;