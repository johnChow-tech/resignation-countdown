/**
 * @description Calculates the exact working time remaining until the target date minus PTO.
 * @param {string} targetDateStr - ISO date string
 * @param {string} workStart - Start time in HH:mm format (default: '09:30')
 * @param {string} workEnd - End time in HH:mm format (default: '18:30')
 * @param {number|string} ptoDays - Paid Time Off in days (default: 0)
 * @returns {Object} { hours, minutes, seconds, isWorkingHours }
 */
export const calculateWorkingTimeLeft = (targetDateStr, workStart = '09:30', workEnd = '18:30', ptoDays = 0) => {
    const now = new Date();
    const target = new Date(targetDateStr);

    // 边界防御：如果目标日期无效或已经过去，直接归零
    if (isNaN(target.getTime()) || now >= target) {
        return { hours: 0, minutes: 0, seconds: 0, isWorkingHours: false };
    }

    const [startH, startM] = workStart.split(':').map(Number);
    const [endH, endM] = workEnd.split(':').map(Number);

    // 计算单个标准工作日的总毫秒数（例如 9.5小时 -> 34200000 ms）
    const msPerWorkDay = (endH * 60 + endM - (startH * 60 + startM)) * 60 * 1000;

    let totalWorkingMs = 0;
    let isCurrentlyWorking = false;

    // 创建一个游标 (Cursor)，从此刻开始向目标日期推进
    let current = new Date(now.getTime());

    // 判断此刻是否处于工作状态
    const currentDay = current.getDay();
    if (currentDay !== 0 && currentDay !== 6) {
        const todayStart = new Date(current).setHours(startH, startM, 0, 0);
        const todayEnd = new Date(current).setHours(endH, endM, 0, 0);
        if (current.getTime() >= todayStart && current.getTime() < todayEnd) {
            isCurrentlyWorking = true;
        }
    }

    // 核心推进循环：游标未超过目标日期时持续累加
    while (current.getTime() < target.getTime()) {
        const dayOfWeek = current.getDay();

        // 仅在工作日（周一至周五）累加时间
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            // 获取游标所在当天的上下班时间节点
            const dayStart = new Date(current);
            dayStart.setHours(startH, startM, 0, 0);

            const dayEnd = new Date(current);
            dayEnd.setHours(endH, endM, 0, 0);

            // 核心逻辑：计算游标当天【实际剩余】的工作时间段
            // calcStart 取 "当前时间" 和 "上班时间" 中较晚的一个
            let calcStart = Math.max(current.getTime(), dayStart.getTime());
            // calcEnd 取 "下班时间" 和 "最终目标时间" 中较早的一个
            let calcEnd = Math.min(dayEnd.getTime(), target.getTime());

            // 如果该时间段有效（即还未下班），则累加进入总工时池
            if (calcStart < calcEnd) {
                totalWorkingMs += (calcEnd - calcStart);
            }
        }

        // 游标推进：安全地跳转到明天的 00:00:00，继续下一轮循环
        current.setDate(current.getDate() + 1);
        current.setHours(0, 0, 0, 0);
    }

    // 扣除带薪假期 (PTO)
    const ptoMs = Number(ptoDays || 0) * msPerWorkDay;
    totalWorkingMs = Math.max(0, totalWorkingMs - ptoMs);

    // 将最终纯净的毫秒数，按 60分钟制 向下取整转化为 绝对剩余总小时数
    const hours = Math.floor(totalWorkingMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalWorkingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalWorkingMs % (1000 * 60)) / 1000);

    return {
        hours,
        minutes,
        seconds,
        isWorkingHours: isCurrentlyWorking
    };
};