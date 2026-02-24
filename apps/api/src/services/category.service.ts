import { prisma } from '../prisma.js';

interface CreateCategoryInput {
  name: string;
  color?: string;
  icon?: string;
}

interface UpdateCategoryInput {
  name?: string;
  color?: string;
  icon?: string;
}

async function getAll() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function getById(id: string) {
  return prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function create(data: CreateCategoryInput) {
  return prisma.category.create({
    data,
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function update(id: string, data: UpdateCategoryInput) {
  return prisma.category.update({
    where: { id },
    data,
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function remove(id: string) {
  return prisma.category.delete({ where: { id } });
}

export const categoryService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
