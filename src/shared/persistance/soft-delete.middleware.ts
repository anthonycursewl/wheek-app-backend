import { PrismaClient } from '@prisma/client';

/**
 * Middleware to handle soft deletes for all models
 * Automatically sets deleted_at timestamp instead of deleting records
 */
export function softDeleteMiddleware() {
  return async (params: any, next: any) => {
    if (params.model === 'user_roles' || params.model === 'role_permissions') {
      return next(params);
    }

    // Handle soft delete
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deleted_at: new Date() };
    }

    // Handle deleteMany
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data !== undefined) {
        params.args.data.deleted_at = new Date();
      } else {
        params.args.data = { deleted_at: new Date() };
      }
    }

    // Filter out deleted records by default
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where.deleted_at = null;
    }

    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deleted_at === undefined) {
          params.args.where.deleted_at = null;
        }
      } else {
        params.args.where = { deleted_at: null };
      }
    }

    return next(params);
  };
}
