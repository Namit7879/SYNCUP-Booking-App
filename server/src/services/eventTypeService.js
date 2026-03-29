import prisma from '../prismaClient.js';

export const getEventTypes = async (userId) => {
  return prisma.eventType.findMany({
    where: { userId },
    include: { customQuestions: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getEventTypeById = async (id, userId) => {
  const eventType = await prisma.eventType.findFirst({
    where: { id, userId },
    include: { customQuestions: true },
  });
  if (!eventType) {
    const err = new Error('Event type not found');
    err.status = 404;
    throw err;
  }
  return eventType;
};

export const createEventType = async (userId, data) => {
  const { title, slug, duration, description, isActive, customQuestions } = data;

  const slugExists = await prisma.eventType.findUnique({ where: { slug } });
  if (slugExists) {
    const err = new Error('Slug already in use');
    err.status = 409;
    throw err;
  }

  return prisma.eventType.create({
    data: {
      title,
      slug,
      duration,
      description,
      isActive: isActive ?? true,
      userId,
      customQuestions: customQuestions?.length
        ? { create: customQuestions.map(({ question, isRequired }) => ({ question, isRequired: isRequired ?? false })) }
        : undefined,
    },
    include: { customQuestions: true },
  });
};

export const updateEventType = async (id, userId, data) => {
  const existing = await prisma.eventType.findFirst({ where: { id, userId } });
  if (!existing) {
    const err = new Error('Event type not found');
    err.status = 404;
    throw err;
  }

  const { customQuestions, ...fields } = data;

  // Replace custom questions if provided
  if (customQuestions !== undefined) {
    await prisma.customQuestion.deleteMany({ where: { eventTypeId: id } });
  }

  return prisma.eventType.update({
    where: { id },
    data: {
      ...fields,
      ...(customQuestions !== undefined && {
        customQuestions: {
          create: customQuestions.map(({ question, isRequired }) => ({
            question,
            isRequired: isRequired ?? false,
          })),
        },
      }),
    },
    include: { customQuestions: true },
  });
};

export const deleteEventType = async (id, userId) => {
  const existing = await prisma.eventType.findFirst({ where: { id, userId } });
  if (!existing) {
    const err = new Error('Event type not found');
    err.status = 404;
    throw err;
  }
  await prisma.eventType.delete({ where: { id } });
};
