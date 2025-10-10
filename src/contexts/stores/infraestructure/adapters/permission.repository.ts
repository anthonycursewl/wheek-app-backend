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

    async assignPermissions(role_id: string, permissions: { id: string }[]): Promise<void> {
            try {
                await this.prisma.$transaction(async (prisma) => {
                    await prisma.role_permission.deleteMany({
                        where: {
                            role_id,
                        }
                    })

                    await prisma.role_permission.createMany({
                        data: permissions.map((p) => ({
                            role_id,
                            permission_id: p.id,
                        }))
                    })
                })
            } catch (error: any) {
                if (error.code === 'P2023' || error.message?.includes('invalid input syntax for type uuid')) {
                    throw new Error('El ID de la tienda proporcionado no es un UUID válido.');
                }
                if (error.code?.startsWith('P2') || error instanceof Error) {
                    throw new Error(`Error de base de datos: ${error.message}`);
                }
                throw new Error('Error inesperado al asignar los permisos');
            }
        }
}
