import prisma from '../prismaClient.js';

/**
 * Build a UTC Date for a given date string ("YYYY-MM-DD") and time string ("HH:MM").
 * The input date/time is treated as local wall-clock time.
 */
const buildDateTime = (dateStr, timeStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const defaultAvailabilityForDay = (dayOfWeek) => ({
  dayOfWeek,
  startTime: '09:00',
  endTime: '17:00',
  isAvailable: dayOfWeek >= 1 && dayOfWeek <= 5,
});

/**
 * Generate all candidate time slots for a given date based on availability.
 * Returns array of { startTime: string ("HH:MM"), endTime: string ("HH:MM") }
 */
const generateCandidateSlots = (availStartTime, availEndTime, duration) => {
  const slots = [];
  const [startH, startM] = availStartTime.split(':').map(Number);
  const [endH, endM] = availEndTime.split(':').map(Number);

  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  for (let current = startTotal; current + duration <= endTotal; current += duration) {
    const slotStartH = Math.floor(current / 60);
    const slotStartM = current % 60;
    const slotEndTotal = current + duration;
    const slotEndH = Math.floor(slotEndTotal / 60);
    const slotEndM = slotEndTotal % 60;

    slots.push({
      startTime: `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`,
      endTime: `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`,
    });
  }
  return slots;
};

export const getPublicEventType = async (slug) => {
  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      customQuestions: true,
      user: {
        select: {
          id: true,
          name: true,
          availabilities: true,
        },
      },
    },
  });

  if (!eventType || !eventType.isActive) {
    const err = new Error('Event type not found');
    err.status = 404;
    throw err;
  }

  return eventType;
};

export const getPublicEventTypes = async () => {
  return prisma.eventType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      title: true,
      slug: true,
      duration: true,
      description: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAvailableSlots = async (slug, dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0);
  const nextDayStart = new Date(year, month - 1, day + 1, 0, 0, 0, 0);

  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      user: {
        include: {
          availabilities: true,
          availabilityDateOverrides: true,
          bufferTime: true,
        },
      },
      bookings: {
        where: {
          status: { not: 'CANCELLED' },
          startTime: {
            gte: dayStart,
            lt: nextDayStart,
          },
        },
      },
    },
  });

  if (!eventType || !eventType.isActive) {
    const err = new Error('Event type not found');
    err.status = 404;
    throw err;
  }

  // JS getDay(): 0=Sun,1=Mon,...,6=Sat — we use the same convention in the DB
  const requestedDate = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = requestedDate.getUTCDay();

  const dateOverride = eventType.user.availabilityDateOverrides.find(
    (override) => override.date.toISOString().slice(0, 10) === dateStr
  );

  if (dateOverride && !dateOverride.isAvailable) return [];

  const weeklyFromDb = eventType.user.availabilities.find((a) => a.dayOfWeek === dayOfWeek);
  const weeklyAvailability = weeklyFromDb
    ? (weeklyFromDb.isAvailable ? weeklyFromDb : null)
    : (eventType.user.availabilities.length === 0
      ? defaultAvailabilityForDay(dayOfWeek)
      : null);

  const availability = dateOverride
    ? {
        startTime: dateOverride.startTime,
        endTime: dateOverride.endTime,
        isAvailable: dateOverride.isAvailable,
      }
    : weeklyAvailability;

  if (!availability) return [];

  const bufferBefore = eventType.user.bufferTime?.beforeMinutes ?? 0;
  const bufferAfter = eventType.user.bufferTime?.afterMinutes ?? 0;

  const candidateSlots = generateCandidateSlots(
    availability.startTime,
    availability.endTime,
    eventType.duration
  );

  const availableSlots = candidateSlots
    .filter(({ startTime, endTime }) => {
      const slotStart = buildDateTime(dateStr, startTime);
      const slotEnd = buildDateTime(dateStr, endTime);

      // Reject slots in the past
      if (slotStart <= new Date()) return false;

      return !eventType.bookings.some((booking) => {
        const effectiveStart = new Date(booking.startTime.getTime() - bufferBefore * 60000);
        const effectiveEnd = new Date(booking.endTime.getTime() + bufferAfter * 60000);
        return slotStart < effectiveEnd && slotEnd > effectiveStart;
      });
    })
    .map(({ startTime, endTime }) => ({
      startTime: buildDateTime(dateStr, startTime).toISOString(),
      endTime: buildDateTime(dateStr, endTime).toISOString(),
    }));

  return availableSlots;
};

