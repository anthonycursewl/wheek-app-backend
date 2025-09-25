import { Injectable } from "@nestjs/common";
import { MemberRepository } from "../../domain/repos/member.repository";
import { PrismaService } from '@/src/contexts/shared/persistance/prisma.service'
import { Member, MemberWithDetails } from "../../domain/entities/Member";

@Injectable()
export class MemberRepositoryAdapter implements MemberRepository {
    constructor(
        private readonly client: PrismaService
    ) {}

    async getAll(
        store_id: string, 
        skip: number, 
        take: number, 
        criteria?: {
            search?: string;
            role_id?: string;
            is_active?: boolean;
            include_permissions?: boolean;
        }
    ): Promise<Member[]> {
        const where: any = {
            store_id,
            deleted_at: null,
        };

        if (criteria) {
            if (criteria.search) {
                where.OR = [
                    {
                        user: {
                            OR: [
                                { name: { contains: criteria.search, mode: 'insensitive' } },
                                { last_name: { contains: criteria.search, mode: 'insensitive' } },
                                { username: { contains: criteria.search, mode: 'insensitive' } },
                                { email: { contains: criteria.search, mode: 'insensitive' } },
                            ],
                        },
                    },
                    {
                        role: {
                            name: { contains: criteria.search, mode: 'insensitive' },
                        },
                    },
                ];
            }

            if (criteria.role_id) {
                where.role_id = criteria.role_id;
            }

            if (criteria.is_active !== undefined) {
                where.is_active = criteria.is_active;
            }
        }

        const include: any = {
            user: {
                select: {
                    name: true,
                    last_name: true,
                    username: true,
                    email: true,
                    icon_url: true,
                    is_active: true,
                },
            },
            role: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    is_active: true,
                },
            },
            store: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    is_active: true,
                },
            },
        };

        if (criteria?.include_permissions) {
            include.role = {
                include: {
                    permissions: {
                        include: {
                            permission: {
                                select: {
                                    id: true,
                                    resource: true,
                                    action: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            };
        }

        const members = await this.client.user_roles.findMany({
            where,
            include,
            skip,
            take,
            orderBy: [
                { created_at: 'desc' },
                { user: { name: 'asc' } },
            ],
        });

        return members.map((member) => this.mapToDomain(member, criteria?.include_permissions));
    }

    private mapToDomain(prismaMember: any, includePermissions: boolean = false): Member {
        const member: Member = {
            id: prismaMember.id,
            user_id: prismaMember.user_id,
            store_id: prismaMember.store_id,
            role_id: prismaMember.role_id,
            is_active: prismaMember.is_active,
            created_at: prismaMember.created_at,
            user: {
                name: prismaMember.user.name,
                last_name: prismaMember.user.last_name,
                username: prismaMember.user.username,
                email: prismaMember.user.email,
                icon_url: prismaMember.user.icon_url,
            },
            role: {
                id: prismaMember.role.id,
                name: prismaMember.role.name,
            },
        };

        if (includePermissions && prismaMember.role?.permissions) {
            const memberWithDetails = member as MemberWithDetails;
            memberWithDetails.permissions = prismaMember.role.permissions.map(
                (rolePermission: any) => rolePermission.permission
            );
        }

        return member;
    }

    async inviteMember(data: {
        email: string;
        store_id: string;
        role_id: string;
        invited_by_id: string;
        token: string;
        expires_at: Date;
    }): Promise<any> {
        try {
            const invitation = await this.client.invitations.create({
                data: {
                    email: data.email,
                    store_id: data.store_id,
                    role_id: data.role_id,
                    invited_by_id: data.invited_by_id,
                    token: data.token,
                    expires_at: data.expires_at,
                    status: 'PENDING'
                },
                include: {
                    role: {
                        select: {
                            name: true,
                            description: true
                        }
                    },
                    store: {
                        select: {
                            name: true
                        }
                    },
                    invited_by: {
                        select: {
                            name: true,
                            last_name: true,
                            email: true
                        }
                    }
                }
            });

            return invitation;
        } catch (error) {
            throw new Error(`Failed to create invitation: ${error.message}`);
        }
    }

    async findByEmailAndStore(email: string, store_id: string): Promise<any | null> {
        try {
            const invitation = await this.client.invitations.findFirst({
                where: {
                    email,
                    store_id,
                    status: 'PENDING'
                },
                include: {
                    role: {
                        select: {
                            id: true,
                            name: true,
                            description: true
                        }
                    },
                    store: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    invited_by: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                            email: true
                        }
                    }
                }
            });

            return invitation;
        } catch (error) {
            throw new Error(`Failed to find invitation: ${error.message}`);
        }
    }

    async findByToken(token: string): Promise<any | null> {
        try {
            const invitation = await this.client.invitations.findUnique({
                where: {
                    token
                },
                include: {
                    role: {
                        select: {
                            name: true,
                            description: true
                        }
                    },
                    store: {
                        select: {
                            name: true
                        }
                    },
                    invited_by: {
                        select: {
                            name: true,
                            last_name: true,
                            email: true
                        }
                    }
                }
            });

            return invitation;
        } catch (error) {
            throw new Error(`Failed to find invitation by token: ${error.message}`);
        }
    }

    async updateInvitationStatus(id: string, status: string): Promise<any> {
        try {
            const invitation = await this.client.invitations.update({
                where: {
                    id
                },
                data: {
                    status: status as any
                },
                include: {
                    role: {
                        select: {
                            name: true,
                            description: true
                        }
                    },
                    store: {
                        select: {
                            name: true
                        }
                    },
                    invited_by: {
                        select: {
                            name: true,
                            last_name: true,
                            email: true
                        }
                    }
                }
            });

            return invitation;
        } catch (error) {
            throw new Error(`Failed to update invitation status: ${error.message}`);
        }
    }
}