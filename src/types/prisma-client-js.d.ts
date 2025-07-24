import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Extend the Prisma client to include our custom types
declare module '@prisma/client' {
  const prisma: PrismaClient;
  export default prisma;
}

// This is needed to make the file a module
export {};
