import { Injectable } from "@nestjs/common";
import { NotificationRepository } from "../../domain/repos/notification.repository";
import { PrismaService } from "@/src/contexts/shared/persistance/prisma.service";
import { Notification } from "../../domain/repos/notification.repository";

@Injectable()
export class NotificationRepositoryAdapter implements NotificationRepository {
    constructor(
        private readonly client: PrismaService
    ) {}

    async findById(notification_id: string): Promise<Notification | null> {
        const notification = await this.client.invitations.findFirst({
            where: {
                id: notification_id
            },
            select: {
                id: true,
                email: true,
                invited_by: {
                    select: {
                        id: true,
                        name: true,
                        last_name: true,
                    }
                },
                store: {
                    select: {
                        name: true,
                        id: true
                    }
                },
                role: {
                    select: {
                        name: true,
                        id: true
                    }
                },
                token: true,
                status: true, 
                created_at: true,
                expires_at: true
            }
        });

        return notification || null;
    }

    async getAll(email: string, skip: number, take: number): Promise<Notification[]> {
        const notis = await this.client.invitations.findMany({
            where: {
                email: email, 
                status: 'PENDING'
            },
            skip,
            take,
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true,
                email: true,
                invited_by: {
                    select: {
                        id: true,
                        name: true,
                        last_name: true,
                    }
                },
                store: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                token: true,
                status: true, 
                created_at: true,
                expires_at: true
            }
        })

        return notis
    }

    async denyNotification(notification_id: string): Promise<Notification> {
        const notification = await this.client.invitations.update({
            where: {
                id: notification_id
            },
            data: {
                status: 'DECLINED'
            },
            select: {
                id: true,
                email: true,
                invited_by: {
                    select: {
                        id: true,
                        name: true,
                        last_name: true,
                    }
                },
                store: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                role: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                token: true,
                status: true, 
                created_at: true,
                expires_at: true
            }

        })

        return notification
    }

    async acceptNotification(notification_id: string, user_id: string): Promise<Notification> {
        return this.client.$transaction(async (tx) => {
            const notification = await tx.invitations.update({
                where: {
                    id: notification_id
                },
                data: {
                    status: 'ACCEPTED',
                },
                select: {
                    id: true,
                    email: true,
                    invited_by: {
                        select: {
                            id: true,
                            name: true,
                            last_name: true,
                        }
                    },
                    store: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    role: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    token: true,
                    status: true, 
                    created_at: true,
                    expires_at: true
                }
            });

            await tx.user_roles.create({
                data: {
                    user_id: user_id,
                    role_id: notification.role.id,
                    store_id: notification.store.id
                }
            });

            return {
                id: notification.id,
                email: notification.email,
                invited_by: {
                    id: notification.invited_by.id,
                    name: notification.invited_by.name,
                    last_name: notification.invited_by.last_name
                },
                store: {
                    id: notification.store.id,
                    name: notification.store.name
                },
                role: {
                    id: notification.role.id,
                    name: notification.role.name
                },
                token: notification.token,
                status: notification.status,
                created_at: notification.created_at,
                expires_at: notification.expires_at
            };
        });
    }
}