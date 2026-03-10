import { useState, useEffect } from 'react';
import { calculateWorkingTimeLeft } from '../utils/timeCalculator';
import './countdownTimer.scss';

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

  // FIX 1: 移除 isFinished 中对 days 的判断
  const isFinished = timeData.hours === 0 && timeData.minutes === 0 && timeData.seconds === 0;

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
          // FIX 2: 从渲染数组中彻底删除 'days'
          ['hours', 'minutes', 'seconds'].map((unit) => (
            <div key={unit} className="time-block" data-testid={`unit-${unit}`}>
              <span className="value" data-testid={`value-${unit}`}>
                {/* 如果小时数破百甚至破千，我们不需要补零限制它的长度，直接展示震撼的数字 */}
                {unit === 'hours' ? timeData[unit] : timeData[unit].toString().padStart(2, '0')}
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