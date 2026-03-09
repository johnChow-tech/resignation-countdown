/**
 * @description Calculates the exact working time remaining until the target date minus PTO.
 * @param {string} targetDateStr - ISO date string
 * @param {string} workStart - Start time in HH:mm format (default: '09:30')
 * @param {string} workEnd - End time in HH:mm format (default: '18:30')
 * @param {number|string} ptoDays - Paid Time Off in days (default: 0)
 * @returns {Object} { days, hours, minutes, seconds, isWorkingHours }
 */
export const calculateWorkingTimeLeft = (targetDateStr, workStart = '09:30', workEnd = '18:30', ptoDays = 0) => {
    const now = new Date();
    const target = new Date(targetDateStr);

    const [startH, startM] = workStart.split(':').map(Number);
    const [endH, endM] = workEnd.split(':').map(Number);

    // Definition of a full working day in milliseconds
    const msPerWorkDay = (endH * 60 + endM - (startH * 60 + startM)) * 60 * 1000;

    if (now >= target) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isWorkingHours: false };
    }

    let totalWorkingMs = 0;
    let current = new Date(now.getTime());
    let isCurrentlyWorking = false;

    const currentDay = current.getDay();
    const isWeekend = currentDay === 0 || currentDay === 6;
    if (!isWeekend) {
        const todayStart = new Date(current).setHours(startH, startM, 0, 0);
        const todayEnd = new Date(current).setHours(endH, endM, 0, 0);
        if (current.getTime() >= todayStart && current.getTime() < todayEnd) {
            isCurrentlyWorking = true;
        }
    }

    while (current.getTime() < target.getTime()) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            const dayStart = new Date(current);
            dayStart.setHours(startH, startM, 0, 0);

            const dayEnd = new Date(current);
            dayEnd.setHours(endH, endM, 0, 0);

            let calcStart = current.getTime();
            let calcEnd = Math.min(dayEnd.getTime(), target.getTime());

            if (calcStart < dayStart.getTime()) {
                calcStart = dayStart.getTime();
            }

            if (calcStart < calcEnd) {
                totalWorkingMs += (calcEnd - calcStart);
            }
        }
        current = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1);
    }

    // --- NEW LOGIC: Deduct Paid Time Off (PTO) ---
    // Convert PTO days into working milliseconds
    const ptoMs = Number(ptoDays || 0) * msPerWorkDay;

    // Ensure we don't go into negative time if PTO > remaining work days
    totalWorkingMs = Math.max(0, totalWorkingMs - ptoMs);

    // Convert total milliseconds back into Work-Days and remaining H/M/S
    const days = Math.floor(totalWorkingMs / msPerWorkDay);
    const remainderMs = totalWorkingMs % msPerWorkDay;

    const hours = Math.floor(remainderMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainderMs / (1000 * 60)) % 60);
    const seconds = Math.floor((remainderMs / 1000) % 60);

    return { days, hours, minutes, seconds, isWorkingHours: isCurrentlyWorking };
};