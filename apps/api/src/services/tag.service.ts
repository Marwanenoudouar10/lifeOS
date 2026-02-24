import { prisma } from '../prisma.js';

interface CreateTagInput {
  name: string;
  color?: string;
}

interface UpdateTagInput {
  name?: string;
  color?: string;
}

async function getAll() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function getById(id: string) {
  return prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function create(data: CreateTagInput) {
  return prisma.tag.create({
    data,
    include: {
      _count: {
        select: { tasks: true },
      },
    },
  });
}

async function update(id: string, data: UpdateTagInput) {
  return prisma.tag.update({
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
  return prisma.tag.delete({ where: { id } });
}

export const tagService = {
  getAll,
  getById,
  create,
  update,
  remove,
};
