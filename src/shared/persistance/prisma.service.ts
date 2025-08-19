import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { softDeleteMiddleware } from './soft-delete.middleware';

type PrismaModel = {
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any>;
  findUnique: (args: any) => Promise<any>;
  findUniqueOrThrow: (args: any) => Promise<any>;
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
    this.$use(softDeleteMiddleware());
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    // For Prisma 5.0.0+, we don't need to handle shutdown hooks
    // as the library engine handles cleanup automatically
  }

  // Helper method for including soft-deleted records when needed
  getClient() {
    return this.$extends({
      query: {
        $allModels: {
          async findUnique({ model, args, query }: { model: string; args: any; query: any }) {
            const where = args.where || {};
            return query({
              ...args,
              where: {
                ...where,
                deleted_at: null,
                is_active: true,
              },
            });
          },
          async findUniqueOrThrow({ model, args, query }: { model: string; args: any; query: any }) {
            const where = args.where || {};
            return query({
              ...args,
              where: {
                ...where,
                deleted_at: null,
                is_active: true,
              },
            });
          },
          async findFirst({ model, args, query }: { model: string; args: any; query: any }) {
            const where = args?.where || {};
            return query({
              ...args,
              where: {
                ...where,
                deleted_at: null,
                is_active: true,
              },
            });
          },
          async findMany({ model, args, query }: { model: string; args: any; query: any }) {
            const where = args?.where || {};
            return query({
              ...args,
              where: {
                ...where,
                deleted_at: null,
                is_active: true,
              },
            });
          },
        },
      },
    });
  }

  // Helper to include soft-deleted records when explicitly needed
  withSoftDelete<T extends PrismaModel>(model: T) {
    return {
      ...model,
      findManyWithDeleted: (args: any = {}) => model.findMany({
        ...args,
        where: {
          ...args.where,
        },
      }),
      findWithDeleted: (args: any = {}) => model.findFirst({
        ...args,
        where: {
          ...args.where,
        },
      }),
    };
  }
}

// Export a singleton instance of the Prisma Client
export const prisma = new PrismaService();
