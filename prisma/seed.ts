import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('Clearing all existing data...');

  // Delete in correct order to respect foreign keys
  await prisma.timeBlock.deleteMany();
  await prisma.planItem.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.dailyReview.deleteMany();
  await prisma.weeklyReview.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.habitEntry.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.category.deleteMany();

  console.log('All data cleared. Seeding your projects and tasks...');

  // Categories
  const workCat = await prisma.category.create({
    data: { name: 'Work', color: '#0ea5e9' },
  });

  // ── Project: Tandeem ──
  const tandeem = await prisma.project.create({
    data: {
      name: 'Tandeem',
      description: 'Tandeem mobile app & web platform',
      color: '#6366f1',
      categoryId: workCat.id,
    },
  });

  // ── Project: Optifood ──
  const optifood = await prisma.project.create({
    data: {
      name: 'Optifood',
      description: 'Optifood restaurant chain management platform',
      color: '#f97316',
      categoryId: workCat.id,
    },
  });

  // ── Tandeem Tasks ──
  const tandeemTask1 = await prisma.task.create({
    data: {
      title: 'Make match in chronologic order in mobile app',
      description: 'Fix the matching feature to display results in chronological order on the mobile app',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: tandeem.id,
      sortOrder: 0,
    },
  });

  const tandeemTask2 = await prisma.task.create({
    data: {
      title: 'Non-active employees extraction',
      description: 'Build extraction/report for non-active employees',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: tandeem.id,
      sortOrder: 1,
    },
  });

  // Analytics parent task
  const analyticsParent = await prisma.task.create({
    data: {
      title: 'Fix analytics',
      description: 'Fix the full analytics pipeline: mobile app should store good analytics first, then fix the UI and logic in the web dashboard',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: tandeem.id,
      sortOrder: 2,
    },
  });

  // Analytics subtasks
  await prisma.task.create({
    data: {
      title: 'Make mobile app store good analytics first',
      description: 'Ensure the mobile app properly tracks and stores analytics events/data',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: tandeem.id,
      parentId: analyticsParent.id,
      sortOrder: 0,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Fix analytics UI and logic in the web',
      description: 'After mobile analytics are storing correctly, fix the web dashboard UI and logic to display them properly',
      priority: 'MEDIUM',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: tandeem.id,
      parentId: analyticsParent.id,
      sortOrder: 1,
    },
  });

  // ── Optifood Tasks ──
  await prisma.task.create({
    data: {
      title: 'Group of restaurants (chain)',
      description: 'Implement the concept of restaurant chains — a group of restaurants under one entity',
      priority: 'CRITICAL',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 0,
    },
  });

  await prisma.task.create({
    data: {
      title: 'From chain you can select restaurant',
      description: 'When viewing a chain, allow selecting/navigating to individual restaurants within it',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 1,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Call center: can select chain',
      description: 'Call center UI should be able to select and filter by chain',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 2,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Order list filter of each restaurant',
      description: 'Add filtering to the order list so it can be filtered per restaurant',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 3,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Contract for chain restaurants',
      description: 'Implement contract management for chain restaurants',
      priority: 'MEDIUM',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 4,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Two dashboards: restaurant dashboard & call center dashboard (separated UI)',
      description: 'Build two separate dashboard UIs — one for the restaurant view and one for the call center view',
      priority: 'HIGH',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 5,
    },
  });

  await prisma.task.create({
    data: {
      title: "Partner's own dashboard",
      description: 'Build a dedicated dashboard for partners to view their own data and analytics',
      priority: 'MEDIUM',
      status: 'TODO',
      context: 'COMPUTER',
      categoryId: workCat.id,
      projectId: optifood.id,
      sortOrder: 6,
    },
  });

  console.log('Seeded successfully!');
  console.log('Projects: Tandeem, Optifood');
  console.log('Tandeem: 3 tasks (+ 2 subtasks under Fix analytics)');
  console.log('Optifood: 7 tasks');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
