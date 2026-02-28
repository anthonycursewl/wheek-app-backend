import { Injectable, Inject } from '@nestjs/common';
import { PartnerLinkSessionRepository } from '../../domain/repos/partner-link-session.repository';
import { PartnerLinkSession } from '../../domain/entities/partner-link-session.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';

@Injectable()
export class PartnerLinkSessionRepositoryAdapter implements PartnerLinkSessionRepository {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    private mapPrismaToDomain(data: any): PartnerLinkSession {
        return PartnerLinkSession.fromPrimitives({
            id: data.id,
            partner_id: data.partner_id,
            client_id: data.client_id,
            redirect_uri: data.redirect_uri,
            external_user_id: data.external_user_id,
            external_email: data.external_email ?? undefined,
            external_name: data.external_name ?? undefined,
            state: data.state,
            expires_at: data.expires_at,
            created_at: data.created_at,
        });
    }

    async create(session: PartnerLinkSession, tx?: Transaction): Promise<PartnerLinkSession> {
        const dbClient = tx || this.prisma;
        const primitives = session.toPrimitives();

        const created = await dbClient.partner_link_sessions.create({
            data: {
                id: primitives.id,
                partner_id: primitives.partner_id,
                client_id: primitives.client_id,
                redirect_uri: primitives.redirect_uri,
                external_user_id: primitives.external_user_id,
                external_email: primitives.external_email,
                external_name: primitives.external_name,
                state: primitives.state,
                expires_at: primitives.expires_at,
                created_at: primitives.created_at,
            },
        });

        return this.mapPrismaToDomain(created);
    }

    async findById(id: string, tx?: Transaction): Promise<PartnerLinkSession | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.partner_link_sessions.findUnique({
            where: { id },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async delete(id: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.partner_link_sessions.delete({
            where: { id },
        });
    }

    async deleteExpired(tx?: Transaction): Promise<number> {
        const dbClient = tx || this.prisma;

        const result = await dbClient.partner_link_sessions.deleteMany({
            where: {
                expires_at: {
                    lt: new Date(),
                },
            },
        });

        return result.count;
    }
}
