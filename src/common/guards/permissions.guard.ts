import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@shared/persistance/prisma.service';

export const PERMISSIONS_KEY = 'permissions';

type Permission = {
  resource: string;
  action: string;
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(PrismaService)
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { params, query, body, user } = request;
    const storeId = params?.store_id || query?.store_id || body?.store_id;

    if (!storeId) {
      throw new ForbiddenException('Store ID is required for permission check');
    }

    if (!user?.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      const permissions = await this.prisma.$queryRaw<Permission[]>`
        SELECT p.resource, p.action
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN role_permission rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ${user.sub}
        AND ur.store_id = ${storeId}::uuid
        AND ur.is_active = true
        AND r.is_active = true
      `;

      const hasPermission = permissions.some(permission =>
        requiredPermissions.includes(`${permission.resource}:${permission.action}`)
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Permisos insuficientes. Requeridos: ${requiredPermissions.join(', ')}`,
        );
      }

      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      throw new ForbiddenException(error.message);
    }
  }
}
