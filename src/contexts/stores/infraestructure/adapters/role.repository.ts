import { Injectable } from "@nestjs/common";
import { PrismaService } from "@shared/persistance/prisma.service";
import { Role, RolePrimitive } from "@/src/contexts/users/domain/entitys/role.entity";
import { RoleAllData, RoleRepository, RoleWithPermissions } from "../../domain/repos/role.repository";

@Injectable()
export class RoleRepositoryAdapter implements RoleRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(role: Role): Promise<Role> {
        const primitiveRole = role.toPrimitive();
        const exists = await this.prisma.roles.findFirst({
            where: {
                name: primitiveRole.name,
                store_id: primitiveRole.store_id,
            }
        })

        if (exists) {
            throw new Error('Un role con este nombre ya existe! Intenta de nuevo.');
        }

        const created = await this.prisma.roles.create({
            data: {
                id: primitiveRole.id,
                name: primitiveRole.name,
                description: primitiveRole.description,
                is_active: primitiveRole.is_active,
                created_at: primitiveRole.created_at,
                store_id: primitiveRole.store_id,
            },
        });

        return Role.fromPrimitive(created as RolePrimitive);
    }

    async findAllByStoreId(store_id: string, skip: number, take: number): Promise<RoleWithPermissions[]> {
        try {
            const roles = await this.prisma.roles.findMany({
                where: {
                    store_id,
                },
                skip,
                take,
                orderBy: {
                    created_at: 'desc',
                },
                select: {
                    id: true,
                    name: true,
                    is_active: true,
                    description: true,
                    created_at: true,
                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    resource: true,
                                    action: true,
                                }
                            }
                        }
                    }
                }
            });

            return roles as RoleWithPermissions[];
        } catch (error: any) {
            if (error.code === 'P2023' || error.message?.includes('invalid input syntax for type uuid')) {
                throw new Error('El ID de la tienda proporcionado no es un UUID válido.');
            }
            if (error.code?.startsWith('P2') || error instanceof Error) {
                throw new Error(`Error de base de datos: ${error.message}`);
            }
            throw new Error('Error inesperado al obtener los roles');
        }
    }

    async assignPermissions(role_id: string, permissions: { id: string }[]): Promise<RoleWithPermissions> {
        try {
            const role = await this.prisma.$transaction(async (prisma) => {
                await prisma.role_permission.createMany({
                    data: permissions.map((p) => ({
                        role_id,
                        permission_id: p.id,
                    }))
                })

                const role = await prisma.roles.findUnique({
                    where: {
                        id: role_id,
                    },
                    select: {
                        id: true,
                        name: true,
                        is_active: true,
                        description: true,
                        created_at: true,
                        permissions: {
                            select: {
                                permission: {
                                    select: {
                                        resource: true,
                                        action: true
                                    }
                                }
                            }
                        }
                    }
                });

                return role as RoleWithPermissions;    
            })

            return role;
        } catch (error: any) {
            if (error.code === 'P2023' || error.message?.includes('invalid input syntax for type uuid')) {
                throw new Error('El ID de la tienda proporcionado no es un UUID válido.');
            }
            if (error.code?.startsWith('P2') || error instanceof Error) {
                throw new Error(`Error de base de datos: ${error.message}`);
            }
            throw new Error('Error inesperado al obtener los roles');
        }
    }

    async findUnique(id: string): Promise<RoleAllData> {
        try {
            const role = await this.prisma.roles.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    name: true,
                    is_active: true,
                    description: true,
                    created_at: true,
                    updated_at: true,
                    deleted_at: true,
                    store_id: true,
                    permissions: {
                        select: {
                            permission: {
                                select: {
                                    resource: true,
                                    action: true
                                }
                            }
                        }
                    }
                }
            });
            if (!role) {
                throw new Error('Role not found');
            }
            return role as RoleAllData;
        } catch (error) {
            throw new Error('Error inesperado al obtener el role');
        }
    }

    async update(id: string, role: Role): Promise<RoleWithPermissions> {
        try {
            const rolePrimitive = role.toPrimitive()
           const updated = await this.prisma.roles.update({
            where: {
                id,
            },
            data: {
                name: rolePrimitive.name,
                description: rolePrimitive.description,
                is_active: rolePrimitive.is_active,
                updated_at: rolePrimitive.updated_at,
            },
            select: {
                id: true,
                name: true,
                description: true,
                is_active: true,
                created_at: true,
                permissions: {
                    select: {
                        permission: {
                            select: {
                                resource: true,
                                action: true
                            }
                        }
                    }
                }
            }
           })

           return updated as RoleWithPermissions;
        } catch (error) {
            throw new Error('Error inesperado al actualizar el role');
        }
    }
}