export const createBooking = async ({ slug, inviteeName, inviteeEmail, startTime, notes, answers }) => {
  const eventType = await prisma.eventType.findUnique({
    where: { slug },
    include: {
      user: { include: { bufferTime: true, availabilities: true } },
      bookings: { where: { status: { not: 'CANCELLED' } } },
    },
  });

  if (!eventType || !eventType.isActive) {
    const err = new Error('Event type not found');
    err.status = 404;
    throw err;
  }

  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) {
    const err = new Error('Invalid startTime');
    err.status = 400;
    throw err;
  }

  const dateStr = formatLocalDate(start);
  const availableSlots = await getAvailableSlots(slug, dateStr);
  const requestedStartMs = start.getTime();
  const slotExists = availableSlots.some((slot) => new Date(slot.startTime).getTime() === requestedStartMs);

  if (!slotExists) {
    const err = new Error('The selected time slot is not available for this event');
    err.status = 409;
    throw err;
  }

  const end = new Date(start.getTime() + eventType.duration * 60000);

  const bufferBefore = eventType.user.bufferTime?.beforeMinutes ?? 0;
  const bufferAfter = eventType.user.bufferTime?.afterMinutes ?? 0;

  const conflict = eventType.bookings.some((booking) => {
    const effectiveStart = new Date(booking.startTime.getTime() - bufferBefore * 60000);
    const effectiveEnd = new Date(booking.endTime.getTime() + bufferAfter * 60000);
    return start < effectiveEnd && end > effectiveStart;
  });

  if (conflict) {
    const err = new Error('The selected time slot is no longer available');
    err.status = 409;
    throw err;
  }

  return prisma.booking.create({
    data: {
      eventTypeId: eventType.id,
      inviteeName,
      inviteeEmail,
      startTime: start,
      endTime: end,
      notes,
      answers,
    },
    include: { eventType: { select: { title: true, duration: true } } },
  });
};

export const getUserBookings = async (userId) => {
  return prisma.booking.findMany({
    where: { eventType: { userId } },
    include: { eventType: { select: { title: true, duration: true, slug: true } } },
    orderBy: { startTime: 'desc' },
  });
};

export const getUpcomingBookings = async (userId) => {
  return prisma.booking.findMany({
    where: {
      eventType: { userId },
      startTime: { gte: new Date() },
      status: { not: 'CANCELLED' },
    },
    include: { eventType: { select: { title: true, duration: true, slug: true } } },
    orderBy: { startTime: 'asc' },
  });
};

export const getPastBookings = async (userId) => {
  return prisma.booking.findMany({
    where: {
      eventType: { userId },
      endTime: { lt: new Date() },
    },
    include: { eventType: { select: { title: true, duration: true, slug: true } } },
    orderBy: { startTime: 'desc' },
  });
};

export const cancelBooking = async (id, userId) => {
  const booking = await prisma.booking.findFirst({
    where: { id, eventType: { userId } },
  });
  if (!booking) {
    const err = new Error('Booking not found');
    err.status = 404;
    throw err;
  }
  return prisma.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
};

export const rescheduleBooking = async (id, userId, newStartTime) => {
  const booking = await prisma.booking.findFirst({
    where: { id, eventType: { userId } },
    include: { eventType: { include: { user: { include: { bufferTime: true } } } } },
  });
  if (!booking) {
    const err = new Error('Booking not found');
    err.status = 404;
    throw err;
  }

  const start = new Date(newStartTime);
  const end = new Date(start.getTime() + booking.eventType.duration * 60000);

  const bufferBefore = booking.eventType.user.bufferTime?.beforeMinutes ?? 0;
  const bufferAfter = booking.eventType.user.bufferTime?.afterMinutes ?? 0;

  // Check conflicts excluding this booking
  const conflicts = await prisma.booking.findMany({
    where: {
      eventTypeId: booking.eventTypeId,
      status: { not: 'CANCELLED' },
      id: { not: id },
    },
  });

  const conflict = conflicts.some((b) => {
    const effectiveStart = new Date(b.startTime.getTime() - bufferBefore * 60000);
    const effectiveEnd = new Date(b.endTime.getTime() + bufferAfter * 60000);
    return start < effectiveEnd && end > effectiveStart;
  });

  if (conflict) {
    const err = new Error('The selected time slot is no longer available');
    err.status = 409;
    throw err;
  }

  return prisma.booking.update({
    where: { id },
    data: { startTime: start, endTime: end, status: 'RESCHEDULED' },
    include: { eventType: { select: { title: true, duration: true } } },
  });
};
