import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

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

  withSoftDelete<T extends { findMany: any; findFirst: any; }>(model: T) {
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
