import { Injectable, Inject } from '@nestjs/common';
import { PartnerRepository } from '../../domain/repos/partner.repository';
import { Partner } from '../../domain/entities/partner.entity';
import { Transaction } from '@/src/contexts/shared/persistance/transactions';
import { PrismaService } from '@/src/shared/persistance/prisma.service';

@Injectable()
export class PartnerRepositoryAdapter implements PartnerRepository {
    constructor(
        @Inject(PrismaService)
        private readonly prisma: PrismaService,
    ) { }

    private mapPrismaToDomain(data: any): Partner {
        return Partner.fromPrimitives({
            id: data.id,
            name: data.name,
            api_key: data.api_key,
            allowed_ips: data.allowed_ips,
            permissions: data.permissions,
            rate_limit: data.rate_limit,
            is_active: data.is_active,
            created_at: data.created_at,
            updated_at: data.updated_at ?? undefined,
            deleted_at: data.deleted_at ?? undefined,
            // New linking fields
            can_link_users: data.can_link_users ?? false,
            logo_url: data.logo_url ?? undefined,
            description: data.description ?? undefined,
            allowed_redirect_uris: data.allowed_redirect_uris ?? [],
            default_scopes: data.default_scopes ?? [],
            client_id: data.client_id ?? undefined,
        });
    }

    async create(partner: Partner, tx?: Transaction): Promise<Partner> {
        const dbClient = tx || this.prisma;
        const primitives = partner.toPrimitives();

        const created = await dbClient.oauth_partners.create({
            data: {
                id: primitives.id,
                name: primitives.name,
                api_key: primitives.api_key,
                allowed_ips: primitives.allowed_ips,
                permissions: primitives.permissions,
                rate_limit: primitives.rate_limit,
                is_active: primitives.is_active,
                created_at: primitives.created_at,
                // New linking fields
                can_link_users: primitives.can_link_users,
                logo_url: primitives.logo_url,
                description: primitives.description,
                allowed_redirect_uris: primitives.allowed_redirect_uris,
                default_scopes: primitives.default_scopes,
                client_id: primitives.client_id,
            },
        });

        return this.mapPrismaToDomain(created);
    }

    async findById(id: string, tx?: Transaction): Promise<Partner | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_partners.findUnique({
            where: { id },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByApiKey(apiKey: string, tx?: Transaction): Promise<Partner | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_partners.findFirst({
            where: { api_key: apiKey },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async findByName(name: string, tx?: Transaction): Promise<Partner | null> {
        const dbClient = tx || this.prisma;

        const found = await dbClient.oauth_partners.findFirst({
            where: { name },
        });

        return found ? this.mapPrismaToDomain(found) : null;
    }

    async update(partner: Partner, tx?: Transaction): Promise<Partner> {
        const dbClient = tx || this.prisma;
        const primitives = partner.toPrimitives();

        const updated = await dbClient.oauth_partners.update({
            where: { id: primitives.id },
            data: {
                name: primitives.name,
                allowed_ips: primitives.allowed_ips,
                permissions: primitives.permissions,
                rate_limit: primitives.rate_limit,
                is_active: primitives.is_active,
                updated_at: new Date(),
                deleted_at: primitives.deleted_at,
            },
        });

        return this.mapPrismaToDomain(updated);
    }

    async delete(id: string, tx?: Transaction): Promise<void> {
        const dbClient = tx || this.prisma;

        await dbClient.oauth_partners.delete({
            where: { id },
        });
    }

    async findAll(tx?: Transaction): Promise<Partner[]> {
        const dbClient = tx || this.prisma;

        const partners = await dbClient.oauth_partners.findMany({
            where: { is_active: true },
        });

        return partners.map(partner => this.mapPrismaToDomain(partner));
    }
}
