import prisma from '../prismaClient.js';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toUtcDate = (value) => {
  if (value instanceof Date) return value;
  if (typeof value !== 'string') return null;

  const normalized = DATE_ONLY_REGEX.test(value) ? `${value}T00:00:00.000Z` : value;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export const getAvailability = async (userId) => {
  return prisma.availability.findMany({
    where: { userId },
    orderBy: { dayOfWeek: 'asc' },
  });
};

export const getDateOverrides = async (userId) => {
  const overrides = await prisma.availabilityDateOverride.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  });

  return overrides.map((override) => ({
    ...override,
    date: override.date.toISOString().slice(0, 10),
  }));
};

export const upsertAvailability = async (userId, slots) => {
  // slots: Array<{ dayOfWeek, startTime, endTime, isAvailable }>
  const results = await Promise.all(
    slots.map(async ({ dayOfWeek, startTime, endTime, isAvailable }) => {
      const existing = await prisma.availability.findFirst({
        where: { userId, dayOfWeek },
      });

      if (existing) {
        return prisma.availability.update({
          where: { id: existing.id },
          data: { startTime, endTime, isAvailable: isAvailable ?? true },
        });
      }

      return prisma.availability.create({
        data: { userId, dayOfWeek, startTime, endTime, isAvailable: isAvailable ?? true },
      });
    })
  );
  return results;
};

export const updateAvailabilityById = async (id, userId, data) => {
  const existing = await prisma.availability.findFirst({ where: { id, userId } });
  if (!existing) {
    const err = new Error('Availability not found');
    err.status = 404;
    throw err;
  }
  return prisma.availability.update({ where: { id }, data });
};

export const upsertDateOverrides = async (userId, overrides) => {
  const normalized = overrides.filter((entry) => entry.date);

  const result = await Promise.all(
    normalized.map(async ({ date, startTime, endTime, isAvailable }) => {
      const parsedDate = toUtcDate(date);

      if (!parsedDate) {
        const err = new Error('Invalid date. Expected YYYY-MM-DD.');
        err.status = 400;
        throw err;
      }

      const existing = await prisma.availabilityDateOverride.findFirst({
        where: { userId, date: parsedDate },
      });

      if (existing) {
        return prisma.availabilityDateOverride.update({
          where: { id: existing.id },
          data: {
            startTime,
            endTime,
            isAvailable: isAvailable ?? true,
          },
        });
      }

      return prisma.availabilityDateOverride.create({
        data: {
          userId,
          date: parsedDate,
          startTime,
          endTime,
          isAvailable: isAvailable ?? true,
        },
      });
    })
  );

  return result;
};

export const deleteDateOverrideById = async (id, userId) => {
  const existing = await prisma.availabilityDateOverride.findFirst({ where: { id, userId } });

  if (!existing) {
    const err = new Error('Date-specific availability not found');
    err.status = 404;
    throw err;
  }

  return prisma.availabilityDateOverride.delete({ where: { id } });
};
