import prisma from '../prismaClient.js';

export const getBufferTime = async (userId) => {
  const buffer = await prisma.bufferTime.findUnique({ where: { userId } });
  return buffer ?? { beforeMinutes: 0, afterMinutes: 0 };
};

export const upsertBufferTime = async (userId, { beforeMinutes, afterMinutes }) => {
  return prisma.bufferTime.upsert({
    where: { userId },
    update: { beforeMinutes, afterMinutes },
    create: { userId, beforeMinutes, afterMinutes },
  });
};
