import { Injectable, Inject } from '@nestjs/common';
import { PartnerLinkedUserRepository } from '../../domain/repos/partner-linked-user.repository';
import { PartnerLinkedUser } from '../../domain/entities/partner-linked-user.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';

@Injectable()
export class PartnerLinkedUserRepositoryAdapter implements PartnerLinkedUserRepository {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    private mapPrismaToDomain(data: any): PartnerLinkedUser {
        return PartnerLinkedUser.fromPrimitives({
            id: data.id,
            partner_id: data.partner_id,
            external_user_id: data.external_user_id,
            wheek_user_id: data.wheek_user_id,
            external_email: data.external_email ?? undefined,
            external_name: data.external_name ?? undefined,
            created_at: data.created_at,
            updated_at: data.updated_at ?? undefined,
            last_token_at: data.last_token_at ?? undefined,
        });
    }

    async create(linkedUser: PartnerLinkedUser, tx?: Transaction): Promise<PartnerLinkedUser> {
        const dbClient = tx || this.prisma;
        const primitives = linkedUser.toPrimitives();

        const created = await dbClient.partner_linked_users.create({
            data: {
                id: primitives.id,
                partner_id: primitives.partner_id,
                external_user_id: primitives.external_user_id,
                wheek_user_id: primitives.wheek_user_id,
                external_email: primitives.external_email,
                external_name: primitives.external_name,
                created_at: primitives.created_at,
            },
        });

        return this.mapPrismaToDomain(created);
    }

    async findById(id: string, tx?: Transaction): Promise<PartnerLinkedUser | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.partner_linked_users.findUnique({
            where: { id },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByPartnerAndExternalUser(
        partnerId: string,
        externalUserId: string,
        tx?: Transaction,
    ): Promise<PartnerLinkedUser | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.partner_linked_users.findUnique({
            where: {
                partner_external_user_unique: {
                    partner_id: partnerId,
                    external_user_id: externalUserId,
                },
            },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByWheekUser(wheekUserId: string, tx?: Transaction): Promise<PartnerLinkedUser[]> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.partner_linked_users.findMany({
            where: { wheek_user_id: wheekUserId },
        });

        return found.map(this.mapPrismaToDomain);
    }

    async findByPartner(partnerId: string, tx?: Transaction): Promise<PartnerLinkedUser[]> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.partner_linked_users.findMany({
            where: { partner_id: partnerId },
        });

        return found.map(this.mapPrismaToDomain);
    }

    async update(linkedUser: PartnerLinkedUser, tx?: Transaction): Promise<PartnerLinkedUser> {
        const dbClient = tx || this.prisma;
        const primitives = linkedUser.toPrimitives();

        const updated = await dbClient.partner_linked_users.update({
            where: { id: primitives.id },
            data: {
                external_email: primitives.external_email,
                external_name: primitives.external_name,
                updated_at: new Date(),
                last_token_at: primitives.last_token_at,
            },
        });

        return this.mapPrismaToDomain(updated);
    }

    async delete(id: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.partner_linked_users.delete({
            where: { id },
        });
    }
}
