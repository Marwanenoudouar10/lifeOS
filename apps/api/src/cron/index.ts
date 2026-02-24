import cron from 'node-cron';
import { dailyRollover } from './daily-rollover.js';
import { reminderCheck } from './reminder-check.js';
import { recurringTasks } from './recurring-tasks.js';
import { streakCheck } from './streak-check.js';

export function startCronJobs() {
  // Daily rollover at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily rollover...');
    try { await dailyRollover(); } catch (e) { console.error('Daily rollover error:', e); }
  });

  // Reminder check every minute
  cron.schedule('* * * * *', async () => {
    try { await reminderCheck(); } catch (e) { console.error('Reminder check error:', e); }
  });

  // Recurring tasks at 1 AM
  cron.schedule('0 1 * * *', async () => {
    console.log('Creating recurring tasks...');
    try { await recurringTasks(); } catch (e) { console.error('Recurring tasks error:', e); }
  });

  // Streak check at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Checking streaks...');
    try { await streakCheck(); } catch (e) { console.error('Streak check error:', e); }
  });

  console.log('Cron jobs started');
}
