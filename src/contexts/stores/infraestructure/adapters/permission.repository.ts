import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/src/shared/persistance";
import { PermissionRepository } from "../../domain/repos/permission.repository";
import { Permission } from "@/src/contexts/users/domain/entitys/permission.entity";

@Injectable()
export class PermissionRepositoryAdapter implements PermissionRepository {
    constructor(
        private readonly prisma: PrismaService
    ) {}

    async findAllPermissions(): Promise<Permission[]> {
        const permissions = await this.prisma.permissions.findMany({
            select: {
                id: true,
                action: true,
                resource: true,
                description: true,
            }
        });
        return permissions.map((pm) => Permission.fromPrimitives(pm));
    }
    
    async getAllPermissionsIds(permissions: string[]): Promise<{ id: string }[]> {
        const permissionsIds = await this.prisma.permissions.findMany({
            where: {
                OR: permissions.map((p) => {
                    const [resource, action] = p.split(':');
                    return { resource, action };
                }),
            },
            select: {
                id: true,
            }
        });
        return permissionsIds;
    }
}