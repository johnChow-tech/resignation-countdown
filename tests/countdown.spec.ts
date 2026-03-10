import { test, expect } from '@playwright/test';

// 在所有测试开始前，我们将时间冻结在一个标准的周一工作日早上 10:00
// 这样可以保证我们所有的断言都是绝对稳定、可复现的
const MOCKED_NOW = new Date('2026-03-16T10:00:00'); // 2026年3月16日是周一

test.describe('苏联重工跑路计时器 - 核心业务逻辑 E2E 测试', () => {

    test.beforeEach(async ({ page }) => {
        // 注入时间魔法：接管浏览器的 Date 对象
        await page.clock.setFixedTime(MOCKED_NOW);
        // 访问我们在 playwright.config.ts 中配置的 baseURL
        await page.goto('/');
    });

    test('TC-01: 粗野主义 UI 核心元素渲染校验 (Sanity Check)', async ({ page }) => {
        // 验证大标题存在
        await expect(page.getByText('我还要忍多久...')).toBeVisible();

        // 验证 4 个输入框全部就绪
        await expect(page.getByTestId('input-resignation-date')).toBeVisible();
        await expect(page.getByTestId('input-pto-days')).toBeVisible();
        await expect(page.getByTestId('input-work-start')).toBeVisible();
        await expect(page.getByTestId('input-work-end')).toBeVisible();

        // 验证 3 个降维后的倒数面板 (HOURS, MINUTES, SECONDS) 渲染成功
        await expect(page.getByTestId('unit-hours')).toBeVisible();
        await expect(page.getByTestId('unit-minutes')).toBeVisible();
        await expect(page.getByTestId('unit-seconds')).toBeVisible();
    });

    test('TC-02: 验证带薪假期 (PTO) 对总工时的精确扣除', async ({ page }) => {
        // --- 黄金法则：永远在测试开始前显式重置所有相关状态 ---
        await page.getByTestId('input-work-start').fill('09:00');
        await page.getByTestId('input-work-end').fill('18:00');
        await page.getByTestId('input-resignation-date').fill('2026-03-20');

        // FIX: 强制将 PTO 清零，彻底屏蔽本地 App.jsx 默认值的干扰！
        await page.getByTestId('input-pto-days').fill('0');

        // 3. 获取扣除 PTO 前的初始剩余小时数
        // 周一 10:00 到 18:00 = 8 小时
        // 周二到周五 = 4天 * 9小时 = 36 小时
        // 理论总和 = 44 小时
        await expect(page.getByTestId('value-hours')).toHaveText('44');

        // 4. 输入 1.5 天的带薪假 (PTO)
        // 1.5 天 * 9小时 = 13.5 小时。 44 - 13.5 = 30.5 小时（向下取整为 30 小时）
        await page.getByTestId('input-pto-days').fill('1.5');

        // 5. 断言小时数是否被精准扣除为 30
        await expect(page.getByTestId('value-hours')).toHaveText('30');
    });

    test('TC-03: 验证下班时间的时间冻结状态 (Off-hours Freeze)', async ({ page }) => {
        // 验证在工作时间（上午10点），状态处于 Active
        const timerWrapper = page.getByTestId('timer-wrapper');
        const timerTitle = page.getByTestId('timer-title');

        await expect(timerWrapper).not.toHaveClass(/is-frozen/);
        await expect(timerTitle).toContainText('距离解放还有');

        // 注入新的时间魔法：快进到晚上 20:00 (下班后)
        await page.clock.setFixedTime(new Date('2026-03-16T20:00:00'));
        // 刷新页面让状态重新计算
        await page.goto('/');

        // 核心断言：验证粗野主义的 UI 状态变化
        await expect(timerWrapper).toHaveClass(/is-frozen/);
        await expect(timerTitle).toContainText('下班时间');

        // 验证数字是否停止跳动：等待 1.5 秒后，秒数不应发生变化
        const initialSeconds = await page.getByTestId('value-seconds').innerText();
        await page.waitForTimeout(1500);
        const afterSeconds = await page.getByTestId('value-seconds').innerText();

        expect(initialSeconds).toEqual(afterSeconds); // 断言秒数被彻底冻结
    });
});